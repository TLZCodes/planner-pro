import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  formatLocalDateStr,
  getWeekDaysInfo,
  isHabitScheduledForDay,
  isFlexibleHabit,
  getHabitCellData,
  computeWeeklyProgress,
  groupHabits,
  getFlexibleHabitWeekCount,
  getWaterStatusForDate,
  getMoodStatusForDate,
} from "../src/lib/weeklyHabitEngine.ts";

describe("Weekly Habit Board Engine", () => {
  // ── 1. Week Boundaries and Date Math ──
  describe("Week Boundaries & Week Starts", () => {
    const fixedWednesday = new Date("2026-10-14T10:00:00"); // A Wednesday

    it("correctly starts on Saturday when firstDayOfWeek is saturday", () => {
      const info = getWeekDaysInfo(fixedWednesday, 0, "saturday", false);
      assert.equal(info.days.length, 7);
      // The Saturday prior to Wednesday Oct 14, 2026 is Oct 10, 2026
      assert.equal(info.weekStartDate, "2026-10-10");
      assert.equal(info.weekEndDate, "2026-10-16");
      assert.equal(info.days[0].dayName, "Sat");
      assert.equal(info.days[6].dayName, "Fri");
    });

    it("correctly starts on Sunday when firstDayOfWeek is sunday", () => {
      const info = getWeekDaysInfo(fixedWednesday, 0, "sunday", false);
      assert.equal(info.days.length, 7);
      // The Sunday prior to Wednesday Oct 14, 2026 is Oct 11, 2026
      assert.equal(info.weekStartDate, "2026-10-11");
      assert.equal(info.weekEndDate, "2026-10-17");
      assert.equal(info.days[0].dayName, "Sun");
      assert.equal(info.days[6].dayName, "Sat");
    });

    it("correctly starts on Monday when firstDayOfWeek is monday", () => {
      const info = getWeekDaysInfo(fixedWednesday, 0, "monday", false);
      assert.equal(info.days.length, 7);
      // The Monday prior to Wednesday Oct 14, 2026 is Oct 12, 2026
      assert.equal(info.weekStartDate, "2026-10-12");
      assert.equal(info.weekEndDate, "2026-10-18");
      assert.equal(info.days[0].dayName, "Mon");
      assert.equal(info.days[6].dayName, "Sun");
    });

    it("navigates previous and future weeks accurately", () => {
      const pastInfo = getWeekDaysInfo(fixedWednesday, -1, "saturday", false);
      assert.equal(pastInfo.isPastWeek, true);
      assert.equal(pastInfo.isCurrentWeek, false);
      assert.equal(pastInfo.isFutureWeek, false);
      assert.equal(pastInfo.weekStartDate, "2026-10-03");

      const futureInfo = getWeekDaysInfo(fixedWednesday, 1, "saturday", false);
      assert.equal(futureInfo.isPastWeek, false);
      assert.equal(futureInfo.isCurrentWeek, false);
      assert.equal(futureInfo.isFutureWeek, true);
      assert.equal(futureInfo.weekStartDate, "2026-10-17");
    });

    it("formats localized range in Arabic and English", () => {
      const enInfo = getWeekDaysInfo(fixedWednesday, 0, "saturday", false);
      assert.match(enInfo.formattedRange, /Oct/);

      const arInfo = getWeekDaysInfo(fixedWednesday, 0, "saturday", true);
      assert.match(arInfo.formattedRange, /أكتوبر/);
      assert.equal(arInfo.days[0].dayName, "سبت");
    });
  });

  // ── 2. Habit Cell States & Statuses ──
  describe("Habit Cell Status Resolution", () => {
    const mockHabit = {
      id: "h_water",
      name: "Morning Hydration",
      category: "Health",
      status: "active",
      streak: 5,
      targetValue: 2,
      unit: "glasses",
      trackingType: "count",
      scheduledDays: [0, 1, 2, 3, 4, 5, 6],
      startDate: "2026-10-01",
      history: {},
    };

    it("returns 'not_scheduled' for dates before startDate", () => {
      const day = {
        dateStr: "2026-09-25",
        dayNum: 25,
        dayName: "Fri",
        dayShort: "Fr",
        isToday: false,
        isPast: true,
        isFuture: false,
        dayOfWeekIndex: 5,
      };
      const cell = getHabitCellData(mockHabit, day);
      assert.equal(cell.status, "not_scheduled");
      assert.equal(cell.canToggle, false);
    });

    it("returns 'paused' when habit status is paused", () => {
      const pausedHabit = { ...mockHabit, status: "paused" };
      const day = {
        dateStr: "2026-10-12",
        dayNum: 12,
        dayName: "Mon",
        dayShort: "Mo",
        isToday: true,
        isPast: false,
        isFuture: false,
        dayOfWeekIndex: 1,
      };
      const cell = getHabitCellData(pausedHabit, day);
      assert.equal(cell.status, "paused");
      assert.equal(cell.canToggle, false);
    });

    it("returns 'skipped' when cell was marked skipped", () => {
      const skippedHabit = {
        ...mockHabit,
        history: {
          "2026-10-11": { value: 0, completed: false, skipped: true },
        },
      };
      const day = {
        dateStr: "2026-10-11",
        dayNum: 11,
        dayName: "Sun",
        dayShort: "Su",
        isToday: false,
        isPast: true,
        isFuture: false,
        dayOfWeekIndex: 0,
      };
      const cell = getHabitCellData(skippedHabit, day);
      assert.equal(cell.status, "skipped");
      assert.equal(cell.isSkipped, true);
      assert.equal(cell.isCompleted, false);
    });

    it("returns 'partial_progress' for quantitative habits partially logged", () => {
      const partialHabit = {
        ...mockHabit,
        history: {
          "2026-10-11": { value: 1, completed: false }, // 1 of 2 glasses
        },
      };
      const day = {
        dateStr: "2026-10-11",
        dayNum: 11,
        dayName: "Sun",
        dayShort: "Su",
        isToday: false,
        isPast: true,
        isFuture: false,
        dayOfWeekIndex: 0,
      };
      const cell = getHabitCellData(partialHabit, day);
      assert.equal(cell.status, "partial_progress");
      assert.equal(cell.isPartial, true);
      assert.equal(cell.currentVal, 1);
      assert.equal(cell.targetVal, 2);
    });

    it("returns 'completed' when value equals or exceeds target", () => {
      const completedHabit = {
        ...mockHabit,
        history: {
          "2026-10-11": { value: 2, completed: true },
        },
      };
      const day = {
        dateStr: "2026-10-11",
        dayNum: 11,
        dayName: "Sun",
        dayShort: "Su",
        isToday: false,
        isPast: true,
        isFuture: false,
        dayOfWeekIndex: 0,
      };
      const cell = getHabitCellData(completedHabit, day);
      assert.equal(cell.status, "completed");
      assert.equal(cell.isCompleted, true);
    });

    it("returns 'future_scheduled' without allowing toggle on future days", () => {
      const day = {
        dateStr: "2026-10-25",
        dayNum: 25,
        dayName: "Sun",
        dayShort: "Su",
        isToday: false,
        isPast: false,
        isFuture: true,
        dayOfWeekIndex: 0,
      };
      const cell = getHabitCellData(mockHabit, day);
      assert.equal(cell.status, "future_scheduled");
      assert.equal(cell.canToggle, false);
    });
  });

  // ── 3. Fair Progress & Summary Calculations ──
  describe("Fair Progress Calculation", () => {
    it("excludes future days from denominator in current week", () => {
      // Mock week: 3 days past, 1 day today, 3 days future
      const mockWeekInfo = {
        weekStartDate: "2026-10-10",
        weekEndDate: "2026-10-16",
        isCurrentWeek: true,
        isPastWeek: false,
        isFutureWeek: false,
        formattedRange: "Oct 10 – 16",
        days: [
          { dateStr: "2026-10-10", dayNum: 10, dayName: "Sat", dayShort: "Sa", isToday: false, isPast: true, isFuture: false, dayOfWeekIndex: 6 },
          { dateStr: "2026-10-11", dayNum: 11, dayName: "Sun", dayShort: "Su", isToday: false, isPast: true, isFuture: false, dayOfWeekIndex: 0 },
          { dateStr: "2026-10-12", dayNum: 12, dayName: "Mon", dayShort: "Mo", isToday: false, isPast: true, isFuture: false, dayOfWeekIndex: 1 },
          { dateStr: "2026-10-13", dayNum: 13, dayName: "Tue", dayShort: "Tu", isToday: true, isPast: false, isFuture: false, dayOfWeekIndex: 2 },
          { dateStr: "2026-10-14", dayNum: 14, dayName: "Wed", dayShort: "We", isToday: false, isPast: false, isFuture: true, dayOfWeekIndex: 3 },
          { dateStr: "2026-10-15", dayNum: 15, dayName: "Thu", dayShort: "Th", isToday: false, isPast: false, isFuture: true, dayOfWeekIndex: 4 },
          { dateStr: "2026-10-16", dayNum: 16, dayName: "Fri", dayShort: "Fr", isToday: false, isPast: false, isFuture: true, dayOfWeekIndex: 5 },
        ],
      };

      const dailyHabit = {
        id: "h_daily",
        name: "Morning Walk",
        category: "Health",
        status: "active",
        scheduledDays: [0, 1, 2, 3, 4, 5, 6],
        targetValue: 1,
        history: {
          "2026-10-10": { value: 1, completed: true },
          "2026-10-11": { value: 1, completed: true },
          "2026-10-12": { value: 1, completed: true },
          "2026-10-13": { value: 1, completed: true },
        },
      };

      const result = computeWeeklyProgress([dailyHabit], mockWeekInfo);

      // 4 days elapsed (Sat, Sun, Mon, Tue) -> dueOccurrences must be exactly 4, NOT 7!
      assert.equal(result.dueOccurrences, 4);
      assert.equal(result.completedOccurrences, 4);
      assert.equal(result.percentage, 100);
      assert.equal(result.totalWholeWeekPossible, 7);
      assert.equal(result.daysWithCheckinsCount, 4);
    });

    it("evaluates past weeks against full week due occurrences", () => {
      const mockPastWeek = {
        weekStartDate: "2026-10-03",
        weekEndDate: "2026-10-09",
        isCurrentWeek: false,
        isPastWeek: true,
        isFutureWeek: false,
        formattedRange: "Oct 3 – 9",
        days: [0, 1, 2, 3, 4, 5, 6].map((i) => ({
          dateStr: `2026-10-0${3 + i}`,
          dayNum: 3 + i,
          dayName: "Day",
          dayShort: "D",
          isToday: false,
          isPast: true,
          isFuture: false,
          dayOfWeekIndex: (6 + i) % 7,
        })),
      };

      const habit = {
        id: "h1",
        name: "Reading",
        status: "active",
        scheduledDays: [0, 1, 2, 3, 4, 5, 6],
        targetValue: 1,
        history: {
          "2026-10-03": { value: 1, completed: true },
          "2026-10-04": { value: 1, completed: true },
        },
      };

      const result = computeWeeklyProgress([habit], mockPastWeek);
      assert.equal(result.dueOccurrences, 7);
      assert.equal(result.completedOccurrences, 2);
      assert.equal(result.percentage, Math.round((2 / 7) * 100)); // 29%
      assert.equal(result.daysWithCheckinsCount, 2);
    });

    it("provides planned counts and zero percentage for future weeks", () => {
      const mockFutureWeek = {
        weekStartDate: "2026-10-24",
        weekEndDate: "2026-10-30",
        isCurrentWeek: false,
        isPastWeek: false,
        isFutureWeek: true,
        formattedRange: "Oct 24 – 30",
        days: [0, 1, 2, 3, 4, 5, 6].map((i) => ({
          dateStr: `2026-10-${24 + i}`,
          dayNum: 24 + i,
          dayName: "Day",
          dayShort: "D",
          isToday: false,
          isPast: false,
          isFuture: true,
          dayOfWeekIndex: (6 + i) % 7,
        })),
      };

      const habit = {
        id: "h1",
        name: "Reading",
        status: "active",
        scheduledDays: [0, 1, 2, 3, 4, 5, 6],
        targetValue: 1,
        history: {},
      };

      const result = computeWeeklyProgress([habit], mockFutureWeek);
      assert.equal(result.dueOccurrences, 0);
      assert.equal(result.completedOccurrences, 0);
      assert.equal(result.percentage, 0);
      assert.equal(result.totalWholeWeekPossible, 7);
      assert.equal(result.hasEligibleDue, false);
    });

    it("replaces religious ranking with neutral daysWithCheckinsCount", () => {
      const weekInfo = {
        weekStartDate: "2026-10-10",
        weekEndDate: "2026-10-16",
        isCurrentWeek: false,
        isPastWeek: true,
        isFutureWeek: false,
        formattedRange: "Oct 10 – 16",
        days: [0, 1, 2, 3, 4, 5, 6].map((i) => ({
          dateStr: `2026-10-${10 + i}`,
          dayNum: 10 + i,
          dayName: "Day",
          dayShort: "D",
          isToday: false,
          isPast: true,
          isFuture: false,
          dayOfWeekIndex: (6 + i) % 7,
        })),
      };

      const prayerHabit = {
        id: "h_prayer",
        name: "Prayer",
        category: "Deen",
        status: "active",
        scheduledDays: [0, 1, 2, 3, 4, 5, 6],
        targetValue: 1,
        history: {
          "2026-10-10": { value: 1, completed: true },
          "2026-10-11": { value: 1, completed: true },
          "2026-10-12": { value: 1, completed: true },
        },
      };

      const result = computeWeeklyProgress([prayerHabit], weekInfo);
      // topHabitName must not be present or used to rank prayers
      assert.equal(result.topHabitName, undefined);
      assert.equal(result.daysWithCheckinsCount, 3);
    });

    it("respects skip policy: a skipped occurrence is not counted as completed", () => {
      const mockWeek = {
        weekStartDate: "2026-10-10",
        weekEndDate: "2026-10-16",
        isCurrentWeek: false,
        isPastWeek: true,
        isFutureWeek: false,
        formattedRange: "Oct 10 – 16",
        days: [0, 1, 2, 3, 4, 5, 6].map((i) => ({
          dateStr: `2026-10-${10 + i}`,
          dayNum: 10 + i,
          dayName: "Day",
          dayShort: "D",
          isToday: false,
          isPast: true,
          isFuture: false,
          dayOfWeekIndex: (6 + i) % 7,
        })),
      };

      const habit = {
        id: "h_skip",
        name: "Gym",
        status: "active",
        scheduledDays: [0, 1, 2, 3, 4, 5, 6],
        targetValue: 1,
        history: {
          "2026-10-10": { value: 0, completed: false, skipped: true },
          "2026-10-11": { value: 0, completed: false, skipped: true },
        },
      };

      const result = computeWeeklyProgress([habit], mockWeek);
      assert.equal(result.completedOccurrences, 0);
      assert.equal(result.percentage, 0);
      assert.equal(result.daysWithCheckinsCount, 0);
    });
  });

  // ── 4. Cross-Module Synchronized Wellness Helpers ──
  describe("Synchronized Wellness Read Models", () => {
    it("reads water hydration from canonical store without mutating habits", () => {
      const dailyHydration = {
        "2026-10-12": {
          userId: "usr_test",
          localDate: "2026-10-12",
          consumedMl: 2250,
          targetMl: 2000,
          preferredGlassMl: 250,
          updatedAt: new Date().toISOString(),
        },
      };

      const status = getWaterStatusForDate("2026-10-12", dailyHydration);
      assert.equal(status.consumedMl, 2250);
      assert.equal(status.targetMl, 2000);
      assert.equal(status.isMet, true);
      assert.equal(status.percentage, 100);
    });

    it("reads daily mood and energy levels accurately", () => {
      const dailyMoods = {
        "2026-10-12": {
          date: "2026-10-12",
          mood: "grateful",
          energy: "high",
          dayRating: 5,
        },
      };

      const mood = getMoodStatusForDate("2026-10-12", dailyMoods);
      assert.equal(mood.hasRecord, true);
      assert.equal(mood.mood, "grateful");
      assert.equal(mood.energy, "high");
      assert.equal(mood.dayRating, 5);
      assert.equal(mood.emoji, "🤍");
    });
  });
});
