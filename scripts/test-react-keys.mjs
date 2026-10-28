import { chromium } from 'playwright';

async function testTaskFlow() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  await page.goto('http://localhost:3000/tasks', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Check if React attached event listeners
  const info = await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="add-task-btn"]');
    return {
      btnExists: btn !== null,
      reactKeys: Object.keys(btn || {}).filter(k => k.startsWith('__react')),
    };
  });
  console.log('Button React info:', info);

  await browser.close();
}

testTaskFlow().catch(console.error);
