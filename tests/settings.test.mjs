import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  normalizePrefs,
  isWithinQuietHours,
  buildExportPayload,
  inspectBackupJson,
  calculateStorageMetrics,
  generateDiagnosticsReport,
  DEFAULT_PREFS,
  DEFAULT_QUIET_HOURS,
  THEME_PRESETS,
  SUPPORTED_CURRENCIES,
} from "../src/lib/settingsEngine.ts";

describe("AYXA Planner Pro — Settings & Preferences Engine", () => {
  test("should normalize preferences with safe defaults for missing or null input", () => {
    const emptyPrefs = normalizePrefs(null);
    assert.equal(emptyPrefs.theme, "rose");
    assert.equal(emptyPrefs.appearanceMode, "system");
    assert.equal(emptyPrefs.soundType, "chime");
    assert.equal(emptyPrefs.currency, "MAD");
    assert.equal(emptyPrefs.quietHours?.enabled, false);
    assert.equal(emptyPrefs.privacy?.hideSensitiveNotificationPreviews, true);
    assert.equal(emptyPrefs.accessibility?.textScale, "normal");
  });

  test("should migrate legacy boolean darkMode to appearanceMode correctly", () => {
    const legacyDark = normalizePrefs({ darkMode: true });
    assert.equal(legacyDark.appearanceMode, "dark");

    const legacyLight = normalizePrefs({ darkMode: false });
    assert.equal(legacyLight.appearanceMode, "light");

    const explicitSystem = normalizePrefs({ appearanceMode: "system" });
    assert.equal(explicitSystem.appearanceMode, "system");
  });

  test("should accurately calculate quiet hours across midnight (e.g. 22:00 to 07:00)", () => {
    const quietConfig = { enabled: true, startTime: "22:00", endTime: "07:00" };

    // 23:30 is within quiet hours
    const nightTime = new Date("2026-09-05T23:30:00");
    assert.equal(isWithinQuietHours(quietConfig, nightTime), true);

    // 04:15 is within quiet hours
    const earlyMorning = new Date("2026-09-05T04:15:00");
    assert.equal(isWithinQuietHours(quietConfig, earlyMorning), true);

    // 14:00 is outside quiet hours
    const dayTime = new Date("2026-09-05T14:00:00");
    assert.equal(isWithinQuietHours(quietConfig, dayTime), false);

    // Disabled quiet hours always returns false
    assert.equal(isWithinQuietHours({ enabled: false, startTime: "22:00", endTime: "07:00" }, nightTime), false);
  });

  test("should build selective export payload with metadata and category filtering", () => {
    const mockState = {
      tasks: [{ id: "t1", title: "Task 1" }, { id: "t2", title: "Task 2" }],
      habits: [{ id: "h1", name: "Habit 1" }],
      journal: [{ id: "j1", title: "Reflections" }],
      businessProjects: [{ id: "b1", title: "Project 1" }],
      prefs: DEFAULT_PREFS,
    };

    const taskOnlyExport = buildExportPayload(mockState, ["tasks"]);
    assert.equal(taskOnlyExport.app, "AYXA Planner Pro");
    assert.equal(taskOnlyExport.version, "2.4.0");
    assert.equal(taskOnlyExport.data.tasks.length, 2);
    assert.equal(taskOnlyExport.data.habits, undefined);
    assert.equal(taskOnlyExport.recordCounts.tasks, 2);

    const fullExport = buildExportPayload(mockState, ["all"]);
    assert.equal(fullExport.data.tasks.length, 2);
    assert.equal(fullExport.data.habits.length, 1);
    assert.equal(fullExport.data.journal.length, 1);
  });

  test("should inspect and validate backup JSON string before applying", () => {
    const validJson = JSON.stringify({
      app: "AYXA Planner Pro",
      version: "2.4.0",
      exportedAt: "2026-09-05T10:00:00Z",
      data: {
        tasks: [{ id: "t1" }, { id: "t2" }],
        habits: [{ id: "h1" }],
        goals: [{ id: "g1" }],
        journal: [{ id: "j1" }],
      },
    });

    const result = inspectBackupJson(validJson);
    assert.equal(result.valid, true);
    assert.equal(result.counts.tasks, 2);
    assert.equal(result.counts.habits, 1);
    assert.equal(result.counts.goals, 1);
    assert.equal(result.counts.journalEntries, 1);

    const corruptedResult = inspectBackupJson("{ bad_json: ");
    assert.equal(corruptedResult.valid, false);
    assert.ok(corruptedResult.error);
  });

  test("should compute storage footprint metrics and generate diagnostic report", () => {
    const mockState = {
      tasks: [{ id: "t1" }],
      habits: [{ id: "h1" }],
      user: { id: "usr_12345678", name: "Sara", isGuest: false },
      prefs: DEFAULT_PREFS,
    };

    const metrics = calculateStorageMetrics(mockState);
    assert.ok(metrics.estimatedBytes > 0);
    assert.equal(metrics.isOfflineReady, true);
    assert.equal(metrics.itemCounts.tasks, 1);
    assert.equal(metrics.itemCounts.habits, 1);

    const report = generateDiagnosticsReport(mockState, "ar");
    assert.ok(report.includes("AYXA PLANNER PRO DIAGNOSTICS"));
    assert.ok(report.includes("App Version: 2.4.0"));
  });

  test("should have 6 aesthetic unclipped theme presets and 15 supported currencies", () => {
    assert.equal(THEME_PRESETS.length, 6);
    const themeNames = THEME_PRESETS.map((t) => t.name);
    assert.deepEqual(themeNames, ["rose", "emerald", "lavender", "gold", "mint", "ocean"]);

    assert.equal(SUPPORTED_CURRENCIES.length, 15);
    const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
    assert.ok(codes.includes("MAD"));
    assert.ok(codes.includes("SAR"));
    assert.ok(codes.includes("AED"));
    assert.ok(codes.includes("USD"));
  });
});
