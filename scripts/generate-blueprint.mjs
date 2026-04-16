#!/usr/bin/env node

/**
 * Generate a video blueprint + narration script + production sheet from raw content.
 *
 * Usage:
 *   node scripts/generate-blueprint.mjs --input my-article.txt
 *   node scripts/generate-blueprint.mjs --url https://example.com/article
 *   node scripts/generate-blueprint.mjs --input stats.txt --out out/my-video.json
 *   cat article.txt | node scripts/generate-blueprint.mjs
 *
 * Requires: ANTHROPIC_API_KEY environment variable
 *
 * Outputs:
 *   out/blueprint.json       — full structured blueprint (shots + narration)
 *   out/production-sheet.csv — spreadsheet for the production team
 *
 * Shot types in blueprint:
 *   graphic   — Remotion graphic (rendered to .mp4 automatically)
 *   footage   — game / event video footage needed from archives
 *   still     — photo or image needed
 *   newspaper — historical newspaper/magazine clip
 *   b_roll    — generic B-roll (crowd, venue, warmup, etc.)
 *   external  — any other asset
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "fs";
import { resolve } from "path";

// ── Load .env ─────────────────────────────────────────────────────────────────

const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) process.env[match[1]] ??= match[2].replace(/^["']|["']$/g, "");
  }
}

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};

const inputFile = getArg("--input");
const inputUrl  = getArg("--url");
const outFile   = getArg("--out") ?? "out/blueprint.json";
const outCsv    = outFile.replace(/\.json$/, "") + "-production-sheet.csv";

// ── URL fetching ──────────────────────────────────────────────────────────────

async function fetchViaJina(url) {
  const res = await fetch(`https://r.jina.ai/${url}`, {
    headers: { Accept: "text/plain" },
  });
  if (!res.ok) throw new Error(`Jina fetch failed (${res.status}) for ${url}`);
  return res.text();
}

async function fetchWebpage(url) {
  console.log(`  Fetching article: ${url}`);
  const htmlRes = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; StatMagicBot/1.0)" },
  });
  if (!htmlRes.ok) throw new Error(`Failed to fetch page (${htmlRes.status})`);
  const html = await htmlRes.text();

  const iframeSrcs = [...html.matchAll(/iframe[^>]+src=["']([^"']+)["']/gi)]
    .map((m) => m[1]).filter((src) => src.startsWith("http"));

  console.log(`  Extracting article text via Jina Reader...`);
  const mainText = await fetchViaJina(url);

  const iframeSections = [];
  if (iframeSrcs.length > 0) {
    console.log(`  Found ${iframeSrcs.length} iframe(s) — attempting to extract data...`);
    for (const src of iframeSrcs) {
      try {
        const iText = await fetchViaJina(src);
        if (iText.trim().length > 100) {
          iframeSections.push(`[Embedded graphic — ${src}]\n${iText.trim()}`);
          console.log(`    extracted: ${src}`);
        } else {
          console.log(`    skipped (no data): ${src}`);
        }
      } catch {
        console.log(`    skipped (fetch failed): ${src}`);
      }
    }
  }

  const parts = [mainText.trim()];
  if (iframeSections.length > 0) {
    parts.push("\n---\n## Embedded Graphics (extracted)\n");
    parts.push(...iframeSections);
  }
  return parts.join("\n\n");
}

// ── Read input ────────────────────────────────────────────────────────────────

let content;
if (inputUrl) {
  content = await fetchWebpage(inputUrl);
} else if (inputFile) {
  const resolvedPath = resolve(inputFile);
  const fstat = statSync(resolvedPath, { throwIfNoEntry: false });
  if (!fstat) {
    console.error(`Error: File not found: ${inputFile}`);
    process.exit(1);
  }
  if (fstat.isDirectory()) {
    console.error(
      `Error: "${inputFile}" is a directory, not a file.\n` +
      `Did you mean to pass a .txt file inside it? e.g.:\n` +
      `  node scripts/generate-blueprint.mjs --input ${inputFile}/article.txt`
    );
    process.exit(1);
  }
  content = readFileSync(resolvedPath, "utf-8");
} else if (!process.stdin.isTTY) {
  content = readFileSync("/dev/stdin", "utf-8");
} else {
  console.error(
    "Usage: node scripts/generate-blueprint.mjs --input <file>\n" +
    "       node scripts/generate-blueprint.mjs --url <url>\n" +
    "       cat article.txt | node scripts/generate-blueprint.mjs"
  );
  process.exit(1);
}

if (!content.trim()) { console.error("Error: input is empty."); process.exit(1); }

// ── Template reference ────────────────────────────────────────────────────────

const TEMPLATE_REFERENCE = `
## Available Graphic Templates (type: "graphic")

| ID | compositionId | Best For | Key Fields |
|----|--------------|----------|------------|
| T1 | OddsCard | Moneyline / spread / over-under | event, teamA{name,odds,role,color}, teamB{name,odds,role,color}, variant("two-way"/"three-way"), draw.odds |
| T2 | StatComparison | Side-by-side stat bars comparing two players or teams | entityA{name,color}, entityB{name,color}, stats[{label,valueA,valueB,suffix}] |
| T3 | BigNumber | Single dramatic stat with count-up | number(string), suffix, label, sublabel, color, countUp(bool) |
| T4 | Timeline | Line chart of a value over time | title, yLabel, color, points[{label,value,annotation}] |
| T5 | QuoteCard | Pull-quote with word-by-word reveal | quote, attribution, role, variant("standard"/"dramatic") |
| T6 | StandingsTable | Rankings table with a highlighted row | title, columns[string], rows[{rank,name,values[string],highlight}], highlightColor |
| T7 | Scoreboard | Final score with optional badge | teamA{name,score}, teamB{name,score}, event, date, badge(""/"UPSET"/"FINAL"/"OT") |
| T8 | ProbabilityViz | Percentage as donut or icon grid | percentage(0-100), label, sublabel, variant("donut"/"icon-grid"), color |
| T9 | PhotoStat | Stat overlay — shown alongside a photo or clip | headline, stats[{label,value}], photoSide("left"/"right"), accentColor |
| T10 | Explainer | Numbered methodology steps | title, steps[string], formula, accentColor |
| T11 | Comparable | "This is like that" historical analogy | subjectA{name,detail,stat}, subjectB{name,detail,stat}, connector, negated(bool) |
| T12 | LowerThird | Source / speaker credit bar | primary, secondary, accentColor, position("left"/"right") |
| T13 | HeatMap | Grid of cells with color intensity — two-axis pattern | title, xLabels[string], yLabels[string], data(number[][]), colorLow, colorHigh, showValues(bool) |
| T14 | ScatterPlot | X/Y scatter — find outliers and clusters | title, xLabel, yLabel, points[{label,x,y,color}], quadrants{topLeft,topRight,bottomLeft,bottomRight} |
| T15 | FlexTable | Flexible table — variable columns and rows | title, columns[{header,align("left"/"center"/"right")}], rows[{cells[string],highlight}], highlightColor, showRank(bool) |

### Color palette
- Yellow / positive: "#00c358"
- Red / negative:    "#E82020"
- White / neutral:   "#FFFFFF"
- Cyan / highlight:  "#00C8FF"

### Duration guide (durationInFrames at 30fps)
- 4s=120 | 5s=150 | 6s=180 | 7s=210 | 8s=240

## Non-Graphic Asset Types

Use these when a segment calls for video footage, photos, or archival material rather than a generated graphic.

| type | When to use | Required fields |
|------|-------------|-----------------|
| footage | Game or event video clip | description, searchTerms, durationSeconds |
| still | Photo, headshot, or image | description, searchTerms, durationSeconds |
| newspaper | Historical newspaper or magazine front page / article | description, searchTerms, era, durationSeconds |
| b_roll | Generic atmosphere footage (crowd, venue, warmup, slow-mo) | description, searchTerms, durationSeconds |
| external | Any other asset that doesn't fit above | description, durationSeconds |
`;

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a sports video producer specializing in evergreen, semi-faceless YouTube videos built around stats and storytelling.

Given raw source material (an article, stats, notes, or a mix), you will output a complete video blueprint JSON that:
1. Structures the content into 4–8 narrative "beats"
2. Maps each beat to one or more shots — these can be generated graphics OR real-world assets (footage, photos, newspaper clips)
3. Writes a tight narration script for a voiceover host

${TEMPLATE_REFERENCE}

## Blueprint JSON format

Return ONLY valid JSON, no markdown fences, no explanation.

{
  "title": "Short, punchy YouTube title",
  "description": "One sentence summary",
  "estimatedDurationSeconds": 90,
  "script": [
    {
      "beat": 1,
      "title": "Beat title",
      "narration": "Exact words the host says. Conversational, punchy, 2–5 sentences.",
      "notes": "Optional production note: pacing, music, tone cue, etc."
    }
  ],
  "beats": [
    {
      "id": 1,
      "title": "Beat title (matches script beat)",
      "shots": [
        {
          "type": "graphic",
          "compositionId": "BigNumber",
          "timeStart": "0:04",
          "durationSeconds": 5,
          "durationInFrames": 150,
          "data": { "number": "42", "suffix": "%", "label": "Completion Rate", "color": "#00c358", "countUp": true },
          "description": "Big number: 42% completion rate"
        },
        {
          "type": "footage",
          "timeStart": "0:09",
          "durationSeconds": 6,
          "description": "Game footage of the key play",
          "searchTerms": "specific searchable description for stock footage or archive"
        },
        {
          "type": "newspaper",
          "timeStart": "0:15",
          "durationSeconds": 4,
          "description": "Front page announcing the result",
          "searchTerms": "Newspaper name + date + headline keywords",
          "era": "1980"
        }
      ]
    }
  ]
}

## Rules
- Every beat in "script" must have a matching beat in "beats" (same id/beat number).
- A beat can have multiple shots — mix graphic and non-graphic freely.
- A beat can have zero shots if it's pure narration.
- timeStart values should be cumulative across all beats (treat the video as a continuous timeline).
- Use LowerThird (T12) when citing a source.
- Prefer concrete numbers over vague language in graphic data props.
- Keep narration under 60 words per beat so it fits the shot duration.
- Use "footage" or "b_roll" for opening hooks and transitions — the video doesn't have to start with a graphic.

## CRITICAL: Data fidelity
- ONLY use numbers, names, and facts explicitly stated in the source material.
- Do NOT invent data to fill a template.
- If a template needs data that isn't available, use a simpler template or skip the shot.
- Fewer shots with accurate data > more shots with invented data.
`;

// ── Call Claude ───────────────────────────────────────────────────────────────

const client = new Anthropic();

console.log("\n Generating video blueprint...\n");

const message = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 8192,
  system: SYSTEM_PROMPT,
  messages: [
    {
      role: "user",
      content: `Here is the source material. Generate a complete video blueprint JSON.\n\n---\n\n${content}`,
    },
  ],
});

const raw = message.content[0].text.trim();

// ── Parse + validate ──────────────────────────────────────────────────────────

let blueprint;
try {
  const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "");
  blueprint = JSON.parse(cleaned);
} catch {
  console.error("Failed to parse LLM response as JSON. Raw output:\n");
  console.error(raw);
  process.exit(1);
}

if (!blueprint.beats || !blueprint.script) {
  console.error("Response is missing required fields (beats, script).\n");
  console.error(JSON.stringify(blueprint, null, 2));
  process.exit(1);
}

// ── Write blueprint.json ──────────────────────────────────────────────────────

mkdirSync("out", { recursive: true });
writeFileSync(outFile, JSON.stringify(blueprint, null, 2));

// ── Build production-sheet.csv ────────────────────────────────────────────────

// Map beat id → narration from script array
const narrationByBeat = {};
for (const s of blueprint.script ?? []) {
  narrationByBeat[s.beat] = s.narration ?? "";
}

const csvRows = [];
const CSV_HEADER = [
  "timestamp",
  "duration_sec",
  "beat",
  "beat_title",
  "narration",
  "visual_type",
  "visual_description",
  "file_reference",
  "search_terms",
  "notes",
];
csvRows.push(CSV_HEADER);

function csvEscape(v) {
  const s = String(v ?? "").replace(/\r?\n/g, " ").replace(/"/g, '""');
  return `"${s}"`;
}

let shotIndex = 0;
for (const beat of blueprint.beats ?? []) {
  const narration = narrationByBeat[beat.id] ?? "";
  const shots = beat.shots ?? [];

  if (shots.length === 0) {
    // Narration-only beat — still add a row with no visual
    csvRows.push([
      csvEscape(""),
      csvEscape(""),
      csvEscape(beat.id),
      csvEscape(beat.title),
      csvEscape(narration),
      csvEscape("narration_only"),
      csvEscape(""),
      csvEscape(""),
      csvEscape(""),
      csvEscape(""),
    ]);
    continue;
  }

  for (const shot of shots) {
    shotIndex++;
    const beatShotNum = shots.indexOf(shot) + 1;
    const timeStart = shot.timeStart ?? "";
    const durSec = shot.durationSeconds ?? (shot.durationInFrames ? Math.round(shot.durationInFrames / 30) : "");
    const timeEnd = timeStart && durSec
      ? (() => {
          const [m, s] = timeStart.split(":").map(Number);
          const totalSec = m * 60 + s + Number(durSec);
          return `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, "0")}`;
        })()
      : "";
    const timestamp = timeStart && timeEnd ? `${timeStart}–${timeEnd}` : timeStart || "";

    let fileRef = "";
    let searchTerms = shot.searchTerms ?? "";

    if (shot.type === "graphic") {
      const beatNum = String(beat.id).padStart(2, "0");
      const shotNum = String(beatShotNum).padStart(2, "0");
      fileRef = `insert beat-${beatNum}-shot-${shotNum}-${shot.compositionId ?? "graphic"}.mov`;
      searchTerms = "";
    } else {
      fileRef = `[source needed]`;
    }

    const description = shot.description ?? (shot.type === "graphic" ? `${shot.compositionId} graphic` : "");
    const era = shot.era ? ` (era: ${shot.era})` : "";

    csvRows.push([
      csvEscape(timestamp),
      csvEscape(durSec),
      csvEscape(beat.id),
      csvEscape(beat.title),
      csvEscape(shots.indexOf(shot) === 0 ? narration : ""),  // only first shot of beat gets narration
      csvEscape(shot.type ?? "graphic"),
      csvEscape(`${description}${era}`),
      csvEscape(fileRef),
      csvEscape(searchTerms),
      csvEscape(""),
    ]);
  }
}

const csvContent = csvRows.map(r => r.join(",")).join("\n");
writeFileSync(outCsv, csvContent);

// ── Console summary ───────────────────────────────────────────────────────────

const allShots = blueprint.beats.flatMap(b => b.shots ?? []);
const graphicShots = allShots.filter(s => s.type === "graphic" || !s.type);
const assetShots = allShots.filter(s => s.type && s.type !== "graphic");

console.log(`Blueprint saved:          ${outFile}`);
console.log(`Production sheet saved:   ${outCsv}`);
console.log(`  ${blueprint.beats.length} beats`);
console.log(`  ${graphicShots.length} graphics  |  ${assetShots.length} assets (footage/stills/etc.)`);
console.log(`  ~${blueprint.estimatedDurationSeconds ?? "?"}s total`);
console.log(`\nTitle: ${blueprint.title}`);
console.log(`\nScript preview:\n`);
for (const beat of blueprint.script) {
  console.log(`  [Beat ${beat.beat}] ${beat.title}`);
  console.log(`  "${beat.narration.slice(0, 80)}${beat.narration.length > 80 ? "…" : ""}"`);
  console.log();
}

console.log(`\nNext steps:`);
console.log(`  Render graphics:    npm run render:blueprint -- ${outFile}`);
console.log(`  Review sheet:       open ${outCsv}\n`);
