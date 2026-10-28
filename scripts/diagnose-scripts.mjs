import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  await page.goto('http://localhost:3000/tasks', { waitUntil: 'networkidle' });
  
  // Wait for router hydration
  await page.waitForFunction(() => window.__TSR_ROUTER__ && window.__TSR_ROUTER__.state.status === 'idle');
  await page.waitForTimeout(500);
  console.log('1. Router status is idle & hydrated!');

  // Click add task button
  const addBtn = await page.waitForSelector('[data-testid="add-task-btn"]');
  console.log('2. Clicking add task button...');
  await addBtn.click();
  await page.waitForTimeout(600);

  const editorBack = await page.$('header button[data-back-close="true"]');
  console.log('3. Add Task Modal opened:', editorBack !== null);

  if (editorBack) {
    console.log('4. Clicking back button...');
    await editorBack.click();
    await page.waitForTimeout(600);
    const editorBackAfter = await page.$('header button[data-back-close="true"]');
    console.log('5. Add Task Modal closed:', editorBackAfter === null);
  }

  // Click task card
  const taskCards = await page.$$('[data-testid="task-item-card"]');
  if (taskCards.length > 0) {
    console.log('6. Clicking task card...');
    await taskCards[0].click();
    await page.waitForTimeout(600);
    const detailBack = await page.$('header button[data-back-close="true"]');
    console.log('7. Task Details Editor opened:', detailBack !== null);
    if (detailBack) {
      await detailBack.click();
      await page.waitForTimeout(600);
      const detailBackAfter = await page.$('header button[data-back-close="true"]');
      console.log('8. Task Details Editor closed:', detailBackAfter === null);
    }
  }

  await browser.close();
}

diagnose().catch(console.error);
