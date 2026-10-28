import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TARGET_DIR = 'c:/Users/TLZCodes/Desktop/AYXA_App_All_Screenshots';
const ARTIFACT_DIR = 'C:/Users/TLZCodes/.gemini/antigravity/brain/383d13b5-b1c5-499b-8abc-6a86bd737c5c';
const BASE_URL = 'http://localhost:8080';

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

async function main() {
  console.log('🌸 Starting Polished Screens Capture...');

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  async function snap(filename, options = {}) {
    const targetPath = path.join(TARGET_DIR, filename);
    await page.screenshot({ path: targetPath, fullPage: options.fullPage ?? false });
    try {
      const artPath = path.join(ARTIFACT_DIR, filename);
      fs.copyFileSync(targetPath, artPath);
    } catch (e) {}
    console.log(`✓ Captured & Saved: ${filename}`);
  }

  async function capture(route, filename, options = {}) {
    try {
      console.log(`Navigating to ${route} -> ${filename}...`);
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(options.wait ?? 1000);
      if (options.action) {
        await options.action(page);
        await page.waitForTimeout(600);
      }
      await snap(filename, options);
    } catch (err) {
      console.error(`✗ Error on ${filename}:`, err.message);
    }
  }

  // 1. Initialise App & Session
  console.log('--- Initializing User Session ---');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => {
    try {
      const raw = localStorage.getItem('ayxa-app-state-v2');
      let state = raw ? JSON.parse(raw) : {};
      state.user = {
        id: 'user_active_ayxa',
        name: 'Sara',
        email: 'sara@ayxaplanner.app',
        isGuest: false,
        setupDone: true,
        authType: 'authenticated',
      };
      state.session = true;
      state.prefs = state.prefs || {};
      state.prefs.setupDone = true;
      localStorage.setItem('ayxa-app-state-v2', JSON.stringify(state));
      localStorage.setItem('ayxa_lang', 'en');
    } catch (e) {}
  });
  await page.waitForTimeout(1000);

  // 2. Tasks Page (English)
  await capture('/tasks', '62_Polished_Tasks_English.png');

  // 3. Tasks Page (Arabic)
  await page.evaluate(() => localStorage.setItem('ayxa_lang', 'ar'));
  await capture('/tasks', '63_Polished_Tasks_Arabic.png');

  // 4. Year in Pixels (Arabic)
  await capture('/year-in-pixels', '64_Polished_YearInPixels_Arabic.png');

  // 5. Year in Pixels (English)
  await page.evaluate(() => localStorage.setItem('ayxa_lang', 'en'));
  await capture('/year-in-pixels', '65_Polished_YearInPixels_English.png');

  // 6. Travel Clean Empty State (English)
  await capture('/travel', '66_Polished_Travel_CleanEmptyState_EN.png');

  // 7. Settings Hub Landing (English)
  await capture('/settings', '67_Polished_Settings_Hub_English.png');

  // 8. Settings Region Section with Back Button
  await capture('/settings', '68_Polished_Settings_Section_WithBack.png', {
    action: async (p) => {
      const btn = await p.$('button:has-text("Configure")');
      if (btn) await btn.click();
    },
  });

  // 9. Settings Hub Landing (Arabic)
  await page.evaluate(() => localStorage.setItem('ayxa_lang', 'ar'));
  await capture('/settings', '69_Polished_Settings_Hub_Arabic.png');

  // 10. Focus Space with bottom clearance
  await capture('/focus', '70_Polished_Focus_BottomClearance.png', {
    action: async (p) => {
      await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    },
  });

  // 11. Habits Weekly Board
  await capture('/habits', '71_Polished_Habits_WeeklyBoard.png', {
    action: async (p) => {
      const weekBtn = await p.$('button:has-text("أسبوعي"), button:has-text("Week")');
      if (weekBtn) await weekBtn.click();
    },
  });

  // 12. Deen Next Prayer (Arabic)
  await capture('/deen', '72_Polished_Deen_NextPrayer_Arabic.png');

  // 13. Home Dashboard (English)
  await page.evaluate(() => localStorage.setItem('ayxa_lang', 'en'));
  await capture('/', '73_Polished_Home_Dashboard_EN.png');

  await browser.close();
  console.log('🎉 All verification screenshots completed and archived!');
}

main().catch(console.error);
