import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useApp, type Habit } from "../../../lib/store";
import {
  getWeekDaysInfo,
  computeWeeklyProgress,
  type HabitWeekPreferences,
  type WeekStartDay,
} from "../../../lib/weeklyHabitEngine";
import { WeeklyBoardHeader } from "./WeeklyBoardHeader";
import { WeeklySummaryCard } from "./WeeklySummaryCard";
import { WeeklyIntentionCard } from "./WeeklyIntentionCard";
import { WeeklyHabitGrid } from "./WeeklyHabitGrid";
import { WeeklyTrackersRow } from "./WeeklyTrackersRow";
import { WeeklyNotesCard } from "./WeeklyNotesCard";
import { WeeklyReflectionModal } from "./WeeklyReflectionModal";
import { CustomizeBoardModal } from "./CustomizeBoardModal";

interface WeeklyHabitBoardProps {
  isAr: boolean;
  onOpenHabitDetail: (habit: Habit) => void;
}

export const WeeklyHabitBoard: React.FC<WeeklyHabitBoardProps> = ({
  isAr,
  onOpenHabitDetail,
}) => {
  const navigate = useNavigate();
  const {
    state,
    toggleHabit,
    updateHabitProgress,
    skipHabitForToday,
    setWeeklyIntention,
    setWeeklyNote,
    updateHabitWeekPreferences,
    saveWeeklyReflectionToJournal,
  } = useApp();

  const [weekOffset, setWeekOffset] = useState(0);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);

  const handleSelectDate = (dateStr: string) => {
    try {
      const chosen = new Date(dateStr + "T00:00:00");
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffDays = Math.round((chosen.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const offset = Math.trunc(diffDays / 7);
      setWeekOffset(offset);
    } catch {
      // fallback to current week
      setWeekOffset(0);
    }
  };

  const preferences: HabitWeekPreferences = {
    firstDayOfWeek: "saturday",
    groupingMode: "none",
    density: "comfortable",
    paperTheme: "blossom",
    showWater: true,
    showMood: true,
    showEnergy: true,
    showDayRating: true,
    showStreaks: true,
    showIntentionCard: true,
    showNotesCard: true,
    showFlexibleSection: true,
    ...(state.habitWeekPreferences || {}),
  };

  const firstDayOfWeek: WeekStartDay =
    preferences.firstDayOfWeek ||
    (state.prefs?.weekStartsOn as WeekStartDay) ||
    "saturday";

  const weekInfo = getWeekDaysInfo(new Date(), weekOffset, firstDayOfWeek, isAr);

  const progress = computeWeeklyProgress(state.habits, weekInfo);

  const currentIntentionRecord = state.weeklyIntentions?.[weekInfo.weekStartDate];
  const currentNotesRecord = state.weeklyNotes?.[weekInfo.weekStartDate];

  return (
    <div className="space-y-4 pb-28 sm:pb-32">
      {/* ── 1. Header & Navigation ── */}
      <WeeklyBoardHeader
        weekInfo={weekInfo}
        weekOffset={weekOffset}
        onPrevWeek={() => setWeekOffset((prev) => prev - 1)}
        onNextWeek={() => setWeekOffset((prev) => prev + 1)}
        onResetToCurrentWeek={() => setWeekOffset(0)}
        onSelectDate={handleSelectDate}
        onOpenCustomize={() => setShowCustomizeModal(true)}
        firstDayOfWeek={firstDayOfWeek}
        isAr={isAr}
      />

      {/* ── 2. Fair Progress & Encouragement Summary Card ── */}
      <WeeklySummaryCard progress={progress} isAr={isAr} />

      {/* ── 3. Weekly Intention Card (Autosaving Washi Paper) ── */}
      {preferences.showIntentionCard && (
        <WeeklyIntentionCard
          weekStartDate={weekInfo.weekStartDate}
          intentionRecord={currentIntentionRecord}
          onSaveIntention={(text, presetTag) =>
            setWeeklyIntention(weekInfo.weekStartDate, text, presetTag)
          }
          isAr={isAr}
        />
      )}

      {/* ── 4. 7-Day Habit Matrix with Sticky Habit Column, Quantitative Entry & Accessible Day List ── */}
      <WeeklyHabitGrid
        habits={state.habits}
        weekInfo={weekInfo}
        groupingMode={preferences.groupingMode || "none"}
        density={preferences.density || "comfortable"}
        showStreaks={preferences.showStreaks ?? true}
        showFlexibleSection={preferences.showFlexibleSection ?? true}
        onToggleHabit={(habitId, dateStr) => toggleHabit(habitId, dateStr)}
        onUpdateHabitProgress={(habitId, val, dateStr) =>
          updateHabitProgress(habitId, val, dateStr)
        }
        onSkipHabit={(habitId, dateStr) => skipHabitForToday(habitId, dateStr)}
        onOpenHabitDetail={onOpenHabitDetail}
        isAr={isAr}
      />

      {/* ── 5. Cross-Module Synchronized Wellness Trackers Strip ── */}
      <WeeklyTrackersRow
        weekInfo={weekInfo}
        dailyHydration={state.dailyHydration}
        dailyMoods={state.dailyMoods}
        showWater={preferences.showWater ?? true}
        showMood={preferences.showMood ?? true}
        showEnergy={preferences.showEnergy ?? true}
        showDayRating={preferences.showDayRating ?? true}
        density={preferences.density || "comfortable"}
        isAr={isAr}
      />

      {/* ── 6. Weekly Notes & Gentle Reflection Card ── */}
      {preferences.showNotesCard && (
        <WeeklyNotesCard
          weekStartDate={weekInfo.weekStartDate}
          notesRecord={currentNotesRecord}
          onSaveNotes={(text) => setWeeklyNote(weekInfo.weekStartDate, text)}
          onOpenReflectionModal={() =>
            navigate({
              to: "/journal",
              search: { tab: "reset", week: weekInfo.weekStartDate },
            })
          }
          isAr={isAr}
        />
      )}

      {/* ── 7. Customize Board Modal ── */}
      <CustomizeBoardModal
        isOpen={showCustomizeModal}
        onClose={() => setShowCustomizeModal(false)}
        preferences={preferences}
        onUpdatePreferences={(updates) => updateHabitWeekPreferences(updates)}
        isAr={isAr}
      />

      {/* ── 8. End-of-Week Guided Gentle Reflection Modal ── */}
      <WeeklyReflectionModal
        isOpen={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
        weekStartDate={weekInfo.weekStartDate}
        formattedRange={weekInfo.formattedRange}
        notesRecord={currentNotesRecord}
        journalSettings={state.journalSettings}
        onSaveAnswers={(answers) =>
          setWeeklyNote(weekInfo.weekStartDate, currentNotesRecord?.text || "", {
            reflectionAnswers: answers,
          })
        }
        onSaveToJournal={(reflectionText, answers) =>
          saveWeeklyReflectionToJournal(weekInfo.weekStartDate, reflectionText, answers)
        }
        isAr={isAr}
      />
    </div>
  );
};
