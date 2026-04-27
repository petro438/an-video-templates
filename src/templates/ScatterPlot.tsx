import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type ScatterPlotProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";
import { teamLogo } from "../lib/teamLookup";

export const schema: TemplateSchema = {
  id: "ScatterPlot", name: "T14: Scatter Plot", icon: "📊",
  description: "X/Y scatter plot with labeled data points — find outliers and clusters",
  durationDefault: 240,
  fields: [
    { key: "title", label: "Title", type: "text", placeholder: "Attempts vs Yards Per Carry", default: "" },
    { key: "xLabel", label: "X-Axis Label", type: "text", placeholder: "Carries", default: "" },
    { key: "yLabel", label: "Y-Axis Label", type: "text", placeholder: "YPC", default: "" },
    { key: "points", label: "Points (label, x, y per row)", type: "textarea", placeholder: "DAL,280,4.8\nSF,310,5.1", default: [
      { label: "KC", x: 420, y: 4.9 },
      { label: "SF", x: 510, y: 5.2 },
      { label: "DAL", x: 380, y: 4.4 },
      { label: "BAL", x: 460, y: 5.6 },
      { label: "MIA", x: 290, y: 4.1 },
    ]},
    { key: "quadrants", label: "Quadrant Labels (optional)", type: "text", placeholder: "", default: { topRight: "Elite", bottomLeft: "Below Avg" } },
  ],
};

export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  title, xLabel, yLabel, points, quadrants, useLogo, speed,}) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();

  const titleEnter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 12 });
  const titleOp = interpolate(titleEnter, [0, 1], [0, 1]);

  if (!points || points.length === 0) return <AbsoluteFill style={styles.darkBg} />;

  const normalized = points.map((p: any) =>
    p.x !== undefined ? p : { label: p.name || p.label || "", x: parseFloat(p.values?.[0]) || 0, y: parseFloat(p.values?.[1]) || 0, color: p.color }
  );

  const xs = normalized.map(p => p.x);
  const ys = normalized.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const padX = (maxX - minX) * 0.15 || 1;
  const padY = (maxY - minY) * 0.15 || 0.5;

  const chartL = 180, chartR = 1740, chartT = 160, chartB = 900;
  const chartW = chartR - chartL, chartH = chartB - chartT;

  function toX(v: number) { return chartL + ((v - (minX - padX)) / ((maxX + padX) - (minX - padX))) * chartW; }
  function toY(v: number) { return chartB - ((v - (minY - padY)) / ((maxY + padY) - (minY - padY))) * chartH; }

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const qMidX = toX(midX);
  const qMidY = toY(midY);

  // Axis tick values
  const xTicks = 5;
  const yTicks = 5;

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />

      {/* Title */}
      {title && (
        <div style={{ position: "absolute", top: 48, left: chartL, opacity: titleOp }}>
          <div style={{ fontSize: 52, fontFamily: f.display, color: colors.white,
            textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</div>
          <div style={{ height: 4, background: colors.yellow, marginTop: 8, width: `${titleOp * 100}%` }} />
        </div>
      )}

      <svg width={1920} height={1080} style={{ position: "absolute", top: 0, left: 0 }}>
        {/* Quadrant labels */}
        {quadrants && (
          <>
            {quadrants.topRight && (
              <text x={qMidX + (chartR - qMidX) / 2} y={chartT + 36}
                textAnchor="middle" fill={colors.text4} fontFamily={f.mono}
                fontSize={20} letterSpacing="0.08em">{quadrants.topRight.toUpperCase()}</text>
            )}
            {quadrants.topLeft && (
              <text x={chartL + (qMidX - chartL) / 2} y={chartT + 36}
                textAnchor="middle" fill={colors.text4} fontFamily={f.mono}
                fontSize={20} letterSpacing="0.08em">{quadrants.topLeft.toUpperCase()}</text>
            )}
            {quadrants.bottomRight && (
              <text x={qMidX + (chartR - qMidX) / 2} y={chartB - 16}
                textAnchor="middle" fill={colors.text4} fontFamily={f.mono}
                fontSize={20} letterSpacing="0.08em">{quadrants.bottomRight.toUpperCase()}</text>
            )}
            {quadrants.bottomLeft && (
              <text x={chartL + (qMidX - chartL) / 2} y={chartB - 16}
                textAnchor="middle" fill={colors.text4} fontFamily={f.mono}
                fontSize={20} letterSpacing="0.08em">{quadrants.bottomLeft.toUpperCase()}</text>
            )}
            {/* Quadrant dividers */}
            <line x1={qMidX} y1={chartT} x2={qMidX} y2={chartB}
              stroke={colors.borderLight} strokeWidth={1} strokeDasharray="6 4" />
            <line x1={chartL} y1={qMidY} x2={chartR} y2={qMidY}
              stroke={colors.borderLight} strokeWidth={1} strokeDasharray="6 4" />
          </>
        )}

        {/* Axis grid */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const y = chartT + (i / yTicks) * chartH;
          const v = (maxY + padY) - (i / yTicks) * ((maxY + padY) - (minY - padY));
          return (
            <g key={`y${i}`}>
              <line x1={chartL} y1={y} x2={chartR} y2={y}
                stroke={colors.border} strokeWidth={1} />
              <text x={chartL - 14} y={y + 6} textAnchor="end"
                fill={colors.text3} fontFamily={f.mono} fontSize={18}>{v.toFixed(1)}</text>
            </g>
          );
        })}
        {Array.from({ length: xTicks + 1 }, (_, i) => {
          const x = chartL + (i / xTicks) * chartW;
          const v = (minX - padX) + (i / xTicks) * ((maxX + padX) - (minX - padX));
          return (
            <g key={`x${i}`}>
              <line x1={x} y1={chartT} x2={x} y2={chartB}
                stroke={colors.border} strokeWidth={1} />
              <text x={x} y={chartB + 36} textAnchor="middle"
                fill={colors.text3} fontFamily={f.mono} fontSize={18}>{Math.round(v)}</text>
            </g>
          );
        })}

        {/* Axis lines */}
        <line x1={chartL} y1={chartT} x2={chartL} y2={chartB}
          stroke={colors.borderLight} strokeWidth={2} />
        <line x1={chartL} y1={chartB} x2={chartR} y2={chartB}
          stroke={colors.borderLight} strokeWidth={2} />

        {/* Axis labels */}
        {xLabel && (
          <text x={(chartL + chartR) / 2} y={chartB + 72} textAnchor="middle"
            fill={colors.text2} fontFamily={f.mono} fontSize={20}
            letterSpacing="0.1em">{xLabel.toUpperCase()}</text>
        )}
        {yLabel && (
          <text x={chartL - 80} y={(chartT + chartB) / 2} textAnchor="middle"
            fill={colors.text2} fontFamily={f.mono} fontSize={20}
            letterSpacing="0.1em"
            transform={`rotate(-90, ${chartL - 80}, ${(chartT + chartB) / 2})`}>
            {yLabel.toUpperCase()}
          </text>
        )}

        {/* Data points */}
        {normalized.map((pt, i) => {
          const ptDelay = 10 + i * 4;
          const ptEnter = spring({ frame: frame - ptDelay, fps, config: anim.springBouncy, durationInFrames: 14 });
          const ptScale = interpolate(ptEnter, [0, 1], [0, 1]);
          const ptOp = interpolate(ptEnter, [0, 1], [0, 1]);
          const cx = toX(pt.x);
          const cy = toY(pt.y);
          const dotColor = pt.color || colors.yellow;
          const r = 14 * ptScale;

          // Prefer label above, but nudge below if near top edge
          const labelAbove = cy > chartT + 60;

          const logo = useLogo ? teamLogo(pt.label) : undefined;
          return (
            <g key={i} opacity={ptOp}>
              {logo ? (
                <image href={logo} x={cx - 18} y={cy - 18} width={36} height={36} />
              ) : (
                <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill={dotColor} />
              )}
              {!logo && (
                <text
                  x={cx} y={labelAbove ? cy - 24 : cy + 44}
                  textAnchor="middle"
                  fill={colors.white} fontFamily={f.mono} fontSize={20}
                  fontWeight="600" letterSpacing="0.06em"
                >{pt.label}</text>
              )}
            </g>
          );
        })}
      </svg>

      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
