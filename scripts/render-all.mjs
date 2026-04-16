#!/usr/bin/env node

/**
 * Batch render all compositions to the out/ directory.
 * Usage: node scripts/render-all.mjs
 *
 * This renders every registered composition as an MP4.
 * For production, you'd typically render individual compositions
 * from the blueprint JSON.
 */

import { execSync } from "child_process";
import { mkdirSync } from "fs";

mkdirSync("out", { recursive: true });

const compositions = [
  "OddsCard",
  "BigNumber",
  "BigNumber-ShotShare",
  "BigNumber-4Gold",
  "BigNumber-Estimate",
  "QuoteCard",
  "LowerThird",
  "LowerThird-Source",
  "StatComparison",
  "StatComparison-InGame",
  "Scoreboard",
  "Scoreboard-Exhibition",
  "ProbabilityViz",
  "ProbabilityViz-Grid",
  "StandingsTable",
  "StandingsTable-Seedings",
];

console.log(`\n🎬 Rendering ${compositions.length} compositions...\n`);

for (const comp of compositions) {
  const outFile = `out/${comp}.mp4`;
  console.log(`  ▸ Rendering ${comp}...`);
  try {
    execSync(
      `npx remotion render src/index.ts ${comp} ${outFile} --codec h264`,
      { stdio: "inherit" }
    );
    console.log(`  ✓ ${outFile}\n`);
  } catch (err) {
    console.error(`  ✗ Failed: ${comp}\n`);
  }
}

console.log("🎬 Done!\n");
