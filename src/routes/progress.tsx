import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { MobileShell } from "@/components/MobileShell";
import { Screen } from "@/components/kit";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { getProgressionOverview } from "@/lib/progressionEngine";
import { ProgressHeader, type ProgressTabId } from "@/components/progress/ProgressHeader";
import { ProgressHeroCard } from "@/components/progress/ProgressHeroCard";
import { OverviewTab } from "@/components/progress/OverviewTab";
import { ActivityTab } from "@/components/progress/ActivityTab";
import { ChallengesTab } from "@/components/progress/ChallengesTab";
import { BadgesTab } from "@/components/progress/BadgesTab";
import { ProgressSettingsModal } from "@/components/progress/ProgressSettingsModal";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "My Progress ✨ — AYXA Planner Pro" },
      {
        name: "description",
        content:
          "Centralized progression, numeric levels, growth tiers, XP activity ledger, challenges and badges.",
      },
    ],
  }),
  component: ProgressPage,
});

export function ProgressPage() {
  const { state } = useApp();
  const { lang } = useLang();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ProgressTabId>("overview");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Canonical progression calculation
  const xp = typeof state.xp === "number" ? state.xp : 0;
  const overview = useMemo(() => getProgressionOverview(xp), [xp]);
  const unlockedBadgesCount = (state.unlockedBadges || []).length;

  const handleBack = () => {
    const historyIdx = typeof window !== "undefined" ? (window.history.state?.idx ?? -1) : -1;
    if (historyIdx > 0) {
      window.history.back();
    } else {
      navigate({ to: "/more" });
    }
  };

  return (
    <MobileShell>
      <Screen className="progress-page min-h-screen bg-canvas text-ink font-sans pb-32">
        {/* Sticky Header with Back, Title, XP Chip, Settings, and 4 Tabs */}
        <ProgressHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenSettings={() => setSettingsOpen(true)}
          onBack={handleBack}
          canonicalXp={overview.totalXp}
          level={overview.level}
          tierEmoji={overview.tier.emoji}
        />

        <div className="px-4 pt-4 space-y-5">
          {/* Canonical Hero Card */}
          <ProgressHeroCard
            overview={overview}
            userName={state.user?.name}
            userAvatar={state.user?.avatar || state.user?.emoji || "🌸"}
            isGuest={state.user?.isGuest}
            unlockedBadgesCount={unlockedBadgesCount}
            settings={state.userProgressSettings}
          />

          {/* Active Tab View */}
          {activeTab === "overview" && (
            <OverviewTab
              overview={overview}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === "activity" && <ActivityTab />}

          {activeTab === "challenges" && <ChallengesTab />}

          {activeTab === "badges" && <BadgesTab />}
        </div>

        {/* Settings Modal */}
        <ProgressSettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      </Screen>
    </MobileShell>
  );
}
