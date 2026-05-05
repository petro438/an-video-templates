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
import { mkdirSync, writeFileSync, unlinkSync, existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { randomUUID } from "crypto";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";

const PORT = 3100;
const PROJECT_ROOT = resolve(process.cwd());
const OUT_DIR = resolve(PROJECT_ROOT, "out");
const BROLL_DIR = resolve(OUT_DIR, "broll");
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(BROLL_DIR, { recursive: true });

// Load .env so /tools/pexels/* and spawned scripts have keys available
const envPath = resolve(PROJECT_ROOT, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
}

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

  const propsFile = resolve(OUT_DIR, `.props-${jobId}.json`);
  writeFileSync(propsFile, JSON.stringify(props));

  const args = [
    "remotion", "render",
    "src/index.ts",
    compositionId,
    outputPath,
    `--props=${propsFile}`,
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
    try { unlinkSync(propsFile); } catch {}
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

  // POST /upload — save image to public/uploads, return URL
  if (req.method === "POST" && req.url === "/upload") {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => {
      try {
        const buf = Buffer.concat(chunks);
        const boundary = req.headers["content-type"]?.match(/boundary=(.+)/)?.[1];
        if (!boundary) return send(res, 400, { error: "Missing multipart boundary" });

        const raw = buf.toString("binary");
        const parts = raw.split("--" + boundary).filter(p => p.includes("filename="));
        if (parts.length === 0) return send(res, 400, { error: "No file in upload" });

        const part = parts[0];
        const filenameMatch = part.match(/filename="([^"]+)"/);
        const filename = (filenameMatch?.[1] || "upload.png").replace(/[^a-zA-Z0-9._-]/g, "_");
        const ts = Date.now();
        const dest = `${ts}-${filename}`;

        const headerEnd = part.indexOf("\r\n\r\n");
        const bodyStart = headerEnd + 4;
        const bodyEnd = part.lastIndexOf("\r\n");
        const fileData = Buffer.from(part.slice(bodyStart, bodyEnd), "binary");

        const uploadDir = resolve(PROJECT_ROOT, "public", "uploads");
        mkdirSync(uploadDir, { recursive: true });
        writeFileSync(resolve(uploadDir, dest), fileData);

        console.log(`  📎 Uploaded: public/uploads/${dest} (${fileData.length} bytes)`);
        return send(res, 200, { path: `/uploads/${dest}`, filename: dest });
      } catch (e) {
        return send(res, 500, { error: e.message });
      }
    });
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

  // ── Tools: Pexels b-roll search ───────────────────────────────────────────
  if (req.method === "POST" && req.url === "/tools/pexels/search") {
    let body;
    try { body = await readBody(req); } catch (e) { return send(res, 400, { error: e.message }); }
    const { query, perPage = 12, orientation } = body;
    if (!process.env.PEXELS_API_KEY) return send(res, 400, { error: "Missing PEXELS_API_KEY in .env" });
    if (!query) return send(res, 400, { error: "query is required" });

    const params = new URLSearchParams({ query, per_page: String(perPage) });
    if (orientation) params.set("orientation", orientation);
    try {
      const r = await fetch(`https://api.pexels.com/videos/search?${params}`, {
        headers: { Authorization: process.env.PEXELS_API_KEY },
      });
      if (!r.ok) return send(res, r.status, { error: `Pexels: ${await r.text()}` });
      const data = await r.json();
      // Trim payload to what the UI needs
      const videos = (data.videos ?? []).map(v => ({
        id: v.id,
        url: v.url,
        duration: v.duration,
        width: v.width,
        height: v.height,
        image: v.image,
        user: { name: v.user?.name, url: v.user?.url },
        files: (v.video_files ?? []).filter(f => f.file_type === "video/mp4").map(f => ({
          quality: f.quality, width: f.width, height: f.height, link: f.link,
        })),
      }));
      return send(res, 200, { videos });
    } catch (e) { return send(res, 500, { error: e.message }); }
  }

  // ── Tools: Pexels download ────────────────────────────────────────────────
  if (req.method === "POST" && req.url === "/tools/pexels/download") {
    let body;
    try { body = await readBody(req); } catch (e) { return send(res, 400, { error: e.message }); }
    const { id, link, query = "broll", width, height } = body;
    if (!id || !link) return send(res, 400, { error: "id and link are required" });

    const slug = String(query).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "broll";
    const outPath = resolve(BROLL_DIR, `${id}-${slug}-${width}x${height}.mp4`);
    try {
      const r = await fetch(link);
      if (!r.ok || !r.body) return send(res, r.status || 500, { error: `Download failed: ${r.status}` });
      await pipeline(r.body, createWriteStream(outPath));
      console.log(`  📥 Pexels: ${outPath}`);
      return send(res, 200, { path: outPath });
    } catch (e) { return send(res, 500, { error: e.message }); }
  }

  // ── Tools: Blueprint generation ───────────────────────────────────────────
  if (req.method === "POST" && req.url === "/tools/blueprint/generate") {
    let body;
    try { body = await readBody(req); } catch (e) { return send(res, 400, { error: e.message }); }
    const { text, url } = body;
    if (!text && !url) return send(res, 400, { error: "Provide either text or url" });
    if (!process.env.ANTHROPIC_API_KEY) return send(res, 400, { error: "Missing ANTHROPIC_API_KEY in .env" });

    const jobId = randomUUID();
    const ts = Date.now();
    const outputPath = resolve(OUT_DIR, `blueprint-${ts}.json`);
    const job = {
      jobId, state: "queued", kind: "blueprint",
      outputPath, log: [], createdAt: new Date(ts).toISOString(),
    };
    jobs.set(jobId, job);
    setImmediate(() => startBlueprint(job, { text, url }));
    return send(res, 200, { jobId });
  }

  send(res, 404, { error: "Not found" });
});

// ── Blueprint job runner ────────────────────────────────────────────────────

function startBlueprint(job, { text, url }) {
  job.state = "running";
  const args = ["scripts/generate-blueprint.mjs", "--out", job.outputPath];
  if (url) args.push("--url", url);

  const child = spawn("node", args, {
    cwd: PROJECT_ROOT,
    env: process.env,
  });

  if (text && !url) child.stdin.end(text);

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
      console.log(`  ✅ Blueprint job ${job.jobId} → ${job.outputPath}`);
    } else {
      job.state = "error";
      job.error = `Blueprint script exited with code ${code}`;
    }
  });
  child.on("error", e => { job.state = "error"; job.error = e.message; });
}

server.listen(PORT, () => {
  console.log(`\n🎬 Render server running at http://localhost:${PORT}`);
  console.log(`   Project root: ${PROJECT_ROOT}`);
  console.log(`   Output dir:   ${OUT_DIR}\n`);
  console.log("  POST /render  { compositionId, props, durationInFrames? }");
  console.log("  GET  /status/:jobId\n");
});
