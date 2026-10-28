import test from "node:test";
import assert from "node:assert/strict";

import {
  STARTER_DAY_TYPES,
  createDefaultIdealWeekTemplate,
  resolveBetweenPrayersPeriods,
  resolveItemLocalExecutionDate,
  resolveDatedWeekSchedule,
  detectScheduleConflicts,
  compileApplyWeekActionPlan,
} from "../src/lib/idealWeekEngine.ts";

test("Ideal Week Engine — Starter Day Types & Customizability", () => {
  assert.equal(STARTER_DAY_TYPES.length, 6, "Must provide 6 starter day types");
  const ids = STARTER_DAY_TYPES.map((d) => d.id);
  assert.ok(ids.includes("work"), "has work day");
  assert.ok(ids.includes("night_shift"), "has night shift day");
  assert.ok(ids.includes("study"), "has study day");
  assert.ok(ids.includes("rest"), "has rest day");
  assert.ok(ids.includes("weekend"), "has weekend");
  assert.ok(ids.includes("low_energy"), "has low energy day");

  // Verify bilingual support
  const lowEnergy = STARTER_DAY_TYPES.find((d) => d.id === "low_energy");
  assert.equal(lowEnergy?.nameEn, "Low-Energy Day");
  assert.equal(lowEnergy?.nameAr, "يوم منخفض الطاقة");
});

test("Ideal Week Engine — Between the Prayers Non-Overlapping Periods", () => {
  const testDate = new Date("2026-10-15T12:00:00Z");

  // Default with user-enabled after_fajr segment
  const periods = resolveBetweenPrayersPeriods(testDate, undefined, {
    enableAfterFajr: true,
    afterFajrMinutes: 60,
  });

  assert.equal(periods.length, 6, "Should resolve 6 periods when after_fajr is enabled");
  const pIds = periods.map((p) => p.id);
  assert.deepEqual(pIds, [
    "after_fajr",
    "fajr_dhuhr",
    "dhuhr_asr",
    "asr_maghrib",
    "maghrib_isha",
    "after_isha",
  ]);

  // Non-overlapping check: after_fajr endTime must equal fajr_dhuhr startTime
  const afterFajr = periods.find((p) => p.id === "after_fajr");
  const fajrDhuhr = periods.find((p) => p.id === "fajr_dhuhr");
  assert.equal(
    afterFajr?.endTime,
    fajrDhuhr?.startTime,
    "After Fajr boundary must match start of remaining Fajr->Dhuhr period exactly"
  );

  // Single period when after_fajr is disabled
  const periodsSingle = resolveBetweenPrayersPeriods(testDate, undefined, {
    enableAfterFajr: false,
  });
  assert.equal(periodsSingle.length, 5, "Should resolve 5 periods when after_fajr is disabled");
  assert.equal(periodsSingle[0].id, "fajr_dhuhr");
});

test("Ideal Week Engine — Night Shift & Midnight Crossing", () => {
  const baseDate = "2026-10-15";
  // A late shift starting at 22:00 for 480 minutes (8 hours) -> ends at 06:00 next day
  const res = resolveItemLocalExecutionDate(baseDate, "22:00", 480);
  assert.equal(res.startDateStr, "2026-10-15");
  assert.equal(res.endDateStr, "2026-10-16");
  assert.equal(res.crossesMidnight, true, "Must flag midnight crossing");

  // A daytime item (09:00 for 60 mins) -> does not cross midnight
  const dayRes = resolveItemLocalExecutionDate(baseDate, "09:00", 60);
  assert.equal(dayRes.startDateStr, "2026-10-15");
  assert.equal(dayRes.endDateStr, "2026-10-15");
  assert.equal(dayRes.crossesMidnight, false);
});

test("Ideal Week Engine — Conflict Detection", () => {
  const items = [
    {
      id: "it-1",
      weekday: 1,
      title: "Focus Block",
      type: "task_proposal",
      clockTime: "09:00",
      durationMinutes: 90, // 09:00 - 10:30
      order: 0,
    },
    {
      id: "it-2",
      weekday: 1,
      title: "Team Meeting",
      type: "task_proposal",
      clockTime: "10:00",
      durationMinutes: 60, // 10:00 - 11:00 (overlaps with it-1)
      order: 1,
    },
    {
      id: "it-3",
      weekday: 1,
      title: "Mindful Lunch",
      type: "routine",
      clockTime: "12:30",
      durationMinutes: 30, // 12:30 - 13:00 (no overlap)
      order: 2,
    },
  ];

  const conflicts = detectScheduleConflicts(items);
  assert.equal(conflicts.length, 1, "Should detect exactly one overlap between it-1 and it-2");
  assert.equal(conflicts[0].itemAId, "it-1");
  assert.equal(conflicts[0].itemBId, "it-2");
});

test("Ideal Week Engine — Template vs Dated Plan Separation & Idempotent Preview", () => {
  const template = createDefaultIdealWeekTemplate();
  const weekDays = [
    { dateStr: "2026-10-11", dayOfWeekIndex: 0 },
    { dateStr: "2026-10-12", dayOfWeekIndex: 1 },
    { dateStr: "2026-10-13", dayOfWeekIndex: 2 },
    { dateStr: "2026-10-14", dayOfWeekIndex: 3 },
    { dateStr: "2026-10-15", dayOfWeekIndex: 4 },
    { dateStr: "2026-10-16", dayOfWeekIndex: 5 },
    { dateStr: "2026-10-17", dayOfWeekIndex: 6 },
  ];

  // Resolve dated schedule
  const resolved = resolveDatedWeekSchedule(weekDays, template);
  assert.equal(resolved.length, 7);

  // Compile action plan
  const plan = compileApplyWeekActionPlan(resolved, []);
  assert.ok(plan.tasksToCreate.length > 0, "Finds proposed tasks to create");
  assert.ok(plan.planningNotesOnly.length > 0, "Identifies planning notes separately");

  // Notes must NEVER be compiled into tasksToCreate
  const noteAsTask = plan.tasksToCreate.find((t) => t.title.includes("Asr Walk"));
  assert.equal(noteAsTask, undefined, "Planning notes must remain purely notes and not tasks");

  // Idempotency: if task already exists on that date with same title, don't duplicate
  const existingTask = {
    id: "existing-1",
    title: plan.tasksToCreate[0].title,
    dueDate: plan.tasksToCreate[0].dueDate,
    tag: "Work",
    priority: "medium",
    done: false,
  };

  const planWithExisting = compileApplyWeekActionPlan(resolved, [existingTask]);
  assert.equal(
    planWithExisting.tasksToCreate.length,
    plan.tasksToCreate.length - 1,
    "Should skip creating tasks that already exist on that date"
  );
});
