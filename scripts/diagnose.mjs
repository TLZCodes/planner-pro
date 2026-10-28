import { chromium } from 'playwright';

async function testAllPages() {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error on ${page.url()}: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    errors.push(`Page Error on ${page.url()}: ${err.message}`);
  });

  const routes = ['/', '/tasks', '/journal', '/bujo', '/goals', '/finance', '/challenges', '/islamic', '/ai', '/more', '/habits', '/selfcare'];

  for (const route of routes) {
    console.log(`Checking http://localhost:3000${route}...`);
    try {
      const response = await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle', timeout: 10000 });
      console.log(` -> Status: ${response?.status()}`);
      await page.waitForTimeout(500);
    } catch (e) {
      console.error(` -> Failed to load ${route}:`, e.message);
      errors.push(`Load Failure: ${route} - ${e.message}`);
    }
  }

  await browser.close();

  console.log('\n--- DIAGNOSTIC RESULTS ---');
  if (errors.length === 0) {
    console.log('✅ ZERO runtime errors across all 12 routes! App responds instantly!');
  } else {
    console.log(`Found ${errors.length} errors:`);
    errors.forEach(e => console.log('❌', e));
  }
}

testAllPages().catch(console.error);
