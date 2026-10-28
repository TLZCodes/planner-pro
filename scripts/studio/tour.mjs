// AYXA Planner Pro — client walkthrough tour: recording stage.
//
// This is NOT a promo film. It is a real screen recording of the running app,
// driven like a person would drive it: navigate, pause, scroll, move on. The
// client sees the product, not a pitch.
//
// Every pixel here is the real application at http://127.0.0.1:8081, seeded with
// the same honest sample state the screenshot studio uses (scripts/studio/
// capture-screens.mjs exports buildState for exactly this reason). No external
// image or video model is used anywhere in this pipeline.
//
// Output: edit/tour/seg-NN.webm   one video per stop, so the edit can cut on
//                                 exact boundaries instead of guessing timings
//         edit/tour/manifest.json per-stop label, file, measured duration
//
// Run: node scripts/studio/tour.mjs
// Prereq: a Vite dev server on http://127.0.0.1:8081 (this script starts one if
//         the port is not already answering).

import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { spawn, execFileSync } from "child_process";
import { buildState } from "./capture-screens.mjs";

const BASE_URL = "http://127.0.0.1:8081";
const OUT_DIR = path.resolve("edit/tour");

// 412x915 is the app's own design width (see MobileShell max-w-[430px]).
// DSR 2 means the recording is 824x1830, which the edit scales to 1920 high with
// barely any resampling, so text stays crisp.
const VIEWPORT = { width: 412, height: 915 };
const DSR = 2;
const REC_SIZE = { width: VIEWPORT.width * DSR, height: VIEWPORT.height * DSR };

// ─── Pacing ───────────────────────────────────────────────────────────────────
// Each stop is: settle → hold → slow scroll → hold. Long enough to read, short
// enough that a 26-module tour lands near three minutes.
const PACE = {
  leadIn: 1100, // after navigation, let the route paint
  holdBefore: 1500, // read the top of the screen
  scrollMs: 4800, // the slow reveal
  holdAfter: 1900, // read the bottom of the screen
};

// ─── The tour ─────────────────────────────────────────────────────────────────
// One entry per stop. `label` is the only text this pipeline adds to the frame,
// and it is drawn locally in the edit stage with ffmpeg drawtext — never
// requested from a model.
//
// scroll: pixels to reveal. Kept modest because the app is a single column and
// overscrolling past the footer looks like a mistake.
const STOPS = [
  { label: "Home — your day at a glance", route: "/", scroll: 620 },
  { label: "Tasks — top three, then the rest", route: "/tasks", scroll: 700 },
  { label: "AI Planner — intent becomes a plan", route: "/ai", scroll: 520 },
  { label: "Routines — morning to night", route: "/routines", scroll: 700 },
  {
    label: "Ideal Week — plan between the prayers",
    route: "/routines?key=ideal-week",
    scroll: 560,
  },
  {
    label: "Between the Prayers — six real windows",
    route: "/routines?key=ideal-week",
    scroll: 520,
    click: [/Between Prayers/i, /بين الصلوات/],
  },
  { label: "Habits — a fair weekly matrix", route: "/habits", scroll: 640 },
  { label: "Goals — ambition broken into steps", route: "/goals", scroll: 700 },
  { label: "Vision Board — a scrapbook of intent", route: "/goals?tab=vision", scroll: 520 },
  { label: "Focus — deep work with ambience", route: "/focus", scroll: 560 },
  { label: "My Deen — prayer, Quran, Athkar", route: "/deen", scroll: 760 },
  { label: "Journal — private entries", route: "/journal", scroll: 620 },
  {
    label: "Weekly Reset — the four-step review",
    route: "/journal",
    scroll: 600,
    click: [/Weekly Reset/i, /المراجعة الأسبوعية/],
  },
  { label: "Learning — subjects, books, flashcards", route: "/learning", scroll: 700 },
  { label: "Business — projects, clients, invoices", route: "/business", scroll: 700 },
  { label: "Finance — budgets and savings", route: "/finance", scroll: 700 },
  { label: "Travel — trips and packing", route: "/travel", scroll: 700 },
  { label: "Wellness — water, sleep, movement", route: "/wellness", scroll: 700 },
  { label: "Self-care — rituals and pauses", route: "/selfcare", scroll: 660 },
  { label: "Year in Pixels — your year in colour", route: "/year-in-pixels", scroll: 560 },
  { label: "Bullet Journal — a pastel canvas", route: "/bujo", scroll: 560 },
  { label: "Challenges — disciplined protocols", route: "/challenges", scroll: 660 },
  { label: "Progress & Badges — growth you can see", route: "/progress", scroll: 700 },
  { label: "Settings — language, theme, export", route: "/settings", scroll: 760 },
  { label: "Arabic — the whole app mirrored RTL", route: "/", lang: "ar", scroll: 620 },
  { label: "Back to English", route: "/", scroll: 480 },
];

const OVERRIDE = buildState();

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    console.log(`dev server already up on ${BASE_URL}`);
    return null;
  }
  console.log(`starting vite dev on ${BASE_URL} …`);
  const child = spawn("npx", ["vite", "dev", "--host", "127.0.0.1", "--port", "8081"], {
    cwd: process.cwd(),
    shell: true,
    stdio: "ignore",
    detached: false,
  });
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 700));
    if (await portIsUp(BASE_URL)) {
      console.log("dev server is up");
      return child;
    }
  }
  throw new Error("vite dev did not come up on 8081 within 42s");
}

// localStorage is seeded with addInitScript so the app never paints an
// un-onboarded shell before the sample state exists.
function seedFn(override) {
  try {
    const KEY = "ayxa-app-state-v2";
    const raw = localStorage.getItem(KEY);
    const base = raw ? JSON.parse(raw) : {};
    const merged = { ...base, ...override };
    merged.prefs = { ...(base.prefs || {}), ...(override.prefs || {}) };
    merged.user = { ...(base.user || {}), ...override.user };
    if (!merged.prefs.language) merged.prefs.language = "en";
    localStorage.setItem(KEY, JSON.stringify(merged));
    localStorage.setItem("ayxa-lang", "en");
    localStorage.setItem("ayxa_lang", "en");
    localStorage.setItem("ayxa_guest_id", "user_active_ayxa");
    localStorage.setItem("pro_active_challenge_id", "ch01");
    localStorage.setItem(
      "pro_challenge_completed_days",
      JSON.stringify(Array.from({ length: 18 }, (_, i) => i + 1)),
    );
    localStorage.setItem("ayxa_tour_done", "1");
  } catch (e) {
    /* surfaced by the first failed stop */
  }
}

function setLang(lang) {
  try {
    localStorage.setItem("ayxa-lang", lang);
    localStorage.setItem("ayxa_lang", lang);
    const KEY = "ayxa-app-state-v2";
    const s = JSON.parse(localStorage.getItem(KEY) || "{}");
    s.prefs = s.prefs || {};
    s.prefs.language = lang;
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch (e) {}
}

// The scrollbar is a capture artefact, not part of the product.
const HIDE_SCROLLBAR = `
  *{scrollbar-width:none !important;}
  *::-webkit-scrollbar{width:0 !important;height:0 !important;}
  html{scroll-behavior:auto !important;}
`;

async function warmUp(page) {
  await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve())).catch(() => {});
  await page.addStyleTag({ content: HIDE_SCROLLBAR }).catch(() => {});
  // Some first-run gates are one click deep. If one is present, walk through it.
  for (const pattern of [/skip/i, /get started/i, /continue/i, /تخطي/i, /ابدأ/i]) {
    const btn = page.getByRole("button", { name: pattern }).first();
    if (await btn.count().catch(() => 0)) {
      const visible = await btn.isVisible().catch(() => false);
      if (visible) {
        await btn.click({ timeout: 2500 }).catch(() => {});
        await page.waitForTimeout(450);
      }
    }
  }
}

async function slowScroll(page, px, ms) {
  if (!px) return;
  const steps = Math.max(14, Math.round(ms / 80));
  await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height / 2);
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, px / steps);
    await page.waitForTimeout(ms / steps);
  }
}

async function tryClick(page, patterns) {
  for (const pattern of patterns) {
    const el = page.getByText(pattern).first();
    if (!(await el.count().catch(() => 0))) continue;
    if (!(await el.isVisible().catch(() => false))) continue;
    await el.click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(1200);
    return true;
  }
  return false;
}

function probeSeconds(file) {
  const raw = execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=nw=1:nk=1",
    file,
  ], { encoding: "utf8" }).trim();
  return Number.parseFloat(raw);
}

// ─── Local graphic cards (no model involved) ──────────────────────────────────
// Drawn with the app's own design tokens and the fonts the app already loads, so
// the tour opens and closes in the product's own voice.
const CARD_CSS = `
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{width:${VIEWPORT.width}px;height:${VIEWPORT.height}px;overflow:hidden;
    background:radial-gradient(120% 90% at 50% 8%,#fffdfe 0%,#fff8fa 46%,#fdeef5 100%);
    font-family:'Plus Jakarta Sans','Quicksand',sans-serif;color:#2b1727;}
  .grain{position:absolute;inset:0;opacity:.35;pointer-events:none;
    background-image:radial-gradient(rgba(43,23,39,.05) 1px,transparent 1px);background-size:3px 3px;}
  .deco{position:absolute;pointer-events:none;}
  .hand{font-family:'Great Vibes','Pacifico',cursive;}
  .washi{position:absolute;height:26px;width:118px;border-radius:3px;opacity:.5;
    background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.75) 0 5px,transparent 5px 11px);}
`;

function introCard() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CARD_CSS}</style></head><body>
    <div class="grain"></div>
    <div class="washi" style="top:150px;left:58px;transform:rotate(-6deg);background:#ffd6e7"></div>
    <div class="washi" style="top:136px;right:54px;transform:rotate(7deg);background:#fff1b8"></div>
    <div class="deco" style="top:248px;left:46px;font-size:26px;opacity:.5">🌸</div>
    <div class="deco" style="top:660px;right:48px;font-size:26px;opacity:.5">🌷</div>
    <div class="deco" style="top:214px;right:92px;font-size:20px;opacity:.45">✨</div>
    <div class="deco" style="top:700px;left:82px;font-size:20px;opacity:.45">🌟</div>
    <div style="position:absolute;left:0;right:0;top:262px;text-align:center;padding:0 34px">
      <div class="hand" style="font-size:23px;color:#6e4e64;margin-bottom:20px">a planner for the whole of you</div>
      <div style="font-family:'Playfair Display',serif;font-weight:900;font-size:47px;line-height:1.06;letter-spacing:-.6px">
        AYXA<br><span style="font-size:35px;letter-spacing:.6px">Planner Pro</span>
      </div>
      <div style="margin:30px auto 0;width:132px;height:4px;border-radius:99px;
        background:linear-gradient(90deg,#ffd6e7,#ff1493,#e6e6fa)"></div>
      <div style="margin-top:28px;font-size:15.5px;font-weight:700;color:#6e4e64;line-height:1.5">
        A working tour of the live app
      </div>
    </div>
    <div style="position:absolute;left:0;right:0;bottom:78px;text-align:center;font-size:12.5px;font-weight:700;color:#6e4e64;opacity:.85">
      English &amp; Arabic · Your data stays on your device
    </div>
  </body></html>`;
}

function outroCard() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CARD_CSS}</style></head><body>
    <div class="grain"></div>
    <div class="washi" style="top:168px;left:62px;transform:rotate(-7deg);background:#e6e6fa"></div>
    <div class="washi" style="top:154px;right:58px;transform:rotate(6deg);background:#ffd6e7"></div>
    <div class="deco" style="top:266px;left:50px;font-size:26px;opacity:.5">🌸</div>
    <div class="deco" style="top:648px;right:52px;font-size:26px;opacity:.5">🌷</div>
    <div class="deco" style="top:230px;right:86px;font-size:20px;opacity:.45">✨</div>
    <div style="position:absolute;left:50%;top:210px;transform:translateX(-50%);
      width:250px;height:512px;border-radius:40px;background:#40263b;padding:8px;
      box-shadow:0 22px 52px rgba(120,40,90,.20)">
      <div style="width:100%;height:100%;border-radius:33px;background:#fff8fa;
        display:flex;align-items:center;justify-content:center">
        <div style="text-align:center">
          <div class="hand" style="font-size:19px;color:#6e4e64">with you, gently</div>
          <div style="margin-top:12px;font-size:40px">🌸</div>
        </div>
      </div>
    </div>
    <div style="position:absolute;left:0;right:0;bottom:100px;text-align:center;padding:0 30px">
      <div class="hand" style="font-size:22px;color:#6e4e64;margin-bottom:16px">begin your own week</div>
      <div style="font-family:'Playfair Display',serif;font-weight:900;font-size:37px;line-height:1.08">AYXA Planner Pro</div>
      <div style="margin:22px auto 0;width:112px;height:4px;border-radius:99px;
        background:linear-gradient(90deg,#ffd6e7,#ff1493,#e6e6fa)"></div>
      <div style="margin-top:24px;font-size:14.5px;font-weight:700;color:#6e4e64">
        Open the app and start with today.
      </div>
    </div>
  </body></html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // Clear only the takes this run is about to re-record. A partial re-shoot must
  // never cost the stops it is not touching.

  const devServer = await ensureDevServer();

  console.log("");
  console.log("AYXA Planner Pro — client walkthrough tour");
  console.log(`App:      ${BASE_URL}`);
  console.log(`Stops:    ${STOPS.length}`);
  console.log(`Capture:  ${REC_SIZE.width}x${REC_SIZE.height} (412x915 @ ${DSR}x)`);
  console.log("");

  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const manifest = [];

  // A card is a stop too, but it is not the app: it is a local HTML render.
  // Each stop is tagged with its absolute position here, before any selection,
  // so a partial re-shoot writes the take it was asked for instead of
  // overwriting whichever stop happens to sit at that index in this run.
  const allStops = [
    { kind: "card", card: "open", label: "AYXA Planner Pro" },
    ...STOPS.map((s) => ({ kind: "app", ...s })),
    { kind: "card", card: "close", label: "Start with today" },
  ].map((s, i) => ({ ...s, tag: String(i + 1).padStart(2, "0") }));

  // TOUR_LIMIT=3 records the first three stops only, for a fast smoke test.
  // TOUR_RANGE=12-14 re-records just those stops, which is what you want after
  // changing one module: the other takes are kept, not thrown away.
  const limit = Number.parseInt(process.env.TOUR_LIMIT || "0", 10);
  const range = (process.env.TOUR_RANGE || "").trim();
  let cardStops = allStops;
  if (limit > 0) {
    cardStops = allStops.slice(0, limit);
  } else if (range) {
    const [from, to] = range.split("-").map((n) => Number.parseInt(n, 10));
    cardStops = allStops.filter((s) => Number(s.tag) >= from && Number(s.tag) <= (to || from));
    if (!cardStops.length) throw new Error(`TOUR_RANGE="${range}" selected no stops`);
  }

  // Takes from an earlier run are kept unless this run re-records that tag, so a
  // single re-shoot never costs the other twenty-seven stops.
  const manifestPath = path.join(OUT_DIR, "manifest.json");
  let prior = { segments: [] };
  if (fs.existsSync(manifestPath)) {
    try {
      prior = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    } catch (e) {
      console.log("note: the existing manifest.json could not be read and was replaced");
    }
  }

  for (const stop of cardStops) {
    const index = stop.tag;
    const started = Date.now();
    let context;
    let tRecordStart = started;
    let tWarm = started;

    try {
      context = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: DSR,
        isMobile: true,
        hasTouch: true,
        locale: "en-US",
        timezoneId: "Africa/Casablanca",
        recordVideo: { dir: OUT_DIR, size: REC_SIZE },
        acceptDownloads: true,
      });
      await context.addInitScript(seedFn, OVERRIDE);
      const page = await context.newPage();
      page.setDefaultTimeout(12000);

      if (stop.kind === "card") {
        const html = stop.card === "open" ? introCard() : outroCard();
        await page.setContent(html, { waitUntil: "load" });
        await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve())).catch(() => {});
        // Same idea as an app stop: the card is only ready once its own web
        // fonts have landed, so the edit trims to exactly that point.
        tWarm = Date.now();
        // The card is the title beat: hold it long enough to read comfortably.
        await page.waitForTimeout(PACE.holdBefore + PACE.holdAfter + 2600);
      } else {
        if (stop.lang) {
          await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 45000 });
          await page.evaluate(setLang, stop.lang);
        }
        // The recording is already rolling: page load and the first paint are
        // captured. We mark where the screen actually settles so the edit can
        // trim that head exactly instead of guessing.
        tRecordStart = Date.now();
        await page.goto(`${BASE_URL}${stop.route}`, { waitUntil: "domcontentloaded", timeout: 45000 });
        await page.waitForTimeout(PACE.leadIn);
        await warmUp(page);
        if (stop.click) {
          const clicked = await tryClick(page, stop.click);
          if (!clicked) console.log(`  note: ${index} could not find its click target — held the parent screen instead`);
        }
        tWarm = Date.now();
        await page.waitForTimeout(PACE.holdBefore);
        await slowScroll(page, stop.scroll || 0, PACE.scrollMs);
        await page.waitForTimeout(PACE.holdAfter);
      }

      const video = page.video();
      await context.close(); // flushes the webm
      context = null;

      const src = await video.path();
      const dst = path.join(OUT_DIR, `seg-${index}.webm`);
      fs.copyFileSync(src, dst);
      fs.rmSync(src, { force: true });

      const seconds = probeSeconds(dst);
      const bytes = fs.statSync(dst).size;
      // Warm-up is measured, not assumed: the edit trims exactly this much.
      const headTrim = Math.max(0, (tWarm - tRecordStart) / 1000);
      manifest.push({
        index: Number(index),
        tag: index,
        kind: stop.kind,
        label: stop.label,
        route: stop.route || null,
        lang: stop.lang || "en",
        file: `edit/tour/seg-${index}.webm`,
        seconds: Number(seconds.toFixed(3)),
        headTrim: Number(headTrim.toFixed(3)),
        bytes,
      });
      console.log(
        `ok   ${index}  ${seconds.toFixed(1)}s  ${String(stop.label).slice(0, 44)}`,
      );
    } catch (err) {
      if (context) await context.close().catch(() => {});
      console.log(`FAIL ${index}  ${stop.label} — ${err.message}`);
      manifest.push({
        index: Number(index),
        tag: index,
        kind: stop.kind,
        label: stop.label,
        route: stop.route || null,
        lang: stop.lang || "en",
        file: null,
        seconds: null,
        error: String(err.message),
      });
    }
  }

  await browser.close();
  if (devServer) devServer.kill();

  const total = manifest.reduce((a, m) => a + (m.seconds || 0), 0);
  const missing = manifest.filter((m) => !m.file);

  // Merge with takes this run did not touch, newest first, so a partial re-shoot
  // produces a complete manifest rather than a three-entry one.
  const fresh = new Map(manifest.map((m) => [m.tag, m]));
  const carried = (prior.segments || [])
    .filter((s) => !fresh.has(s.tag))
    .map((s) => ({
      ...s,
      carriedFrom: prior.recordedAt || "earlier run",
      // A carried take is only valid if its file is still on disk.
      file: s.file && fs.existsSync(path.resolve(s.file)) ? s.file : null,
    }));
  const merged = [...manifest, ...carried].sort((a, b) => Number(a.tag) - Number(b.tag));
  const mergedTotal = merged.reduce((a, m) => a + (m.seconds || 0), 0);
  const mergedMissing = merged.filter((m) => !m.file);

  fs.writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(
      {
        app: BASE_URL,
        viewport: VIEWPORT,
        deviceScaleFactor: DSR,
        capture: REC_SIZE,
        pace: PACE,
        recordedAt: new Date().toISOString(),
        lastRun: { tags: manifest.map((m) => m.tag), carried: carried.length },
        stops: merged.length,
        totalSeconds: Number(mergedTotal.toFixed(3)),
        segments: merged,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log("");
  console.log(`Recorded ${manifest.length - missing.length}/${manifest.length} stops this run.`);
  console.log(`Carried forward ${carried.length} take(s) from an earlier run.`);
  console.log(`Tour is ${merged.length - mergedMissing.length}/${merged.length} complete.`);
  console.log(`Runtime: ${mergedTotal.toFixed(1)}s (${(mergedTotal / 60).toFixed(2)} min)`);
  if (mergedMissing.length) {
    console.log("Missing:");
    mergedMissing.forEach((m) => console.log(`  ${m.tag} — ${m.label} — ${m.error || "file gone"}`));
  }
  console.log(`Manifest: ${path.relative(process.cwd(), path.join(OUT_DIR, "manifest.json"))}`);
}

main().catch((err) => {
  console.error("Tour recording failed:", err);
  process.exit(1);
});
