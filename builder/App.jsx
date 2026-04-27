import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { SCHEMAS as S } from "../src/lib/schemas.js";
import { Player } from "@remotion/player";
import TEAMS from "../src/lib/teams.json";
import {
  OddsCard, StatComparison, BigNumber, Timeline, QuoteCard,
  StandingsTable, Scoreboard, ProbabilityViz, PhotoStat, Explainer,
  Comparable, LowerThird, HeatMap, ScatterPlot, FlexTable,
  SeasonSchedule, GameFlash, ListScanner, DotStrip, RetroTV,
  Background, OldNewspaper,
} from "@templates/index";

// ═══════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════
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

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════
const g = (o,p) => p.split(".").reduce((x,k)=>x?.[k],o);
const sv = (o,p,v) => {
  const c=JSON.parse(JSON.stringify(o)), ks=p.split(".");
  let r=c; for(let i=0;i<ks.length-1;i++){if(!r[ks[i]])r[ks[i]]={};r=r[ks[i]];}
  r[ks[ks.length-1]]=v; return c;
};
const mkDef = (s) => { let p={}; for(const f of s.fields) p=sv(p,f.k,JSON.parse(JSON.stringify(f.d))); return p; };

// ═══════════════════════════════════════════════
// INPUT STYLES
// ═══════════════════════════════════════════════
const IS = {background:C.s2,border:`1px solid ${C.brd}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:C.white,width:"100%",fontFamily:F.b,outline:"none",boxSizing:"border-box"};
const BA = {background:"transparent",border:`1px dashed ${C.brd}`,borderRadius:8,padding:"7px 0",color:C.t2,cursor:"pointer",fontSize:12,fontFamily:F.b,width:"100%"};
const BS = {background:C.s3,border:`1px solid ${C.brd}`,borderRadius:6,padding:"5px 12px",color:C.white,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:F.b};

// ═══════════════════════════════════════════════
// PASTE FIELD COMPONENTS
// ═══════════════════════════════════════════════
function PasteStats({value:rows,onChange:oc}){
  const [raw,setRaw]=useState("");const [m,setM]=useState("form");
  const parse=t=>{const ls=t.trim().split("\n").filter(Boolean).map(l=>{const p=l.split(/[\t,]+/).map(s=>s.trim());return p.length>=3?{label:p[0],valueA:+p[1]||0,valueB:+p[2]||0,suffix:p[3]||""}:null}).filter(Boolean);if(ls.length){oc(ls);setM("form");}};
  return <div>
    <div style={{display:"flex",gap:6,marginBottom:8}}>
      <button onClick={()=>setM("form")} style={{...BS,background:m==="form"?C.green:C.s3}}>Form</button>
      <button onClick={()=>setM("paste")} style={{...BS,background:m==="paste"?C.green:C.s3}}>Paste</button>
    </div>
    {m==="paste"?<div>
      <textarea value={raw} onChange={e=>setRaw(e.target.value)} placeholder={"Paste tab/comma data:\nLabel\tValA\tValB\tSuffix\nPPG\t110\t105\nFG%\t47\t45\t%"} rows={5} style={{...IS,resize:"vertical",fontFamily:F.m,fontSize:12,lineHeight:1.6}}/>
      <button onClick={()=>parse(raw)} style={{...BS,background:C.green,marginTop:6,width:"100%"}}>Parse Data</button>
    </div>:<div style={{display:"flex",flexDirection:"column",gap:6}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 70px 70px 50px 24px",gap:4,fontSize:10,color:C.t3,fontFamily:F.m,padding:"0 2px"}}><span>Label</span><span>A</span><span>B</span><span>Sfx</span><span/></div>
      {(rows||[]).map((r,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 70px 70px 50px 24px",gap:4}}>
        <input style={{...IS,fontSize:12}} value={r.label} onChange={e=>{const n=[...rows];n[i]={...n[i],label:e.target.value};oc(n);}}/>
        <input style={{...IS,fontSize:12}} type="number" value={r.valueA} onChange={e=>{const n=[...rows];n[i]={...n[i],valueA:+e.target.value};oc(n);}}/>
        <input style={{...IS,fontSize:12}} type="number" value={r.valueB} onChange={e=>{const n=[...rows];n[i]={...n[i],valueB:+e.target.value};oc(n);}}/>
        <input style={{...IS,fontSize:12}} value={r.suffix||""} onChange={e=>{const n=[...rows];n[i]={...n[i],suffix:e.target.value};oc(n);}}/>
        <div onClick={()=>oc(rows.filter((_,j)=>j!==i))} style={{cursor:"pointer",color:C.t3,fontSize:16,textAlign:"center",lineHeight:"34px"}}>×</div>
      </div>)}
      <button onClick={()=>oc([...(rows||[]),{label:"",valueA:0,valueB:0,suffix:""}])} style={BA}>+ Row</button>
    </div>}
  </div>;
}

function PasteTable({value:rows,onChange:oc,columns}){
  const [raw,setRaw]=useState("");const [m,setM]=useState("form");
  const parse=t=>{const ls=t.trim().split("\n").filter(Boolean).map(l=>{const p=l.split(/[\t,]+/).map(s=>s.trim());return p.length>=2?{name:p[0],values:p.slice(1),highlight:false}:null}).filter(Boolean);if(ls.length){oc(ls);setM("form");}};
  return <div>
    <div style={{display:"flex",gap:6,marginBottom:8}}>
      <button onClick={()=>setM("form")} style={{...BS,background:m==="form"?C.green:C.s3}}>Form</button>
      <button onClick={()=>setM("paste")} style={{...BS,background:m==="paste"?C.green:C.s3}}>Paste</button>
    </div>
    {m==="paste"?<div>
      <textarea value={raw} onChange={e=>setRaw(e.target.value)} placeholder={"Team\tW\tL\tPTS\nBOS\t10\t3\t20"} rows={5} style={{...IS,resize:"vertical",fontFamily:F.m,fontSize:12,lineHeight:1.6}}/>
      <button onClick={()=>parse(raw)} style={{...BS,background:C.green,marginTop:6,width:"100%"}}>Parse Data</button>
    </div>:<div style={{display:"flex",flexDirection:"column",gap:6}}>
      {(rows||[]).map((r,i)=><div key={i} style={{display:"flex",gap:4,alignItems:"center"}}>
        <input style={{...IS,flex:1,fontSize:12}} value={r.name} placeholder="Name" onChange={e=>{const n=[...rows];n[i]={...n[i],name:e.target.value};oc(n);}}/>
        <input style={{...IS,flex:1,fontSize:12}} value={r.values.join(",")} placeholder="v1,v2,..." onChange={e=>{const n=[...rows];n[i]={...n[i],values:e.target.value.split(",").map(s=>s.trim())};oc(n);}}/>
        <div onClick={()=>{const n=[...rows];n[i]={...n[i],highlight:!n[i].highlight};oc(n);}} style={{width:24,height:24,borderRadius:6,cursor:"pointer",background:r.highlight?C.green:C.s3,border:`1px solid ${r.highlight?C.green:C.brd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:C.white,flexShrink:0}}>★</div>
        <div onClick={()=>oc(rows.filter((_,j)=>j!==i))} style={{cursor:"pointer",color:C.t3,fontSize:16,width:18,textAlign:"center"}}>×</div>
      </div>)}
      <button onClick={()=>oc([...(rows||[]),{name:"",values:(columns||["0"]).map(()=>"0"),highlight:false}])} style={BA}>+ Row</button>
    </div>}
  </div>;
}

function PasteLines({value:items,onChange:oc}){
  const [raw,setRaw]=useState("");const [m,setM]=useState("form");
  return <div>
    <div style={{display:"flex",gap:6,marginBottom:8}}>
      <button onClick={()=>setM("form")} style={{...BS,background:m==="form"?C.green:C.s3}}>Form</button>
      <button onClick={()=>setM("paste")} style={{...BS,background:m==="paste"?C.green:C.s3}}>Paste</button>
    </div>
    {m==="paste"?<div>
      <textarea value={raw} onChange={e=>setRaw(e.target.value)} placeholder="One item per line" rows={4} style={{...IS,resize:"vertical",fontFamily:F.m,fontSize:12,lineHeight:1.6}}/>
      <button onClick={()=>{const ls=raw.trim().split("\n").filter(Boolean);if(ls.length){oc(ls);setM("form");}}} style={{...BS,background:C.green,marginTop:6,width:"100%"}}>Parse</button>
    </div>:<div style={{display:"flex",flexDirection:"column",gap:4}}>
      {(items||[]).map((x,i)=><div key={i} style={{display:"flex",gap:4}}>
        <input style={{...IS,flex:1,fontSize:12}} value={x} onChange={e=>{const n=[...items];n[i]=e.target.value;oc(n);}}/>
        <div onClick={()=>oc(items.filter((_,j)=>j!==i))} style={{cursor:"pointer",color:C.t3,fontSize:16,width:18,textAlign:"center",lineHeight:"34px"}}>×</div>
      </div>)}
      <button onClick={()=>oc([...(items||[]),""]) } style={BA}>+ Item</button>
    </div>}
  </div>;
}

function PasteKV({value:rows,onChange:oc}){
  const [raw,setRaw]=useState("");const [m,setM]=useState("form");
  return <div>
    <div style={{display:"flex",gap:6,marginBottom:8}}>
      <button onClick={()=>setM("form")} style={{...BS,background:m==="form"?C.green:C.s3}}>Form</button>
      <button onClick={()=>setM("paste")} style={{...BS,background:m==="paste"?C.green:C.s3}}>Paste</button>
    </div>
    {m==="paste"?<div>
      <textarea value={raw} onChange={e=>setRaw(e.target.value)} placeholder={"Label\tValue\nRecord\t44-0"} rows={4} style={{...IS,resize:"vertical",fontFamily:F.m,fontSize:12,lineHeight:1.6}}/>
      <button onClick={()=>{const ls=raw.trim().split("\n").filter(Boolean).map(l=>{const p=l.split(/[\t,]+/);return p.length>=2?{label:p[0].trim(),value:p[1].trim()}:null}).filter(Boolean);if(ls.length){oc(ls);setM("form");}}} style={{...BS,background:C.green,marginTop:6,width:"100%"}}>Parse</button>
    </div>:<div style={{display:"flex",flexDirection:"column",gap:4}}>
      {(rows||[]).map((r,i)=><div key={i} style={{display:"flex",gap:4}}>
        <input style={{...IS,flex:1,fontSize:12}} value={r.label} placeholder="Label" onChange={e=>{const n=[...rows];n[i]={...n[i],label:e.target.value};oc(n);}}/>
        <input style={{...IS,flex:1,fontSize:12}} value={r.value} placeholder="Value" onChange={e=>{const n=[...rows];n[i]={...n[i],value:e.target.value};oc(n);}}/>
        <div onClick={()=>oc(rows.filter((_,j)=>j!==i))} style={{cursor:"pointer",color:C.t3,fontSize:16,width:18,textAlign:"center",lineHeight:"34px"}}>×</div>
      </div>)}
      <button onClick={()=>oc([...(rows||[]),{label:"",value:""}])} style={BA}>+ Row</button>
    </div>}
  </div>;
}

function PastePoints({value:rows,onChange:oc}){
  const [raw,setRaw]=useState("");const [m,setM]=useState("form");
  return <div>
    <div style={{display:"flex",gap:6,marginBottom:8}}>
      <button onClick={()=>setM("form")} style={{...BS,background:m==="form"?C.green:C.s3}}>Form</button>
      <button onClick={()=>setM("paste")} style={{...BS,background:m==="paste"?C.green:C.s3}}>Paste</button>
    </div>
    {m==="paste"?<div>
      <textarea value={raw} onChange={e=>setRaw(e.target.value)} placeholder={"Label\tValue\tNote(opt)\nPre-Tourney\t1000\t1000-1"} rows={4} style={{...IS,resize:"vertical",fontFamily:F.m,fontSize:12,lineHeight:1.6}}/>
      <button onClick={()=>{const ls=raw.trim().split("\n").filter(Boolean).map(l=>{const p=l.split(/[\t,]+/);return p.length>=2?{label:p[0].trim(),value:+p[1]||0,annotation:(p[2]||"").trim()}:null}).filter(Boolean);if(ls.length){oc(ls);setM("form");}}} style={{...BS,background:C.green,marginTop:6,width:"100%"}}>Parse</button>
    </div>:<div style={{display:"flex",flexDirection:"column",gap:4}}>
      {(rows||[]).map((r,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 70px 1fr 24px",gap:4}}>
        <input style={{...IS,fontSize:12}} value={r.label} placeholder="Label" onChange={e=>{const n=[...rows];n[i]={...n[i],label:e.target.value};oc(n);}}/>
        <input style={{...IS,fontSize:12}} type="number" value={r.value} onChange={e=>{const n=[...rows];n[i]={...n[i],value:+e.target.value};oc(n);}}/>
        <input style={{...IS,fontSize:12}} value={r.annotation||""} placeholder="Note" onChange={e=>{const n=[...rows];n[i]={...n[i],annotation:e.target.value};oc(n);}}/>
        <div onClick={()=>oc(rows.filter((_,j)=>j!==i))} style={{cursor:"pointer",color:C.t3,fontSize:16,textAlign:"center",lineHeight:"34px"}}>×</div>
      </div>)}
      <button onClick={()=>oc([...(rows||[]),{label:"",value:0,annotation:""}])} style={BA}>+ Point</button>
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════
// IMAGE UPLOAD — uploads to render server, returns path
// ═══════════════════════════════════════════════
const RENDER_SERVER_URL = "http://localhost:3100";

function ImageUploadButton({ onUploaded }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${RENDER_SERVER_URL}/upload`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const { path } = await res.json();
      onUploaded(path);
    } catch (err) {
      alert("Upload failed. Make sure the render server is running (npm run render-server).\n\n" + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div style={{ flexShrink: 0 }}>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{
        ...BS, fontSize: 9, padding: "3px 8px", background: uploading ? C.s3 : C.s2,
        opacity: uploading ? 0.5 : 1,
      }}>{uploading ? "..." : "📁"}</button>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TEAM PICKER — auto-fill colors, names, logos
// ═══════════════════════════════════════════════
const SPORTS = Object.keys(TEAMS).filter(k => TEAMS[k].length > 0);

function TeamPickerDropdown({ onSelect, label }) {
  const [sport, setSport] = useState(SPORTS[0] || "");
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const teams = TEAMS[sport] || [];

  if (SPORTS.length === 0) return null;

  const openPicker = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: Math.min(r.left, window.innerWidth - 300) });
    }
    setOpen(!open);
  };

  return (
    <div style={{ display: "inline-block" }}>
      <button ref={btnRef} type="button" onClick={openPicker} style={{
        ...BS, fontSize: 9, padding: "3px 8px", background: open ? C.green : C.s3,
      }}>{label || "Pick Team"}</button>
      {open && ReactDOM.createPortal(
        <div style={{
          position: "fixed", top: pos.top, left: pos.left, zIndex: 9999,
          width: 280, background: C.s2, border: `1px solid ${C.brd}`, borderRadius: 8,
          padding: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        }}>
          <div style={{ display: "flex", gap: 3, marginBottom: 6, flexWrap: "wrap" }}>
            {SPORTS.map(s => (
              <button type="button" key={s} onClick={() => setSport(s)} style={{
                ...BS, background: sport === s ? C.green : C.s3, fontSize: 9,
                textTransform: "uppercase", padding: "2px 6px",
              }}>{s}</button>
            ))}
          </div>
          <input type="text" value={filter} placeholder="Search..." style={{ ...IS, fontSize: 11, marginBottom: 4, padding: "5px 8px" }}
            onChange={e => setFilter(e.target.value)} />
          <div style={{ maxHeight: 200, overflowY: "scroll", display: "flex", flexDirection: "column", gap: 1 }}>
            {teams.filter(t => {
              if (!filter) return true;
              const q = filter.toLowerCase();
              return t.displayName.toLowerCase().includes(q) || t.abbreviation.toLowerCase().includes(q) || t.fullName.toLowerCase().includes(q);
            }).map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 6px",
                borderRadius: 4, cursor: "pointer", flexShrink: 0 }}
                onClick={() => { onSelect(t); setOpen(false); setFilter(""); }}
                onMouseEnter={e => e.currentTarget.style.background = C.s3}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {t.logo && <img src={t.logo} alt="" width={18} height={18} style={{ objectFit: "contain", flexShrink: 0 }}
                  onError={e => { e.target.style.display = "none"; }} />}
                <div style={{ flex: 1, fontSize: 11, color: C.white, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{t.displayName}</div>
                <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "#" + t.primaryColor }} />
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "#" + t.secondaryColor }} />
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// ERROR BOUNDARY — catches crashes inside Remotion Player
// ═══════════════════════════════════════════════
class PreviewErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidUpdate(prev) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{width:"100%",height:"100%",background:"#1a1a1a",display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",gap:12,color:"#999",fontFamily:"monospace",fontSize:13}}>
          <div style={{color:"#E82020"}}>Preview crashed</div>
          <div style={{maxWidth:500,textAlign:"center",fontSize:11,color:"#666"}}>{this.state.error.message}</div>
          <button onClick={()=>this.setState({error:null})}
            style={{marginTop:8,padding:"6px 16px",background:"#333",color:"#ccc",border:"1px solid #555",
              borderRadius:6,cursor:"pointer",fontSize:12}}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// LIVE PREVIEW — uses actual @remotion/player
// ═══════════════════════════════════════════════
const PW = 652, PH = 367; // display size (1920×1080 scaled ~34%)

const COMPS = {
  OddsCard, StatComparison, BigNumber, Timeline, QuoteCard,
  StandingsTable, Scoreboard, ProbabilityViz, PhotoStat, Explainer,
  Comparable, LowerThird, HeatMap, ScatterPlot, FlexTable,
  SeasonSchedule, GameFlash, ListScanner, DotStrip, RetroTV,
  Background, OldNewspaper,
};

class InnerErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidUpdate(prev) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }
  render() {
    if (this.state.error) return null;
    return this.props.children;
  }
}

const SAFE_COMPS = {};
for (const [name, Comp] of Object.entries(COMPS)) {
  SAFE_COMPS[name] = React.forwardRef(function SafeWrap(props, ref) {
    return React.createElement(InnerErrorBoundary, { resetKey: JSON.stringify(props) },
      React.createElement(Comp, { ...props, ref }));
  });
}

function useDebounce(value, ms) {
  const [d, setD] = useState(value);
  useEffect(() => { const t = setTimeout(() => setD(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return d;
}

function LivePreview({ id, p, dur }) {
  const Comp = SAFE_COMPS[id];
  const debouncedProps = useDebounce(p, 200);
  if (!Comp) {
    return (
      <div style={{width:PW,height:PH,background:C.s2,borderRadius:10,border:`1px solid ${C.brd}`,
        display:"flex",alignItems:"center",justifyContent:"center",color:C.t3,fontFamily:F.m,fontSize:12}}>
        No preview for {id}
      </div>
    );
  }

  const resetKey = id + "|" + JSON.stringify(debouncedProps);

  return (
    <div style={{width:PW,height:PH,borderRadius:10,overflow:"hidden",border:`1px solid ${C.brd}`}}>
      <PreviewErrorBoundary resetKey={resetKey}>
        <Player
          key={id}
          component={Comp}
          inputProps={debouncedProps}
          durationInFrames={Math.max(1, dur || 150)}
          fps={30}
          compositionWidth={1920}
          compositionHeight={1080}
          style={{width:"100%",height:"100%"}}
          controls
          loop
          numberOfSharedAudioTags={0}
        />
      </PreviewErrorBoundary>
    </div>
  );
}

// ═══════════════════════════════════════════════
// RENDER PANEL — one-click render via render-server
// ═══════════════════════════════════════════════
const RENDER_SERVER = "http://localhost:3100";

function RenderPanel({ sel, props, dur }) {
  const [job, setJob] = useState(null); // null | { jobId, state, outputPath, error, log }
  const [serverOk, setServerOk] = useState(null); // null=unknown, true, false
  const pollRef = useRef(null);

  // Check if render server is reachable on mount
  useEffect(() => {
    fetch(`${RENDER_SERVER}/jobs`).then(() => setServerOk(true)).catch(() => setServerOk(false));
    return () => clearPoll();
  }, []);

  const clearPoll = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  const startRender = async () => {
    clearPoll();
    setJob({ state: "queued" });
    try {
      const res = await fetch(`${RENDER_SERVER}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compositionId: sel, props, durationInFrames: dur }),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const { jobId } = await res.json();
      setJob({ state: "rendering", jobId });

      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`${RENDER_SERVER}/status/${jobId}`);
          const s = await r.json();
          setJob(s);
          if (s.state === "done" || s.state === "error") clearPoll();
        } catch { /* server maybe restarted */ }
      }, 1000);
    } catch (e) {
      setJob({ state: "error", error: e.message });
    }
  };

  const stateColor = { queued: C.gold, rendering: C.orange, done: C.green, error: C.red };
  const stateLabel = { queued: "Queued", rendering: "Rendering…", done: "Done", error: "Error" };

  return (
    <div>
      {/* Server status */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:serverOk===true?C.green:serverOk===false?C.red:C.t4}}/>
        <div style={{fontSize:12,color:C.t2,fontFamily:F.m}}>
          {serverOk===true?"Render server connected"
           :serverOk===false?<>Render server offline — run <code style={{background:C.s3,padding:"2px 6px",borderRadius:4,fontSize:11}}>npm run render-server</code> in a second terminal</>
           :"Checking render server…"}
        </div>
      </div>

      {/* Render button */}
      <button
        onClick={startRender}
        disabled={serverOk===false || job?.state==="queued" || job?.state==="rendering"}
        style={{
          background: job?.state==="rendering"?C.s3:C.green,
          color: C.bg, border:"none", borderRadius:8,
          padding:"12px 32px", fontSize:14, fontWeight:700,
          fontFamily:F.d, letterSpacing:"0.06em", textTransform:"uppercase",
          cursor: (serverOk===false||job?.state==="queued"||job?.state==="rendering")?"not-allowed":"pointer",
          opacity: (serverOk===false||job?.state==="queued"||job?.state==="rendering")?0.5:1,
          marginBottom:20, transition:"opacity .15s",
        }}
      >
        {job?.state==="rendering"?"Rendering…":job?.state==="done"?"Render Again":"Render"}
      </button>

      {/* Job status */}
      {job && (
        <div style={{background:C.s2,borderRadius:10,border:`1px solid ${C.brd}`,padding:"16px 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:stateColor[job.state]||C.t3,
              animation:job.state==="rendering"?"pulse 1s infinite":undefined}}/>
            <div style={{fontSize:13,fontWeight:700,color:stateColor[job.state]||C.t1,fontFamily:F.d,
              letterSpacing:"0.06em",textTransform:"uppercase"}}>{stateLabel[job.state]||job.state}</div>
          </div>

          {job.state==="done" && job.outputPath && (
            <div>
              <div style={{fontSize:11,color:C.t3,marginBottom:4,fontFamily:F.m}}>Output file:</div>
              <div style={{fontSize:12,color:C.green,fontFamily:F.m,wordBreak:"break-all",
                background:C.green+"10",padding:"8px 12px",borderRadius:6,borderLeft:`3px solid ${C.green}`}}>
                {job.outputPath}
              </div>
            </div>
          )}

          {job.error && (
            <div style={{fontSize:12,color:C.red,fontFamily:F.m,background:C.red+"10",
              padding:"8px 12px",borderRadius:6,borderLeft:`3px solid ${C.red}`,marginTop:8}}>
              {job.error}
            </div>
          )}

          {job.log?.length > 0 && (
            <div style={{marginTop:12}}>
              <div style={{fontSize:10,color:C.t3,marginBottom:4,fontFamily:F.m,textTransform:"uppercase",letterSpacing:"0.08em"}}>Log</div>
              <pre style={{background:C.bg,borderRadius:6,padding:"10px 12px",fontSize:10,
                color:C.t2,fontFamily:F.m,maxHeight:140,overflow:"auto",margin:0,lineHeight:1.6}}>
                {job.log.join("\n")}
              </pre>
            </div>
          )}
        </div>
      )}

      <div style={{marginTop:20,padding:"10px 14px",background:C.s2,borderRadius:8,
        border:`1px solid ${C.brd}`,fontSize:11,color:C.t3,lineHeight:1.6}}>
        Output saved to <code style={{fontFamily:F.m,fontSize:10,color:C.t2}}>out/</code> in your project folder.
        Open in any video player or bring into your NLE.
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════
export default function App(){
  const [sel,setSel]=useState("OddsCard");
  const schema=S.find(s=>s.id===sel);
  const [props,setProps]=useState(()=>mkDef(schema));
  const [dur,setDur]=useState(schema.dur);
  const [panel,setPanel]=useState("preview"); // preview | json | cmd | render
  const [copied,setCopied]=useState(false);

  useEffect(()=>{const s=S.find(x=>x.id===sel);setProps(mkDef(s));setDur(s.dur);},[sel]);

  const up=useCallback((k,v)=>setProps(p=>sv(p,k,v)),[]);
  const json=useMemo(()=>JSON.stringify(props,null,2),[props]);
  const cmd=useMemo(()=>`npx remotion render src/index.ts ${sel} out/${sel.toLowerCase()}-${Date.now()}.mp4 --props='${JSON.stringify(props)}'`,[sel,props]);
  const copy=t=>{navigator.clipboard?.writeText(t);setCopied(true);setTimeout(()=>setCopied(false),1500);};

  const visible=schema.fields.filter(f=>!f.w||g(props,f.w.f)===f.w.v);

  const TABS = [
    { id: "preview", label: "Preview" },
    { id: "render",  label: "Render" },
    { id: "json",    label: "JSON" },
    { id: "cmd",     label: "Render CMD" },
  ];

  return <div style={{background:C.bg,minHeight:"100vh",color:C.white,fontFamily:F.b}}>

    {/* Header */}
    <div style={{borderBottom:`1px solid ${C.brd}`,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:18,fontWeight:800,fontFamily:F.d,letterSpacing:"0.04em"}}>ACTION</span>
        <span style={{color:C.green,fontSize:12}}>●</span>
        <span style={{fontSize:13,color:C.t3,fontWeight:500}}>Template Builder</span>
      </div>
    </div>

    <div style={{display:"flex",height:"calc(100vh - 49px)"}}>
      {/* LEFT: Template Picker */}
      <div style={{width:220,borderRight:`1px solid ${C.brd}`,padding:"12px 8px",overflowY:"auto",flexShrink:0}}>
        <div style={{fontSize:10,fontWeight:700,color:C.t3,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10,padding:"0 8px"}}>Templates</div>
        {S.map(s=><div key={s.id} onClick={()=>setSel(s.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,cursor:"pointer",marginBottom:1,background:sel===s.id?C.green+"15":"transparent",border:sel===s.id?`1px solid ${C.green}30`:"1px solid transparent"}}>
          <span style={{fontSize:16}}>{s.icon}</span>
          <div><div style={{fontSize:12,fontWeight:sel===s.id?700:500,color:sel===s.id?C.white:C.t2}}>{s.name}</div></div>
        </div>)}
      </div>

      {/* MIDDLE: Form */}
      <div style={{width:360,borderRight:`1px solid ${C.brd}`,padding:"20px 24px",overflowY:"auto",flexShrink:0}}>
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{fontSize:20}}>{schema.icon}</span>
            <h2 style={{fontSize:18,fontWeight:800,margin:0,fontFamily:F.d,letterSpacing:"0.01em"}}>{schema.name}</h2>
          </div>
          <p style={{fontSize:12,color:C.t2,margin:0}}>{schema.desc}</p>
        </div>

        {/* Team Picker */}
        {/* Duration */}
        <div style={{marginBottom:16}}>
          <label style={{fontSize:11,fontWeight:600,color:C.t2,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>Duration ({(dur/30).toFixed(1)}s)</label>
          <input type="number" value={dur} onChange={e=>setDur(+e.target.value)} style={{...IS,width:120}}/>
        </div>

        {/* Fields */}
        {visible.map(fl=><div key={fl.k} style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:600,color:C.t2,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{fl.l}</label>
          {fl.t==="text"&&<div style={{display:"flex",gap:4,alignItems:"center"}}>
            <input style={{...IS,flex:1}} value={g(props,fl.k)??""}placeholder={fl.ph} onChange={e=>up(fl.k,e.target.value)}/>
            {(fl.k.toLowerCase().includes("name")||fl.k.toLowerCase().includes("team")||fl.k.toLowerCase().includes("entity"))&&SPORTS.length>0&&
              <TeamPickerDropdown label="⚡" onSelect={team=>{
                const prefix=fl.k.replace(/\.?(name|team)$/i,"");
                up(fl.k,team.abbreviation);
                const allFields=schema.fields;
                const colorKey=allFields.find(f=>f.t==="color"&&f.k.startsWith(prefix)&&!f.k.includes("accent"));
                if(colorKey)up(colorKey.k,"#"+team.primaryColor);
                const logoKey=allFields.find(f=>f.k.startsWith(prefix)&&f.k.toLowerCase().includes("logo"));
                if(logoKey)up(logoKey.k,team.logo);
              }}/>
            }
            {(fl.k.toLowerCase().includes("image")||fl.l.toLowerCase().includes("image"))&&
              <ImageUploadButton onUploaded={path=>up(fl.k,path)}/>
            }
          </div>}
          {fl.t==="number"&&<input style={{...IS,width:120}} type="number" value={g(props,fl.k)??0} onChange={e=>up(fl.k,+e.target.value)}/>}
          {fl.t==="textarea"&&<textarea style={{...IS,resize:"vertical",lineHeight:1.5}} rows={3} value={g(props,fl.k)??""} placeholder={fl.ph} onChange={e=>up(fl.k,e.target.value)}/>}
          {fl.t==="select"&&<select style={{...IS,cursor:"pointer"}} value={g(props,fl.k)??""} onChange={e=>up(fl.k,e.target.value)}>{(fl.o||[]).map(o=><option key={o} value={o}>{o||"(none)"}</option>)}</select>}
          {fl.t==="color"&&<div style={{display:"flex",gap:6,alignItems:"center"}}>
            <input type="color" value={g(props,fl.k)||"#00C358"} onChange={e=>up(fl.k,e.target.value)} style={{width:36,height:32,border:"none",borderRadius:6,cursor:"pointer",background:"transparent"}}/>
            <input style={{...IS,flex:1,fontFamily:F.m,fontSize:12}} value={g(props,fl.k)||""} onChange={e=>up(fl.k,e.target.value)}/>
            <div style={{display:"flex",gap:3}}>{[C.green,C.red,C.orange,C.gold,C.blue,"#FFF"].map(c=><div key={c} onClick={()=>up(fl.k,c)} style={{width:16,height:16,borderRadius:3,background:c,cursor:"pointer",border:g(props,fl.k)===c?`2px solid #fff`:`1px solid ${C.brd}`}}/>)}</div>
          </div>}
          {fl.t==="toggle"&&<div onClick={()=>up(fl.k,!g(props,fl.k))} style={{width:44,height:26,borderRadius:13,cursor:"pointer",background:g(props,fl.k)?C.green:C.s3,padding:3,transition:"background .2s"}}><div style={{width:20,height:20,borderRadius:10,background:C.white,transform:g(props,fl.k)?"translateX(18px)":"translateX(0)",transition:"transform .2s"}}/></div>}
          {fl.t==="paste-stats"&&<PasteStats value={g(props,fl.k)} onChange={v=>up(fl.k,v)}/>}
          {fl.t==="paste-table"&&<PasteTable value={g(props,fl.k)} onChange={v=>up(fl.k,v)} columns={g(props,"columns")}/>}
          {fl.t==="paste-lines"&&<PasteLines value={g(props,fl.k)} onChange={v=>up(fl.k,v)}/>}
          {fl.t==="paste-kv"&&<PasteKV value={g(props,fl.k)} onChange={v=>up(fl.k,v)}/>}
          {fl.t==="paste-points"&&<PastePoints value={g(props,fl.k)} onChange={v=>up(fl.k,v)}/>}
          {fl.t==="text-list"&&<input style={IS} value={(g(props,fl.k)||[]).join(",")} placeholder={fl.ph} onChange={e=>up(fl.k,e.target.value.split(",").map(s=>s.trim()).filter(Boolean))}/>}
        </div>)}
      </div>

      {/* RIGHT: Preview + Output */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto"}}>
        {/* Tab bar */}
        <div style={{display:"flex",borderBottom:`1px solid ${C.brd}`,padding:"0 16px",flexShrink:0}}>
          {TABS.map(t=><button key={t.id} onClick={()=>setPanel(t.id)} style={{
            background:"transparent",border:"none",
            borderBottom:panel===t.id?`2px solid ${C.green}`:"2px solid transparent",
            padding:"10px 16px",color:panel===t.id?C.white:C.t3,
            cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:F.b,
            textTransform:"uppercase",letterSpacing:"0.04em",
          }}>{t.label}</button>)}
        </div>

        <div style={{flex:1,padding:20}}>

          {panel==="preview"&&(
            <div>
              <div style={{fontSize:11,fontWeight:600,color:C.t3,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                Live Preview — actual Remotion render
              </div>
              <LivePreview id={sel} p={props} dur={dur}/>
            </div>
          )}

          {panel==="render"&&(
            <div>
              <div style={{fontSize:11,fontWeight:600,color:C.t3,marginBottom:16,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                Render to File
              </div>
              <RenderPanel sel={sel} props={props} dur={dur}/>
            </div>
          )}

          {panel==="json"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:600,color:C.t3,textTransform:"uppercase",letterSpacing:"0.06em"}}>Props JSON</div>
              <button onClick={()=>copy(json)} style={{...BS,background:copied?C.green:C.s3}}>{copied?"Copied!":"Copy"}</button>
            </div>
            <pre style={{background:C.surface,borderRadius:10,padding:16,fontSize:12,color:C.t2,overflow:"auto",margin:0,fontFamily:F.m,lineHeight:1.6,border:`1px solid ${C.brd}`,whiteSpace:"pre-wrap",wordBreak:"break-all",maxHeight:500}}>{json}</pre>
            <div style={{marginTop:10,padding:10,background:C.green+"10",borderRadius:8,border:`1px solid ${C.green}30`,fontSize:11,color:C.t2,lineHeight:1.5}}>Use with <code style={{background:C.s3,padding:"2px 6px",borderRadius:4,fontSize:10,fontFamily:F.m}}>--props</code> flag or save as a blueprint file.</div>
          </div>}

          {panel==="cmd"&&<div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:600,color:C.t3,textTransform:"uppercase",letterSpacing:"0.06em"}}>Render Command</div>
              <button onClick={()=>copy(cmd)} style={{...BS,background:copied?C.green:C.s3}}>{copied?"Copied!":"Copy"}</button>
            </div>
            <pre style={{background:C.surface,borderRadius:10,padding:16,fontSize:11,color:C.t2,overflow:"auto",margin:0,fontFamily:F.m,lineHeight:1.8,border:`1px solid ${C.brd}`,whiteSpace:"pre-wrap",wordBreak:"break-all"}}>{cmd}</pre>
            <div style={{marginTop:10,padding:10,background:C.green+"10",borderRadius:8,border:`1px solid ${C.green}30`,fontSize:11,color:C.t2,lineHeight:1.5}}>Run from your <code style={{background:C.s3,padding:"2px 6px",borderRadius:4,fontSize:10,fontFamily:F.m}}>an-video-templates/</code> directory.</div>
          </div>}

        </div>
      </div>
    </div>
  </div>;
}
