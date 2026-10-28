import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();

  // 1. Home top
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/TLZCodes/.gemini/antigravity/brain/383d13b5-b1c5-499b-8abc-6a86bd737c5c/320_home_becoming_her_top.png' });

  // 2. Home middle (Habits & My Deen)
  await page.evaluate(() => window.scrollTo(0, 680));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/TLZCodes/.gemini/antigravity/brain/383d13b5-b1c5-499b-8abc-6a86bd737c5c/321_home_my_routines_section.png' });

  // 3. Home bottom (My Routines & Quick Actions & Footer Tagline)
  await page.evaluate(() => window.scrollTo(0, 1100));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/TLZCodes/.gemini/antigravity/brain/383d13b5-b1c5-499b-8abc-6a86bd737c5c/325_home_bottom_tagline.png' });

  // 4. Routines - Ideal Day
  await page.goto('http://localhost:3000/routines?key=ideal-day', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/TLZCodes/.gemini/antigravity/brain/383d13b5-b1c5-499b-8abc-6a86bd737c5c/322_routines_ideal_day.png' });

  // 5. Routines - Morning Routine
  await page.goto('http://localhost:3000/routines?key=morning', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/TLZCodes/.gemini/antigravity/brain/383d13b5-b1c5-499b-8abc-6a86bd737c5c/323_routines_morning.png' });

  // 6. Routines - Evening Routine
  await page.goto('http://localhost:3000/routines?key=evening', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/TLZCodes/.gemini/antigravity/brain/383d13b5-b1c5-499b-8abc-6a86bd737c5c/324_routines_evening.png' });

  await browser.close();
  console.log('✓ All Becoming Her screenshots captured successfully!');
}

capture().catch(console.error);
