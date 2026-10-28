import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import http from 'http';

const chromePath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
const artifactDir = 'C:\\\\Users\\\\TLZCodes\\\\.gemini\\\\antigravity\\\\brain\\\\383d13b5-b1c5-499b-8abc-6a86bd737c5c';
const screenshotsDir = path.resolve('releases/screenshots');
const artifactScreenshotsDir = path.join(artifactDir, 'screenshots');

if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
if (!fs.existsSync(artifactScreenshotsDir)) fs.mkdirSync(artifactScreenshotsDir, { recursive: true });

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function startStaticServer(publicDir, port = 3000) {
  const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    let filePath = path.join(publicDir, reqUrl === '/' ? 'index.html' : reqUrl);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(publicDir, 'index.html');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

const pagesConfig = [
  { id: '01_home', path: '/', name: 'الرئيسية (Home)', label: 'خطة اليوم، لحظة ذكر، الإحصائيات وسلايدر الروتينات' },
  { id: '02_tasks', path: '/tasks', name: 'مهامي (My Tasks)', label: 'أهم 3 مهام، المجدولة، في أي وقت، والمكتملة' },
  { id: '03_task_editor', path: '/tasks?edit=new', name: 'محرر ومخطط المهمة الكامل (Task Editor)', label: 'تحديد العنوان، الوقت، التصنيف، الأولوية والمهام الفرعية', isCustomAction: 'openEditor' },
  { id: '04_ai', path: '/ai', name: 'المخطط الذكي (AI Planner)', label: 'مساعد الذكاء الاصطناعي لتخطيط وتنظيم اليوم' },
  { id: '05_journal', path: '/journal', name: 'يومياتي (Daily Journal)', label: 'المذكرات، تسجيل الامتنان والمشاعر اليومية' },
  { id: '06_routines', path: '/routines', name: 'روتيناتي واليوم المثالي (Routines)', label: 'روتين الصباح والمساء وإعادة ضبط الحياة' },
  { id: '07_islamic', path: '/islamic', name: 'ديني وروحي (My Deen)', label: 'ختمة القرآن، أوقات الصلاة، الأذكار والتسبيح' },
  { id: '08_habits', path: '/habits', name: 'متتبع العادات (Habit Tracker)', label: 'تتبع العادات اليومية وسلاسل الالتزام المستمرة' },
  { id: '09_goals', path: '/goals', name: 'أهدافي وطموحاتي (Goal Planner)', label: 'الأهداف الكبرى والخطوات المرحلية العملية' },
  { id: '10_focus', path: '/focus', name: 'مؤقت التركيز (Focus & Pomodoro)', label: 'جلسات التركيز وتقنية بومودورو مع أصوات مهدئة' },
  { id: '11_wellness', path: '/wellness', name: 'صحتي ومزاجي (Wellness & Mood)', label: 'سجل المشاعر اليومي، شرب الماء، والنوم' },
  { id: '12_selfcare', path: '/selfcare', name: 'العناية بالنفس والجمال (Self-Care)', label: 'روتين الجمال، العناية بالبشرة والراحة' },
  { id: '13_finance', path: '/finance', name: 'ميزانيتي ومصاريفي (Finance & Budget)', label: 'تتبع المصاريف، المدخرات والميزانية الشهرية' },
  { id: '14_travel', path: '/travel', name: 'تخطيط السفر (Travel Planner)', label: 'حقيبة السفر وحجز الرحلات والأنشطة' },
  { id: '15_learning', path: '/learning', name: 'دراستي ودوراتي (Study Hub)', label: 'المواد الدراسية، ملخصات الكتب والدورات' },
  { id: '16_business', path: '/business', name: 'أعمالي ومشاريعي (Business Hub)', label: 'إدارة المشاريع، العملاء والمهام المهنية' },
  { id: '17_bujo', path: '/bujo', name: 'المفكرة النقطية (Bullet Journal)', label: 'لوحة رسم ومفكرة نقطية حرة بملصقات وألوان' },
  { id: '18_vision_board', path: '/image-editor', name: 'لوحة الرؤية ومحرر الصور (Vision Board)', label: 'محرر الصور والملصقات ولوحة الأحلام' },
  { id: '19_challenges', path: '/challenges', name: 'تحديات الـ 30 يوم (30-Day Challenges)', label: 'تحديات بناء الشخصية والعادات الإيجابية' },
  { id: '20_pixels', path: '/pixels', name: 'عامي في بكسلات ملونة (Year in Pixels)', label: 'سجل المزاج السنوي في مربعات ملونة' },
  { id: '21_gamification', path: '/gamification', name: 'المستوى والمكافآت (Gamification & XP)', label: 'نقاط الخبرة XP، الرتب والمكافآت التنافسية' },
  { id: '22_achievements', path: '/achievements', name: 'إنجازاتي وأوسمتي (Achievements)', label: 'أوسمة الإنجاز والمسيرة الشخصية' },
  { id: '23_settings', path: '/settings', name: 'الإعدادات والمظهر (Settings & Themes)', label: 'تخصيص السمات، الألوان، التنبيهات واللغة' },
  { id: '24_welcome', path: '/welcome', name: 'شاشة الترحيب (Welcome Screen)', label: 'بداية رحلة التخطيط والإنتاجية' },
  { id: '25_setup', path: '/setup', name: 'الإعداد الأولي (Onboarding Setup)', label: 'تهيئة الأهداف وتفضيلات المستخدم' },
];

async function run() {
  console.log('1. Starting local static server on port 3000...');
  const server = await startStaticServer(path.resolve('.output/public'), 3000);
  console.log('Server started. Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--allow-running-insecure-content',
    ],
    defaultViewport: {
      width: 430,
      height: 932,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
    protocolTimeout: 300000,
  });

  const page = await browser.newPage();
  const capturedSlides = [];

  console.log(`2. Taking high-resolution screenshots for all ${pagesConfig.length} pages...`);

  for (let i = 0; i < pagesConfig.length; i++) {
    const item = pagesConfig[i];
    const url = 'http://localhost:3000' + (item.isCustomAction ? '/tasks' : item.path);
    console.log(`[${i + 1}/${pagesConfig.length}] Capturing ${item.name}...`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1000));

      if (item.isCustomAction === 'openEditor') {
        // Click add button or trigger editor
        await page.evaluate(() => {
          const btn = document.querySelector('button[aria-label="Add Task"]') || document.querySelector('header button.grad-theme');
          if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 600));
      }

      const filename = `${item.id}.png`;
      const savePath = path.join(screenshotsDir, filename);
      const artifactPath = path.join(artifactScreenshotsDir, filename);

      const buffer = await page.screenshot({ type: 'png', fullPage: false });
      fs.writeFileSync(savePath, buffer);
      fs.writeFileSync(artifactPath, buffer);

      capturedSlides.push({
        id: item.id,
        name: item.name,
        label: item.label,
        filename,
        absPath: artifactPath,
        dataUri: 'data:image/png;base64,' + buffer.toString('base64'),
      });
    } catch (err) {
      console.warn(`Error capturing ${item.id}:`, err.message);
    }
  }

  console.log(`Successfully saved ${capturedSlides.length} screenshots to releases/screenshots/ and artifacts!`);

  // 3. Now render the slow real-time video showcase (2 minutes duration for 25 pages = ~4.8s each!)
  console.log('3. Recording slow MP4 showcase video (2 minutes / 120 seconds)...');
  const recorderPage = await browser.newPage();
  await recorderPage.setViewport({ width: 720, height: 1280, deviceScaleFactor: 1 });

  const renderHtml = `
  <!DOCTYPE html>
  <html dir="rtl">
  <head>
    <meta charset="UTF-8">
    <style>
      body { margin: 0; padding: 0; background: #000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", sans-serif; }
      canvas { width: 720px; height: 1280px; display: block; }
    </style>
  </head>
  <body>
    <canvas id="videoCanvas" width="720" height="1280"></canvas>
    <script>
      const slidesData = ${JSON.stringify(capturedSlides)};
      const canvas = document.getElementById('videoCanvas');
      const ctx = canvas.getContext('2d');

      const loadedImages = [];
      let imagesReady = 0;

      slidesData.forEach((s) => {
        const img = new Image();
        img.onload = () => { imagesReady++; };
        img.src = s.dataUri;
        loadedImages.push({ img, name: s.name, label: s.label });
      });

      function roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      }

      window.recordShowcaseVideoRealtime = function() {
        return new Promise(async (resolve) => {
          while (imagesReady < slidesData.length) {
            await new Promise(r => setTimeout(r, 50));
          }

          const totalDuration = 120; // 120 seconds (2:00 min) - slow and completely clear
          const timePerSlide = totalDuration / loadedImages.length; // ~4.8 seconds per slide

          const stream = canvas.captureStream(30);
          let mimeType = 'video/mp4;codecs=avc1';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/mp4';
          }
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm;codecs=vp9';
          }

          const mediaRecorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 6000000
          });

          const recordedChunks = [];
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data);
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: mimeType });
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result.split(',')[1]);
            };
            reader.readAsDataURL(blob);
          };

          mediaRecorder.start(1000);

          let startTime = null;

          function renderFrame(now) {
            if (!startTime) startTime = now;
            const elapsed = (now - startTime) / 1000;
            const progress = Math.min(1.0, elapsed / totalDuration);

            const slideFloat = elapsed / timePerSlide;
            const currentIndex = Math.min(loadedImages.length - 1, Math.floor(slideFloat));
            const nextIndex = Math.min(loadedImages.length - 1, currentIndex + 1);
            const slideTime = elapsed - (currentIndex * timePerSlide);
            const slideProgress = slideTime / timePerSlide;

            // 1. Background gradient
            const bgGrad = ctx.createLinearGradient(0, 0, 720, 1280);
            bgGrad.addColorStop(0, '#240d22');
            bgGrad.addColorStop(0.5, '#120613');
            bgGrad.addColorStop(1, '#080208');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, 720, 1280);

            // Glow effects
            const glowGrad1 = ctx.createRadialGradient(100, 100, 0, 100, 100, 300);
            glowGrad1.addColorStop(0, 'rgba(255, 20, 147, 0.35)');
            glowGrad1.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGrad1;
            ctx.fillRect(0, 0, 720, 1280);

            const glowGrad2 = ctx.createRadialGradient(620, 1180, 0, 620, 1180, 350);
            glowGrad2.addColorStop(0, 'rgba(212, 175, 55, 0.25)');
            glowGrad2.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGrad2;
            ctx.fillRect(0, 0, 720, 1280);

            // 2. Header Area
            ctx.save();
            ctx.fillStyle = 'rgba(255, 20, 147, 0.18)';
            roundRect(ctx, 200, 35, 320, 32, 16);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 20, 147, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.font = 'bold 13.5px sans-serif';
            ctx.fillStyle = '#ff69b4';
            ctx.textAlign = 'center';
            ctx.fillText('✨ AYXA PLANNER PRO • استعراض الواجهات', 360, 56);

            const currentSlide = loadedImages[currentIndex];
            ctx.font = 'bold 23px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(currentSlide.name + ' ✨', 360, 98);

            ctx.font = '13px sans-serif';
            ctx.fillStyle = '#f5c2eb';
            ctx.fillText(currentSlide.label, 360, 124);
            ctx.restore();

            // 3. Phone Mockup Frame
            const phoneX = 145;
            const phoneY = 150;
            const phoneW = 430;
            const phoneH = 932;
            const phoneRadius = 50;

            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 35;
            ctx.shadowOffsetY = 20;

            ctx.fillStyle = '#050205';
            roundRect(ctx, phoneX, phoneY, phoneW, phoneH, phoneRadius);
            ctx.fill();
            ctx.restore();

            ctx.strokeStyle = '#4a2645';
            ctx.lineWidth = 3;
            roundRect(ctx, phoneX, phoneY, phoneW, phoneH, phoneRadius);
            ctx.stroke();

            // Phone Screen Clipping
            ctx.save();
            const screenX = phoneX + 10;
            const screenY = phoneY + 10;
            const screenW = phoneW - 20;
            const screenH = phoneH - 20;
            const screenRadius = 42;

            roundRect(ctx, screenX, screenY, screenW, screenH, screenRadius);
            ctx.clip();

            if (loadedImages[currentIndex]) {
              ctx.drawImage(loadedImages[currentIndex].img, screenX, screenY, screenW, screenH);
            }

            if (slideProgress > 0.88 && loadedImages[nextIndex]) {
              const fadeAlpha = (slideProgress - 0.88) / 0.12;
              ctx.globalAlpha = fadeAlpha;
              ctx.drawImage(loadedImages[nextIndex].img, screenX, screenY, screenW, screenH);
              ctx.globalAlpha = 1.0;
            }

            // Dynamic Island
            ctx.fillStyle = '#000000';
            roundRect(ctx, screenX + (screenW - 110) / 2, screenY + 10, 110, 28, 14);
            ctx.fill();

            ctx.restore();

            // 4. Footer Progress Bar & Timer
            const progressW = 500;
            const progressH = 6;
            const progressX = (720 - progressW) / 2;
            const progressY = 1130;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            roundRect(ctx, progressX, progressY, progressW, progressH, 3);
            ctx.fill();

            const fillW = Math.max(6, progressW * progress);
            const barGrad = ctx.createLinearGradient(progressX, 0, progressX + progressW, 0);
            barGrad.addColorStop(0, '#ff1493');
            barGrad.addColorStop(1, '#ffd700');
            ctx.fillStyle = barGrad;
            roundRect(ctx, progressX, progressY, fillW, progressH, 3);
            ctx.fill();

            const mins = Math.floor(elapsed / 60);
            const secs = Math.floor(elapsed % 60);
            const timeFormatted = mins + ':' + (secs < 10 ? '0' : '') + secs + ' / 2:00';

            ctx.font = 'bold 12.5px sans-serif';
            ctx.fillStyle = '#e8b8de';
            ctx.textAlign = 'center';
            ctx.fillText('خطة اليوم • المهام • الذكاء الاصطناعي • القرآن • العادات (' + timeFormatted + ')', 360, 1165);

            if (elapsed < totalDuration) {
              requestAnimationFrame(renderFrame);
            } else {
              setTimeout(() => {
                mediaRecorder.stop();
              }, 500);
            }
          }

          requestAnimationFrame(renderFrame);
        });
      };
    </script>
  </body>
  </html>
  `;

  await recorderPage.setContent(renderHtml, { waitUntil: 'domcontentloaded', timeout: 60000 });

  console.log('Recording slow MP4 video (120 seconds at 30 FPS)... Please wait.');
  const videoBase64 = await recorderPage.evaluate(async () => {
    return await window.recordShowcaseVideoRealtime();
  });

  const videoBuffer = Buffer.from(videoBase64, 'base64');
  const videoOutputPath = path.resolve('releases/AYXA_Planner_Pro_Showcase_Slow.mp4');
  fs.writeFileSync(videoOutputPath, videoBuffer);

  const artifactVideoPath = path.join(artifactDir, 'AYXA_Planner_Pro_Showcase_Slow.mp4');
  fs.writeFileSync(artifactVideoPath, videoBuffer);

  const stats = fs.statSync(videoOutputPath);
  console.log(`Slow MP4 Video generated successfully: ${videoOutputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`Copied to artifact dir: ${artifactVideoPath}`);

  await browser.close();
  server.close();
  console.log('All screenshots and slow video completed successfully!');
}

run().catch(err => {
  console.error('Execution error:', err);
  process.exit(1);
});
