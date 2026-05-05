import React, { useState, useEffect, useRef } from "react";

const C = {
  bg: "#0D0D0D", surface: "#161616", s2: "#1E1E1E", s3: "#282828",
  card: "#1A1A1A", green: "#00C358", red: "#E5393B", orange: "#FF8C00",
  gold: "#FFD600", blue: "#2D6CDF", white: "#FFF", t1: "#FFF",
  t2: "#A0A0A0", t3: "#666", t4: "#3A3A3A", brd: "#262626", brdL: "#333",
};
const F = {
  d: "'Barlow Condensed','Arial Narrow',sans-serif",
  s: "'Bebas Neue','Impact',sans-serif",
  b: "'Barlow','Helvetica Neue',sans-serif",
  m: "'IBM Plex Mono','SF Mono',monospace",
};
const IS = { background: C.s2, border: `1px solid ${C.brd}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: C.white, width: "100%", fontFamily: F.b, outline: "none", boxSizing: "border-box" };
const BS = { background: C.s3, border: `1px solid ${C.brd}`, borderRadius: 6, padding: "8px 16px", color: C.white, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: F.b };
const SERVER = "http://localhost:3100";

export default function Tools() {
  const [serverOk, setServerOk] = useState(null);
  useEffect(() => {
    fetch(`${SERVER}/jobs`).then(() => setServerOk(true)).catch(() => setServerOk(false));
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: "calc(100vh - 49px)", color: C.white, fontFamily: F.b, padding: "32px 48px", overflowY: "auto" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <ServerStatus ok={serverOk} />

        <Section title="B-Roll Search (Pexels)" subtitle="Search Pexels' free stock library and download clips directly into out/broll/.">
          <PexelsTool disabled={serverOk !== true} />
        </Section>

        <Section title="Article → Blueprint" subtitle="Paste article text or a URL. Generates a structured blueprint JSON ready for `npm run render:blueprint`.">
          <BlueprintTool disabled={serverOk !== true} />
        </Section>

        <Section title="More tools" subtitle="These remain CLI-only for now.">
          <CliNote
            title="YouTube b-roll search"
            cmd={`npm run broll:yt -- "your search query"`}
            note="Searches YouTube, scans transcripts, writes a candidate CSV ready for fetch:clips."
          />
          <CliNote
            title="Batch trimmed clip downloads"
            cmd={`npm run fetch:clips -- inputs/your-clips.csv`}
            note="Reads url,start,end,label from a CSV and downloads trimmed clips in parallel."
          />
        </Section>

        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    </div>
  );
}

// ── Shared bits ─────────────────────────────────────────────────────────────

function ServerStatus({ ok }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, padding: "10px 14px", background: C.s2, border: `1px solid ${C.brd}`, borderRadius: 8 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: ok === true ? C.green : ok === false ? C.red : C.t4 }} />
      <div style={{ fontSize: 12, color: C.t2, fontFamily: F.m }}>
        {ok === true ? "Render server connected (port 3100)"
          : ok === false ? <>Render server offline — run <code style={{ background: C.s3, padding: "2px 6px", borderRadius: 4 }}>npm run render-server</code> or use start.command</>
            : "Checking render server…"}
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: F.d, fontSize: 22, fontWeight: 800, letterSpacing: "0.02em", margin: "0 0 4px" }}>{title}</h2>
      {subtitle && <p style={{ color: C.t3, fontSize: 13, margin: "0 0 16px" }}>{subtitle}</p>}
      <div style={{ background: C.s2, border: `1px solid ${C.brd}`, borderRadius: 10, padding: 20 }}>
        {children}
      </div>
    </div>
  );
}

function CliNote({ title, cmd, note }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: C.t3, marginBottom: 8 }}>{note}</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <code style={{ flex: 1, background: C.bg, border: `1px solid ${C.brd}`, borderRadius: 6, padding: "8px 12px", fontFamily: F.m, fontSize: 12, color: C.t2 }}>{cmd}</code>
        <button style={{ ...BS, background: copied ? C.green : C.s3 }} onClick={() => { navigator.clipboard?.writeText(cmd); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

// ── Pexels b-roll ───────────────────────────────────────────────────────────

function PexelsTool({ disabled }) {
  const [query, setQuery] = useState("");
  const [orientation, setOrientation] = useState("");
  const [results, setResults] = useState(null); // null | array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState({}); // { videoId: "downloading" | path | "error:msg" }

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(null); setResults(null);
    try {
      const r = await fetch(`${SERVER}/tools/pexels/search`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, perPage: 12, orientation: orientation || undefined }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `${r.status}`);
      setResults(data.videos);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const download = async (video) => {
    const file = pickBestFile(video.files);
    if (!file) { setDownloading(d => ({ ...d, [video.id]: "error:no mp4 file" })); return; }
    setDownloading(d => ({ ...d, [video.id]: "downloading" }));
    try {
      const r = await fetch(`${SERVER}/tools/pexels/download`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: video.id, link: file.link, query, width: file.width, height: file.height }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `${r.status}`);
      setDownloading(d => ({ ...d, [video.id]: data.path }));
    } catch (e) {
      setDownloading(d => ({ ...d, [video.id]: `error:${e.message}` }));
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          placeholder='e.g. "inside of a sportsbook"'
          style={IS} disabled={disabled}
        />
        <select value={orientation} onChange={e => setOrientation(e.target.value)} style={{ ...IS, width: 140 }} disabled={disabled}>
          <option value="">any</option>
          <option value="landscape">landscape</option>
          <option value="portrait">portrait</option>
          <option value="square">square</option>
        </select>
        <button onClick={search} disabled={disabled || loading || !query.trim()}
          style={{ ...BS, background: C.green, color: C.bg, opacity: (disabled || loading || !query.trim()) ? 0.5 : 1, padding: "8px 24px" }}>
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{error}</div>}

      {results && results.length === 0 && <div style={{ color: C.t3, fontSize: 13 }}>No results.</div>}

      {results && results.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {results.map(v => {
            const dl = downloading[v.id];
            const isDone = dl && !dl.startsWith("error") && dl !== "downloading";
            const isErr = dl?.startsWith("error");
            return (
              <div key={v.id} style={{ background: C.bg, border: `1px solid ${C.brd}`, borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <a href={v.url} target="_blank" rel="noreferrer" style={{ display: "block", aspectRatio: "16/9", background: C.s3, position: "relative" }}>
                  <img src={v.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.7)", color: C.white, fontFamily: F.m, fontSize: 11, padding: "2px 6px", borderRadius: 4 }}>{v.duration}s</div>
                </a>
                <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 11, color: C.t2, fontFamily: F.m }}>{v.width}×{v.height} · by {v.user.name}</div>
                  <button onClick={() => download(v)} disabled={dl === "downloading"} style={{ ...BS, background: isDone ? C.green : isErr ? C.red : C.s3, color: isDone ? C.bg : C.white, fontSize: 11, padding: "5px 10px" }}>
                    {dl === "downloading" ? "Downloading…" : isDone ? "✓ Downloaded" : isErr ? `Failed` : "Download"}
                  </button>
                  {isDone && <div style={{ fontSize: 10, fontFamily: F.m, color: C.t3, wordBreak: "break-all" }}>{dl}</div>}
                  {isErr && <div style={{ fontSize: 10, fontFamily: F.m, color: C.red }}>{dl.replace("error:", "")}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function pickBestFile(files = []) {
  if (files.length === 0) return null;
  const ranked = [...files].sort((a, b) => {
    const ah = a.height || 0;
    const bh = b.height || 0;
    const aOk = ah <= 1080 ? ah : ah - 10000;
    const bOk = bh <= 1080 ? bh : bh - 10000;
    return bOk - aOk;
  });
  return ranked[0];
}

// ── Blueprint ───────────────────────────────────────────────────────────────

function BlueprintTool({ disabled }) {
  const [mode, setMode] = useState("text"); // "text" | "url"
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [job, setJob] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const generate = async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setJob({ state: "queued" });
    try {
      const body = mode === "text" ? { text } : { url };
      const r = await fetch(`${SERVER}/tools/blueprint/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `${r.status}`);
      setJob({ state: "running", jobId: data.jobId, log: [] });
      pollRef.current = setInterval(async () => {
        try {
          const sr = await fetch(`${SERVER}/status/${data.jobId}`);
          const s = await sr.json();
          setJob(s);
          if (s.state === "done" || s.state === "error") clearInterval(pollRef.current);
        } catch { /* server bounce */ }
      }, 1500);
    } catch (e) { setJob({ state: "error", error: e.message }); }
  };

  const ready = mode === "text" ? text.trim().length > 50 : url.trim().length > 5;
  const running = job?.state === "queued" || job?.state === "running";

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <button onClick={() => setMode("text")} style={{ ...BS, background: mode === "text" ? C.green : C.s3, color: mode === "text" ? C.bg : C.white }}>Paste text</button>
        <button onClick={() => setMode("url")} style={{ ...BS, background: mode === "url" ? C.green : C.s3, color: mode === "url" ? C.bg : C.white }}>From URL</button>
      </div>

      {mode === "text" ? (
        <textarea
          value={text} onChange={e => setText(e.target.value)}
          placeholder="Paste article text here (50+ chars)…"
          rows={10}
          style={{ ...IS, fontFamily: F.b, lineHeight: 1.5, resize: "vertical" }}
          disabled={disabled || running}
        />
      ) : (
        <input
          value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com/article"
          style={IS} disabled={disabled || running}
        />
      )}

      <button onClick={generate} disabled={disabled || running || !ready}
        style={{ ...BS, marginTop: 12, background: C.green, color: C.bg, padding: "10px 28px", opacity: (disabled || running || !ready) ? 0.5 : 1 }}>
        {running ? "Generating…" : "Generate Blueprint"}
      </button>

      {job && (
        <div style={{ marginTop: 16, background: C.bg, border: `1px solid ${C.brd}`, borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: stateColor(job.state), animation: running ? "pulse 1s infinite" : undefined }} />
            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: F.d, letterSpacing: "0.05em", textTransform: "uppercase", color: stateColor(job.state) }}>
              {job.state === "running" ? "Generating" : job.state}
            </div>
          </div>
          {job.outputPath && job.state === "done" && (
            <div style={{ fontSize: 12, color: C.green, fontFamily: F.m, wordBreak: "break-all", padding: "6px 10px", background: C.green + "10", borderLeft: `3px solid ${C.green}`, borderRadius: 4, marginBottom: 8 }}>
              {job.outputPath}
            </div>
          )}
          {job.error && <div style={{ fontSize: 12, color: C.red, fontFamily: F.m, marginBottom: 8 }}>{job.error}</div>}
          {job.log?.length > 0 && (
            <pre style={{ background: C.s2, borderRadius: 6, padding: "8px 12px", fontSize: 10, color: C.t2, fontFamily: F.m, maxHeight: 160, overflow: "auto", margin: 0, lineHeight: 1.6 }}>
              {job.log.join("\n")}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function stateColor(state) {
  return state === "done" ? C.green : state === "error" ? C.red : state === "running" ? C.orange : C.gold;
}
