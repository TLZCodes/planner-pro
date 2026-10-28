import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const BASE_URL = "http://127.0.0.1:8081";
const TARGET_DIR = "C:\\Users\\TLZCodes\\Desktop\\AYXA_App_All_Screenshots";
const ARTIFACT_DIR = "C:\\Users\\TLZCodes\\.gemini\\antigravity\\brain\\383d13b5-b1c5-499b-8abc-6a86bd737c5c";
const STORAGE_KEY = "ayxa-app-state-v2";

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

async function ensureDevServer() {
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) {
        console.log(`Dev server is already running on ${BASE_URL}`);
        return null;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  console.log(`Starting vite dev on ${BASE_URL}...`);
  const child = spawn("npx", ["vite", "dev", "--host", "127.0.0.1", "--port", "8081"], {
    cwd: process.cwd(),
    shell: true,
    stdio: "ignore",
    detached: false,
  });

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) {
        console.log(`Dev server started successfully on ${BASE_URL}`);
        return child;
      }
    } catch {}
  }
  throw new Error("Dev server did not start on port 8081");
}

function saveDualScreenshot(buffer, filename) {
  const targetPath = path.join(TARGET_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  fs.writeFileSync(targetPath, buffer);
  fs.writeFileSync(artifactPath, buffer);
  console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
}

async function run() {
  const serverProc = await ensureDevServer();

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // Screen 146: Initial Conversation Screen (English)
    // -------------------------------------------------------------
    console.log("Capturing Screen 146: Initial Conversation Screen...");
    await page.goto(`${BASE_URL}/ai`, { waitUntil: "networkidle" });
    await page.evaluate(({ key }) => {
      localStorage.setItem("ayxa_lang", "en");
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.aiConversations = [];
      localStorage.setItem(key, JSON.stringify(parsed));
    }, { key: STORAGE_KEY });

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const buf146 = await page.screenshot({ fullPage: false });
    saveDualScreenshot(buf146, "146_AiPlanner_InitialScreen_English.png");

    // -------------------------------------------------------------
    // Screen 147: Context Selector Modal (English)
    // -------------------------------------------------------------
    console.log("Capturing Screen 147: Context Selector Modal...");
    // Click context shield button
    await page.locator('header button[title*="context"], header button[aria-label*="Context"]').first().click();
    await page.waitForTimeout(600);

    const buf147 = await page.screenshot({ fullPage: false });
    saveDualScreenshot(buf147, "147_AiPlanner_ContextSelector_English.png");

    // Close modal
    await page.locator('button[aria-label="Close"]').first().click();
    await page.waitForTimeout(400);

    // -------------------------------------------------------------
    // Screen 148: Generated Plan using Identified Test Data (English)
    // -------------------------------------------------------------
    console.log("Capturing Screen 148: Generated Plan with Actionable Proposals...");
    await page.evaluate(({ key }) => {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.aiConversations = [
        {
          id: "conv_test_plan",
          title: "Night Shift Routine Plan",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: "msg_user_1",
              role: "user",
              content: "Make a plan around my night shift.",
              createdAt: new Date().toISOString(),
            },
            {
              id: "msg_ai_1",
              role: "assistant",
              content:
                "Bismillah. Here is a calm, restorative schedule for your overnight shift that protects your daytime sleep and keeps your energy steady:\n\n- **Daytime Rest Anchor**: Dark, quiet sleep from 10:00 to 16:30.\n- **Pre-Shift Nourishment**: Light hydration and warm soup at 18:30.\n- **Shift Focus**: Two 90-minute deep blocks.\n\n```json:ayxa_plan\n{\n  \"proposals\": [\n    {\n      \"id\": \"prop_sleep_1\",\n      \"type\": \"task\",\n      \"title\": \"Uninterrupted daytime sleep block\",\n      \"destination\": \"tasks\",\n      \"targetDate\": \"2026-10-17\",\n      \"clockTime\": \"10:00\",\n      \"durationMinutes\": 390,\n      \"category\": \"Wellness\"\n    },\n    {\n      \"id\": \"prop_meal_2\",\n      \"type\": \"task\",\n      \"title\": \"Pre-shift nourishing meal & water\",\n      \"destination\": \"tasks\",\n      \"targetDate\": \"2026-10-17\",\n      \"clockTime\": \"18:30\",\n      \"durationMinutes\": 30,\n      \"category\": \"Self-Care\"\n    },\n    {\n      \"id\": \"prop_focus_3\",\n      \"type\": \"task\",\n      \"title\": \"Shift priority work sprint (Block 1)\",\n      \"destination\": \"tasks\",\n      \"targetDate\": \"2026-10-17\",\n      \"clockTime\": \"22:00\",\n      \"durationMinutes\": 90,\n      \"category\": \"Focus\"\n    },\n    {\n      \"id\": \"prop_winddown_4\",\n      \"type\": \"routine\",\n      \"title\": \"Gentle post-shift wind-down & eye mask\",\n      \"destination\": \"routines\",\n      \"clockTime\": \"07:30\",\n      \"durationMinutes\": 30,\n      \"category\": \"Wellness\"\n    }\n  ]\n}\n```\n\nTake it gently tonight 🌸",
              createdAt: new Date().toISOString(),
            },
          ],
        },
      ];
      localStorage.setItem(key, JSON.stringify(parsed));
    }, { key: STORAGE_KEY });

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const buf148 = await page.screenshot({ fullPage: false });
    saveDualScreenshot(buf148, "148_AiPlanner_GeneratedPlan_English.png");

    // -------------------------------------------------------------
    // Screen 149: Editable Action Preview & Confirm Sheet (English)
    // -------------------------------------------------------------
    console.log("Capturing Screen 149: Editable Action Preview Sheet...");
    // Click "Review & Add to Planner" button inside the proposal card
    const reviewBtn = page.locator("button:has-text('Review & Add')").first();
    await reviewBtn.click();
    await page.waitForTimeout(600);

    const buf149 = await page.screenshot({ fullPage: false });
    saveDualScreenshot(buf149, "149_AiPlanner_EditableActionPreview_English.png");

    // -------------------------------------------------------------
    // Screen 150: Partial Success & Retry State (English)
    // -------------------------------------------------------------
    console.log("Capturing Screen 150: Partial Success & Retry State...");
    // Click Save Selected to apply items
    const saveBtn = page.locator("button:has-text('Save Selected')").first();
    await saveBtn.waitFor({ state: "visible", timeout: 5000 });
    await saveBtn.click();
    await page.waitForTimeout(600);

    const buf150 = await page.screenshot({ fullPage: false });
    saveDualScreenshot(buf150, "150_AiPlanner_PartialSuccessAndRetry_English.png");

    // Close review sheet
    await page.locator('button[aria-label="Close"], button:has-text("Close")').first().click();
    await page.waitForTimeout(400);

    // -------------------------------------------------------------
    // Screen 151: Offline / Unavailable Provider State (English)
    // -------------------------------------------------------------
    console.log("Capturing Screen 151: Offline / Local Planning Mode Banner...");
    // Trigger offline simulation in browser context
    await context.setOffline(true);
    await page.evaluate(() => {
      window.dispatchEvent(new Event("offline"));
    });
    await page.waitForTimeout(600);

    const buf151 = await page.screenshot({ fullPage: false });
    saveDualScreenshot(buf151, "151_AiPlanner_UnavailableProviderState_English.png");

    // Restore online
    await context.setOffline(false);
    await page.evaluate(() => {
      window.dispatchEvent(new Event("online"));
    });
    await page.waitForTimeout(400);

    // -------------------------------------------------------------
    // Screen 152: Arabic RTL Mode (مساعدة AYXA ✨)
    // -------------------------------------------------------------
    console.log("Capturing Screen 152: Arabic RTL Screen...");
    await page.evaluate(({ key }) => {
      localStorage.setItem("ayxa_lang", "ar");
      document.documentElement.setAttribute("dir", "rtl");
      document.documentElement.setAttribute("lang", "ar");
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.aiConversations = [];
      localStorage.setItem(key, JSON.stringify(parsed));
    }, { key: STORAGE_KEY });

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const buf152 = await page.screenshot({ fullPage: false });
    saveDualScreenshot(buf152, "152_AiPlanner_InitialScreen_Arabic_RTL.png");

    // Clean up test data so real profile remains clean
    console.log("Cleaning up test conversations from localStorage...");
    await page.evaluate(({ key }) => {
      localStorage.setItem("ayxa_lang", "en");
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        delete parsed.aiConversations;
        localStorage.setItem(key, JSON.stringify(parsed));
      }
    }, { key: STORAGE_KEY });

    console.log("All 7 AYXA AI Planner screenshots captured successfully!");
  } finally {
    await browser.close();
    if (serverProc) {
      serverProc.kill();
    }
  }
}

run().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
