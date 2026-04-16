#!/usr/bin/env node

/**
 * Render graphics from a video blueprint JSON file.
 *
 * Usage: node scripts/render-blueprint.mjs blueprint.json
 *
 * The blueprint JSON should have this structure:
 * {
 *   "title": "Video Title",
 *   "beats": [
 *     {
 *       "id": 1,
 *       "title": "Beat Title",
 *       "shots": [
 *         {
 *           "time": "0:04",
 *           "duration": "6s",
 *           "template": "T5",
 *           "compositionId": "QuoteCard",
 *           "data": { ...props for the template... },
 *           "durationInFrames": 180
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 * For each shot that has a template assigned, this script:
 * 1. Creates a temporary composition with the shot's data as props
 * 2. Renders it to out/beat-{id}-shot-{index}-{template}.mp4
 *
 * NOTE: This is a simplified version. In production, you'd use
 * Remotion's Node.js API (bundle + renderMedia) to pass props
 * dynamically without needing pre-registered compositions.
 * See: https://www.remotion.dev/docs/renderer/render-media
 */

import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from "fs";
import { execSync } from "child_process";

// Load schema durations so we never request more frames than a composition has
const { SCHEMAS } = await import("../src/lib/schemas.js");
const MAX_FRAMES = Object.fromEntries(SCHEMAS.map((s) => [s.id, s.dur]));

// Args: <blueprint.json> [--beat <id>] [--shot <index>]
const args = process.argv.slice(2);
const blueprintPath = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--beat" && args[args.indexOf(a) - 1] !== "--shot");
const onlyBeat = args.includes("--beat") ? Number(args[args.indexOf("--beat") + 1]) : null;
const onlyShot = args.includes("--shot") ? Number(args[args.indexOf("--shot") + 1]) : null;

if (!blueprintPath) {
  console.error(
    "Usage: node scripts/render-blueprint.mjs <blueprint.json>\n" +
    "       node scripts/render-blueprint.mjs <blueprint.json> --beat 3\n" +
    "       node scripts/render-blueprint.mjs <blueprint.json> --beat 3 --shot 1"
  );
  process.exit(1);
}

const blueprint = JSON.parse(readFileSync(blueprintPath, "utf-8"));
mkdirSync("out", { recursive: true });

const beatFilter = onlyBeat !== null ? ` (beat ${onlyBeat}${onlyShot !== null ? `, shot ${onlyShot}` : ""})` : "";
console.log(`\n🎬 Rendering blueprint: "${blueprint.title}"${beatFilter}\n`);

let renderCount = 0;

for (const beat of blueprint.beats) {
  if (onlyBeat !== null && beat.id !== onlyBeat) continue;

  for (let i = 0; i < beat.shots.length; i++) {
    const shot = beat.shots[i];
    if (onlyShot !== null && i !== onlyShot) continue;
    if (!shot.template || !shot.compositionId) continue;

    const outFile = `out/beat-${beat.id}-shot-${i}-${shot.template}.mp4`;
    console.log(`  ▸ Beat ${beat.id}, Shot ${i}: ${shot.template} → ${outFile}`);

    // Write props to a temp file to avoid shell escaping issues
    // (apostrophes in text data break single-quoted shell args)
    const propsFile = `out/.props-tmp-${beat.id}-${i}.json`;
    writeFileSync(propsFile, JSON.stringify(shot.data));

    // Cap requested duration to the composition's registered max so we never
    // ask for frames that don't exist (LLM sometimes guesses a longer duration)
    const compMax = MAX_FRAMES[shot.compositionId] ?? shot.durationInFrames;
    const frames = shot.durationInFrames
      ? Math.min(shot.durationInFrames, compMax)
      : compMax;
    const durationFlag = `--frames=0-${frames - 1}`;

    try {
      execSync(
        `npx remotion render src/index.ts ${shot.compositionId} ${outFile} --codec h264 --props=${propsFile} ${durationFlag}`,
        { stdio: "inherit" }
      );
      renderCount++;
      console.log(`  ✓ Done\n`);
    } catch (err) {
      console.error(`  ✗ Failed\n`);
    } finally {
      unlinkSync(propsFile);
    }
  }
}

console.log(`\n🎬 Rendered ${renderCount} graphics from blueprint.\n`);
