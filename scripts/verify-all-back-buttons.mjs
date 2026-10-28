import { chromium } from 'playwright';

async function run() {
  console.log('=== Starting AYXA Planner Pro Back Navigation & Modal Dismiss Test Suite ===');
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();

  let failedTests = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      failedTests++;
    } else {
      console.log(`✅ PASSED: ${message}`);
    }
  }

  // 1. Home -> Tasks -> Back to Home
  console.log('\n[Test 1] Testing Tasks PageHeader Back Button to Home...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  
  await page.click('a[href="/tasks"]');
  await page.waitForTimeout(800);
  assert(page.url().includes('/tasks'), 'Navigated from Home to /tasks');

  await page.click('header [aria-label="Back"]');
  await page.waitForTimeout(800);
  assert(page.url() === 'http://localhost:3000/' || page.url().endsWith(':3000/'), `Tasks PageHeader Back navigated back to Home (Current: ${page.url()})`);

  // 2. Tasks Page -> Open Task Full-Page Editor -> Back Button closes editor
  console.log('\n[Test 2] Testing Tasks Detail Editor Back Button...');
  await page.goto('http://localhost:3000/tasks', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.click('[data-testid="task-item-card"]');
  await page.waitForTimeout(800);

  const editorBackBtn = await page.$('header button[data-back-close="true"]');
  assert(editorBackBtn !== null, 'Full-Page Task Editor opened');

  if (editorBackBtn) {
    await editorBackBtn.click();
    await page.waitForTimeout(800);
    const isClosed = (await page.$('header button[data-back-close="true"]')) === null;
    assert(isClosed, 'Full-Page Task Editor closed cleanly via Back Button');
  }

  // 3. Tasks Page -> Add Task Full-Page Modal -> Escape Key Dismiss
  console.log('\n[Test 3] Testing Add Task Modal Escape Key Dismiss...');
  await page.click('[data-testid="add-task-btn"]');
  await page.waitForTimeout(800);
  assert((await page.$('header button[data-back-close="true"]')) !== null, 'Add Task Modal opened');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  assert((await page.$('header button[data-back-close="true"]')) === null, 'Escape key closed Add Task Modal');

  // 4. Tasks Page -> Add Task Modal -> Global Overlay Back Dismiss
  console.log('\n[Test 4] Testing Add Task Modal Global Back Handler Dismiss...');
  await page.click('[data-testid="add-task-btn"]');
  await page.waitForTimeout(800);
  const handled = await page.evaluate(() => {
    if (typeof window.__onBackOverlayDismiss === 'function') {
      return window.__onBackOverlayDismiss();
    }
    return false;
  });
  await page.waitForTimeout(800);
  assert(handled === true, 'Global __onBackOverlayDismiss handled event');
  assert((await page.$('header button[data-back-close="true"]')) === null, 'Global back handler closed Add Task Modal');

  // 5. Goals Page -> Create Goal Full-Page Modal -> Back Button & PageHeader Back
  console.log('\n[Test 5] Testing Goals Page Modal & PageHeader Back...');
  await page.goto('http://localhost:3000/goals', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.click('[data-testid="add-goal-btn"]');
  await page.waitForTimeout(800);
  const goalModalBack = await page.$('header button[data-back-close="true"]');
  assert(goalModalBack !== null, 'Create Goal Modal opened');

  if (goalModalBack) {
    await goalModalBack.click();
    await page.waitForTimeout(800);
    assert((await page.$('header button[data-back-close="true"]')) === null, 'Create Goal Modal closed via Back Button');
  }

  await page.click('header [aria-label="Back"]');
  await page.waitForTimeout(800);
  assert(page.url() === 'http://localhost:3000/' || page.url().endsWith(':3000/'), `Goals PageHeader Back navigated to Home (Current: ${page.url()})`);

  // 6. Finance Page -> Add Transaction Modal -> Back Button & PageHeader Back
  console.log('\n[Test 6] Testing Finance Page Modal & PageHeader Back...');
  await page.goto('http://localhost:3000/finance', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.click('[data-testid="add-finance-btn"]');
  await page.waitForTimeout(800);
  const financeModalBack = await page.$('header button[data-back-close="true"]');
  assert(financeModalBack !== null, 'Add Transaction Modal opened');

  if (financeModalBack) {
    await financeModalBack.click();
    await page.waitForTimeout(800);
    assert((await page.$('header button[data-back-close="true"]')) === null, 'Add Transaction Modal closed via Back Button');
  }

  await page.click('header [aria-label="Back"]');
  await page.waitForTimeout(800);
  assert(page.url() === 'http://localhost:3000/' || page.url().endsWith(':3000/'), `Finance PageHeader Back navigated to Home (Current: ${page.url()})`);

  // 7. Challenges Page -> Protocol View -> Back Button & Main Back
  console.log('\n[Test 7] Testing Challenges Page Protocol Back & Main Back...');
  await page.goto('http://localhost:3000/challenges', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const protocolBtn = await page.$('button:has-text("عرض الخطة"), button:has-text("Full Protocol")');
  if (protocolBtn) {
    await protocolBtn.click();
    await page.waitForTimeout(800);
    const challengeBack = await page.$('header button[data-back-close="true"]');
    assert(challengeBack !== null, 'Challenge Protocol View opened');

    if (challengeBack) {
      await challengeBack.click();
      await page.waitForTimeout(800);
      assert((await page.$('header button[data-back-close="true"]')) === null, 'Challenge Protocol View closed via Back Button');
    }
  }

  await page.click('header [aria-label="Back"]');
  await page.waitForTimeout(800);
  assert(page.url() === 'http://localhost:3000/' || page.url().endsWith(':3000/'), `Challenges Back navigated to Home (Current: ${page.url()})`);

  // 8. AI Assistant Back
  console.log('\n[Test 8] Testing AI Assistant Back Button...');
  await page.goto('http://localhost:3000/ai', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.click('header [aria-label="Back"]');
  await page.waitForTimeout(800);
  assert(page.url() === 'http://localhost:3000/' || page.url().endsWith(':3000/'), `AI Assistant Back navigated to Home (Current: ${page.url()})`);

  // 9. Islamic Worship Hub Back
  console.log('\n[Test 9] Testing Islamic Worship Hub Back Button...');
  await page.goto('http://localhost:3000/islamic', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.click('header [aria-label="Back"]');
  await page.waitForTimeout(800);
  assert(page.url() === 'http://localhost:3000/' || page.url().endsWith(':3000/'), `Islamic Hub Back navigated to Home (Current: ${page.url()})`);

  // 10. Routines Page Back
  console.log('\n[Test 10] Testing Routines Page Back Button...');
  await page.goto('http://localhost:3000/routines', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.click('header [aria-label="Back"]');
  await page.waitForTimeout(800);
  assert(page.url() === 'http://localhost:3000/' || page.url().endsWith(':3000/'), `Routines Back navigated to Home (Current: ${page.url()})`);

  // 11. Habits Page Back
  console.log('\n[Test 11] Testing Habits Page Back Button...');
  await page.goto('http://localhost:3000/habits', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.click('header [aria-label="Back"]');
  await page.waitForTimeout(800);
  assert(page.url() === 'http://localhost:3000/' || page.url().endsWith(':3000/'), `Habits Back navigated to Home (Current: ${page.url()})`);

  // 12. Settings Page Back
  console.log('\n[Test 12] Testing Settings Page Back Button...');
  await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.click('[aria-label="Back"]');
  await page.waitForTimeout(800);
  assert(page.url().includes('/more') || page.url().endsWith(':3000/'), `Settings Back navigated to /more or Home (Current: ${page.url()})`);

  // 13. Achievements Page Back
  console.log('\n[Test 13] Testing Achievements Page Back Button...');
  await page.goto('http://localhost:3000/achievements', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.click('header [aria-label="Back"]');
  await page.waitForTimeout(800);
  assert(page.url() === 'http://localhost:3000/' || page.url().endsWith(':3000/'), `Achievements Back navigated to Home (Current: ${page.url()})`);

  // 14. Focus Page Back
  console.log('\n[Test 14] Testing Focus Timer Back Button...');
  await page.goto('http://localhost:3000/focus', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.click('[aria-label="Back"]');
  await page.waitForTimeout(800);
  assert(page.url() === 'http://localhost:3000/' || page.url().endsWith(':3000/'), `Focus Timer Back navigated to Home (Current: ${page.url()})`);

  await browser.close();

  if (failedTests > 0) {
    console.error(`\n❌ Finished with ${failedTests} test failure(s).`);
    process.exit(1);
  } else {
    console.log('\n🎉 ALL 14 BACK NAVIGATION & MODAL DISMISS TESTS PASSED 100% CLEANLY!');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
