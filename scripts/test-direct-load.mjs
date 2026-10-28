import { chromium } from 'playwright';

async function diagnose() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/tasks', { waitUntil: 'networkidle' });

  // Evaluate router and window in page context
  const testRes = await page.evaluate(() => {
    // Check if __TSR_index exists
    return {
      historyState: window.history.state,
      historyLength: window.history.length,
      pathname: window.location.pathname,
    };
  });
  console.log('Direct load of /tasks:', testRes);

  await browser.close();
}

diagnose().catch(console.error);
