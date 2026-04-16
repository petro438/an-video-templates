#!/usr/bin/env node
/**
 * Render Server — local HTTP server for one-click rendering from the builder UI.
 *
 * Start:   node scripts/render-server.mjs
 * Port:    3002
 *
 * POST /render  { compositionId, props, durationInFrames? }  → { jobId }
 * GET  /status/:jobId                                         → { state, jobId, outputPath?, error?, log }
 * GET  /jobs                                                  → [ ...jobs ]
 */

import { createServer } from "http";
import { spawn } from "child_process";
import { mkdirSync } from "fs";
import { resolve } from "path";
import { randomUUID } from "crypto";

const PORT = 3002;
const PROJECT_ROOT = resolve(process.cwd());
const OUT_DIR = resolve(PROJECT_ROOT, "out");
mkdirSync(OUT_DIR, { recursive: true });

// ── In-memory job store ────────────────────────────────────────────────────────

const jobs = new Map();

// ── HTTP helpers ───────────────────────────────────────────────────────────────

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function send(res, status, data) {
  cors(res);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((ok, fail) => {
    let raw = "";
    req.on("data", c => (raw += c));
    req.on("end", () => {
      try { ok(JSON.parse(raw)); }
      catch { fail(new Error("Invalid JSON body")); }
    });
    req.on("error", fail);
  });
}

// ── Render logic ───────────────────────────────────────────────────────────────

function startRender(job) {
  const { jobId, compositionId, props, durationInFrames, outputPath } = job;
  job.state = "rendering";

  const args = [
    "remotion", "render",
    "src/index.ts",
    compositionId,
    outputPath,
    `--props=${JSON.stringify(props)}`,
    "--log=warn",
  ];

  const child = spawn("npx", args, {
    cwd: PROJECT_ROOT,
    env: process.env,
    shell: true,
  });

  child.stdout.on("data", d => {
    const line = d.toString().trimEnd();
    if (line) job.log.push(line);
  });
  child.stderr.on("data", d => {
    const line = d.toString().trimEnd();
    if (line) job.log.push(line);
  });

  child.on("close", code => {
    if (code === 0) {
      job.state = "done";
      console.log(`  ✅ Job ${jobId} done → ${outputPath}`);
    } else {
      job.state = "error";
      job.error = `Render exited with code ${code}`;
      console.log(`  ❌ Job ${jobId} failed (code ${code})`);
    }
  });

  child.on("error", e => {
    job.state = "error";
    job.error = e.message;
    console.log(`  ❌ Job ${jobId} error: ${e.message}`);
  });
}

// ── Request router ─────────────────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  // Preflight
  if (req.method === "OPTIONS") {
    cors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  // POST /render
  if (req.method === "POST" && req.url === "/render") {
    let body;
    try { body = await readBody(req); }
    catch (e) { return send(res, 400, { error: e.message }); }

    const { compositionId, props = {}, durationInFrames } = body;
    if (!compositionId) return send(res, 400, { error: "compositionId is required" });

    const jobId = randomUUID();
    const ts = Date.now();
    const outputPath = resolve(OUT_DIR, `${compositionId}-${ts}.mp4`);

    const job = {
      jobId,
      state: "queued",
      compositionId,
      props,
      durationInFrames,
      outputPath,
      log: [],
      createdAt: new Date(ts).toISOString(),
    };

    jobs.set(jobId, job);
    console.log(`  🎬 Render queued: ${compositionId} → ${outputPath}`);

    // Kick off asynchronously so we can respond immediately
    setImmediate(() => startRender(job));

    return send(res, 200, { jobId });
  }

  // GET /status/:jobId
  const statusMatch = req.url?.match(/^\/status\/([a-zA-Z0-9-]+)$/);
  if (req.method === "GET" && statusMatch) {
    const job = jobs.get(statusMatch[1]);
    if (!job) return send(res, 404, { error: "Job not found" });
    return send(res, 200, {
      jobId: job.jobId,
      state: job.state,
      compositionId: job.compositionId,
      outputPath: job.outputPath,
      error: job.error,
      log: job.log.slice(-20), // last 20 lines
      createdAt: job.createdAt,
    });
  }

  // GET /jobs
  if (req.method === "GET" && req.url === "/jobs") {
    const list = [...jobs.values()].map(j => ({
      jobId: j.jobId, state: j.state, compositionId: j.compositionId,
      outputPath: j.outputPath, createdAt: j.createdAt,
    }));
    return send(res, 200, list);
  }

  send(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`\n🎬 Render server running at http://localhost:${PORT}`);
  console.log(`   Project root: ${PROJECT_ROOT}`);
  console.log(`   Output dir:   ${OUT_DIR}\n`);
  console.log("  POST /render  { compositionId, props, durationInFrames? }");
  console.log("  GET  /status/:jobId\n");
});
