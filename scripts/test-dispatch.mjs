import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:3000/tasks', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    const btn = document.querySelector('header button[aria-label="Back"]');
    console.log('Dispatching click on back button...');
    btn?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });

  await page.waitForTimeout(500);
  console.log('URL after dispatched click:', page.url());

  await browser.close();
}

diagnose().catch(console.error);
