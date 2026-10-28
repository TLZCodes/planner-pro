import {
  type ResolvedDaySchedule,
  type IdealWeekItem,
} from "@/lib/idealWeekEngine";
import { cn } from "@/lib/utils";
import { Plus, Clock, Moon, ChevronRight, Edit2 } from "lucide-react";

interface IdealWeekDayCardProps {
  daySchedule: ResolvedDaySchedule;
  dayName: string;
  dayShort: string;
  isToday?: boolean;
  isSelected?: boolean;
  onClickCard: () => void;
  onChangeDayType: () => void;
  onAddItem: () => void;
  onEditItem: (item: IdealWeekItem) => void;
  isAr: boolean;
}

export function IdealWeekDayCard({
  daySchedule,
  dayName,
  dayShort,
  isToday,
  isSelected,
  onClickCard,
  onChangeDayType,
  onAddItem,
  onEditItem,
  isAr,
}: IdealWeekDayCardProps) {
  const { dayType, items, isNightShift } = daySchedule;

  return (
    <div
      className={cn(
        "rounded-3xl border bg-card p-3.5 transition-all space-y-3 shadow-xs",
        isSelected
          ? "border-hotpink ring-2 ring-hotpink/20 shadow-rose-sm"
          : "border-border/80 hover:border-border",
        isNightShift && "border-indigo-200/80 dark:border-indigo-800/80"
      )}
    >
      {/* Header Row: Day Title & Day Type Badge */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onClickCard}
          className="cursor-pointer text-left flex items-center gap-2 group"
        >
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-transform group-hover:scale-105",
              isToday
                ? "grad-theme text-white shadow-rose-xs"
                : "bg-surface border border-border/70 text-ink"
            )}
          >
            {dayShort}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-ink">{dayName}</span>
              {isToday && (
                <span className="text-[10px] font-black text-hotpink bg-hotpink/10 px-1.5 py-0.2 rounded-full">
                  {isAr ? "اليوم" : "Today"}
                </span>
              )}
            </div>
            <span className="text-[10.5px] font-mono text-ink-light">
              {daySchedule.dateStr}
            </span>
          </div>
        </button>

        {/* Day Type Badge Clickable to change */}
        <button
          type="button"
          onClick={onChangeDayType}
          title={isAr ? "تغيير نمط هذا اليوم" : "Change day rhythm type"}
          className={cn(
            "cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-transform active:scale-95",
            dayType.color
          )}
        >
          <span>{dayType.icon}</span>
          <span>{isAr ? dayType.nameAr : dayType.nameEn}</span>
        </button>
      </div>

      {/* Night shift indicator notice */}
      {isNightShift && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/50 text-[10.5px] font-bold text-indigo-700 dark:text-indigo-300">
          <Moon className="h-3 w-3" />
          <span>
            {isAr
              ? "مناوبة ليلية: تمتد الأنشطة عبر منتصف الليل إلى فجر الغد"
              : "Night shift: activities cross midnight into tomorrow morning"}
          </span>
        </div>
      )}

      {/* Items list or empty state */}
      <div className="space-y-1.5">
        {items.length === 0 ? (
          <div
            onClick={onAddItem}
            className="cursor-pointer py-3 px-3 rounded-2xl border border-dashed border-border/80 hover:border-hotpink/40 hover:bg-hotpink/5 text-center transition-colors"
          >
            <span className="text-xs text-ink-light font-medium block">
              {isAr ? "+ انقري لإضافة نشاط أو روتين" : "+ Tap to add activity or routine"}
            </span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {items.map((it) => {
              const isTask = it.type === "task_proposal";
              const isRoutine = it.type === "routine";
              const isNote = it.type === "note";

              return (
                <div
                  key={it.id}
                  onClick={() => onEditItem(it)}
                  className={cn(
                    "cursor-pointer flex items-center justify-between p-2 rounded-xl border text-xs transition-colors hover:border-hotpink/60",
                    isTask && "bg-pink-50/30 dark:bg-pink-950/20 border-pink-100 dark:border-pink-900/30",
                    isRoutine && "bg-purple-50/30 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30",
                    isNote && "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30"
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-sm shrink-0">
                      {isTask ? "🎯" : isRoutine ? "☀️" : "🕊️"}
                    </span>
                    <span className="font-bold text-ink truncate">
                      {isAr && it.titleAr ? it.titleAr : it.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-ink-light shrink-0">
                    {it.clockTime && <span>{it.clockTime}</span>}
                    {it.crossesMidnight && (
                      <Moon className="h-3 w-3 text-indigo-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card bottom actions */}
      <div className="flex items-center justify-between pt-1 border-t border-border/40">
        <button
          type="button"
          onClick={onClickCard}
          className="cursor-pointer text-[11px] font-black text-ink-light hover:text-hotpink transition-colors flex items-center gap-0.5"
        >
          <span>{isAr ? "تفاصيل اليوم" : "Day Details"}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onAddItem}
          className="cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface hover:bg-hotpink/10 border border-border/70 text-ink hover:text-hotpink text-[11px] font-bold transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{isAr ? "إضافة" : "Add"}</span>
        </button>
      </div>
    </div>
  );
}
