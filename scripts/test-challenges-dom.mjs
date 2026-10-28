import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/challenges', { waitUntil: 'networkidle' });

  const info = await page.evaluate(() => {
    const allBack = Array.from(document.querySelectorAll('[aria-label="Back"]')).map(el => ({
      tag: el.tagName,
      href: el.getAttribute('href'),
      outerHTML: el.outerHTML
    }));
    return {
      title: document.title,
      backCount: allBack.length,
      allBack,
    };
  });
  console.log('Challenges DOM info:', info);

  await browser.close();
}

diagnose().catch(console.error);
