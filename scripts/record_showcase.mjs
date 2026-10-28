import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';

const routes = [
  { path: '/', name: 'الرئيسية — Home', label: 'خطة اليوم، لحظة ذكر، الإحصائيات والروتينات' },
  { path: '/tasks', name: 'مهامي — My Tasks', label: 'أهم 3 مهام، المجدولة زمنيًا، وفي أي وقت' },
  { path: '/ai', name: 'المخطط الذكي — AI Planner', label: 'مساعد الذكاء الاصطناعي لتنظيم اليوم' },
  { path: '/journal', name: 'يومياتي — Daily Journal', label: 'المذكرات، الامتنان، وتسجيل المشاعر' },
  { path: '/routines', name: 'روتيناتي — Routines & Ideal Day', label: 'روتين الصباح، المساء، وإعادة ضبط الحياة' },
  { path: '/islamic', name: 'ديني وروحي — My Deen', label: 'ختمة القرآن، أوقات الصلاة، الأذكار والتسبيح' },
  { path: '/habits', name: 'متتبع العادات — Habits Tracker', label: 'تتبع العادات اليومية وأيام الالتزام المستمرة' },
  { path: '/goals', name: 'أهدافي — Goal Planner', label: 'الأهداف الكبرى والخطوات المرحلية' },
  { path: '/focus', name: 'مؤقت التركيز — Focus & Pomodoro', label: 'جلسات التركيز وتقنية بومودورو' },
  { path: '/wellness', name: 'صحتي ومزاجي — Wellness & Mood', label: 'تتبع المزاج، شرب الماء، والنوم' },
  { path: '/selfcare', name: 'العناية بالنفس — Self-Care', label: 'روتين الجمال، العناية بالبشرة والراحة' },
  { path: '/finance', name: 'ميزانيتي — Finance & Budget', label: 'تتبع المصاريف، المدخرات والميزانية الشهرية' },
  { path: '/travel', name: 'تخطيط السفر — Travel Planner', label: 'حقيبة السفر، حجز الرحلات والأنشطة' },
  { path: '/learning', name: 'دراستي ودوراتي — Study Hub', label: 'المواد الدراسية، ملخصات الكتب والدورات' },
  { path: '/business', name: 'أعمالي ومشاريعي — Business Hub', label: 'إدارة المشاريع، العملاء والمهام المهنية' },
  { path: '/bujo', name: 'المفكرة النقطية — Bullet Journal', label: 'لوحة رسم ومفكرة نقطية حرة' },
  { path: '/image-editor', name: 'لوحة الرؤية — Vision Board', label: 'محرر الصور والملصقات ولوحة الأحلام' },
  { path: '/challenges', name: 'تحديات الـ 30 يوم — 30-Day Challenges', label: 'تحديات بناء الشخصية والعادات الإيجابية' },
  { path: '/pixels', name: 'عامي في بكسلات — Year in Pixels', label: 'سجل المزاج اليومي على مدار العام' },
  { path: '/gamification', name: 'المستوى والمكافآت — Gamification', label: 'نقاط الخبرة XP، الرتب والمكافآت' },
  { path: '/achievements', name: 'إنجازاتي وأوسمتي — Achievements', label: 'أوسمة الإنجاز والمسيرة الشخصية' },
  { path: '/settings', name: 'الإعدادات والمظهر — Settings', label: 'تخصيص السمات، الألوان، التنبيهات واللغة' },
];

async function run() {
  console.log('Launching Chrome browser...');
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
  });

  const page = await browser.newPage();
  const screenshots = [];

  console.log('Capturing screenshots for all pages at http://localhost:3000...');
  
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const url = 'http://localhost:3000' + route.path;
    console.log(`[${i + 1}/${routes.length}] Visiting ${url} (${route.name})...`);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 600));

      const topBuffer = await page.screenshot({ type: 'jpeg', quality: 90, fullPage: false });
      screenshots.push({
        name: route.name,
        label: route.label,
        dataUri: 'data:image/jpeg;base64,' + topBuffer.toString('base64'),
      });
    } catch (err) {
      console.warn(`Error capturing ${route.path}:`, err.message);
    }
  }

  console.log(`Captured ${screenshots.length} page views successfully.`);

  // Create the video generator page
  console.log('Setting up 60-second video stream via HTML5 MediaRecorder...');
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
      const slidesData = ${JSON.stringify(screenshots)};
      const canvas = document.getElementById('videoCanvas');
      const ctx = canvas.getContext('2d');

      const loadedImages = [];
      let imagesReady = 0;

      slidesData.forEach((s, idx) => {
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

      window.recordShowcaseVideo = async function() {
        while (imagesReady < slidesData.length) {
          await new Promise(r => setTimeout(r, 50));
        }

        const totalDuration = 60; // 60 seconds
        const fps = 30;
        const totalFrames = totalDuration * fps;
        const framesPerSlide = totalFrames / loadedImages.length;

        const stream = canvas.captureStream(fps);
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 6000000
        });

        const recordedChunks = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunks.push(e.data);
        };

        const recordingFinished = new Promise((resolve) => {
          mediaRecorder.onstop = async () => {
            const blob = new Blob(recordedChunks, { type: mimeType });
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result.split(',')[1]);
            };
            reader.readAsDataURL(blob);
          };
        });

        mediaRecorder.start();

        for (let frame = 0; frame <= totalFrames; frame++) {
          const progress = frame / totalFrames;
          const currentSlideFloat = (frame / framesPerSlide);
          const currentIndex = Math.min(loadedImages.length - 1, Math.floor(currentSlideFloat));
          const nextIndex = Math.min(loadedImages.length - 1, currentIndex + 1);
          const slideProgress = currentSlideFloat - Math.floor(currentSlideFloat);

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
          // Badge
          ctx.fillStyle = 'rgba(255, 20, 147, 0.18)';
          roundRect(ctx, 210, 35, 300, 32, 16);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 20, 147, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.font = 'bold 13.5px sans-serif';
          ctx.fillStyle = '#ff69b4';
          ctx.textAlign = 'center';
          ctx.fillText('✨ AYXA PLANNER PRO • جولة التطبيق', 360, 56);

          // Title
          const currentSlide = loadedImages[currentIndex];
          ctx.font = 'bold 24px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(currentSlide.name + ' ✨', 360, 98);

          // Subtitle
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

          if (slideProgress > 0.75 && loadedImages[nextIndex]) {
            const fadeAlpha = (slideProgress - 0.75) / 0.25;
            ctx.globalAlpha = fadeAlpha;
            ctx.drawImage(loadedImages[nextIndex].img, screenX, screenY, screenW, screenH);
            ctx.globalAlpha = 1.0;
          }

          // Dynamic Island
          ctx.fillStyle = '#000000';
          roundRect(ctx, screenX + (screenW - 110) / 2, screenY + 10, 110, 28, 14);
          ctx.fill();

          ctx.restore();

          // 4. Footer Progress Bar
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

          ctx.font = 'bold 12.5px sans-serif';
          ctx.fillStyle = '#e8b8de';
          ctx.textAlign = 'center';
          ctx.fillText('خطة اليوم • المهام • الذكاء الاصطناعي • القرآن والعبادات • العادات والروتينات', 360, 1165);

          // Fast render yield
          if (frame % 5 === 0) {
            await new Promise(r => setTimeout(r, 1));
          }
        }

        mediaRecorder.stop();
        return await recordingFinished;
      };
    </script>
  </body>
  </html>
  `;

  await recorderPage.setContent(renderHtml, { waitUntil: 'domcontentloaded', timeout: 60000 });

  console.log('Rendering 1800 frames at 30 FPS...');
  const videoBase64 = await recorderPage.evaluate(async () => {
    return await window.recordShowcaseVideo();
  });

  const videoBuffer = Buffer.from(videoBase64, 'base64');
  const videoOutputPath = path.resolve('releases/AYXA_Planner_Pro_Showcase_1min.webm');
  if (!fs.existsSync('releases')) fs.mkdirSync('releases', { recursive: true });
  fs.writeFileSync(videoOutputPath, videoBuffer);

  const stats = fs.statSync(videoOutputPath);
  console.log(`Video generated successfully: ${videoOutputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

  await browser.close();
  console.log('Done!');
}

run().catch(err => {
  console.error('Fatal recording error:', err);
  process.exit(1);
});
