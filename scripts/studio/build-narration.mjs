// Narration stage for the AYXA Planner Pro educational showcase.
//
// The narration text lives in exactly one place: the narration[] array in
// scripts/studio/scenes.mjs. That same array is what the shot cards quote
// verbatim, so the spoken track and the written cards can never disagree.
//
// Voice: Microsoft Zira Desktop (en-US) via System.Speech.Synthesis. No Arabic
// speech voice is installed on this machine, which is why narration is English
// only and every piece of Arabic copy in the film is presented visually.
//
// Output: sound/narration/<sceneId>-l<N>.wav  (one file per narration line)
//         sound/narration/manifest.json        (line text + measured duration)
//
// Run: node scripts/studio/build-narration.mjs

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { SCENES } from "./scenes.mjs";

const OUT_DIR = path.resolve("sound/narration");
const VOICE = "Microsoft Zira Desktop";
// A measured, unhurried pace. Rate 0 is Zira's natural delivery; +1 keeps an
// educational walkthrough moving without sounding rushed.
const RATE = 1;

function flatLines() {
  const lines = [];
  SCENES.forEach((scene) => {
    scene.narration.forEach((text, i) => {
      lines.push({ id: `${scene.id}-l${i + 1}`, scene: scene.id, index: i + 1, text });
    });
  });
  return lines;
}

function synthesize(line, outPath) {
  // Passed to PowerShell through a JSON file rather than a command string, so no
  // part of the narration text is ever interpreted by the shell.
  const payload = {
    voice: VOICE,
    rate: RATE,
    out: outPath,
    text: line.text,
  };
  const tmp = path.join(OUT_DIR, `.tmp-${line.id}.json`);
  fs.writeFileSync(tmp, JSON.stringify(payload), "utf8");

  const ps = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$cfg = Get-Content -Raw -LiteralPath '${tmp.replace(/'/g, "''")}' | ConvertFrom-Json
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
try { $s.SelectVoice($cfg.voice) } catch { Write-Error "Voice not found: $($cfg.voice)"; exit 3 }
$s.Rate = [int]$cfg.rate
$s.SetOutputToWaveFile($cfg.out)
$s.Speak($cfg.text)
$s.Dispose()
`;
  const psFile = path.join(OUT_DIR, `.tmp-${line.id}.ps1`);
  fs.writeFileSync(psFile, ps, "utf8");

  try {
    execFileSync(
      "powershell",
      ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", psFile],
      { stdio: "pipe" },
    );
  } finally {
    fs.rmSync(tmp, { force: true });
    fs.rmSync(psFile, { force: true });
  }
}

function probeSeconds(file) {
  const raw = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file],
    { encoding: "utf8" },
  ).trim();
  return Number.parseFloat(raw);
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const lines = flatLines();
  console.log(`Narration lines: ${lines.length} across ${SCENES.length} scenes`);
  console.log(`Voice: ${VOICE} at rate ${RATE > 0 ? "+" : ""}${RATE}`);
  console.log("");

  const manifest = [];
  let total = 0;

  for (const line of lines) {
    const out = path.join(OUT_DIR, `${line.id}.wav`);
    try {
      synthesize(line, out);
      const seconds = probeSeconds(out);
      total += seconds;
      manifest.push({ ...line, file: `sound/narration/${line.id}.wav`, seconds: Number(seconds.toFixed(3)) });
      console.log(`ok    ${line.id.padEnd(10)} ${seconds.toFixed(2)}s  ${line.text.slice(0, 62)}${line.text.length > 62 ? "…" : ""}`);
    } catch (err) {
      console.log(`FAIL  ${line.id}  ${err.message}`);
      manifest.push({ ...line, file: null, seconds: null, error: String(err.message) });
    }
  }

  // Per-scene totals, which is what the editor schedules against.
  const perScene = {};
  manifest.forEach((m) => {
    perScene[m.scene] = perScene[m.scene] || { lines: 0, seconds: 0, missing: 0 };
    perScene[m.scene].lines += 1;
    if (m.seconds) perScene[m.scene].seconds += m.seconds;
    else perScene[m.scene].missing += 1;
  });

  fs.writeFileSync(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify({ voice: VOICE, rate: RATE, totalSeconds: Number(total.toFixed(3)), perScene, lines: manifest }, null, 2),
    "utf8",
  );

  console.log("");
  console.log("Per scene:");
  Object.entries(perScene).forEach(([scene, s]) => {
    console.log(`  ${scene}  ${s.lines} line(s)  ${s.seconds.toFixed(2)}s${s.missing ? `  MISSING ${s.missing}` : ""}`);
  });
  console.log("");
  console.log(`Total narration: ${total.toFixed(1)}s (${(total / 60).toFixed(2)} min)`);
  console.log("Manifest: sound/narration/manifest.json");
}

main();
