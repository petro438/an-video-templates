import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type ExplainerProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "Explainer", name: "T10: Explainer Box", icon: "📋",
  description: "Methodology or concept breakdown with numbered steps",
  durationDefault: 240,
  fields: [
    { key: "title", label: "Title", type: "text", placeholder: "How We Calculated This", default: "" },
    { key: "steps", label: "Steps (one per line)", type: "text-list", placeholder: "Step 1,Step 2,Step 3", default: [
      "Collect historical box scores",
      "Run Monte Carlo simulation (10K iterations)",
      "Convert to implied probability",
    ]},
    { key: "formula", label: "Formula / Key Insight", type: "text", placeholder: "Win Prob = Shots × Conversion Rate", default: "" },
    { key: "accentColor", label: "Accent", type: "color", default: "#00c358" },
  ],
};

export const Explainer: React.FC<ExplainerProps> = ({
  title, steps, formula, accentColor = colors.yellow, speed,}) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();

  const titleEnter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 12 });
  const titleOp = interpolate(titleEnter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />
      <div style={{ position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)", width: 1560 }}>

        {/* Title */}
        <div style={{ fontSize: 56, fontFamily: f.display,
          color: colors.white, marginBottom: 40, opacity: titleOp,
          textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</div>

        {/* Card — sharp corners, left accent spine */}
        <div style={{ ...styles.card, padding: "48px 56px", position: "relative", overflow: "hidden" }}>
          {/* Left accent spine */}
          <div style={{ position: "absolute", top: 0, left: 0, width: 6, height: "100%",
            background: accentColor }} />

          {(steps || []).map((step, i) => {
            const d = 8 + i * 8;
            const se = spring({ frame: frame - d, fps, config: anim.springSnappy, durationInFrames: 15 });
            const sOp = interpolate(se, [0, 1], [0, 1]);
            const sSlide = interpolate(se, [0, 1], [30, 0]);

            return (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 28,
                marginBottom: i < steps.length - 1 ? 36 : 0,
                opacity: sOp, transform: `translateX(${sSlide}px)`,
              }}>
                {/* Step number badge — sharp square */}
                <div style={{
                  width: 56, height: 56,
                  borderRadius: 0,               // square, not rounded
                  flexShrink: 0,
                  background: i === 0 ? accentColor : colors.surface3,
                  border: i !== 0 ? `1px solid ${colors.borderLight}` : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 30, fontFamily: f.stats,
                  color: i === 0 ? colors.bg : colors.text2,
                  letterSpacing: "0.02em",
                }}>{i + 1}</div>

                {/* Step text */}
                <div style={{ fontSize: 32, fontFamily: f.body,
                  color: colors.text1, lineHeight: 1.5, paddingTop: 8 }}>{step}</div>
              </div>
            );
          })}

          {/* Formula / key insight */}
          {formula && (() => {
            const fd = 8 + (steps?.length || 0) * 8 + 5;
            const fe = spring({ frame: frame - fd, fps, config: anim.springSmooth, durationInFrames: 12 });
            const fOp = interpolate(fe, [0, 1], [0, 1]);
            return (
              <div style={{ marginTop: 36, paddingTop: 28, borderTop: `1px solid ${colors.border}`, opacity: fOp }}>
                <div style={{
                  fontSize: 26, fontFamily: f.mono,
                  color: accentColor, letterSpacing: "0.04em",
                  background: `${accentColor}12`, padding: "16px 28px",
                  borderRadius: 0,             // sharp formula block
                  display: "inline-block",
                  borderLeft: `4px solid ${accentColor}`,
                }}>{formula}</div>
              </div>
            );
          })()}
        </div>
      </div>

      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
