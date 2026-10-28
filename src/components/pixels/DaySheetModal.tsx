import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  X,
  Check,
  Zap,
  BookOpen,
  Trash2,
  AlertTriangle,
  Lock,
  Calendar,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import {
  CANONICAL_MOODS,
  type CanonicalMood,
  type DailyMoodRecord,
  type LegacyMoodSnapshot,
  type MoodPalette,
} from "@/lib/pixelsEngine";
import { cn } from "@/lib/utils";

interface DaySheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateKey: string;
  todayStr: string;
  palette: MoodPalette;
}

export const DaySheetModal: React.FC<DaySheetModalProps> = ({
  isOpen,
  onClose,
  dateKey,
  todayStr,
  palette,
}) => {
  const { t, lang } = useLang();
  const { state, setDailyMood, clearDailyMood } = useApp();
  const navigate = useNavigate();
  const isAr = lang === "ar";

  const existingRecord = state.dailyMoods?.[dateKey];
  const legacySnapshot = state.legacyMoodSnapshots?.[dateKey];

  const [selectedMood, setSelectedMood] = useState<CanonicalMood | null>(
    existingRecord?.mood || null
  );
  const [selectedEnergy, setSelectedEnergy] = useState<"low" | "medium" | "high">(
    existingRecord?.energy || "medium"
  );
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "offline" | "error"
  >("idle");
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Sync when dateKey or existingRecord changes
  useEffect(() => {
    if (existingRecord) {
      setSelectedMood(existingRecord.mood);
      setSelectedEnergy(existingRecord.energy || "medium");
    } else {
      setSelectedMood(null);
      setSelectedEnergy("medium");
    }
    setSaveStatus("idle");
    setShowConfirmClear(false);
  }, [dateKey, existingRecord]);

  if (!isOpen) return null;

  const isToday = dateKey === todayStr;

  // Format localized date string
  const dateObj = new Date(dateKey + "T12:00:00Z");
  const formattedDate = dateObj.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  // Check if Journal entry exists for this date
  const journalEntries = (state.journalEntries || []).filter(
    (e: any) => e.date === dateKey && !e.archived
  );
  const hasJournalEntry = journalEntries.length > 0;
  const isJournalLocked = state.journalLocked;

  const handleSave = () => {
    if (!selectedMood) return;
    setSaveStatus("saving");

    try {
      setDailyMood(dateKey, selectedMood, selectedEnergy, "pixels");
      setSaveStatus(navigator.onLine ? "saved" : "offline");
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setSaveStatus("error");
    }
  };

  const handleClear = () => {
    clearDailyMood(dateKey);
    setShowConfirmClear(false);
    onClose();
  };

  const handleOpenJournal = () => {
    onClose();
    navigate({ to: "/journal" });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md max-h-[85vh] overflow-y-auto overscroll-contain rounded-t-3xl sm:rounded-3xl bg-card border border-border/80 p-5 sm:p-6 pb-[calc(env(safe-area-inset-bottom,16px)+24px)] sm:pb-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌈</span>
            <div>
              <h3 className="text-sm font-black text-ink">{formattedDate}</h3>
              <p className="text-[11px] text-ink-light">
                {isToday
                  ? t("daySheetTodayQuestion") || (isAr ? "كيف تشعرين اليوم؟" : "How do you feel today?")
                  : t("daySheetPastQuestion") || (isAr ? "كيف كان شعوركِ في هذا اليوم؟" : "How did you feel on this day?")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-ink-light hover:text-ink hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Legacy Unresolved Warning Banner */}
        {legacySnapshot && !existingRecord && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 leading-snug">
              {t("legacySickNotice") ||
                (isAr
                  ? `سُجّلت سابقًا: ${legacySnapshot.legacyLabel}. اختاري شعورًا حاليًا لتحديث هذا اليوم.`
                  : `Previously recorded: ${legacySnapshot.legacyLabel}. Choose a current mood to update this day.`)}
            </p>
          </div>
        )}

        {/* Mood Selection Buttons */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-ink uppercase tracking-wider">
            {isAr ? "اختاري الشعور:" : "Select Mood:"}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CANONICAL_MOODS.map((m) => {
              const isSelected = selectedMood === m.id;
              const color = palette.moodColors[m.id] || m.defaultColor;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMood(m.id)}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-2xl border transition-all active:scale-95 text-left",
                    isSelected
                      ? "ring-2 ring-hotpink border-hotpink bg-pink-50/50 dark:bg-pink-950/30 shadow-sm"
                      : "bg-surface border-border/50 hover:bg-ghost"
                  )}
                >
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0 shadow-xs"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-lg leading-none">{m.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-ink truncate block">
                      {isAr ? m.labelAr : m.labelEn}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy Level Selector */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500" />
              <span>{t("energyLevelLabel") || (isAr ? "مستوى الطاقة والنشاط:" : "Energy Level:")}</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: "low", labelEn: "Low 🪫", labelAr: "منخفضة 🪫" },
                { id: "medium", labelEn: "Medium ⚡", labelAr: "متوسطة ⚡" },
                { id: "high", labelEn: "High 🚀", labelAr: "مرتفعة 🚀" },
              ] as const
            ).map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setSelectedEnergy(lvl.id)}
                className={cn(
                  "py-2 rounded-xl text-xs font-semibold border transition-all text-center",
                  selectedEnergy === lvl.id
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-400 font-bold shadow-xs"
                    : "bg-surface border-border/50 text-ink-light hover:text-ink"
                )}
              >
                {isAr ? lvl.labelAr : lvl.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Journal Integration Banner */}
        <div className="p-3 rounded-2xl bg-surface border border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen size={16} className="text-pink-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink truncate">
                {hasJournalEntry
                  ? isAr
                    ? "توجد تدوينة في يومياتكِ لهذا اليوم 📖"
                    : "Journal entry exists for this day 📖"
                  : isAr
                  ? "اكتبي مشاعركِ بتفصيل أكثر"
                  : "Reflect in your private journal"}
              </p>
              {hasJournalEntry && isJournalLocked && (
                <p className="text-[10px] text-ink-light flex items-center gap-1">
                  <Lock size={10} />
                  <span>{isAr ? "التدوينة محمية بكلمة المرور" : "Entry is locked"}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenJournal}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 transition-all flex-shrink-0"
          >
            {hasJournalEntry
              ? t("viewJournalEntryBtn") || (isAr ? "عرض" : "View")
              : t("writeInJournalBtn") || (isAr ? "كتابة" : "Write")}
          </button>
        </div>

        {/* Clear Confirmation Prompt */}
        {showConfirmClear ? (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 space-y-2">
            <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
              {t("confirmClearMood") ||
                (isAr
                  ? "هل أنتِ متأكدة من مسح شعور هذا اليوم؟"
                  : "Are you sure you want to clear the mood for this day?")}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-danger hover:bg-danger/90 active:scale-95"
              >
                {isAr ? "نعم، مسح" : "Yes, Clear"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmClear(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-ink-light hover:text-ink"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        ) : (
          /* Main Action Buttons */
          <div className="flex items-center justify-between gap-2 pt-1">
            {existingRecord && (
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="p-2.5 rounded-2xl text-ink-light hover:text-danger hover:bg-surface border border-border/40 transition-all"
                title={t("clearMoodBtn") || (isAr ? "مسح" : "Clear")}
                aria-label="Clear mood"
              >
                <Trash2 size={16} />
              </button>
            )}

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-ink-light hover:text-ink hover:bg-surface"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>

              <button
                type="button"
                disabled={!selectedMood || saveStatus === "saving"}
                onClick={handleSave}
                className={cn(
                  "px-6 py-2.5 rounded-2xl text-xs font-bold text-white transition-all shadow-rose-sm active:scale-95 disabled:opacity-50",
                  saveStatus === "saved"
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600"
                )}
              >
                {saveStatus === "saving" && (t("savingState") || (isAr ? "جارٍ الحفظ…" : "Saving…"))}
                {saveStatus === "saved" && (t("savedState") || (isAr ? "تم الحفظ ✓" : "Saved ✓"))}
                {saveStatus === "offline" && (t("offlineSavedState") || (isAr ? "حُفظ محليًا" : "Saved offline"))}
                {saveStatus === "error" && (t("saveFailedState") || (isAr ? "تعذر الحفظ" : "Couldn't save"))}
                {saveStatus === "idle" && (t("saveMoodBtn") || (isAr ? "حفظ الشعور" : "Save Mood"))}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
