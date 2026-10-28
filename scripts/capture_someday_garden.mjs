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

async function ensureDevServer() {
  console.log(`Connecting to server on ${BASE_URL}...`);
  return null;
}

function buildSampleGardenState(options = {}) {
  const { isEmpty = false } = options;

  const sampleGoals = [
    {
      id: "goal-tea-shop",
      title: "Launch Artisanal Tea Atelier",
      area: "Work",
      status: "active",
      progress: 45,
      target: "Dec 2026",
      targetDate: "2026-12-31",
      createdAt: "2026-10-01T10:00:00Z",
      updatedAt: "2026-10-15T12:00:00Z",
    },
    {
      id: "goal-pottery",
      title: "Master Moroccan Hand Pottery",
      area: "Study",
      status: "completed",
      progress: 100,
      target: "Achieved",
      targetDate: "2026-10-14",
      createdAt: "2026-09-01T10:00:00Z",
      updatedAt: "2026-10-14T18:00:00Z",
    },
  ];

  const sampleWishes = isEmpty
    ? []
    : [
        {
          id: "wish-andalusia",
          title: "Visit Andalusia Water Gardens",
          titleAr: "زيارة حدائق الأندلس المائية",
          description: "Walk under jasmine arbors in Granada and Cordoba in gentle spring rain.",
          category: "Places to visit",
          personalReason: "A peaceful journey for deep visual rest and poetic inspiration",
          nextSmallStepNote: "Bookmark quiet courtyard riads in Cordoba",
          status: "dreaming",
          order: 0,
          createdAt: "2026-10-15T09:00:00Z",
          updatedAt: "2026-10-15T09:00:00Z",
        },
        {
          id: "wish-sourdough",
          title: "Bake Crusty Sourdough Bread",
          titleAr: "خبز رغيف الساوردو المقرمش",
          description: "Nurture a wild yeast starter named Yasmin and bake with organic stoneground flour.",
          category: "Home",
          personalReason: "Connecting with slow nourishing morning rituals",
          nextSmallStepNote: "Order a proofing cane basket and glass jar",
          status: "exploring",
          order: 1,
          createdAt: "2026-10-14T11:00:00Z",
          updatedAt: "2026-10-14T11:00:00Z",
        },
        {
          id: "wish-tea-shop",
          title: "Launch Artisanal Tea Atelier",
          titleAr: "تأسيس معمل الشاي التخصصي الفاخر",
          description: "Curated organic chamomile, mint, and white tea blends in blush glass jars.",
          category: "Projects to explore",
          personalReason: "Honoring mindful afternoon hospitality",
          nextSmallStepNote: "Sample test 3 organic dried herbal varieties",
          status: "linked_goal",
          linkedGoalId: "goal-tea-shop",
          order: 2,
          createdAt: "2026-10-12T14:00:00Z",
          updatedAt: "2026-10-15T15:00:00Z",
        },
        {
          id: "wish-pottery",
          title: "Master Moroccan Hand Pottery",
          titleAr: "إتقان صناعة الفخار اليدوي المغربي",
          description: "Hand-thrown ceramic bowls with soft plum glazed rim details.",
          category: "Things to learn",
          personalReason: "A tactile practice of presence and patience",
          nextSmallStepNote: "Completed 6-week studio apprenticeship",
          status: "linked_goal",
          linkedGoalId: "goal-pottery",
          order: 3,
          createdAt: "2026-09-01T10:00:00Z",
          updatedAt: "2026-10-14T18:00:00Z",
        },
        {
          id: "wish-calligraphy",
          title: "Vintage Dipping Ink & Calligraphy Set",
          titleAr: "طقم حبر وريشة كلاسيكي فاخر",
          description: "Hand-ground walnut ink and brass oblique holder for journaling.",
          category: "Something to save for",
          personalReason: "Writing gratitude notes with intention",
          nextSmallStepNote: "Research handmade nibs on artisan marketplace",
          status: "dreaming",
          order: 4,
          createdAt: "2026-10-10T16:00:00Z",
          updatedAt: "2026-10-10T16:00:00Z",
        },
      ];

  const sampleVisionBoards = [
    {
      id: "board-2027",
      title: "My 2027 Vision ✨",
      titleAr: "لوحة رؤيتي 2027 ✨",
      timeHorizon: "2027",
      theme: "blossom",
      layout: "collage",
      showDecorations: true,
      showCaptions: true,
      showGoalProgress: true,
      status: "active",
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-01T00:00:00Z",
    },
  ];

  return {
    somedayWishes: sampleWishes,
    goals: sampleGoals,
    visionBoards: sampleVisionBoards,
    visionBoardItems: [],
  };
}

async function captureScreen(page, filename, description) {
  const targetPath = path.join(TARGET_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);

  await page.screenshot({ path: targetPath, fullPage: false });
  fs.copyFileSync(targetPath, artifactPath);

  const stats = fs.statSync(targetPath);
  console.log(`[CAPTURED] ${filename} (${stats.size} bytes) - ${description}`);
}

async function run() {
  const serverProcess = await ensureDevServer();

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
    const STORAGE_KEY = "ayxa-app-state-v2";

    // ════════════════════════════════════════════════════════════════════════════
    // 1. Screen 123: Empty Garden (English)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("Setting up Screen 123 (Empty Garden)...");
    await page.goto(`${BASE_URL}/goals?tab=garden`);
    await page.evaluate((key) => {
      localStorage.setItem("ayxa-lang", "en");
      const base = JSON.parse(localStorage.getItem(key) || "{}");
      base.somedayWishes = [];
      localStorage.setItem(key, JSON.stringify(base));
    }, STORAGE_KEY);
    await page.goto(`${BASE_URL}/goals?tab=garden`);
    await page.waitForTimeout(1000);
    await captureScreen(page, "123_SomedayGarden_EmptyGarden_English.png", "Empty Someday Garden with gentle guidance and plant first wish CTA");

    // ════════════════════════════════════════════════════════════════════════════
    // 2. Screen 124: Populated Garden (English, Card View)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("Setting up Screen 124 (Populated Garden - Card View)...");
    const populatedData = buildSampleGardenState({ isEmpty: false });
    await page.evaluate(({ key, data }) => {
      localStorage.setItem("ayxa-lang", "en");
      const base = JSON.parse(localStorage.getItem(key) || "{}");
      Object.assign(base, data);
      localStorage.setItem(key, JSON.stringify(base));
    }, { key: STORAGE_KEY, data: populatedData });
    await page.goto(`${BASE_URL}/goals?tab=garden`);
    await page.waitForTimeout(1000);
    await captureScreen(page, "124_SomedayGarden_PopulatedGarden_English.png", "Populated Someday Garden cards showing seed, sprout, growing plant, and blooming flower");

    // ════════════════════════════════════════════════════════════════════════════
    // 3. Screen 125: Compact List View (English)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("Setting up Screen 125 (Compact List View)...");
    const listButton = page.locator('button[aria-label="Compact List View"]');
    if (await listButton.isVisible()) {
      await listButton.click();
      await page.waitForTimeout(600);
    }
    await captureScreen(page, "125_SomedayGarden_CompactListView_English.png", "Accessible compact list view with clear growth status, categories, and progress");

    // Switch back to card view
    const cardButton = page.locator('button[aria-label="Garden Card View"]');
    if (await cardButton.isVisible()) {
      await cardButton.click();
      await page.waitForTimeout(500);
    }

    // ════════════════════════════════════════════════════════════════════════════
    // 4. Screen 126: Add Wish Sheet (English)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("Setting up Screen 126 (Add Wish Sheet)...");
    const plantButton = page.locator('button[aria-label="Plant a wish"]').first();
    await plantButton.click();
    await page.waitForSelector('#plant-wish-title', { timeout: 5000 });
    await page.waitForTimeout(500);
    // Fill sample values into sheet
    await page.fill('input[placeholder*="Learn hand pottery"]', "Learn Stained Glass Artistry");
    await page.fill('textarea[placeholder*="A feeling, specific places"]', "Working with cobalt and blush glass panes to make suncatchers.");
    await page.fill('input[placeholder*="Brings me peace"]', "Catching sunlight through color in my reading corner");
    await page.waitForTimeout(500);
    await captureScreen(page, "126_SomedayGarden_AddWishSheet_English.png", "Plant a Wish modal sheet with categories, photo upload option, and personal reasons");

    // Close the sheet
    const closePlant = page.locator('button[aria-label="Close"]').first();
    await closePlant.click();
    await page.waitForTimeout(500);

    // ════════════════════════════════════════════════════════════════════════════
    // 5. Screen 127: Wish Detail Modal (English)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("Setting up Screen 127 (Wish Detail Modal)...");
    const andalusiaCard = page.locator('h3:has-text("Visit Andalusia Water Gardens")');
    if (await andalusiaCard.isVisible()) {
      await andalusiaCard.click();
      await page.waitForTimeout(600);
    }
    await captureScreen(page, "127_SomedayGarden_WishDetail_English.png", "Wish detail sheet with title, growth stage, reason, next step, and lifecycle actions");

    // ════════════════════════════════════════════════════════════════════════════
    // 6. Screen 128: Goal Conversion Preview Modal (English)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("Setting up Screen 128 (Goal Conversion Preview)...");
    const toGoalBtn = page.locator('button:has-text("To Goal")').first();
    if (await toGoalBtn.isVisible()) {
      await toGoalBtn.click();
      await page.waitForTimeout(600);
    }
    await captureScreen(page, "128_SomedayGarden_GoalConversionPreview_English.png", "Editable Goal creation preview prefilled from wish with optional target date and no pressure");

    // Close conversion modal
    const closeGoalModal = page.locator('button[aria-label="Close"]');
    if (await closeGoalModal.isVisible()) {
      await closeGoalModal.click();
      await page.waitForTimeout(400);
    }

    // Close detail modal if still open
    const closeDetail = page.locator('button[aria-label="Close"]');
    if (await closeDetail.isVisible()) {
      await closeDetail.click();
      await page.waitForTimeout(400);
    }

    // ════════════════════════════════════════════════════════════════════════════
    // 7. Screen 129: Linked Completed Goal Appearance (English)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("Setting up Screen 129 (Linked Completed Goal)...");
    const potteryCard = page.locator('h3:has-text("Master Moroccan Hand Pottery")');
    if (await potteryCard.isVisible()) {
      await potteryCard.click();
      await page.waitForTimeout(600);
    }
    await captureScreen(page, "129_SomedayGarden_LinkedCompletedGoal_English.png", "Wish detail of a bloomed flower with linked completed goal at 100% and achievement badge");

    // Close detail
    const closeDetail2 = page.locator('button[aria-label="Close"]');
    if (await closeDetail2.isVisible()) {
      await closeDetail2.click();
      await page.waitForTimeout(400);
    }

    // ════════════════════════════════════════════════════════════════════════════
    // 8. Screen 130: Populated Garden (Arabic RTL)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("Setting up Screen 130 (Arabic RTL)...");
    await page.evaluate(({ key, data }) => {
      localStorage.setItem("ayxa-lang", "ar");
      const base = JSON.parse(localStorage.getItem(key) || "{}");
      Object.assign(base, data);
      localStorage.setItem(key, JSON.stringify(base));
    }, { key: STORAGE_KEY, data: populatedData });
    await page.goto(`${BASE_URL}/goals?tab=garden`);
    await page.waitForTimeout(1000);
    await captureScreen(page, "130_SomedayGarden_PopulatedGarden_Arabic_RTL.png", "Populated Someday Garden in Arabic RTL with feminine phrasing and growth stages");

    // Clean up test data after screenshots
    await page.evaluate((key) => {
      localStorage.setItem("ayxa-lang", "en");
      const base = JSON.parse(localStorage.getItem(key) || "{}");
      base.somedayWishes = [];
      localStorage.setItem(key, JSON.stringify(base));
    }, STORAGE_KEY);
  } catch (err) {
    console.error("Error during screenshot capture:", err);
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

run();
