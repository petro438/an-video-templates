import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type HeatMapProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "HeatMap", name: "T13: Heat Map", icon: "🟥",
  description: "Grid of cells with color intensity — show patterns across two axes",
  durationDefault: 210,
  fields: [
    { key: "title", label: "Title", type: "text", placeholder: "Completion % by Down & Distance", default: "" },
    { key: "xLabels", label: "Column Labels (comma-sep)", type: "text-list", placeholder: "1-3,4-6,7-9,10+", default: ["1-3", "4-6", "7-9", "10+"] },
    { key: "yLabels", label: "Row Labels (comma-sep)", type: "text-list", placeholder: "1st,2nd,3rd,4th", default: ["1st", "2nd", "3rd", "4th"] },
    { key: "data", label: "Data (paste rows of comma-sep numbers)", type: "textarea", placeholder: "75,68,52,41\n71,60,48,33\n80,65,55,38\n78,62,50,35", default: [[75,68,52,41],[71,60,48,33],[80,65,55,38],[78,62,50,35]] },
    { key: "colorLow", label: "Low Color", type: "color", default: "#1E1E32" },
    { key: "colorHigh", label: "High Color", type: "color", default: "#00c358" },
    { key: "showValues", label: "Show Values", type: "toggle", default: true },
  ],
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function lerpColor(lowHex: string, highHex: string, t: number) {
  const lo = hexToRgb(lowHex);
  const hi = hexToRgb(highHex);
  const r = Math.round(lo.r + (hi.r - lo.r) * t);
  const g = Math.round(lo.g + (hi.g - lo.g) * t);
  const b = Math.round(lo.b + (hi.b - lo.b) * t);
  return `rgb(${r},${g},${b})`;
}

export const HeatMap: React.FC<HeatMapProps> = ({
  title, xLabels, yLabels, data, colorLow = colors.surface3, colorHigh = colors.yellow, showValues = true, speed,}) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();

  const titleEnter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 12 });
  const titleOp = interpolate(titleEnter, [0, 1], [0, 1]);

  const parsedData: number[][] = typeof data === "string"
    ? (data as string).trim().split("\n").map((row: string) => row.split(/[,\t]+/).map(Number))
    : (data || []);

  // Flatten to find min/max
  const flat = parsedData.flat().filter(v => typeof v === "number" && !isNaN(v));
  const minV = Math.min(...flat);
  const maxV = Math.max(...flat);
  const range = maxV - minV || 1;

  const rows = yLabels?.length || 0;
  const cols = xLabels?.length || 0;
  if (rows === 0 || cols === 0) return <AbsoluteFill style={styles.darkBg} />;

  // Cell sizing — fit within 1600×800 safe area
  const maxCellW = Math.floor(1600 / cols);
  const maxCellH = Math.floor(780 / rows);
  const cellW = Math.min(maxCellW, 280);
  const cellH = Math.min(maxCellH, 160);
  const gridW = cols * cellW;
  const gridH = rows * cellH;

  // Y-label column width
  const yLabelW = 160;

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />
      <div style={{ position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)" }}>

        {/* Title */}
        {title && (
          <div style={{ marginBottom: 28, opacity: titleOp }}>
            <div style={{ fontSize: 52, fontFamily: f.display, color: colors.white,
              textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</div>
            <div style={{ height: 4, background: colorHigh, marginTop: 10, width: `${titleOp * 100}%` }} />
          </div>
        )}

        <div style={{ display: "flex" }}>
          {/* Y-axis labels */}
          <div style={{ width: yLabelW, display: "flex", flexDirection: "column" }}>
            {/* Spacer for x-label row */}
            <div style={{ height: 40 }} />
            {yLabels.map((lbl, i) => (
              <div key={i} style={{
                height: cellH, display: "flex", alignItems: "center", justifyContent: "flex-end",
                paddingRight: 16,
                fontSize: 22, fontFamily: f.mono, color: colors.text2,
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>{lbl}</div>
            ))}
          </div>

          <div>
            {/* X-axis labels */}
            <div style={{ display: "flex", marginBottom: 0 }}>
              {xLabels.map((lbl, i) => (
                <div key={i} style={{
                  width: cellW, textAlign: "center", height: 40,
                  fontSize: 20, fontFamily: f.mono, color: colors.text2,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{lbl}</div>
              ))}
            </div>

            {/* Grid */}
            {parsedData.map((row, ri) => (
              <div key={ri} style={{ display: "flex" }}>
                {(Array.isArray(row) ? row : []).map((val, ci) => {
                  const cellDelay = 8 + ri * 4 + ci * 2;
                  const cellEnter = spring({ frame: frame - cellDelay, fps, config: anim.springSnappy, durationInFrames: 10 });
                  const cellOp = interpolate(cellEnter, [0, 1], [0, 1]);
                  const t = (val - minV) / range;
                  const bg = lerpColor(colorLow, colorHigh, t);
                  const textCol = t > 0.55 ? colors.bg : colors.text1;

                  return (
                    <div key={ci} style={{
                      width: cellW, height: cellH,
                      background: bg,
                      border: `1px solid ${colors.bg}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: cellOp,
                    }}>
                      {showValues && (
                        <div style={{ fontSize: 32, fontFamily: f.stats, color: textCol,
                          letterSpacing: "0.02em" }}>{val}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Color scale legend */}
        <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 12, opacity: titleOp }}>
          <span style={{ fontSize: 16, fontFamily: f.mono, color: colors.text3, letterSpacing: "0.06em" }}>LOW</span>
          <div style={{
            width: 200, height: 12,
            background: `linear-gradient(90deg, ${colorLow}, ${colorHigh})`,
          }} />
          <span style={{ fontSize: 16, fontFamily: f.mono, color: colors.text3, letterSpacing: "0.06em" }}>HIGH</span>
        </div>
      </div>

      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
