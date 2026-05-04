#!/usr/bin/env node

/**
 * Fetch trimmed clips from a CSV of YouTube URLs + timestamps.
 *
 * CSV columns (header required): url,start,end,label
 *   - start/end: HH:MM:SS, MM:SS, or raw seconds
 *   - label: used in output filename (slugified); blank → derived from URL
 *
 * Usage:
 *   node scripts/fetch-clips.mjs inputs/clips.csv
 *   node scripts/fetch-clips.mjs inputs/clips.csv --out out/clips --concurrency 6
 */

import { spawn } from "child_process";
import { mkdirSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";

const args = process.argv.slice(2);
const csvPath = args.find((a) => !a.startsWith("--"));
const outDir = getFlag("--out") ?? "out/clips";
const concurrency = Number(getFlag("--concurrency") ?? 4);

if (!csvPath) {
  console.error("Usage: node scripts/fetch-clips.mjs <csv> [--out dir] [--concurrency N]");
  process.exit(1);
}
if (!existsSync(csvPath)) {
  console.error(`CSV not found: ${csvPath}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const rows = parseCsv(readFileSync(csvPath, "utf8"));
if (rows.length === 0) {
  console.error("No rows in CSV.");
  process.exit(1);
}

console.log(`\n📥 Fetching ${rows.length} clips → ${outDir} (concurrency: ${concurrency})\n`);

const results = { ok: 0, fail: 0 };
let cursor = 0;

await Promise.all(
  Array.from({ length: Math.min(concurrency, rows.length) }, () => worker())
);

console.log(`\n${results.ok} succeeded, ${results.fail} failed.\n`);
process.exit(results.fail > 0 ? 1 : 0);

async function worker() {
  while (cursor < rows.length) {
    const i = cursor++;
    const row = rows[i];
    const tag = `[${i + 1}/${rows.length}]`;
    try {
      const file = await fetchClip(row, i);
      console.log(`${tag} ✓ ${file}`);
      results.ok++;
    } catch (err) {
      console.error(`${tag} ✗ ${row.url} (${row.start}-${row.end}): ${err.message}`);
      results.fail++;
    }
  }
}

function fetchClip(row, idx) {
  return new Promise((res, rej) => {
    const start = toSeconds(row.start);
    const end = toSeconds(row.end);
    if (!(end > start)) return rej(new Error(`bad range ${row.start}-${row.end}`));

    const slug = slugify(row.label || `clip-${idx + 1}`);
    const outPath = resolve(outDir, `${String(idx + 1).padStart(3, "0")}-${slug}.mp4`);

    const ytArgs = [
      "--download-sections", `*${start}-${end}`,
      "--force-keyframes-at-cuts",
      "-f", "bv*[ext=mp4][height<=1080]+ba[ext=m4a]/b[ext=mp4]/b",
      "--merge-output-format", "mp4",
      "-o", outPath,
      "--no-playlist",
      "--no-warnings",
      "--quiet",
      row.url,
    ];

    const proc = spawn("yt-dlp", ytArgs, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", rej);
    proc.on("close", (code) => {
      if (code === 0) res(outPath);
      else rej(new Error(stderr.trim().split("\n").pop() || `yt-dlp exit ${code}`));
    });
  });
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#"));
  const header = lines.shift().split(",").map((s) => s.trim().toLowerCase());
  const need = ["url", "start", "end"];
  for (const k of need) {
    if (!header.includes(k)) throw new Error(`CSV missing column: ${k}`);
  }
  return lines.map((line) => {
    const cells = splitCsvLine(line);
    const row = {};
    header.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { out.push(cur); cur = ""; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

function toSeconds(v) {
  if (v == null || v === "") return NaN;
  const s = String(v).trim();
  if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
  const parts = s.split(":").map(Number);
  if (parts.some(Number.isNaN)) return NaN;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return NaN;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "clip";
}

function getFlag(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}
