import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }, // Pixel / mobile view
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  const artifactDir = "C:\\Users\\TLZCodes\\.gemini\\antigravity\\brain\\383d13b5-b1c5-499b-8abc-6a86bd737c5c";

  console.log("Navigating to Routines screen...");
  await page.goto("http://127.0.0.1:8081/routines", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // 1. Click on Ideal Week Tab
  console.log("Clicking on Ideal Week tab...");
  const idealWeekTab = page.locator("button:has-text('Ideal Week'), button:has-text('أسبوعي المثالي')").first();
  await idealWeekTab.click();
  await page.waitForTimeout(1500);

  console.log("Capturing 96_IdealWeek_Overview_English.png...");
  await page.screenshot({
    path: `${artifactDir}\\96_IdealWeek_Overview_English.png`,
    fullPage: false,
  });

  // 2. Open Day Type Modal
  console.log("Opening Day Type Selector Modal...");
  const dayTypePill = page.locator("button:has-text('Work Day'), button:has-text('يوم عمل')").first();
  if (await dayTypePill.isVisible()) {
    await dayTypePill.click();
    await page.waitForTimeout(1000);
    console.log("Capturing 97_IdealWeek_DayTypeSelector_English.png...");
    await page.screenshot({
      path: `${artifactDir}\\97_IdealWeek_DayTypeSelector_English.png`,
    });
    // Close modal
    const closeBtn = page.locator("button:has(svg.lucide-x)").first();
    await closeBtn.click();
    await page.waitForTimeout(600);
  }

  // 3. Switch to Between the Prayers mode
  console.log("Switching to Between the Prayers mode...");
  const betweenPrayersBtn = page.locator("button:has-text('Between Prayers'), button:has-text('بين الصلوات')").first();
  await betweenPrayersBtn.click();
  await page.waitForTimeout(1200);

  console.log("Capturing 98_IdealWeek_BetweenPrayersMode_English.png...");
  await page.screenshot({
    path: `${artifactDir}\\98_IdealWeek_BetweenPrayersMode_English.png`,
  });

  // 4. Open Item Editor Modal
  console.log("Opening Item Editor Modal...");
  const addItemBtn = page.locator("button:has-text('Add'), button:has-text('إضافة')").first();
  if (await addItemBtn.isVisible()) {
    await addItemBtn.click();
    await page.waitForTimeout(1000);
    console.log("Capturing 99_IdealWeek_ItemEditor_English.png...");
    await page.screenshot({
      path: `${artifactDir}\\99_IdealWeek_ItemEditor_English.png`,
    });
    const closeBtn2 = page.locator("button:has(svg.lucide-x)").first();
    await closeBtn2.click();
    await page.waitForTimeout(600);
  }

  // 5. Switch to Dated Week Plan and Open Apply Preview
  console.log("Switching to Dated Week Plan...");
  const datedPlanBtn = page.locator("button:has-text('Dated Week Plan'), button:has-text('خطة الأسبوع المحدد')").first();
  await datedPlanBtn.click();
  await page.waitForTimeout(1000);

  const applyBtn = page.locator("button:has-text('Preview & Apply'), button:has-text('معاينة واعتماد')").first();
  if (await applyBtn.isVisible()) {
    await applyBtn.click();
    await page.waitForTimeout(1000);
    console.log("Capturing 100_IdealWeek_ApplyPreviewModal_English.png...");
    await page.screenshot({
      path: `${artifactDir}\\100_IdealWeek_ApplyPreviewModal_English.png`,
    });
    const cancelBtn = page.locator("button:has-text('Cancel'), button:has-text('إلغاء')").first();
    await cancelBtn.click();
    await page.waitForTimeout(600);
  }

  // 6. Switch to Arabic RTL and capture Overview
  console.log("Switching language to Arabic...");
  await page.evaluate(() => {
    try {
      const raw = localStorage.getItem("ayxa-app-state-v2");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.prefs = parsed.prefs || {};
        parsed.prefs.language = "ar";
        localStorage.setItem("ayxa-app-state-v2", JSON.stringify(parsed));
      }
    } catch (e) {
      console.error(e);
    }
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Re-open Ideal week in Arabic
  const idealWeekTabAr = page.locator("button:has-text('أسبوعي المثالي')").first();
  if (await idealWeekTabAr.isVisible()) {
    await idealWeekTabAr.click();
    await page.waitForTimeout(1200);
  }

  console.log("Capturing 101_IdealWeek_Overview_Arabic_RTL.png...");
  await page.screenshot({
    path: `${artifactDir}\\101_IdealWeek_Overview_Arabic_RTL.png`,
  });

  // Switch to Between the Prayers in Arabic
  const betweenPrayersBtnAr = page.locator("button:has-text('بين الصلوات')").first();
  if (await betweenPrayersBtnAr.isVisible()) {
    await betweenPrayersBtnAr.click();
    await page.waitForTimeout(1000);
    console.log("Capturing 102_IdealWeek_BetweenPrayers_Arabic_RTL.png...");
    await page.screenshot({
      path: `${artifactDir}\\102_IdealWeek_BetweenPrayers_Arabic_RTL.png`,
    });
  }

  // Restore language to English
  await page.evaluate(() => {
    try {
      const raw = localStorage.getItem("ayxa-app-state-v2");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.prefs = parsed.prefs || {};
        parsed.prefs.language = "en";
        localStorage.setItem("ayxa-app-state-v2", JSON.stringify(parsed));
      }
    } catch (e) {}
  });

  await browser.close();
  console.log("Playwright visual capture completed successfully!");
}

main().catch(console.error);
