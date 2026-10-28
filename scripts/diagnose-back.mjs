import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  const homeState = await page.evaluate(() => ({
    historyLength: window.history.length,
    historyState: window.history.state,
  }));
  console.log('Home state:', homeState);

  await page.click('a[href="/tasks"]');
  await page.waitForTimeout(500);
  const tasksState = await page.evaluate(() => ({
    url: window.location.href,
    historyLength: window.history.length,
    historyState: window.history.state,
  }));
  console.log('Tasks state after click:', tasksState);

  const backBtn = await page.$('header button[aria-label="Back"]');
  console.log('Found backBtn:', backBtn !== null);
  if (backBtn) {
    await backBtn.click();
    await page.waitForTimeout(600);
    const afterBack = await page.evaluate(() => ({
      url: window.location.href,
      historyLength: window.history.length,
      historyState: window.history.state,
    }));
    console.log('After back click:', afterBack);
  }

  // Also check tasks list items
  const taskCards = await page.$$('[data-testid="task-item-card"]');
  console.log('taskCards count on tasks page:', taskCards.length);
  const allCards = await page.$$('.card, [class*="rounded-2xl"], [class*="cursor-pointer"]');
  console.log('clickable cards count:', allCards.length);

  await browser.close();
}

diagnose().catch(console.error);
