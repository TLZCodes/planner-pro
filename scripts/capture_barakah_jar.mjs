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

function buildSampleBarakahState(options = {}) {
  const { isLocked = false, isEmpty = false } = options;
  const now = new Date().toISOString();

  const sampleBlessings = isEmpty
    ? []
    : [
        {
          id: "bj-1",
          date: "2026-10-15",
          time: "09:30",
          title: "Morning coffee & quiet light",
          body: "The steam rising from the cup while golden sunlight touched the balcony flowers. A peaceful breath before the day begins.",
          isBarakahJar: true,
          paperColor: "blush",
          flowerStyle: "sakura",
          tags: ["barakah_jar", "gratitude"],
          templateId: "gratitude",
          mood: "🌸",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "bj-2",
          date: "2026-10-14",
          time: "14:15",
          title: "Sister's surprise call",
          body: "She called just to say she was praying for me and reminded me of our childhood garden. My heart felt warm and embraced.",
          isBarakahJar: true,
          paperColor: "lavender",
          flowerStyle: "rose",
          tags: ["barakah_jar"],
          templateId: "gratitude",
          mood: "🥰",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "bj-3",
          date: "2026-10-12",
          time: "18:40",
          title: "Gentle rain after sunset",
          body: "Cool droplets against the glass window, the earthy scent of rain, and an unspoken feeling that everything will fall into place.",
          isBarakahJar: true,
          paperColor: "mint",
          flowerStyle: "chamomile",
          tags: ["barakah_jar"],
          templateId: "gratitude",
          mood: "✨",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "bj-4",
          date: "2026-10-09",
          time: "20:10",
          title: "Soft Quran recitation",
          body: "Surah Ar-Rahman softly filling the living room. Remembering that with every breath there are countless unseen gifts.",
          isBarakahJar: true,
          paperColor: "butter",
          flowerStyle: "lavender",
          tags: ["barakah_jar"],
          templateId: "gratitude",
          mood: "🕊️",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "bj-5",
          date: "2026-10-04",
          time: "11:20",
          title: "Overcoming a quiet doubt",
          body: "I completed the project presentation without self-criticism. Grateful for resilience that grows quietly day by day.",
          isBarakahJar: true,
          paperColor: "sky",
          flowerStyle: "jasmine",
          tags: ["barakah_jar"],
          templateId: "gratitude",
          mood: "🌸",
          createdAt: now,
          updatedAt: now,
        },
      ];

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
    xp: 320,
    journal: sampleBlessings,
    journalSettings: {
      journalLockEnabled: isLocked,
      pin: isLocked ? "1234" : undefined,
    },
    preferences: {
      theme: "pink",
      language: "en",
    },
  };
}

async function capture() {
  const devProcess = await ensureDevServer();
  const browser = await chromium.launch({ headless: true, channel: "chrome" });

  async function createPageWithState(state, lang = "en") {
    const context = await browser.newContext({
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      locale: lang === "ar" ? "ar-EG" : "en-US",
    });

    await context.addInitScript(
      ({ s, l }) => {
        localStorage.setItem("ayxa-app-state-v2", JSON.stringify(s));
        localStorage.setItem("ayxa-lang", l);
        localStorage.setItem("ayxa_lang", l);
        localStorage.setItem("ayxa_tour_done", "1");
        localStorage.setItem("ayxa_onboarding_done", "1");
      },
      { s: state, l: lang }
    );

    const page = await context.newPage();
    return { page, context };
  }

  async function saveShot(page, fileName) {
    const desktopPath = path.join(TARGET_DIR, `${fileName}.png`);
    const artifactPath = path.join(ARTIFACT_DIR, `${fileName}.png`);
    await page.screenshot({ path: desktopPath, fullPage: false });
    fs.copyFileSync(desktopPath, artifactPath);
    console.log(`✓ Saved screenshot: ${fileName}`);
  }

  try {
    // 1. Populated Barakah Jar (English)
    console.log("Capturing 100_BarakahJar_Populated_English...");
    {
      const { page, context } = await createPageWithState(buildSampleBarakahState(), "en");
      await page.goto(`${BASE_URL}/journal?tab=jar`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);
      await saveShot(page, "100_BarakahJar_Populated_English");

      // 2. Add Blessing Sheet (English)
      console.log("Capturing 101_BarakahJar_AddBlessing_English...");
      const addBtn = page.getByRole("button", { name: /Add a blessing/i }).first();
      await addBtn.click();
      await page.waitForTimeout(600);
      await page.locator("textarea").fill("Watching the quiet clouds drift by this afternoon. My heart feels deeply thankful for this calm pause.");
      await page.waitForTimeout(500);
      await saveShot(page, "101_BarakahJar_AddBlessing_English");

      // Save the blessing, which triggers onSaved and opens the reading card!
      await page.getByRole("button", { name: /Place into Jar/i }).click();
      await page.waitForTimeout(800);

      // 3. Reading Card View (English)
      console.log("Capturing 102_BarakahJar_ReadingCard_English...");
      await saveShot(page, "102_BarakahJar_ReadingCard_English");

      // Close note card modal via close button
      const closeCardBtn = page.locator(".animate-fade-in button").filter({ has: page.locator("svg.lucide-x") }).first();
      if (await closeCardBtn.isVisible()) {
        await closeCardBtn.click();
        await page.waitForTimeout(500);
      }

      // 4. Monthly Reading Ritual Modal (English)
      console.log("Capturing 103_BarakahJar_MonthlyReadingRitual_English...");
      const harvestBtn = page.getByText(/Open this month's jar/i);
      await harvestBtn.scrollIntoViewIfNeeded();
      if (await harvestBtn.isVisible()) {
        await harvestBtn.click();
        await page.waitForTimeout(600);
        await saveShot(page, "103_BarakahJar_MonthlyReadingRitual_English");
      }
      await context.close();
    }

    // 5. Populated Barakah Jar (Arabic RTL)
    console.log("Capturing 104_BarakahJar_Populated_Arabic_RTL...");
    {
      const { page, context } = await createPageWithState(buildSampleBarakahState(), "ar");
      await page.goto(`${BASE_URL}/journal?tab=jar`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1200);
      await saveShot(page, "104_BarakahJar_Populated_Arabic_RTL");
      await context.close();
    }

    // 6. Empty State (English)
    console.log("Capturing 105_BarakahJar_EmptyState_English...");
    {
      const { page, context } = await createPageWithState(buildSampleBarakahState({ isEmpty: true }), "en");
      await page.goto(`${BASE_URL}/journal?tab=jar`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);
      await saveShot(page, "105_BarakahJar_EmptyState_English");
      await context.close();
    }

    // 7. Locked PIN Protection State (English)
    console.log("Capturing 106_BarakahJar_LockedState_English...");
    {
      const { page, context } = await createPageWithState(buildSampleBarakahState({ isLocked: true }), "en");
      await page.goto(`${BASE_URL}/journal?tab=jar`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);
      await saveShot(page, "106_BarakahJar_LockedState_English");
      await context.close();
    }

    console.log("All Barakah Jar screenshots captured successfully!");
  } finally {
    await browser.close();
    if (devProcess) {
      devProcess.kill();
    }
  }
}

capture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
