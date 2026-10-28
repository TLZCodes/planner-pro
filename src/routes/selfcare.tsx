import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { useLang } from "@/lib/i18n";
import { useApp, todayKey } from "@/lib/store";
import {
  SelfCareHeader,
  type SelfCareTab,
} from "@/components/selfcare/SelfCareHeader";
import { TodayCareTab } from "@/components/selfcare/TodayCareTab";
import { MyActivitiesTab } from "@/components/selfcare/MyActivitiesTab";
import { IdeasLibraryTab } from "@/components/selfcare/IdeasLibraryTab";
import { CareHistoryTab } from "@/components/selfcare/CareHistoryTab";
import { SelfCareBingoTab } from "@/components/selfcare/bingo/SelfCareBingoTab";
import { AddCareActivityModal } from "@/components/selfcare/AddCareActivityModal";
import { StartNowSessionModal } from "@/components/selfcare/StartNowSessionModal";
import { LinkExistingSourceModal } from "@/components/selfcare/LinkExistingSourceModal";
import { SelfCareSettingsModal } from "@/components/selfcare/SelfCareSettingsModal";
import {
  type SelfCareActivity,
  type SelfCareIdea,
} from "@/lib/selfCareEngine";

export const Route = createFileRoute("/selfcare")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? (search.tab as SelfCareTab) : undefined,
  }),
  component: SelfcarePage,
});

function SelfcarePage() {
  const { lang } = useLang();
  const { state, addCareActivity, addCarePlanItemForDate } = useApp();
  const search = Route.useSearch();
  const isAr = lang === "ar";
  const today = todayKey(state.wellnessSettings?.timezone);

  const [activeTab, setActiveTab] = useState<SelfCareTab>(() => {
    if (search.tab && ["today", "activities", "bingo", "ideas", "history"].includes(search.tab)) {
      return search.tab;
    }
    return "today";
  });
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showStartNowModal, setShowStartNowModal] = useState(false);

  const [sessionTargetActivity, setSessionTargetActivity] = useState<SelfCareActivity | null>(null);
  const [sessionTargetIdea, setSessionTargetIdea] = useState<SelfCareIdea | null>(null);
  const [initialAddValues, setInitialAddValues] = useState<any>(null);
  const [initialNeedFilter, setInitialNeedFilter] = useState<string | undefined>(undefined);

  const handleStartNowActivity = (act: SelfCareActivity) => {
    setSessionTargetActivity(act);
    setSessionTargetIdea(null);
    setShowStartNowModal(true);
  };

  const handleStartNowIdea = (idea: SelfCareIdea) => {
    setSessionTargetIdea(idea);
    setSessionTargetActivity(null);
    setShowStartNowModal(true);
  };

  const handleAddIdeaForToday = (idea: SelfCareIdea) => {
    // Check if an activity for this idea already exists
    let act = (state.selfCareActivities || []).find(
      (a) => a.title.toLowerCase() === (idea.titleEn || "").toLowerCase() || a.title === idea.titleAr
    );

    let actId: string;
    if (!act) {
      actId = addCareActivity({
        title: isAr ? idea.titleAr : idea.titleEn,
        icon: idea.icon,
        category: idea.category,
        recurrenceRule: "none",
        estimatedDurationMinutes: idea.durationMinutes,
        status: "active",
        sourceType: "custom",
      });
    } else {
      actId = act.id;
      // Add a plan item for today if not present
      const existingPlan = (state.selfCarePlanItems || []).find(
        (p) => p.activityId === actId && p.localDate === today
      );
      if (!existingPlan) {
        addCarePlanItemForDate(actId, today);
      }
    }
  };

  const handleMakeRecurring = (idea: SelfCareIdea) => {
    setInitialAddValues({
      title: isAr ? idea.titleAr : idea.titleEn,
      icon: idea.icon,
      category: idea.category,
      durationMinutes: idea.durationMinutes,
      recurrenceRule: "daily",
    });
    setShowAddModal(true);
  };

  const handleNavigateToIdeas = (need?: string) => {
    setInitialNeedFilter(need);
    setActiveTab("ideas");
  };

  return (
    <MobileShell>
      <div className="min-h-screen bg-background text-ink pb-24 select-none">
        {/* Header with back navigation, date selector, add button & tabs */}
        <SelfCareHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onOpenAdd={() => {
            setInitialAddValues(null);
            setShowAddModal(true);
          }}
          onOpenSettings={() => setShowSettingsModal(true)}
        />

        {/* Tab Contents */}
        {activeTab === "today" && (
          <TodayCareTab
            selectedDate={selectedDate}
            onOpenAdd={() => {
              setInitialAddValues(null);
              setShowAddModal(true);
            }}
            onStartNow={handleStartNowActivity}
            onNavigateToIdeas={handleNavigateToIdeas}
          />
        )}

        {activeTab === "activities" && (
          <MyActivitiesTab
            onOpenAdd={() => {
              setInitialAddValues(null);
              setShowAddModal(true);
            }}
          />
        )}

        {activeTab === "bingo" && <SelfCareBingoTab />}

        {activeTab === "ideas" && (
          <IdeasLibraryTab
            initialNeedFilter={initialNeedFilter}
            onStartNowIdea={handleStartNowIdea}
            onAddIdeaForToday={handleAddIdeaForToday}
            onMakeRecurring={handleMakeRecurring}
          />
        )}

        {activeTab === "history" && <CareHistoryTab />}

        {/* Modals */}
        <AddCareActivityModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onOpenLinkExisting={() => setShowLinkModal(true)}
          initialValues={initialAddValues}
        />

        <StartNowSessionModal
          isOpen={showStartNowModal}
          onClose={() => setShowStartNowModal(false)}
          activity={sessionTargetActivity}
          idea={sessionTargetIdea}
        />

        <LinkExistingSourceModal
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
        />

        <SelfCareSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      </div>
    </MobileShell>
  );
}
export default SelfcarePage;
