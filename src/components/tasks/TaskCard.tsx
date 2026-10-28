import { memo } from "react";
import {
  Check,
  Star,
  Trash2,
  Edit2,
  Timer,
  Clock,
  MoreVertical,
  Calendar,
} from "lucide-react";
import { type Task } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export interface TaskCardProps {
  task: Task;
  allCategories: any[];
  isAr: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleTopThree: () => void;
  onFocus?: () => void;
  onMoveTomorrow?: () => void;
}

export const TaskCard = memo(function TaskCard({
  task,
  allCategories,
  isAr,
  onToggle,
  onEdit,
  onDelete,
  onToggleTopThree,
  onFocus,
  onMoveTomorrow,
}: TaskCardProps) {
  const cat = allCategories.find((c: any) => c.id === task.tag) || {
    id: task.tag,
    labelEn: task.tag,
    labelAr: task.tag,
    emoji: "🏷️",
    bg: "bg-surface text-ink-light border-border/60",
  };

  return (
    <div
      className={cn(
        "group relative rounded-3xl bg-card p-3.5 border transition-all shadow-xs",
        task.done ? "border-border/40 opacity-70 bg-card/60" : "border-border/80 hover:border-hotpink/40"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Checkbox & Title & Badges */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "cursor-pointer flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
              task.done
                ? "grad-theme border-transparent text-white shadow-xs"
                : "border-border bg-surface hover:border-hotpink"
            )}
            aria-label={task.done ? (isAr ? "إلغاء الإكمال" : "Mark incomplete") : (isAr ? "إكمال المهمة" : "Mark complete")}
          >
            {task.done && <Check size={13} className="stroke-[3]" />}
          </button>

          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                "text-xs sm:text-sm font-extrabold leading-snug break-words transition-colors line-clamp-2",
                task.done ? "line-through text-ink-light" : "text-ink"
              )}
            >
              {task.title}
            </h3>

            {/* Badges: Category, Scheduled Time, Top 3 */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {/* Category tag */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border",
                  cat.bg || "bg-surface text-ink-light border-border"
                )}
              >
                <span>{cat.emoji}</span>
                <span>{isAr ? cat.labelAr : cat.labelEn}</span>
              </span>

              {/* Scheduled time badge if present */}
              {task.optionalTime && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-pink-50/80 text-hotpink border border-pink-200/80 dark:bg-pink-950/40 dark:border-pink-900">
                  <Clock size={10} />
                  <span>{task.optionalTime}</span>
                </span>
              )}

              {/* Top 3 indicator */}
              {task.isTopThree && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Star size={10} className="fill-amber-500 text-amber-500" />
                  <span>Top 3</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls: Focus (if available) + Single Overflow Menu */}
        <div className="flex items-center gap-1 shrink-0">
          {onFocus && !task.done && (
            <button
              type="button"
              onClick={onFocus}
              className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900 text-hotpink hover:scale-105 active:scale-95 transition-all shadow-2xs"
              title={isAr ? "بدء جلسة تركيز لهذه المهمة" : "Focus on this task"}
              aria-label={isAr ? "بدء التركيز" : "Start focus"}
            >
              <Timer size={14} />
            </button>
          )}

          {/* Unified Overflow Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border/70 text-ink-light hover:text-ink hover:border-hotpink/40 active:scale-95 transition-all"
                aria-label={isAr ? "خيارات المهمة" : "Task options"}
              >
                <MoreVertical size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 rounded-2xl bg-card border border-border/80 shadow-lg p-1.5 z-50 text-ink font-sans text-xs"
            >
              <DropdownMenuItem
                onClick={onToggleTopThree}
                className="cursor-pointer flex items-center gap-2 px-2.5 py-2 rounded-xl text-ink font-semibold hover:bg-surface focus:bg-surface transition-colors"
              >
                <Star
                  size={14}
                  className={task.isTopThree ? "fill-amber-500 text-amber-500" : "text-amber-500"}
                />
                <span>
                  {task.isTopThree
                    ? isAr
                      ? "إلغاء من Top 3"
                      : "Remove from Top 3"
                    : isAr
                    ? "تعيين كـ Top 3"
                    : "Add to Top 3"}
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onEdit}
                className="cursor-pointer flex items-center gap-2 px-2.5 py-2 rounded-xl text-ink font-semibold hover:bg-surface focus:bg-surface transition-colors"
              >
                <Edit2 size={14} className="text-hotpink" />
                <span>{isAr ? "تعديل المهمة" : "Edit Task"}</span>
              </DropdownMenuItem>

              {onMoveTomorrow && (
                <DropdownMenuItem
                  onClick={onMoveTomorrow}
                  className="cursor-pointer flex items-center gap-2 px-2.5 py-2 rounded-xl text-ink font-semibold hover:bg-surface focus:bg-surface transition-colors"
                >
                  <Calendar size={14} className="text-sky-500" />
                  <span>{isAr ? "نقل إلى الغد" : "Move to Tomorrow"}</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="my-1 bg-border/60" />

              <DropdownMenuItem
                onClick={onDelete}
                className="cursor-pointer flex items-center gap-2 px-2.5 py-2 rounded-xl text-rose-500 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 focus:bg-rose-50 dark:focus:bg-rose-950/40 transition-colors"
              >
                <Trash2 size={14} className="text-rose-500" />
                <span>{isAr ? "حذف المهمة" : "Delete Task"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
});
