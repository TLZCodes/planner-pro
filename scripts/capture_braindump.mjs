import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const BASE_URL = "http://127.0.0.1:8081";
const TARGET_DIR = "C:\\Users\\TLZCodes\\Desktop\\AYXA_App_All_Screenshots";
const ARTIFACT_DIR = "C:\\Users\\TLZCodes\\.gemini\\antigravity\\brain\\383d13b5-b1c5-499b-8abc-6a86bd737c5c";

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

async function portIsUp(url) {
  try {
    const res = await fetch(url, { method: "GET" });
    return res.status > 0;
  } catch {
    return false;
  }
}

async function ensureDevServer() {
  if (await portIsUp(BASE_URL)) {
    console.log(`Dev server already running on ${BASE_URL}`);
    return null;
  }
  console.log(`Starting vite dev on ${BASE_URL}...`);
  const child = spawn("npx", ["vite", "dev", "--host", "127.0.0.1", "--port", "8081"], {
    cwd: process.cwd(),
    shell: true,
    stdio: "ignore",
    detached: false,
  });
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 600));
    if (await portIsUp(BASE_URL)) {
      console.log("Dev server is ready!");
      return child;
    }
  }
  throw new Error("Dev server did not start on port 8081");
}

function buildSampleState() {
  const now = new Date().toISOString();
  return {
    user: {
      id: "user_active_ayxa",
      name: "Sara",
      email: "sara@ayxa.app",
      avatar: "🌸",
      emoji: "🌸",
      setupDone: true,
      authType: "authenticated",
      isGuest: false,
    },
    session: true,
    setupDone: true,
    xp: 280,
    brainDumpItems: [
      {
        id: "bd-1",
        title: "Morning reflections & Quran recitation routine",
        content: "Remember to read Surah Al-Kahf before noon, then reflect on gentle habits for the week.",
        label: "journal",
        status: "unsorted",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "bd-2",
        title: "Lavender oils & study desk planner stationery",
        content: "Pick up new pastel sticky tabs and soft blush washi tape from the local artisan boutique.",
        label: "shopping",
        status: "unsorted",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "bd-3",
        title: "Creative voice note: Chapter 3 audio draft",
        content: "Recorded the key takeaways on cognitive focus and gentle Pomodoro timing.",
        label: "idea",
        status: "unsorted",
        audioDataUrl: "data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwE=",
        audioDurationSeconds: 48,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "bd-4",
        title: "Branding moodboard project kick-off",
        content: "Initial ideas organized into the Business workspace project plan.",
        label: "project",
        status: "organized",
        destination: {
          type: "business_project",
          id: "biz-1",
          title: "Branding Moodboard 2027",
          createdAt: now,
        },
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

async function main() {
  const server = await ensureDevServer();
  const browser = await chromium.launch({ headless: true, channel: "chrome" });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: "en-US",
  });

  const sampleState = buildSampleState();

  await context.addInitScript((stateData) => {
    localStorage.setItem("ayxa-app-state-v2", JSON.stringify(stateData));
    localStorage.setItem("ayxa-lang", "en");
    localStorage.setItem("ayxa_lang", "en");
    localStorage.setItem("ayxa_tour_done", "1");
  }, sampleState);

  const page = await context.newPage();

  async function snap(filename) {
    const targetPath = path.join(TARGET_DIR, filename);
    await page.screenshot({ path: targetPath, fullPage: false });
    try {
      const artPath = path.join(ARTIFACT_DIR, filename);
      fs.copyFileSync(targetPath, artPath);
    } catch (e) {}
    console.log(`✓ Captured: ${filename}`);
  }

  // 1. Capture Full Inbox View (English)
  console.log("Navigating to /inbox...");
  await page.goto(`${BASE_URL}/inbox`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1000);
  await snap("97_BrainDump_Inbox_English.png");

  // 2. Open Quick Capture Sheet and take screen
  console.log("Opening Quick Capture Sheet...");
  const addBtn = page.locator("button:has-text('Add Thought')");
  if (await addBtn.count() > 0) {
    await addBtn.first().click();
    await page.waitForTimeout(600);
    await snap("98_BrainDump_QuickCapture_English.png");
  }

  // 3. Switch to Arabic RTL and capture Inbox
  console.log("Switching to Arabic RTL...");
  await page.evaluate(() => {
    localStorage.setItem("ayxa-lang", "ar");
    localStorage.setItem("ayxa_lang", "ar");
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
  });
  await page.goto(`${BASE_URL}/inbox`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1000);
  await snap("99_BrainDump_Inbox_Arabic_RTL.png");

  await browser.close();
  if (server) server.kill();
  console.log("Screenshots captured successfully!");
}

main().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
