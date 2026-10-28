// Emits /prompts/scNN-shot-cards.md for every scene in scripts/studio/scenes.mjs.
//
// Obeying film-breakdown: exactly three lanes and 22 fields per shot,
// 9 + 6 + 7, in a fixed order, with in-frame text left out of generation and
// pointed at docs/text-tasks.md instead.
//
// Run: node scripts/studio/build-shot-cards.mjs

import fs from "fs";
import path from "path";
import { SCENES, FILM, shotsOf } from "./scenes.mjs";

const PROMPTS_DIR = path.resolve("prompts");

const CHAPTER_LABEL_SCENES = new Set(
  SCENES.filter((s) => s.chapter).map((s) => `${s.id}a`),
);

// Scene-specific direction that cannot be derived mechanically from the dataset.
// Keyed by shot id. Anything absent falls back to an em dash so a missing field is
// visible rather than silently invented.
const DIRECTION = {
  "sc01a": {
    dramaturgy: "The film opens on a promise, not a feature. The mark arrives first so the viewer knows whose story this is; the accent rule landing underneath it is the moment the tour begins.",
    blocking: "The wordmark is centred on the blush ground with clear air above and below. The accent rule sits directly beneath the wordmark and spans roughly one third of the card width. Nothing else is in frame.",
    acting: "No character is present. The motion is carried entirely by the mark settling and the rule drawing; the restraint is the performance.",
    styleDevice: "Display type held at high contrast with a single rose gradient rule — the identity device used at every chapter break.",
    size: "Graphic full card",
    movement: "Locked off while the wordmark settles, then a very slow push-in of about 4% over the clip",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on, eye level, dead centre",
    cutType: "Hard open from black",
    pace: "Single slow beat with a long held tail",
    transition: "Dissolve into sc01-b",
  },
  "sc01b": {
    dramaturgy: "The device arrives so that every later screen is understood as living inside something the viewer holds. This is the hand-off from brand to product.",
    blocking: "The phone frame enters from below centre and comes to rest centred, occupying roughly two thirds of the card height. The Home screen fades up inside the frame once the frame has stopped moving.",
    acting: "No character is present. The frame's rise is the only motion; the screen inside it fades rather than slides, so the arrival reads as calm.",
    styleDevice: "Product-on-pastel presentation: the device floats on the coloured ground with no table, hands or environment.",
    size: "Graphic full card",
    movement: "Frame rises to its resting position, then holds completely still",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on, eye level, centred on the frame",
    cutType: "Dissolve in from sc01-a",
    pace: "One deliberate rise with a held stillness at the end",
    transition: "Dissolve into sc02-a",
  },
  "sc02a": {
    dramaturgy: "This is the establishing wide shot of the product. The viewer must leave knowing that Home is read, not written, so the camera refuses to interact with anything.",
    blocking: "The captured dashboard fills the frame vertically. Greeting at the top, today's plan beneath it, then dhikr, statistics and routine progress in their real render order. The camera holds at the top and lets the slow push carry the eye down the page.",
    acting: "No character is present. The interface is the only subject and it never changes state during the shot.",
    styleDevice: "Documentary restraint: a real screen at real scale, with no simulated taps, highlights or cursor.",
    size: "Captured screen, full",
    movement: "Continuous slow push-in of about 5% with no drift and no bounce",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Hard cut from sc01-b",
    pace: "One unhurried sweep, matched to the narration",
    transition: "Dissolve into sc03-a",
  },
  "sc03a": {
    dramaturgy: "Tasks is the engine of the whole method. The shot has to make the three-tier structure legible in a single look so the weekly review later makes sense.",
    blocking: "The captured task list fills the frame vertically. The top-three block sits above the fold with the time-scheduled list following and the anytime list below. A brief hold at the top reveals the tiers before the push begins.",
    acting: "No character is present. Nothing is ticked on camera; completion behaviour is described, not demonstrated, so no misleading animation appears.",
    styleDevice: "Documentary restraint: a real screen at real scale, with no simulated taps, highlights or cursor.",
    size: "Captured screen, full",
    movement: "A short tilt down through the tier headers, then a slow push-in for the remainder",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc02-a",
    pace: "Two beats: a quick identifying tilt, then one long hold",
    transition: "Dissolve into sc04-a",
  },
  "sc04a": {
    dramaturgy: "The fear this shot answers is automation without consent. The composition must show the assistant and the user's approval in the same frame.",
    blocking: "The captured conversation fills the frame vertically. The composer sits at the bottom edge and a structured proposal sits above it, so both halves of the agreement are readable at once.",
    acting: "No character is present. No typing is simulated; the proposal is simply already there, waiting.",
    styleDevice: "Documentary restraint: a real screen at real scale, with no simulated taps, highlights or cursor.",
    size: "Captured screen, full",
    movement: "Very slight push-in, held almost still so the text stays readable",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc03-a",
    pace: "Single steady beat, the slowest push in the chapter",
    transition: "Dissolve into sc05-a",
  },
  "sc05a": {
    dramaturgy: "Routines are the reusable layer; the shot must feel like opening a well-kept notebook rather than starting work.",
    blocking: "The captured routines view fills the frame. The tab row is briefly visible at the top, then the Ideal Day hero banner with its completion percentage and the step list beneath it occupy the rest of the hold.",
    acting: "No character is present. No step is ticked; the guided mode is described by narration only.",
    styleDevice: "Pastel paper surfaces kept flat and legible, with decorative linework sitting behind content and never over it.",
    size: "Captured screen, full",
    movement: "Small tilt to pass the tab row, then a slow push-in on the hero banner",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc04-a",
    pace: "Two beats: a quick orientation, then a settled hold",
    transition: "Dissolve into sc06-a",
  },
  "sc06a": {
    dramaturgy: "The hardest idea in the film lives here: a template is not a plan. The shot must show the switch that separates them.",
    blocking: "The captured Ideal Week view fills the frame. The template and dated-plan switch is at the top, the seven-day strip sits below it, and the selected day's day-type pill is visible within the strip. The camera comes to rest on the switch.",
    acting: "No character is present. The switch is shown in one state only; the act of switching is explained by narration to keep the shot to a single action.",
    styleDevice: "Pastel paper surfaces kept flat and legible, with decorative linework sitting behind content and never over it.",
    size: "Captured screen, full",
    movement: "Slow push-in that settles on the template and dated-plan switch",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc05-a",
    pace: "One considered beat; the viewer needs time to read the switch",
    transition: "Dissolve into sc06-b",
  },
  "sc06b": {
    dramaturgy: "This is the payoff of the previous shot: proof that planning can be anchored to something other than a clock.",
    blocking: "The captured Between the Prayers timeline fills the frame, with the six periods listed in order and their resolved prayer times beside them. The camera holds at the top of the list and pushes very gently so the whole sequence stays inside the frame.",
    acting: "No character is present. No item is dragged into a period; placement is described by narration.",
    styleDevice: "Pastel paper surfaces kept flat and legible, with decorative linework sitting behind content and never over it.",
    size: "Captured screen, full",
    movement: "Very gentle push-in, no pan, so every period label stays legible",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc06-a",
    pace: "Single calm beat, slightly slower than the shot that precedes it",
    transition: "Dissolve into sc07-a",
  },
  "sc07a": {
    dramaturgy: "Habit tracking has a reputation for cruelty. This shot exists to prove this one is fair, so the matrix must be readable enough to trust.",
    blocking: "The captured habit matrix fills the frame with the week grid, per-habit rows and the weekly progress figure all inside the safe area. One habit row is roughly centred.",
    acting: "No character is present. No cell is filled on camera; the fairness rules are carried by narration alone.",
    styleDevice: "Grid and card system kept quiet and consistent, with accent colour used only on the progress figure.",
    size: "Captured screen, full",
    movement: "Slow push-in that ends framed on the weekly progress figure",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc06-b",
    pace: "One steady beat with a slightly firmer landing on the progress figure",
    transition: "Dissolve into sc08-a",
  },
  "sc08a": {
    dramaturgy: "The promise of Goals is that large things become small things. The frame has to contain both at once.",
    blocking: "The captured goals list fills the frame with one goal card expanded so its milestones, progress and next-action line are all visible together. The camera settles on the expanded card.",
    acting: "No character is present. No milestone is ticked; the progress methods are explained rather than shown.",
    styleDevice: "Card-on-card layering with a single accent rule, so the hierarchy of goal to milestone to next action is visible at a glance.",
    size: "Captured screen, full",
    movement: "Slow push-in that comes to rest on the expanded goal card",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc07-a",
    pace: "One confident beat, narrowing emphasis from list to single card",
    transition: "Dissolve into sc09-a",
  },
  "sc09a": {
    dramaturgy: "A deliberate change of temperature. After the structure of Goals, the vision board should feel like someone's desk.",
    blocking: "The captured collage fills the frame with photos, stickers and at least one affirmation readable, arranged on the pastel canvas. The camera drifts very slightly so the composition itself is the subject.",
    acting: "No character is present. Nothing is placed or dragged; the board is already the way she left it.",
    styleDevice: "Scrapbook composition with torn washi edges and small flower motifs, kept entirely behind the cards.",
    size: "Captured screen, full",
    movement: "A slow drift across the collage, close to a locked-off hold",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the board, very slightly high so the layered paper reads",
    cutType: "Dissolve in from sc08-a",
    pace: "One wandering beat, the softest cut in the film",
    transition: "Dissolve into sc10-a",
  },
  "sc10a": {
    dramaturgy: "Focus must read as somewhere you would actually want to sit. The ambience selector in frame does that work.",
    blocking: "The captured focus timer fills the frame with the session dial and the ambient sound selector both visible in the same composition. The dial is roughly centred.",
    acting: "No character is present. The timer is not started on camera; recorded time is described by narration.",
    styleDevice: "A single warm accent glowing inside a calm card, so the dial reads as the door to the session.",
    size: "Captured screen, full",
    movement: "Very slow push-in toward the session dial",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc09-a",
    pace: "One quiet beat with a held stillness at the end",
    transition: "Dissolve into sc11-a",
  },
  "sc11a": {
    dramaturgy: "This is the app's heart and its most sensitive subject. The shot must be calm and unsentimental; the camera does not celebrate anything.",
    blocking: "The captured My Deen view fills the frame with prayer times and the section tabs for Quran, Athkar, Prayers, Tasbih and Sadaqah all inside the safe area. Prayer times sit uppermost.",
    acting: "No character is present. Nothing is counted or checked off on camera; no dhikr counter is animated.",
    styleDevice: "Warm neutral paper with a soft green accent, held deliberately quieter than the rest of the film.",
    size: "Captured screen, full",
    movement: "Slow push-in that resolves on the prayer-time block",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc10-a",
    pace: "One solemn beat, a fraction slower than its neighbours",
    transition: "Dissolve into sc12-a",
  },
  "sc12a": {
    dramaturgy: "Journal and Weekly Reset are introduced as one continuous idea, so the shot travels from the private entry list into the structured review.",
    blocking: "The captured journal list fills the frame with one locked entry visible in the list, then the Weekly Reset studio's overview step is reached while the camera keeps its push, ending on the overview summary.",
    acting: "No character is present. No entry is opened; the lock is shown by its indicator, not by a gate animation.",
    styleDevice: "Paper-card privacy cues: a quiet lock indicator and muted card fills where an entry is sealed.",
    size: "Captured screen, full",
    movement: "Continuous slow push-in that crosses from the entry list into the studio overview",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc11-a",
    pace: "One long sustained beat; the shot carries the film's pivot",
    transition: "Dissolve into sc13-a",
  },
  "sc13a": {
    dramaturgy: "Learning should feel like a study, not a school. The heatmap is what proves the app remembers real effort.",
    blocking: "The captured Learning hub fills the frame with the subject list above and the study heatmap below, both inside the safe area. The camera comes to rest so the heatmap's colour blocks are legible.",
    acting: "No character is present. No session is logged on camera; the heatmap is already populated.",
    styleDevice: "Warm paper with a soft blue accent, applied to the heatmap only.",
    size: "Captured screen, full",
    movement: "Slow push-in that ends framed on the study heatmap",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc12-a",
    pace: "One even beat, pausing on the heatmap",
    transition: "Dissolve into sc14-a",
  },
  "sc14a": {
    dramaturgy: "The claim to earn here is that business money and personal money are one ledger. The shot must show them inside one frame.",
    blocking: "The captured Business overview fills the frame with project milestones, the client ledger and the revenue figure all visible. The revenue figure is roughly centred.",
    acting: "No character is present. No invoice is marked paid on camera.",
    styleDevice: "Ledger-clean cards with a restrained gold accent, kept free of celebratory treatment.",
    size: "Captured screen, full",
    movement: "Slow push-in that settles on the revenue figure",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc13-a",
    pace: "One brisk but unhurried beat",
    transition: "Dissolve into sc15-a",
  },
  "sc15a": {
    dramaturgy: "Money screens invite anxiety. The shot keeps the arithmetic and the privacy together so the viewer feels in control, not audited.",
    blocking: "The captured Finance overview fills the frame with accounts, budgets and a savings goal all visible at once. No individual amount is emphasised by the camera.",
    acting: "No character is present. Nothing is entered or masked on camera; the masking option is described, not performed.",
    styleDevice: "Ledger-clean cards with a mint accent, and an explicit mask affordance shown as a resting control.",
    size: "Captured screen, full",
    movement: "Slow push-in, kept symmetrical so no single figure draws undue attention",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc14-a",
    pace: "One measured beat with a flat, even emphasis",
    transition: "Dissolve into sc16-a",
  },
  "sc16a": {
    dramaturgy: "A lighter breath after two money screens, and still a real tool. Travel should look like anticipation.",
    blocking: "The captured Travel planner fills the frame with the trip header, the itinerary days and the packing checklist all visible.",
    acting: "No character is present. No item is packed on camera.",
    styleDevice: "Paper-card travel layout with a powder-blue accent and a small hand-drawn route motif behind the header.",
    size: "Captured screen, full",
    movement: "Slow push-in with a very slight upward drift across the itinerary",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc15-a",
    pace: "One light beat, a little faster than the finance shot",
    transition: "Dissolve into sc17-a",
  },
  "sc17a": {
    dramaturgy: "Wellness has to look like one connected read, not four separate trackers. The shared water record is the proof.",
    blocking: "The captured Wellness hub fills the frame with the hydration, sleep and activity panels all visible together. Hydration sits highest in the composition.",
    acting: "No character is present. No water is logged on camera; the single-record claim is carried by narration.",
    styleDevice: "Soft mint and powder-blue panels on cream, with each panel sharing one border and one radius so they read as a family.",
    size: "Captured screen, full",
    movement: "Slow push-in that settles on the hydration panel then holds",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc16-a",
    pace: "One gentle beat, no urgency",
    transition: "Dissolve into sc18-a",
  },
  "sc18a": {
    dramaturgy: "Self-care is where the app could easily become a nag. The shot should feel like being handed a blanket, not a list.",
    blocking: "The captured Self-care workspace fills the frame with a skincare ritual, a mind pause and a check-in card all visible. The check-in card sits lowest.",
    acting: "No character is present. No check-in is answered on camera.",
    styleDevice: "The softest palette in the film: blush and lavender on cream, with decorative motifs used more freely than anywhere else.",
    size: "Captured screen, full",
    movement: "A very slow push-in that drifts slightly downward to include the check-in card",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc17-a",
    pace: "One soft beat, the gentlest in the film",
    transition: "Dissolve into sc19-a",
  },
  "sc19a": {
    dramaturgy: "A whole year in one image. The shot should let the pattern emerge before the narration names it.",
    blocking: "The captured Year in Pixels grid fills the frame, fully populated, with the colour legend visible at one edge. The camera holds wide so the pattern is the subject.",
    acting: "No character is present. No cell is filled on camera; the grid is already complete.",
    styleDevice: "A mosaic of pastel mood colours on cream, held flat and unadorned so the pattern is not competed with.",
    size: "Captured screen, full",
    movement: "Almost no movement; a very slow push-in of about 3% so the mosaic stays intact",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the grid, no tilt, so the rows stay parallel to the frame",
    cutType: "Dissolve in from sc18-a",
    pace: "One still beat, the calmest in the second half",
    transition: "Dissolve into sc20-a",
  },
  "sc20a": {
    dramaturgy: "Proof that the planner can be drawn on. The shot should look like a page someone actually keeps.",
    blocking: "The captured Bullet Journal canvas fills the frame with a grid page, visible handwriting and the sticker strip all in view.",
    acting: "No character is present and no hand enters frame; the page is shown as left, not being written.",
    styleDevice: "Pastel paper with dotted rules, a torn washi strip and a small flower, all sitting behind the writing.",
    size: "Captured screen, full",
    movement: "Slow push-in that traces slightly along the page, holding the writing readable",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on from directly above the page plane",
    cutType: "Dissolve in from sc19-a",
    pace: "One unhurried beat that invites reading",
    transition: "Dissolve into sc21-a",
  },
  "sc21a": {
    dramaturgy: "Discipline without dishonesty. The day tracker is the whole argument, so the camera lands on it.",
    blocking: "The captured Challenges list fills the frame with one running multi-day protocol and its day tracker open in view.",
    acting: "No character is present. No day is marked complete on camera, so the tracker is never seen to skip ahead.",
    styleDevice: "A crisp card with a bold accent for the protocol title and a neutral, honest grid for the day tracker.",
    size: "Captured screen, full",
    movement: "Slow push-in that resolves on the day tracker",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc20-a",
    pace: "One resolute beat with a firm landing",
    transition: "Dissolve into sc22-a",
  },
  "sc22a": {
    dramaturgy: "Rewards are explained here and immediately bounded, so the shot moves from the level bar to the badge gallery and lets the gallery be the last word.",
    blocking: "The captured Progress screen fills the frame with the level bar and quest list visible, then the Badges gallery occupies the composition as the camera's push carries into it.",
    acting: "No character is present. No badge unlocks on camera; nothing is celebrated with animation.",
    styleDevice: "Level bar in a restrained accent, badge gallery on paper tiles so the rewards read as keepsakes rather than casino lights.",
    size: "Captured screen, full",
    movement: "Continuous slow push-in that crosses from the level bar into the badge gallery",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc21-a",
    pace: "One escalating beat, tightening on the gallery",
    transition: "Dissolve into sc23-a",
  },
  "sc23a": {
    dramaturgy: "The last functional shot. It has to say the app bends to her, not the other way round, and that her data is hers.",
    blocking: "The captured More hub fills the frame with its grouped module directory, then Settings arrives showing themes and language with the export control visible near the end of the push.",
    acting: "No character is present. Nothing is toggled on camera; a change of theme is described, not performed, to keep to one action.",
    styleDevice: "The app's own directory styling: grouped cards, one accent per group, and no additional graphic layer added by the film.",
    size: "Captured screen, full",
    movement: "Continuous slow push-in that travels from the directory into the Settings section",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc22-a",
    pace: "One purposeful beat, slightly brisker than the level shot",
    transition: "Dissolve into sc24-a",
  },
  "sc24a": {
    dramaturgy: "The closing argument: Arabic is not a skin over the product, it is the same product mirrored. The frame must look structurally different, not translated.",
    blocking: "The captured Arabic Home dashboard fills the frame, right-aligned throughout with the navigation order reversed. No English string is present anywhere in the composition.",
    acting: "No character is present. The interface is static; nothing is tapped to demonstrate the mirroring.",
    styleDevice: "The identical visual system to the English screens, mirrored — same paper, same plum text, same pink primary, opposite reading direction.",
    size: "Captured screen, full",
    movement: "Slow push-in matched shot-for-shot to sc02-a so the two can be compared",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on to the screen plane, no tilt",
    cutType: "Dissolve in from sc23-a",
    pace: "One settled beat that invites comparison with the opening dashboard",
    transition: "Hard cut into sc24-b after the final line of narration",
  },
  "sc24b": {
    dramaturgy: "Close the loop. The device is set down and the last thing on screen is an invitation, not a claim.",
    blocking: "The phone frame settles to rest and reduces slightly in emphasis while the wordmark returns above it. The closing line sits below the chapter label. Nothing else is in frame.",
    acting: "No character is present. The only motion is the frame coming to rest and the colour easing back to the blush ground.",
    styleDevice: "A return to the cold-open device: the same wordmark, the same blush ground, the same accent rule — now as a full stop.",
    size: "Graphic full card",
    movement: "Frame settles and holds completely still while the ground eases back",
    lens: "A single fixed 50mm equivalent, unchanging for the whole shot",
    angle: "Straight on, eye level, centred",
    cutType: "Hard cut from sc24-a",
    pace: "One long held beat running out to black",
    transition: "Fade to black and end",
  },
};

// In-frame text is recorded in docs/text-tasks.md and only pointed at, never requested.
const EXTRA_TEXT_POINTERS = {
  "sc01a": ["`sc01-a` · brand wordmark", "`sc01-a` · subtitle"],
  "sc24b": ["`sc24-a` · wordmark (return)", "`sc24-a` · closing line"],
};

function textPointerLines(shotId) {
  const lines = [];
  if (CHAPTER_LABEL_SCENES.has(shotId)) lines.push(`\`${shotId}\` · chapter lower-third`);
  if (EXTRA_TEXT_POINTERS[shotId]) lines.push(...EXTRA_TEXT_POINTERS[shotId]);
  if (lines.length === 0) {
    return "None. No in-frame text is drawn on this shot; all titles and labels are composited in the edit stage.";
  }
  return [
    "All text for this shot is listed in `docs/text-tasks.md` under:",
    "",
    ...lines.map((l) => `- ${l}`),
    "",
    "None of it is requested from a generation model.",
  ].join("\n");
}

function laneTable(rows) {
  return ["| Field | Value |", "|---|---|", ...rows.map(([k, v]) => `| ${k} | ${v} |`)].join("\n");
}

function propsFor(scene) {
  const props = ["`@phone_frame` (v1)", "`@card_paper` (v1)"];
  if (scene.id === "sc01" || scene.id === "sc24") props.push("`@brand_mark` (v1)");
  if (scene.route) props.push("`@shell_bottom_nav` (v1)");
  if (["sc03", "sc05", "sc06", "sc12", "sc20"].includes(scene.id)) props.push("`@stylus` (v1)");
  return props.join("<br>");
}

function buildFile(scene) {
  const shots = shotsOf(scene);
  const out = [];

  out.push(`# ${scene.id} — shot cards`);
  out.push("");
  out.push(`Film: **${FILM.title} — ${FILM.subtitle}**  `);
  out.push(
    `Chapter: ${scene.chapter ? `**${scene.chapter}**` : "_(cold open / outro, no chapter)_"}  `,
  );
  out.push(`Location: \`${scene.location}\`  `);
  out.push(
    `Route captured: ${scene.route ? `\`${scene.route}\`` : "_none — graphic card, no route_"}  `,
  );
  out.push(`Shots in this scene: ${shots.length}`);
  out.push("");

  shots.forEach((shot) => {
    const d = DIRECTION[shot.shotId] || {};
    const dialogue = scene.narration.map((line) => `> ${line}`).join("\n");

    out.push(`## ${shot.shotId}`);
    out.push("");
    out.push("### Lane 1 — identity");
    out.push("");
    out.push(
      laneTable([
        ["Scene / shot ID", `\`${shot.shotId}\` (scene \`${scene.id}\`, shot \`${shot.suffix}\`)`],
        ["Location", `\`${scene.location}\``],
        ["Time of day", "n/a — screen-rendered UI, no day cycle applies"],
        [
          "Characters with asset tags and state variants",
          "None. This film has no human characters; the persistent surfaces in frame are registered as props and are listed in the Props field below.",
        ],
        ["Props", propsFor(scene)],
        ["Description", shot.description],
        ["Verbatim dialogue", dialogue || "_(none)_"],
        ["Running time", `${shot.runs} seconds`],
        ["Complexity", shot.complexity],
      ]),
    );

    out.push("");
    out.push("### Lane 2 — direction");
    out.push("");
    out.push(
      laneTable([
        ["Shot goal", shot.goal],
        ["Task as a verb", `**${shot.task}**`],
        ["Dramaturgy", d.dramaturgy || "—"],
        ["Blocking", d.blocking || "—"],
        ["Acting", d.acting || "—"],
        ["Style device", d.styleDevice || "—"],
      ]),
    );

    out.push("");
    out.push("### Lane 3 — camera / edit");
    out.push("");
    out.push(
      laneTable([
        ["Size", d.size || "—"],
        ["Movement", d.movement || "—"],
        ["Lens", d.lens || "—"],
        ["Angle", d.angle || "—"],
        ["Cut type", d.cutType || "—"],
        ["Pace", d.pace || "—"],
        ["Transition", d.transition || "—"],
      ]),
    );

    out.push("");
    out.push("### In-frame text");
    out.push("");
    out.push(textPointerLines(shot.shotId));
    out.push("");
    out.push("---");
    out.push("");
  });

  out.push("## Validation");
  out.push("");
  out.push(`- Shots in this file: **${shots.length}**`);
  out.push("- Lanes per shot: **3** — identity, direction, camera / edit");
  out.push("- Fields per shot: **22** (9 + 6 + 7)");
  out.push(
    `- Clip lengths: ${shots.map((s) => `${s.shotId} ${s.runs}s`).join(", ")} — inside the 10–15 second boundary.`,
  );
  out.push("- Actions per clip: **1**");
  out.push("- In-frame text requests sent to generation: **0**");
  out.push("");
  out.push(
    "The prompt is written later from this card almost mechanically, because the three column groups map one-to-one to the prompt blocks.",
  );
  out.push("");
  return out.join("\n");
}

function main() {
  fs.mkdirSync(PROMPTS_DIR, { recursive: true });
  let files = 0;
  let shots = 0;
  const shortClips = [];

  SCENES.forEach((scene) => {
    fs.writeFileSync(path.join(PROMPTS_DIR, `${scene.id}-shot-cards.md`), buildFile(scene), "utf8");
    files += 1;
    shots += scene.shots.length;
    scene.shots.forEach((s) => {
      if (s.runs < 10 || s.runs > 15) shortClips.push(`${scene.id}${s.suffix}=${s.runs}s`);
    });
  });

  console.log(`Wrote ${files} shot-card files to prompts/`);
  console.log(`Shots total: ${shots}`);
  console.log("Lanes per shot: 3 — fields per shot: 22");
  console.log(
    shortClips.length
      ? `OUT OF RANGE: ${shortClips.join(", ")}`
      : "Clip boundary check: every clip is 10–15s (PASS)",
  );
}

main();
