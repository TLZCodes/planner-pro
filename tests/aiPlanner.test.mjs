import test from "node:test";
import assert from "node:assert/strict";

import {
  validateProposal,
  extractProposalsFromText,
  formatPlanTextWithoutRawJson,
  buildUserContextSummary,
  applyProposalToStore,
  normalizeAiConversation,
  normalizeAiContextConsent,
  DEFAULT_CONTEXT_SCOPE,
  STRICT_EXCLUDED_MODULES,
  BUILT_IN_TEMPLATES,
  STARTER_PROMPTS,
} from "../src/lib/aiPlannerEngine.ts";

test("AI Planner — Default Context Scope: strictly no personal context shared by default", () => {
  assert.equal(DEFAULT_CONTEXT_SCOPE.granted, false);
  assert.equal(DEFAULT_CONTEXT_SCOPE.sources.openTasks, false);
  assert.equal(DEFAULT_CONTEXT_SCOPE.sources.goalMilestones, false);
  assert.equal(DEFAULT_CONTEXT_SCOPE.sources.routineSchedules, false);
  assert.equal(DEFAULT_CONTEXT_SCOPE.sources.studyCommitments, false);
  assert.equal(DEFAULT_CONTEXT_SCOPE.sources.prayerTimes, false);

  // When granted is false, summaryText is empty string
  const mockState = {
    tasks: [{ id: "t1", title: "Secret task", done: false }],
    goals: [{ id: "g1", title: "Secret goal" }],
    journal: [{ id: "j1", body: "Private diary" }],
    money: [],
  };

  const inspection = buildUserContextSummary(mockState, DEFAULT_CONTEXT_SCOPE);
  assert.equal(inspection.summaryText, "");
  assert.equal(inspection.recordCounts.tasks, 0);
  assert.equal(inspection.recordCounts.goals, 0);
});

test("AI Planner — Private-Data Exclusions: strictly excludes sensitive modules", () => {
  // Verify list of strict exclusions
  assert.ok(STRICT_EXCLUDED_MODULES.includes("Journal Entries & PIN-locked text"));
  assert.ok(STRICT_EXCLUDED_MODULES.includes("Weekly Reset reflection answers"));
  assert.ok(STRICT_EXCLUDED_MODULES.includes("Barakah Jar gratitude notes"));
  assert.ok(STRICT_EXCLUDED_MODULES.includes("Future Me Time Capsule letters"));
  assert.ok(STRICT_EXCLUDED_MODULES.includes("Wheel of Becoming ratings & notes"));
  assert.ok(STRICT_EXCLUDED_MODULES.includes("Private Financial accounts & transactions"));
  assert.ok(STRICT_EXCLUDED_MODULES.includes("Mood, Health, & Wellbeing logs"));
  assert.ok(STRICT_EXCLUDED_MODULES.includes("Brain Dump private text"));

  // When context is authorized, task notes are STILL never included automatically
  const authorizedScope = {
    granted: true,
    mode: "single_request",
    sources: {
      openTasks: true,
      goalMilestones: true,
      routineSchedules: false,
      studyCommitments: false,
      planningWindows: false,
      configuredTimezone: true,
      prayerTimes: false,
    },
    updatedAt: new Date().toISOString(),
  };

  const stateWithNotes = {
    prefs: { timezone: "Africa/Casablanca" },
    tasks: [
      {
        id: "t1",
        title: "Review quarterly report",
        dueDate: "2026-10-20",
        notes: "VERY CONFIDENTIAL SALARY DETAILS",
        tag: "Work",
        done: false,
      },
    ],
    goals: [
      {
        id: "g1",
        title: "Launch personal brand",
        milestones: [{ id: "m1", title: "Design logo", completed: false }],
        completed: false,
        archived: false,
      },
    ],
    journal: [{ id: "j1", body: "Super secret journal entry" }],
    routines: {},
  };

  const result = buildUserContextSummary(stateWithNotes, authorizedScope, "2026-10-16");
  // Notes must NEVER leak
  assert.ok(!result.summaryText.includes("CONFIDENTIAL SALARY DETAILS"));
  // Journal must NEVER leak
  assert.ok(!result.summaryText.includes("Super secret journal entry"));
  // Title is present
  assert.ok(result.summaryText.includes("Review quarterly report"));
  assert.ok(result.summaryText.includes("Launch personal brand"));
  assert.equal(result.recordCounts.tasks, 1);
  assert.equal(result.recordCounts.goals, 1);
});

test("AI Planner — Structured Proposal Schema & Untrusted Input Validation", () => {
  // Valid proposal
  const validRaw = {
    id: "prop_1",
    type: "task",
    title: "Deep focus writing 45m",
    destination: "tasks",
    targetDate: "2026-10-18",
    clockTime: "09:30",
    durationMinutes: 45,
    category: "Writing",
    reminder: true,
  };

  const res1 = validateProposal(validRaw);
  assert.equal(res1.isValid, true);
  assert.equal(res1.proposal?.title, "Deep focus writing 45m");
  assert.equal(res1.proposal?.targetDate, "2026-10-18");
  assert.equal(res1.proposal?.clockTime, "09:30");
  assert.equal(res1.proposal?.reminder, true);

  // Invalid date format (rejects malicious or malformed dates)
  const invalidDate = {
    title: "Bad date task",
    targetDate: "tomorrow-afternoon",
    destination: "tasks",
  };
  const res2 = validateProposal(invalidDate);
  assert.equal(res2.isValid, false);
  assert.ok(res2.errors.some((e) => e.includes("Invalid targetDate format")));

  // Invalid clockTime format
  const invalidTime = {
    title: "Bad time task",
    clockTime: "25:70",
    destination: "tasks",
  };
  const res3 = validateProposal(invalidTime);
  assert.equal(res3.isValid, false);
  assert.ok(res3.errors.some((e) => e.includes("Invalid clockTime format")));

  // Missing title
  const missingTitle = {
    destination: "tasks",
  };
  const res4 = validateProposal(missingTitle);
  assert.equal(res4.isValid, false);
  assert.ok(res4.errors.includes("Missing proposal title"));

  // Unauthorized Goal ID check against state
  const mockState = {
    goals: [{ id: "g_actual", title: "Actual Goal" }],
  };
  const invalidGoalRef = {
    title: "Step for unknown goal",
    destination: "goals",
    goalId: "hacked_nonexistent_goal",
  };
  const res5 = validateProposal(invalidGoalRef, mockState);
  assert.equal(res5.isValid, false);
  assert.ok(res5.errors.some((e) => e.includes("does not exist in your planner")));
});

test("AI Planner — Markdown Extraction of json:ayxa_plan Blocks", () => {
  const modelResponse = `
Here is a calm, focused plan for your morning:

- Take 10 minutes to breathe and set your intention.
- Focus on one gentle task at a time.

\`\`\`json:ayxa_plan
{
  "proposals": [
    {
      "id": "p1",
      "type": "task",
      "title": "Morning review & tea",
      "destination": "tasks",
      "clockTime": "08:00",
      "durationMinutes": 20
    },
    {
      "id": "p2",
      "type": "routine",
      "title": "Quiet reflection & stretch",
      "destination": "routines",
      "clockTime": "08:30"
    }
  ]
}
\`\`\`

May your day be filled with peace and ease 🌸
`;

  const proposals = extractProposalsFromText(modelResponse);
  assert.equal(proposals.length, 2);
  assert.equal(proposals[0].title, "Morning review & tea");
  assert.equal(proposals[0].destination, "tasks");
  assert.equal(proposals[1].title, "Quiet reflection & stretch");
  assert.equal(proposals[1].destination, "routines");

  // Clean formatted text removes raw JSON code block for chat bubble
  const clean = formatPlanTextWithoutRawJson(modelResponse);
  assert.ok(!clean.includes("```json:ayxa_plan"));
  assert.ok(clean.includes("Here is a calm, focused plan for your morning:"));
  assert.ok(clean.includes("May your day be filled with peace and ease 🌸"));
});

test("AI Planner — Idempotent Canonical Mutations: no duplicate creations & strictly 0 XP", () => {
  const createdTasks = [];
  let xpAwarded = 0;

  const mockActions = {
    addTask: (t) => {
      createdTasks.push(t);
    },
    addXP: (amount) => {
      xpAwarded += amount;
    },
  };

  const proposal = {
    id: "prop_unique_123",
    type: "task",
    title: "Write 500 words",
    destination: "tasks",
    targetDate: "2026-10-19",
    clockTime: "10:00",
    category: "Writing",
    reminder: false,
  };

  const appliedSet = new Set();

  // First application
  const res1 = applyProposalToStore(proposal, mockActions, appliedSet);
  assert.equal(res1.success, true);
  assert.equal(createdTasks.length, 1);
  assert.equal(createdTasks[0].title, "Write 500 words");
  assert.equal(createdTasks[0].id, "task_ai_prop_unique_123");
  assert.equal(xpAwarded, 0); // Strictly 0 XP

  // Second application (rapid tap or retry) — must be IDEMPOTENT
  const res2 = applyProposalToStore(proposal, mockActions, appliedSet);
  assert.equal(res2.success, true);
  assert.equal(createdTasks.length, 1); // No new task created
  assert.ok(res2.error.includes("Already applied previously"));
  assert.equal(xpAwarded, 0); // Strictly 0 XP
});

test("AI Planner — Partial Failure and Retry without Recreating Successful Items", () => {
  const createdItems = [];
  const appliedSet = new Set();

  const mockActions = {
    addTask: (t) => createdItems.push(t.title),
    addGoalMilestone: (gid, m) => {
      if (gid === "invalid_goal") {
        throw new Error("Goal not found");
      }
      createdItems.push(m.title);
    },
  };

  const proposal1 = {
    id: "p_good",
    type: "task",
    title: "Good Task",
    destination: "tasks",
  };

  const proposal2 = {
    id: "p_bad",
    type: "goal_step",
    title: "Failing Goal Step",
    destination: "goals",
    goalId: "invalid_goal",
  };

  // Run 1: Good task succeeds, Bad goal step fails
  const res1 = applyProposalToStore(proposal1, mockActions, appliedSet);
  const res2 = applyProposalToStore(proposal2, mockActions, appliedSet);

  assert.equal(res1.success, true);
  assert.equal(res2.success, false);
  assert.equal(createdItems.length, 1);
  assert.equal(createdItems[0], "Good Task");

  // Fix the bad proposal
  proposal2.goalId = undefined; // Will create as new goal or fallback
  mockActions.addGoal = (g) => {
    createdItems.push(g.title);
    return "new_goal_id";
  };

  // Run 2: Retry failed item only
  const retry1 = applyProposalToStore(proposal1, mockActions, appliedSet); // Already in appliedSet!
  const retry2 = applyProposalToStore(proposal2, mockActions, appliedSet);

  assert.equal(retry1.error?.includes("Already applied"), true);
  assert.equal(retry2.success, true);
  assert.equal(createdItems.length, 2);
  assert.equal(createdItems[1], "Failing Goal Step");
});

test("AI Planner — Deterministic Built-in Templates & Arithmetic Truthfulness", () => {
  assert.equal(BUILT_IN_TEMPLATES.length, 6);

  // 1. Barakah Routine
  const barakah = BUILT_IN_TEMPLATES.find((t) => t.id === "barakah_routine");
  assert.ok(barakah);
  assert.equal(barakah.kind, "built_in_template");
  assert.ok(barakah.proposals.some((p) => p.destination === "routines"));
  assert.ok(barakah.proposals.some((p) => p.destination === "tasks"));

  // 2. Quran Khatmah Math Truthfulness
  const khatmah = BUILT_IN_TEMPLATES.find((t) => t.id === "khatmah_plan");
  assert.ok(khatmah);
  // 5 prayers * 4 pages = 20 pages/day * 30 days = 600 pages.
  // Must accurately state Madinah Mushaf 604 pages in description
  assert.ok(khatmah.descEn.includes("604"));
  assert.ok(khatmah.descAr.includes("604"));
  assert.equal(khatmah.proposals.length, 5); // 1 check-in per obligatory prayer

  // 3. Night Shift Plan
  const nightShift = BUILT_IN_TEMPLATES.find((t) => t.id === "night_shift_plan");
  assert.ok(nightShift);
  assert.ok(nightShift.proposals.some((p) => p.title.toLowerCase().includes("sleep")));

  // Reminders must default to false on all templates
  BUILT_IN_TEMPLATES.forEach((t) => {
    t.proposals.forEach((p) => {
      assert.equal(p.reminder, false);
    });
  });
});

test("AI Planner — Starter Prompts & Arabic Feminine Phrasing", () => {
  assert.equal(STARTER_PROMPTS.length, 5);

  const nightShift = STARTER_PROMPTS.find((p) => p.id === "night_shift");
  assert.equal(nightShift.en, "Make a plan around my night shift.");
  assert.equal(nightShift.ar, "رتّبي خطة تناسب مناوبتي الليلية.");

  const gentleRoutine = STARTER_PROMPTS.find((p) => p.id === "gentle_routine");
  assert.equal(gentleRoutine.en, "Build a gentle routine.");
  assert.equal(gentleRoutine.ar, "اقترحي روتينًا هادئًا.");

  const study = STARTER_PROMPTS.find((p) => p.id === "organize_study");
  assert.equal(study.en, "Help me organize my study.");
  assert.equal(study.ar, "ساعديني في تنظيم دراستي.");
});

test("AI Planner — Normalization & Conversation Persistence", () => {
  // Empty / null raw input
  const conv = normalizeAiConversation(null);
  assert.ok(conv.id.startsWith("conv_"));
  assert.equal(conv.messages.length, 0);

  // Normalization with malformed messages
  const rawWithMessages = {
    id: "conv_test",
    title: "My Day Plan",
    messages: [
      { id: "m1", role: "user", content: "Plan my day" },
      { id: "m2", role: "invalid_role", content: "Invalid role should normalize to user" },
      {
        id: "m3",
        role: "assistant",
        content: "Here is your plan",
        proposals: [{ title: "Morning walk", destination: "tasks" }],
      },
    ],
  };

  const normalized = normalizeAiConversation(rawWithMessages);
  assert.equal(normalized.id, "conv_test");
  assert.equal(normalized.messages.length, 3);
  assert.equal(normalized.messages[1].role, "user");
  assert.equal(normalized.messages[2].proposals?.length, 1);
  assert.equal(normalized.messages[2].proposals[0].title, "Morning walk");
});
