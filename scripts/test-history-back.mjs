import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.click('a[href="/tasks"]');
  await page.waitForTimeout(500);
  console.log('Current URL on tasks:', page.url());

  // Test window.history.back()
  await page.evaluate(() => window.history.back());
  await page.waitForTimeout(600);
  console.log('After window.history.back():', page.url());

  // Test forward and click
  await page.click('a[href="/tasks"]');
  await page.waitForTimeout(500);
  console.log('Current URL on tasks again:', page.url());

  await browser.close();
}

diagnose().catch(console.error);
