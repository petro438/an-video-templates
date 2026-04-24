import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type TimelineProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "Timeline", name: "T4: Timeline", icon: "📈",
  description: "Line chart showing a stat changing over time",
  durationDefault: 210,
  fields: [
    { key: "title", label: "Title", type: "text", placeholder: "Odds Movement", default: "" },
    { key: "yLabel", label: "Y-Axis Label", type: "text", placeholder: "Odds", default: "" },
    { key: "color", label: "Line Color", type: "color", default: "#00c358" },
    { key: "points", label: "Data Points", type: "stat-rows", default: [
      { label: "Pre", value: 1000, annotation: "" },
      { label: "Rd 1", value: 500, annotation: "" },
      { label: "Rd 3", value: 100, annotation: "" },
      { label: "Rd 5", value: 17, annotation: "After 5 games" },
    ]},
  ],
};

export const Timeline: React.FC<TimelineProps> = ({
  title, points, yLabel, color = colors.yellow, speed,}) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();

  const titleEnter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 12 });
  const titleOp = interpolate(titleEnter, [0, 1], [0, 1]);

  if (!points || points.length < 2) return <AbsoluteFill style={styles.darkBg} />;

  const vals = points.map(p => p.value);
  const maxV = Math.max(...vals);
  const minV = Math.min(...vals);
  const range = maxV - minV || 1;

  const chartL = 180, chartR = 1740, chartT = 200, chartB = 880;
  const chartW = chartR - chartL, chartH = chartB - chartT;

  const coords = points.map((p, i) => ({
    x: chartL + (i / (points.length - 1)) * chartW,
    y: chartT + (1 - (p.value - minV) / range) * chartH,
    ...p,
  }));

  const drawProg = spring({ frame: frame - 10, fps, config: { damping: 40, stiffness: 50, mass: 2 }, durationInFrames: 50 });

  const pathPoints = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");

  let totalLen = 0;
  for (let i = 1; i < coords.length; i++) {
    totalLen += Math.hypot(coords[i].x - coords[i - 1].x, coords[i].y - coords[i - 1].y);
  }

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />

      {/* Title */}
      {title && (
        <div style={{ position: "absolute", top: 56, left: chartL, fontSize: 56,
          fontFamily: f.display, color: colors.white, opacity: titleOp,
          textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {title}
          {/* Yellow underline grows with title */}
          <div style={{ height: 4, background: color, marginTop: 8, width: `${titleOp * 100}%` }} />
        </div>
      )}

      {/* Y-axis label */}
      {yLabel && (
        <div style={{ position: "absolute", top: chartT + chartH / 2, left: 36,
          transform: "rotate(-90deg)", transformOrigin: "center",
          fontSize: 18, fontFamily: f.mono, color: colors.text3, letterSpacing: "0.1em",
          textTransform: "uppercase" }}>{yLabel}</div>
      )}

      <svg width={1920} height={1080} style={{ position: "absolute", top: 0, left: 0 }}>
        {/* Horizontal grid lines — more visible for broadcast readability */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = chartT + pct * chartH;
          return <line key={i} x1={chartL} y1={y} x2={chartR} y2={y}
            stroke={colors.borderLight} strokeWidth={i === 4 ? 2 : 1} />;
        })}

        {/* Vertical axis line */}
        <line x1={chartL} y1={chartT} x2={chartL} y2={chartB}
          stroke={colors.borderLight} strokeWidth={2} />

        {/* Animated data line */}
        <path d={pathPoints} fill="none" stroke={color} strokeWidth={5}
          strokeLinecap="square" strokeLinejoin="miter"
          strokeDasharray={totalLen} strokeDashoffset={totalLen * (1 - drawProg)} />

        {/* Data points */}
        {coords.map((c, i) => {
          const ptDelay = 12 + i * 6;
          const ptEnter = spring({ frame: frame - ptDelay, fps, config: anim.springBouncy, durationInFrames: 12 });
          const ptScale = interpolate(ptEnter, [0, 1], [0, 1]);
          const ptOp = interpolate(ptEnter, [0, 1], [0, 1]);

          return (
            <g key={i} opacity={ptOp}>
              {/* Square dot — retro feel */}
              <rect x={c.x - 10 * ptScale} y={c.y - 10 * ptScale}
                width={20 * ptScale} height={20 * ptScale} fill={color} />

              {/* Value label */}
              <text x={c.x} y={c.y - 36} textAnchor="middle"
                fill={colors.white} fontFamily={f.stats} fontSize={48}
                letterSpacing="0.02em">{c.value}</text>

              {/* X-axis label */}
              <text x={c.x} y={chartB + 52} textAnchor="middle"
                fill={colors.text2} fontFamily={f.body} fontSize={24}>{c.label}</text>

              {/* Annotation */}
              {c.annotation && (
                <text x={c.x} y={c.y - 78} textAnchor="middle"
                  fill={colors.text3} fontFamily={f.mono} fontSize={18}>{c.annotation}</text>
              )}
            </g>
          );
        })}
      </svg>

      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
