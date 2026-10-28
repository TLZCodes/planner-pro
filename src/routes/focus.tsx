import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  ArrowLeft,
  ArrowRight,
  Music,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  Check,
  Target,
  BookOpen,
  Briefcase,
  Layers,
  Edit2,
  Trash2,
  Star,
  ChevronRight,
  X,
  Coffee,
  Heart,
  Sliders,
  AlertCircle
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { Screen, GlassCard, SectionHeader, PillTag, ProgressBar } from "@/components/kit";
import { useLang } from "@/lib/i18n";
import {
  useApp,
  todayKey,
  type Task,
  type Goal,
  type FocusSession,
  type FocusPreset,
  type FocusMode,
  type FocusPhaseType,
  type FocusSourceType,
} from "@/lib/store";
import {
  computeFocusRemainingOrElapsed,
  formatSecondsToTime,
  formatFocusDuration,
  aggregateFocusStatistics,
  DEFAULT_FOCUS_PRESETS,
  getWeekStartKey,
} from "@/lib/focusEngine";
import {
  ambientSoundManager,
  AMBIENT_SOUND_CATALOG,
} from "@/lib/ambientSounds";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/focus")({
  head: () => ({
    meta: [
      { title: "Focus Space ⏱️ — AYXA Planner Pro" },
      {
        name: "description",
        content: "Deep focus and Pomodoro space with ambient soundscapes, background recovery, and seamless task linking.",
      },
    ],
  }),
  component: FocusPage,
});

export function FocusPage() {
  const navigate = useNavigate();
  const { t, lang, dir } = useLang();
  const isAr = lang === "ar";
  const today = todayKey();

  const {
    state,
    startFocusSession,
    pauseFocusSession,
    resumeFocusSession,
    extendFocusSession,
    transitionFocusPhase,
    finishFocusSessionEarly,
    completeFocusSession,
    cancelFocusSession,
    addManualFocusSession,
    deleteFocusSession,
    updateFocusPresets,
    toggleTask,
  } = useApp();

  const activeSession = state.activeFocusSession;
  const isSessionActive = Boolean(
    activeSession &&
      (activeSession.status === "running" ||
        activeSession.status === "paused" ||
        activeSession.status === "break_running" ||
        activeSession.status === "break_paused")
  );

  // View state: "dashboard" | "active_timer" | "history"
  const [activeTab, setActiveTab] = useState<"timer" | "history">("timer");
  const [inActiveScreen, setInActiveScreen] = useState<boolean>(false);

  // If there's an active session on mount, open active view if user desires
  useEffect(() => {
    if (isSessionActive && !inActiveScreen) {
      // Keep dashboard accessible, user can click "Resume Session"
    }
  }, [isSessionActive]);

  // Setup Form State
  const [selectedMode, setSelectedMode] = useState<FocusMode>("pomodoro");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("classic_pomodoro");
  const [customFocusMinutes, setCustomFocusMinutes] = useState<number>(25);

  // Focus Context Selection
  const [selectedSourceType, setSelectedSourceType] = useState<FocusSourceType>("free");
  const [selectedSourceId, setSelectedSourceId] = useState<string | undefined>(undefined);
  const [selectedSourceLabel, setSelectedSourceLabel] = useState<string>(isAr ? "جلسة تركيز حرة" : "Free Focus Session");
  const [contextSheetOpen, setContextSheetOpen] = useState(false);
  const [contextSearch, setContextSearch] = useState("");
  const [customContextInput, setCustomContextInput] = useState("");

  // Sound Drawer & Volume State
  const [soundDrawerOpen, setSoundDrawerOpen] = useState(false);
  const [activeSoundId, setActiveSoundId] = useState<string>("none");
  const [soundVolume, setSoundVolume] = useState<number>(0.5);

  // Safe Exit Dialog
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  // Completion Dialog
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [completedRating, setCompletedRating] = useState<number>(5);
  const [completedNote, setCompletedNote] = useState<string>("");

  // Manual Session Logging Modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualDate, setManualDate] = useState(today);
  const [manualDurationMins, setManualDurationMins] = useState<number>(25);
  const [manualNote, setManualNote] = useState("");
  const [manualSourceType, setManualSourceType] = useState<FocusSourceType>("free");
  const [manualSourceLabel, setManualSourceLabel] = useState(isAr ? "جلسة تركيز" : "Focus Session");

  // History Tab Filter
  const [historyFilter, setHistoryFilter] = useState<"all" | "today" | "week" | "month">("week");

  // Local lightweight interval to re-render countdown smoothly from authoritative timestamps
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!isSessionActive) return;
    const interval = setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isSessionActive]);

  // Derive time calculation for active session
  const timerCalc = useMemo(() => {
    if (!activeSession) {
      return { secondsLeft: 0, elapsedSeconds: 0, totalPlannedSeconds: 1500, progressPct: 0, isExpired: false };
    }
    return computeFocusRemainingOrElapsed(activeSession, Date.now());
  }, [activeSession, tick]);

  // Handle countdown expiration
  useEffect(() => {
    if (!activeSession) return;
    if (timerCalc.isExpired && activeSession.status === "running") {
      // Focus phase finished!
      if (activeSession.mode === "pomodoro") {
        const isLongBreakDue = activeSession.currentCycle % activeSession.plannedCycles === 0;
        const nextPhase: FocusPhaseType = isLongBreakDue ? "long_break" : "short_break";
        transitionFocusPhase(nextPhase);
        if (typeof window !== "undefined" && navigator.vibrate) {
          navigator.vibrate([100, 100, 200]);
        }
      } else {
        // Single timer finished -> Open completion dialog
        setCompletionDialogOpen(true);
      }
    } else if (timerCalc.isExpired && activeSession.status === "break_running") {
      // Break phase finished!
      if (activeSession.currentCycle >= activeSession.plannedCycles) {
        // Complete all cycles
        setCompletionDialogOpen(true);
      } else {
        // Transition back to focus
        transitionFocusPhase("focus");
        if (typeof window !== "undefined" && navigator.vibrate) {
          navigator.vibrate([100, 100, 200]);
        }
      }
    }
  }, [timerCalc.isExpired, activeSession, transitionFocusPhase]);

  // Handle ambient sound playback
  const handleToggleSound = useCallback((soundId: string) => {
    if (activeSoundId === soundId) {
      ambientSoundManager.stop();
      setActiveSoundId("none");
    } else {
      ambientSoundManager.play(soundId, soundVolume);
      setActiveSoundId(soundId);
    }
  }, [activeSoundId, soundVolume]);

  const handleVolumeChange = useCallback((vol: number) => {
    setSoundVolume(vol);
    ambientSoundManager.setVolume(vol);
  }, []);

  // Stop ambient sound when unmounting or leaving active timer
  useEffect(() => {
    return () => {
      ambientSoundManager.stop();
    };
  }, []);

  // Presets lookup
  const userPresets: FocusPreset[] = state.focusPresets || DEFAULT_FOCUS_PRESETS;
  const currentPreset = useMemo(() => {
    return userPresets.find((p) => p.id === selectedPresetId) || userPresets[1]; // default Classic
  }, [userPresets, selectedPresetId]);

  // Statistics Aggregation
  const stats = useMemo(() => {
    return aggregateFocusStatistics(state.focusSessions || [], today, getWeekStartKey());
  }, [state.focusSessions, today]);

  // History list filtering
  const filteredHistory = useMemo(() => {
    const list = state.focusSessions || [];
    const now = new Date();
    if (historyFilter === "today") {
      return list.filter((s) => s.localDate === today);
    }
    if (historyFilter === "week") {
      const weekStart = getWeekStartKey();
      return list.filter((s) => s.localDate >= weekStart);
    }
    if (historyFilter === "month") {
      const monthPrefix = now.toISOString().slice(0, 7);
      return list.filter((s) => s.localDate.startsWith(monthPrefix));
    }
    return list;
  }, [state.focusSessions, historyFilter, today]);

  // Start a new Focus Session
  const handleStartSession = useCallback(() => {
    const plannedSec = selectedMode === "pomodoro"
      ? currentPreset.focusMinutes * 60
      : customFocusMinutes * 60;

    startFocusSession({
      mode: selectedMode,
      sourceType: selectedSourceType,
      sourceId: selectedSourceId,
      sourceLabelSnapshot: selectedSourceLabel,
      presetId: selectedPresetId,
      plannedFocusSeconds: plannedSec,
      plannedShortBreakSeconds: currentPreset.shortBreakMinutes * 60,
      plannedLongBreakSeconds: currentPreset.longBreakMinutes * 60,
      plannedCycles: currentPreset.totalCycles,
      ambientSoundId: activeSoundId !== "none" ? activeSoundId : undefined,
    });

    setInActiveScreen(true);
  }, [
    selectedMode,
    currentPreset,
    customFocusMinutes,
    selectedSourceType,
    selectedSourceId,
    selectedSourceLabel,
    selectedPresetId,
    activeSoundId,
    startFocusSession,
  ]);

  // Format active timer values
  const timeDisplay = formatSecondsToTime(timerCalc.secondsLeft);
  const ringRadius = 105;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference - (ringCircumference * timerCalc.progressPct) / 100;

  // ─── IMMERSIVE ACTIVE SESSION SCREEN (DISTRACTION-FREE) ────────────────────
  if (inActiveScreen && activeSession) {
    const isBreak = activeSession.phase === "short_break" || activeSession.phase === "long_break";
    const isPaused = activeSession.status === "paused" || activeSession.status === "break_paused";

    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex flex-col text-white px-5 pt-8 pb-10 select-none overflow-y-auto animate-in fade-in duration-300",
          isBreak
            ? "bg-gradient-to-b from-teal-950 via-emerald-950 to-slate-950"
            : "bg-gradient-to-b from-purple-950 via-indigo-950 to-slate-950"
        )}
      >
        {/* Subtle background glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Controls Bar */}
        <div className="relative z-10 flex items-center justify-between gap-3 mb-4">
          <button
            onClick={() => setExitDialogOpen(true)}
            className="h-9 px-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center gap-1.5 text-xs font-bold transition-all border border-white/15 backdrop-blur-md cursor-pointer"
            aria-label={t("exit")}
          >
            {dir === "rtl" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{t("exit")}</span>
          </button>

          {/* Phase Badge */}
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/15 border border-white/20 font-mono">
              {isBreak
                ? (isAr ? "🌿 استراحة هادئة" : "🌿 Calm Break")
                : (isAr ? `جلسة التركيز ${activeSession.currentCycle} من ${activeSession.plannedCycles}` : `Focus ${activeSession.currentCycle} of ${activeSession.plannedCycles}`)}
            </span>
          </div>

          {/* Ambient Sound Button */}
          <button
            onClick={() => setSoundDrawerOpen(!soundDrawerOpen)}
            className={cn(
              "h-9 px-3 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all border cursor-pointer active:scale-95 backdrop-blur-md",
              activeSoundId !== "none"
                ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md"
                : "bg-white/10 text-white border-white/15 hover:bg-white/20"
            )}
            aria-label="Ambient sound drawer"
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{activeSoundId !== "none" ? activeSoundId : t("ambientSounds")}</span>
          </button>
        </div>

        {/* Sound Selector Dropdown */}
        {soundDrawerOpen && (
          <div className="relative z-20 mb-4 p-4 rounded-3xl bg-white/15 border border-white/20 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-amber-200">{isAr ? "🎵 اختاري صوت التركيز المحيط:" : "🎵 Select Ambient Soundscape:"}</p>
              <button onClick={() => setSoundDrawerOpen(false)} className="text-xs text-white/70 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMBIENT_SOUND_CATALOG.map((snd) => (
                <button
                  key={snd.id}
                  onClick={() => handleToggleSound(snd.id)}
                  className={cn(
                    "p-2.5 rounded-2xl text-xs font-bold border transition-all active:scale-95 text-center flex items-center justify-center gap-1.5",
                    activeSoundId === snd.id
                      ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md font-extrabold"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  )}
                >
                  <span>{snd.emoji}</span>
                  <span>{isAr ? snd.nameAr : snd.nameEn}</span>
                </button>
              ))}
            </div>

            {/* Volume Slider */}
            {activeSoundId !== "none" && (
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <Volume2 className="w-4 h-4 text-amber-300 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 accent-amber-400"
                />
                <span className="text-[10px] font-mono font-bold text-white/80 w-8 text-right">
                  {Math.round(soundVolume * 100)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Linked Context Card */}
        <div className="relative z-10 max-w-sm mx-auto w-full mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-rose-300" />
            <p className="text-xs font-bold text-white/90 truncate max-w-[240px]">
              {activeSession.sourceLabelSnapshot}
            </p>
          </div>
        </div>

        {/* Big Circular Progress Ring */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-4">
          <div className="relative flex h-[260px] w-[260px] items-center justify-center">
            <svg width={260} height={260} className="-rotate-90">
              <defs>
                <linearGradient id="focusActiveGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ff758c" />
                  <stop offset="100%" stopColor="#ff7eb3" />
                </linearGradient>
                <linearGradient id="breakActiveGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>

              {/* Background track */}
              <circle
                cx={130}
                cy={130}
                r={ringRadius}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={14}
                fill="none"
              />

              {/* Animated Progress Stroke */}
              <circle
                cx={130}
                cy={130}
                r={ringRadius}
                stroke={isBreak ? "url(#breakActiveGrad)" : "url(#focusActiveGrad)"}
                strokeWidth={14}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={ringCircumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Centered Digits & Status */}
            <div className="absolute text-center">
              <span className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-md">
                {timeDisplay}
              </span>
              <p className="text-xs text-white/80 font-semibold mt-1">
                {isPaused
                  ? (isAr ? "⏸️ متوقف مؤقتًا" : "⏸️ Paused")
                  : isBreak
                  ? (isAr ? "استراحة للتنفس 🌿" : "Breathing space 🌿")
                  : (isAr ? "جلسة تركيز عميق ✨" : "Deep focus flow ✨")}
              </p>
            </div>
          </div>

          {/* Phase Dots Indicators with Text Labels */}
          {activeSession.mode === "pomodoro" && (
            <div className="flex items-center gap-2 mt-6">
              {Array.from({ length: activeSession.plannedCycles }).map((_, idx) => {
                const cycleNum = idx + 1;
                const isCompleted = cycleNum < activeSession.currentCycle;
                const isCurrent = cycleNum === activeSession.currentCycle;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "h-3 rounded-full transition-all flex items-center justify-center font-mono text-[9px] font-bold px-2",
                      isCompleted
                        ? "bg-emerald-400 text-slate-950 w-8"
                        : isCurrent
                        ? "bg-rose-400 text-slate-950 w-10 shadow-md"
                        : "bg-white/20 text-white/60 w-3"
                    )}
                  >
                    {isCurrent ? `${cycleNum}` : isCompleted ? "✓" : ""}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Primary Controls */}
        <div className="relative z-10 flex items-center justify-center gap-5 mt-auto pt-4">
          {/* Add 5 Minutes Button */}
          {!isBreak && activeSession.mode !== "stopwatch" && (
            <button
              onClick={() => extendFocusSession(5)}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
              title={t("addFiveMinutes")}
            >
              <Plus className="w-4 h-4" />
              <span>{t("addFiveMinutes")}</span>
            </button>
          )}

          {/* Big Play / Pause Button */}
          <button
            onClick={() => {
              if (isPaused) {
                resumeFocusSession();
              } else {
                pauseFocusSession();
              }
              if (typeof window !== "undefined" && navigator.vibrate) {
                navigator.vibrate(20);
              }
            }}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-90 cursor-pointer border-4 border-white/30",
              isBreak
                ? "bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-500/40"
                : "bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 shadow-rose-500/40"
            )}
            aria-label={isPaused ? t("resume") : t("pause")}
          >
            {isPaused ? <Play className="w-8 h-8 ml-1" /> : <Pause className="w-8 h-8" />}
          </button>

          {/* Finish Early Button */}
          <button
            onClick={() => {
              setCompletionDialogOpen(true);
            }}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{t("finishEarly")}</span>
          </button>
        </div>

        {/* Safe Exit Dialog Modal */}
        {exitDialogOpen && (
          <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card text-ink w-full max-w-sm rounded-3xl border border-border p-6 shadow-2xl space-y-4">
              <div className="text-center space-y-1">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
                <h3 className="text-base font-bold text-ink">{t("sessionRunningTitle")}</h3>
                <p className="text-xs text-ink-light">
                  {isAr ? "كيف ترغبين في التعامل مع جلسة التركيز الحالية؟" : "What would you like to do with your active session?"}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                {/* 1. Keep running in background */}
                <button
                  onClick={() => {
                    setExitDialogOpen(false);
                    setInActiveScreen(false);
                  }}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>{t("keepRunningBackground")}</span>
                </button>

                {/* 2. Pause session */}
                <button
                  onClick={() => {
                    pauseFocusSession();
                    setExitDialogOpen(false);
                    setInActiveScreen(false);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-muted hover:bg-muted/80 text-ink text-xs font-bold border border-border/60 transition-all active:scale-95"
                >
                  <span>{t("pauseSessionOption")}</span>
                </button>

                {/* 3. End session */}
                <button
                  onClick={() => {
                    setExitDialogOpen(false);
                    setCompletionDialogOpen(true);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900 transition-all active:scale-95"
                >
                  <span>{t("endSessionOption")}</span>
                </button>

                {/* 4. Stay focused */}
                <button
                  onClick={() => setExitDialogOpen(false)}
                  className="w-full py-2 text-xs font-semibold text-ink-light hover:text-ink"
                >
                  <span>{t("stayFocusedOption")}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Completion & Reflection Dialog Modal */}
        {completionDialogOpen && (
          <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card text-ink w-full max-w-sm rounded-3xl border border-border p-6 shadow-2xl space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-ink">{t("sessionCompleteTitle")}</h3>
                <p className="text-xs text-ink-light">
                  {formatFocusDuration(Math.round(timerCalc.elapsedSeconds / 60), isAr)} {isAr ? "من التركيز المبارك ✨" : "of deep focus recorded ✨"}
                </p>
              </div>

              {/* Focus Rating Stars */}
              <div className="space-y-1.5 text-center pt-2">
                <p className="text-[11px] font-bold text-ink-light">{t("focusRating")}</p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setCompletedRating(star)}
                      className="p-1 text-amber-400 active:scale-125 transition-transform"
                    >
                      <Star className={cn("w-6 h-6", star <= completedRating ? "fill-amber-400" : "text-border")} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Private Reflection Note */}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder={t("privateNoteOptional")}
                  value={completedNote}
                  onChange={(e) => setCompletedNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-ink focus:outline-none focus:border-rose-400"
                />
              </div>

              {/* Linked Task Completion Checkbox */}
              {activeSession.sourceType === "task" && activeSession.sourceId && (
                <div className="rounded-xl bg-muted/40 p-3 flex items-center justify-between border border-border/60">
                  <span className="text-xs font-semibold text-ink line-clamp-1">{activeSession.sourceLabelSnapshot}</span>
                  <button
                    onClick={() => {
                      if (activeSession.sourceId) toggleTask(activeSession.sourceId);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shrink-0 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>{isAr ? "إتمام المهمة" : "Done"}</span>
                  </button>
                </div>
              )}

              {/* Save & Finish Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    finishFocusSessionEarly(completedRating, completedNote);
                    setCompletionDialogOpen(false);
                    setInActiveScreen(false);
                  }}
                  className="w-full py-3 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose transition-all active:scale-95"
                >
                  {t("saveSession")}
                </button>

                <button
                  onClick={() => {
                    cancelFocusSession();
                    setCompletionDialogOpen(false);
                    setInActiveScreen(false);
                  }}
                  className="w-full py-2 text-xs font-semibold text-ink-light hover:text-rose-500"
                >
                  {isAr ? "إلغاء دون حفظ" : "Discard Session"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── MAIN FOCUS DASHBOARD ──────────────────────────────────────────────────
  return (
    <MobileShell>
      <Screen>
        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white p-5 shadow-rose border border-purple-500/20 mb-4">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3 mb-3">
            <button
              onClick={() => navigate({ to: "/more" })}
              className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all backdrop-blur-md cursor-pointer"
              aria-label={isAr ? "الرجوع" : "Back"}
            >
              {dir === "rtl" ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </button>

            <div className="flex-1 text-center">
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5 font-display">
                <span>{t("focusSpaceTitle")}</span>
              </h1>
              <p className="text-[11px] text-purple-200/90 line-clamp-1">
                {t("focusSpaceSubtitle")}
              </p>
            </div>

            <button
              onClick={() => setManualModalOpen(true)}
              className="h-9 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center gap-1 text-white transition-all backdrop-blur-md text-[11px] font-bold cursor-pointer"
              title={t("logPastSession")}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? "تسجيل" : "Log"}</span>
            </button>
          </div>

          {/* Quick Stats Strip */}
          <div className="relative z-10 grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <span className="block text-[10px] text-purple-200/80 font-medium">{t("focusedToday")}</span>
              <span className="font-extrabold text-sm text-white font-mono">{formatFocusDuration(stats.todayFocusMinutes, isAr)}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <span className="block text-[10px] text-purple-200/80 font-medium">{t("focusedThisWeek")}</span>
              <span className="font-extrabold text-sm text-white font-mono">{formatFocusDuration(stats.weekFocusMinutes, isAr)}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/5">
              <span className="block text-[10px] text-purple-200/80 font-medium">{t("completedSessions")}</span>
              <span className="font-extrabold text-sm text-white font-mono">{stats.totalCompletedSessions}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation: Timer Setup vs History */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setActiveTab("timer")}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-bold transition-all border",
              activeTab === "timer"
                ? "bg-card text-ink border-border shadow-xs"
                : "bg-muted/40 text-ink-light border-transparent hover:bg-muted"
            )}
          >
            {t("timerTab")}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-bold transition-all border",
              activeTab === "history"
                ? "bg-card text-ink border-border shadow-xs"
                : "bg-muted/40 text-ink-light border-transparent hover:bg-muted"
            )}
          >
            {t("historyTab")}
          </button>
        </div>

        {/* ── ACTIVE SESSION RESUME BANNER ─────────────────────────────────── */}
        {isSessionActive && (
          <div className="rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white p-4 shadow-rose mb-4 flex items-center justify-between gap-3 animate-pulse">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                {activeSession?.status === "paused" ? (isAr ? "متوقف مؤقتًا" : "Paused") : (isAr ? "جلسة جارية" : "In Progress")}
              </span>
              <p className="text-sm font-bold truncate">{activeSession?.sourceLabelSnapshot}</p>
              <p className="text-xs text-purple-100 font-mono">{formatSecondsToTime(timerCalc.secondsLeft)} remaining</p>
            </div>

            <button
              onClick={() => setInActiveScreen(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-purple-900 font-extrabold text-xs hover:bg-purple-50 transition-all shrink-0 active:scale-95 shadow-md"
            >
              {t("resumeSession")}
            </button>
          </div>
        )}

        {/* ── TAB 1: TIMER SETUP ────────────────────────────────────────────── */}
        {activeTab === "timer" && (
          <div className="space-y-4 pb-32">
            {/* 1. What are you focusing on? (Context Linker Card) */}
            <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-rose-500" />
                  <span>{t("whatAreYouFocusingOn")}</span>
                </label>
                <button
                  onClick={() => setContextSheetOpen(true)}
                  className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-0.5"
                >
                  <span>{isAr ? "تغيير" : "Change"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div
                onClick={() => setContextSheetOpen(true)}
                className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/60 cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center text-base shrink-0">
                    {selectedSourceType === "task"
                      ? "✅"
                      : selectedSourceType === "subject"
                      ? "📚"
                      : selectedSourceType === "goal"
                      ? "🎯"
                      : selectedSourceType === "business"
                      ? "💼"
                      : "✨"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ink truncate">{selectedSourceLabel}</p>
                    <p className="text-[10px] text-ink-light uppercase tracking-wider font-semibold">
                      {selectedSourceType}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-light shrink-0" />
              </div>
            </div>

            {/* 2. Focus Modes Selector */}
            <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm space-y-3">
              <label className="text-xs font-bold text-ink">{isAr ? "نمط ومؤقت التركيز" : "Focus Mode"}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "pomodoro", label: t("modePomodoro"), icon: "🍅" },
                  { id: "timer", label: t("modeTimer"), icon: "⏱️" },
                  { id: "stopwatch", label: t("modeStopwatch"), icon: "⏳" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMode(m.id as FocusMode)}
                    className={cn(
                      "p-3 rounded-2xl border text-center transition-all active:scale-95 flex flex-col items-center justify-center gap-1",
                      selectedMode === m.id
                        ? "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 font-extrabold shadow-xs"
                        : "bg-muted/30 border-border/60 text-ink-light hover:bg-muted"
                    )}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-xs font-bold">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Mode Specific Settings / Presets */}
              {selectedMode === "pomodoro" && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <label className="text-[11px] font-bold text-ink-light">{isAr ? "إعدادات وباقات البومودورو:" : "Pomodoro Presets:"}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {userPresets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPresetId(p.id)}
                        className={cn(
                          "p-2.5 rounded-xl border text-left transition-all active:scale-95",
                          selectedPresetId === p.id
                            ? "bg-purple-500/10 border-purple-500 text-purple-900 dark:text-purple-100 font-bold"
                            : "bg-muted/20 border-border/60 text-ink-light"
                        )}
                      >
                        <p className="text-xs font-bold line-clamp-1">{isAr ? p.nameAr : p.nameEn}</p>
                        <p className="text-[10px] text-ink-light mt-0.5 font-mono">
                          {p.focusMinutes}m / {p.shortBreakMinutes}m · {p.totalCycles}x
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedMode === "timer" && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <label className="text-[11px] font-bold text-ink-light">{isAr ? "المدة المحددة:" : "Target Duration:"}</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[15, 25, 45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setCustomFocusMinutes(mins)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold font-mono border transition-all active:scale-95",
                          customFocusMinutes === mins
                            ? "bg-rose-500 text-white border-rose-500"
                            : "bg-muted/40 text-ink border-border/60 hover:bg-muted"
                        )}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Ambient Sound Selector Bar */}
            <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-amber-500" />
                  <span>{t("ambientSounds")}</span>
                </span>
                {activeSoundId !== "none" && (
                  <button
                    onClick={() => handleToggleSound(activeSoundId)}
                    className="text-[11px] font-bold text-rose-500 hover:underline"
                  >
                    {isAr ? "إيقاف الصوت" : "Stop"}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {AMBIENT_SOUND_CATALOG.map((snd) => (
                  <button
                    key={snd.id}
                    onClick={() => handleToggleSound(snd.id)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-xs font-bold shrink-0 border transition-all active:scale-95 flex items-center gap-1.5",
                      activeSoundId === snd.id
                        ? "bg-amber-400 text-slate-950 border-amber-300 shadow-sm"
                        : "bg-muted/30 text-ink-light border-border/60 hover:bg-muted"
                    )}
                  >
                    <span>{snd.emoji}</span>
                    <span>{isAr ? snd.nameAr : snd.nameEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Big Start Focus Action Button */}
            <button
              onClick={handleStartSession}
              className="w-full py-4 rounded-2xl grad-theme text-white text-sm font-extrabold shadow-rose hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white ml-0.5" />
              <span>{t("startFocus")}</span>
            </button>
          </div>
        )}

        {/* ── TAB 2: FOCUS HISTORY & ANALYTICS ──────────────────────────────── */}
        {activeTab === "history" && (
          <div className="space-y-4 pb-32">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: "week", label: t("filterWeek") },
                { id: "today", label: t("filterToday") },
                { id: "month", label: t("filterMonth") },
                { id: "all", label: t("filterAll") },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setHistoryFilter(f.id as any)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border",
                    historyFilter === f.id
                      ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                      : "bg-card text-ink-light border-border/60 hover:bg-muted"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* History Sessions List */}
            {filteredHistory.length > 0 ? (
              <div className="space-y-2.5">
                {filteredHistory.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">
                          {session.sourceType === "task"
                            ? "✅"
                            : session.sourceType === "subject"
                            ? "📚"
                            : session.sourceType === "goal"
                            ? "🎯"
                            : session.sourceType === "business"
                            ? "💼"
                            : "✨"}
                        </span>
                        <p className="text-xs font-bold text-ink truncate">{session.sourceLabelSnapshot}</p>
                      </div>

                      {session.privateNote && (
                        <p className="text-[11px] text-ink-light italic line-clamp-1">"{session.privateNote}"</p>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-ink-light font-mono pt-0.5">
                        <span>{session.localDate}</span>
                        {session.isManual && (
                          <span className="bg-amber-50 dark:bg-amber-950 text-amber-600 px-1.5 py-0.2 rounded border border-amber-200">
                            {isAr ? "يدوي" : "Manual"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-extrabold text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-900">
                        {formatFocusDuration(Math.round((session.actualFocusSeconds || session.plannedFocusSeconds || 0) / 60), isAr)}
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm(isAr ? "حذف هذه الجلسة من السجل؟" : "Delete this session from history?")) {
                            deleteFocusSession(session.id);
                          }
                        }}
                        className="text-ink-light hover:text-rose-500 p-1"
                        aria-label="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-card border border-border/60 p-8 text-center space-y-2">
                <Sparkles className="w-10 h-10 text-rose-400 mx-auto" />
                <p className="text-sm font-bold text-ink">{t("historyEmpty")}</p>
                <p className="text-xs text-ink-light">{t("historyEmptySub")}</p>
              </div>
            )}
          </div>
        )}

        {/* ── CONTEXT SELECTOR SHEET MODAL ──────────────────────────────────── */}
        {contextSheetOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <h3 className="text-base font-bold text-ink">{t("whatAreYouFocusingOn")}</h3>
                <button
                  onClick={() => setContextSheetOpen(false)}
                  className="text-ink-light hover:text-ink text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Free Custom Context Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-light">{t("customFocusTitle")}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={isAr ? "مثال: كتابة مقال أو برمجة" : "e.g., Creative writing"}
                    value={customContextInput}
                    onChange={(e) => setCustomContextInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-xs text-ink"
                  />
                  <button
                    onClick={() => {
                      if (customContextInput.trim()) {
                        setSelectedSourceType("free");
                        setSelectedSourceId(undefined);
                        setSelectedSourceLabel(customContextInput.trim());
                        setContextSheetOpen(false);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs"
                  >
                    {isAr ? "اختيار" : "Select"}
                  </button>
                </div>
              </div>

              {/* Active Tasks List */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <span>✅</span>
                  <span>{isAr ? "من مهام اليوم:" : "From Today's Tasks:"}</span>
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {state.tasks.filter((t) => !t.done).slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedSourceType("task");
                        setSelectedSourceId(t.id);
                        setSelectedSourceLabel(t.title);
                        setContextSheetOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-muted/40 hover:bg-rose-500/10 border border-border/60 cursor-pointer text-xs font-semibold text-ink line-clamp-1"
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Subjects List */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <span>📚</span>
                  <span>{isAr ? "من المواد الدراسية:" : "From Learning Subjects:"}</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(state.study || []).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedSourceType("subject");
                        setSelectedSourceId(s.id);
                        setSelectedSourceLabel(s.subject);
                        setContextSheetOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-muted/50 hover:bg-purple-500/10 border border-border/60 text-xs font-bold text-ink"
                    >
                      {s.emoji} {s.subject}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Goals List */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>{isAr ? "من الأهداف والطموحات:" : "From Active Goals:"}</span>
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {state.goals.filter((g) => g.status === "active").slice(0, 4).map((g) => (
                    <div
                      key={g.id}
                      onClick={() => {
                        setSelectedSourceType("goal");
                        setSelectedSourceId(g.id);
                        setSelectedSourceLabel(g.title);
                        setContextSheetOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-muted/40 hover:bg-rose-500/10 border border-border/60 cursor-pointer text-xs font-semibold text-ink line-clamp-1"
                    >
                      {g.icon} {g.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MANUAL LOGGING MODAL ─────────────────────────────────────────── */}
        {manualModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-sm rounded-3xl border border-border p-5 space-y-3">
              <h3 className="text-base font-bold text-ink">{t("logPastSession")}</h3>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-light">{isAr ? "التاريخ" : "Date"}</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-border bg-background text-ink text-xs font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-light">{isAr ? "المدة بالدقائق" : "Duration (Minutes)"}</label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={manualDurationMins}
                  onChange={(e) => setManualDurationMins(parseInt(e.target.value) || 25)}
                  className="w-full p-2 rounded-xl border border-border bg-background text-ink text-sm font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-light">{isAr ? "الموضوع أو المهمة" : "Focus Title"}</label>
                <input
                  type="text"
                  placeholder={isAr ? "مثال: مراجعة الرياضيات" : "e.g. Mathematics study"}
                  value={manualSourceLabel}
                  onChange={(e) => setManualSourceLabel(e.target.value)}
                  className="w-full p-2 rounded-xl border border-border bg-background text-ink text-xs"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setManualModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-muted text-ink font-bold text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={() => {
                    addManualFocusSession({
                      status: "completed",
                      mode: "timer",
                      phase: "focus",
                      sourceType: manualSourceType,
                      sourceLabelSnapshot: manualSourceLabel.trim() || (isAr ? "جلسة تركيز" : "Focus Session"),
                      plannedFocusSeconds: manualDurationMins * 60,
                      plannedShortBreakSeconds: 300,
                      plannedLongBreakSeconds: 900,
                      plannedCycles: 1,
                      currentCycle: 1,
                      startedAt: new Date().toISOString(),
                      totalPausedSeconds: 0,
                      actualFocusSeconds: manualDurationMins * 60,
                      actualBreakSeconds: 0,
                      localDate: manualDate,
                      privateNote: manualNote,
                    });
                    setManualModalOpen(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs"
                >
                  {isAr ? "حفظ" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Screen>
    </MobileShell>
  );
}
