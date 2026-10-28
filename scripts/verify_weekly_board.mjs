import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const TARGET_DIR = "C:\\Users\\TLZCodes\\Desktop\\AYXA_App_All_Screenshots";
const ARTIFACT_DIR = "C:\\Users\\TLZCodes\\.gemini\\antigravity\\brain\\383d13b5-b1c5-499b-8abc-6a86bd737c5c";
const BASE_URL = "http://localhost:8080";

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
  });

  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  async function snap(filename) {
    const targetPath = path.join(TARGET_DIR, filename);
    await page.screenshot({ path: targetPath, fullPage: false });
    try {
      const artPath = path.join(ARTIFACT_DIR, filename);
      fs.copyFileSync(targetPath, artPath);
    } catch (e) {}
    console.log(`✓ Captured & Saved: ${filename}`);
  }

  // 1. Initialize English session
  console.log("Setting up English session...");
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.evaluate(() => {
    localStorage.setItem("ayxa-lang", "en");
    localStorage.setItem("ayxa_lang", "en");
    try {
      const raw = localStorage.getItem("ayxa-app-state-v2");
      let state = raw ? JSON.parse(raw) : {};
      state.user = {
        id: "user_active_ayxa",
        name: "Sara",
        email: "sara@ayxaplanner.app",
        isGuest: false,
        setupDone: true,
        authType: "authenticated",
      };
      state.session = true;
      state.prefs = state.prefs || {};
      state.prefs.language = "en";
      localStorage.setItem("ayxa-app-state-v2", JSON.stringify(state));
    } catch (e) {}
  });

  // Navigate directly to Week tab
  console.log("Navigating to /habits?tab=week...");
  await page.goto(`${BASE_URL}/habits?tab=week`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(1500);

  // 1. English Matrix View
  await snap("74_WeeklyHabitBoard_English_Matrix.png");

  // 2. Day List View
  const dayListBtn = page.locator('button:has-text("Day List")').first();
  if (await dayListBtn.isVisible()) {
    await dayListBtn.click();
    await page.waitForTimeout(800);
    await snap("75_WeeklyHabitBoard_DayList_View.png");
  }

  // 3. Switch back to Matrix and open Quantitative dialog
  const matrixBtn = page.locator('button:has-text("Weekly Matrix")').first();
  if (await matrixBtn.isVisible()) {
    await matrixBtn.click();
    await page.waitForTimeout(500);
  }

  // Click on a cell in table to open quantitative logger if applicable
  const quantCell = page.locator('table button').first();
  if (await quantCell.isVisible()) {
    await quantCell.click();
    await page.waitForTimeout(600);
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible()) {
      await snap("77_WeeklyHabitBoard_Quantitative_Entry.png");
      const cancelBtn = page.locator('button:has-text("Cancel"), button:has-text("إلغاء")').first();
      if (await cancelBtn.isVisible()) await cancelBtn.click();
      await page.waitForTimeout(400);
    }
  }

  // 4. Switch to Arabic RTL session
  console.log("Switching to Arabic session...");
  await page.evaluate(() => {
    localStorage.setItem("ayxa-lang", "ar");
    localStorage.setItem("ayxa_lang", "ar");
    try {
      const raw = localStorage.getItem("ayxa-app-state-v2");
      if (raw) {
        const state = JSON.parse(raw);
        state.prefs = state.prefs || {};
        state.prefs.language = "ar";
        localStorage.setItem("ayxa-app-state-v2", JSON.stringify(state));
      }
    } catch (e) {}
  });

  console.log("Navigating to Arabic /habits?tab=week...");
  await page.goto(`${BASE_URL}/habits?tab=week`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(1500);

  await snap("76_WeeklyHabitBoard_Arabic_Matrix.png");

  // Restore English default
  await page.evaluate(() => {
    localStorage.setItem("ayxa-lang", "en");
    localStorage.setItem("ayxa_lang", "en");
    try {
      const raw = localStorage.getItem("ayxa-app-state-v2");
      if (raw) {
        const state = JSON.parse(raw);
        state.prefs = state.prefs || {};
        state.prefs.language = "en";
        localStorage.setItem("ayxa-app-state-v2", JSON.stringify(state));
      }
    } catch (e) {}
  });

  await browser.close();
  console.log("All weekly habit board screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
