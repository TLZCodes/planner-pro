import { useState, useMemo, memo } from "react";
import {
  TrendingUp, Award, Clock, Calendar, Zap, CheckCircle2, ChevronRight, BarChart2
} from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { ProgressBar } from "@/components/kit";
import { cn } from "@/lib/utils";

export const LearningProgressTab = memo(function LearningProgressTab() {
  const { state } = useApp();
  const { t, lang, dir } = useLang();
  const isAr = lang === "ar";

  const [heatmapMetric, setHeatmapMetric] = useState<"study_time" | "cards_reviewed" | "lessons_completed">("study_time");

  const heatmapDays = useMemo(() => {
    const days: { date: string; value: number; label: string }[] = [];
    const now = new Date();

    const studyMinsMap: Record<string, number> = {};
    for (const s of state.focusSessions || []) {
      if (s.status === "completed" && (s.sourceType === "learning" || s.sourceType === "subject")) {
        studyMinsMap[s.localDate] = (studyMinsMap[s.localDate] || 0) + Math.round((s.actualFocusSeconds || 0) / 60);
      }
    }

    const cardsReviewedMap: Record<string, number> = {};
    for (const rev of state.reviewSessions || []) {
      const dateVal = rev.endedAt || rev.completedAt;
      if (dateVal) {
        const d = dateVal.slice(0, 10);
        cardsReviewedMap[d] = (cardsReviewedMap[d] || 0) + (rev.reviewedCount || 0);
      }
    }

    const lessonsMap: Record<string, number> = {};
    for (const l of state.learningLessons || []) {
      if (l.completedAt) {
        const d = l.completedAt.slice(0, 10);
        lessonsMap[d] = (lessonsMap[d] || 0) + 1;
      }
    }

    for (let i = 59; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      let val = 0;
      if (heatmapMetric === "study_time") val = studyMinsMap[dateStr] || 0;
      else if (heatmapMetric === "cards_reviewed") val = cardsReviewedMap[dateStr] || 0;
      else if (heatmapMetric === "lessons_completed") val = lessonsMap[dateStr] || 0;

      days.push({
        date: dateStr,
        value: val,
        label: `${dateStr}: ${val} ${heatmapMetric === "study_time" ? "mins" : "items"}`,
      });
    }
    return days;
  }, [state.focusSessions, state.reviewSessions, state.learningLessons, heatmapMetric]);

  const totalStudyMinutes = useMemo(() => {
    return (state.focusSessions || [])
      .filter((s) => s.status === "completed" && (s.sourceType === "learning" || s.sourceType === "subject"))
      .reduce((acc, s) => acc + Math.round((s.actualFocusSeconds || 0) / 60), 0);
  }, [state.focusSessions]);

  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  const completedGoalsCount = (state.learningItems || []).filter((it) => it.status === "completed").length;
  const completedLessonsCount = (state.learningLessons || []).filter((l) => l.status === "completed").length;

  const reviewHistory = state.reviewSessions || [];
  const averageRetention = useMemo(() => {
    if (reviewHistory.length === 0) return 100;
    const sum = reviewHistory.reduce((acc, r) => acc + (r.retentionRate ?? 0), 0);
    return Math.round(sum / reviewHistory.length);
  }, [reviewHistory]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Lifetime Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-card border border-border/60 shadow-xs">
          <span className="text-[11px] font-bold text-ink-light block mb-1">{isAr ? "إجمالي ساعات المذاكرة" : "Total Study Time"}</span>
          <p className="text-2xl font-black font-mono text-ink">{totalStudyHours}<span className="text-xs font-normal text-ink-light">h</span></p>
          <p className="text-[10px] text-ink-light mt-1">{totalStudyMinutes} minutes focused</p>
        </div>

        <div className="p-4 rounded-3xl bg-card border border-border/60 shadow-xs">
          <span className="text-[11px] font-bold text-ink-light block mb-1">{isAr ? "معدل استيعاب المراجعة" : "Retention Rate"}</span>
          <p className="text-2xl font-black font-mono text-hotpink">{averageRetention}%</p>
          <p className="text-[10px] text-islamic font-bold mt-1">SM-2 Spaced Repetition</p>
        </div>

        <div className="p-4 rounded-3xl bg-card border border-border/60 shadow-xs">
          <span className="text-[11px] font-bold text-ink-light block mb-1">{isAr ? "أهداف مكتملة" : "Completed Goals"}</span>
          <p className="text-2xl font-black font-mono text-ink">{completedGoalsCount}</p>
          <p className="text-[10px] text-ink-light mt-1">{(state.learningItems || []).length} total goals</p>
        </div>

        <div className="p-4 rounded-3xl bg-card border border-border/60 shadow-xs">
          <span className="text-[11px] font-bold text-ink-light block mb-1">{isAr ? "دروس منجزة" : "Lessons Done"}</span>
          <p className="text-2xl font-black font-mono text-ink">{completedLessonsCount}</p>
          <p className="text-[10px] text-ink-light mt-1">{state.totalFlashcardsReviewed || 0} cards reviewed</p>
        </div>
      </div>

      {/* Multi-metric Heatmap */}
      <div className="p-5 rounded-3xl bg-card border border-border/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-ink font-sans font-bold">{t("studyHeatmap")}</h3>
            <p className="text-xs text-ink-light mt-0.5">{isAr ? "نشاطكِ التعليمي خلال الـ 60 يومًا الماضية" : "Your learning activity over the past 60 days"}</p>
          </div>

          <div className="flex gap-1 bg-ghost p-1 rounded-2xl">
            {[
              { id: "study_time", label: isAr ? "ساعات المذاكرة" : "Study Time" },
              { id: "cards_reviewed", label: isAr ? "البطاقات" : "Flashcards" },
              { id: "lessons_completed", label: isAr ? "الدروس" : "Lessons" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setHeatmapMetric(m.id as any)}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-bold transition-all",
                  heatmapMetric === m.id
                    ? "bg-card text-hotpink shadow-xs font-black"
                    : "text-ink-light hover:text-ink"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-12 gap-1.5 pt-2">
          {heatmapDays.map((day) => {
            const v = day.value;
            const bgClass =
              v === 0 ? "bg-ghost/60 border border-border/20"
              : v < 15 ? "bg-hotpink/25 border border-hotpink/30"
              : v < 45 ? "bg-hotpink/50 border border-hotpink/60"
              : "bg-hotpink border border-hotpink shadow-xs";

            return (
              <div
                key={day.date}
                className={cn("h-6 sm:h-7 rounded-lg transition-transform hover:scale-125 cursor-pointer relative group", bgClass)}
                title={day.label}
              >
                <span className="sr-only">{day.label}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] text-ink-light pt-2 border-t border-border/40">
          <span>{isAr ? "أقل نشاطًا" : "Less"}</span>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-xs bg-ghost/60 border border-border/20" />
            <span className="h-3 w-3 rounded-xs bg-hotpink/25" />
            <span className="h-3 w-3 rounded-xs bg-hotpink/50" />
            <span className="h-3 w-3 rounded-xs bg-hotpink" />
          </div>
          <span>{isAr ? "أكثر نشاطًا" : "More"}</span>
        </div>
      </div>

      {/* Focus Activity Logs */}
      <div className="p-5 rounded-3xl bg-card border border-border/60 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-ink font-sans font-bold">{t("studyActivityHistory")}</h3>

        {(state.focusSessions || []).filter((s) => s.status === "completed" && (s.sourceType === "learning" || s.sourceType === "subject")).length === 0 ? (
          <div className="text-center py-8 text-xs text-ink-light italic">
            {t("emptyStudyHistory")}
          </div>
        ) : (
          <div className="space-y-2">
            {(state.focusSessions || [])
              .filter((s) => s.status === "completed" && (s.sourceType === "learning" || s.sourceType === "subject"))
              .slice(0, 15)
              .map((sess) => (
                <div
                  key={sess.id}
                  className="p-3 rounded-2xl bg-ghost/40 border border-border/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-ink truncate">{sess.sourceLabelSnapshot || "Study Session"}</p>
                    <p className="text-[10px] text-ink-light flex items-center gap-2 mt-0.5">
                      <span>{sess.localDate}</span>
                      <span>•</span>
                      <span>{sess.mode === "pomodoro" ? "Pomodoro" : "Stopwatch"}</span>
                      {sess.focusRating && (
                        <>
                          <span>•</span>
                          <span>Rating: {sess.focusRating}/5 ⭐</span>
                        </>
                      )}
                    </p>
                    {sess.privateNote && (
                      <p className="text-[11px] text-ink-light italic mt-1 bg-card/60 p-1.5 rounded-lg">
                        "{sess.privateNote}"
                      </p>
                    )}
                  </div>
                  <span className="font-mono font-black text-hotpink shrink-0 text-sm">
                    {Math.round((sess.actualFocusSeconds || 0) / 60)}m
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
});
