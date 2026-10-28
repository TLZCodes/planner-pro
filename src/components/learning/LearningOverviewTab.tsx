import { memo, useMemo } from "react";
import {
  Play, BookOpen, Zap, Calendar, CheckCircle2, Circle, ArrowRight,
  TrendingUp, Clock, Plus, Award, AlertCircle, ChevronRight, Sparkles
} from "lucide-react";
import { useApp, type LearningItem, type LearningPlanItem } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { ProgressBar } from "@/components/kit";
import { cn } from "@/lib/utils";

interface LearningOverviewTabProps {
  onSelectTab: (tab: "overview" | "subjects" | "flashcards" | "review" | "progress") => void;
  onOpenItemDetail: (item: LearningItem) => void;
  onOpenNewItem: () => void;
  onOpenNewPlan: () => void;
  onStartFocus: (item: LearningItem) => void;
}

export const LearningOverviewTab = memo(function LearningOverviewTab({
  onSelectTab, onOpenItemDetail, onOpenNewItem, onOpenNewPlan, onStartFocus,
}: LearningOverviewTabProps) {
  const { state, toggleLearningPlanItem } = useApp();
  const { t, lang, dir } = useLang();
  const isAr = lang === "ar";

  const todayStr = new Date().toISOString().slice(0, 10);

  const learningItems = state.learningItems || [];
  const activeItems = learningItems.filter((i) => i.status === "active");
  const completedItems = learningItems.filter((i) => i.status === "completed");

  const decks = state.flashcardDecks || [];
  const totalCardsDue = useMemo(() => {
    let count = 0;
    for (const d of decks) {
      for (const c of (d.cards || [])) {
        if (!c.dueAt || c.dueAt <= todayStr || c.state === "new" || c.state === "learning") {
          count++;
        }
      }
    }
    return count;
  }, [decks, todayStr]);

  const todayStudyMins = useMemo(() => {
    return (state.focusSessions || [])
      .filter((s) => s.status === "completed" && s.localDate === todayStr && (s.sourceType === "learning" || s.sourceType === "subject"))
      .reduce((acc, s) => acc + Math.round((s.actualFocusSeconds || 0) / 60), 0);
  }, [state.focusSessions, todayStr]);

  const todayPlans = (state.learningPlanItems || []).filter((p) => p.localDate === todayStr);

  const activeFocus = state.activeFocusSession;
  const isFocusRunning = activeFocus && (activeFocus.status === "running" || activeFocus.status === "paused" || activeFocus.status === "break_running" || activeFocus.status === "break_paused");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Active Focus Banner */}
      {isFocusRunning && (
        <div className="p-4 rounded-3xl grad-theme text-white shadow-rose flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2.5 rounded-2xl bg-white/20 shrink-0"><Clock size={20} className="animate-spin text-white" /></span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase font-black tracking-wider text-white/80">
                {isAr ? "⏱️ جلسة تركيز جارية الآن" : "⏱️ Active Focus Session in Progress"}
              </p>
              <p className="text-sm font-black truncate">{activeFocus.sourceLabelSnapshot || "Focused Work"}</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/focus";
              }
            }}
            className="px-4 py-2 rounded-2xl bg-white text-ink text-xs font-extrabold shadow-sm active:scale-95 transition-all shrink-0"
          >
            {isAr ? "متابعة في مساحة التركيز ➜" : "Resume Focus Space ➜"}
          </button>
        </div>
      )}

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-4 rounded-3xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-ink-light font-sans">{isAr ? "دراسة اليوم" : "Today's Study"}</span>
            <span className="p-1.5 rounded-xl bg-hotpink/10 text-hotpink"><Clock size={14} /></span>
          </div>
          <p className="text-2xl font-black font-mono text-ink">{todayStudyMins}<span className="text-xs text-ink-light font-normal">m</span></p>
          <p className="text-[10px] text-ink-light mt-1">{isAr ? "جلسات تركيز مركزة" : "via Focus sessions"}</p>
        </div>

        <div className="p-4 rounded-3xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-ink-light">{isAr ? "مراجعات مستحقة" : "Cards Due"}</span>
            <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-500"><Zap size={14} /></span>
          </div>
          <p className="text-2xl font-black font-mono text-ink">{totalCardsDue}</p>
          {totalCardsDue > 0 ? (
            <button
              onClick={() => onSelectTab("review")}
              className="text-[10px] font-extrabold text-hotpink hover:underline text-left mt-1"
            >
              {isAr ? "بدء المراجعة ➜" : "Start Review ➜"}
            </button>
          ) : (
            <p className="text-[10px] text-islamic font-bold mt-1">{isAr ? "مكتملة بالكامل ✨" : "All caught up ✨"}</p>
          )}
        </div>

        <div className="p-4 rounded-3xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-ink-light">{isAr ? "أهداف دراسية" : "Study Goals"}</span>
            <span className="p-1.5 rounded-xl bg-blue-500/10 text-blue-500"><BookOpen size={14} /></span>
          </div>
          <p className="text-2xl font-black font-mono text-ink">{activeItems.length}</p>
          <p className="text-[10px] text-ink-light mt-1">{completedItems.length} {isAr ? "مكتمل" : "completed"}</p>
        </div>

        <div className="p-4 rounded-3xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-ink-light">{isAr ? "مجموعات البطاقات" : "Total Decks"}</span>
            <span className="p-1.5 rounded-xl bg-gold/15 text-gold"><Sparkles size={14} /></span>
          </div>
          <p className="text-2xl font-black font-mono text-ink">{decks.length}</p>
          <p className="text-[10px] text-ink-light mt-1">
            {decks.reduce((acc, d) => acc + (d.cards?.length || 0), 0)} {isAr ? "بطاقة إجمالية" : "total cards"}
          </p>
        </div>
      </div>

      {/* Agenda & Flashcard Quick Launch */}
      <div className="space-y-4">
        <div className="p-5 rounded-3xl bg-card border border-border/60 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-hotpink/10 text-hotpink"><Calendar size={15} /></span>
              <h3 className="text-sm font-bold text-ink font-sans">{isAr ? "خطة دراسة اليوم" : "Today's Study Agenda"}</h3>
            </div>
            <button
              onClick={onOpenNewPlan}
              className="text-xs font-bold text-hotpink px-2 py-1 rounded-lg bg-hotpink/10 hover:bg-hotpink/20 transition-all flex items-center gap-1"
            >
              <Plus size={12} /> {isAr ? "جدولة" : "Schedule"}
            </button>
          </div>

          {todayPlans.length === 0 ? (
            <div className="py-6 text-center text-ink-light text-xs my-auto">
              <p className="text-xl mb-1">🌿</p>
              <p>{isAr ? "لا توجد مهام دراسية مجدولة لليوم." : "No study items scheduled for today."}</p>
              <button onClick={onOpenNewPlan} className="text-hotpink font-bold hover:underline mt-1 block mx-auto">
                {isAr ? "+ إضافة جلسة إلى جدول اليوم" : "+ Add a session to today"}
              </button>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {todayPlans.map((plan) => {
                const item = learningItems.find((it) => it.id === plan.learningItemId);
                return (
                  <div
                    key={plan.id}
                    className="p-3 rounded-2xl bg-ghost/40 border border-border/40 flex items-center justify-between gap-2.5"
                  >
                    <button
                      onClick={() => toggleLearningPlanItem(plan.id)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                    >
                      {plan.status === "completed" ? (
                        <CheckCircle2 size={16} className="text-islamic shrink-0" />
                      ) : (
                        <Circle size={16} className="text-ink-light shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className={cn("text-xs font-bold truncate", plan.status === "completed" ? "line-through text-ink-light" : "text-ink")}>
                          {plan.title}
                        </p>
                        {item && (
                          <p className="text-[10px] text-ink-light flex items-center gap-1 mt-0.5">
                            <span>{item.icon}</span> <span>{item.title}</span>
                          </p>
                        )}
                      </div>
                    </button>
                    {item && plan.status !== "completed" && (
                      <button
                        onClick={() => onStartFocus(item)}
                        className="px-2.5 py-1 rounded-xl bg-hotpink/10 text-hotpink text-[11px] font-bold shrink-0 flex items-center gap-1 active:scale-95"
                      >
                        <Play size={10} className="fill-hotpink" />
                        <span>{plan.plannedMinutes || 25}m</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-500"><Zap size={15} /></span>
                <h3 className="text-sm font-bold text-ink font-sans">{isAr ? "مراجعة الاستذكار الذكية" : "Spaced Repetition Review"}</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {isAr ? "تكرار متباعد ذكي ✨" : "Spaced Repetition ✨"}
              </span>
            </div>
            <p className="text-xs text-ink-light leading-relaxed">
              {isAr
                ? "ثبّتي حفظكِ ومفاهيمكِ عبر جدول مراجعات علمي يتكيف مع مستوى تذكركِ."
                : "Reinforce long-term retention with adaptive spaced intervals."}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-hotpink/10 border border-purple-500/20 my-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-ink">{isAr ? "بطاقات مستحقة الآن" : "Cards Ready for Review"}</p>
              <p className="text-xl font-black font-mono text-purple-600 dark:text-purple-400 mt-0.5">{totalCardsDue}</p>
            </div>
            <button
              disabled={totalCardsDue === 0}
              onClick={() => onSelectTab("review")}
              className="px-4 py-2.5 rounded-xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <Play size={12} className="fill-white" />
              <span>{isAr ? "بدء المراجعة" : "Start Review"}</span>
            </button>
          </div>

          <div className="flex justify-between items-center text-[11px] pt-1">
            <button onClick={() => onSelectTab("flashcards")} className="text-hotpink font-bold hover:underline">
              {isAr ? "عرض جميع المجموعات ➜" : "Manage all decks ➜"}
            </button>
            <span className="text-ink-light">{state.totalFlashcardsReviewed || 0} {isAr ? "مراجعة سابقة" : "reviewed all-time"}</span>
          </div>
        </div>
      </div>

      {/* Active Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink font-sans">{isAr ? "المسارات والأهداف النشطة" : "Active Learning Goals"}</h3>
          <button onClick={() => onSelectTab("subjects")} className="text-xs font-bold text-hotpink hover:underline">
            {isAr ? "عرض الكل" : "View All"}
          </button>
        </div>

        {activeItems.length === 0 ? (
          <div className="text-center py-10 rounded-3xl bg-card border border-border/60 p-6">
            <BookOpen className="mx-auto text-ink-light mb-2 opacity-50" size={36} />
            <p className="text-sm font-bold text-ink font-sans">{isAr ? "لم تبدئي أي مسار تعليمي بعد" : "No active learning goals yet"}</p>
            <p className="text-xs text-ink-light mt-1 max-w-sm mx-auto">
              {isAr ? "أضيفي مادة، دورة تدريبية، كتابًا، أو مهارة تريدين تنميتها." : "Add a subject, course, book, or skill you would love to grow in."}
            </p>
            <button
              onClick={onOpenNewItem}
              className="mt-4 px-5 py-2.5 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>{isAr ? "+ أضيفي أول هدف تعلّم" : "+ Add my first learning goal"}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {activeItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenItemDetail(item)}
                className="p-3.5 rounded-3xl bg-card border border-border/60 shadow-xs hover:border-hotpink/50 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-2xl text-lg shrink-0 shadow-xs"
                      style={{ background: item.color + "25", border: `1.5px solid ${item.color}50` }}
                    >
                      {item.icon}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md bg-ghost border border-border/40 text-ink-light">
                      {t(`type${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`)}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-ink truncate group-hover:text-hotpink transition-colors font-sans">
                    {item.title}
                  </h4>
                  {item.author && <p className="text-[10px] text-ink-light truncate mt-0.5">{item.author}</p>}
                  {item.platform && <p className="text-[10px] text-ink-light truncate mt-0.5">{item.platform}</p>}
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-ink-light">
                      {item.progressMethod === "pages_read"
                        ? `${item.currentPage || 0}/${item.totalPages || 0} p`
                        : item.progressMethod === "lessons_completed"
                        ? `${item.completedLessons || 0}/${item.totalLessons || 0} les`
                        : `${item.currentValue || 0}m`}
                    </span>
                    <span className="font-extrabold font-mono text-hotpink">{item.progress}%</span>
                  </div>
                  <ProgressBar value={item.progress} />
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartFocus(item);
                      }}
                      className="px-3 py-1 rounded-xl grad-theme text-white text-[11px] font-bold flex items-center gap-1 active:scale-95 shadow-xs"
                    >
                      <Play size={10} className="fill-white" />
                      <span>{t("studyNow")}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
