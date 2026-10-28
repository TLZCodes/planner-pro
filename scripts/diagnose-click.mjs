import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: false
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGEERROR:', err));

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  console.log('1. At Home URL:', page.url());

  await page.click('a[href="/tasks"]');
  await page.waitForTimeout(500);
  console.log('2. At Tasks URL:', page.url());

  const backBtn = await page.$('header button[aria-label="Back"]');
  console.log('3. Back button element found:', backBtn !== null);
  
  if (backBtn) {
    console.log('4. Clicking back button...');
    await backBtn.click();
    await page.waitForTimeout(1000);
    console.log('5. After click URL:', page.url());
  }

  await browser.close();
}

diagnose().catch(console.error);
