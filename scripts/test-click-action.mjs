import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/tasks', { waitUntil: 'networkidle' });

  console.log('1. Tasks page loaded.');
  
  // Inspect the back element
  const result = await page.evaluate(() => {
    const el = document.querySelector('header [aria-label="Back"]');
    return {
      hasEl: el !== null,
      tagName: el?.tagName,
      outerHTML: el?.outerHTML
    };
  });
  console.log('Back element inspection:', result);

  // Click back element
  await page.click('header [aria-label="Back"]');
  await page.waitForTimeout(600);
  console.log('2. URL after back click:', page.url());

  await browser.close();
}

diagnose().catch(console.error);
