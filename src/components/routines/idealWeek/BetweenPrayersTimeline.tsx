import {
  type BetweenPrayersPeriod,
  type IdealWeekItem,
} from "@/lib/idealWeekEngine";
import { cn } from "@/lib/utils";
import { Clock, Plus, Edit2, Moon } from "lucide-react";

interface BetweenPrayersTimelineProps {
  periods: BetweenPrayersPeriod[];
  items: IdealWeekItem[];
  onAddItemToPeriod: (periodId: string) => void;
  onEditItem: (item: IdealWeekItem) => void;
  isAr: boolean;
  missingPrayerTimes?: boolean;
}

export function BetweenPrayersTimeline({
  periods,
  items,
  onAddItemToPeriod,
  onEditItem,
  isAr,
  missingPrayerTimes,
}: BetweenPrayersTimelineProps) {
  return (
    <div className="space-y-3">
      {missingPrayerTimes && (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11.5px] text-amber-800 dark:text-amber-200">
          {isAr
            ? "يتم استخدام المواقيت الشمسية القياسية لعدم تحديد الموقع في ركن ديني، يمكنكِ تعديل مدينتكِ من إعدادات ديني."
            : "Standard astronomical baseline times used. You can configure your exact city in My Deen settings."}
        </div>
      )}

      <div className="space-y-2.5">
        {periods.map((period) => {
          const periodItems = items.filter((it) => it.prayerPeriodId === period.id);

          return (
            <div
              key={period.id}
              className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs hover:border-border transition-colors"
            >
              {/* Period Header Bar */}
              <div className="flex items-center justify-between p-3 bg-surface/60 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl flex items-center justify-center w-8 h-8 rounded-xl bg-card border border-border/60 shadow-xs">
                    {period.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-ink">
                        {isAr ? period.labelAr : period.labelEn}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 font-bold">
                        {period.startTime} → {period.endTime}
                      </span>
                    </div>
                    <span className="text-[10.5px] text-ink-light line-clamp-1">
                      {isAr ? period.subAr : period.subEn}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAddItemToPeriod(period.id)}
                  title={isAr ? "إضافة نشاط لهذه الفترة" : "Add activity to this period"}
                  className="cursor-pointer h-7 w-7 rounded-full flex items-center justify-center bg-card hover:bg-hotpink/10 border border-border/70 text-ink hover:text-hotpink text-xs font-bold transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Items List in Period */}
              <div className="p-2 space-y-1.5">
                {periodItems.length === 0 ? (
                  <div className="py-2.5 px-3 text-center text-[11px] text-ink-light/70 italic">
                    {isAr ? "لا توجد أنشطة مجدولة لهذه الفترة بعد 🌸" : "No activities placed in this period yet 🌸"}
                  </div>
                ) : (
                  periodItems.map((it) => {
                    const isTaskProposal = it.type === "task_proposal";
                    const isRoutine = it.type === "routine";
                    const isNote = it.type === "note";

                    return (
                      <div
                        key={it.id}
                        onClick={() => onEditItem(it)}
                        className={cn(
                          "cursor-pointer flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all hover:border-hotpink/60 active:scale-[0.99]",
                          isTaskProposal && "bg-pink-50/40 dark:bg-pink-950/20 border-pink-200/60 dark:border-pink-900/40",
                          isRoutine && "bg-purple-50/40 dark:bg-purple-950/20 border-purple-200/60 dark:border-purple-900/40",
                          isNote && "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {isTaskProposal ? "🎯" : isRoutine ? "☀️" : "🕊️"}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-ink">
                                {isAr && it.titleAr ? it.titleAr : it.title}
                              </span>
                              {it.crossesMidnight && (
                                <Moon className="h-3 w-3 text-indigo-500 inline shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-ink-light font-medium">
                              {it.clockTime && (
                                <span className="font-mono">{it.clockTime}</span>
                              )}
                              {it.durationMinutes ? (
                                <span>{it.durationMinutes} {isAr ? "دقيقة" : "min"}</span>
                              ) : null}
                              {isNote && (
                                <span className="text-emerald-600 font-bold">
                                  {isAr ? "ملاحظة فقط" : "Note only"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Edit2 className="h-3.5 w-3.5 text-ink-light opacity-60 hover:opacity-100" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
