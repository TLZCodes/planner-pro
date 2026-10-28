import React from "react";
import { Activity, Plus, Trash2, Flame, MapPin, Calendar, Clock } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useApp, todayKey } from "@/lib/store";
import { WORKOUT_TYPES } from "@/lib/wellnessEngine";

interface MovementTabProps {
  onOpenLogWorkout: () => void;
}

export const MovementTab: React.FC<MovementTabProps> = ({ onOpenLogWorkout }) => {
  const { t, lang } = useLang();
  const { state, deleteWorkout } = useApp();
  const isAr = lang === "ar";
  const today = todayKey(state.wellnessSettings?.timezone);

  const workouts = (state.workoutLogs || []).filter((w) => !w.deletedAt);
  const todayWorkouts = workouts.filter((w) => w.localDate === today);
  const todayTotalMinutes = todayWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);

  // Last 7 days workouts
  const now = new Date();
  const past7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  });

  const activeDaysLast7 = past7Days.filter((dStr) =>
    workouts.some((w) => w.localDate === dStr)
  ).length;

  return (
    <div className="space-y-4 px-4 py-4 animate-in fade-in duration-200">
      {/* Overview Card */}
      <div className="p-5 rounded-3xl bg-linear-to-br from-rose-500/10 via-pink-500/5 to-purple-500/10 border border-rose-200 dark:border-rose-900/40 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-rose-500 text-white shadow-xs">
              <Activity size={20} />
            </span>
            <div>
              <h2 className="text-base font-bold text-ink">
                {t("workoutMovement")}
              </h2>
              <p className="text-xs text-ink-muted">
                {activeDaysLast7} / 7 {t("loggedDaysOutOf")}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLogWorkout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>{t("logWorkout")}</span>
          </button>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-2xl bg-card border border-border/60">
            <span className="text-[11px] font-semibold text-ink-muted block">
              {isAr ? "نشاط اليوم" : "Today's Active Time"}
            </span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">
              {todayTotalMinutes} {isAr ? "دقيقة" : "min"}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-card border border-border/60">
            <span className="text-[11px] font-semibold text-ink-muted block">
              {isAr ? "تمارين اليوم" : "Workouts Today"}
            </span>
            <span className="text-lg font-black text-ink">
              {todayWorkouts.length}
            </span>
          </div>
        </div>
      </div>

      {/* Workouts List */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider">
            {isAr ? "سجل التمارين" : "Workout History"}
          </h3>
          <span className="text-xs text-ink-muted">
            {workouts.length} {isAr ? "تسجيلات" : "logged"}
          </span>
        </div>

        {workouts.length === 0 ? (
          <div className="py-10 text-center text-xs text-ink-muted bg-card rounded-3xl border border-dashed border-border/70 p-6">
            <p className="text-lg mb-2">🏃‍♀️</p>
            <p className="font-semibold text-ink mb-1">{t("emptyNothingLogged")}</p>
            <p className="text-[11px] text-ink-muted mb-4 max-w-xs mx-auto">
              {t("beginGently")}
            </p>
            <button
              onClick={onOpenLogWorkout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-2xs hover:bg-rose-600 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>{t("logWorkout")}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {workouts.map((w) => {
              const typeObj = WORKOUT_TYPES.find((t) => t.key === w.activityType);
              const emoji = typeObj?.emoji || "✨";
              const label = isAr
                ? typeObj?.labelAr.replace(/[^\p{L}\s]/gu, "") || w.activityType
                : typeObj?.labelEn || w.activityType;

              return (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border/70 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center text-lg">
                      {emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ink">
                          {label}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-background border border-border text-ink-muted">
                          {w.intensity === "intense"
                            ? t("intensityIntense")
                            : w.intensity === "gentle"
                            ? t("intensityGentle")
                            : t("intensityModerate")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-ink-muted mt-0.5">
                        <span className="font-semibold text-ink">
                          {w.durationMinutes} {isAr ? "دقيقة" : "min"}
                        </span>
                        {w.distance && (
                          <>
                            <span>•</span>
                            <span>{w.distance} {isAr ? "كم" : "km"}</span>
                          </>
                        )}
                        {w.calories && (
                          <>
                            <span>•</span>
                            <span>{w.calories} {isAr ? "سعرة" : "kcal"}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{w.localDate}</span>
                      </div>
                      {w.note && (
                        <p className="text-[11px] text-ink-muted italic mt-0.5">
                          "{w.note}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteWorkout(w.id)}
                    className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title={t("delete")}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
