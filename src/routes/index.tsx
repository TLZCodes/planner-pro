import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Sparkles,
  ChevronRight,
  Eye,
  RotateCcw,
  Globe,
  Sun,
  Moon,
  Clock,
  BookOpen,
  BookHeart,
  HeartHandshake,
  Check,
  CheckSquare,
  CheckCircle2,
  Calendar,
  Layers,
  Flame,
  Award,
  Target,
  Wallet,
  Heart,
  Compass,
  Brain,
} from "lucide-react";
import { useApp, todayKey, DEFAULT_ROUTINES } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { quotes, dhikrList } from "@/lib/content";
import { MobileShell } from "@/components/MobileShell";
import { Screen, GlassCard, ProgressBar } from "@/components/kit";
import { DhikrReaderModal } from "@/components/DhikrReaderModal";
import { QuickCaptureSheet } from "@/components/inbox/QuickCaptureSheet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function StatCard({
  label,
  value,
  caption,
  accent,
}: {
  label: string;
  value: string | number;
  caption: string;
  accent: "mint" | "gold" | "violet";
}) {
  const accentClasses = {
    mint: "border-l-4 border-l-[#10B981] bg-white dark:bg-card text-ink",
    gold: "border-l-4 border-l-[#F59E0B] bg-white dark:bg-card text-ink",
    violet: "border-l-4 border-l-[#8B5CF6] bg-white dark:bg-card text-ink",
  };

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-2xl p-3 shadow-xs border border-border/60 transition-all",
        accentClasses[accent]
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-light line-clamp-1 leading-tight">
        {label}
      </span>
      <div className="my-1 text-[20px] font-extrabold tracking-tight text-ink">
        {value}
      </div>
      <span className="text-[10px] font-medium text-ink-light/80 line-clamp-1">
        {caption}
      </span>
    </div>
  );
}

function Dashboard() {
  const { state, addXP, toggleTask, toggleHabit } = useApp();
  const { t, lang, toggle } = useLang();
  const navigate = useNavigate();

  // Entry guard: redirect unauthenticated to /welcome, uncompleted setup to /onboarding
  useEffect(() => {
    if (!state.session) {
      navigate({ to: "/welcome", replace: true });
    } else if (!state.setupDone && !state.user?.setupDone) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [state.session, state.setupDone, state.user?.setupDone, navigate]);

  const [quoteOffset, setQuoteOffset] = useState(0);
  const [dhikrOffset, setDhikrOffset] = useState(0);
  const [showDhikr, setShowDhikr] = useState(true);
  const [dhikrModalOpen, setDhikrModalOpen] = useState(false);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);

  const unsortedThoughtsCount = useMemo(() => {
    return (state.brainDumpItems || []).filter((i) => i.status === "unsorted").length;
  }, [state.brainDumpItems]);

  const todayStr = todayKey();

  // Dynamic Time Greeting
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (lang === "ar") {
      if (hour >= 5 && hour < 12) return "صباح الخير";
      if (hour >= 12 && hour < 17) return "مساء الخير والنشاط";
      if (hour >= 17 && hour < 22) return "مساء الجمال والسكينة";
      return "ليلة مباركة";
    }
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 22) return "Good evening";
    return "Peaceful night";
  }, [lang]);

  // Formatted Date
  const formattedDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, [lang]);

  // Quote & Dhikr calculation
  const quote = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const index = (dayOfYear + quoteOffset) % quotes.length;
    return quotes[Math.abs(index)];
  }, [quoteOffset]);

  const dhikr = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const index = (dayOfYear + dhikrOffset) % dhikrList.length;
    return dhikrList[Math.abs(index)];
  }, [dhikrOffset]);

  // Today's Tasks
  const todayTasks = useMemo(() => {
    return state.tasks.filter((t) => (t.dueDate || todayStr) === todayStr || t.due?.includes("Today"));
  }, [state.tasks, todayStr]);

  const todayDone = todayTasks.filter((t) => t.done).length;
  const todayTotal = todayTasks.length;

  const upcomingIncompleteTasks = useMemo(() => {
    return todayTasks
      .filter((t) => !t.done)
      .sort((a, b) => {
        if (a.optionalTime && b.optionalTime) return a.optionalTime.localeCompare(b.optionalTime);
        if (a.optionalTime && !b.optionalTime) return -1;
        if (!a.optionalTime && b.optionalTime) return 1;
        return (b.isTopThree ? 1 : 0) - (a.isTopThree ? 1 : 0);
      })
      .slice(0, 3);
  }, [todayTasks]);

  // Level & XP
  const level = Math.floor(state.xp / 250) + 1;
  const levelPct = ((state.xp % 250) / 250) * 100;

  return (
    <MobileShell>
      <Screen className="dashboard-page pb-24">
        {/* Fixed Top Banner Header */}
        <header className="grad-theme relative overflow-hidden px-5 pt-6 pb-12 shadow-rose-md">
          <span className="animate-float-soft pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
          <span className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-hotpink/30 blur-xl" />

          {/* Top Bar: Profile, Date & Actions */}
          <div className="flex items-center justify-between text-white relative z-10">
            <Link to="/settings" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 border border-white/40 text-xl shadow-inner transition-transform group-active:scale-95">
                {state.user?.emoji || "🌸"}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wide">
                  {formattedDate}
                </span>
                <span className="text-xs font-bold text-white group-hover:underline">
                  {state.user?.name || (lang === "ar" ? "الحالمة ✨" : "Guest")}
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={toggle}
                className="flex items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-3 py-1 text-[12px] font-bold text-white backdrop-blur transition-all active:scale-95 cursor-pointer font-sans"
              >
                <Globe size={13} /> {lang === "en" ? "العربية" : "English"}
              </button>
              <Link
                to="/settings"
                className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20 border border-white/30 text-white backdrop-blur active:scale-95"
              >
                <Bell size={16} />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold text-[9px] font-extrabold text-ink">
                  3
                </span>
              </Link>
            </div>
          </div>

          {/* Greeting & Subtitle */}
          <div className="mt-4 relative z-10">
            <h1 className="animate-rise font-script text-[34px] font-bold text-white leading-tight">
              {timeGreeting}, {state.user?.name ?? (lang === "ar" ? "عزيزتي" : "Guest")} 🌸
            </h1>
            <p className="font-script text-[22px] text-white/95 mt-0.5">
              {lang === "ar" ? "يومٌ إضافي في رحلة الوصول لأفضل نسخة منكِ ♡" : "One more day of becoming her ♡"}
            </p>
          </div>

          {/* Level & XP Progress Card */}
          <div className="animate-rise mt-3.5 rounded-2xl bg-white/20 border border-white/30 p-3.5 backdrop-blur-md relative z-10">
            <div className="flex items-center justify-between text-white">
              <span className="label-xs flex items-center gap-1 font-bold">
                {lang === "ar" ? `المستوى ${level} ✨` : `BECOMING LEVEL ${level} ✨`}
              </span>
              <span className="font-mono text-[12px] font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full">
                {state.xp} XP
              </span>
            </div>
            <ProgressBar value={levelPct} className="mt-2.5 bg-black/20 h-2.5" barClass="grad-gold" />
            <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-white/90">
              <span>{Math.max(0, 250 - (state.xp % 250))} XP {lang === "ar" ? `للمستوى ${level + 1}` : `to Level ${level + 1}`}</span>
              <span>{Math.round(levelPct)}%</span>
            </div>
          </div>
        </header>

        {/* Purple/Indigo Dhikr Card (Partially overlapping pink header) */}
        {showDhikr && (
          <div className="relative -mt-8 px-4 z-20">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#856DF9] via-[#755DFA] to-[#6044EA] p-4.5 text-white shadow-xl border border-white/25">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white/90 font-sans">
                    {lang === "ar" ? "لحظة ذكر 🌙" : "A moment of Dhikr 🌙"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDhikrModalOpen(true)}
                    className="flex items-center gap-1 rounded-full bg-white/20 hover:bg-white/30 px-2.5 py-0.5 text-[11px] font-semibold text-white transition-colors cursor-pointer font-sans"
                  >
                    <Eye size={12} />
                    <span>{lang === "ar" ? "قراءة كاملة 📖" : "Read full 📖"}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div
                  onClick={() => setDhikrModalOpen(true)}
                  className="flex-1 cursor-pointer min-w-0"
                >
                  <p className="font-arabic text-[18px] sm:text-[20px] font-bold leading-relaxed text-white drop-shadow-xs text-start">
                    {dhikr.ar}
                  </p>
                  {dhikr.en && (
                    <p className="mt-1 font-sans text-[12px] font-medium text-white/85 leading-snug text-start">
                      {dhikr.en}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDhikrOffset((prev) => prev + 1);
                      
                    }}
                    className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-90 text-white transition-all cursor-pointer"
                    title={lang === "ar" ? "ذكر آخر" : "Next dhikr"}
                  >
                    <RotateCcw size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDhikr(false);
                      addXP(10);
                    }}
                    className="rounded-full bg-white px-3.5 py-1.5 text-[12px] font-extrabold text-hotpink shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>✓</span>
                    <span>{lang === "ar" ? "تم" : "Done"}</span>
                    <span>✓</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3-Card Small Statistics Layout (Exact match) */}
        <div className="mt-4 grid grid-cols-3 gap-2.5 px-4">
          <StatCard label={lang === "ar" ? "المهام" : "TASKS"} value={`${todayDone}/${todayTotal}`} caption={lang === "ar" ? "اليوم" : "Today"} accent="mint" />
          <StatCard
            label={lang === "ar" ? "سلسلة الإنجاز" : "STREAK"}
            value={`🔥 ${Math.max(0, ...state.habits.map((h) => h.streak))}`}
            caption={lang === "ar" ? "أفضل إنجاز!" : "Personal best!"}
            accent="gold"
          />
          <StatCard
            label={lang === "ar" ? "الدراسة" : "STUDY"}
            value={`${state.study.reduce((a, b) => a + b.minutes, 0)}${lang === "ar" ? " د" : "m"}`}
            caption={lang === "ar" ? "إجمالي المواد" : "All subjects"}
            accent="violet"
          />
        </div>

        {/* Quote of the Day with Refresh */}
        <div className="mt-4 px-4">
          <GlassCard gradient="grad-gold">
            <div className="flex items-center justify-between">
              <p className="label-xs text-white/90">{lang === "ar" ? "اقتباس اليوم 💬" : "QUOTE OF THE DAY 💬"}</p>
              <button
                type="button"
                onClick={() => {
                  setQuoteOffset((prev) => prev + 1);
                  
                }}
                className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white hover:bg-white/35 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} /> {lang === "ar" ? "حكمة أخرى" : "Next Quote"}
              </button>
            </div>
            <p className="mt-2 font-script text-[23px] leading-snug">“{lang === "ar" ? quote.ar : quote.en}”</p>
            <p className="mt-1 text-[12px] text-white/90 font-medium">— {lang === "ar" ? quote.author.ar : quote.author.en}</p>
          </GlassCard>
        </div>

        {/* AYXA AI Agent Companion Banner Card */}
        <div className="mt-4 px-4">
          <Link
            to="/ai"
            className="group relative block overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-amber-500/15 p-4 border border-pink-300/50 dark:border-pink-800/40 shadow-xs hover:border-pink-400 hover:shadow-rose transition-all active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-rose text-lg shrink-0">
                  {state.aiPersona === "masculine" ? "🌿" : "🌸"}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-ink flex items-center gap-1.5 truncate">
                    <span>
                      {lang === "ar"
                        ? state.aiPersona === "masculine"
                          ? "مساعدك الذكي (أنيس) — رفيق التخطيط والبركة ✨"
                          : "مساعدتكِ الذكية (أيكسا) — رفيقة التخطيط والبركة ✨"
                        : "AYXA AI Assistant — Mindful Planner ✨"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-ink-light mt-0.5 leading-relaxed truncate">
                    {lang === "ar"
                      ? "نظّمي يومكِ، قسّمي أهدافكِ، أو احصلي على روتين متوازن في ثوانٍ ♡"
                      : "Plan your day, break down goals, or build gentle routines ♡"}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-hotpink group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                <span className="bg-white/80 dark:bg-card/80 px-2 py-0.5 rounded-full border border-pink-200/60 dark:border-pink-800/40 text-[10px] text-amber-700 dark:text-amber-300">
                  {state.aiCredits ?? 50} {lang === "ar" ? "نقطة" : "pts"}
                </span>
                <span className="rtl:rotate-180">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Section: Today's Plan ✨ */}
        <div className="mt-5 px-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-bold text-ink flex items-center gap-1.5">
                {lang === "ar" ? "خطة اليوم ✨" : "Today's Plan ✨"}
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-hotpink/10 text-hotpink">
                {lang === "ar" ? `${todayDone} من ${todayTotal} مكتملة` : `${todayDone} of ${todayTotal} completed`}
              </span>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-bold text-hotpink hover:underline flex items-center gap-0.5 group"
            >
              <span>{lang === "ar" ? "عرض الخطة" : "See my day"}</span>
              <span className="flip-x group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>

          {todayTotal > 0 && todayDone === todayTotal ? (
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-3.5 text-center shadow-xs">
              <span className="text-2xl">🎉</span>
              <h4 className="mt-1 text-[13px] font-bold text-emerald-800 dark:text-emerald-300">
                {lang === "ar" ? "أحسنتِ! أنجزتِ جميع مهام اليوم بامتياز 🎉" : "All tasks completed! You're thriving today 🎉"}
              </h4>
              <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {lang === "ar" ? "استمتعي بوقتكِ أو أضيفي خطوتكِ القادمة." : "Enjoy your rest, or plan your next step."}
              </p>
            </div>
          ) : upcomingIncompleteTasks.length > 0 ? (
            <div className="space-y-2">
              {upcomingIncompleteTasks.map((task) => (
                <Link
                  key={task.id}
                  to="/tasks"
                  className="flex items-center justify-between rounded-2xl bg-white dark:bg-card border border-border/70 p-3 shadow-xs hover:border-hotpink/40 active:scale-[0.99] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleTask(task.id);
                        
                      }}
                      className={cn(
                        "cursor-pointer flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-lg border-2 transition-all active:scale-90",
                        task.done
                          ? "border-hotpink bg-hotpink text-white"
                          : "border-border hover:border-hotpink bg-surface"
                      )}
                      aria-label="Complete task"
                    >
                      {task.done && <Check size={13} className="stroke-[3]" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-bold text-ink truncate group-hover:text-hotpink transition-colors">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] font-semibold text-ink-light">
                        {task.isTopThree && (
                          <span className="text-amber-500 font-bold flex items-center gap-0.5">
                            ⭐ Top 3
                          </span>
                        )}
                        {task.optionalTime && (
                          <span className="flex items-center gap-0.5">
                            <Clock size={11} className="text-hotpink" />
                            {task.optionalTime}
                          </span>
                        )}
                        <span className="rounded-md bg-surface px-1.5 py-0.2 border border-border/60 text-[10px]">
                          {task.tag}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 p-1 text-ink-light group-hover:text-hotpink transition-colors flip-x">
                    <ChevronRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-white/70 dark:bg-card/70 p-3.5 text-center shadow-xs">
              <p className="text-xs font-bold text-ink-light">
                {lang === "ar" ? "يومكِ خالٍ من المهام ✨" : "Your day is clear ✨"}
              </p>
              <Link
                to="/tasks"
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-extrabold text-hotpink hover:underline"
              >
                <span>{lang === "ar" ? "+ أضيفي مهمة جديدة" : "+ Add a task"}</span>
              </Link>
            </div>
          )}
        </div>

        {/* My Deen 🌙 (Emerald Green Card) */}
        <div className="mt-4 px-4">
          <Link
            to="/islamic"
            className="flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-[#006038] via-[#007040] to-[#004d2a] p-4 text-white shadow-sm hover:shadow-md transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00A859] text-white text-xl shadow-inner group-hover:scale-105 transition-transform">
                🌙
              </div>
              <div>
                <h3 className="font-bold text-[16px] flex items-center gap-1.5">
                  {lang === "ar" ? "ديني وروحي 🌙" : "My Deen 🌙"}
                </h3>
                <p className="text-[12px] text-emerald-100/90 font-medium mt-0.5">
                  {lang === "ar" ? "قرآن • صلاة • أذكار • تسبيح ✨" : "Quran • Prayer • Adhkar • Tasbih ✨"}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-emerald-200 group-hover:translate-x-1 transition-transform flip-x" />
          </Link>
        </div>

        {/* Section: Habits Today ✨ */}
        <div className="mt-5 px-4">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[17px] font-bold text-ink flex items-center gap-1.5">
              <span>{lang === "ar" ? "عادات اليوم ✨" : "Habits Today ✨"}</span>
              <span className="text-[11px] font-bold text-hotpink bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-2 py-0.5 rounded-full">
                {state.habits.filter((h) => (h.status || "active") === "active" && (!h.scheduledDays || h.scheduledDays.includes(new Date().getDay())) && Boolean(h.days?.[6])).length}/
                {state.habits.filter((h) => (h.status || "active") === "active" && (!h.scheduledDays || h.scheduledDays.includes(new Date().getDay()))).length}
              </span>
            </h2>
            <Link to="/habits" className="text-xs font-bold text-hotpink hover:underline flex items-center gap-0.5">
              <span>{lang === "ar" ? "عرض العادات" : "See all"}</span>
              <span className="flip-x">→</span>
            </Link>
          </div>

          {state.habits.filter((h) => (h.status || "active") === "active" && (!h.scheduledDays || h.scheduledDays.includes(new Date().getDay()))).length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {state.habits
                .filter((h) => (h.status || "active") === "active" && (!h.scheduledDays || h.scheduledDays.includes(new Date().getDay())))
                .map((habit) => {
                  const isDone = Boolean(habit.days?.[6]);
                  return (
                    <button
                      key={habit.id}
                      type="button"
                      onClick={() => {
                        toggleHabit(habit.id);
                        
                      }}
                      className={cn(
                        "cursor-pointer shrink-0 rounded-2xl p-3 border transition-all flex items-center gap-2.5 min-w-[140px] max-w-[180px]",
                        isDone
                          ? "bg-pink-50/80 dark:bg-pink-950/40 border-pink-300 dark:border-pink-800 text-hotpink"
                          : "bg-white dark:bg-card border-border/80 text-ink hover:border-hotpink/40"
                      )}
                    >
                      <span className="text-xl shrink-0">{habit.emoji}</span>
                      <div className="min-w-0 text-start">
                        <p className={cn("text-[12.5px] font-bold truncate", isDone && "line-through opacity-75")}>
                          {habit.name}
                        </p>
                        <span className="text-[10px] font-medium text-ink-light block">
                          🔥 {habit.streak || 0} {lang === "ar" ? "يوم" : "d"}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          ) : (
            <Link
              to="/habits"
              className="block rounded-2xl border border-dashed border-border/80 bg-white/50 dark:bg-card/50 p-3 text-center hover:border-hotpink/50 transition-colors"
            >
              <p className="text-xs font-bold text-ink-light">
                {lang === "ar" ? "✨ ابدئي عاداتكِ اليومية لأفضل نسخة منكِ" : "✨ Start your daily habits for Becoming Her"}
              </p>
            </Link>
          )}
        </div>

        {/* Section: My Routines ✨ */}
        <div className="mt-5">
          <div className="flex items-center justify-between px-4 mb-2.5">
            <h2 className="text-[17px] font-bold text-ink flex items-center gap-1.5">
              {lang === "ar" ? "روتيناتي اليومية ✨" : "My Routines ✨"}
            </h2>
            <Link to="/routines" className="text-xs font-bold text-hotpink hover:underline flex items-center gap-0.5">
              <span>{lang === "ar" ? "عرض الكل" : "See all"}</span>
              <span className="flip-x">→</span>
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
            {/* 1. Ideal Day */}
            <Link
              to="/routines"
              search={{ key: "ideal-day" }}
              className="shrink-0 w-[240px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF3B77] via-[#FF5E62] to-[#FF9966] p-4 text-white shadow-md active:scale-98 transition-transform group"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs text-xl">
                  ✨
                </div>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  {lang === "ar" ? "الخطة الشاملة" : "MASTER PLAN"}
                </span>
              </div>
              <h3 className="mt-3 font-bold text-[17px]">
                {lang === "ar" ? "يومي المثالي ✨" : "Ideal Day ✨"}
              </h3>
              <p className="text-[12px] text-pink-100/90 truncate mt-0.5">
                {lang === "ar" ? "خطة يومكِ المنظم والمتكامل" : "Your ready-made day plan"}
              </p>
              <div className="mt-4 pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-pink-100">
                <span>{state.routines?.["ideal-day"]?.length ?? DEFAULT_ROUTINES["ideal-day"]?.steps.length ?? 27} {lang === "ar" ? "خطوة جاهزة" : "Ready Steps"}</span>
                <span className="flex items-center gap-0.5 text-white group-hover:translate-x-0.5 transition-transform">
                  {lang === "ar" ? "ابدئي" : "Start"} &gt;
                </span>
              </div>
            </Link>

            {/* 2. Morning Routine */}
            <Link
              to="/routines"
              search={{ key: "morning" }}
              className="shrink-0 w-[240px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFA000] via-[#FFB300] to-[#FF8F00] p-4 text-white shadow-md active:scale-98 transition-transform group"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs text-xl">
                  ☀️
                </div>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  {lang === "ar" ? "بداية ملهمة" : "FRESH START"}
                </span>
              </div>
              <h3 className="mt-3 font-bold text-[17px]">
                {lang === "ar" ? "الروتين الصباحي ☀️" : "Morning Routine ☀️"}
              </h3>
              <p className="text-[12px] text-amber-100/90 truncate mt-0.5">
                {lang === "ar" ? "ابدئي يومكِ بوعي وبركة" : "Start your day intentionally"}
              </p>
              <div className="mt-4 pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-amber-100">
                <span>{state.routines?.["morning"]?.length ?? DEFAULT_ROUTINES["morning"]?.steps.length ?? 13} {lang === "ar" ? "خطوة صباحية" : "Morning Steps"}</span>
                <span className="flex items-center gap-0.5 text-white group-hover:translate-x-0.5 transition-transform">
                  {lang === "ar" ? "ابدئي" : "Start"} &gt;
                </span>
              </div>
            </Link>

            {/* 3. Evening Routine */}
            <Link
              to="/routines"
              search={{ key: "evening" }}
              className="shrink-0 w-[240px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#3B28CC] via-[#6339F2] to-[#8E44AD] p-4 text-white shadow-md active:scale-98 transition-transform group"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs text-xl">
                  🌙
                </div>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  {lang === "ar" ? "سكينة المساء" : "WIND DOWN"}
                </span>
              </div>
              <h3 className="mt-3 font-bold text-[17px]">
                {lang === "ar" ? "الروتين المسائي 🌙" : "Evening Routine 🌙"}
              </h3>
              <p className="text-[12px] text-purple-100/90 truncate mt-0.5">
                {lang === "ar" ? "أنهي يومكِ بهدوء وسكينة" : "End your day softly"}
              </p>
              <div className="mt-4 pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-purple-100">
                <span>{state.routines?.["evening"]?.length ?? DEFAULT_ROUTINES["evening"]?.steps.length ?? 12} {lang === "ar" ? "خطوة مسائية" : "Evening Steps"}</span>
                <span className="flex items-center gap-0.5 text-white group-hover:translate-x-0.5 transition-transform">
                  {lang === "ar" ? "ابدئي" : "Start"} &gt;
                </span>
              </div>
            </Link>

            {/* 4. Reset & Habits */}
            <Link
              to="/routines"
              search={{ key: "bundle-reset" }}
              className="shrink-0 w-[240px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF2A6D] via-[#FF5E7E] to-[#FFA07A] p-4 text-white shadow-md active:scale-98 transition-transform group"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs text-xl">
                  🌸
                </div>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  {lang === "ar" ? "الأكثر طلباً" : "POPULAR"}
                </span>
              </div>
              <h3 className="mt-3 font-bold text-[17px]">
                {lang === "ar" ? "إعادة ضبط الحياة ✨" : "Life Reset ✨"}
              </h3>
              <p className="text-[12px] text-rose-100/90 truncate mt-0.5">
                {lang === "ar" ? "تنظيم اليوم والتخلص من المماطلة" : "Reset procrastination & boost flow"}
              </p>
              <div className="mt-4 pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-rose-100">
                <span>{state.routines?.["bundle-reset"]?.length ?? DEFAULT_ROUTINES["bundle-reset"]?.steps.length ?? 10} {lang === "ar" ? "خطوات" : "Steps"}</span>
                <span className="flex items-center gap-0.5 text-white group-hover:translate-x-0.5 transition-transform">
                  {lang === "ar" ? "ابدئي" : "Start"} &gt;
                </span>
              </div>
            </Link>

            {/* 5. Spiritual / Deen */}
            <Link
              to="/routines"
              search={{ key: "bundle-spiritual" }}
              className="shrink-0 w-[240px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#006038] via-[#00874e] to-[#00a859] p-4 text-white shadow-md active:scale-98 transition-transform group"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xs text-xl">
                  🕌
                </div>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  {lang === "ar" ? "إيمانيات" : "SPIRITUAL"}
                </span>
              </div>
              <h3 className="mt-3 font-bold text-[17px]">
                {lang === "ar" ? "روتين الروح والدين ✨" : "Deen & Soul ✨"}
              </h3>
              <p className="text-[12px] text-emerald-100/90 truncate mt-0.5">
                {lang === "ar" ? "صلوات، أذكار، وقرآن كريم" : "Prayers, Athkar & Quran"}
              </p>
              <div className="mt-4 pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-emerald-100">
                <span>{state.routines?.["bundle-spiritual"]?.length ?? DEFAULT_ROUTINES["bundle-spiritual"]?.steps.length ?? 9} {lang === "ar" ? "خطوات" : "Steps"}</span>
                <span className="flex items-center gap-0.5 text-white group-hover:translate-x-0.5 transition-transform">
                  {lang === "ar" ? "ابدئي" : "Start"} &gt;
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Pinned Vision Board Card (if user pinned an active vision board) */}
        {(() => {
          const pinnedBoard = (state.visionBoards || []).find(
            (b) => b.isPinnedToHome && (b.status || "active") === "active"
          );
          if (!pinnedBoard) return null;
          const boardItems = (state.visionBoardItems || []).filter(
            (i) => i.boardId === pinnedBoard.id
          );
          const photoItems = boardItems.filter((i) => i.type === "photo" && i.photoUrl);

          return (
            <div className="mt-5 px-4">
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-[17px] font-bold text-ink flex items-center gap-1.5 font-display">
                  <span>🌸 {lang === "ar" ? "لوحة رؤيتي المفضلة" : "My Pinned Vision Board"}</span>
                </h2>
                <Link
                  to="/goals"
                  search={{ tab: "vision", boardId: pinnedBoard.id }}
                  className="text-xs font-bold text-hotpink hover:underline flex items-center gap-0.5"
                >
                  <span>{lang === "ar" ? "فتح اللوحة" : "Open board"}</span>
                  <span className="flip-x">→</span>
                </Link>
              </div>

              <Link
                to="/goals"
                search={{ tab: "vision", boardId: pinnedBoard.id }}
                className="group relative block overflow-hidden rounded-3xl border border-rose-200/80 dark:border-rose-900/50 bg-gradient-to-br from-rose-50/80 via-white to-purple-50/60 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-purple-950/30 p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
              >
                {/* Washi tape decoration */}
                <div className="absolute -top-1.5 left-10 w-16 h-4 bg-amber-100/90 dark:bg-amber-900/40 border border-amber-300/60 dark:border-amber-700/50 rotate-[-3deg] shadow-xs pointer-events-none rounded-xs" />
                <div className="absolute -top-1.5 right-10 w-14 h-4 bg-pink-100/90 dark:bg-pink-900/40 border border-pink-300/60 dark:border-pink-700/50 rotate-[2deg] shadow-xs pointer-events-none rounded-xs" />

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
                        ✨ {pinnedBoard.theme || "blossom"}
                      </span>
                      {pinnedBoard.timeHorizon && (
                        <span className="text-[11px] font-bold text-ink-light">
                          📅 {pinnedBoard.timeHorizon}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-[18px] font-black tracking-tight text-ink group-hover:text-rose-600 transition-colors line-clamp-1 font-display">
                      {pinnedBoard.title}
                    </h3>
                    {pinnedBoard.description && (
                      <p className="mt-0.5 text-[12px] font-medium text-ink-light line-clamp-1">
                        {pinnedBoard.description}
                      </p>
                    )}
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>

                {/* Micro collage thumbnails preview */}
                {photoItems.length > 0 ? (
                  <div className="mt-3.5 flex items-center gap-2 overflow-hidden pt-1">
                    {photoItems.slice(0, 4).map((item, idx) => (
                      <div
                        key={item.id}
                        className={cn(
                          "relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white dark:border-zinc-800 shadow-xs bg-muted",
                          idx === 1 && "rotate-[-2deg]",
                          idx === 2 && "rotate-[3deg]",
                          idx === 3 && "rotate-[-1deg]"
                        )}
                      >
                        <img
                          src={item.photoUrl}
                          alt={item.caption || "Vision"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                    <div className="flex items-center px-2 text-[11px] font-extrabold text-ink-light">
                      +{boardItems.length} {lang === "ar" ? "قصاصات" : "cards"}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-ink-light pt-2 border-t border-rose-100 dark:border-zinc-800">
                    <span>
                      {boardItems.length}{" "}
                      {lang === "ar" ? "قصاصات ملهمة محفوظة" : "inspirational cards inside"}
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform">
                      {lang === "ar" ? "عرض اللوحة" : "View board"} &gt;
                    </span>
                  </div>
                )}
              </Link>
            </div>
          );
        })()}

        {/* Compact Brain Dump Home Entry */}
        <div className="mt-5 px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-50/90 via-pink-50/70 to-purple-50/80 dark:from-pink-950/40 dark:via-rose-950/30 dark:to-purple-950/40 p-3.5 border border-pink-200/80 dark:border-pink-900/50 shadow-xs">
            {/* Top washi tape accent */}
            <div className="absolute top-0 left-8 right-8 h-1 rounded-b-full bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 dark:from-pink-800 dark:to-purple-800 opacity-70" />

            <div className="flex items-center justify-between gap-3">
              <Link to="/inbox" className="flex items-center gap-3 flex-1 min-w-0 group cursor-pointer">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF2E93] to-[#FF1493] text-white shadow-md shadow-pink-500/20 shrink-0 group-hover:scale-105 transition-transform">
                  <Brain size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-[#2b1727] dark:text-pink-100 line-clamp-1 group-hover:text-[#FF1493] transition-colors">
                      {lang === "ar" ? "مساحة أفكاري 🧠" : "Brain Dump 🧠"}
                    </h3>
                    {unsortedThoughtsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-pink-200/80 text-pink-900 dark:bg-pink-900 dark:text-pink-100 font-mono">
                        {unsortedThoughtsCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 font-sans">
                    {lang === "ar"
                      ? "امنحي أفكاركِ مكانًا قبل ترتيبها."
                      : "Give your thoughts a little place to land."}
                  </p>
                </div>
              </Link>

              {/* Quick Capture Button */}
              <button
                type="button"
                onClick={() => setQuickCaptureOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white dark:bg-card border border-pink-200 dark:border-pink-800 text-[#FF1493] dark:text-pink-300 text-xs font-bold shadow-xs hover:bg-pink-50 dark:hover:bg-pink-950/50 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <span>+</span>
                <span>{lang === "ar" ? "تدوين سريع" : "Capture"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick actions (8 Grid items) */}
        <div className="mt-5 px-4">
          <h2 className="text-[17px] font-bold text-ink mb-3">
            {lang === "ar" ? "إجراءات سريعة" : "Quick actions"}
          </h2>
          <div className="grid grid-cols-4 gap-2.5">
            {/* 1. Wird */}
            <Link
              to="/islamic"
              search={{ tab: "quran" }}
              className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-card p-3 shadow-xs border border-border/60 hover:border-emerald/40 active:scale-95 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00B074] text-white shadow-sm shadow-emerald-500/20 mb-1.5 transition-transform group-hover:scale-105">
                <Moon size={22} className="stroke-[2.2]" />
              </div>
              <span className="text-[12px] font-bold text-ink group-hover:text-emerald-600 transition-colors">
                {lang === "ar" ? "الورد" : "Wird"}
              </span>
            </Link>

            {/* 2. Task */}
            <Link
              to="/tasks"
              className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-card p-3 shadow-xs border border-border/60 hover:border-teal-400 active:scale-95 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00C6AE] text-white shadow-sm shadow-teal-500/20 mb-1.5 transition-transform group-hover:scale-105">
                <CheckSquare size={22} className="stroke-[2.2]" />
              </div>
              <span className="text-[12px] font-bold text-ink group-hover:text-teal-600 transition-colors">
                {lang === "ar" ? "مهمة" : "Task"}
              </span>
            </Link>

            {/* 3. Journal */}
            <Link
              to="/journal"
              className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-card p-3 shadow-xs border border-border/60 hover:border-purple-400 active:scale-95 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#855CF8] text-white shadow-sm shadow-purple-500/20 mb-1.5 transition-transform group-hover:scale-105">
                <BookHeart size={22} className="stroke-[2.2]" />
              </div>
              <span className="text-[12px] font-bold text-ink group-hover:text-purple-600 transition-colors">
                {lang === "ar" ? "يوميات" : "Journal"}
              </span>
            </Link>

            {/* 4. Study */}
            <Link
              to="/learning"
              className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-card p-3 shadow-xs border border-border/60 hover:border-blue-400 active:scale-95 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E90FF] text-white shadow-sm shadow-blue-500/20 mb-1.5 transition-transform group-hover:scale-105">
                <BookOpen size={22} className="stroke-[2.2]" />
              </div>
              <span className="text-[12px] font-bold text-ink group-hover:text-blue-600 transition-colors">
                {lang === "ar" ? "دراسة" : "Study"}
              </span>
            </Link>

            {/* 5. Goals */}
            <Link
              to="/goals"
              className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-card p-3 shadow-xs border border-border/60 hover:border-rose-400 active:scale-95 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF3366] text-white shadow-sm shadow-rose-500/20 mb-1.5 transition-transform group-hover:scale-105">
                <Target size={22} className="stroke-[2.2]" />
              </div>
              <span className="text-[12px] font-bold text-ink group-hover:text-rose-600 transition-colors">
                {lang === "ar" ? "أهداف" : "Goals"}
              </span>
            </Link>

            {/* 6. Money */}
            <Link
              to="/finance"
              className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-card p-3 shadow-xs border border-border/60 hover:border-emerald-400 active:scale-95 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00BFA5] text-white shadow-sm shadow-emerald-500/20 mb-1.5 transition-transform group-hover:scale-105">
                <Wallet size={22} className="stroke-[2.2]" />
              </div>
              <span className="text-[12px] font-bold text-ink group-hover:text-emerald-600 transition-colors">
                {lang === "ar" ? "مالية" : "Money"}
              </span>
            </Link>

            {/* 7. Self-care */}
            <Link
              to="/selfcare"
              search={{ tab: undefined }}
              className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-card p-3 shadow-xs border border-border/60 hover:border-pink-400 active:scale-95 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF2E7E] text-white shadow-sm shadow-pink-500/20 mb-1.5 transition-transform group-hover:scale-105">
                <Heart size={22} className="stroke-[2.2]" fill="currentColor" />
              </div>
              <span className="text-[12px] font-bold text-ink group-hover:text-pink-600 transition-colors">
                {lang === "ar" ? "عناية" : "Self-care"}
              </span>
            </Link>

            {/* 8. Travel */}
            <Link
              to="/travel"
              className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-card p-3 shadow-xs border border-border/60 hover:border-sky-400 active:scale-95 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00B4D8] text-white shadow-sm shadow-sky-500/20 mb-1.5 transition-transform group-hover:scale-105">
                <Compass size={22} className="stroke-[2.2]" />
              </div>
              <span className="text-[12px] font-bold text-ink group-hover:text-sky-600 transition-colors">
                {lang === "ar" ? "سفر" : "Travel"}
              </span>
            </Link>
          </div>
        </div>

        {/* Ask your AI planner button */}
        <div className="mt-6 mb-4 px-4">
          <Link
            to="/ai"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF2E93] via-[#FF1493] to-[#FF45A0] py-3.5 px-6 text-[15px] font-extrabold text-white shadow-rose-md hover:brightness-105 active:scale-98 transition-all"
          >
            <Sparkles size={18} />
            <span>{lang === "ar" ? "اسألي مخططكِ الذكي ✨" : "Ask your AI planner ✨"}</span>
          </Link>
        </div>
      </Screen>

      {/* Dhikr Reader Full Modal */}
      <DhikrReaderModal
        isOpen={dhikrModalOpen}
        onClose={() => setDhikrModalOpen(false)}
        initialCategory="morning"
      />

      {/* Brain Dump Quick Capture Sheet */}
      <QuickCaptureSheet
        isOpen={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
      />
    </MobileShell>
  );
}
