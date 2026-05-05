#!/usr/bin/env node

/**
 * Search Pexels for stock b-roll, list candidates with preview links,
 * and optionally download one.
 *
 * Usage:
 *   node scripts/broll-pexels.mjs "inside of a sportsbook"
 *     → lists top results with preview URLs so you can confirm in browser
 *
 *   node scripts/broll-pexels.mjs "inside of a sportsbook" --download 1
 *     → downloads the Nth result (1-indexed) to out/broll/
 *
 *   node scripts/broll-pexels.mjs --id 5752729
 *     → downloads a specific Pexels video by ID
 *
 *   node scripts/broll-pexels.mjs "..." --per-page 20 --orientation landscape
 *
 * Requires: PEXELS_API_KEY environment variable (free at pexels.com/api).
 */

import { createWriteStream, existsSync, mkdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { pipeline } from "stream/promises";

// ── Load .env ─────────────────────────────────────────────────────────────────

const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) process.env[match[1]] ??= match[2].replace(/^["']|["']$/g, "");
  }
}

const KEY = process.env.PEXELS_API_KEY;
if (!KEY) {
  console.error("Missing PEXELS_API_KEY. Get a free key at https://www.pexels.com/api/ and add to .env");
  process.exit(1);
}

// ── Args ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const query = args.find((a) => !a.startsWith("--"));
const downloadIdx = numFlag("--download");
const directId = getFlag("--id");
const perPage = numFlag("--per-page") ?? 10;
const orientation = getFlag("--orientation"); // landscape | portrait | square
const outDir = getFlag("--out") ?? "out/broll";

if (!query && !directId) {
  console.error('Usage: node scripts/broll-pexels.mjs "<query>" [--download N] [--per-page N] [--orientation landscape]');
  console.error('   or: node scripts/broll-pexels.mjs --id <pexels-video-id>');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

// ── Direct download by ID ─────────────────────────────────────────────────────

if (directId) {
  const video = await pexels(`/videos/videos/${directId}`);
  await downloadVideo(video);
  process.exit(0);
}

// ── Search ────────────────────────────────────────────────────────────────────

const params = new URLSearchParams({ query, per_page: String(perPage) });
if (orientation) params.set("orientation", orientation);

const data = await pexels(`/videos/search?${params}`);
const videos = data.videos ?? [];

if (videos.length === 0) {
  console.error(`No results for "${query}".`);
  process.exit(1);
}

console.log(`\n🎥 ${videos.length} result${videos.length === 1 ? "" : "s"} for "${query}":\n`);
videos.forEach((v, i) => {
  const dur = `${v.duration}s`;
  const dims = `${v.width}×${v.height}`;
  const credit = v.user?.name ?? "unknown";
  console.log(`  ${String(i + 1).padStart(2)}. ${dims}  ${dur.padEnd(5)}  by ${credit}`);
  console.log(`      preview: ${v.url}`);
});

if (downloadIdx == null) {
  console.log(`\nTo download: rerun with --download N (1–${videos.length})`);
  console.log(`             or --id <id> after picking from preview links above\n`);
  process.exit(0);
}

if (downloadIdx < 1 || downloadIdx > videos.length) {
  console.error(`--download ${downloadIdx} out of range (1–${videos.length})`);
  process.exit(1);
}

await downloadVideo(videos[downloadIdx - 1]);

// ── Helpers ───────────────────────────────────────────────────────────────────

async function pexels(path) {
  const res = await fetch(`https://api.pexels.com${path}`, {
    headers: { Authorization: KEY },
  });
  if (!res.ok) throw new Error(`Pexels API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function downloadVideo(video) {
  const file = pickBestFile(video.video_files);
  if (!file) throw new Error("No downloadable file on this video");

  const slug = slugify(query || `pexels-${video.id}`);
  const outPath = resolve(outDir, `${video.id}-${slug}-${file.width}x${file.height}.mp4`);

  console.log(`\n⬇  Downloading ${file.width}×${file.height} ${file.quality} → ${outPath}`);
  const res = await fetch(file.link);
  if (!res.ok || !res.body) throw new Error(`Download failed: ${res.status}`);
  await pipeline(res.body, createWriteStream(outPath));
  console.log(`✓ Done. Credit: ${video.user?.name} (${video.user?.url})\n`);
}

function pickBestFile(files = []) {
  // Prefer mp4, prefer "hd"/"sd" labeled, then highest resolution under 1080p.
  const mp4s = files.filter((f) => f.file_type === "video/mp4");
  if (mp4s.length === 0) return null;
  const ranked = [...mp4s].sort((a, b) => {
    const ah = a.height || 0;
    const bh = b.height || 0;
    const aOk = ah <= 1080 ? ah : ah - 10000; // demote >1080p
    const bOk = bh <= 1080 ? bh : bh - 10000;
    return bOk - aOk;
  });
  return ranked[0];
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "broll";
}

function getFlag(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

function numFlag(name) {
  const v = getFlag(name);
  return v == null ? undefined : Number(v);
}
