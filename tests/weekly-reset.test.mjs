import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  WEEKLY_RESET_PROMPTS,
  ENERGY_CARDS,
  aggregateWeekOverviewMetrics,
  initializeWeeklyResetDraft,
  compileResetJournalBody,
} from "../src/lib/weeklyResetEngine.ts";
import { getWeekDaysInfo } from "../src/lib/weeklyHabitEngine.ts";

describe("Weekly Reset Studio Engine", () => {
  const fixedDate = new Date("2026-10-14T10:00:00Z"); // Wednesday Oct 14, 2026
  const weekInfo = getWeekDaysInfo(fixedDate, 0, "saturday", false);
  // Saturday Oct 10 to Friday Oct 16

  // ── 1. Canonical Prompts & Energy Cards ──
  describe("Canonical Reflection Prompts & Energy Cards", () => {
    it("provides exactly 6 canonical reflection prompts with English & Arabic translations", () => {
      assert.equal(WEEKLY_RESET_PROMPTS.length, 6);
      const promptIds = WEEKLY_RESET_PROMPTS.map((p) => p.id);
      assert.deepEqual(promptIds, [
        "went_well",
        "supported_me",
        "felt_difficult",
        "adjust",
        "gratitude",
        "carry_forward",
      ]);

      WEEKLY_RESET_PROMPTS.forEach((p) => {
        assert.ok(p.emoji, "Prompt must have an emoji");
        assert.ok(p.questionEn, "Prompt must have English question");
        assert.ok(p.questionAr, "Prompt must have Arabic question");
        assert.ok(p.placeholderEn, "Prompt must have English placeholder");
        assert.ok(p.placeholderAr, "Prompt must have Arabic placeholder");
      });
    });

    it("provides drained and restored energy cards with English and Arabic copy", () => {
      assert.ok(ENERGY_CARDS.drained);
      assert.ok(ENERGY_CARDS.restored);
      assert.equal(ENERGY_CARDS.drained.emoji, "🪫");
      assert.equal(ENERGY_CARDS.restored.emoji, "⚡");
      assert.equal(ENERGY_CARDS.drained.titleEn, "What drained my energy?");
      assert.equal(ENERGY_CARDS.drained.titleAr, "ما الذي استنزف طاقتي؟");
      assert.equal(ENERGY_CARDS.restored.titleEn, "What restored my energy?");
      assert.equal(ENERGY_CARDS.restored.titleAr, "ما الذي أعاد لي طاقتي؟");
    });
  });

  // ── 2. Metric Aggregator: Factual Accuracy & No Fabrication ──
  describe("Factual Metric Aggregation", () => {
    it("reports hasAnyActivity: false and zeroed stats when no records exist", () => {
      const metrics = aggregateWeekOverviewMetrics({
        weekInfo,
        tasks: [],
        habits: [],
        goals: [],
      });

      assert.equal(metrics.hasAnyActivity, false);
      assert.equal(metrics.completedTasksCount, 0);
      assert.equal(metrics.totalFocusSeconds, 0);
      assert.equal(metrics.totalStudyMinutes, 0);
      assert.equal(metrics.routineDoneCount, 0);
      assert.equal(metrics.daysWithMoodLogsCount, 0);
    });

    it("accurately counts only tasks completed inside the week window", () => {
      const sampleTasks = [
        // Task completed inside week (2026-10-12)
        {
          id: "t1",
          title: "Prepare presentation",
          done: true,
          doneDate: "2026-10-12",
        },
        // Task completed on last day of week (2026-10-16)
        {
          id: "t2",
          title: "Buy groceries",
          done: true,
          doneDate: "2026-10-16",
        },
        // Task completed prior week (2026-10-08) -> must NOT count
        {
          id: "t3",
          title: "Old task",
          done: true,
          doneDate: "2026-10-08",
        },
        // Task completed next week (2026-10-18) -> must NOT count
        {
          id: "t4",
          title: "Future task",
          done: true,
          doneDate: "2026-10-18",
        },
        // Task open, due in week (2026-10-15) -> unfinished task
        {
          id: "t5",
          title: "Finish paper",
          done: false,
          dueDate: "2026-10-15",
        },
      ];

      const metrics = aggregateWeekOverviewMetrics({
        weekInfo,
        tasks: sampleTasks,
        habits: [],
        goals: [],
      });

      assert.equal(metrics.hasAnyActivity, true);
      assert.equal(metrics.completedTasksCount, 2);
      assert.deepEqual(
        metrics.completedTasksInWeek.map((t) => t.id),
        ["t1", "t2"]
      );
      assert.equal(metrics.unfinishedTasksInWeek.length, 1);
      assert.equal(metrics.unfinishedTasksInWeek[0].id, "t5");
    });

    it("correctly identifies study and focus overlap to avoid misleading double totals", () => {
      const focusSessions = [
        // Focus session linked to general work
        {
          id: "f1",
          localDate: "2026-10-12",
          status: "completed",
          sourceType: "task",
          actualFocusSeconds: 1800, // 30 mins
        },
        // Focus session linked to subject study
        {
          id: "f2",
          localDate: "2026-10-13",
          status: "completed",
          sourceType: "subject",
          actualFocusSeconds: 3600, // 60 mins
        },
      ];

      const studySessions = [
        {
          id: "s1",
          date: "2026-10-13",
          minutes: 60,
        },
      ];

      const metrics = aggregateWeekOverviewMetrics({
        weekInfo,
        tasks: [],
        habits: [],
        goals: [],
        focusSessions,
        studySessions,
      });

      assert.equal(metrics.totalFocusSeconds, 5400); // 90 mins
      assert.equal(metrics.totalStudyMinutes, 60);
      assert.equal(metrics.studyFocusOverlapMinutes, 60);
    });

    it("counts wellness days and routine activity accurately", () => {
      const dailyMoods = {
        "2026-10-11": { date: "2026-10-11", mood: "happy", emoji: "🌸" },
        "2026-10-13": { date: "2026-10-13", mood: "calm", emoji: "✨" },
      };
      const routineCompletions = {
        "2026-10-10": ["r1", "r2"],
        "2026-10-11": ["r1"],
      };

      const metrics = aggregateWeekOverviewMetrics({
        weekInfo,
        tasks: [],
        habits: [],
        goals: [],
        dailyMoods,
        routineCompletionsByDate: routineCompletions,
      });

      assert.equal(metrics.daysWithMoodLogsCount, 2);
      assert.equal(metrics.routineDoneCount, 3);
    });
  });

  // ── 3. Draft Initialization and Markdown Compilation ──
  describe("Draft Management & Markdown Compilation", () => {
    it("initializes a clean draft with default structure", () => {
      const draft = initializeWeeklyResetDraft(weekInfo);
      assert.equal(draft.weekStartDate, "2026-10-10");
      assert.equal(draft.weekEndDate, "2026-10-16");
      assert.equal(draft.status, "draft");
      assert.equal(draft.nextWeekPriorities.length, 3);
      assert.deepEqual(draft.accomplishments, []);
    });

    it("hydrates from existing notes without losing historical data", () => {
      const existingNote = {
        id: "note-123",
        userId: "u1",
        weekStartDate: "2026-10-10",
        text: "Custom notes",
        reflectionAnswers: {
          went_well: "Everything flowed smoothly",
          gratitude: "Grateful for quiet mornings",
        },
        completedReflection: true,
        journalEntryId: "j-999",
      };

      const draft = initializeWeeklyResetDraft(weekInfo, existingNote);
      assert.equal(draft.status, "finished");
      assert.equal(draft.journalEntryId, "j-999");
      assert.equal(draft.reflectionAnswers.went_well, "Everything flowed smoothly");
      assert.equal(draft.reflectionAnswers.gratitude, "Grateful for quiet mornings");
    });

    it("compiles structured markdown body including reflections, energy, and priorities", () => {
      const draft = initializeWeeklyResetDraft(weekInfo);
      draft.nextWeekIntention = "A week of deep presence";
      draft.reflectionAnswers.went_well = "Finished chapter 4";
      draft.energyDrained = "Late night screen time";
      draft.energyRestored = "Morning walks in fresh air";
      draft.accomplishments = [
        { id: "a1", title: "Handed in design report", sourceType: "task" },
      ];
      draft.nextWeekPriorities = [
        { id: "p1", title: "Draft chapter 5", type: "note" },
        { id: "p2", title: "Review budget", type: "proposed_task" },
        { id: "p3", title: "", type: "note" },
      ];

      const markdownEn = compileResetJournalBody(draft, weekInfo.formattedRange, false);
      assert.ok(markdownEn.includes("# 🌸 Weekly Reset Studio"));
      assert.ok(markdownEn.includes("A week of deep presence"));
      assert.ok(markdownEn.includes("What went well?"));
      assert.ok(markdownEn.includes("Finished chapter 4"));
      assert.ok(markdownEn.includes("Late night screen time"));
      assert.ok(markdownEn.includes("Morning walks in fresh air"));
      assert.ok(markdownEn.includes("Handed in design report"));
      assert.ok(markdownEn.includes("Draft chapter 5"));
      assert.ok(markdownEn.includes("Review budget"));

      const markdownAr = compileResetJournalBody(draft, weekInfo.formattedRange, true);
      assert.ok(markdownAr.includes("# 🌸 مساحة مراجعة الأسبوع"));
      assert.ok(markdownAr.includes("تأملات الأسبوع الهادئة"));
      assert.ok(markdownAr.includes("أولويات الأسبوع القادم الثلاث"));
    });
  });
});
