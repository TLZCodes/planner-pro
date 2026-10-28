import { chromium } from 'playwright';
import path from 'path';

async function testStaticCapacitorBuild() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.stack || err.message));
  page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure()?.errorText));

  const indexPath = path.resolve('.output/public/index.html');
  console.log('Opening file:', indexPath);
  await page.goto(`file://${indexPath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('Page title:', await page.title());
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body text length:', bodyText.length);
  console.log('Body text snippet:', bodyText.slice(0, 200));

  await browser.close();
}

testStaticCapacitorBuild().catch(console.error);
