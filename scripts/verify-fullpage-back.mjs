import { chromium } from 'playwright';
import path from 'path';

const artifactsDir = "C:\\Users\\TLZCodes\\.gemini\\antigravity\\brain\\383d13b5-b1c5-499b-8abc-6a86bd737c5c";

async function run() {
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

  // 1. Tasks List View
  console.log('Navigating to /tasks...');
  await page.goto('http://localhost:3000/tasks', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactsDir, '310_tasks_list_view.png') });
  console.log('Captured 310_tasks_list_view.png');

  // 2. Click on task item using data-testid to open FULL-PAGE Task Editor
  console.log('Clicking task card to open Full-Page Editor...');
  await page.click('[data-testid="task-item-card"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactsDir, '311_tasks_full_page_editor.png') });
  console.log('Captured 311_tasks_full_page_editor.png');

  // Scroll down in full page task editor
  await page.evaluate(() => window.scrollBy(0, 450));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artifactsDir, '312_tasks_full_page_editor_subtasks.png') });
  console.log('Captured 312_tasks_full_page_editor_subtasks.png');

  // Click back arrow to return to tasks list
  await page.click('header button[data-back-close="true"]');
  await page.waitForTimeout(800);

  // 3. Goals List View & Full-Page Create Goal
  console.log('Navigating to /goals...');
  await page.goto('http://localhost:3000/goals', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactsDir, '313_goals_list_view.png') });
  console.log('Captured 313_goals_list_view.png');

  const addGoalBtn = await page.$('header button');
  if (addGoalBtn) {
    await addGoalBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(artifactsDir, '314_goals_full_page_create.png') });
    console.log('Captured 314_goals_full_page_create.png');
  }

  // 4. Finance List View & Full-Page Add Transaction
  console.log('Navigating to /finance...');
  await page.goto('http://localhost:3000/finance', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactsDir, '315_finance_list_view.png') });
  console.log('Captured 315_finance_list_view.png');

  const addFinanceBtn = await page.$('header button');
  if (addFinanceBtn) {
    await addFinanceBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(artifactsDir, '316_finance_full_page_add.png') });
    console.log('Captured 316_finance_full_page_add.png');
  }

  // 5. Bullet Journal Studio Pro (/journal)
  console.log('Navigating to /journal...');
  await page.goto('http://localhost:3000/journal', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(artifactsDir, '317_bujo_studio_active.png') });
  console.log('Captured 317_bujo_studio_active.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch(console.error);
