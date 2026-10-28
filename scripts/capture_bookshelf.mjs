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

function buildSampleBooks(lang = "en") {
  const isAr = lang === "ar";
  return [
    {
      id: "book-atomic-habits",
      title: isAr ? "العادات الذرية" : "Atomic Habits",
      author: isAr ? "جيمس كلير" : "James Clear",
      format: "print",
      status: "reading",
      totalPages: 340,
      currentPage: 136,
      coverEmoji: "📗",
      genre: isAr ? "تطوير الذات" : "Productivity",
      rating: 5,
      review: isAr
        ? "كتاب محوري في بناء عادات صغيرة تصنع فارقاً هائلاً عبر الزمن."
        : "Tiny changes really do make a remarkable difference over time.",
      currentCycle: 1,
      addedDate: "2026-10-01",
      startedDate: "2026-10-02",
      cycles: [
        {
          cycleNumber: 1,
          startDate: "2026-10-02",
          status: "reading",
          endPage: 136,
        },
      ],
      logs: [
        {
          id: "log-ah-1",
          bookId: "book-atomic-habits",
          cycleNumber: 1,
          localDate: "2026-10-14",
          pagesRead: 25,
          endPage: 136,
          durationMinutes: 30,
          notes: isAr ? "الفصل الخاص بإشارات البيئة المحيطة." : "The chapter on environment cues.",
          createdAt: "2026-10-14T18:00:00Z",
        },
        {
          id: "log-ah-2",
          bookId: "book-atomic-habits",
          cycleNumber: 1,
          localDate: "2026-10-12",
          pagesRead: 30,
          endPage: 111,
          durationMinutes: 40,
          createdAt: "2026-10-12T19:00:00Z",
        },
      ],
      notes: [
        {
          id: "quote-ah-1",
          bookId: "book-atomic-habits",
          type: "quote",
          content: isAr
            ? "أنتِ لا ترتقين إلى مستوى أهدافكِ، بل تهبطين إلى مستوى أنظمتكِ."
            : "You do not rise to the level of your goals. You fall to the level of your systems.",
          pageOrLocation: "p. 27",
          createdAt: "2026-10-05T10:00:00Z",
        },
        {
          id: "note-ah-1",
          bookId: "book-atomic-habits",
          type: "note",
          content: isAr
            ? "إعادة ترتيب مكتب القراءة ليكون خالياً من المشتتات."
            : "Redesign my reading desk to keep distractions out of sight.",
          createdAt: "2026-10-10T11:00:00Z",
        },
      ],
    },
    {
      id: "book-power-of-now",
      title: isAr ? "قوة الآن" : "The Power of Now",
      author: isAr ? "إيكهارت تول" : "Eckhart Tolle",
      format: "audiobook",
      status: "reading",
      totalMinutes: 450, // 7h 30m
      currentMinutes: 180, // 3h 00m
      coverEmoji: "🎧",
      genre: isAr ? "وعي وهدوء" : "Mindfulness",
      rating: 4,
      currentCycle: 1,
      addedDate: "2026-10-05",
      startedDate: "2026-10-06",
      cycles: [
        {
          cycleNumber: 1,
          startDate: "2026-10-06",
          status: "reading",
          endMinutes: 180,
        },
      ],
      logs: [
        {
          id: "log-pn-1",
          bookId: "book-power-of-now",
          cycleNumber: 1,
          localDate: "2026-10-15",
          minutesListened: 45,
          endMinutes: 180,
          durationMinutes: 45,
          notes: isAr ? "فصل التنفس والتواجد في اللحظة." : "Chapter on conscious breathing.",
          createdAt: "2026-10-15T08:30:00Z",
        },
      ],
      notes: [
        {
          id: "quote-pn-1",
          bookId: "book-power-of-now",
          type: "quote",
          content: isAr
            ? "الماضي لا يملك قوة على الحاضر."
            : "Past has no power over the present moment.",
          pageOrLocation: "Ch. 3, 22:15",
          createdAt: "2026-10-10T12:00:00Z",
        },
      ],
    },
    {
      id: "book-little-prince",
      title: isAr ? "الأمير الصغير" : "The Little Prince",
      author: isAr ? "أنطوان دو سانت إكزوبيري" : "Antoine de Saint-Exupéry",
      format: "print",
      status: "finished",
      totalPages: 120,
      currentPage: 120,
      coverEmoji: "🌹",
      genre: isAr ? "أدب وفلسفة" : "Classic Literature",
      rating: 5,
      review: isAr
        ? "حكاية دافئة عن رؤية الأمور بالقلب وما لا تراه العيون."
        : "It is only with the heart that one can see rightly; what is essential is invisible to the eye.",
      currentCycle: 2,
      addedDate: "2026-09-15",
      finishedDate: "2026-10-08",
      cycles: [
        {
          cycleNumber: 1,
          startDate: "2026-09-15",
          completedDate: "2026-09-25",
          status: "finished",
          endPage: 120,
        },
        {
          cycleNumber: 2,
          startDate: "2026-10-01",
          completedDate: "2026-10-08",
          status: "finished",
          endPage: 120,
        },
      ],
      notes: [
        {
          id: "quote-lp-1",
          bookId: "book-little-prince",
          type: "quote",
          content: isAr
            ? "ما يجعل الصحراء جميلة هو أنها تخفي بئراً في مكان ما."
            : "What makes the desert beautiful is that somewhere it hides a well.",
          pageOrLocation: "p. 68",
          createdAt: "2026-10-08T15:00:00Z",
        },
      ],
    },
    {
      id: "book-deep-work",
      title: isAr ? "العمل العميق" : "Deep Work",
      author: isAr ? "كال نيوبورت" : "Cal Newport",
      format: "ebook",
      status: "want_to_read",
      totalPages: 296,
      currentPage: 0,
      coverEmoji: "📘",
      genre: isAr ? "إنتاجية وتركيز" : "Focus & Work",
      currentCycle: 1,
      addedDate: "2026-10-10",
    },
  ];
}

async function captureScreen(page, filename, description) {
  const targetPath = path.join(TARGET_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);

  await page.screenshot({ path: targetPath, fullPage: false });
  fs.copyFileSync(targetPath, artifactPath);

  const stats = fs.statSync(targetPath);
  console.log(`[CAPTURED] ${filename} (${stats.size} bytes) - ${description}`);
}

async function injectState(page, books, lang = "en") {
  await page.evaluate(
    ({ books, lang, key }) => {
      localStorage.setItem("ayxa-lang", lang);
      localStorage.setItem("ayxa-prefs-v1", JSON.stringify({ lang, appearanceMode: "light" }));
      const base = JSON.parse(localStorage.getItem(key) || "{}");
      base.books = books;
      base.monthlyReadingTarget = {
        yearMonth: "2026-10",
        type: "books",
        targetValue: 2,
      };
      base.prefs = { ...(base.prefs || {}), lang, appearanceMode: "light" };
      localStorage.setItem(key, JSON.stringify(base));
    },
    { books, lang, key: STORAGE_KEY }
  );

  await page.goto(`${BASE_URL}/learning?tab=bookshelf`, { waitUntil: "networkidle" });
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
    // ── 1. Empty Bookshelf (English) ──
    console.log("Setting up Screen 131: Empty Bookshelf...");
    await page.goto(`${BASE_URL}/learning?tab=bookshelf`, { waitUntil: "domcontentloaded" });
    await injectState(page, [], "en");

    await captureScreen(
      page,
      "131_Bookshelf_EmptyBookshelf_English.png",
      "Empty Bookshelf state with inviting illustration and '+ Add your first book' CTA"
    );

    // ── 2. Populated Bookshelf - Cover Grid View (English) ──
    console.log("Setting up Screen 132: Cover Grid View...");
    const sampleBooksEn = buildSampleBooks("en");
    await injectState(page, sampleBooksEn, "en");

    await captureScreen(
      page,
      "132_Bookshelf_CoverGrid_English.png",
      "Cover Grid view with monthly intention progress, pastel book covers, truthful progress, and ratings"
    );

    // ── 3. Compact List View (English) ──
    console.log("Setting up Screen 133: Compact List View...");
    const listBtn = page.locator('button[aria-label="List View"]');
    if (await listBtn.isVisible()) {
      await listBtn.click();
      await page.waitForTimeout(500);
    }
    await captureScreen(
      page,
      "133_Bookshelf_CompactListView_English.png",
      "Compact List view with mini covers, format badges, progress indicators, and quick action buttons"
    );

    // ── 4. Book Detail Modal (English) ──
    console.log("Setting up Screen 134: Book Detail Modal...");
    // Click on Atomic Habits in list or grid
    const atomicRow = page.locator('text=Atomic Habits').first();
    await atomicRow.click();
    await page.waitForTimeout(800);

    await captureScreen(
      page,
      "134_Bookshelf_BookDetail_English.png",
      "Book detail view with hero cover, truthful progress, 5-star rating, 'Read with Focus', and 'Log Reading'"
    );

    // ── 5. Reading Logger Modal (English) ──
    console.log("Setting up Screen 135: Reading Logger Modal...");
    const logBtn = page.locator('button:has-text("Log Reading")').first();
    await logBtn.click();
    await page.waitForTimeout(600);

    await captureScreen(
      page,
      "135_Bookshelf_ReadingLogger_English.png",
      "Log reading session sheet with strict local date, reached position vs added delta, and reflections"
    );

    // Close Logger modal
    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await page.waitForTimeout(400);
    }

    // ── 6. Notes & Quotes Tab (English) ──
    console.log("Setting up Screen 136: Notes & Quotes Tab...");
    const quotesTab = page.locator('button:has-text("Quotes & Notes")').first();
    if (await quotesTab.isVisible()) {
      await quotesTab.click();
      await page.waitForTimeout(500);
    }

    await captureScreen(
      page,
      "136_Bookshelf_NotesAndQuotes_English.png",
      "Quotes & Notes tab with user-entered quotes, page citations, reflections, and '+ Add Quote' CTA"
    );

    // Close BookDetailModal
    const closeBtn1 = page.locator('[data-testid="close-book-detail"]').first();
    if (await closeBtn1.isVisible()) {
      await closeBtn1.click();
    } else {
      await page.keyboard.press("Escape");
    }
    await page.waitForTimeout(600);

    // ── 7. Audiobook Detail & Progress (English) ──
    console.log("Setting up Screen 137: Audiobook Detail & Listening Progress...");
    const audioRow = page.locator('text=The Power of Now').first();
    await audioRow.scrollIntoViewIfNeeded();
    await audioRow.click();
    await page.waitForTimeout(800);

    await captureScreen(
      page,
      "137_Bookshelf_AudiobookProgress_English.png",
      "Audiobook detail with headphones badge, hours & minutes tracking, and listening session history"
    );

    const closeBtn2 = page.locator('[data-testid="close-book-detail"]').first();
    if (await closeBtn2.isVisible()) {
      await closeBtn2.click();
    } else {
      await page.keyboard.press("Escape");
    }
    await page.waitForTimeout(600);

    // ── 8. Arabic RTL View (Populated Bookshelf) ──
    console.log("Setting up Screen 138: Arabic RTL Populated Bookshelf...");
    const sampleBooksAr = buildSampleBooks("ar");
    await injectState(page, sampleBooksAr, "ar");

    // Switch to grid view if not already
    const gridBtn = page.locator('button[aria-label="Grid View"]');
    if (await gridBtn.isVisible()) {
      await gridBtn.click();
      await page.waitForTimeout(500);
    }

    await captureScreen(
      page,
      "138_Bookshelf_PopulatedBookshelf_Arabic_RTL.png",
      "Arabic RTL Bookshelf with feminine typography, monthly intention card, status pills, and cover grid"
    );

    console.log("All 8 Bookshelf screenshots captured successfully!");
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
