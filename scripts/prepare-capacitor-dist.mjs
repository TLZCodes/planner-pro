import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.resolve('.output/public');
const assetsDir = path.join(publicDir, 'assets');

if (!fs.existsSync(assetsDir)) {
  console.error("Assets directory .output/public/assets does not exist!");
  process.exit(1);
}

// Clean any heavy media files (.apk, .mp4, .webm) from .output/public so Android APK stays light
function cleanHeavyFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      cleanHeavyFiles(fullPath);
    } else if (item.endsWith('.apk') || item.endsWith('.mp4') || item.endsWith('.webm')) {
      fs.unlinkSync(fullPath);
      console.log('Removed heavy file from build bundle:', item);
    }
  }
}

cleanHeavyFiles(publicDir);

const files = fs.readdirSync(assetsDir);
const jsEntry = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
const cssEntry = files.find(f => f.startsWith('styles-') && f.endsWith('.css'));

console.log('Detected Capacitor JS Entry:', jsEntry);
console.log('Detected Capacitor CSS Entry:', cssEntry);

const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <base href="/" />
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#ff1493" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <title>AYXA Planner Pro — Daily Productivity & Habit Tracker</title>
    <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    ${cssEntry ? `<link rel="stylesheet" href="/assets/${cssEntry}">` : ''}
  </head>
  <body>
    <div id="root"></div>
    ${jsEntry ? `<script type="module" src="/assets/${jsEntry}"></script>` : ''}
  </body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'index.html'), htmlContent, 'utf-8');
console.log('Successfully updated .output/public/index.html with bundled JS and CSS assets!');

// Automatically sync capacitor.config.json to android assets
const androidAssetsDir = path.resolve('android/app/src/main/assets');
if (fs.existsSync(androidAssetsDir)) {
  fs.copyFileSync(path.resolve('capacitor.config.json'), path.join(androidAssetsDir, 'capacitor.config.json'));
  console.log('Successfully synced capacitor.config.json to android/app/src/main/assets/capacitor.config.json');
}

// Automatically sync capacitor.config.json to ios assets
const iosAppDir = path.resolve('ios/App/App');
if (fs.existsSync(iosAppDir)) {
  fs.copyFileSync(path.resolve('capacitor.config.json'), path.join(iosAppDir, 'capacitor.config.json'));
  console.log('Successfully synced capacitor.config.json to ios/App/App/capacitor.config.json');
}

// Automatically purge stale android assets and copy fresh build files
const androidPublicDir = path.resolve('android/app/src/main/assets/public');
if (fs.existsSync(androidPublicDir)) {
  fs.rmSync(androidPublicDir, { recursive: true, force: true });
}
fs.mkdirSync(androidPublicDir, { recursive: true });

function copyDir(src, dst) {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

copyDir(publicDir, androidPublicDir);
console.log('Successfully synchronized clean assets to android/app/src/main/assets/public!');

// Automatically purge stale ios assets and copy fresh build files
const iosPublicDir = path.resolve('ios/App/App/public');
if (fs.existsSync(iosAppDir)) {
  if (fs.existsSync(iosPublicDir)) {
    fs.rmSync(iosPublicDir, { recursive: true, force: true });
  }
  fs.mkdirSync(iosPublicDir, { recursive: true });
  copyDir(publicDir, iosPublicDir);
  console.log('Successfully synchronized clean assets to ios/App/App/public!');
}
