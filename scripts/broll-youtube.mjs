#!/usr/bin/env node

/**
 * Search YouTube for b-roll candidates by topic.
 *
 * Pipeline:
 *   1. Search YouTube Data API for the query
 *   2. Fetch auto-captions for each candidate (via yt-dlp)
 *   3. Find transcript segments matching query keywords
 *   4. Print a list with click-to-confirm timestamp links
 *   5. Write a candidates CSV ready for `npm run fetch:clips`
 *
 * Usage:
 *   node scripts/broll-youtube.mjs "inside of a sportsbook"
 *   node scripts/broll-youtube.mjs "..." --max 8 --padding 5 --out inputs/yt-candidates.csv
 *
 * Requires:
 *   - YOUTUBE_API_KEY in .env (free at console.cloud.google.com, enable YouTube Data API v3)
 *   - yt-dlp on PATH (caption fetching)
 *
 * Caveats:
 *   - Pure visual b-roll often isn't narrated, so transcript matches lean toward
 *     tours / explainers / commentary, not silent footage.
 *   - Auto-captions are noisy.
 *   - License is "all rights reserved" by default — use accordingly.
 */

import { spawn } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { tmpdir } from "os";

// ── Load .env ─────────────────────────────────────────────────────────────────

const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
}

const KEY = process.env.YOUTUBE_API_KEY;
if (!KEY) {
  console.error("Missing YOUTUBE_API_KEY. Enable YouTube Data API v3 at console.cloud.google.com and add to .env");
  process.exit(1);
}

// ── Args ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const query = args.find((a) => !a.startsWith("--"));
const maxResults = numFlag("--max") ?? 5;
const padding = numFlag("--padding") ?? 3;
const outCsv = getFlag("--out") ?? "inputs/yt-candidates.csv";

if (!query) {
  console.error('Usage: node scripts/broll-youtube.mjs "<query>" [--max N] [--padding sec] [--out path.csv]');
  process.exit(1);
}

// ── 1. YouTube search ─────────────────────────────────────────────────────────

const STOP = new Set("a an the of in on at to for and or with from by is are was were be been being this that these those it its as".split(" "));
const keywords = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2 && !STOP.has(w));
if (keywords.length === 0) {
  console.error("Query has no searchable keywords after stopword removal.");
  process.exit(1);
}

console.log(`\n🔎 Searching YouTube for "${query}" (max ${maxResults})...\n`);

const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
searchUrl.searchParams.set("part", "snippet");
searchUrl.searchParams.set("q", query);
searchUrl.searchParams.set("type", "video");
searchUrl.searchParams.set("videoCaption", "closedCaption");
searchUrl.searchParams.set("maxResults", String(maxResults));
searchUrl.searchParams.set("key", KEY);

const searchRes = await fetch(searchUrl);
if (!searchRes.ok) {
  console.error(`YouTube API ${searchRes.status}: ${await searchRes.text()}`);
  process.exit(1);
}
const search = await searchRes.json();
const videos = (search.items ?? []).map((it) => ({
  id: it.id.videoId,
  title: it.snippet.title,
  channel: it.snippet.channelTitle,
  url: `https://www.youtube.com/watch?v=${it.id.videoId}`,
}));

if (videos.length === 0) {
  console.error("No results.");
  process.exit(1);
}

// ── 2. Fetch captions in parallel ─────────────────────────────────────────────

const tmpRoot = resolve(tmpdir(), `yt-broll-${Date.now()}`);
mkdirSync(tmpRoot, { recursive: true });

const captioned = await Promise.all(videos.map(async (v) => {
  const vtt = await fetchCaptions(v.id, tmpRoot);
  return { ...v, segments: vtt ? parseVtt(vtt) : [] };
}));

// ── 3. Score & extract matches ────────────────────────────────────────────────

const candidates = [];
for (const v of captioned) {
  const matches = findMatches(v.segments, keywords, padding);
  for (const m of matches) {
    candidates.push({
      ...v,
      ...m,
      tsUrl: `https://youtu.be/${v.id}?t=${Math.floor(m.start)}`,
    });
  }
}

candidates.sort((a, b) => b.score - a.score);

if (candidates.length === 0) {
  console.error("No transcript matches in any candidate. Try different wording, or --max higher.");
  rmSync(tmpRoot, { recursive: true, force: true });
  process.exit(1);
}

// ── 4. Print + 5. Write CSV ───────────────────────────────────────────────────

console.log(`Found ${candidates.length} match${candidates.length === 1 ? "" : "es"} across ${captioned.filter((c) => c.segments.length).length} captioned video${captioned.length === 1 ? "" : "s"}:\n`);
candidates.slice(0, 20).forEach((c, i) => {
  console.log(`  ${String(i + 1).padStart(2)}. [score ${c.score}] ${c.title}`);
  console.log(`      channel: ${c.channel}`);
  console.log(`      "${c.snippet}"`);
  console.log(`      confirm: ${c.tsUrl}\n`);
});

mkdirSync(dirname(resolve(outCsv)), { recursive: true });
const header = "url,start,end,label\n";
const rows = candidates.map((c) =>
  [c.url, fmtTime(c.start), fmtTime(c.end), csvEscape(slugify(c.title) + "-" + Math.floor(c.start))].join(",")
).join("\n");
writeFileSync(outCsv, header + rows + "\n");

console.log(`📝 Wrote ${candidates.length} candidates to ${outCsv}`);
console.log(`   Edit/prune the CSV, then: npm run fetch:clips -- ${outCsv}\n`);

rmSync(tmpRoot, { recursive: true, force: true });

// ── Helpers ───────────────────────────────────────────────────────────────────

function fetchCaptions(videoId, dir) {
  return new Promise((res) => {
    const proc = spawn("yt-dlp", [
      "--write-auto-subs", "--sub-langs", "en.*,en",
      "--sub-format", "vtt", "--skip-download",
      "-o", resolve(dir, `${videoId}.%(ext)s`),
      "--quiet", "--no-warnings",
      `https://www.youtube.com/watch?v=${videoId}`,
    ], { stdio: "ignore" });
    proc.on("error", () => res(null));
    proc.on("close", () => {
      // yt-dlp picks a language suffix like .en.vtt or .en-US.vtt
      try {
        const files = readdirSync(dir).filter((f) => f.startsWith(videoId) && f.endsWith(".vtt"));
        res(files[0] ? readFileSync(resolve(dir, files[0]), "utf-8") : null);
      } catch {
        res(null);
      }
    });
  });
}

function parseVtt(text) {
  const segs = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s+-->\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
    if (!m) continue;
    const start = +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000;
    const end = +m[5] * 3600 + +m[6] * 60 + +m[7] + +m[8] / 1000;
    const text = [];
    while (++i < lines.length && lines[i].trim()) text.push(lines[i]);
    const cleaned = text.join(" ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (cleaned) segs.push({ start, end, text: cleaned });
  }
  // VTT auto-captions overlap heavily; dedupe consecutive identical text
  return segs.filter((s, i) => i === 0 || s.text !== segs[i - 1].text);
}

function findMatches(segments, keywords, pad) {
  const matches = [];
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const lc = s.text.toLowerCase();
    const hits = keywords.filter((k) => lc.includes(k));
    if (hits.length === 0) continue;
    // Merge with adjacent segment if it also matches
    let end = s.end;
    let combined = s.text;
    let score = hits.length;
    while (i + 1 < segments.length) {
      const nextLc = segments[i + 1].text.toLowerCase();
      const nextHits = keywords.filter((k) => nextLc.includes(k));
      if (nextHits.length === 0 && segments[i + 1].start - end > 2) break;
      if (nextHits.length === 0) break;
      i++;
      end = segments[i].end;
      combined += " " + segments[i].text;
      score += nextHits.length;
    }
    matches.push({
      start: Math.max(0, s.start - pad),
      end: end + pad,
      snippet: combined.slice(0, 140),
      score,
    });
  }
  return matches;
}

function fmtTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = (sec % 60).toFixed(1);
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(4, "0")}` : `${m}:${String(s).padStart(4, "0")}`;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "yt";
}

function csvEscape(s) {
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function getFlag(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

function numFlag(name) {
  const v = getFlag(name);
  return v == null ? undefined : Number(v);
}
