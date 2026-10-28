import React from "react";
import {
  History,
  Calendar,
  MapPin,
  Sparkles,
  BookOpen,
  Camera,
  Copy,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { calculateTripFinances, type TravelTrip } from "@/lib/travelEngine";

interface PastTripsTabProps {
  onSelectTrip: (tripId: string) => void;
  onOpenJournalShare: (memoryId: string) => void;
  onDuplicateTrip: (trip: TravelTrip) => void;
  onCompleteTrip: (tripId: string) => void;
}

export function PastTripsTab({
  onSelectTrip,
  onOpenJournalShare,
  onDuplicateTrip,
  onCompleteTrip,
}: PastTripsTabProps) {
  const { state } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const trips = state.travelTrips || [];
  const memories = state.travelMemories || [];
  const financeTxs = state.financialTransactions || [];

  const todayStr = new Date().toISOString().slice(0, 10);

  // Trips marked completed or archived
  const pastTrips = trips.filter((t) => t.status === "completed" || t.status === "archived");

  // Trips whose end date passed but haven't been completed yet
  const awaitingCompletion = trips.filter(
    (t) => t.status !== "completed" && t.status !== "archived" && t.endDate < todayStr
  );

  return (
    <div className="px-4 space-y-4 pb-8">
      {/* ── Pending Completion Suggestion Banner ── */}
      {awaitingCompletion.length > 0 && (
        <div className="space-y-2">
          {awaitingCompletion.map((trip) => (
            <div
              key={trip.id}
              className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100 flex items-center gap-1.5">
                    <Sparkles size={15} className="text-amber-500" />
                    <span>{trip.title || trip.primaryCity}</span>
                  </h4>
                  <p className="text-xs text-amber-800/80 dark:text-amber-200/80 mt-0.5">
                    {t("readyToComplete")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onCompleteTrip(trip.id)}
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs active:scale-95 transition-all"
              >
                <CheckCircle2 size={14} />
                <span>{t("markCompletedBtn")}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Completed Journeys List ── */}
      <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
        <History size={16} className="text-hotpink" />
        <span>{t("pastTrips")}</span>
      </h3>

      {pastTrips.length === 0 ? (
        <div className="rounded-3xl bg-card border border-border p-8 text-center space-y-3 shadow-xs">
          <History size={36} className="mx-auto text-ink-light/50" />
          <h4 className="text-sm font-bold text-ink">{t("noPastTripsTitle")}</h4>
          <p className="text-xs text-ink-light max-w-xs mx-auto">{t("noPastTripsSubtitle")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pastTrips.map((trip) => {
            const fin = calculateTripFinances(trip, financeTxs);
            const tripMemories = memories.filter((m) => m.tripId === trip.id);

            return (
              <div
                key={trip.id}
                className="rounded-3xl bg-card border border-border p-4.5 shadow-xs space-y-3"
              >
                {/* City, dates & status */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4
                      onClick={() => onSelectTrip(trip.id)}
                      className="cursor-pointer text-base font-bold text-ink hover:text-hotpink transition-colors flex items-center gap-1.5"
                    >
                      <span>{trip.title || trip.primaryCity}</span>
                      <ChevronRight size={14} className={isAr ? "rotate-180" : ""} />
                    </h4>
                    <p className="text-xs font-medium text-ink-light flex items-center gap-1 mt-0.5">
                      <MapPin size={12} />
                      <span>{trip.primaryCity}</span>
                      <span>•</span>
                      <span>
                        {trip.startDate} → {trip.endDate}
                      </span>
                    </p>
                  </div>

                  <span className="rounded-full bg-surface border border-border px-2.5 py-0.5 text-[10px] font-bold text-ink-light">
                    {trip.status === "completed" ? t("statusCompleted") : t("statusArchived")}
                  </span>
                </div>

                {/* Financial overview */}
                <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-2xl bg-surface border border-border/50">
                  <span className="text-ink-light font-medium">
                    {isAr ? "إجمالي الإنفاق الفعلي" : "Total Actual Spending"}:
                  </span>
                  <span className="font-bold text-ink">
                    {(fin.actualSpendingMinor / 100).toLocaleString()} {trip.primaryCurrency}
                  </span>
                </div>

                {/* Trip memories section */}
                {tripMemories.length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-border/40">
                    <p className="text-[11px] font-bold text-ink-light flex items-center gap-1">
                      <Camera size={12} />
                      <span>{isAr ? "الذكريات المحفوظة" : "Saved Memories"} ({tripMemories.length})</span>
                    </p>
                    <div className="space-y-2">
                      {tripMemories.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between rounded-2xl bg-surface/70 p-2.5 border border-border/40 text-xs"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-bold text-ink truncate">{m.caption}</p>
                            {m.reflection && (
                              <p className="text-[11px] text-ink-light truncate mt-0.5">
                                {m.reflection}
                              </p>
                            )}
                          </div>

                          {m.linkedJournalEntryId ? (
                            <span className="shrink-0 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              ✓ {isAr ? "في اليوميات" : "In Journal"}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenJournalShare(m.id)}
                              className="shrink-0 cursor-pointer inline-flex items-center gap-1 rounded-full bg-hotpink/10 border border-hotpink/30 px-2.5 py-1 text-[10px] font-bold text-hotpink active:scale-95"
                            >
                              <BookOpen size={11} />
                              <span>{t("sendToJournalBtn")}</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer action: Duplicate as New Trip */}
                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => onSelectTrip(trip.id)}
                    className="cursor-pointer text-xs font-bold text-hotpink hover:underline"
                  >
                    {isAr ? "عرض التفاصيل الكاملة" : "View Full Details"} →
                  </button>

                  <button
                    type="button"
                    onClick={() => onDuplicateTrip(trip)}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-surface border border-border px-3 py-1 text-xs font-semibold text-ink hover:text-hotpink active:scale-95 transition-all"
                  >
                    <Copy size={13} />
                    <span>{t("duplicateTripBtn")}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
