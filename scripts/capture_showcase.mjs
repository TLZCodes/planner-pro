import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/TLZCodes/.gemini/antigravity/brain/383d13b5-b1c5-499b-8abc-6a86bd737c5c';
const DESKTOP_DIR = 'c:/Users/TLZCodes/Desktop/AYXA_App_Showcase';

if (!fs.existsSync(DESKTOP_DIR)) {
  fs.mkdirSync(DESKTOP_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:8081';

const screens = [
  { name: '01_Home_Dashboard', path: '/' },
  { name: '02_Tasks_Daily_Planner', path: '/tasks' },
  { name: '03_AYXA_AI_Assistant', path: '/ai' },
  { name: '04_My_Journal_Reflections', path: '/journal' },
  { name: '05_All_Planners_More_Hub', path: '/more' },
  { name: '06_Achievements_Badges_Gallery', path: '/achievements' },
  { name: '07_Gamification_Progress_XP', path: '/gamification' },
  { name: '08_Year_In_Pixels_Mood_Grid', path: '/pixels' },
  { name: '09_SelfCare_Hydration_Rituals', path: '/selfcare' },
  { name: '10_Wellness_Health_Logs', path: '/wellness' },
  { name: '11_Focus_Timer_Pomodoro', path: '/focus' },
  { name: '12_Learning_Study_Hub', path: '/learning' },
  { name: '13_Finance_Budget_Transactions', path: '/finance' },
  { name: '14_Travel_Planner_Savings', path: '/travel' },
  { name: '15_Islamic_Worship_Surahs', path: '/islamic' },
  { name: '16_Settings_Preferences', path: '/settings' },
  { name: '17_Login_Registration_Screen', path: '/login' },
  { name: '18_Signup_Account_Screen', path: '/signup' },
  { name: '19_Life_Challenges_7_90_Days', path: '/challenges' },
  { name: '20_Habits_Tracker_Matrix', path: '/habits' },
  { name: '21_Goals_Milestones_Hub', path: '/goals' },
  { name: '22_Routines_Master_Timeline', path: '/routines' },
  { name: '23_Business_Projects_Ledger', path: '/business' },
  { name: '24_Bullet_Journal_Studio', path: '/bujo' },
];

async function captureAll() {
  console.log('Launching browser with Playwright...');
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  for (const s of screens) {
    const url = `${BASE_URL}${s.path}`;
    const artifactFile = path.join(ARTIFACT_DIR, `${s.name}.png`);
    const desktopFile = path.join(DESKTOP_DIR, `${s.name}.png`);

    console.log(`Capturing ${s.name} (${s.path})...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1000);

      await page.screenshot({ path: artifactFile, fullPage: false });
      fs.copyFileSync(artifactFile, desktopFile);
      console.log(`✓ Saved ${s.name}.png`);
    } catch (err) {
      console.error(`Error on ${s.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('🎉 All 24 core showcase screenshots successfully captured and saved!');
}

captureAll();
