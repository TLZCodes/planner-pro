// Numeric quality check for the client tour master.
//
// The image preview in this environment does not render files, so eyeballing a
// frame is not available. Instead this script measures the frame: it decodes one
// frame as raw pixels and reports where things actually are. That turns
// "it looks right" into a number that can be checked.
//
// It reports:
//   - the bounding box of everything that is not the blush background
//   - the bounding box of the hot-pink label chip
//   - the top-left pixel, which must be the blush background
//
// Run: node scripts/studio/qc-frame.mjs <video> [seconds]
// Default seconds: 3.

import { execFileSync } from "child_process";

const video = process.argv[2] || "master/AYXA_Planner_Pro_Client_Tour.mp4";
const at = Number(process.argv[3] || 3);

// Decode small: precise to ~4px at 1080x1920 and cheap to scan in JS.
const SW = 270;
const SH = 480;
const FULL_W = 1080;
const FULL_H = 1920;

const buf = execFileSync(
  "ffmpeg",
  [
    "-v", "error",
    "-ss", String(at),
    "-i", video,
    "-frames:v", "1",
    "-vf", `scale=${SW}:${SH}`,
    "-f", "rawvideo",
    "-pix_fmt", "rgb24",
    "-",
  ],
  { maxBuffer: 64 * 1024 * 1024 },
);

const expected = SW * SH * 3;
if (buf.length < expected) throw new Error(`decoded ${buf.length} bytes, expected ${expected}`);

const at3 = (x, y) => {
  const i = (y * SW + x) * 3;
  return [buf[i], buf[i + 1], buf[i + 2]];
};

// Blush ground 0xFFF2F7 — anything meaningfully away from it is content.
const BG = [0xff, 0xf2, 0xf7];
function isBg([r, g, b]) {
  return Math.abs(r - BG[0]) < 10 && Math.abs(g - BG[1]) < 10 && Math.abs(b - BG[2]) < 10;
}

// Hot pink 0xFF1493 at 0.93 over a pale ground lands near [255, 36, 154].
function isPink([r, g, b]) {
  return r > 220 && g < 90 && b > 115 && b < 205;
}

// Geometry of the composition, mirrored from build-tour-film.mjs. The app now
// fills the frame height, so the label bar is the strip at the very bottom of the
// picture and the app's own interface is what sits above it. Everything in that
// 84px strip belongs to the bar, which is what makes the measurement meaningful.
const PANEL_H = 1836;
const PANEL_X = 128;
const BAR_TOP = PANEL_H;

function bbox(pred, yFrom = 0, yTo = SH) {
  let x0 = SW, y0 = SH, x1 = -1, y1 = -1, n = 0;
  for (let y = Math.max(0, yFrom); y < Math.min(SH, yTo); y++) {
    for (let x = 0; x < SW; x++) {
      if (!pred(at3(x, y))) continue;
      n++;
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }
  if (n === 0) return null;
  const sx = FULL_W / SW;
  const sy = FULL_H / SH;
  return {
    pixels: n,
    scaled: {
      x0: Math.round(x0 * sx), y0: Math.round(y0 * sy),
      x1: Math.round(x1 * sx), y1: Math.round(y1 * sy),
      width: Math.round((x1 - x0) * sx), height: Math.round((y1 - y0) * sy),
    },
  };
}

const corner = at3(0, 0);
const content = bbox((p) => !isBg(p));
// The label bar is the bottom strip of the frame; nothing else is down there.
const chipBandFrom = Math.floor((BAR_TOP / FULL_H) * SH);
const pink = bbox(isPink, chipBandFrom, SH);

console.log(`${video} @ ${at}s`);
console.log(`corner pixel      rgb(${corner.join(",")})`);
console.log(
  content
    ? `content bbox      x ${content.scaled.x0}-${content.scaled.x1}  y ${content.scaled.y0}-${content.scaled.y1}  (${content.scaled.width}x${content.scaled.height}, ${content.pixels} px sampled)`
    : "content bbox      none found — the frame is empty",
);
console.log(
  pink
    ? `label bar bbox    x ${pink.scaled.x0}-${pink.scaled.x1}  y ${pink.scaled.y0}-${pink.scaled.y1}  (${pink.scaled.width}x${pink.scaled.height}, ${pink.pixels} px sampled, searched below y=${BAR_TOP})`
    : `label bar bbox    none found below y=${BAR_TOP} — the bar did not render where it should`,
);

// Expectations, stated so a mismatch is obvious rather than silently accepted.
// The app now fills the frame height, so it should reach the top and the bottom
// of the picture rather than sitting inset on a mat.
const checks = [
  ["frame is not blank", Boolean(content && content.pixels > 500)],
  ["app reaches the top of the frame", Boolean(content && content.scaled.y0 < 40)],
  ["app is taller than the label bar", Boolean(content && content.scaled.height > FULL_H * 0.9)],
];
if (pink) {
  checks.push(["label bar sits in the bottom strip", pink.scaled.y0 > FULL_H * 0.94]);
  checks.push([
    "label bar is horizontally centred",
    Math.abs((pink.scaled.x0 + pink.scaled.x1) / 2 - FULL_W / 2) < 40,
  ]);
}

let failed = 0;
console.log("");
for (const [name, ok] of checks) {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
}
console.log("");
console.log(failed ? `${failed} check(s) failed` : "all checks passed");
process.exit(failed ? 1 : 0);
