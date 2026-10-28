// AYXA Planner Pro — Pure Full-Screen App Showcase Video.
//
// 100% pure application recording:
// - ONLY app segments (no cards, no non-app slides)
// - NO added text, NO titles, NO badges, NO pink bars, NO touch overlays
// - Crop out 100% of the grey padding from the Playwright recording
// - Scale to full screen 1080x2400 (matching native mobile phone aspect ratio)

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const TOUR_DIR = path.resolve("edit/tour");
const SEG_OUT = path.join(TOUR_DIR, "out");
const MASTER_DIR = path.resolve("master");
const MASTER = path.join(MASTER_DIR, "AYXA_Planner_Pro_Client_Tour.mp4");

const W = 1080;
const H = 2400;
const FPS = 30;
const CRF = "22";
const PRESET = "ultrafast";

const HEAD_EPSILON = 0.12;
const TAIL_TRIM = 0.25;

function run(args, label) {
  try {
    execFileSync("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
  } catch (err) {
    const detail = err.stderr ? err.stderr.toString().split("\n").slice(-18).join("\n") : err.message;
    throw new Error(`${label}\n${detail}`);
  }
}

function buildFilter() {
  return [
    "crop=412:915:0:0",
    `scale=${W}:${H}:flags=fast_bilinear`,
    "setsar=1",
    `fps=${FPS}`,
    "format=yuv420p",
  ].join(",");
}

function normaliseSegment(seg) {
  const src = path.resolve(seg.file);
  if (!fs.existsSync(src)) throw new Error(`missing recording: ${seg.file}`);

  const raw = Number(seg.seconds);
  const head = Number(seg.headTrim ?? 0) + HEAD_EPSILON;
  const seconds = raw - head - TAIL_TRIM;
  if (!(seconds > 0.5)) throw new Error(`${seg.tag}: recording too short (${raw}s)`);

  const out = path.join(SEG_OUT, `seg-${seg.tag}.mp4`);
  run(
    [
      "-y",
      "-hide_banner",
      "-loglevel", "error",
      "-ss", head.toFixed(3),
      "-i", src,
      "-vf", buildFilter(),
      "-t", seconds.toFixed(3),
      "-c:v", "libx264",
      "-preset", PRESET,
      "-crf", CRF,
      "-pix_fmt", "yuv420p",
      "-r", String(FPS),
      "-movflags", "+faststart",
      out,
    ],
    `segment ${seg.tag} (${seg.label})`,
  );

  return { out, seconds };
}

function main() {
  const manifestPath = path.join(TOUR_DIR, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("edit/tour/manifest.json not found");
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  // Only real app recordings (no title/outro cards)
  let segments = manifest.segments.filter((s) => s.file && s.kind === "app");
  if (!segments.length) {
    segments = manifest.segments.filter((s) => s.file);
  }

  fs.mkdirSync(SEG_OUT, { recursive: true });
  fs.mkdirSync(MASTER_DIR, { recursive: true });
  fs.readdirSync(SEG_OUT)
    .filter((f) => /^seg-.*\.mp4$/.test(f))
    .forEach((f) => fs.rmSync(path.join(SEG_OUT, f), { force: true }));

  console.log("AYXA Planner Pro — Full App Screen Assembly");
  console.log(`Building ${segments.length} app modules at ${W}x${H} (pure app, no added text)...`);

  const built = [];
  for (const seg of segments) {
    try {
      const { out, seconds } = normaliseSegment(seg);
      built.push({ ...seg, out, outSeconds: seconds });
      console.log(`ok  ${seg.tag}  ${seconds.toFixed(1)}s  ${seg.label}`);
    } catch (err) {
      console.log(`FAIL ${seg.tag}  ${err.message}`);
    }
  }

  if (!built.length) throw new Error("no segments were built");

  const listPath = path.join(SEG_OUT, "concat.txt");
  fs.writeFileSync(
    listPath,
    built.map((b) => `file '${b.out.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n") + "\n",
    "utf8",
  );

  const totalSeconds = built.reduce((a, b) => a + b.outSeconds, 0);
  console.log(`Joining ${built.length} segments (${(totalSeconds / 60).toFixed(2)} min)...`);

  run(
    [
      "-y",
      "-hide_banner",
      "-loglevel", "error",
      "-f", "concat",
      "-safe", "0",
      "-i", listPath,
      "-f", "lavfi",
      "-i", "anullsrc=r=44100:cl=stereo",
      "-map", "0:v:0",
      "-map", "1:a:0",
      "-c:v", "copy",
      "-c:a", "aac",
      "-b:a", "96k",
      "-shortest",
      "-movflags", "+faststart",
      MASTER,
    ],
    "final join",
  );

  const bytes = fs.statSync(MASTER).size;
  console.log(`Master built: ${(bytes / 1024 / 1024).toFixed(1)} MB, ${totalSeconds.toFixed(1)}s`);
}

main();
