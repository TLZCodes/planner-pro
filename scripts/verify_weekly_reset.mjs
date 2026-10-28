import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const TARGET_DIR = "C:\\Users\\TLZCodes\\Desktop\\AYXA_App_All_Screenshots";
const ARTIFACT_DIR = "C:\\Users\\TLZCodes\\.gemini\\antigravity\\brain\\383d13b5-b1c5-499b-8abc-6a86bd737c5c";
const BASE_URL = "http://127.0.0.1:8081";

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

async function run() {
  console.log("Connecting to browser...");
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

  // 1. Initialise localStorage state with realistic sample data
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => {
    localStorage.setItem("ayxa-lang", "en");
    localStorage.setItem("ayxa_lang", "en");

    const todayStr = new Date().toISOString().slice(0, 10);
    // Find current week Monday/Saturday
    const state = {
      user: {
        id: "user_active_ayxa",
        name: "Sara",
        email: "sara@ayxaplanner.app",
        isGuest: false,
        setupDone: true,
        authType: "authenticated",
      },
      session: true,
      tasks: [
        {
          id: "t-done-1",
          title: "Submit research thesis chapter 1",
          done: true,
          doneDate: todayStr,
          category: "Study",
        },
        {
          id: "t-done-2",
          title: "Batch prepare wholesome dinners",
          done: true,
          doneDate: todayStr,
          category: "Self-Care",
        },
        {
          id: "t-open-1",
          title: "Review monthly budget & savings",
          done: false,
          dueDate: todayStr,
          category: "Finance",
        },
        {
          id: "t-open-2",
          title: "Book dental cleaning appointment",
          done: false,
          dueDate: todayStr,
          category: "Health",
        },
      ],
      habits: [
        {
          id: "h-quran",
          title: "Morning Quran & Adhkar",
          category: "Faith",
          frequency: "daily",
          period: "morning",
          status: "active",
          streak: 12,
          completions: { [todayStr]: true },
        },
        {
          id: "h-walk",
          title: "30-min Outdoor Nature Walk",
          category: "Health",
          frequency: "daily",
          period: "afternoon",
          status: "active",
          streak: 5,
          completions: { [todayStr]: true },
        },
      ],
      goals: [
        {
          id: "g-arabic",
          title: "Learn Conversational Arabic Fluency",
          category: "Learning",
          status: "active",
          progress: 45,
        },
      ],
      focusSessions: [
        {
          id: "fs-1",
          localDate: todayStr,
          status: "completed",
          sourceType: "subject",
          actualFocusSeconds: 2700,
        },
      ],
      studySessions: [
        {
          id: "ss-1",
          date: todayStr,
          minutes: 45,
        },
      ],
      dailyMoods: {
        [todayStr]: { date: todayStr, mood: "happy", emoji: "🌸", energy: "medium" },
      },
      dailyHydration: {
        [todayStr]: { dateStr: todayStr, consumedMl: 1800, targetMl: 2000 },
      },
      journal: [
        {
          id: "j-sample-1",
          date: todayStr,
          title: "A calm, gentle morning",
          body: "The sunlight through the window was so comforting today. Feeling grateful for quiet moments.",
          templateId: "morning",
          tags: ["gratitude", "peace"],
          sticker: "🌸",
        },
      ],
      weeklyNotes: {},
    };

    localStorage.setItem("ayxa-app-state-v2", JSON.stringify(state));
  });

  // ── Snap 83: Journal Feed with [Daily Journal] & [Weekly Reset] Toggle ──
  await page.goto(`${BASE_URL}/journal`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await snap("83_WeeklyReset_JournalTab_English.png");

  // ── Snap 84: Weekly Reset Studio Overview Step (English) ──
  await page.goto(`${BASE_URL}/journal?tab=reset`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await snap("84_WeeklyReset_Overview_English.png");

  // ── Snap 85: Step 1: Gentle Reflection Prompts (English) ──
  // Click on "Reflections 🌸" pill
  const reflectionPill = page.locator("button:has-text('Reflections 🌸'), button:has-text('التأملات 🌸')").first();
  if (await reflectionPill.count() > 0) {
    await reflectionPill.click();
    await page.waitForTimeout(600);
  }
  await snap("85_WeeklyReset_ReflectionPrompts_English.png");

  // ── Snap 86: Energy Reflection Tab (What drained & what restored energy) ──
  const energyTab = page.locator("button:has-text('Energy & Vitality ⚡'), button:has-text('مستوى الطاقة والحيوية ⚡')").first();
  if (await energyTab.count() > 0) {
    await energyTab.click();
    await page.waitForTimeout(600);
  }
  await snap("86_WeeklyReset_EnergyCards_English.png");

  // ── Snap 87: Step 2: Accomplishments ──
  const accomplishmentsPill = page.locator("button:has-text('Accomplishments 🏆'), button:has-text('الإنجازات 🏆')").first();
  if (await accomplishmentsPill.count() > 0) {
    await accomplishmentsPill.click();
    await page.waitForTimeout(600);
  }
  await snap("87_WeeklyReset_Accomplishments_English.png");

  // ── Snap 88: Step 3: Unfinished Open Tasks Review ──
  const unfinishedPill = page.locator("button:has-text('Unfinished Tasks 🌿'), button:has-text('المهام المتبقية 🌿')").first();
  if (await unfinishedPill.count() > 0) {
    await unfinishedPill.click();
    await page.waitForTimeout(600);
  }
  await snap("88_WeeklyReset_UnfinishedTasks_English.png");

  // ── Snap 89: Step 4: Top 3 Priorities for Next Week ──
  const prioritiesPill = page.locator("button:has-text('Next Priorities 🎯'), button:has-text('أولويات القادم 🎯')").first();
  if (await prioritiesPill.count() > 0) {
    await prioritiesPill.click();
    await page.waitForTimeout(600);
  }
  await snap("89_WeeklyReset_NextPriorities_English.png");

  // ── Snap 90: Action Preview Modal Before Applying Task Actions ──
  const reviewApplyBtn = page.locator("button:has-text('Review & Apply ✨'), button:has-text('معاينة واعتماد الإجراءات ✨'), button:has-text('Finish Reset ✨'), button:has-text('إتمام مراجعة الأسبوع ✨')").first();
  if (await reviewApplyBtn.count() > 0) {
    await reviewApplyBtn.click();
    await page.waitForTimeout(600);
  }
  await snap("90_WeeklyReset_ActionPreviewModal_English.png");

  // Click Apply/Finish inside Modal
  const confirmApplyBtn = page.locator("button:has-text('Finish & Save Reset ✨'), button:has-text('Confirm & Apply Changes ✨'), button:has-text('تأكيد وتطبيق التغييرات ✨'), button:has-text('إتمام المراجعة وحفظها ✨')").first();
  if (await confirmApplyBtn.count() > 0) {
    await confirmApplyBtn.click();
    await page.waitForTimeout(1000);
  }

  // ── Snap 91: Gentle Resting Completion Screen (English) ──
  await snap("91_WeeklyReset_CompletionResting_English.png");

  // ── Arabic RTL Verification ──
  console.log("Switching to Arabic RTL...");
  await page.evaluate(() => {
    localStorage.setItem("ayxa-lang", "ar");
    localStorage.setItem("ayxa_lang", "ar");
    try {
      const raw = localStorage.getItem("ayxa-app-state-v2");
      if (raw) {
        const s = JSON.parse(raw);
        s.prefs = s.prefs || {};
        s.prefs.language = "ar";
        // Reset the reflection status so we can view the studio wizard in Arabic
        if (s.weeklyNotes) {
          Object.keys(s.weeklyNotes).forEach((k) => {
            s.weeklyNotes[k].completedReflection = false;
          });
        }
        localStorage.setItem("ayxa-app-state-v2", JSON.stringify(s));
      }
    } catch (e) {}
  });

  // ── Snap 92: Weekly Reset Studio Overview Step (Arabic RTL) ──
  await page.goto(`${BASE_URL}/journal?tab=reset`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await snap("92_WeeklyReset_Overview_Arabic_RTL.png");

  // ── Snap 93: Weekly Reset Studio Reflection Step (Arabic RTL) ──
  const arReflectPill = page.locator("button:has-text('التأملات 🌸')").first();
  if (await arReflectPill.count() > 0) {
    await arReflectPill.click();
    await page.waitForTimeout(600);
  }
  await snap("93_WeeklyReset_Reflection_Arabic_RTL.png");

  // Finish reset in Arabic to view completion screen
  const arFinishBtn = page.locator("button:has-text('إتمام مراجعة الأسبوع ✨')").first();
  if (await arFinishBtn.count() > 0) {
    await arFinishBtn.click();
    await page.waitForTimeout(600);
    const arConfirmBtn = page.locator("button:has-text('إتمام المراجعة وحفظها ✨'), button:has-text('تأكيد وتطبيق التغييرات ✨')").first();
    if (await arConfirmBtn.count() > 0) {
      await arConfirmBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // ── Snap 94: Arabic Completion Screen ──
  await snap("94_WeeklyReset_Completion_Arabic_RTL.png");

  // ── Snap 95: Weekly Habit Board with "Gentle Weekly Reflection" Link ──
  await page.goto(`${BASE_URL}/habits`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  // Ensure we are on Week tab in habits if needed
  const weekTab = page.locator("button:has-text('Week'), button:has-text('الأسبوع')").first();
  if (await weekTab.count() > 0) {
    await weekTab.click();
    await page.waitForTimeout(800);
  }
  await snap("95_WeeklyHabitBoard_ReflectLink_English.png");

  await browser.close();
  console.log("All screenshots captured successfully!");
}

run().catch((err) => {
  console.error("Error during verification:", err);
  process.exit(1);
});
