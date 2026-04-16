import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type ProbabilityVizProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "ProbabilityViz", name: "T8: Probability Viz", icon: "🎯",
  description: "Donut chart or icon grid for percentages",
  durationDefault: 180,
  fields: [
    { key: "percentage", label: "Percentage", type: "number", default: 50 },
    { key: "label", label: "Label", type: "text", default: "" },
    { key: "sublabel", label: "Sub-label", type: "text", default: "" },
    { key: "variant", label: "Style", type: "select", options: ["donut", "icon-grid"], default: "donut" },
    { key: "color", label: "Color", type: "color", default: "#00c358" },
  ],
};

export const ProbabilityViz: React.FC<ProbabilityVizProps> = ({
  percentage, label, sublabel, variant = "donut", color = colors.yellow,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: anim.springSmooth, durationInFrames: 20 });
  const fillP = spring({ frame: frame - 8, fps, config: { damping: 30, stiffness: 60, mass: 1.5 }, durationInFrames: 30 });
  const op = interpolate(enter, [0, 1], [0, 1]);
  const lblEnter = spring({ frame: frame - 15, fps, config: anim.springSmooth, durationInFrames: 12 });
  const lblOp = interpolate(lblEnter, [0, 1], [0, 1]);
  const dispNum = Math.round(percentage * fillP);

  const size = 440, sw = 40, r = (size - sw) / 2, circ = 2 * Math.PI * r;

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />
      <div style={{ position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)", textAlign: "center", opacity: op }}>
        {variant === "donut" ? (
          <div style={{ position: "relative", display: "inline-block" }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Track ring */}
              <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={colors.surface3} strokeWidth={sw} />
              {/* Filled arc — sharp ends (strokeLinecap butt = no rounded caps) */}
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
                strokeDasharray={circ}
                strokeDashoffset={circ - (percentage / 100) * circ * fillP}
                strokeLinecap="butt"
                transform={`rotate(-90 ${size / 2} ${size / 2})`} />
            </svg>
            {/* Center number */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
              <div style={{ fontSize: 110, fontFamily: f.stats, color: colors.white,
                lineHeight: 1, letterSpacing: "0.02em" }}>{dispNum}%</div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 40 }}>
            {/* 10×1 row of squares — sharp, not circles */}
            <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
              {Array.from({ length: 10 }, (_, i) => {
                const lit = i < Math.round(percentage / 10);
                const dp = interpolate(fillP, [i / 10, Math.min((i + 1) / 10, 1)], [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const active = lit && dp > 0.5;
                return (
                  <div key={i} style={{
                    width: 72, height: 72,
                    borderRadius: 0,           // squares, not circles
                    background: active ? color : colors.surface3,
                    border: `2px solid ${active ? color : colors.borderLight}`,
                  }} />
                );
              })}
            </div>
            <div style={{ fontSize: 100, fontFamily: f.stats, color, marginTop: 40, letterSpacing: "0.02em" }}>{dispNum}%</div>
          </div>
        )}
        <div style={{ marginTop: variant === "donut" ? 40 : 0, opacity: lblOp }}>
          <div style={{ fontSize: 38, fontFamily: f.body, fontWeight: 600, color: colors.white,
            textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
          {sublabel && (
            <div style={{ fontSize: 24, fontFamily: f.body, color: colors.text2,
              marginTop: 14, maxWidth: 800, lineHeight: 1.5 }}>{sublabel}</div>
          )}
        </div>
      </div>
      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
