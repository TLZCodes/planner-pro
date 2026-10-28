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
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 600));
    if (await portIsUp(BASE_URL)) {
      console.log("Dev server is ready!");
      return child;
    }
  }
  throw new Error("Dev server did not start on port 8081");
}

function buildSampleBingoState(options = {}) {
  const {
    isEmpty = false,
    size = 3,
    theme = "blush",
    hasCompletedLine = false,
    hasPartialProgress = false,
    hasHistory = false,
  } = options;

  // Base state
  const weekStart = "2026-10-10";
  const weekEnd = "2026-10-16";

  const activities = [
    {
      id: "act_tea",
      userId: "u1",
      title: "Warm Chamomile Tea",
      titleAr: "شاي البابونج الدافئ",
      icon: "☕",
      category: "body",
      recurrenceRule: "daily",
      status: "active",
      sourceType: "custom",
      estimatedDurationMinutes: 10,
      createdAt: "2026-10-10T10:00:00Z",
      updatedAt: "2026-10-10T10:00:00Z",
    },
    {
      id: "act_read",
      userId: "u1",
      title: "Read Peaceful Pages",
      titleAr: "قراءة صفحات هادئة",
      icon: "📖",
      category: "joy",
      recurrenceRule: "daily",
      status: "active",
      sourceType: "custom",
      estimatedDurationMinutes: 15,
      createdAt: "2026-10-10T10:00:00Z",
      updatedAt: "2026-10-10T10:00:00Z",
    },
    {
      id: "act_walk",
      userId: "u1",
      title: "Gentle Morning Walk",
      titleAr: "مشي صباحي خفيف",
      icon: "🚶‍♀️",
      category: "movement",
      recurrenceRule: "daily",
      status: "active",
      sourceType: "custom",
      estimatedDurationMinutes: 20,
      createdAt: "2026-10-10T10:00:00Z",
      updatedAt: "2026-10-10T10:00:00Z",
    },
  ];

  let boards = [];

  if (!isEmpty) {
    const totalTiles = size * size;
    const tiles = [];

    const starterTiles3x3 = [
      { id: "t_1", activityId: "act_tea", title: "Warm Chamomile Tea", titleAr: "شاي البابونج الدافئ", icon: "☕", category: "body", activityType: "simple", targetValue: 1, currentValue: 1, completed: true, completedDate: "2026-10-11" },
      { id: "t_2", activityId: "act_read", title: "Read Peaceful Pages", titleAr: "قراءة صفحات هادئة", icon: "📖", category: "joy", activityType: "duration", targetValue: 15, currentValue: hasCompletedLine ? 15 : (hasPartialProgress ? 10 : 0), completed: hasCompletedLine, completedDate: hasCompletedLine ? "2026-10-12" : undefined },
      { id: "t_3", activityId: "act_walk", title: "Gentle Morning Walk", titleAr: "مشي صباحي خفيف", icon: "🚶‍♀️", category: "movement", activityType: "duration", targetValue: 20, currentValue: hasCompletedLine ? 20 : 0, completed: hasCompletedLine, completedDate: hasCompletedLine ? "2026-10-13" : undefined },
      { id: "t_4", activityId: "idea_tidy", title: "Tidy a Small Corner", titleAr: "ترتيب زاوية صغيرة", icon: "🪴", category: "environment", activityType: "simple", targetValue: 1, currentValue: 0, completed: false },
      { id: "t_5", activityId: "idea_free", title: "Rest Without Guilt", titleAr: "راحة دون لوم", icon: "🌙", category: "rest", activityType: "duration", targetValue: 20, currentValue: 20, completed: true, completedDate: "2026-10-14" },
      { id: "t_6", activityId: "idea_water", title: "Mindful Hydration", titleAr: "شرب الماء بنقاء", icon: "💧", category: "body", activityType: "hydration", targetValue: 6, currentValue: 4, completed: false },
      { id: "t_7", activityId: "idea_breathe", title: "Deep Calm Breathing", titleAr: "تنفّس عميق وهادئ", icon: "🕊️", category: "calm", activityType: "duration", targetValue: 5, currentValue: 0, completed: false },
      { id: "t_8", activityId: "idea_scent", title: "Light Lavender Scent", titleAr: "إشعال عطر مهدئ", icon: "🕯️", category: "environment", activityType: "simple", targetValue: 1, currentValue: 1, completed: true, completedDate: "2026-10-15" },
      { id: "t_9", activityId: "idea_connect", title: "Send a Warm Note", titleAr: "إرسال رسالة لطيفة", icon: "💬", category: "connection", activityType: "simple", targetValue: 1, currentValue: 0, completed: false },
    ];

    if (size === 3) {
      tiles.push(...starterTiles3x3);
    } else {
      // 4x4
      tiles.push(...starterTiles3x3);
      const extraTiles = [
        { id: "t_10", activityId: "idea_hobby", title: "Gentle Hobby", titleAr: "هواية أحبها", icon: "🎨", category: "joy", activityType: "simple", targetValue: 1, currentValue: 1, completed: true, completedDate: "2026-10-12" },
        { id: "t_11", activityId: "idea_screen", title: "Screen-free Pause", titleAr: "استراحة من الشاشات", icon: "🌿", category: "calm", activityType: "duration", targetValue: 20, currentValue: 0, completed: false },
        { id: "t_12", activityId: "idea_outdoors", title: "Bask in Sunlight", titleAr: "وقت في الهواء الطلق", icon: "☀️", category: "movement", activityType: "duration", targetValue: 15, currentValue: 15, completed: true, completedDate: "2026-10-13" },
        { id: "t_13", activityId: "idea_stretch", title: "Shoulder Stretch", titleAr: "إطالة خفيفة", icon: "🧘‍♀️", category: "movement", activityType: "duration", targetValue: 10, currentValue: 0, completed: false },
        { id: "t_14", activityId: "idea_kindness", title: "Kind Word to Self", titleAr: "كلمة طيبة لنفسي", icon: "🌸", category: "calm", activityType: "simple", targetValue: 1, currentValue: 1, completed: true, completedDate: "2026-10-14" },
        { id: "t_15", activityId: "idea_skincare", title: "Evening Rose Water", titleAr: "ترطيب بماء الورد", icon: "🧴", category: "body", activityType: "simple", targetValue: 1, currentValue: 0, completed: false },
        { id: "t_16", activityId: "idea_gratitude", title: "Three Gratitudes", titleAr: "تأمّل ثلاث نعم", icon: "🤲", category: "spiritual", activityType: "simple", targetValue: 1, currentValue: 1, completed: true, completedDate: "2026-10-15" },
      ];
      tiles.push(...extraTiles);
    }

    boards.push({
      id: `bingo_${weekStart}_${size}x${size}`,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      size,
      theme,
      tiles,
      celebrationsEnabled: true,
      createdAt: "2026-10-10T08:00:00Z",
      updatedAt: "2026-10-15T12:00:00Z",
    });

    if (hasHistory) {
      // Add previous week's board
      const prevTiles = starterTiles3x3.map((t, i) => ({
        ...t,
        completed: i % 2 === 0,
        completedDate: i % 2 === 0 ? "2026-10-06" : undefined,
      }));
      boards.push({
        id: "bingo_2026-10-03_3x3",
        weekStartDate: "2026-10-03",
        weekEndDate: "2026-10-09",
        size: 3,
        theme: "mint",
        tiles: prevTiles,
        celebrationsEnabled: true,
        createdAt: "2026-10-03T08:00:00Z",
        updatedAt: "2026-10-09T18:00:00Z",
      });
    }
  }

  return {
    user: { id: "u_test", name: "Sarah", email: "sarah@example.com" },
    prefs: { language: "en", appearanceMode: "light" },
    wellnessSettings: { timezone: "Africa/Casablanca" },
    habitWeekPreferences: { firstDayOfWeek: "saturday" },
    selfCareActivities: activities,
    selfCareBingoBoards: boards,
    selfCarePlanItems: [],
  };
}

async function saveShot(page, filename) {
  const targetPath = path.join(TARGET_DIR, `${filename}.png`);
  const artifactPath = path.join(ARTIFACT_DIR, `${filename}.png`);
  await page.screenshot({ path: targetPath, fullPage: false });
  fs.copyFileSync(targetPath, artifactPath);
  console.log(`Saved screenshot: ${filename}.png`);
}

async function main() {
  const devServerProcess = await ensureDevServer();

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const createPageWithState = async (stateObj, lang = "en") => {
    const context = await browser.newContext({
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2,
      locale: lang === "ar" ? "ar-MA" : "en-US",
    });
    const page = await context.newPage();
    await page.addInitScript(
      ({ state, lang }) => {
        state.prefs.language = lang;
        window.localStorage.setItem("ayxa_tour_done", "1");
        window.localStorage.setItem("ayxa_onboarding_done", "1");
        window.localStorage.setItem("ayxa-lang", lang);
        window.localStorage.setItem("ayxa-app-state-v2", JSON.stringify(state));
      },
      { state: stateObj, lang }
    );
    return { page, context };
  };

  try {
    // 1. Empty State (English)
    console.log("Capturing 115_SelfCareBingo_EmptyState_English...");
    {
      const { page, context } = await createPageWithState(buildSampleBingoState({ isEmpty: true }), "en");
      await page.goto(`${BASE_URL}/selfcare?tab=bingo`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);
      await saveShot(page, "115_SelfCareBingo_EmptyState_English");
      await context.close();
    }

    // 2. Board Setup Wizard (English)
    console.log("Capturing 116_SelfCareBingo_BoardSetup_English...");
    {
      const { page, context } = await createPageWithState(buildSampleBingoState({ isEmpty: true }), "en");
      await page.goto(`${BASE_URL}/selfcare?tab=bingo`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(800);
      const createBtn = page.locator("button:has-text('Create my board')").first();
      if (await createBtn.isVisible()) {
        await createBtn.click();
        await page.waitForTimeout(600);
        await saveShot(page, "116_SelfCareBingo_BoardSetup_English");
      }
      await context.close();
    }

    // 3. 3x3 Board (English)
    console.log("Capturing 117_SelfCareBingo_3x3Board_English...");
    {
      const { page, context } = await createPageWithState(buildSampleBingoState({ size: 3, theme: "blush" }), "en");
      await page.goto(`${BASE_URL}/selfcare?tab=bingo`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);
      await saveShot(page, "117_SelfCareBingo_3x3Board_English");
      await context.close();
    }

    // 4. 4x4 Board (English)
    console.log("Capturing 118_SelfCareBingo_4x4Board_English...");
    {
      const { page, context } = await createPageWithState(buildSampleBingoState({ size: 4, theme: "lavender" }), "en");
      await page.goto(`${BASE_URL}/selfcare?tab=bingo`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);
      await saveShot(page, "118_SelfCareBingo_4x4Board_English");
      await context.close();
    }

    // 5. Partial Activity Logging Stepper (English)
    console.log("Capturing 119_SelfCareBingo_PartialActivityLogging_English...");
    {
      const { page, context } = await createPageWithState(buildSampleBingoState({ size: 3, hasPartialProgress: true }), "en");
      await page.goto(`${BASE_URL}/selfcare?tab=bingo`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);
      // Click on uncompleted duration tile (tile 2: "Read Peaceful Pages")
      const durationTile = page.locator("div[role='gridcell']:has-text('Read Peaceful Pages')").first();
      if (await durationTile.isVisible()) {
        await durationTile.click();
        await page.waitForTimeout(600);
        await saveShot(page, "119_SelfCareBingo_PartialActivityLogging_English");
      }
      await context.close();
    }

    // 6. Completed-Line Appearance & Banner (English)
    console.log("Capturing 120_SelfCareBingo_CompletedLine_English...");
    {
      const { page, context } = await createPageWithState(buildSampleBingoState({ size: 3, hasCompletedLine: true }), "en");
      await page.goto(`${BASE_URL}/selfcare?tab=bingo`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);
      await saveShot(page, "120_SelfCareBingo_CompletedLine_English");
      await context.close();
    }

    // 7. History View (English)
    console.log("Capturing 121_SelfCareBingo_PastBoardsHistory_English...");
    {
      const { page, context } = await createPageWithState(buildSampleBingoState({ size: 3, hasHistory: true }), "en");
      await page.goto(`${BASE_URL}/selfcare?tab=bingo`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(800);
      const historyBtn = page.locator("button[aria-label='Past Boards'], button[aria-label='سجل اللوحات']").first();
      if (await historyBtn.isVisible()) {
        await historyBtn.click();
        await page.waitForTimeout(600);
        await saveShot(page, "121_SelfCareBingo_PastBoardsHistory_English");
      }
      await context.close();
    }

    // 8. 3x3 Board in Arabic RTL (بينغو العناية بنفسي 🌸)
    console.log("Capturing 122_SelfCareBingo_3x3Board_Arabic_RTL...");
    {
      const { page, context } = await createPageWithState(buildSampleBingoState({ size: 3, theme: "blush" }), "ar");
      await page.goto(`${BASE_URL}/selfcare?tab=bingo`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);
      await saveShot(page, "122_SelfCareBingo_3x3Board_Arabic_RTL");
      await context.close();
    }

    console.log("All Self-care Bingo screenshots captured successfully!");
  } finally {
    await browser.close();
    if (devServerProcess) {
      devServerProcess.kill();
    }
  }
}

main().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
