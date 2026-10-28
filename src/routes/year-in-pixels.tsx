import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { useLang } from "@/lib/i18n";
import { useApp, todayKey } from "@/lib/store";
import {
  PixelsHeader,
  type PixelsTab,
} from "@/components/pixels/PixelsHeader";
import { SummaryStrip } from "@/components/pixels/SummaryStrip";
import { MoodLegend } from "@/components/pixels/MoodLegend";
import { YearView } from "@/components/pixels/YearView";
import { MonthView } from "@/components/pixels/MonthView";
import { InsightsTab } from "@/components/pixels/InsightsTab";
import { DaySheetModal } from "@/components/pixels/DaySheetModal";
import { PixelsSettingsModal } from "@/components/pixels/PixelsSettingsModal";
import { ExportPixelsModal } from "@/components/pixels/ExportPixelsModal";
import {
  MOOD_PALETTES,
  calculateMoodStats,
  calculateGentleStreak,
  type MoodPalette,
} from "@/lib/pixelsEngine";

export const Route = createFileRoute("/year-in-pixels")({
  head: () => ({
    meta: [
      { title: "Year in Pixels — AYXA Planner Pro" },
      {
        name: "description",
        content: "Track your whole year in real 12-month calendar grids — one gentle pixel for every day.",
      },
    ],
  }),
  component: YearInPixelsPage,
});

export function YearInPixelsPage() {
  const { lang } = useLang();
  const { state } = useApp();
  const isAr = lang === "ar";
  const todayStr = todayKey(state.wellnessSettings?.timezone);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [activeTab, setActiveTab] = useState<PixelsTab>("year");
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(currentMonth);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Modals
  const [isDaySheetOpen, setIsDaySheetOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Settings & Palette
  const settings = state.yearInPixelsSettings || {
    selectedPaletteId: "default",
    weekStartPreference: "mon",
    showStreak: true,
  };

  const palette: MoodPalette =
    MOOD_PALETTES[settings.selectedPaletteId || "default"] || MOOD_PALETTES.default;

  // Memoized stats & streak
  const stats = useMemo(
    () => calculateMoodStats(state.dailyMoods || {}, selectedYear, selectedMonthIndex),
    [state.dailyMoods, selectedYear, selectedMonthIndex]
  );

  const streak = useMemo(
    () => calculateGentleStreak(state.dailyMoods || {}, todayStr),
    [state.dailyMoods, todayStr]
  );

  const handleJumpToToday = () => {
    setSelectedYear(currentYear);
    setSelectedMonthIndex(currentMonth);
    setSelectedDate(todayStr);
  };

  const handleSelectMonthFromYearView = (mIdx: number) => {
    setSelectedMonthIndex(mIdx);
    setActiveTab("month");
  };

  const handleSelectDate = (dateKey: string) => {
    setSelectedDate(dateKey);
    setIsDaySheetOpen(true);
  };

  const handleCheckInToday = () => {
    setSelectedDate(todayStr);
    setIsDaySheetOpen(true);
  };

  return (
    <MobileShell>
      <div className="min-h-screen bg-background text-ink pb-24 select-none">
        {/* Header with Navigation, dynamic year, tabs & settings */}
        <PixelsHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          onJumpToToday={handleJumpToToday}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
        />

        {/* Compact Summary Strip */}
        <SummaryStrip
          stats={stats}
          streak={streak}
          showStreak={settings.showStreak !== false}
          selectedYear={selectedYear}
        />

        {/* Expandable Mood Legend (Year & Month tabs) */}
        {activeTab !== "insights" && (
          <div className="pt-2">
            <MoodLegend palette={palette} />
          </div>
        )}

        {/* 3 Main Tab Views */}
        {activeTab === "year" && (
          <YearView
            year={selectedYear}
            dailyMoods={state.dailyMoods || {}}
            legacySnapshots={state.legacyMoodSnapshots || {}}
            palette={palette}
            weekStart={settings.weekStartPreference || "mon"}
            todayStr={todayStr}
            onSelectMonth={handleSelectMonthFromYearView}
            onSelectDate={handleSelectDate}
          />
        )}

        {activeTab === "month" && (
          <MonthView
            year={selectedYear}
            monthIndex={selectedMonthIndex}
            onMonthChange={setSelectedMonthIndex}
            dailyMoods={state.dailyMoods || {}}
            legacySnapshots={state.legacyMoodSnapshots || {}}
            palette={palette}
            weekStart={settings.weekStartPreference || "mon"}
            todayStr={todayStr}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        )}

        {activeTab === "insights" && (
          <InsightsTab
            stats={stats}
            year={selectedYear}
            palette={palette}
            dailyMoods={state.dailyMoods || {}}
            onCheckInToday={handleCheckInToday}
          />
        )}

        {/* Modals */}
        <DaySheetModal
          isOpen={isDaySheetOpen}
          onClose={() => setIsDaySheetOpen(false)}
          dateKey={selectedDate}
          todayStr={todayStr}
          palette={palette}
        />

        <PixelsSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        <ExportPixelsModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          year={selectedYear}
          palette={palette}
          dailyMoods={state.dailyMoods || {}}
          stats={stats}
        />
      </div>
    </MobileShell>
  );
}

export default YearInPixelsPage;
