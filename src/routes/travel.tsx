import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Compass,
  ArrowLeft,
  Plus,
  Settings,
  Sparkles,
  Search,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { TravelDashboard } from "@/components/travel/TravelDashboard";
import { TripDetailView } from "@/components/travel/TripDetailView";
import { BucketListTab } from "@/components/travel/BucketListTab";
import { PastTripsTab } from "@/components/travel/PastTripsTab";
import { CreateTripModal } from "@/components/travel/modals/CreateTripModal";
import { AddActivityModal } from "@/components/travel/modals/AddActivityModal";
import { AddBookingModal } from "@/components/travel/modals/AddBookingModal";
import { AddTravelExpenseModal } from "@/components/travel/modals/AddTravelExpenseModal";
import { AddBucketListItemModal } from "@/components/travel/modals/AddBucketListItemModal";
import { AddChecklistItemModal } from "@/components/travel/modals/AddChecklistItemModal";
import { AddDocumentModal } from "@/components/travel/modals/AddDocumentModal";
import { ChecklistTemplateModal } from "@/components/travel/modals/ChecklistTemplateModal";
import { SendToJournalModal } from "@/components/travel/modals/SendToJournalModal";
import { TripCompletionModal } from "@/components/travel/modals/TripCompletionModal";
import { TravelSettingsModal } from "@/components/travel/modals/TravelSettingsModal";
import type { BucketListItem, TravelTrip } from "@/lib/travelEngine";

interface TravelSearchParams {
  tab?: "upcoming" | "bucket_list" | "past";
  tripId?: string;
}

export const Route = createFileRoute("/travel")({
  validateSearch: (search: Record<string, unknown>): TravelSearchParams => ({
    tab: (search.tab as TravelSearchParams["tab"]) || "upcoming",
    tripId: (search.tripId as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Travel Planner ✈️ — AYXA Planner Pro" },
      {
        name: "description",
        content: "Dream it, plan it, go with peace of mind. Private end-to-end travel workspace.",
      },
    ],
  }),
  component: TravelPage,
});

function TravelPage() {
  const { state, createTravelTrip } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const search = Route.useSearch();

  // Navigation states
  const [activeSection, setActiveSection] = useState<"upcoming" | "bucket_list" | "past">(
    search.tab || "upcoming"
  );
  const [selectedTripId, setSelectedTripId] = useState<string | null>(search.tripId || null);

  // Sync search params with state
  useEffect(() => {
    if (search.tripId) {
      setSelectedTripId(search.tripId);
    }
    if (search.tab) {
      setActiveSection(search.tab);
    }
  }, [search.tripId, search.tab]);

  // Modals state
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [activityDayId, setActivityDayId] = useState<string | undefined>(undefined);
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddBucketItemOpen, setIsAddBucketItemOpen] = useState(false);
  const [isAddChecklistOpen, setIsAddChecklistOpen] = useState(false);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [journalMemoryId, setJournalMemoryId] = useState<string | null>(null);
  const [completionTripId, setCompletionTripId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [bucketConversionItem, setBucketConversionItem] = useState<BucketListItem | null>(null);

  // Handle Bucket List to Trip Conversion
  const handleConvertBucketItem = (item: BucketListItem) => {
    setBucketConversionItem(item);
    setIsCreateTripOpen(true);
  };

  // Handle Duplicate Trip
  const handleDuplicateTrip = (trip: TravelTrip) => {
    const today = new Date().toISOString().slice(0, 10);
    const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const newId = createTravelTrip({
      title: `${trip.title} (Copy)`,
      primaryCity: trip.primaryCity,
      countryCode: trip.countryCode,
      startDate: today,
      endDate: end,
      travelerCount: trip.travelerCount,
      status: "planning",
      primaryCurrency: trip.primaryCurrency,
      estimatedBudgetMinor: trip.estimatedBudgetMinor,
      notes: trip.notes,
    });
    setSelectedTripId(newId);
  };

  return (
    <MobileShell>
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="relative min-h-screen bg-surface-cream text-ink animate-fade-in font-sans"
      >
        {/* ── Top Header App Bar ── */}
        {!selectedTripId && (
          <div className="sticky top-0 z-30 bg-surface-cream/80 backdrop-blur-md px-4 pt-3 pb-2 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black tracking-tight text-ink flex items-center gap-1.5">
                  <Compass size={20} className="text-hotpink" />
                  <span>{t("travelTitle")}</span>
                </h1>
                <p className="text-[11px] font-medium text-ink-light">
                  {t("travelSubtitle")}
                </p>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="cursor-pointer p-2 rounded-full text-ink-light hover:text-ink hover:bg-surface transition-all"
                  title="Travel Settings"
                >
                  <Settings size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBucketConversionItem(null);
                    setIsCreateTripOpen(true);
                  }}
                  className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md active:scale-95 transition-all"
                  title={t("createTripBtn")}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Main View: Detail or Dashboard ── */}
        <div className="pt-3">
          {selectedTripId ? (
            <TripDetailView
              tripId={selectedTripId}
              onBack={() => setSelectedTripId(null)}
              onOpenAddActivity={(dayId) => {
                setActivityDayId(dayId);
                setIsAddActivityOpen(true);
              }}
              onOpenAddBooking={() => setIsAddBookingOpen(true)}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onOpenAddChecklist={() => setIsAddChecklistOpen(true)}
              onOpenAddDocument={() => setIsAddDocumentOpen(true)}
              onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          ) : (
            <>
              {activeSection === "upcoming" && (
                <TravelDashboard
                  onSelectTrip={(id) => setSelectedTripId(id)}
                  onOpenCreateTrip={() => {
                    setBucketConversionItem(null);
                    setIsCreateTripOpen(true);
                  }}
                  onOpenAddBucketItem={() => setIsAddBucketItemOpen(true)}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  activeSection={activeSection}
                  onChangeSection={setActiveSection}
                />
              )}

              {activeSection === "bucket_list" && (
                <>
                  <TravelDashboard
                    onSelectTrip={(id) => setSelectedTripId(id)}
                    onOpenCreateTrip={() => {
                      setBucketConversionItem(null);
                      setIsCreateTripOpen(true);
                    }}
                    onOpenAddBucketItem={() => setIsAddBucketItemOpen(true)}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    activeSection={activeSection}
                    onChangeSection={setActiveSection}
                  />
                  <BucketListTab
                    onOpenAddModal={() => setIsAddBucketItemOpen(true)}
                    onConvertItem={handleConvertBucketItem}
                  />
                </>
              )}

              {activeSection === "past" && (
                <>
                  <TravelDashboard
                    onSelectTrip={(id) => setSelectedTripId(id)}
                    onOpenCreateTrip={() => {
                      setBucketConversionItem(null);
                      setIsCreateTripOpen(true);
                    }}
                    onOpenAddBucketItem={() => setIsAddBucketItemOpen(true)}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    activeSection={activeSection}
                    onChangeSection={setActiveSection}
                  />
                  <PastTripsTab
                    onSelectTrip={(id) => setSelectedTripId(id)}
                    onOpenJournalShare={(memId) => setJournalMemoryId(memId)}
                    onDuplicateTrip={handleDuplicateTrip}
                    onCompleteTrip={(id) => setCompletionTripId(id)}
                  />
                </>
              )}
            </>
          )}
        </div>

        {/* ── Coordinated Modals ── */}
        <CreateTripModal
          isOpen={isCreateTripOpen}
          onClose={() => {
            setIsCreateTripOpen(false);
            setBucketConversionItem(null);
          }}
          onTripCreated={(newId) => setSelectedTripId(newId)}
          initialDestination={bucketConversionItem?.destination || ""}
        />

        {selectedTripId && (
          <>
            <AddActivityModal
              isOpen={isAddActivityOpen}
              onClose={() => setIsAddActivityOpen(false)}
              tripId={selectedTripId}
              defaultDayId={activityDayId}
            />

            <AddBookingModal
              isOpen={isAddBookingOpen}
              onClose={() => setIsAddBookingOpen(false)}
              tripId={selectedTripId}
            />

            <AddTravelExpenseModal
              isOpen={isAddExpenseOpen}
              onClose={() => setIsAddExpenseOpen(false)}
              tripId={selectedTripId}
            />

            <AddChecklistItemModal
              isOpen={isAddChecklistOpen}
              onClose={() => setIsAddChecklistOpen(false)}
              tripId={selectedTripId}
            />

            <AddDocumentModal
              isOpen={isAddDocumentOpen}
              onClose={() => setIsAddDocumentOpen(false)}
              tripId={selectedTripId}
            />

            <ChecklistTemplateModal
              isOpen={isTemplateModalOpen}
              onClose={() => setIsTemplateModalOpen(false)}
              tripId={selectedTripId}
            />
          </>
        )}

        <AddBucketListItemModal
          isOpen={isAddBucketItemOpen}
          onClose={() => setIsAddBucketItemOpen(false)}
        />

        <SendToJournalModal
          isOpen={journalMemoryId !== null}
          onClose={() => setJournalMemoryId(null)}
          memoryId={journalMemoryId}
        />

        <TripCompletionModal
          isOpen={completionTripId !== null}
          onClose={() => setCompletionTripId(null)}
          tripId={completionTripId}
        />

        <TravelSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </MobileShell>
  );
}

export default TravelPage;
