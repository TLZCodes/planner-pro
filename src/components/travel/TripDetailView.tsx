import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  PiggyBank,
  Plus,
  Ticket,
  FileText,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Trash2,
  ExternalLink,
  Shield,
  Plane,
  Hotel,
  Car,
  Utensils,
  ShoppingBag,
  Heart,
  Settings,
  BookOpen,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/kit";
import {
  calculatePreparationProgress,
  calculateTripFinances,
  detectActivityOverlaps,
  deriveDocumentStatus,
  getExternalMapsUrl,
  DEFAULT_BUDGET_CATEGORIES,
  type TravelTrip,
  type TripStatus,
  type ActivityType,
  type ChecklistCategory,
} from "@/lib/travelEngine";

interface TripDetailViewProps {
  tripId: string;
  onBack: () => void;
  onOpenAddActivity: (dayId?: string) => void;
  onOpenAddBooking: () => void;
  onOpenAddExpense: () => void;
  onOpenAddChecklist: () => void;
  onOpenAddDocument: () => void;
  onOpenTemplateModal: () => void;
  onOpenSettings: () => void;
}

export function TripDetailView({
  tripId,
  onBack,
  onOpenAddActivity,
  onOpenAddBooking,
  onOpenAddExpense,
  onOpenAddChecklist,
  onOpenAddDocument,
  onOpenTemplateModal,
  onOpenSettings,
}: TripDetailViewProps) {
  const {
    state,
    updateTravelTrip,
    deleteItineraryItem,
    reorderItineraryItem,
    toggleTravelChecklistItem,
    deleteTravelChecklistItem,
    deleteTravelDocument,
    deleteTravelBooking,
  } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const [activeTab, setActiveTab] = useState<
    "overview" | "itinerary" | "budget" | "checklist" | "documents"
  >("overview");
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const trip = (state.travelTrips || []).find((tr) => tr.id === tripId);
  const days = useMemo(
    () => (state.travelDays || []).filter((d) => d.tripId === tripId).sort((a, b) => a.order - b.order),
    [state.travelDays, tripId]
  );
  const items = useMemo(
    () => (state.itineraryItems || []).filter((i) => i.tripId === tripId),
    [state.itineraryItems, tripId]
  );
  const bookings = useMemo(
    () => (state.travelBookings || []).filter((b) => b.tripId === tripId),
    [state.travelBookings, tripId]
  );
  const checklist = useMemo(
    () => (state.travelChecklistItems || []).filter((c) => c.tripId === tripId).sort((a, b) => a.order - b.order),
    [state.travelChecklistItems, tripId]
  );
  const documents = useMemo(
    () => (state.travelDocuments || []).filter((d) => d.tripId === tripId || !d.tripId),
    [state.travelDocuments, tripId]
  );
  const financeTxs = state.financialTransactions || [];

  // Default selected day to first day if none selected
  const activeDay = selectedDayId ? days.find((d) => d.id === selectedDayId) || days[0] : days[0];

  // Calculations
  const prep = useMemo(() => calculatePreparationProgress(checklist), [checklist]);
  const fin = useMemo(
    () => (trip ? calculateTripFinances(trip, financeTxs) : null),
    [trip, financeTxs]
  );
  const overlaps = useMemo(() => detectActivityOverlaps(items), [items]);

  if (!trip) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-ink-light">Trip not found.</p>
        <button
          onClick={onBack}
          className="rounded-full bg-surface border border-border px-4 py-2 text-xs font-bold"
        >
          {isAr ? "العودة للرحلات" : "Back to Trips"}
        </button>
      </div>
    );
  }

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "flight":
        return <Plane size={14} className="text-blue-500" />;
      case "accommodation":
        return <Hotel size={14} className="text-purple-500" />;
      case "transport":
        return <Car size={14} className="text-emerald-500" />;
      case "food":
        return <Utensils size={14} className="text-amber-500" />;
      case "shopping":
        return <ShoppingBag size={14} className="text-pink-500" />;
      case "rest":
        return <Heart size={14} className="text-rose-400" />;
      default:
        return <Sparkles size={14} className="text-hotpink" />;
    }
  };

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

  return (
    <div className="space-y-4 pb-12">
      {/* ── Top Navigation Bar ── */}
      <div className="sticky top-0 z-30 bg-surface-cream/90 backdrop-blur-md px-4 py-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="cursor-pointer flex items-center gap-1.5 text-xs font-bold text-ink-light hover:text-hotpink transition-colors"
          >
            <ArrowLeft size={16} className={isAr ? "rotate-180" : ""} />
            <span>{isAr ? "الرحلات" : "Trips"}</span>
          </button>

          {/* Status selector */}
          <select
            value={trip.status}
            onChange={(e) => updateTravelTrip(trip.id, { status: e.target.value as TripStatus })}
            className="rounded-full bg-surface border border-border px-3 py-1 text-xs font-bold text-ink outline-none focus:border-hotpink cursor-pointer"
          >
            <option value="planning">{t("statusPlanning")}</option>
            <option value="booked">{t("statusBooked")}</option>
            <option value="in_progress">{t("statusInProgress")}</option>
            <option value="completed">{t("statusCompleted")}</option>
            <option value="archived">{t("statusArchived")}</option>
          </select>
        </div>

        {/* Trip Title & Dates */}
        <div className="mt-2">
          <h2 className="text-xl font-black tracking-tight text-ink">{trip.title}</h2>
          <p className="text-xs text-ink-light flex items-center gap-1.5 mt-0.5 font-medium">
            <MapPin size={12} />
            <span>{trip.primaryCity}</span>
            <span>•</span>
            <Calendar size={12} />
            <span>
              {trip.startDate} → {trip.endDate}
            </span>
          </p>
        </div>

        {/* ── Sub-tabs Navigation (Horizontally scrollable) ── */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { key: "overview", label: t("tabOverview") },
            { key: "itinerary", label: `${t("tabItinerary")} (${items.length})` },
            { key: "budget", label: t("tabBudget") },
            { key: "checklist", label: `${t("tabChecklist")} (${prep.completedRequired}/${prep.totalRequired})` },
            { key: "documents", label: `${t("tabDocuments")} (${documents.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                "cursor-pointer shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all",
                activeTab === tab.key
                  ? "bg-hotpink text-white shadow-xs"
                  : "bg-surface text-ink-light hover:text-ink border border-border/60"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB 1: OVERVIEW ── */}
      {activeTab === "overview" && (
        <div className="px-4 space-y-4">
          {/* Quick Stats Tiles */}
          <div className="grid grid-cols-2 gap-3">
            {/* Preparation Progress Card */}
            <div className="rounded-3xl bg-card border border-border p-4 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-ink-light flex items-center gap-1">
                <CheckCircle2 size={13} className="text-hotpink" />
                <span>{t("prepProgress")}</span>
              </span>
              <p className="text-xl font-black text-ink">
                {prep.status === "not_set_up" ? t("notSetUp") : `${prep.percentage}%`}
              </p>
              <ProgressBar
                value={prep.percentage}
                className="h-1.5"
                barClass="bg-gradient-to-r from-purple-500 to-pink-500"
              />
              <p className="text-[10px] text-ink-light">
                {prep.completedRequired} of {prep.totalRequired} required items done
              </p>
            </div>

            {/* Financial Status Card */}
            <div className="rounded-3xl bg-card border border-border p-4 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-ink-light flex items-center gap-1">
                <PiggyBank size={13} className="text-amber-500" />
                <span>{t("tabBudget")}</span>
              </span>
              <p className="text-xl font-black text-ink">
                {fin ? (fin.actualSpendingMinor / 100).toLocaleString() : 0}
                <span className="text-xs font-bold text-ink-light ml-1">
                  {trip.primaryCurrency}
                </span>
              </p>
              <ProgressBar
                value={
                  fin && fin.estimatedBudgetMinor > 0
                    ? Math.min(100, (fin.actualSpendingMinor / fin.estimatedBudgetMinor) * 100)
                    : 0
                }
                className="h-1.5"
                barClass="bg-gradient-to-r from-amber-400 to-amber-600"
              />
              <p className="text-[10px] text-ink-light">
                {isAr ? "التقديري" : "Estimated"}:{" "}
                {(trip.estimatedBudgetMinor / 100).toLocaleString()} {trip.primaryCurrency}
              </p>
            </div>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onOpenAddActivity()}
              className="cursor-pointer flex flex-col items-center justify-center p-2.5 rounded-2xl bg-card border border-border hover:border-hotpink shadow-xs text-xs font-bold text-ink transition-all active:scale-95"
            >
              <Plus size={16} className="text-hotpink mb-1" />
              <span className="text-[10px]">{t("addActivityBtn")}</span>
            </button>
            <button
              type="button"
              onClick={onOpenAddBooking}
              className="cursor-pointer flex flex-col items-center justify-center p-2.5 rounded-2xl bg-card border border-border hover:border-hotpink shadow-xs text-xs font-bold text-ink transition-all active:scale-95"
            >
              <Ticket size={16} className="text-purple-500 mb-1" />
              <span className="text-[10px]">{t("addBookingBtn")}</span>
            </button>
            <button
              type="button"
              onClick={onOpenAddExpense}
              className="cursor-pointer flex flex-col items-center justify-center p-2.5 rounded-2xl bg-card border border-border hover:border-hotpink shadow-xs text-xs font-bold text-ink transition-all active:scale-95"
            >
              <PiggyBank size={16} className="text-amber-500 mb-1" />
              <span className="text-[10px]">{t("addTravelExpenseBtn")}</span>
            </button>
            <button
              type="button"
              onClick={onOpenAddChecklist}
              className="cursor-pointer flex flex-col items-center justify-center p-2.5 rounded-2xl bg-card border border-border hover:border-hotpink shadow-xs text-xs font-bold text-ink transition-all active:scale-95"
            >
              <CheckCircle2 size={16} className="text-emerald-500 mb-1" />
              <span className="text-[10px]">{t("addChecklistItemBtn")}</span>
            </button>
          </div>

          {/* Next Required Checklist Item Preview */}
          {checklist.filter((c) => !c.completed && c.required).length > 0 && (
            <div className="rounded-3xl bg-card border border-border p-4 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-ink-light flex items-center gap-1">
                <Sparkles size={13} className="text-hotpink" />
                <span>{t("nextAction")}</span>
              </span>
              {checklist
                .filter((c) => !c.completed && c.required)
                .slice(0, 2)
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleTravelChecklistItem(item.id)}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-surface hover:bg-surface/80"
                  >
                    <Circle size={16} className="text-ink-light shrink-0" />
                    <span className="text-xs font-bold text-ink flex-1">{item.title}</span>
                    <span className="text-[10px] font-bold text-hotpink bg-hotpink/10 px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                  </div>
                ))}
            </div>
          )}

          {/* Private Notes Card */}
          {trip.notes && (
            <div className="rounded-3xl bg-card border border-border p-4 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-ink-light">
                {isAr ? "ملاحظات الرحلة" : "Trip Notes"}
              </span>
              <p className="text-xs text-ink whitespace-pre-wrap leading-relaxed">{trip.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: ITINERARY (Day by Day) ── */}
      {activeTab === "itinerary" && (
        <div className="px-4 space-y-4">
          {/* Overlap Conflict Warning Banner */}
          {overlaps.length > 0 && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs space-y-1 text-amber-900 dark:text-amber-100">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle size={15} className="text-amber-500 shrink-0" />
                <span>{t("conflictWarning")}</span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-200">
                "{overlaps[0].titleA}" ({overlaps[0].timeA}) & "{overlaps[0].titleB}" ({overlaps[0].timeB})
              </p>
            </div>
          )}

          {/* Days Horizontal Picker */}
          {days.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {days.map((d, idx) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDayId(d.id)}
                  className={cn(
                    "cursor-pointer shrink-0 rounded-2xl px-4 py-2 text-center transition-all border",
                    activeDay?.id === d.id
                      ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                      : "bg-card text-ink-light border-border hover:text-ink"
                  )}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    {isAr ? `اليوم ${idx + 1}` : `Day ${idx + 1}`}
                  </p>
                  <p className="text-xs font-bold mt-0.5">
                    {d.localDate.slice(5)}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Day Activities List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-ink">
                {activeDay ? `${isAr ? "برنامج يوم" : "Schedule for"} ${activeDay.localDate}` : "Activities"}
              </h4>
              <button
                type="button"
                onClick={() => onOpenAddActivity(activeDay?.id)}
                className="cursor-pointer inline-flex items-center gap-1 rounded-full bg-hotpink/10 border border-hotpink/20 px-3 py-1 text-xs font-bold text-hotpink active:scale-95"
              >
                <Plus size={13} />
                <span>{t("addActivityBtn")}</span>
              </button>
            </div>

            {items.filter((i) => i.travelDayId === activeDay?.id).length === 0 ? (
              <div className="rounded-3xl bg-card border border-border p-8 text-center space-y-2 shadow-xs">
                <Clock size={28} className="mx-auto text-ink-light/50" />
                <p className="text-xs font-bold text-ink">{t("noItineraryTitle")}</p>
                <p className="text-[11px] text-ink-light">{t("noItinerarySubtitle")}</p>
              </div>
            ) : (
              items
                .filter((i) => i.travelDayId === activeDay?.id)
                .sort((a, b) => a.order - b.order)
                .map((act, actIdx, actArr) => (
                  <div
                    key={act.id}
                    className="rounded-3xl bg-card border border-border p-3.5 shadow-xs space-y-2 relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-surface border border-border mt-0.5">
                          {getActivityIcon(act.type)}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-ink">{act.title}</h5>
                          <p className="text-[11px] font-medium text-ink-light flex items-center gap-1 mt-0.5">
                            <Clock size={11} />
                            <span>
                              {act.allDay
                                ? t("allDay")
                                : `${act.startLocalDateTime?.slice(11, 16) || ""} - ${act.endLocalDateTime?.slice(11, 16) || ""}`}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Accessible Move Up / Down & Delete */}
                      <div className="flex items-center gap-1">
                        {actIdx > 0 && (
                          <button
                            type="button"
                            onClick={() => reorderItineraryItem(trip.id, activeDay.id, act.id, "up")}
                            className="cursor-pointer p-1 rounded-lg text-ink-light hover:text-ink"
                            title={t("moveUp")}
                          >
                            <ChevronUp size={16} />
                          </button>
                        )}
                        {actIdx < actArr.length - 1 && (
                          <button
                            type="button"
                            onClick={() => reorderItineraryItem(trip.id, activeDay.id, act.id, "down")}
                            className="cursor-pointer p-1 rounded-lg text-ink-light hover:text-ink"
                            title={t("moveDown")}
                          >
                            <ChevronDown size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteItineraryItem(act.id)}
                          className="cursor-pointer p-1 rounded-lg text-ink-light hover:text-rose-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Location with real external maps link */}
                    {(act.locationName || act.address) && (
                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                        <span className="text-ink-light flex items-center gap-1 truncate max-w-[220px]">
                          <MapPin size={12} className="shrink-0" />
                          <span>{act.locationName || act.address}</span>
                        </span>
                        <a
                          href={getExternalMapsUrl(act.address || act.locationName || "", act.latitude, act.longitude)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer inline-flex items-center gap-1 text-hotpink font-bold hover:underline"
                        >
                          <span>{t("openInMapsBtn")}</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: BUDGET (Canonical Finance-backed) ── */}
      {activeTab === "budget" && fin && (
        <div className="px-4 space-y-4">
          {/* Main Financial Summary Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-card border border-border p-4 shadow-xs">
              <span className="text-[11px] font-bold text-ink-light">
                {isAr ? "الميزانية المقدرة" : "Estimated Budget"}
              </span>
              <p className="text-lg font-black text-ink mt-1">
                {(fin.estimatedBudgetMinor / 100).toLocaleString()} {trip.primaryCurrency}
              </p>
            </div>

            <div className="rounded-3xl bg-card border border-border p-4 shadow-xs">
              <span className="text-[11px] font-bold text-ink-light">
                {isAr ? "الإنفاق الفعلي المسجل" : "Actual Spending (Finance)"}
              </span>
              <p className="text-lg font-black text-hotpink mt-1">
                {(fin.actualSpendingMinor / 100).toLocaleString()} {trip.primaryCurrency}
              </p>
            </div>
          </div>

          {/* Calm Over-budget wording if applicable */}
          {fin.isOverBudget && (
            <div className="rounded-2xl border border-pink-500/30 bg-pink-500/10 p-3.5 text-xs text-ink leading-relaxed">
              <p className="font-semibold text-hotpink flex items-center gap-1.5 mb-1">
                <Sparkles size={14} />
                <span>{isAr ? "تجاوز الميزانية برفق" : "Gentle Budget Note"}</span>
              </p>
              {t("overBudgetCalm")}
            </div>
          )}

          {/* Add Travel Expense CTA Button */}
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 py-3 text-xs font-bold text-white shadow-md active:scale-98 transition-all"
          >
            <Plus size={16} />
            <span>{t("addTravelExpenseBtn")}</span>
          </button>

          {/* Categories Breakdown */}
          <div className="rounded-3xl bg-card border border-border p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
              {isAr ? "توزيع المصاريف حسب البند" : "Spending by Category"}
            </h4>

            <div className="space-y-2.5">
              {DEFAULT_BUDGET_CATEGORIES.map((cat) => {
                const spentMinor = fin.categorySpending[cat.key] || 0;
                if (spentMinor === 0) return null;

                const pct =
                  fin.actualSpendingMinor > 0 ? (spentMinor / fin.actualSpendingMinor) * 100 : 0;

                return (
                  <div key={cat.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-ink flex items-center gap-1.5">
                        <span>{isAr ? cat.labelAr : cat.labelEn}</span>
                      </span>
                      <span className="font-bold text-ink">
                        {(spentMinor / 100).toLocaleString()} {trip.primaryCurrency}
                      </span>
                    </div>
                    <ProgressBar
                      value={pct}
                      className="h-1.5"
                      barClass="bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: CHECKLIST ── */}
      {activeTab === "checklist" && (
        <div className="px-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-ink">{t("tabChecklist")}</h4>
              <p className="text-[11px] text-ink-light">
                {prep.completedRequired} of {prep.totalRequired} required completed
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenTemplateModal}
                className="cursor-pointer inline-flex items-center gap-1 rounded-full bg-surface border border-border px-3 py-1.5 text-xs font-bold text-ink hover:text-hotpink active:scale-95 transition-all"
              >
                <span>{t("importTemplatesBtn")}</span>
              </button>

              <button
                type="button"
                onClick={onOpenAddChecklist}
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-hotpink text-white shadow-xs active:scale-95"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl bg-card border border-border p-3 shadow-xs"
              >
                <div
                  onClick={() => toggleTravelChecklistItem(item.id)}
                  className="flex items-center gap-2.5 flex-1 cursor-pointer"
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] text-white transition-all",
                      item.completed ? "border-hotpink bg-hotpink" : "border-border"
                    )}
                  >
                    {item.completed ? "✓" : ""}
                  </span>

                  <span
                    className={cn(
                      "text-xs font-medium text-ink",
                      item.completed && "line-through text-ink-light"
                    )}
                  >
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                      item.required
                        ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        : "bg-surface text-ink-light border border-border"
                    )}
                  >
                    {item.required ? (isAr ? "ضروري" : "Required") : (isAr ? "اختياري" : "Optional")}
                  </span>

                  <button
                    type="button"
                    onClick={() => deleteTravelChecklistItem(item.id)}
                    className="cursor-pointer text-ink-light/60 hover:text-rose-500 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 5: DOCUMENTS ── */}
      {activeTab === "documents" && (
        <div className="px-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-ink">{t("tabDocuments")}</h4>

            <button
              type="button"
              onClick={onOpenAddDocument}
              className="cursor-pointer inline-flex items-center gap-1 rounded-full bg-hotpink text-white px-3.5 py-1.5 text-xs font-bold shadow-xs active:scale-95"
            >
              <Plus size={14} />
              <span>{t("addDocumentBtn")}</span>
            </button>
          </div>

          {/* Privacy & Security Note */}
          <div className="rounded-2xl bg-surface border border-border p-3 flex items-start gap-2 text-xs text-ink-light">
            <Shield size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{t("privacyReassurance")}</p>
          </div>

          {/* Documents List */}
          {documents.length === 0 ? (
            <div className="rounded-3xl bg-card border border-border p-8 text-center space-y-2 shadow-xs">
              <FileText size={28} className="mx-auto text-ink-light/50" />
              <p className="text-xs font-bold text-ink">{t("noDocumentsTitle")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const status = deriveDocumentStatus(doc.expiryDate);

                return (
                  <div
                    key={doc.id}
                    className="rounded-3xl bg-card border border-border p-4 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-ink">{doc.displayName}</h5>
                        <p className="text-[11px] text-ink-light capitalize mt-0.5">
                          {doc.type} • {doc.issuingCountry || "International"}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border",
                          status === "expired"
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                            : status === "expiring_soon"
                            ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                        )}
                      >
                        {status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40 text-ink-light">
                      <span>
                        {isAr ? "تاريخ الانتهاء" : "Expiry"}: {doc.expiryDate || "N/A"}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteTravelDocument(doc.id)}
                        className="cursor-pointer text-ink-light/60 hover:text-rose-500 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
