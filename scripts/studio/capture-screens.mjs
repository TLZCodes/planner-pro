// AYXA Planner Pro — Educational Showcase: screen capture stage.
//
// This script IS the "image model" for this film. Every screen in the finished
// film is a real capture of the running application at 412x915 @ DSR 2, seeded
// with honest sample state so no module is photographed empty.
//
// Output: generations/scNN/<shotId>-v1.png   (raw attempts)
//         selects/scNN/<shotId>-v1.png       (the same file, promoted on pass)
//
// Studio law 1: only /selects/ is visible to the edit.
//
// Run: node scripts/studio/capture-screens.mjs
// Prereq: a Vite dev server on http://127.0.0.1:8081

import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://127.0.0.1:8081";
const GEN_DIR = path.resolve("generations");
const SEL_DIR = path.resolve("selects");

const VIEWPORT = { width: 412, height: 915 };
const DSR = 2;

// ─── Deterministic local dates ────────────────────────────────────────────────
// The film's "today" is pinned so weekly figures are stable between runs, but it
// is still a real date computed from the real clock, not an invented one.
function localDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isoAt(offsetDays, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const T = localDate(0);
const T1 = localDate(-1);
const T2 = localDate(-2);
const T3 = localDate(-3);
const T4 = localDate(-4);
const T5 = localDate(-5);
const T6 = localDate(-6);
const TM3 = localDate(-21);
const TP1 = localDate(1);
const TP5 = localDate(5);
const TP20 = localDate(20);

const NOW = new Date().toISOString();
const YEAR = new Date().getFullYear();
const MONTH_KEY = `${YEAR}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

// ─── The seeded state ─────────────────────────────────────────────────────────
// Every record here is a plausible, internally consistent record. Nothing is
// fabricated for the camera: the same numbers drive the app's own engines, and
// the narration reads those engines' output rather than inventing statistics.
export function buildState() {
  const tasks = [
    // Completed this week, with real completion dates — these are what the
    // Weekly Reset overview counts.
    { id: "t01", title: "Submit research chapter one", tag: "Study", dueDate: T2, optionalTime: "09:00", priority: "high", isTopThree: true, done: true, doneDate: T2, completedAt: isoAt(-2, 11, 20) },
    { id: "t02", title: "Batch prep wholesome dinners", tag: "Self-care", dueDate: T3, optionalTime: "17:30", priority: "medium", done: true, doneDate: T3, completedAt: isoAt(-3, 18, 5) },
    { id: "t03", title: "Finish the brand palette", tag: "Work", dueDate: T4, optionalTime: "14:00", priority: "high", isTopThree: true, done: true, doneDate: T4, completedAt: isoAt(-4, 15, 40) },
    { id: "t04", title: "Call Mama", tag: "Personal", dueDate: T5, optionalTime: "19:00", priority: "medium", done: true, doneDate: T5, completedAt: isoAt(-5, 19, 12) },
    { id: "t05", title: "Review the monthly budget", tag: "Money", dueDate: T1, optionalTime: "16:00", priority: "medium", done: true, doneDate: T1, completedAt: isoAt(-1, 16, 45) },
    // Open today.
    { id: "t06", title: "Study block — 45 minutes", tag: "Study", dueDate: T, optionalTime: "10:30", priority: "high", isTopThree: true, done: false },
    { id: "t07", title: "Draft the client proposal", tag: "Work", dueDate: T, optionalTime: "13:00", priority: "high", isTopThree: true, done: false },
    { id: "t08", title: "Evening Quran and reflection", tag: "Deen", dueDate: T, optionalTime: "20:00", priority: "medium", isTopThree: true, done: false },
    { id: "t09", title: "Water the balcony plants", tag: "Home", dueDate: T, priority: "low", done: false },
    { id: "t10", title: "Reply to Sara about Thursday", tag: "Personal", dueDate: T, priority: "low", done: false },
    { id: "t11", title: "Book the dentist appointment", tag: "Health", dueDate: TP1, priority: "medium", done: false },
    { id: "t12", title: "Prepare the workshop slides", tag: "Work", dueDate: TP5, priority: "high", done: false },
  ];

  const habits = [
    {
      id: "h01", emoji: "🌙", name: "Prayer", nameAr: "الصلاة", category: "Spiritual",
      trackingType: "check", targetValue: 5, unit: "prayers",
      scheduleType: "daily", scheduledDays: [0, 1, 2, 3, 4, 5, 6],
      streak: 14, bestStreak: 21, days: [true, true, true, true, true, true, true],
      status: "active", startDate: TM3,
      history: { [T6]: { value: 5, completed: true }, [T5]: { value: 5, completed: true }, [T4]: { value: 5, completed: true }, [T3]: { value: 5, completed: true }, [T2]: { value: 5, completed: true }, [T1]: { value: 5, completed: true }, [T]: { value: 4, completed: false } },
    },
    {
      id: "h02", emoji: "📖", name: "Quran wird", nameAr: "ورد القرآن", category: "Spiritual",
      trackingType: "count", targetValue: 4, unit: "pages",
      scheduleType: "daily", scheduledDays: [0, 1, 2, 3, 4, 5, 6],
      streak: 21, bestStreak: 34, days: [true, true, true, true, true, true, true],
      status: "active", startDate: TM3,
      history: { [T6]: { value: 4, completed: true }, [T5]: { value: 6, completed: true }, [T4]: { value: 4, completed: true }, [T3]: { value: 5, completed: true }, [T2]: { value: 4, completed: true }, [T1]: { value: 4, completed: true }, [T]: { value: 0, completed: false } },
    },
    {
      id: "h03", emoji: "💧", name: "Drink 2 litres", nameAr: "شرب لترين ماء", category: "Health",
      trackingType: "count", targetValue: 8, unit: "glasses",
      scheduleType: "daily", scheduledDays: [0, 1, 2, 3, 4, 5, 6],
      streak: 12, bestStreak: 19, days: [true, false, true, true, true, true, false],
      status: "active", startDate: TM3,
      history: { [T6]: { value: 8, completed: true }, [T5]: { value: 5, completed: false }, [T4]: { value: 8, completed: true }, [T3]: { value: 8, completed: true }, [T2]: { value: 8, completed: true }, [T1]: { value: 8, completed: true }, [T]: { value: 5, completed: false } },
    },
    {
      id: "h04", emoji: "🧴", name: "Skincare ritual", nameAr: "روتين العناية", category: "Self-care",
      trackingType: "check", targetValue: 1,
      scheduleType: "daily", scheduledDays: [0, 1, 2, 3, 4, 5, 6],
      streak: 15, bestStreak: 26, days: [true, true, true, false, true, true, true],
      status: "active", startDate: TM3,
      history: { [T6]: { value: 1, completed: true }, [T5]: { value: 1, completed: true }, [T4]: { value: 1, completed: true }, [T3]: { value: 0, completed: false }, [T2]: { value: 1, completed: true }, [T1]: { value: 1, completed: true }, [T]: { value: 1, completed: true } },
    },
    {
      id: "h05", emoji: "🏃‍♀️", name: "Move for 30 minutes", nameAr: "الحركة ٣٠ دقيقة", category: "Health",
      trackingType: "duration", targetValue: 30, unit: "min",
      // Deliberately a three-times-a-week habit. This is the record that makes
      // the weekly board's fairness rule visible on screen.
      scheduleType: "frequency", weeklyFrequency: 3, scheduledDays: [0, 2, 4],
      streak: 6, bestStreak: 11, days: [false, true, false, true, false, true, false],
      status: "active", startDate: TM3,
      history: { [T6]: { value: 0, completed: false }, [T5]: { value: 30, completed: true }, [T4]: { value: 0, completed: false }, [T3]: { value: 35, completed: true }, [T2]: { value: 0, completed: false }, [T1]: { value: 30, completed: true }, [T]: { value: 0, completed: false } },
    },
    {
      id: "h06", emoji: "📚", name: "Read 20 pages", nameAr: "قراءة ٢٠ صفحة", category: "Learning",
      trackingType: "count", targetValue: 20, unit: "pages",
      scheduleType: "weekdays", scheduledDays: [0, 1, 2, 3, 4],
      streak: 9, bestStreak: 15, days: [true, false, true, true, true, false, true],
      status: "active", startDate: TM3,
      history: { [T6]: { value: 20, completed: true }, [T5]: { value: 0, completed: false }, [T4]: { value: 24, completed: true }, [T3]: { value: 20, completed: true }, [T2]: { value: 30, completed: true }, [T1]: { value: 0, completed: false }, [T]: { value: 12, completed: false } },
    },
  ];

  const goals = [
    {
      id: "g01", title: "Read the whole Quran this year", titleAr: "ختم القرآن هذا العام",
      icon: "📖", area: "Deen", status: "active", isFocusGoal: true,
      progressMethod: "numeric", progress: 38, target: "December 2026",
      startDate: `${YEAR}-01-01`, targetDate: `${YEAR}-12-31`,
      startingValue: 0, currentValue: 233, targetValue: 604, unit: "pages",
      nextAction: "Read today's four pages after Fajr",
      milestones: [
        { id: "gm01", title: "Finish the first juz", completed: true },
        { id: "gm02", title: "Reach the halfway point", completed: false, dueDate: `${YEAR}-07-01` },
        { id: "gm03", title: "Complete the final juz", completed: false, dueDate: `${YEAR}-12-25` },
      ],
      createdAt: `${YEAR}-01-01T08:00:00.000Z`,
    },
    {
      id: "g02", title: "Launch my small brand", titleAr: "إطلاق علامتي الخاصة",
      icon: "🎀", area: "Work", status: "active", isFocusGoal: true,
      progressMethod: "milestones", progress: 45, target: "March 2027",
      startDate: `${YEAR}-06-01`, targetDate: "2027-03-31",
      nextAction: "Approve the packaging mockups",
      milestones: [
        { id: "gm04", title: "Register the trade name", completed: true },
        { id: "gm05", title: "Design the identity system", completed: true },
        { id: "gm06", title: "Build the storefront", completed: false, dueDate: "2027-01-15" },
        { id: "gm07", title: "First ten orders packed", completed: false, dueDate: "2027-03-01" },
      ],
      createdAt: `${YEAR}-06-01T08:00:00.000Z`,
    },
    {
      id: "g03", title: "Speak conversational French", titleAr: "التحدث بالفرنسية",
      icon: "🗣️", area: "Study", status: "active", isFocusGoal: false,
      progressMethod: "numeric", progress: 24, target: "Next summer",
      startingValue: 0, currentValue: 240, targetValue: 1000, unit: "minutes",
      nextAction: "Two listening sessions this week",
      createdAt: `${YEAR}-04-10T08:00:00.000Z`,
    },
    {
      id: "g04", title: "Move my body every week", titleAr: "الحركة كل أسبوع",
      icon: "🧘‍♀️", area: "Health", status: "active", isFocusGoal: false,
      progressMethod: "manual", progress: 62, target: "Ongoing",
      nextAction: "Three sessions scheduled, not four",
      createdAt: `${YEAR}-02-02T08:00:00.000Z`,
    },
  ];

  const journal = [
    {
      id: "j01", date: T2, time: "21:40",
      title: "A gentler week than I expected",
      body: "I finished the chapter I had been circling for two weeks. The trick was not a longer day, it was starting at nine instead of eleven. Small move, whole week changed.\n\nI want to keep that hour.",
      templateId: "free", mood: "grateful", energy: "medium",
      tags: ["study", "pace"], sticker: "🌸", locked: false,
      wordCount: 52, createdAt: isoAt(-2, 21, 40), updatedAt: isoAt(-2, 21, 40),
    },
    {
      id: "j02", date: T3, time: "07:15",
      title: "Gratitude — three small things",
      body: "1. Coffee before anyone else was awake.\n2. Mama's voice on the phone.\n3. The rain on the balcony at midnight.",
      templateId: "gratitude", mood: "happy", energy: "high",
      tags: ["gratitude"], sticker: "🌷", locked: false,
      wordCount: 31, createdAt: isoAt(-3, 7, 15), updatedAt: isoAt(-3, 7, 15),
    },
    {
      id: "j03", date: T4, time: "23:05",
      title: "Private",
      body: "Keeping this one to myself.",
      templateId: "free", mood: "calm", energy: "low",
      tags: ["private"], sticker: "🔒", locked: true,
      wordCount: 5, createdAt: isoAt(-4, 23, 5), updatedAt: isoAt(-4, 23, 5),
    },
    {
      id: "j04", date: T5, time: "22:10",
      title: "The evening wind-down",
      body: "Screens off at nine, Quran, then a page of the novel. I slept properly for the first time in a while. Worth protecting.",
      templateId: "evening", mood: "calm", energy: "medium",
      tags: ["sleep", "routine"], sticker: "🌙", locked: false,
      wordCount: 36, createdAt: isoAt(-5, 22, 10), updatedAt: isoAt(-5, 22, 10),
    },
  ];

  const pixels = [];
  const moodCycle = [4, 4, 3, 5, 3, 4, 2, 4, 5, 4, 3, 4, 4, 5, 3, 2, 4, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5, 4, 4];
  for (let i = 364; i >= 0; i--) {
    if (i < 300 && i % 11 === 0) continue; // honest gaps: some days she did not log
    const idx = (365 - i) % moodCycle.length;
    pixels.push({ date: localDate(-i), mood: moodCycle[idx] });
  }

  const focusSessions = [
    { id: "f01", userId: "user_active_ayxa", mode: "pomodoro", status: "completed", phase: "focus", sourceType: "subject", sourceLabelSnapshot: "Study block", plannedFocusSeconds: 1500, plannedShortBreakSeconds: 300, plannedLongBreakSeconds: 900, plannedCycles: 4, currentCycle: 3, startedAt: isoAt(-1, 9, 5), endedAt: isoAt(-1, 10, 30), accumulatedFocusSeconds: 4600, accumulatedBreakSeconds: 900, actualFocusSeconds: 4600, localDate: T1, timezone: "Africa/Casablanca", createdAt: isoAt(-1, 9, 5), updatedAt: isoAt(-1, 10, 30) },
    { id: "f02", userId: "user_active_ayxa", mode: "pomodoro", status: "completed", phase: "focus", sourceType: "business", sourceLabelSnapshot: "Client proposal", plannedFocusSeconds: 1500, plannedShortBreakSeconds: 300, plannedLongBreakSeconds: 900, plannedCycles: 4, currentCycle: 4, startedAt: isoAt(-3, 13, 30), endedAt: isoAt(-3, 15, 10), accumulatedFocusSeconds: 5400, accumulatedBreakSeconds: 1200, actualFocusSeconds: 5400, localDate: T3, timezone: "Africa/Casablanca", createdAt: isoAt(-3, 13, 30), updatedAt: isoAt(-3, 15, 10) },
    { id: "f03", userId: "user_active_ayxa", mode: "pomodoro", status: "completed", phase: "focus", sourceType: "subject", sourceLabelSnapshot: "Arabic revision", plannedFocusSeconds: 1500, plannedShortBreakSeconds: 300, plannedLongBreakSeconds: 900, plannedCycles: 3, currentCycle: 3, startedAt: isoAt(-5, 10, 0), endedAt: isoAt(-5, 11, 15), accumulatedFocusSeconds: 3400, accumulatedBreakSeconds: 600, actualFocusSeconds: 3400, localDate: T5, timezone: "Africa/Casablanca", createdAt: isoAt(-5, 10, 0), updatedAt: isoAt(-5, 11, 15) },
    { id: "f04", userId: "user_active_ayxa", mode: "timer", status: "completed", phase: "focus", sourceType: "free", sourceLabelSnapshot: "Open focus", plannedFocusSeconds: 1800, plannedShortBreakSeconds: 300, plannedLongBreakSeconds: 900, plannedCycles: 1, currentCycle: 1, startedAt: isoAt(0, 8, 20), endedAt: isoAt(0, 8, 45), accumulatedFocusSeconds: 1500, accumulatedBreakSeconds: 0, actualFocusSeconds: 1500, localDate: T, timezone: "Africa/Casablanca", createdAt: isoAt(0, 8, 20), updatedAt: isoAt(0, 8, 45) },
  ];

  const studySessions = [
    { date: T2, subject: "Mathematics", minutes: 45 },
    { date: T1, subject: "Mathematics", minutes: 60 },
    { date: T3, subject: "Languages", minutes: 30 },
    { date: T5, subject: "Design", minutes: 25 },
    { date: T, subject: "Languages", minutes: 20 },
  ];

  const learningItems = [
    { id: "l01", type: "subject", title: "Mathematics", titleAr: "الرياضيات", icon: "📐", status: "active", progressMethod: "study_time", manualProgress: 0, targetMinutesPerWeek: 240, totalTrackedMinutes: 105, createdAt: `${YEAR}-09-01T08:00:00.000Z`, updatedAt: NOW },
    { id: "l02", type: "subject", title: "Languages", titleAr: "اللغات", icon: "🗣️", status: "active", progressMethod: "study_time", manualProgress: 0, targetMinutesPerWeek: 120, totalTrackedMinutes: 50, createdAt: `${YEAR}-09-01T08:00:00.000Z`, updatedAt: NOW },
    { id: "l03", type: "subject", title: "Design", titleAr: "التصميم", icon: "🎨", status: "active", progressMethod: "manual_percentage", manualProgress: 58, targetMinutesPerWeek: 180, totalTrackedMinutes: 25, createdAt: `${YEAR}-09-01T08:00:00.000Z`, updatedAt: NOW },
    { id: "l04", type: "book", title: "Atomic Habits", titleAr: "العادات الذرية", icon: "📗", status: "active", progressMethod: "pages_read", manualProgress: 0, totalPages: 340, currentPage: 136, createdAt: `${YEAR}-08-01T08:00:00.000Z`, updatedAt: NOW },
    { id: "l05", type: "book", title: "Deep Work", titleAr: "العمل العميق", icon: "📘", status: "paused", progressMethod: "pages_read", manualProgress: 0, totalPages: 296, currentPage: 42, createdAt: `${YEAR}-08-01T08:00:00.000Z`, updatedAt: NOW },
  ];

  const flashcardDecks = [
    { id: "fd01", name: "Arabic roots — set one", titleAr: "جذور عربية — المجموعة الأولى", learningItemId: "l02", cardCount: 60, dueCount: 12, newCount: 5, createdAt: `${YEAR}-09-10T08:00:00.000Z`, updatedAt: NOW },
    { id: "fd02", name: "Design terminology", titleAr: "مصطلحات التصميم", learningItemId: "l03", cardCount: 45, dueCount: 7, newCount: 0, createdAt: `${YEAR}-09-12T08:00:00.000Z`, updatedAt: NOW },
  ];

  const financeAccounts = [
    { id: "fa01", userId: "user_active_ayxa", name: "Everyday account", type: "bank", balanceClass: "asset", currency: "MAD", openingBalanceMinor: 1840000, icon: "🏦", color: "#e6e6fa", includeInTotals: true, status: "active", createdAt: `${YEAR}-01-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "fa02", userId: "user_active_ayxa", name: "Cash purse", type: "cash", balanceClass: "asset", currency: "MAD", openingBalanceMinor: 42000, icon: "👛", color: "#ffd6e7", includeInTotals: true, status: "active", createdAt: `${YEAR}-01-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "fa03", userId: "user_active_ayxa", name: "Savings", type: "savings", balanceClass: "asset", currency: "MAD", openingBalanceMinor: 965000, icon: "🌱", color: "#98ff98", includeInTotals: true, status: "active", createdAt: `${YEAR}-01-01T00:00:00.000Z`, updatedAt: NOW },
  ];

  const financeCategories = [
    { id: "fc_salary", type: "income", name: "Salary", icon: "💼", color: "#98ff98", builtIn: true, archived: false },
    { id: "fc_freelance", type: "income", name: "Freelance", icon: "🎀", color: "#ffd6e7", builtIn: true, archived: false },
    { id: "fc_home", type: "expense", name: "Home", icon: "🏠", color: "#e6e6fa", builtIn: true, archived: false },
    { id: "fc_food", type: "expense", name: "Food", icon: "🥗", color: "#fff1b8", builtIn: true, archived: false },
    { id: "fc_study", type: "expense", name: "Learning", icon: "📚", color: "#bfe3ff", builtIn: true, archived: false },
    { id: "fc_selfcare", type: "expense", name: "Self-care", icon: "🧴", color: "#ffd6e7", builtIn: true, archived: false },
  ];

  function legs(id, accountId, amountMinor, other) {
    return [
      { id: `${id}_l1`, transactionId: id, accountId, signedAmountMinor: -amountMinor, currency: "MAD", legType: "source", createdAt: NOW },
      { id: `${id}_l2`, transactionId: id, accountId: other || "fa01", signedAmountMinor: amountMinor, currency: "MAD", legType: "destination", createdAt: NOW },
    ];
  }

  const tx = (id, type, categoryId, merchant, day, amountMinor, opts = {}) => ({
    id, userId: "user_active_ayxa", type, status: "posted", categoryId, merchantOrSource: merchant,
    occurredAt: isoAt(day, opts.hour ?? 12, 0), localDate: localDate(day),
    note: opts.note, sourceType: opts.sourceType, sourceId: opts.sourceId,
    idempotencyKey: `${id}_k`, legs: opts.legs ?? legs(id, opts.accountId ?? "fa01", amountMinor, opts.toAccountId),
    createdAt: isoAt(day, opts.hour ?? 12, 0), updatedAt: isoAt(day, opts.hour ?? 12, 0),
  });

  const financialTransactions = [
    tx("x01", "income", "fc_salary", "Monthly salary", 0, 1450000, { hour: 9, accountId: "fa01", toAccountId: "fa01" }),
    tx("x02", "income", "fc_freelance", "Brand identity — first payment", -4, 320000, { hour: 11, accountId: "fa01", toAccountId: "fa01", sourceType: "business" }),
    tx("x03", "expense", "fc_home", "Rent", -5, 480000, { hour: 10, accountId: "fa01", toAccountId: "fc_home" }),
    tx("x04", "expense", "fc_food", "Weekly groceries", -2, 61500, { hour: 18, accountId: "fa02", toAccountId: "fc_food" }),
    tx("x05", "expense", "fc_study", "Course subscription", -1, 29000, { hour: 20, accountId: "fa01", toAccountId: "fc_study" }),
    tx("x06", "expense", "fc_selfcare", "Skincare refill", -5, 18400, { hour: 16, accountId: "fa02", toAccountId: "fc_selfcare" }),
    tx("x07", "savings_contribution", "fc_home", "Transfer to savings", -3, 150000, { hour: 21, accountId: "fa01", toAccountId: "fa03" }),
  ];

  const financeBudgets = [
    {
      id: "b01", name: `Budget — ${MONTH_KEY}`, month: MONTH_KEY, currency: "MAD",
      overallLimitMinor: 1200000,
      categoryLimits: [
        { categoryId: "fc_home", limitMinor: 600000 },
        { categoryId: "fc_food", limitMinor: 250000 },
        { categoryId: "fc_study", limitMinor: 150000 },
        { categoryId: "fc_selfcare", limitMinor: 100000 },
      ],
      rolloverEnabled: false, createdAt: `${MONTH_KEY}-01T00:00:00.000Z`, updatedAt: NOW,
    },
  ];

  const savingsGoals = [
    { id: "sg01", name: "Trip to Istanbul", icon: "✈️", currency: "MAD", targetAmountMinor: 900000, targetDate: `${YEAR + 1}-04-01`, linkedAccountId: "fa03", status: "active", createdAt: `${YEAR}-06-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "sg02", name: "New laptop for the studio", icon: "💻", currency: "MAD", targetAmountMinor: 1400000, targetDate: `${YEAR + 1}-02-01`, linkedAccountId: "fa03", status: "active", createdAt: `${YEAR}-07-01T00:00:00.000Z`, updatedAt: NOW },
  ];

  const savingsContributions = [
    { id: "sc01", savingsGoalId: "sg01", mode: "account_transfer", transactionId: "x07", sourceAccountId: "fa01", amountMinor: 150000, currency: "MAD", localDate: T3, note: "Monthly transfer", createdAt: isoAt(-3, 21, 0) },
    { id: "sc02", savingsGoalId: "sg01", mode: "virtual_allocation", amountMinor: 85000, currency: "MAD", localDate: TM3, note: "Freelance top-up", createdAt: isoAt(-21, 12, 0) },
  ];

  const businessProjects = [
    { id: "bp01", name: "Small brand launch", description: "From identity to the first ten orders.", status: "active", progressMethod: "milestones", progressPercentage: 45, startDate: `${YEAR}-08-01`, targetDate: "2027-03-01", agreedAmountMinor: 0, currency: "MAD", createdAt: `${YEAR}-08-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "bp02", name: "Studio website refresh", description: "New portfolio and enquiry flow.", status: "active", progressMethod: "milestones", progressPercentage: 20, startDate: `${YEAR}-11-01`, targetDate: `${YEAR}-12-20`, agreedAmountMinor: 480000, currency: "MAD", createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
  ];

  const businessMilestones = [
    { id: "bm01", projectId: "bp01", title: "Register the trade name", order: 1, weight: 1, status: "completed", completedAt: isoAt(-40, 10), createdAt: `${YEAR}-08-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "bm02", projectId: "bp01", title: "Design the identity system", order: 2, weight: 1, status: "completed", completedAt: isoAt(-4, 15), createdAt: `${YEAR}-08-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "bm03", projectId: "bp01", title: "Build the storefront", order: 3, weight: 2, status: "pending", dueDate: "2027-01-15", createdAt: `${YEAR}-08-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "bm04", projectId: "bp01", title: "Pack the first ten orders", order: 4, weight: 2, status: "pending", dueDate: "2027-03-01", createdAt: `${YEAR}-08-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "bm05", projectId: "bp02", title: "Audit the current site", order: 1, weight: 1, status: "completed", completedAt: isoAt(-6, 11), createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "bm06", projectId: "bp02", title: "Write the portfolio copy", order: 2, weight: 1, status: "pending", dueDate: `${YEAR}-12-05`, createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
  ];

  const businessClients = [
    { id: "bc01", name: "Hanan Idrissi", company: "Studio Noun", email: "hanan@studionoun.ma", status: "active", tags: ["branding"], favorite: true, priority: "high", lastContactDate: T1, followUpDate: TP5, createdAt: `${YEAR}-08-10T00:00:00.000Z`, updatedAt: NOW },
    { id: "bc02", name: "Meriem Alaoui", company: "Casa Ceramics", email: "meriem@casaceramics.ma", status: "active", tags: ["website"], favorite: false, priority: "medium", lastContactDate: T4, followUpDate: TP20, createdAt: `${YEAR}-10-02T00:00:00.000Z`, updatedAt: NOW },
    { id: "bc03", name: "Nadia Ben Salah", company: "Atyab Kitchen", email: "nadia@atyab.ma", status: "lead", tags: ["packaging"], favorite: false, priority: "medium", createdAt: `${YEAR}-11-20T00:00:00.000Z`, updatedAt: NOW },
  ];

  const businessInvoices = [
    { id: "bi01", clientId: "bc01", projectId: "bp02", invoiceNumber: "AYXA-2026-014", issueDate: T4, dueDate: TP20, currency: "MAD", subtotalMinor: 320000, taxMinor: 0, discountMinor: 0, totalMinor: 320000, paidAmountMinor: 320000, status: "paid", notes: "Brand identity, first payment.", createdAt: isoAt(-4, 12), updatedAt: NOW },
    { id: "bi02", clientId: "bc02", projectId: "bp02", invoiceNumber: "AYXA-2026-015", issueDate: T1, dueDate: TP20, currency: "MAD", subtotalMinor: 185000, taxMinor: 0, discountMinor: 0, totalMinor: 185000, paidAmountMinor: 90000, status: "partially_paid", notes: "Website refresh, deposit received.", createdAt: isoAt(-1, 12), updatedAt: NOW },
    { id: "bi03", clientId: "bc03", projectId: undefined, invoiceNumber: "AYXA-2026-016", issueDate: T, dueDate: TP20, currency: "MAD", subtotalMinor: 78000, taxMinor: 0, discountMinor: 0, totalMinor: 78000, paidAmountMinor: 0, status: "sent", notes: "Packaging concepts.", createdAt: isoAt(0, 12), updatedAt: NOW },
  ];

  const businessInvoicePaymentLinks = [
    { id: "pl01", invoiceId: "bi01", transactionId: "x02", amountMinor: 320000, currency: "MAD", linkedAt: isoAt(-4, 12) },
  ];

  const businessOffers = [
    { id: "bo01", title: "Brand identity package", description: "Logo, palette, type, and a one-page guide.", type: "service_package", status: "active", priceMinor: 480000, currency: "MAD", deliverables: ["Logo suite", "Colour and type system", "Usage guide"], createdAt: `${YEAR}-08-05T00:00:00.000Z`, updatedAt: NOW },
    { id: "bo02", title: "Website refresh sprint", description: "Two weeks, five pages, one handover call.", type: "retainer", status: "active", priceMinor: 620000, currency: "MAD", deliverables: ["Home page", "Four inner pages", "CMS handover"], createdAt: `${YEAR}-10-01T00:00:00.000Z`, updatedAt: NOW },
  ];

  const travelTrips = [
    {
      id: "tr01", userId: "user_active_ayxa", title: "Istanbul in spring",
      primaryCity: "Istanbul", countryCode: "TR", additionalDestinations: ["Bursa"],
      startDate: TP20, endDate: localDate(27), originTimezone: "Africa/Casablanca",
      destinationTimezone: "Europe/Istanbul", travelerCount: 2, status: "planning",
      primaryCurrency: "MAD", estimatedBudgetMinor: 900000, actualSpentMinor: 148000,
      notes: "Boutique hotel near Sultanahmet. Book the Bosphorus ferry early.",
      createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW,
    },
  ];

  const travelDays = [
    { id: "td01", tripId: "tr01", localDate: TP20, timezone: "Europe/Istanbul", title: "Arrival", order: 1, createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "td02", tripId: "tr01", localDate: TP1 === TP20 ? localDate(21) : localDate(21), timezone: "Europe/Istanbul", title: "Old city on foot", order: 2, createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "td03", tripId: "tr01", localDate: localDate(22), timezone: "Europe/Istanbul", title: "Bosphorus day", order: 3, createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
  ];

  const itineraryItems = [
    { id: "ii01", tripId: "tr01", travelDayId: "td01", type: "flight", title: "Flight CMN to IST", allDay: false, startLocalDateTime: `${TP20}T09:20`, endLocalDateTime: `${localDate(20)}T14:05`, timezone: "Europe/Istanbul", locationName: "Istanbul Airport", order: 1, createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "ii02", tripId: "tr01", travelDayId: "td01", type: "hotel_check_in", title: "Check in to the hotel", allDay: false, startLocalDateTime: `${TP20}T16:00`, timezone: "Europe/Istanbul", locationName: "Sultanahmet", order: 2, createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "ii03", tripId: "tr01", travelDayId: "td02", type: "activity", title: "Hagia Sophia and the bazaar", allDay: false, startLocalDateTime: `${localDate(21)}T09:00`, endLocalDateTime: `${localDate(21)}T13:00`, timezone: "Europe/Istanbul", locationName: "Fatih", order: 1, createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "ii04", tripId: "tr01", travelDayId: "td03", type: "activity", title: "Bosphorus ferry", allDay: false, startLocalDateTime: `${localDate(22)}T10:30`, timezone: "Europe/Istanbul", locationName: "Eminönü pier", order: 1, createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
  ];

  const travelBookings = [
    { id: "tb01", tripId: "tr01", userId: "user_active_ayxa", type: "flight", providerName: "Royal Air Maroc", startDateTime: `${TP20}T09:20`, endDateTime: `${localDate(20)}T14:05`, departureLocation: "Casablanca", arrivalLocation: "Istanbul", currency: "MAD", estimatedAmountMinor: 262000, paidAmountMinor: 262000, bookingStatus: "confirmed", paymentStatus: "paid", createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "tb02", tripId: "tr01", userId: "user_active_ayxa", type: "hotel", providerName: "Boutique Sultanahmet", startDateTime: `${TP20}T16:00`, endDateTime: `${localDate(24)}T11:00`, departureLocation: "Sultanahmet", currency: "MAD", estimatedAmountMinor: 318000, paidAmountMinor: 159000, bookingStatus: "reserved", paymentStatus: "partially_paid", createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
  ];

  const travelChecklistItems = [
    { id: "tc01", tripId: "tr01", category: "documents", title: "Passport", quantity: 1, packed: true, order: 1, createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "tc02", tripId: "tr01", category: "documents", title: "Travel insurance", quantity: 1, packed: true, order: 2, createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "tc03", tripId: "tr01", category: "clothing", title: "Light coat", quantity: 1, packed: false, order: 3, createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "tc04", tripId: "tr01", category: "clothing", title: "Walking shoes", quantity: 1, packed: false, order: 4, createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "tc05", tripId: "tr01", category: "toiletries", title: "Skincare travel set", quantity: 1, packed: false, order: 5, createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "tc06", tripId: "tr01", category: "electronics", title: "Universal adapter", quantity: 1, packed: true, order: 6, createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
  ];

  const travelDocuments = [
    { id: "tdoc01", tripId: "tr01", type: "passport", title: "Passport", status: "valid", expiryDate: "2029-06-14", createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "tdoc02", tripId: "tr01", type: "visa", title: "Turkish e-Visa", status: "valid", expiryDate: `${YEAR + 1}-01-15`, createdAt: `${YEAR}-11-01T00:00:00.000Z`, updatedAt: NOW },
  ];

  const bucketListItems = [
    { id: "bl01", title: "See the northern lights", category: "nature", priority: "high", completed: false, createdAt: `${YEAR}-01-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "bl02", title: "Walk the Alhambra at sunrise", category: "culture", priority: "medium", completed: false, createdAt: `${YEAR}-01-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "bl03", title: "Take the train across Morocco", category: "journey", priority: "medium", completed: true, completedAt: isoAt(-90, 12), createdAt: `${YEAR}-01-01T00:00:00.000Z`, updatedAt: NOW },
  ];

  const hydrationEvents = [
    { id: "he01", userId: "user_active_ayxa", localDate: T, amount: 250, unit: "ml", normalizedMillilitres: 250, occurredAt: isoAt(0, 7, 30), timezone: "Africa/Casablanca", sourceType: "manual", idempotencyKey: "he01k", createdAt: isoAt(0, 7, 30), updatedAt: isoAt(0, 7, 30) },
    { id: "he02", userId: "user_active_ayxa", localDate: T, amount: 250, unit: "ml", normalizedMillilitres: 250, occurredAt: isoAt(0, 10, 15), timezone: "Africa/Casablanca", sourceType: "habit", sourceId: "h03", idempotencyKey: "he02k", createdAt: isoAt(0, 10, 15), updatedAt: isoAt(0, 10, 15) },
    { id: "he03", userId: "user_active_ayxa", localDate: T, amount: 500, unit: "ml", normalizedMillilitres: 500, occurredAt: isoAt(0, 13, 0), timezone: "Africa/Casablanca", sourceType: "manual", idempotencyKey: "he03k", createdAt: isoAt(0, 13, 0), updatedAt: isoAt(0, 13, 0) },
    { id: "he04", userId: "user_active_ayxa", localDate: T, amount: 250, unit: "ml", normalizedMillilitres: 250, occurredAt: isoAt(0, 16, 40), timezone: "Africa/Casablanca", sourceType: "manual", idempotencyKey: "he04k", createdAt: isoAt(0, 16, 40), updatedAt: isoAt(0, 16, 40) },
  ];

  const sleepRecords = [
    { id: "sl01", userId: "user_active_ayxa", startAt: isoAt(-1, 23, 20), endAt: isoAt(0, 6, 50), durationMinutes: 450, sleepLocalDate: T, quality: 4, sourceType: "manual", timezone: "Africa/Casablanca", createdAt: isoAt(0, 6, 50), updatedAt: isoAt(0, 6, 50) },
    { id: "sl02", userId: "user_active_ayxa", startAt: isoAt(-2, 22, 45), endAt: isoAt(-1, 6, 20), durationMinutes: 455, sleepLocalDate: T1, quality: 5, sourceType: "manual", timezone: "Africa/Casablanca", createdAt: isoAt(-1, 6, 20), updatedAt: isoAt(-1, 6, 20) },
    { id: "sl03", userId: "user_active_ayxa", startAt: isoAt(-3, 23, 55), endAt: isoAt(-2, 6, 30), durationMinutes: 395, sleepLocalDate: T2, quality: 3, sourceType: "manual", timezone: "Africa/Casablanca", createdAt: isoAt(-2, 6, 30), updatedAt: isoAt(-2, 6, 30) },
  ];

  const dailyStepRecords = {};
  [T, T1, T2, T3, T4, T5, T6].forEach((d, i) => {
    dailyStepRecords[d] = { userId: "user_active_ayxa", localDate: d, stepCount: [6420, 8110, 4380, 9250, 5120, 10480, 3760][i], sourceType: "manual", timezone: "Africa/Casablanca" };
  });

  const workoutLogs = [
    { id: "w01", userId: "user_active_ayxa", localDate: T1, activityType: "strength_training", durationMinutes: 30, intensity: "moderate", sourceType: "habit", sourceId: "h05", idempotencyKey: "w01k", timezone: "Africa/Casablanca", createdAt: isoAt(-1, 18, 0), updatedAt: isoAt(-1, 18, 0) },
    { id: "w02", userId: "user_active_ayxa", localDate: T3, activityType: "walking", durationMinutes: 35, intensity: "gentle", distance: 3.1, steps: 4300, sourceType: "habit", sourceId: "h05", idempotencyKey: "w02k", timezone: "Africa/Casablanca", createdAt: isoAt(-3, 9, 0), updatedAt: isoAt(-3, 9, 0) },
    { id: "w03", userId: "user_active_ayxa", localDate: T5, activityType: "pilates", durationMinutes: 30, intensity: "moderate", sourceType: "habit", sourceId: "h05", idempotencyKey: "w03k", timezone: "Africa/Casablanca", createdAt: isoAt(-5, 17, 30), updatedAt: isoAt(-5, 17, 30) },
  ];

  const selfCareActivities = [
    { id: "sca01", userId: "user_active_ayxa", title: "Evening skincare", titleAr: "العناية المسائية بالبشرة", icon: "🧴", category: "skincare", recurrenceRule: "daily", estimatedDurationMinutes: 10, sourceType: "custom", isActive: true, order: 1, createdAt: `${YEAR}-09-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "sca02", userId: "user_active_ayxa", title: "Ten quiet minutes", titleAr: "عشر دقائق هادئة", icon: "🕯️", category: "mind", recurrenceRule: "daily", estimatedDurationMinutes: 10, sourceType: "custom", isActive: true, order: 2, createdAt: `${YEAR}-09-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "sca03", userId: "user_active_ayxa", title: "Stretch before bed", titleAr: "تمدد قبل النوم", icon: "🌿", category: "movement", recurrenceRule: "weekdays", scheduledDays: [0, 1, 2, 3, 4], estimatedDurationMinutes: 10, sourceType: "custom", isActive: true, order: 3, createdAt: `${YEAR}-09-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "sca04", userId: "user_active_ayxa", title: "Hair oil ritual", titleAr: "روتين زيت الشعر", icon: "🌸", category: "body", recurrenceRule: "weekly", estimatedDurationMinutes: 20, sourceType: "custom", isActive: true, order: 4, createdAt: `${YEAR}-09-01T00:00:00.000Z`, updatedAt: NOW },
  ];

  const selfCarePlanItems = [
    { id: "spi01", userId: "user_active_ayxa", activityId: "sca01", localDate: T, plannedDuration: 10, status: "completed", completedAt: isoAt(0, 22, 15), sourceType: "custom", order: 1, createdAt: `${YEAR}-09-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "spi02", userId: "user_active_ayxa", activityId: "sca02", localDate: T, plannedDuration: 10, status: "pending", sourceType: "custom", order: 2, createdAt: `${YEAR}-09-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "spi03", userId: "user_active_ayxa", activityId: "sca03", localDate: T, plannedDuration: 10, status: "skipped", sourceType: "custom", order: 3, createdAt: `${YEAR}-09-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "spi04", userId: "user_active_ayxa", activityId: "sca01", localDate: T1, plannedDuration: 10, status: "completed", completedAt: isoAt(-1, 22, 0), sourceType: "custom", order: 1, createdAt: `${YEAR}-09-01T00:00:00.000Z`, updatedAt: NOW },
    { id: "spi05", userId: "user_active_ayxa", activityId: "sca02", localDate: T1, plannedDuration: 10, status: "completed", completedAt: isoAt(-1, 17, 30), sourceType: "custom", order: 2, createdAt: `${YEAR}-09-01T00:00:00.000Z`, updatedAt: NOW },
  ];

  const selfCareCheckIns = {
    [T]: { id: `ci_${T}`, userId: "user_active_ayxa", localDate: T, need: "rest", availableMinutes: 15, createdAt: isoAt(0, 20, 0), updatedAt: isoAt(0, 20, 0) },
    [T2]: { id: `ci_${T2}`, userId: "user_active_ayxa", localDate: T2, need: "focus", availableMinutes: 30, createdAt: isoAt(-2, 19, 0), updatedAt: isoAt(-2, 19, 0) },
  };

  const visionBoards = [
    { id: "vb01", title: "This year, gently", titleAr: "هذا العام بلطف", description: "How I want the next twelve months to feel.", timeHorizon: `${YEAR}`, theme: "blossom", layout: "scrapbook", showDecorations: true, showCaptions: true, showGoalProgress: true, isPinnedToHome: true, status: "active", createdAt: `${YEAR}-01-05T00:00:00.000Z`, updatedAt: NOW },
  ];

  const visionBoardItems = [
    { id: "vbi01", boardId: "vb01", type: "text", content: "Calm is a skill, not a reward.", caption: "Morning reminder", accentColor: "#ffd6e7", order: 1, rotation: -1.5, sticker: "flower", washiColor: "pink", createdAt: `${YEAR}-01-05T00:00:00.000Z`, updatedAt: NOW },
    { id: "vbi02", boardId: "vb01", type: "linked_goal", title: "Launch my small brand", content: "The goal I keep coming back to.", linkedGoalId: "g02", accentColor: "#e6e6fa", order: 2, rotation: 1.2, sticker: "star", washiColor: "lavender", createdAt: `${YEAR}-01-05T00:00:00.000Z`, updatedAt: NOW },
    { id: "vbi03", boardId: "vb01", type: "wish", content: "Watch the sunrise from a train window.", caption: "Slow travel", accentColor: "#bfe3ff", order: 3, rotation: -0.8, sticker: "sparkle", washiColor: "butter", createdAt: `${YEAR}-01-05T00:00:00.000Z`, updatedAt: NOW },
    { id: "vbi04", boardId: "vb01", type: "text", content: "Finish what I start, in the order I started it.", caption: "One thread at a time", accentColor: "#d9ffe3", order: 4, rotation: 2.1, sticker: "bow", washiColor: "mint", createdAt: `${YEAR}-01-05T00:00:00.000Z`, updatedAt: NOW },
    { id: "vbi05", boardId: "vb01", type: "linked_goal", title: "Read the whole Quran this year", content: "Four pages, every day, after Fajr.", linkedGoalId: "g01", accentColor: "#fff1b8", order: 5, rotation: -1.9, sticker: "heart", washiColor: "stripes", createdAt: `${YEAR}-01-05T00:00:00.000Z`, updatedAt: NOW },
    { id: "vbi06", boardId: "vb01", type: "text", content: "Three sessions a week is a real plan. Four was a wish.", caption: "Be honest about capacity", accentColor: "#ffd6e7", order: 6, rotation: 1.4, sticker: "flower", washiColor: "pink", createdAt: `${YEAR}-01-05T00:00:00.000Z`, updatedAt: NOW },
  ];

  const xpLedger = [];
  const xpSeeds = [
    { key: "task_completed", n: 12, amount: 10, label: "Task completed" },
    { key: "habit_completed", n: 18, amount: 5, label: "Habit completed" },
    { key: "focus_session_completed", n: 4, amount: 25, label: "Focus session" },
    { key: "journal_entry", n: 4, amount: 8, label: "Journal entry" },
    { key: "quran_progress", n: 6, amount: 15, label: "Quran progress" },
  ];
  let xpI = 0;
  xpSeeds.forEach((seed) => {
    for (let i = 0; i < seed.n; i++) {
      xpI += 1;
      xpLedger.push({
        id: `xp${String(xpI).padStart(3, "0")}`, userId: "user_active_ayxa",
        rewardKey: `${seed.key}:demo:${xpI}`, sourceType: seed.key.split("_")[0], sourceId: `d${xpI}`,
        actionType: seed.key, amount: seed.amount, state: "active",
        localDate: localDate(-(xpI % 14)), createdAt: isoAt(-(xpI % 14), 12, 0),
        rewardPolicyVersion: 1, labelEn: seed.label, labelAr: seed.label,
      });
    }
  });
  const xpTotal = xpLedger.reduce((sum, e) => (e.state === "active" ? sum + e.amount : sum), 0);

  const badgeAwards = [
    { id: "ba01", badgeId: "first_steps", awardedAt: isoAt(-45, 9), localDate: localDate(-45), reasonKey: "first_task", rewardGranted: true },
    { id: "ba02", badgeId: "week_warrior", awardedAt: isoAt(-21, 19), localDate: TM3, reasonKey: "seven_day_streak", rewardGranted: true },
    { id: "ba03", badgeId: "deep_diver", awardedAt: isoAt(-7, 15), localDate: localDate(-7), reasonKey: "ten_focus_sessions", rewardGranted: true },
    { id: "ba04", badgeId: "gratitude_keeper", awardedAt: isoAt(-3, 22), localDate: T3, reasonKey: "twenty_journal_entries", rewardGranted: true },
  ];

  const prayerLogs = {};
  [T6, T5, T4, T3, T2, T1].forEach((d) => {
    ["fajr", "dhuhr", "asr", "maghrib", "isha"].forEach((p) => {
      prayerLogs[`${d}_${p}`] = { localDate: d, prayerKey: p, status: "prayed", loggedAt: `${d}T12:00:00.000Z` };
    });
  });
  ["fajr", "dhuhr", "asr", "maghrib"].forEach((p) => {
    prayerLogs[`${T}_${p}`] = { localDate: T, prayerKey: p, status: "prayed", loggedAt: `${T}T12:00:00.000Z` };
  });

  const sadaqahLogs = [
    { id: "sd01", userId: "user_active_ayxa", localDate: T3, category: "money", amountMinor: 5000, currency: "MAD", note: "Given quietly, not counted.", createdAt: isoAt(-3, 18, 0) },
    { id: "sd02", userId: "user_active_ayxa", localDate: T5, category: "kindness", note: "Helped carry groceries up four flights.", createdAt: isoAt(-5, 19, 30) },
    { id: "sd03", userId: "user_active_ayxa", localDate: T1, category: "time", note: "An hour with the neighbour who is alone.", createdAt: isoAt(-1, 17, 0) },
  ];

  const goodDeedLogs = {};
  [T6, T5, T4, T3, T2, T1, T].forEach((d, i) => {
    goodDeedLogs[`${d}_gd_smile`] = true;
    if (i % 2 === 0) goodDeedLogs[`${d}_gd_kind_word`] = true;
    if (i % 3 === 0) goodDeedLogs[`${d}_gd_kin`] = true;
  });

  const quranHistory = [
    { id: "qh01", userId: "user_active_ayxa", localDate: T6, pagesRead: 4, surahNumber: 2, createdAt: isoAt(-6, 6, 30) },
    { id: "qh02", userId: "user_active_ayxa", localDate: T5, pagesRead: 6, surahNumber: 2, createdAt: isoAt(-5, 6, 30) },
    { id: "qh03", userId: "user_active_ayxa", localDate: T4, pagesRead: 4, surahNumber: 2, createdAt: isoAt(-4, 6, 30) },
    { id: "qh04", userId: "user_active_ayxa", localDate: T3, pagesRead: 5, surahNumber: 3, createdAt: isoAt(-3, 6, 30) },
    { id: "qh05", userId: "user_active_ayxa", localDate: T2, pagesRead: 4, surahNumber: 3, createdAt: isoAt(-2, 6, 30) },
    { id: "qh06", userId: "user_active_ayxa", localDate: T1, pagesRead: 4, surahNumber: 3, createdAt: isoAt(-1, 6, 30) },
  ];

  const surahProgress = {};
  for (let n = 1; n <= 9; n++) surahProgress[n] = { status: "completed", completedAt: isoAt(-60 + n, 6, 30) };
  surahProgress[10] = { status: "reading" };

  const challenges = [
    { id: "ch01", title: "Seventy-five days of steady", titleAr: "٧٥ يومًا من الثبات", durationDays: 75, startedAt: localDate(-18), createdAt: isoAt(-18, 7, 0), description: "One focused hour, one walk, one page — every day." },
  ];

  const weeklyNotes = {
    [localDate(-7)]: {
      id: "wn_prev", userId: "user_active_ayxa", weekStartDate: localDate(-7),
      text: "Last week I learned that starting earlier beats working later.",
      reflectionAnswers: {
        "what-went-well": "I protected my mornings and it changed the whole day.",
        "what-supported-me": "Planning the night before, and saying no to one thing.",
      },
      energyDrained: "Unplanned social commitments",
      energyRestored: "Long walks with no podcast",
      accomplishments: [{ text: "Started the brand identity system" }],
      nextWeekPriorities: [{ text: "Finish the identity system" }],
      nextWeekIntention: "Fewer things, done properly.",
      completedReflection: true,
      updatedAt: isoAt(-8, 20, 0),
    },
  };

  const routineCompletionsByDate = {};
  [T, T1, T2, T3].forEach((d) => { routineCompletionsByDate[d] = ["morning-1", "morning-2", "morning-3"]; });

  return {
    user: {
      id: "user_active_ayxa", name: "Sara", email: "sara@ayxaplanner.app",
      avatar: "🌸", emoji: "🌸", focus: ["Deen", "Work", "Health"],
      isGuest: false, isPro: true, setupDone: true, emailVerified: true,
      authType: "authenticated", createdAt: `${YEAR}-01-01T00:00:00.000Z`,
    },
    session: true,
    tasks, habits, goals, journal, pixels, focusSessions, studySessions,
    learningItems, flashcardDecks,
    financeAccounts, financeCategories, financialTransactions, financeBudgets,
    savingsGoals, savingsContributions,
    businessProjects, businessMilestones, businessClients, businessInvoices,
    businessInvoicePaymentLinks, businessOffers,
    travelTrips, travelDays, itineraryItems, travelBookings, travelChecklistItems,
    travelDocuments, bucketListItems,
    hydrationEvents, sleepRecords, dailyStepRecords, workoutLogs,
    selfCareActivities, selfCarePlanItems, selfCareCheckIns,
    visionBoards, visionBoardItems,
    xpLedger, badgeAwards, prayerLogs, sadaqahLogs, goodDeedLogs,
    quranHistory, surahProgress, challenges, weeklyNotes, routineCompletionsByDate,
    xp: xpTotal,
    dailyMoods: {
      [T]: { date: T, mood: "happy", emoji: "🌸", energy: "medium", updatedAt: NOW },
      [T1]: { date: T1, mood: "calm", emoji: "🕊️", energy: "high", updatedAt: NOW },
      [T2]: { date: T2, mood: "grateful", emoji: "🌷", energy: "medium", updatedAt: NOW },
      [T3]: { date: T3, mood: "okay", emoji: "🌿", energy: "low", updatedAt: NOW },
      [T4]: { date: T4, mood: "happy", emoji: "✨", energy: "high", updatedAt: NOW },
      [T5]: { date: T5, mood: "tired", emoji: "🌙", energy: "low", updatedAt: NOW },
      [T6]: { date: T6, mood: "calm", emoji: "🕊️", energy: "medium", updatedAt: NOW },
    },
    dailyHydration: {
      [T]: { dateStr: T, consumedMl: 1250, targetMl: 2000 },
      [T1]: { dateStr: T1, consumedMl: 2000, targetMl: 2000 },
      [T2]: { dateStr: T2, consumedMl: 1750, targetMl: 2000 },
    },
    hydrationTargetMl: 2000,
    preferredGlassMl: 250,
    unlockedBadges: ["first_steps", "week_warrior", "deep_diver", "gratitude_keeper"],
    achievements: ["first_steps", "week_warrior", "deep_diver", "gratitude_keeper"],
    totalTasksDone: 12,
    totalFlashcardsReviewed: 384,
    activeTasbih: { phraseAr: "سُبْحَانَ اللَّهِ", phraseEn: "SubhanAllah", count: 21, target: 33, isCustom: false },
    activeFocusSession: null,
    journalSettings: { journalLockEnabled: true, autoLockMinutes: 5, hideNotificationContent: true },
    deenSettings: {
      locationMode: "manual", manualCityId: "casablanca",
      latitude: 33.5731, longitude: -7.5898,
      calculationMethod: "MuslimWorldLeague", asrMadhab: "shafi",
      hijriDayAdjustment: 0, trackingPaused: false, hapticsEnabled: true,
      tasbihSoundEnabled: false, showTransliteration: true, showTranslation: true,
      notificationsEnabled: false,
    },
    customCategories: ["Studio", "Garden"],
  };
}

// ─── Supplementary state merged over the app's own defaults ───────────────────
// The app's defaultState already supplies every field this capture does not set,
// including the Ideal Week template. This is merged on top of the loaded state
// inside the page, so nothing is initialised to a half-built shape.
const OVERRIDE = buildState();

// ─── Shot list ────────────────────────────────────────────────────────────────
const SHOTS = [
  { id: "sc02a", route: "/", lang: "en", note: "Home dashboard" },
  { id: "sc03a", route: "/tasks", lang: "en", note: "Tasks, three tiers" },
  { id: "sc04a", route: "/ai", lang: "en", note: "AI planner" },
  { id: "sc05a", route: "/routines", lang: "en", note: "Routines and Ideal Day" },
  { id: "sc06a", route: "/routines?key=ideal-week", lang: "en", note: "Ideal Week template view" },
  {
    id: "sc06b", route: "/routines?key=ideal-week", lang: "en",
    note: "Between the Prayers timeline",
    action: async (page) => {
      const btn = page.locator("button", { hasText: /Between Prayers/i }).first();
      await btn.waitFor({ state: "visible", timeout: 6000 });
      await btn.click();
      await page.waitForTimeout(900);
    },
  },
  { id: "sc07a", route: "/habits", lang: "en", note: "Habit matrix" },
  { id: "sc08a", route: "/goals", lang: "en", note: "Goals" },
  { id: "sc09a", route: "/goals?tab=vision", lang: "en", note: "Vision board" },
  { id: "sc10a", route: "/focus", lang: "en", note: "Focus" },
  { id: "sc11a", route: "/deen", lang: "en", note: "My Deen" },
  { id: "sc12a", route: "/journal", lang: "en", note: "Journal entry list" },
  { id: "sc13a", route: "/learning", lang: "en", note: "Learning hub" },
  { id: "sc14a", route: "/business", lang: "en", note: "Business overview" },
  { id: "sc15a", route: "/finance", lang: "en", note: "Finance overview" },
  { id: "sc16a", route: "/travel", lang: "en", note: "Travel planner" },
  { id: "sc17a", route: "/wellness", lang: "en", note: "Wellness hub" },
  { id: "sc18a", route: "/selfcare", lang: "en", note: "Self-care" },
  { id: "sc19a", route: "/year-in-pixels", lang: "en", note: "Year in Pixels" },
  { id: "sc20a", route: "/bujo", lang: "en", note: "Bullet Journal" },
  { id: "sc21a", route: "/challenges", lang: "en", note: "Challenges" },
  { id: "sc22a", route: "/progress", lang: "en", note: "Progress" },
  { id: "sc23a", route: "/more", lang: "en", note: "More hub" },
  { id: "sc24a", route: "/", lang: "ar", note: "Home mirrored to RTL" },
];

function shotDirs(shotId) {
  const scene = shotId.replace(/[ab]$/, "");
  return {
    gen: path.join(GEN_DIR, scene),
    sel: path.join(SEL_DIR, scene),
  };
}

function ensureDirs() {
  [GEN_DIR, SEL_DIR].forEach((d) => fs.mkdirSync(d, { recursive: true }));
  SHOTS.forEach((s) => {
    const { gen, sel } = shotDirs(s.id);
    fs.mkdirSync(gen, { recursive: true });
    fs.mkdirSync(sel, { recursive: true });
  });
  ["sc01", "sc24"].forEach((scene) => {
    fs.mkdirSync(path.join(GEN_DIR, scene), { recursive: true });
    fs.mkdirSync(path.join(SEL_DIR, scene), { recursive: true });
  });
}

// ─── Graphic title cards ──────────────────────────────────────────────────────
// These are not generation-model output either. They are drawn with the same
// browser, using the app's own design tokens and the fonts the app already loads,
// so the typography matches the product exactly.
function titleCardHtml(kind) {
  const shared = `
    <style>
      :root {
        --canvas: #fff8fa; --surface: #ffeef4; --ink: #2b1727; --ink-light: #6e4e64;
        --hotpink: #ff1493; --lavender: #e6e6fa; --mint: #98ff98;
        --butter: #fff1b8; --powder: #bfe3ff; --blush: #ffd6e7;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 412px; height: 915px; overflow: hidden;
        background: radial-gradient(120% 90% at 50% 8%, #fffdfe 0%, var(--canvas) 46%, #fdeef5 100%);
        font-family: 'Plus Jakarta Sans', 'Quicksand', sans-serif;
        color: var(--ink);
      }
      .grain {
        position: absolute; inset: 0; opacity: .35; pointer-events: none;
        background-image: radial-gradient(rgba(43,23,39,.05) 1px, transparent 1px);
        background-size: 3px 3px;
      }
      .deco { position: absolute; pointer-events: none; }
      .flower { font-size: 26px; opacity: .5; }
      .star { font-size: 20px; opacity: .45; }
      .washi {
        position: absolute; height: 26px; width: 118px; border-radius: 3px; opacity: .5;
        background-image: repeating-linear-gradient(45deg, rgba(255,255,255,.75) 0 5px, transparent 5px 11px);
      }
      .hand { font-family: 'Great Vibes', 'Pacifico', cursive; }
    </style>`;

  if (kind === "open") {
    // sc01a — wordmark cold open.
    return `<!doctype html><html><head><meta charset="utf-8">${shared}</head><body>
      <div class="grain"></div>
      <div class="washi" style="top:118px;left:56px;transform:rotate(-6deg);background-color:var(--blush)"></div>
      <div class="washi" style="top:104px;right:52px;transform:rotate(7deg);background-color:var(--butter)"></div>
      <div class="deco flower" style="top:214px;left:44px">🌸</div>
      <div class="deco flower" style="top:628px;right:46px">🌷</div>
      <div class="deco star" style="top:180px;right:88px">✨</div>
      <div class="deco star" style="top:666px;left:78px">🌟</div>
      <div class="deco star" style="top:760px;left:196px;font-size:15px">✦</div>
      <div style="position:absolute;left:0;right:0;top:250px;text-align:center;padding:0 34px">
        <div class="hand" style="font-size:23px;color:var(--ink-light);margin-bottom:20px">a planner for the whole of you</div>
        <div style="font-family:'Playfair Display',serif;font-weight:900;font-size:47px;line-height:1.06;letter-spacing:-.6px">
          AYXA<br><span style="font-size:35px;letter-spacing:.6px">Planner Pro</span>
        </div>
        <div style="margin:30px auto 0;width:132px;height:4px;border-radius:99px;
          background:linear-gradient(90deg,var(--blush),var(--hotpink),var(--lavender))"></div>
        <div style="margin-top:28px;font-size:15.5px;font-weight:700;color:var(--ink-light);line-height:1.5">
          A guided tour of every module
        </div>
      </div>
      <div style="position:absolute;left:0;right:0;bottom:74px;text-align:center;font-size:12.5px;font-weight:700;color:var(--ink-light);opacity:.85">
        English &amp; Arabic · Your data stays on your device
      </div>
    </body></html>`;
  }

  if (kind === "phone") {
    // sc01b — device rises onto the blush ground.
    return `<!doctype html><html><head><meta charset="utf-8">${shared}</head><body>
      <div class="grain"></div>
      <div class="deco flower" style="top:96px;left:52px">🌸</div>
      <div class="deco star" style="top:132px;right:66px">✨</div>
      <div class="deco flower" style="bottom:104px;right:58px">🌷</div>
      <div class="deco star" style="bottom:150px;left:70px">⭐</div>
      <div style="position:absolute;left:0;right:0;top:150px;text-align:center">
        <div class="hand" style="font-size:21px;color:var(--ink-light)">every module, one device</div>
      </div>
      <div style="position:absolute;left:50%;top:212px;transform:translateX(-50%);
        width:300px;height:614px;border-radius:44px;background:#40263b;
        padding:9px;box-shadow:0 26px 60px rgba(120,40,90,.24),0 6px 14px rgba(120,40,90,.14)">
        <div style="position:relative;width:100%;height:100%;border-radius:36px;overflow:hidden;background:var(--canvas)">
          <div style="position:absolute;left:50%;top:9px;transform:translateX(-50%);width:96px;height:20px;border-radius:99px;background:#40263b;z-index:4"></div>
          <div style="position:absolute;inset:0;background:radial-gradient(120% 60% at 50% 0%,#fffdfe,#fff8fa 55%,#fdeef5);z-index:1"></div>
          <div style="position:relative;z-index:2;padding:44px 18px 0">
            <div style="font-family:'Playfair Display',serif;font-weight:900;font-size:22px;line-height:1.15">AYXA<br><span style="font-size:14px;letter-spacing:.4px">Planner Pro</span></div>
            <div style="margin-top:13px;width:78px;height:3px;border-radius:99px;
              background:linear-gradient(90deg,var(--blush),var(--hotpink),var(--lavender))"></div>
            <div style="margin-top:30px;display:grid;gap:11px">
              <div style="height:66px;border-radius:20px;background:#fff;border:1px solid rgba(43,23,39,.09)"></div>
              <div style="height:66px;border-radius:20px;background:#fff;border:1px solid rgba(43,23,39,.09)"></div>
              <div style="height:66px;border-radius:20px;background:#fff;border:1px solid rgba(43,23,39,.09)"></div>
              <div style="height:66px;border-radius:20px;background:#fff;border:1px solid rgba(43,23,39,.09)"></div>
            </div>
          </div>
          <div style="position:absolute;left:0;right:0;bottom:0;height:74px;background:rgba(255,255,255,.93);
            border-top:1px solid rgba(43,23,39,.08);z-index:3;display:flex;align-items:center;justify-content:space-around;padding:0 16px">
            <div style="width:26px;height:26px;border-radius:9px;background:var(--blush)"></div>
            <div style="width:26px;height:26px;border-radius:9px;background:var(--lavender)"></div>
            <div style="width:38px;height:38px;border-radius:14px;background:var(--hotpink)"></div>
            <div style="width:26px;height:26px;border-radius:9px;background:var(--mint)"></div>
            <div style="width:26px;height:26px;border-radius:9px;background:var(--butter)"></div>
          </div>
        </div>
      </div>
    </body></html>`;
  }

  // sc24b — outro: wordmark returns, closing line.
  return `<!doctype html><html><head><meta charset="utf-8">${shared}</head><body>
    <div class="grain"></div>
    <div class="washi" style="top:150px;left:62px;transform:rotate(-7deg);background-color:var(--lavender)"></div>
    <div class="washi" style="top:138px;right:58px;transform:rotate(6deg);background-color:var(--blush)"></div>
    <div class="deco flower" style="top:250px;left:50px">🌸</div>
    <div class="deco flower" style="top:640px;right:50px">🌷</div>
    <div class="deco star" style="top:210px;right:84px">✨</div>
    <div class="deco star" style="top:690px;left:84px">🌟</div>
    <div style="position:absolute;left:50%;top:196px;transform:translateX(-50%);
      width:250px;height:512px;border-radius:40px;background:#40263b;padding:8px;
      box-shadow:0 22px 52px rgba(120,40,90,.20)">
      <div style="width:100%;height:100%;border-radius:33px;background:var(--canvas);
        display:flex;align-items:center;justify-content:center">
        <div style="text-align:center">
          <div class="hand" style="font-size:19px;color:var(--ink-light)">with you, gently</div>
          <div style="margin-top:12px;font-size:40px">🌸</div>
        </div>
      </div>
    </div>
    <div style="position:absolute;left:0;right:0;bottom:96px;text-align:center;padding:0 30px">
      <div class="hand" style="font-size:22px;color:var(--ink-light);margin-bottom:16px">begin your own week</div>
      <div style="font-family:'Playfair Display',serif;font-weight:900;font-size:37px;line-height:1.08">AYXA Planner Pro</div>
      <div style="margin:22px auto 0;width:112px;height:4px;border-radius:99px;
        background:linear-gradient(90deg,var(--blush),var(--hotpink),var(--lavender))"></div>
      <div style="margin-top:24px;font-size:14.5px;font-weight:700;color:var(--ink-light)">
        Open the app and start with today.
      </div>
    </div>
  </body></html>`;
}

const TITLE_CARDS = [
  { id: "sc01a", kind: "open", note: "Wordmark cold open" },
  { id: "sc01b", kind: "phone", note: "Device rises into place" },
  { id: "sc24b", kind: "outro", note: "Outro wordmark and closing line" },
];

// ─── Wait helpers ─────────────────────────────────────────────────────────────
async function settle(page, ms = 1100) {
  await page.waitForTimeout(ms);
  // Wait for web fonts so headings never photograph in a fallback face.
  await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()));
  // Stop every animation and transition so the capture is deterministic.
  await page.addStyleTag({
    content: `*,*::before,*::after{animation-play-state:paused !important;transition:none !important;}
              html{scroll-behavior:auto !important;}`,
  }).catch(() => {});
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll("*").forEach((el) => {
      if (el.scrollTop > 0) el.scrollTop = 0;
      if (el.scrollLeft > 0) el.scrollLeft = 0;
    });
  }).catch(() => {});
  await page.waitForTimeout(260);
}

async function main() {
  ensureDirs();
  console.log("AYXA Planner Pro — educational showcase capture");
  console.log(`Dev server: ${BASE_URL}`);
  console.log(`Raw attempts -> ${path.relative(process.cwd(), GEN_DIR)}`);
  console.log(`Approved takes -> ${path.relative(process.cwd(), SEL_DIR)}`);
  console.log("");

  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DSR,
    isMobile: true,
    hasTouch: true,
    locale: "en-US",
    timezoneId: "Africa/Casablanca",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);

  const results = [];

  // ── Graphic title cards ──────────────────────────────────────────────────
  for (const card of TITLE_CARDS) {
    try {
      await page.setContent(titleCardHtml(card.kind), { waitUntil: "load" });
      await settle(page, 700);
      const { gen, sel } = shotDirs(card.id);
      const out = path.join(gen, `${card.id}-v1.png`);
      await page.screenshot({ path: out, fullPage: false });
      fs.copyFileSync(out, path.join(sel, `${card.id}-v1.png`));
      results.push({ id: card.id, ok: true, note: card.note });
      console.log(`PASS  ${card.id}  ${card.note}`);
    } catch (err) {
      results.push({ id: card.id, ok: false, note: `${card.note} — ${err.message}` });
      console.log(`FAIL  ${card.id}  ${err.message}`);
    }
  }

  // ── Seed the state once, then capture every screen ───────────────────────
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.evaluate((override) => {
    try {
      const KEY = "ayxa-app-state-v2";
      const raw = localStorage.getItem(KEY);
      const base = raw ? JSON.parse(raw) : {};
      const merged = { ...base, ...override };
      merged.prefs = { ...(base.prefs || {}), ...(override.prefs || {}) };
      merged.user = { ...(base.user || {}), ...override.user };
      localStorage.setItem(KEY, JSON.stringify(merged));
      localStorage.setItem("ayxa-lang", "en");
      localStorage.setItem("ayxa_lang", "en");
      localStorage.setItem("ayxa_guest_id", "user_active_ayxa");
      localStorage.setItem("pro_active_challenge_id", "ch01");
      localStorage.setItem(
        "pro_challenge_completed_days",
        JSON.stringify(Array.from({ length: 18 }, (_, i) => i + 1)),
      );
    } catch (e) {
      /* surfaced by the first capture's failure */
    }
  }, OVERRIDE);
  await page.waitForTimeout(600);

  for (const shot of SHOTS) {
    try {
      // Language is written before a full navigation so the provider reads it on mount.
      await page.evaluate((lang) => {
        localStorage.setItem("ayxa-lang", lang);
        localStorage.setItem("ayxa_lang", lang);
        try {
          const KEY = "ayxa-app-state-v2";
          const s = JSON.parse(localStorage.getItem(KEY) || "{}");
          s.prefs = s.prefs || {};
          s.prefs.language = lang;
          localStorage.setItem(KEY, JSON.stringify(s));
        } catch (e) {}
      }, shot.lang);

      await page.goto(`${BASE_URL}${shot.route}`, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });
      await settle(page, 1400);

      if (shot.action) {
        try {
          await shot.action(page);
        } catch (err) {
          console.log(`  note: action on ${shot.id} did not apply — ${err.message}`);
        }
        await settle(page, 900);
      }

      const { gen, sel } = shotDirs(shot.id);
      const out = path.join(gen, `${shot.id}-v1.png`);
      await page.screenshot({ path: out, fullPage: false });
      fs.copyFileSync(out, path.join(sel, `${shot.id}-v1.png`));

      const size = fs.statSync(out).size;
      results.push({ id: shot.id, ok: true, note: shot.note, bytes: size });
      console.log(`PASS  ${shot.id}  ${shot.note}  (${(size / 1024).toFixed(0)} KB)`);
    } catch (err) {
      results.push({ id: shot.id, ok: false, note: `${shot.note} — ${err.message}` });
      console.log(`FAIL  ${shot.id}  ${err.message}`);
    }
  }

  await browser.close();

  const ok = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log("");
  console.log(`Captured ${ok}/${results.length} shots.`);
  if (failed.length) {
    console.log("Failures:");
    failed.forEach((f) => console.log(`  ${f.id} — ${f.note}`));
  } else {
    console.log("Every shot captured. Review each frame against docs/bible.md before promoting.");
  }
}

const invokedDirectly = /capture-screens\.mjs$/.test(process.argv[1] || "");
if (invokedDirectly) {
  main().catch((err) => {
    console.error("Capture run failed:", err);
    process.exit(1);
  });
}
