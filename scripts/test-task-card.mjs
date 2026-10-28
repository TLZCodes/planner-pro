import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/tasks', { waitUntil: 'networkidle' });

  console.log('1. Tasks page loaded.');
  
  // Click specifically on the task title text
  await page.click('[data-testid="task-item-card"] p.truncate');
  await page.waitForTimeout(500);

  const editorBack = await page.$('header button[data-back-close="true"]');
  console.log('Editor back button found:', editorBack !== null);
  
  if (editorBack) {
    await editorBack.click();
    await page.waitForTimeout(500);
    const editorBackAfter = await page.$('header button[data-back-close="true"]');
    console.log('Editor closed cleanly:', editorBackAfter === null);
  }

  await browser.close();
}

diagnose().catch(console.error);
