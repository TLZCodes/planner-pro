import React, { useState, useMemo } from "react";
import {
  Compass,
  Plus,
  Search,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  PiggyBank,
  Ticket,
  ChevronRight,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { GlassCard, ProgressBar } from "@/components/kit";
import {
  selectNextAdventure,
  calculatePreparationProgress,
  calculateTripFinances,
  type TravelTrip,
  type TripStatus,
} from "@/lib/travelEngine";

interface TravelDashboardProps {
  onSelectTrip: (tripId: string) => void;
  onOpenCreateTrip: () => void;
  onOpenAddBucketItem: () => void;
  onOpenSettings: () => void;
  activeSection: "upcoming" | "bucket_list" | "past";
  onChangeSection: (sec: "upcoming" | "bucket_list" | "past") => void;
}

export function TravelDashboard({
  onSelectTrip,
  onOpenCreateTrip,
  onOpenAddBucketItem,
  onOpenSettings,
  activeSection,
  onChangeSection,
}: TravelDashboardProps) {
  const { state } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const trips = state.travelTrips || [];
  const checklist = state.travelChecklistItems || [];
  const bookings = state.travelBookings || [];
  const financeTxs = state.financialTransactions || [];
  const currency = state.prefs?.currency || "MAD";

  // Select next adventure
  const { trip: nextTrip, isCurrentTrip, daysUntil, needsCompletionPrompt } = useMemo(
    () => selectNextAdventure(trips),
    [trips]
  );

  // Next trip calculations
  const nextTripChecklist = useMemo(
    () => (nextTrip ? checklist.filter((c) => c.tripId === nextTrip.id) : []),
    [nextTrip, checklist]
  );
  const nextTripPrep = useMemo(
    () => calculatePreparationProgress(nextTripChecklist),
    [nextTripChecklist]
  );
  const nextTripFinances = useMemo(
    () => (nextTrip ? calculateTripFinances(nextTrip, financeTxs) : null),
    [nextTrip, financeTxs]
  );
  const nextTripBookings = useMemo(
    () => (nextTrip ? bookings.filter((b) => b.tripId === nextTrip.id) : []),
    [nextTrip, bookings]
  );

  // Filter trips based on section & search
  const filteredUpcoming = useMemo(() => {
    return trips
      .filter((tr) => tr.status !== "completed" && tr.status !== "archived")
      .filter((tr) => {
        if (statusFilter !== "all" && tr.status !== statusFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          tr.title.toLowerCase().includes(q) ||
          tr.primaryCity.toLowerCase().includes(q) ||
          (tr.countryCode && tr.countryCode.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [trips, searchQuery, statusFilter]);

  const getStatusLabel = (status: TripStatus) => {
    switch (status) {
      case "wishlist":
        return t("statusWishlist");
      case "planning":
        return t("statusPlanning");
      case "booked":
        return t("statusBooked");
      case "in_progress":
        return t("statusInProgress");
      case "completed":
        return t("statusCompleted");
      case "archived":
        return t("statusArchived");
      default:
        return status;
    }
  };

  const getStatusBadgeStyle = (status: TripStatus) => {
    switch (status) {
      case "in_progress":
        return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
      case "booked":
        return "bg-hotpink/20 text-hotpink border-hotpink/30";
      case "planning":
        return "bg-lavender text-rosegold border-rosegold/30";
      case "completed":
        return "bg-gold/20 text-amber-800 dark:text-amber-200 border-gold/30";
      default:
        return "bg-surface text-ink-light border-border";
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Dreamy Next Adventure Hero Card ── */}
      {nextTrip && (
        <div className="px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8a63d2] via-[#b87ad9] to-[#f49bb8] p-5 text-white shadow-xl shadow-purple-900/15">
            {/* Soft decorative glow circles */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-pink-400/20 blur-xl" />

            <div className="relative z-10 space-y-4">
              {/* Badge & Days Left */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold tracking-wide backdrop-blur-md">
                  <Sparkles size={12} className="text-yellow-200" />
                  {t("nextAdventure")}
                </span>

                <span className="rounded-full bg-black/20 px-3 py-1 text-[11px] font-medium backdrop-blur-md">
                  {isCurrentTrip ? (
                    <span className="text-emerald-200 font-bold">● {t("statusInProgress")}</span>
                  ) : needsCompletionPrompt ? (
                    <span className="text-amber-200 font-bold">{t("readyToComplete")}</span>
                  ) : (
                    <span>{daysUntil} {t("daysToGo")}</span>
                  )}
                </span>
              </div>

              {/* Destination & Dates */}
              <div>
                <h3 className="text-2xl font-black tracking-tight drop-shadow-xs">
                  {nextTrip.title || nextTrip.primaryCity}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-xs font-medium text-white/90">
                  <MapPin size={13} className="text-white/80" />
                  <span>{nextTrip.primaryCity}</span>
                  <span>•</span>
                  <Calendar size={13} className="text-white/80" />
                  <span>
                    {nextTrip.startDate} → {nextTrip.endDate}
                  </span>
                </div>
              </div>

              {/* Progress Gauges: Preparation & Savings */}
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white/15 p-3 backdrop-blur-md">
                {/* Prep Progress */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-white/90">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      {t("prepProgress")}
                    </span>
                    <span>
                      {nextTripPrep.status === "not_set_up"
                        ? t("notSetUp")
                        : `${nextTripPrep.percentage}%`}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-black/20">
                    <div
                      className="h-full bg-white transition-all duration-500 rounded-full"
                      style={{ width: `${nextTripPrep.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Savings / Budget Spending */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-white/90">
                    <span className="flex items-center gap-1">
                      <PiggyBank size={12} />
                      {t("tabBudget")}
                    </span>
                    <span>
                      {nextTripFinances
                        ? `${(nextTripFinances.actualSpendingMinor / 100).toLocaleString()} ${nextTrip.primaryCurrency}`
                        : "0"}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-black/20">
                    <div
                      className="h-full bg-amber-300 transition-all duration-500 rounded-full"
                      style={{
                        width: `${
                          nextTripFinances && nextTripFinances.estimatedBudgetMinor > 0
                            ? Math.min(100, (nextTripFinances.actualSpendingMinor / nextTripFinances.estimatedBudgetMinor) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Summary Strip & CTA */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs text-white/90">
                  <Ticket size={14} />
                  <span>
                    {nextTripBookings.length} {t("bookingSummary")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTrip(nextTrip.id)}
                  className="cursor-pointer flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-bold text-purple-900 shadow-md transition-all active:scale-95 hover:bg-white/90"
                >
                  <span>{t("continuePlanning")}</span>
                  <ChevronRight size={14} className={isAr ? "rotate-180" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Section Selector Tabs (Upcoming, Bucket List, Past) ── */}
      <div className="px-4">
        <div className="flex rounded-2xl bg-surface p-1 border border-border">
          <button
            type="button"
            onClick={() => onChangeSection("upcoming")}
            className={cn(
              "cursor-pointer flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all",
              activeSection === "upcoming"
                ? "bg-card text-hotpink shadow-xs"
                : "text-ink-light hover:text-ink"
            )}
          >
            {t("upcomingTrips")} ({trips.filter((t) => t.status !== "completed" && t.status !== "archived").length})
          </button>
          <button
            type="button"
            onClick={() => onChangeSection("bucket_list")}
            className={cn(
              "cursor-pointer flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all",
              activeSection === "bucket_list"
                ? "bg-card text-hotpink shadow-xs"
                : "text-ink-light hover:text-ink"
            )}
          >
            {t("bucketList")} ({state.bucketListItems?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => onChangeSection("past")}
            className={cn(
              "cursor-pointer flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all",
              activeSection === "past"
                ? "bg-card text-hotpink shadow-xs"
                : "text-ink-light hover:text-ink"
            )}
          >
            {t("pastTrips")} ({trips.filter((t) => t.status === "completed" || t.status === "archived").length})
          </button>
        </div>
      </div>

      {/* ── Search & Filter Bar (shown when trips exist or searching) ── */}
      {(trips.length > 0 || searchQuery.trim().length > 0) && (
        <div className="px-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "البحث في الرحلات والوجهات..." : "Search trips & destinations..."}
              className="w-full rounded-2xl bg-surface pl-10 pr-4 py-2.5 text-xs font-medium text-ink outline-none border border-border focus:border-hotpink transition-all placeholder:text-ink-light/60"
            />
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={activeSection === "bucket_list" ? onOpenAddBucketItem : onOpenCreateTrip}
            className="cursor-pointer flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md active:scale-95 transition-all"
            title={t("createTripBtn")}
          >
            <Plus size={18} />
          </button>
        </div>
      )}

      {/* ── Content Area: Upcoming Trips Cards ── */}
      {activeSection === "upcoming" && (
        <div className="px-4 space-y-3 pb-8">
          {filteredUpcoming.length === 0 ? (
            <div className="rounded-3xl bg-card border border-border p-8 text-center space-y-3 shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lavender text-rosegold">
                <Compass size={24} />
              </div>
              <h4 className="text-sm font-bold text-ink">{t("noTripsTitle")}</h4>
              <p className="text-xs text-ink-light max-w-xs mx-auto leading-relaxed">{t("noTripsSubtitle")}</p>
              <button
                type="button"
                onClick={onOpenCreateTrip}
                className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
              >
                <Plus size={15} />
                <span>{t("addFirstTrip")}</span>
              </button>
            </div>
          ) : (
            filteredUpcoming.map((trip) => {
              const tripItems = checklist.filter((c) => c.tripId === trip.id);
              const prep = calculatePreparationProgress(tripItems);
              const fin = calculateTripFinances(trip, financeTxs);

              return (
                <div
                  key={trip.id}
                  onClick={() => onSelectTrip(trip.id)}
                  className="group cursor-pointer relative overflow-hidden rounded-3xl bg-card border border-border p-4.5 shadow-xs transition-all hover:shadow-md active:scale-[0.99] space-y-3"
                >
                  {/* Header Row: City, Dates & Status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-ink group-hover:text-hotpink transition-colors">
                        {trip.title || trip.primaryCity}
                      </h4>
                      <p className="text-xs font-medium text-ink-light flex items-center gap-1.5 mt-0.5">
                        <MapPin size={12} />
                        <span>{trip.primaryCity}</span>
                        <span>•</span>
                        <span>
                          {trip.startDate} → {trip.endDate}
                        </span>
                      </p>
                    </div>

                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[10px] font-bold capitalize",
                        getStatusBadgeStyle(trip.status)
                      )}
                    >
                      {getStatusLabel(trip.status)}
                    </span>
                  </div>

                  {/* Progress Indicators */}
                  <div className="space-y-2 pt-1 border-t border-border/40">
                    {/* Preparation Progress */}
                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-ink-light font-medium">{t("prepProgress")}</span>
                        <span className="font-bold text-ink">
                          {prep.status === "not_set_up" ? t("notSetUp") : `${prep.percentage}%`}
                        </span>
                      </div>
                      <ProgressBar
                        value={prep.percentage}
                        className="mt-1 h-1.5"
                        barClass="bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>

                    {/* Financial Summary */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-ink-light">
                        {isAr ? "المصروف الفعلي" : "Actual Spending"}:
                      </span>
                      <span className="font-bold text-ink">
                        {(fin.actualSpendingMinor / 100).toLocaleString()} /{" "}
                        {(fin.estimatedBudgetMinor / 100).toLocaleString()} {trip.primaryCurrency}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
