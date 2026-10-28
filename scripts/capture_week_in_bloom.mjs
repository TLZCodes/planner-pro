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

// Generate base64 SVG test photo
function generateFloralDataUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFE4E6"/>
        <stop offset="50%" stop-color="#FECDD3"/>
        <stop offset="100%" stop-color="#FCE7F3"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#bg)"/>
    <circle cx="300" cy="200" r="100" fill="#FDA4AF" opacity="0.6"/>
    <circle cx="260" cy="180" r="50" fill="#FB7185" opacity="0.8"/>
    <circle cx="340" cy="180" r="50" fill="#FB7185" opacity="0.8"/>
    <circle cx="300" cy="140" r="50" fill="#F43F5E" opacity="0.85"/>
    <circle cx="300" cy="220" r="50" fill="#F43F5E" opacity="0.85"/>
    <circle cx="300" cy="180" r="30" fill="#FEF08A"/>
    <text x="300" y="340" font-family="sans-serif" font-size="20" font-weight="bold" fill="#881337" text-anchor="middle">Blooming moments • AYXA</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function buildSampleBloomState(options = {}) {
  const { isEmpty = false, layout = "scrapbook", theme = "blush" } = options;

  const sampleKeepsake = isEmpty
    ? null
    : {
        id: "bloom-sample-1",
        weekStartDate: "2026-10-10",
        weekEndDate: "2026-10-16",
        title: "Moments of Peace & Blooming 🌷",
        layout,
        theme,
        isDraft: false,
        showAyxaSignature: true,
        showDateRange: true,
        createdAt: "2026-10-15T10:00:00.000Z",
        updatedAt: "2026-10-15T12:00:00.000Z",
        blocks: [
          {
            id: "photo",
            type: "photo",
            visible: true,
            content: {
              url: generateFloralDataUrl(),
              caption: "Golden morning light filtering through morning blooms.",
              description: "Morning flowers",
              focalPoint: "center",
            },
          },
          {
            id: "accomplishments",
            type: "accomplishments",
            visible: true,
            titleCustom: "Quiet Wins & Milestones",
            content: [
              "Completed the quarterly client strategy deck",
              "Maintained morning reflection before phone checking",
              "Completed 4 gentle Pilates sessions",
            ],
          },
          {
            id: "lovely_moment",
            type: "lovely_moment",
            visible: true,
            titleCustom: "Heartfelt Moment",
            content:
              "Sitting on the terrace with warm lavender tea, listening to the rain gently falling on the leaves. My soul felt rested.",
          },
          {
            id: "supported_habit",
            type: "supported_habit",
            visible: true,
            content: {
              title: "Daily Quran & Contemplation",
              note: "7 consecutive days of peaceful dawn presence",
            },
          },
          {
            id: "focus_study",
            type: "focus_study",
            visible: true,
            content: {
              minutes: 185,
              label: "Deep Focus & Study",
              isSoFar: true,
            },
          },
          {
            id: "lesson",
            type: "lesson",
            visible: true,
            content:
              "True productivity is not rushing; it is choosing what matters with intention and gentle grace.",
          },
          {
            id: "gratitude",
            type: "gratitude",
            visible: true,
            content:
              "Alhamdulillah for quiet mornings, good health, and the loving support of family.",
          },
          {
            id: "next_intention",
            type: "next_intention",
            visible: true,
            content:
              "Speak with calm softness, drink plenty of water, and protect my evening peace.",
          },
        ],
      };

  return {
    user: { id: "user_test", name: "Sara", email: "sara@ayxa.app", setupDone: true },
    session: true,
    setupDone: true,
    xp: 450,
    prefs: {
      theme: "blush",
      language: "en",
      firstDayOfWeek: "saturday",
    },
    tasks: [
      {
        id: "t-1",
        title: "Finish branding moodboard",
        done: true,
        doneDate: "2026-10-12",
        completedAt: "2026-10-12T14:00:00.000Z",
      },
      {
        id: "t-2",
        title: "Review monthly financials",
        done: true,
        doneDate: "2026-10-14",
        completedAt: "2026-10-14T11:00:00.000Z",
      },
    ],
    habits: [
      { id: "h-1", title: "Morning Hydration", streak: 12, archived: false },
      { id: "h-2", title: "Evening Reading", streak: 6, archived: false },
    ],
    weeklyNotes: {
      "2026-10-10": {
        id: "wn-1",
        weekStartDate: "2026-10-10",
        accomplishments: [
          { text: "Designed new wellness dashboard", done: true },
        ],
        reflectionAnswers: {
          gratitude: "Thankful for serene mornings and answered prayers.",
          adjust: "Give myself more time between appointments.",
        },
        nextWeekIntention: "Breathe deeply and stay grounded in gratitude.",
      },
    },
    journal: [],
    weekInBloomKeepsakes: sampleKeepsake ? [sampleKeepsake] : [],
  };
}

async function saveShot(page, name) {
  const file1 = path.join(TARGET_DIR, `${name}.png`);
  const file2 = path.join(ARTIFACT_DIR, `${name}.png`);
  await page.screenshot({ path: file1, fullPage: false });
  fs.copyFileSync(file1, file2);
  console.log(`Saved screenshot: ${name}.png`);
}

async function capture() {
  const devProcess = await ensureDevServer();
  const browser = await chromium.launch({ headless: true });

  const createPageWithState = async (stateObj, lang = "en") => {
    const context = await browser.newContext({
      viewport: { width: 412, height: 915 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // Disable tour flags and inject state into localStorage
    await page.addInitScript(
      ({ state, lang }) => {
        state.prefs = state.prefs || {};
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
    console.log("Capturing 107_WeekInBloom_EmptyState_English...");
    {
      const { page, context } = await createPageWithState(buildSampleBloomState({ isEmpty: true }), "en");
      await page.goto(`${BASE_URL}/journal?tab=bloom`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);
      await saveShot(page, "107_WeekInBloom_EmptyState_English");
      await context.close();
    }

    // 2. Bloom Scrapbook Layout (English)
    console.log("Capturing 108_WeekInBloom_ScrapbookLayout_English...");
    {
      const { page, context } = await createPageWithState(
        buildSampleBloomState({ layout: "scrapbook", theme: "blush" }),
        "en"
      );
      await page.goto(`${BASE_URL}/journal?tab=bloom`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);

      // If on empty state, click create keepsake to open editor
      const createBtn = page.locator("button:has-text('Create a Keepsake')").first();
      if (await createBtn.isVisible()) {
        await createBtn.click();
        await page.waitForTimeout(600);
      }

      await saveShot(page, "108_WeekInBloom_ScrapbookLayout_English");

      // 3. Open Source Selection Modal from block
      console.log("Capturing 111_WeekInBloom_SourceSelection_English...");
      const chooseFromWeekBtn = page.locator("button:has-text('Choose from this week')").first();
      await chooseFromWeekBtn.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(400);
      if (await chooseFromWeekBtn.isVisible()) {
        await chooseFromWeekBtn.click();
        await page.waitForTimeout(600);
        await saveShot(page, "111_WeekInBloom_SourceSelection_English");

        // Close source modal
        const closeBtn = page.locator(".animate-fade-in button[aria-label='Close']").first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(400);
        }
      }

      // 4. Open Export Preview Modal
      console.log("Capturing 112_WeekInBloom_ExportPreview_English...");
      const exportBtn = page.locator("button:has-text('Export PNG')").first();
      await exportBtn.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(400);
      if (await exportBtn.isVisible()) {
        await exportBtn.click();
        await page.waitForTimeout(800);
        await saveShot(page, "112_WeekInBloom_ExportPreview_English");

        // Close export modal
        const cancelBtn = page.getByRole("button", { name: /Cancel/i }).first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
          await page.waitForTimeout(400);
        }
      }

      // 5. Save to Journal feedback state
      console.log("Capturing 113_WeekInBloom_SavedJournalKeepsake_English...");
      const saveToJournalBtn = page.locator("button:has-text('Save to Journal')").first();
      await saveToJournalBtn.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(400);
      if (await saveToJournalBtn.isVisible()) {
        await saveToJournalBtn.click();
        await page.waitForTimeout(600);
        await saveShot(page, "113_WeekInBloom_SavedJournalKeepsake_English");
      }

      await context.close();
    }

    // 6. Soft Minimal Layout (English)
    console.log("Capturing 109_WeekInBloom_SoftMinimalLayout_English...");
    {
      const { page, context } = await createPageWithState(
        buildSampleBloomState({ layout: "minimal", theme: "lavender" }),
        "en"
      );
      await page.goto(`${BASE_URL}/journal?tab=bloom`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);

      const createBtn = page.locator("button:has-text('Create a Keepsake')").first();
      if (await createBtn.isVisible()) {
        await createBtn.click();
        await page.waitForTimeout(500);
      }
      const minimalBtn = page.locator("button:has-text('Soft Minimal')").first();
      if (await minimalBtn.isVisible()) {
        await minimalBtn.click();
        await page.waitForTimeout(500);
      }

      await saveShot(page, "109_WeekInBloom_SoftMinimalLayout_English");
      await context.close();
    }

    // 7. Photo Diary Layout (English)
    console.log("Capturing 110_WeekInBloom_PhotoDiaryLayout_English...");
    {
      const { page, context } = await createPageWithState(
        buildSampleBloomState({ layout: "photo_diary", theme: "cream" }),
        "en"
      );
      await page.goto(`${BASE_URL}/journal?tab=bloom`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1000);

      const createBtn = page.locator("button:has-text('Create a Keepsake')").first();
      if (await createBtn.isVisible()) {
        await createBtn.click();
        await page.waitForTimeout(500);
      }
      const photoDiaryBtn = page.locator("button:has-text('Photo Diary')").first();
      if (await photoDiaryBtn.isVisible()) {
        await photoDiaryBtn.click();
        await page.waitForTimeout(500);
      }

      await saveShot(page, "110_WeekInBloom_PhotoDiaryLayout_English");
      await context.close();
    }

    // 8. Populated Arabic RTL View
    console.log("Capturing 114_WeekInBloom_ScrapbookLayout_Arabic_RTL...");
    {
      const stateAr = buildSampleBloomState({ layout: "scrapbook", theme: "blush" });
      stateAr.weekInBloomKeepsakes[0].title = "لحظات من السكينة والازدهار 🌷";
      const { page, context } = await createPageWithState(stateAr, "ar");
      await page.goto(`${BASE_URL}/journal?tab=bloom`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1200);

      const createBtn = page.locator("button:has-text('اصنعي تذكاراً')").first();
      if (await createBtn.isVisible()) {
        await createBtn.click();
        await page.waitForTimeout(500);
      }

      await saveShot(page, "114_WeekInBloom_ScrapbookLayout_Arabic_RTL");
      await context.close();
    }

    console.log("All Week in Bloom screenshots captured successfully!");
  } finally {
    await browser.close();
    if (devProcess) {
      devProcess.kill();
    }
  }
}

capture().catch((err) => {
  console.error("Capture script failed:", err);
  process.exit(1);
});
