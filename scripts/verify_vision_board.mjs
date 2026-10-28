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
    console.log(`✓ Captured: ${filename}`);
  }

  // Sample Vision Board & Items for verification
  const sampleBoard = {
    id: "vb-dream-2027",
    title: "Dream Life & Becoming Her 🌸",
    titleAr: "حياتي المثالية ونسختي الأفضل 🌸",
    description: "Aesthetic space of peace, barakah, and creative projects",
    descriptionAr: "مساحة من السكينة والبركة والمشاريع الإبداعية",
    timeHorizon: "2027",
    theme: "blossom",
    layout: "scrapbook",
    isPinnedToHome: true,
    showDecorations: true,
    showCaptions: true,
    showGoalProgress: true,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleItems = [
    {
      id: "vbi-photo-1",
      boardId: "vb-dream-2027",
      type: "photo",
      imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=60",
      caption: "Serene morning coffee & journaling",
      imageAspectRatio: "square",
      sticker: "flower",
      washiColor: "pink",
      rotation: -2,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "vbi-text-1",
      boardId: "vb-dream-2027",
      type: "text",
      content: "I am peaceful, consistent, and gently growing into the highest version of myself.",
      sticker: "sparkle",
      washiColor: "lavender",
      rotation: 1,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "vbi-wish-1",
      boardId: "vb-dream-2027",
      type: "wish",
      content: "Perform Umrah with my mother in the sweet spring breeze",
      sticker: "heart",
      washiColor: "butter",
      rotation: -1,
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "vbi-photo-2",
      boardId: "vb-dream-2027",
      type: "photo",
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60",
      caption: "Read 24 books with mindful reflection",
      imageAspectRatio: "portrait",
      sticker: "star",
      washiColor: "mint",
      rotation: 2,
      order: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // 1. Setup localStorage
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(({ board, items }) => {
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
      state.visionBoards = [board];
      state.visionBoardItems = items;
      localStorage.setItem("ayxa-app-state-v2", JSON.stringify(state));
    } catch (e) {}
  }, { board: sampleBoard, items: sampleItems });

  // ── Snap 1: Home Dashboard with Pinned Vision Board Card ──
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await snap("77_VisionBoard_Pinned_HomeCard_EN.png");

  // ── Snap 2: Vision Board Collection in Goals ──
  await page.goto(`${BASE_URL}/goals?tab=vision`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await snap("78_VisionBoard_Collection_EN.png");

  // ── Snap 3: Open Active Board (Scrapbook Layout) ──
  await page.goto(`${BASE_URL}/goals?tab=vision&boardId=vb-dream-2027`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await snap("79_VisionBoard_ActiveScrapbook_EN.png");

  // ── Snap 4: Switch to Clean Grid Layout ──
  const gridButton = page.locator('button:has-text("Grid"), button[aria-label="Clean Grid"]');
  if (await gridButton.count() > 0) {
    await gridButton.first().click();
    await page.waitForTimeout(800);
    await snap("80_VisionBoard_CleanGrid_EN.png");
  }

  // ── Snap 5: Explore AYXA with Vision Board Module Entry ──
  await page.goto(`${BASE_URL}/more`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await snap("81_Explore_AYXA_VisionBoardEntry_EN.png");

  // ── Snap 6: Arabic RTL View of Vision Board ──
  await page.evaluate(() => {
    localStorage.setItem("ayxa-lang", "ar");
    localStorage.setItem("ayxa_lang", "ar");
    try {
      const raw = localStorage.getItem("ayxa-app-state-v2");
      let state = raw ? JSON.parse(raw) : {};
      state.prefs = state.prefs || {};
      state.prefs.language = "ar";
      localStorage.setItem("ayxa-app-state-v2", JSON.stringify(state));
    } catch (e) {}
  });

  await page.goto(`${BASE_URL}/goals?tab=vision&boardId=vb-dream-2027`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await snap("82_VisionBoard_ActiveScrapbook_Arabic_RTL.png");

  await browser.close();
  console.log("All Vision Board screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
