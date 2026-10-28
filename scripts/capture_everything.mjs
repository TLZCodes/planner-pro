import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TARGET_DIR = 'c:/Users/TLZCodes/Desktop/AYXA_App_All_Screenshots';
const ARTIFACT_DIR = 'C:/Users/TLZCodes/.gemini/antigravity/brain/383d13b5-b1c5-499b-8abc-6a86bd737c5c';

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:8080';

async function main() {
  console.log('🚀 Starting Comprehensive App Screenshot Capture...');
  console.log(`📁 Target folder: ${TARGET_DIR}`);

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

  // Helper to save screenshot both to desktop target and brain artifact dir
  async function takeSnap(filename, options = {}) {
    const targetPath = path.join(TARGET_DIR, filename);
    await page.screenshot({ path: targetPath, fullPage: options.fullPage ?? false });
    
    try {
      const artPath = path.join(ARTIFACT_DIR, filename);
      fs.copyFileSync(targetPath, artPath);
    } catch (e) {}

    console.log(`✓ Saved: ${filename}`);
  }

  async function captureScreen(route, filename, options = {}) {
    try {
      console.log(`Navigating to ${route} (${filename})...`);
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(options.wait ?? 900);
      if (options.action) {
        await options.action(page);
        await page.waitForTimeout(500);
      }
      await takeSnap(filename, options);
    } catch (err) {
      console.error(`✗ Error capturing ${filename}:`, err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. PUBLIC & AUTHENTICATION SCREENS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Capturing Public & Auth Screens ---');
  await captureScreen('/welcome', '01_Welcome_Screen.png');
  await captureScreen('/auth/sign-in', '02_Auth_Sign_In.png');
  await captureScreen('/auth/sign-up', '03_Auth_Sign_Up.png');
  await captureScreen('/auth/forgot-password', '04_Auth_Forgot_Password.png');
  await captureScreen('/auth/verify-email', '05_Auth_Verify_Email.png');
  await captureScreen('/onboarding', '06_Onboarding_Screen.png');
  await captureScreen('/login', '07_Legacy_Login_Screen.png');
  await captureScreen('/signup', '08_Legacy_Signup_Screen.png');

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. SETUP ACTIVE AUTHENTICATED USER SESSION FOR APP PAGES
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Initializing Active User Session ---');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    try {
      const raw = localStorage.getItem('ayxa-app-state-v2');
      let state = raw ? JSON.parse(raw) : {};
      state.user = {
        id: 'user_active_ayxa',
        name: 'Sarah',
        email: 'sarah@example.com',
        isGuest: false,
        setupDone: true,
        authType: 'authenticated',
      };
      state.session = true;
      localStorage.setItem('ayxa-app-state-v2', JSON.stringify(state));
      localStorage.setItem('ayxa_language', 'en');
    } catch (e) {}
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. CORE APP PAGES & TABS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Capturing Main Application Core Pages ---');

  // 09 Home Dashboard
  await captureScreen('/', '09_Home_Dashboard.png');
  await captureScreen('/', '09b_Home_Dashboard_Full.png', { fullPage: true });

  // 10 Tasks - Today Tab
  await captureScreen('/tasks', '10_Tasks_Daily_Planner.png');

  // 11 Tasks - All Tab
  await captureScreen('/tasks', '11_Tasks_All_View.png', {
    action: async (p) => {
      const allTab = await p.$('button:has-text("All"), button:has-text("الكل")');
      if (allTab) await allTab.click();
    },
  });

  // 12 Tasks - Add Task Drawer
  await captureScreen('/tasks', '12_Tasks_Add_Modal.png', {
    action: async (p) => {
      const addBtn = await p.$('button:has-text("New Task"), button:has-text("مهمة جديدة"), button:has(svg.lucide-plus)');
      if (addBtn) await addBtn.click();
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. HABITS MODULE (TODAY, WEEK BOARD, MODALS, ALL, EXPLORE)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Capturing Habits Module & Weekly Board ---');

  // 13 Habits - Today Tab
  await captureScreen('/habits?tab=today', '13_Habits_Today_Tab.png');

  // 14 Habits - Week Board (Our Redesigned Weekly Habit Board!)
  await captureScreen('/habits?tab=week', '14_Habits_Weekly_Board.png');
  await captureScreen('/habits?tab=week', '14b_Habits_Weekly_Board_Full.png', { fullPage: true });

  // 15 Habits - Customize Board Modal
  await captureScreen('/habits?tab=week', '15_Habits_Customize_Board_Modal.png', {
    action: async (p) => {
      const customizeBtn = await p.$('button:has-text("Customize"), button:has-text("تخصيص اللوحة")');
      if (customizeBtn) await customizeBtn.click();
    },
  });

  // 16 Habits - Weekly Reflection Modal
  await captureScreen('/habits?tab=week', '16_Habits_Weekly_Reflection_Modal.png', {
    action: async (p) => {
      const reflectBtn = await p.$('button:has-text("Gentle Weekly Reflection"), button:has-text("تأمل نهاية الأسبوع")');
      if (reflectBtn) await reflectBtn.click();
    },
  });

  // 17 Habits - All Habits Tab
  await captureScreen('/habits?tab=all', '17_Habits_All_Habits_Tab.png');

  // 18 Habits - Explore Bundles Tab
  await captureScreen('/habits?tab=explore', '18_Habits_Explore_Bundles_Tab.png');

  // 19 Habits - Add Habit Modal
  await captureScreen('/habits?tab=today', '19_Habits_New_Habit_Drawer.png', {
    action: async (p) => {
      const addHabitBtn = await p.$('button:has-text("New Habit"), button:has-text("عادة جديدة"), button:has-text("Add Habit")');
      if (addHabitBtn) await addHabitBtn.click();
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. PLANNING MODULES (ROUTINES, GOALS, JOURNAL, BUJO, AI, MORE)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Capturing Planning & Reflection Modules ---');

  // 20 Routines
  await captureScreen('/routines', '20_Routines_Master_Timeline.png');
  await captureScreen('/routines', '20b_Routines_Full.png', { fullPage: true });

  // 21 Goals
  await captureScreen('/goals', '21_Goals_Milestones_Hub.png');
  await captureScreen('/goals', '21b_Goals_Full.png', { fullPage: true });

  // 22 Journal
  await captureScreen('/journal', '22_Journal_Reflections.png');

  // 23 Bullet Journal (Bujo)
  await captureScreen('/bujo', '23_Bullet_Journal_Studio_Bujo.png');

  // 24 AYXA AI Assistant
  await captureScreen('/ai', '24_AYXA_AI_Assistant.png');

  // 25 All Planners More Hub
  await captureScreen('/more', '25_Explore_More_Hub.png');
  await captureScreen('/more', '25b_Explore_More_Hub_Full.png', { fullPage: true });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. WELLNESS, MOOD, FOCUS & DEEN
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Capturing Wellness, Pixels, Focus & Deen ---');

  // 26 Wellness Hub
  await captureScreen('/wellness', '26_Wellness_Health_Hub.png');
  await captureScreen('/wellness', '26b_Wellness_Full.png', { fullPage: true });

  // 27 Self-Care Rituals
  await captureScreen('/selfcare', '27_SelfCare_Rituals.png');

  // 28 Year In Pixels (Mood Grid)
  await captureScreen('/pixels', '28_Year_In_Pixels_Grid.png');

  // 29 Focus Timer
  await captureScreen('/focus', '29_Focus_Timer_Pomodoro.png');

  // 30 My Deen & Worship
  await captureScreen('/deen', '30_Islamic_My_Deen_Companion.png');
  await captureScreen('/deen', '30b_Islamic_My_Deen_Full.png', { fullPage: true });

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. LEARNING, FINANCE, BUSINESS, TRAVEL, CHALLENGES
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Capturing Life & Career Modules ---');

  // 31 Learning & Study Hub
  await captureScreen('/learning', '31_Learning_Study_Hub.png');
  await captureScreen('/learning', '31b_Learning_Full.png', { fullPage: true });

  // 32 Finance & Budget
  await captureScreen('/finance', '32_Finance_Budget_Transactions.png');
  await captureScreen('/finance', '32b_Finance_Full.png', { fullPage: true });

  // 33 Business Workspace
  await captureScreen('/business', '33_Business_Workspace_Ledger.png');

  // 34 Travel Planner
  await captureScreen('/travel', '34_Travel_Planner_Trips.png');

  // 35 Challenges
  await captureScreen('/challenges', '35_Life_Challenges_7_90_Days.png');

  // 36 Image Editor Studio
  await captureScreen('/image-editor', '36_Image_Editor_Studio.png');

  // 37 Progress & Gamification
  await captureScreen('/progress', '37_Gamification_Progress_XP.png');

  // 38 Badges Gallery
  await captureScreen('/badges', '38_Badges_Gallery.png');

  // 39 Achievements
  await captureScreen('/achievements', '39_Achievements_Trophy_Hall.png');

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. SETTINGS & ALL PREFERENCES / OPTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Capturing Settings & All Options Sections ---');

  // 40 Settings Top (Profile & Account)
  await captureScreen('/settings', '40_Settings_Top_Profile_Account.png');

  // 41 Full Settings Page top to bottom
  await captureScreen('/settings', '41_Settings_All_Options_FullPage.png', { fullPage: true });

  // 42 Appearance & Language
  await captureScreen('/settings', '42_Settings_Appearance_Theme_Language.png', {
    action: async (p) => {
      await p.evaluate(() => window.scrollTo(0, 450));
    },
  });

  // 43 Week Starts On & Preferences
  await captureScreen('/settings', '43_Settings_FirstDayOfWeek_Options.png', {
    action: async (p) => {
      await p.evaluate(() => window.scrollTo(0, 850));
    },
  });

  // 44 Notifications & Reminders
  await captureScreen('/settings', '44_Settings_Notifications_Reminders.png', {
    action: async (p) => {
      await p.evaluate(() => window.scrollTo(0, 1350));
    },
  });

  // 45 Privacy, PIN & Journal Lock
  await captureScreen('/settings', '45_Settings_Privacy_Security_JournalLock.png', {
    action: async (p) => {
      await p.evaluate(() => window.scrollTo(0, 1850));
    },
  });

  // 46 Data Backup & Danger Zone
  await captureScreen('/settings', '46_Settings_Data_Backup_Export_DangerZone.png', {
    action: async (p) => {
      await p.evaluate(() => window.scrollTo(0, 2450));
    },
  });

  // 47 About & Legal
  await captureScreen('/settings', '47_Settings_About_Terms_Version.png', {
    action: async (p) => {
      await p.evaluate(() => window.scrollTo(0, 3050));
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. ARABIC (RTL) EXPERIENCES FOR COMPREHENSIVE COVERAGE
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Capturing Arabic (RTL) Language Experiences ---');

  await page.evaluate(() => {
    try {
      localStorage.setItem('ayxa_language', 'ar');
      const raw = localStorage.getItem('ayxa-app-state-v2');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.prefs) s.prefs.language = 'ar';
        localStorage.setItem('ayxa-app-state-v2', JSON.stringify(s));
      }
    } catch (e) {}
  });

  await captureScreen('/', '48_AR_Home_Dashboard.png');
  await captureScreen('/habits?tab=week', '49_AR_Habits_Weekly_Board.png');
  await captureScreen('/settings', '50_AR_Settings_All_Options.png');
  await captureScreen('/deen', '51_AR_Deen_Companion.png');
  await captureScreen('/tasks', '52_AR_Tasks_Planner.png');

  // Reset language back to English
  await page.evaluate(() => {
    try {
      localStorage.setItem('ayxa_language', 'en');
    } catch (e) {}
  });

  console.log('\n✨ All captures finished successfully!');
  await browser.close();
}

main().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
