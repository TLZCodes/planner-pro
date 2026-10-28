import { chromium } from 'playwright';

async function testTaskFlow() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/tasks', { waitUntil: 'networkidle' });
  // Wait for client React hydration
  await page.waitForTimeout(1500);

  console.log('1. Page hydrated. Tasks on screen:');
  const cards = await page.$$('[data-testid="task-item-card"]');
  console.log('Count:', cards.length);

  // Click on the first card
  await cards[0].click();
  await page.waitForTimeout(600);

  const backBtn = await page.$('header button[data-back-close="true"]');
  console.log('2. Editor opened:', backBtn !== null);

  if (backBtn) {
    await backBtn.click();
    await page.waitForTimeout(600);
    const backBtnAfter = await page.$('header button[data-back-close="true"]');
    console.log('3. Editor closed successfully:', backBtnAfter === null);
  }

  // Click + button
  const addBtn = await page.$('[data-testid="add-task-btn"]');
  console.log('4. Add button found:', addBtn !== null);
  if (addBtn) {
    await addBtn.click();
    await page.waitForTimeout(600);
    const addModalBack = await page.$('header button[data-back-close="true"]');
    console.log('5. Add task modal opened:', addModalBack !== null);
    if (addModalBack) {
      await addModalBack.click();
      await page.waitForTimeout(600);
      const addModalAfter = await page.$('header button[data-back-close="true"]');
      console.log('6. Add task modal closed successfully:', addModalAfter === null);
    }
  }

  await browser.close();
}

testTaskFlow().catch(console.error);
