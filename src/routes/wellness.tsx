import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { WellnessHeader, type WellnessTab } from "@/components/wellness/WellnessHeader";
import { TodayTab } from "@/components/wellness/TodayTab";
import { TrackersTab } from "@/components/wellness/TrackersTab";
import { MovementTab } from "@/components/wellness/MovementTab";
import { InsightsTab } from "@/components/wellness/InsightsTab";
import { AddHydrationModal } from "@/components/wellness/AddHydrationModal";
import { HydrationHistoryModal } from "@/components/wellness/HydrationHistoryModal";
import { LogSleepModal } from "@/components/wellness/LogSleepModal";
import { LogStepsModal } from "@/components/wellness/LogStepsModal";
import { LogWorkoutModal } from "@/components/wellness/LogWorkoutModal";
import { WellnessSettingsModal } from "@/components/wellness/WellnessSettingsModal";

export const Route = createFileRoute("/wellness")({
  head: () => ({
    meta: [
      { title: "My Wellness — AYXA Planner" },
      {
        name: "description",
        content: "Care for your body, hydration, movement, sleep, and energy gently.",
      },
    ],
  }),
  component: WellnessPage,
});

function WellnessPage() {
  const [activeTab, setActiveTab] = useState<WellnessTab>("today");

  // Modals state
  const [isAddHydrationOpen, setIsAddHydrationOpen] = useState(false);
  const [isHydrationHistoryOpen, setIsHydrationHistoryOpen] = useState(false);
  const [isLogSleepOpen, setIsLogSleepOpen] = useState(false);
  const [isLogStepsOpen, setIsLogStepsOpen] = useState(false);
  const [isLogWorkoutOpen, setIsLogWorkoutOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <MobileShell>
      <div className="min-h-screen bg-background text-ink pb-24 select-none">
        {/* Header with Navigation & Tabs */}
        <WellnessHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Tab Content */}
        <main className="max-w-md mx-auto">
          {activeTab === "today" && (
            <TodayTab
              onOpenAddHydration={() => setIsAddHydrationOpen(true)}
              onOpenHydrationHistory={() => setIsHydrationHistoryOpen(true)}
              onOpenLogSleep={() => setIsLogSleepOpen(true)}
              onOpenLogSteps={() => setIsLogStepsOpen(true)}
              onOpenLogWorkout={() => setIsLogWorkoutOpen(true)}
            />
          )}

          {activeTab === "trackers" && (
            <TrackersTab
              onOpenAddHydration={() => setIsAddHydrationOpen(true)}
              onOpenHydrationHistory={() => setIsHydrationHistoryOpen(true)}
              onOpenLogSleep={() => setIsLogSleepOpen(true)}
              onOpenLogSteps={() => setIsLogStepsOpen(true)}
            />
          )}

          {activeTab === "movement" && (
            <MovementTab
              onOpenLogWorkout={() => setIsLogWorkoutOpen(true)}
            />
          )}

          {activeTab === "insights" && <InsightsTab />}
        </main>

        {/* Modals Coordinator */}
        <AddHydrationModal
          isOpen={isAddHydrationOpen}
          onClose={() => setIsAddHydrationOpen(false)}
        />

        <HydrationHistoryModal
          isOpen={isHydrationHistoryOpen}
          onClose={() => setIsHydrationHistoryOpen(false)}
        />

        <LogSleepModal
          isOpen={isLogSleepOpen}
          onClose={() => setIsLogSleepOpen(false)}
        />

        <LogStepsModal
          isOpen={isLogStepsOpen}
          onClose={() => setIsLogStepsOpen(false)}
        />

        <LogWorkoutModal
          isOpen={isLogWorkoutOpen}
          onClose={() => setIsLogWorkoutOpen(false)}
        />

        <WellnessSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </MobileShell>
  );
}
