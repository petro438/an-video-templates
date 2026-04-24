import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type DotStripProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "DotStrip",
  name: "T19: Dot Strip",
  icon: "🔴",
  description: "Single-stat dot distribution — rows of dots that climb up or down",
  durationDefault: 240,
  fields: [
    { key: "title", label: "Title", type: "text", placeholder: "Home Runs — 2024 Season", default: "" },
    { key: "items", label: "Items (name, value)", type: "paste-table", default: [
      { name: "Ohtani", values: ["54"], highlight: true },
      { name: "Judge", values: ["58"], highlight: false },
      { name: "Soto", values: ["41"], highlight: false },
    ]},
    { key: "sort", label: "Sort", type: "select", options: ["descending", "ascending", "none"], default: "descending" },
    { key: "showLabels", label: "Show Labels", type: "toggle", default: true },
    { key: "showValues", label: "Show Values", type: "toggle", default: true },
    { key: "dotColor", label: "Dot Color", type: "color", default: "#E82020" },
    { key: "accentColor", label: "Highlight Color", type: "color", default: "#00c358" },
  ],
};

export const DotStrip: React.FC<DotStripProps> = ({
  title, items, sort = "descending", showLabels = true, showValues = true,
  dotColor = colors.red, accentColor = colors.green, speed,
}) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();

  if (!items || items.length === 0) return <AbsoluteFill style={styles.darkBg} />;

  const titleEnter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 12 });
  const titleOp = interpolate(titleEnter, [0, 1], [0, 1]);

  const parsed = items.map((item: any) => {
    const cells = item.cells ?? [item.name, ...(item.values || [])];
    return { name: cells[0] || "", value: parseFloat(cells[1]) || 0, highlight: !!item.highlight };
  });

  const sorted = sort === "none" ? parsed
    : [...parsed].sort((a, b) => sort === "descending" ? b.value - a.value : a.value - b.value);

  const maxVal = Math.max(...sorted.map(s => s.value), 1);
  const rowCount = sorted.length;
  const rowH = Math.min(64, Math.floor(800 / rowCount));
  const dotSize = Math.min(12, Math.max(6, Math.floor(rowH * 0.45)));
  const dotGap = dotSize + 2;
  const labelW = showLabels ? 260 : 0;
  const valueW = showValues ? 80 : 0;
  const maxDots = Math.floor((1400 - labelW - valueW) / dotGap);
  const scale = maxVal > maxDots ? maxDots / maxVal : 1;

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />
      <div style={{ position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)", width: 1500 }}>

        {title && (
          <div style={{ marginBottom: 24, opacity: titleOp }}>
            <div style={{ fontSize: 56, fontFamily: f.display, color: colors.white,
              textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</div>
            <div style={{ height: 4, background: accentColor, marginTop: 10, width: `${titleOp * 100}%` }} />
          </div>
        )}

        {sorted.map((item, i) => {
          const d = 8 + i * 3;
          const rowEnter = spring({ frame: frame - d, fps, config: anim.springSnappy, durationInFrames: 12 });
          const rowOp = interpolate(rowEnter, [0, 1], [0, 1]);
          const numDots = Math.round(item.value * scale);
          const isHl = item.highlight;

          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", height: rowH,
              opacity: rowOp,
              borderLeft: isHl ? `4px solid ${accentColor}` : "4px solid transparent",
              paddingLeft: isHl ? 8 : 0,
              background: isHl ? `${accentColor}08` : "transparent",
            }}>
              {showLabels && (
                <div style={{ width: labelW, fontSize: isHl ? 22 : 18, fontFamily: f.body,
                  color: isHl ? colors.white : colors.text2,
                  fontWeight: isHl ? 700 : 400,
                  paddingRight: 16, textAlign: "right",
                  overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                }}>{item.name}</div>
              )}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                {Array.from({ length: numDots }, (_, di) => {
                  const dotDelay = d + di * 0.3;
                  const dotEnter = spring({ frame: frame - dotDelay, fps, config: anim.springSnappy, durationInFrames: 8 });
                  const dotScale = interpolate(dotEnter, [0, 1], [0, 1]);
                  return (
                    <div key={di} style={{
                      width: dotSize, height: dotSize, borderRadius: dotSize / 2,
                      background: isHl ? accentColor : dotColor,
                      transform: `scale(${dotScale})`,
                    }} />
                  );
                })}
              </div>
              {showValues && (
                <div style={{ width: valueW, textAlign: "right", fontSize: isHl ? 28 : 22,
                  fontFamily: f.stats, color: isHl ? colors.white : colors.text3,
                  paddingLeft: 12 }}>{item.value}</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
