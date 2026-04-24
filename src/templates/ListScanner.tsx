import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type ListScannerProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "ListScanner",
  name: "T18: List Scanner",
  icon: "🔍",
  description: "Fast-scrolls through a ranked list, slows and pauses on the highlighted entry",
  durationDefault: 240,
  fields: [
    { key: "title", label: "Title", type: "text", placeholder: "NFL Passing Yards Leaders", default: "" },
    { key: "items", label: "Items", type: "paste-table", default: [
      { name: "Player 1", values: ["4,500 YDS"], highlight: false },
      { name: "Player 2", values: ["4,200 YDS"], highlight: true },
    ]},
    { key: "display", label: "Display Mode", type: "select", options: ["list", "dots"], default: "list" },
    { key: "showRank", label: "Show Rank", type: "toggle", default: true },
    { key: "showLabels", label: "Show Labels", type: "toggle", default: true },
    { key: "direction", label: "Scroll Direction", type: "select", options: ["down", "up"], default: "down" },
    { key: "dotColor", label: "Dot Color", type: "color", default: "#E82020" },
    { key: "accentColor", label: "Accent Color", type: "color", default: "#00c358" },
  ],
};

const ROW_H = 72;
const VISIBLE_ROWS = 10;
const VIEWPORT_H = ROW_H * VISIBLE_ROWS;

export const ListScanner: React.FC<ListScannerProps> = ({
  title, items, direction = "down", showRank = true, showLabels = true,
  display = "list", dotColor = colors.red, accentColor = colors.green, speed,
}) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();

  if (!items || items.length === 0) return <AbsoluteFill style={styles.darkBg} />;

  const titleEnter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 12 });
  const titleOp = interpolate(titleEnter, [0, 1], [0, 1]);

  const isDots = display === "dots";
  const containerW = isDots ? 1400 : (() => {
    const sampleCells = items[0]?.cells ?? [items[0]?.name, ...(items[0]?.values || [])];
    const colCount = sampleCells.length;
    return colCount <= 2 ? 900 : colCount <= 3 ? 1050 : 1200;
  })();
  const rankW = showRank ? 60 : 0;
  const labelW = showLabels ? 220 : 0;

  const highlightIndex = items.findIndex(item => item.highlight);
  const targetIndex = highlightIndex >= 0 ? highlightIndex : Math.floor(items.length / 2);

  const targetOffset = targetIndex * ROW_H - VIEWPORT_H / 2 + ROW_H / 2;
  const maxOffset = Math.max(0, items.length * ROW_H - VIEWPORT_H);
  const clampedTarget = Math.min(Math.max(0, targetOffset), maxOffset);

  const scanStart = 15;
  const scanDuration = 50;
  const holdStart = scanStart + scanDuration;
  const totalTravel = direction === "down" ? clampedTarget : maxOffset - clampedTarget;
  const startPos = direction === "down" ? 0 : maxOffset;

  let scrollOffset: number;
  if (frame < scanStart) {
    scrollOffset = startPos;
  } else if (frame < holdStart) {
    const scanProgress = (frame - scanStart) / scanDuration;
    const eased = 1 - Math.pow(1 - scanProgress, 3);
    scrollOffset = direction === "down"
      ? startPos + eased * totalTravel
      : startPos - eased * totalTravel;
  } else {
    scrollOffset = clampedTarget;
  }

  const holdSpring = spring({ frame: frame - holdStart, fps, config: anim.springSmooth, durationInFrames: 20 });
  const highlightGlow = frame >= holdStart ? interpolate(holdSpring, [0, 1], [0, 1]) : 0;

  // Dot mode: parse numeric values and compute scaling
  let maxVal = 1;
  if (isDots) {
    for (const item of items) {
      const cells = item.cells ?? [item.name, ...(item.values || [])];
      const v = parseFloat(String(cells[1]).replace(/,/g, "")) || 0;
      if (v > maxVal) maxVal = v;
    }
  }
  const dotSize = 10;
  const dotGap = dotSize + 3;
  const dotsAreaW = containerW - rankW - labelW - 80;
  const maxDots = Math.floor(dotsAreaW / dotGap);
  const dotScale = maxVal > maxDots ? maxDots / maxVal : 1;

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />
      <div style={{ position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)", width: containerW }}>

        {title && (
          <div style={{ marginBottom: 20, opacity: titleOp }}>
            <div style={{ fontSize: 56, fontFamily: f.display, color: colors.white,
              textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</div>
            <div style={{ height: 4, background: accentColor, marginTop: 10, width: `${titleOp * 100}%` }} />
          </div>
        )}

        <div style={{ height: VIEWPORT_H, overflow: "hidden", position: "relative" }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 80,
            background: `linear-gradient(to bottom, ${colors.bg}, transparent)`,
            zIndex: 10, pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
            background: `linear-gradient(to top, ${colors.bg}, transparent)`,
            zIndex: 10, pointerEvents: "none",
          }} />

          <div style={{ transform: `translateY(${-scrollOffset}px)` }}>
            {items.map((item, i) => {
              const cells = item.cells ?? [item.name, ...(item.values || [])];
              const name = cells[0] || "";
              const valueCols = cells.slice(1);
              const isTarget = i === targetIndex;
              const rank = direction === "down" ? i + 1 : items.length - i;

              const hlBg = isTarget
                ? `rgba(${parseInt(accentColor.slice(1, 3), 16)},${parseInt(accentColor.slice(3, 5), 16)},${parseInt(accentColor.slice(5, 7), 16)},${highlightGlow * 0.12})`
                : "transparent";
              const hlBorder = isTarget ? accentColor : "transparent";
              const nameColor = isTarget
                ? interpolate(highlightGlow, [0, 1], [0.6, 1])
                : 0.5;

              if (isDots) {
                const numVal = parseFloat(String(valueCols[0]).replace(/,/g, "")) || 0;
                const numDots = Math.round(numVal * dotScale);
                return (
                  <div key={i} style={{
                    height: ROW_H, display: "flex", alignItems: "center", padding: "0 16px",
                    borderBottom: `1px solid ${colors.border}`,
                    borderLeft: `5px solid ${hlBorder}`,
                    background: hlBg,
                    transform: isTarget ? `scale(${1 + highlightGlow * 0.03})` : "none",
                  }}>
                    {showRank && (
                      <div style={{ width: rankW, fontSize: 28, fontFamily: f.stats,
                        color: isTarget ? accentColor : colors.text3 }}>{rank}</div>
                    )}
                    {showLabels && (
                      <div style={{ width: labelW, fontSize: isTarget ? 22 : 18, fontFamily: f.body,
                        color: `rgba(255,255,255,${nameColor})`,
                        fontWeight: isTarget ? 700 : 400,
                        overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                      }}>{name}</div>
                    )}
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
                      {Array.from({ length: numDots }, (_, di) => (
                        <div key={di} style={{
                          width: dotSize, height: dotSize, borderRadius: dotSize / 2,
                          background: isTarget ? accentColor : dotColor,
                        }} />
                      ))}
                    </div>
                    <div style={{ width: 70, textAlign: "right", fontSize: isTarget ? 28 : 22,
                      fontFamily: f.stats, color: isTarget ? colors.white : colors.text3,
                      paddingLeft: 8 }}>{numVal}</div>
                  </div>
                );
              }

              return (
                <div key={i} style={{
                  height: ROW_H, display: "flex", alignItems: "center", padding: "0 16px",
                  borderBottom: `1px solid ${colors.border}`,
                  borderLeft: `5px solid ${hlBorder}`,
                  background: hlBg,
                  transform: isTarget ? `scale(${1 + highlightGlow * 0.03})` : "none",
                }}>
                  {showRank && (
                    <div style={{ width: rankW, fontSize: 28, fontFamily: f.stats,
                      color: isTarget ? accentColor : colors.text3 }}>{rank}</div>
                  )}
                  <div style={{ flex: 1, fontSize: isTarget ? 34 : 28, fontFamily: f.body,
                    color: `rgba(255,255,255,${nameColor})`,
                    fontWeight: isTarget ? 700 : 400 }}>{name}</div>
                  {valueCols.map((val, j) => (
                    <div key={j} style={{ fontSize: isTarget ? 36 : 28, fontFamily: f.stats,
                      color: isTarget ? colors.white : colors.text3,
                      letterSpacing: "0.02em", textAlign: "right" as const,
                      width: Math.floor((containerW - rankW - 400) / Math.max(1, valueCols.length)),
                    }}>{val}</div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
