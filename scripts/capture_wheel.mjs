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

function buildSampleWheelRecords(lang = "en") {
  const isAr = lang === "ar";
  return [
    // Previous Month: September 2026
    {
      id: "wheel-2026-09",
      yearMonth: "2026-09",
      areas: [
        { id: "faith", nameEn: "Faith", nameAr: "الإيمان", icon: "Moon", color: "#F472B6", order: 0 },
        { id: "health", nameEn: "Health", nameAr: "الصحة", icon: "Apple", color: "#34D399", order: 1 },
        { id: "mental_wellbeing", nameEn: "Mental wellbeing", nameAr: "الراحة النفسية", icon: "Smile", color: "#A78BFA", order: 2 },
        { id: "personal_growth", nameEn: "Personal growth", nameAr: "النمو الشخصي", icon: "Sprout", color: "#38BDF8", order: 3 },
        { id: "learning", nameEn: "Learning", nameAr: "التعلّم", icon: "BookOpen", color: "#818CF8", order: 4 },
        { id: "money", nameEn: "Money", nameAr: "المال", icon: "Coins", color: "#FBBF24", order: 5 },
        { id: "work_business", nameEn: "Work & Business", nameAr: "العمل والمشاريع", icon: "Briefcase", color: "#60A5FA", order: 6 },
        { id: "relationships", nameEn: "Relationships", nameAr: "العلاقات", icon: "Users", color: "#FB7185", order: 7 },
        { id: "rest_joy", nameEn: "Rest & Joy", nameAr: "الراحة والبهجة", icon: "Coffee", color: "#FB923C", order: 8 },
        { id: "home", nameEn: "Home", nameAr: "المنزل", icon: "Home", color: "#2DD4BF", order: 9 },
      ],
      ratings: {
        faith: 7,
        health: 6,
        mental_wellbeing: 6,
        personal_growth: 7,
        learning: 8,
        money: 5,
        work_business: 7,
        relationships: 8,
        rest_joy: 6,
        home: 7,
      },
      notes: {
        faith: isAr ? "استقرار في ورد الصباح" : "Steady with morning prayer and reflection",
        rest_joy: isAr ? "بحاجة إلى راحة أكبر" : "Need more intentional weekends",
      },
      focusAreaId: "health",
      focusIntention: isAr ? "الالتزام بالمشي اليومي" : "Daily 20-min evening walks",
      gentleAction: isAr ? "ارتداء حذاء مريح والبدء بعد العصر" : "Comfortable walking shoes ready by the door",
      isBackfilled: true,
      enteredAt: "2026-09-30T20:00:00.000Z",
      createdAt: "2026-09-30T20:00:00.000Z",
      updatedAt: "2026-09-30T20:00:00.000Z",
    },
    // Current Month: October 2026 (Completed)
    {
      id: "wheel-2026-10",
      yearMonth: "2026-10",
      areas: [
        { id: "faith", nameEn: "Faith", nameAr: "الإيمان", icon: "Moon", color: "#F472B6", order: 0 },
        { id: "health", nameEn: "Health", nameAr: "الصحة", icon: "Apple", color: "#34D399", order: 1 },
        { id: "mental_wellbeing", nameEn: "Mental wellbeing", nameAr: "الراحة النفسية", icon: "Smile", color: "#A78BFA", order: 2 },
        { id: "personal_growth", nameEn: "Personal growth", nameAr: "النمو الشخصي", icon: "Sprout", color: "#38BDF8", order: 3 },
        { id: "learning", nameEn: "Learning", nameAr: "التعلّم", icon: "BookOpen", color: "#818CF8", order: 4 },
        { id: "money", nameEn: "Money", nameAr: "المال", icon: "Coins", color: "#FBBF24", order: 5 },
        { id: "work_business", nameEn: "Work & Business", nameAr: "العمل والمشاريع", icon: "Briefcase", color: "#60A5FA", order: 6 },
        { id: "relationships", nameEn: "Relationships", nameAr: "العلاقات", icon: "Users", color: "#FB7185", order: 7 },
        { id: "rest_joy", nameEn: "Rest & Joy", nameAr: "الراحة والبهجة", icon: "Coffee", color: "#FB923C", order: 8 },
        { id: "home", nameEn: "Home", nameAr: "المنزل", icon: "Home", color: "#2DD4BF", order: 9 },
      ],
      ratings: {
        faith: 9,
        health: 8,
        mental_wellbeing: 7,
        personal_growth: 8,
        learning: 9,
        money: 6,
        work_business: 8,
        relationships: 9,
        rest_joy: 8,
        home: 7,
      },
      notes: {
        faith: isAr ? "سكينة كبيرة في أذكار الصباح وتدبر القرآن" : "Deep peace in morning remembrance and reflection",
        rest_joy: isAr ? "عطلات نهاية أسبوع مريحة دون التزامات عمل" : "Guilt-free reading weekends with tea",
        health: isAr ? "ترطيب منتظم ونوم أفضل" : "Better hydration and consistent sleep schedule",
      },
      focusAreaId: "rest_joy",
      focusIntention: isAr ? "منح نفسي حق الراحة التامة دون لوم الذات" : "Allowing myself guilt-free rest and creative joy",
      gentleAction: isAr ? "إيقاف الإشعارات بعد الساعة الثامنة مساءً" : "Turn off work notifications after 8:00 PM",
      linkedGoalId: "goal-creative-rest",
      reflectionNotes: {
        supportive: isAr ? "الصباحات الهادئة وفنجان القهوة على مهل" : "Quiet unhurried mornings and warm coffee",
        space: isAr ? "المساءات تحتاج مساحة أبعد عن الشاشات" : "Evenings need more breathing room away from screens",
        different: isAr ? "عدم جدولة أكثر من 3 مهام يومية" : "Never schedule more than 3 major tasks in one day",
        remain: isAr ? "جلسات القراءة الأسبوعية" : "Weekly quiet reading ritual",
      },
      isBackfilled: false,
      createdAt: "2026-10-01T10:00:00.000Z",
      updatedAt: "2026-10-16T10:00:00.000Z",
    },
  ];
}

async function captureScreen(page, filename, description) {
  const targetPath = path.join(TARGET_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);

  await page.screenshot({ path: targetPath, fullPage: false });

  try {
    fs.copyFileSync(targetPath, artifactPath);
  } catch (err) {
    console.warn(`Could not copy to artifact directory: ${err.message}`);
  }

  const stats = fs.statSync(targetPath);
  console.log(`[CAPTURED] ${filename} (${stats.size} bytes) - ${description}`);
}

async function injectState(page, wheelRecords, lang = "en") {
  await page.evaluate(
    ({ wheelRecords, lang, key }) => {
      localStorage.setItem("ayxa-lang", lang);
      localStorage.setItem("ayxa-prefs-v1", JSON.stringify({ lang, appearanceMode: "light" }));
      const base = JSON.parse(localStorage.getItem(key) || "{}");
      base.wheelOfBecomingRecords = wheelRecords;
      base.goals = base.goals || [];
      if (!base.goals.some((g) => g.id === "goal-creative-rest")) {
        base.goals.push({
          id: "goal-creative-rest",
          title: lang === "ar" ? "تخصيص وقت يومي للراحة والإبداع" : "Daily Creative Rest & Joy",
          category: "Personal",
          target: "Someday",
          status: "active",
          progress: 40,
        });
      }
      base.prefs = { ...(base.prefs || {}), lang, appearanceMode: "light" };
      localStorage.setItem(key, JSON.stringify(base));
    },
    { wheelRecords, lang, key: STORAGE_KEY }
  );

  await page.goto(`${BASE_URL}/journal?tab=wheel&month=2026-10`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
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
    // ── 1. Unrated State (English) ──
    console.log("Setting up Screen 139: Unrated State...");
    await page.goto(`${BASE_URL}/journal?tab=wheel&month=2026-10`, { waitUntil: "domcontentloaded" });
    await injectState(page, [], "en");

    await captureScreen(
      page,
      "139_WheelOfBecoming_UnratedState_English.png",
      "Unrated Wheel of Becoming state with concentric guide circles, friendly empty banner, and 0 ratings"
    );

    // ── 2. Partial Reflection (English) ──
    console.log("Setting up Screen 140: Partial Reflection...");
    const partialRecord = [
      {
        id: "wheel-2026-10",
        yearMonth: "2026-10",
        areas: [
          { id: "faith", nameEn: "Faith", nameAr: "الإيمان", icon: "Moon", color: "#F472B6", order: 0 },
          { id: "health", nameEn: "Health", nameAr: "الصحة", icon: "Apple", color: "#34D399", order: 1 },
          { id: "mental_wellbeing", nameEn: "Mental wellbeing", nameAr: "الراحة النفسية", icon: "Smile", color: "#A78BFA", order: 2 },
          { id: "personal_growth", nameEn: "Personal growth", nameAr: "النمو الشخصي", icon: "Sprout", color: "#38BDF8", order: 3 },
          { id: "learning", nameEn: "Learning", nameAr: "التعلّم", icon: "BookOpen", color: "#818CF8", order: 4 },
          { id: "money", nameEn: "Money", nameAr: "المال", icon: "Coins", color: "#FBBF24", order: 5 },
          { id: "work_business", nameEn: "Work & Business", nameAr: "العمل والمشاريع", icon: "Briefcase", color: "#60A5FA", order: 6 },
          { id: "relationships", nameEn: "Relationships", nameAr: "العلاقات", icon: "Users", color: "#FB7185", order: 7 },
          { id: "rest_joy", nameEn: "Rest & Joy", nameAr: "الراحة والبهجة", icon: "Coffee", color: "#FB923C", order: 8 },
          { id: "home", nameEn: "Home", nameAr: "المنزل", icon: "Home", color: "#2DD4BF", order: 9 },
        ],
        ratings: {
          faith: 8,
          health: 7,
        },
        notes: {
          faith: "Feeling peaceful with my early morning reflections.",
        },
        isBackfilled: false,
        createdAt: "2026-10-16T10:00:00.000Z",
        updatedAt: "2026-10-16T10:00:00.000Z",
      },
    ];
    await injectState(page, partialRecord, "en");

    await captureScreen(
      page,
      "140_WheelOfBecoming_PartialReflection_English.png",
      "Partial reflection with 2 areas rated, unrated dashes, helper notice, and faith reflection note"
    );

    // ── 3. Completed Wheel (English) ──
    console.log("Setting up Screen 141: Completed Wheel...");
    const fullRecordsEn = buildSampleWheelRecords("en");
    await injectState(page, fullRecordsEn, "en");

    await captureScreen(
      page,
      "141_WheelOfBecoming_CompletedWheel_English.png",
      "Completed pastel Wheel of Becoming with 10 colored sectors, rose connecting polygon, and checked-in badges"
    );

    // ── 4. Focus Selection Card (English) ──
    console.log("Setting up Screen 142: Focus Selection Card...");
    const focusCard = page.locator('text=What would you like to give a little care to this month?').first();
    await focusCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    await captureScreen(
      page,
      "142_WheelOfBecoming_FocusSelection_English.png",
      "Gentle Monthly Focus card with selected Rest & Joy area pill, intention, gentle action note, and linked Goal"
    );

    // ── 5. Month Comparison View (English) ──
    console.log("Setting up Screen 143: Month Comparison View...");
    // Scroll back to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(400);

    const compareBtn = page.locator('button:has-text("Compare Month")').first();
    if (await compareBtn.isVisible()) {
      await compareBtn.click();
      await page.waitForTimeout(600);
    }

    await captureScreen(
      page,
      "143_WheelOfBecoming_MonthComparison_English.png",
      "Neutral month-to-month comparison card showing previous vs current ratings without life grades or scores"
    );

    // Close comparison before export
    if (await compareBtn.isVisible()) {
      await compareBtn.click();
      await page.waitForTimeout(400);
    }

    // ── 6. Export Preview Modal (English) ──
    console.log("Setting up Screen 144: Export Preview Modal...");
    const exportBtn = page.locator('button:has-text("Export")').first();
    await exportBtn.click();
    await page.waitForTimeout(800);

    await captureScreen(
      page,
      "144_WheelOfBecoming_ExportPreview_English.png",
      "Export modal with live preview card, selection toggles, PIN lock privacy notice, and download CTA"
    );

    // Close Export modal
    const closeExport = page.locator('button[aria-label="Close"]').first();
    if (await closeExport.isVisible()) {
      await closeExport.click();
      await page.waitForTimeout(500);
    }

    // ── 7. Arabic RTL Completed Wheel ──
    console.log("Setting up Screen 145: Arabic RTL Populated Wheel...");
    const fullRecordsAr = buildSampleWheelRecords("ar");
    await injectState(page, fullRecordsAr, "ar");

    await captureScreen(
      page,
      "145_WheelOfBecoming_CompletedWheel_Arabic_RTL.png",
      "Arabic RTL Wheel of Becoming with feminine typography, localized month, Arabic area labels, and full pastel wheel"
    );

    console.log("All 7 Wheel of Becoming screenshots captured successfully!");
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

run().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
