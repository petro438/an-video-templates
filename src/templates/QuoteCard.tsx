import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type QuoteCardProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "QuoteCard", name: "T5: Quote Card", icon: "💬",
  description: "Quote with word-by-word reveal and attribution",
  durationDefault: 210,
  fields: [
    { key: "quote", label: "Quote", type: "textarea", placeholder: "Enter the quote...", default: "" },
    { key: "attribution", label: "Attribution", type: "text", placeholder: "Name", default: "" },
    { key: "role", label: "Role", type: "text", placeholder: "Head Coach", default: "" },
    { key: "variant", label: "Style", type: "select", options: ["standard", "dramatic"], default: "standard" },
  ],
};

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote, attribution, role, variant = "standard", speed,}) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();

  const markEnter = spring({ frame, fps, config: anim.springSmooth, durationInFrames: 15 });
  const markOp = interpolate(markEnter, [0, 1], [0, 0.2]);

  const words = quote.split(" ");
  const wpf = 0.18;
  const qStart = 8;
  const totalQF = words.length / wpf;
  const attrDelay = qStart + totalQF + 5;
  const attrEnter = spring({ frame: frame - attrDelay, fps, config: anim.springSmooth, durationInFrames: 12 });
  const attrOp = interpolate(attrEnter, [0, 1], [0, 1]);
  const attrSlide = interpolate(attrEnter, [0, 1], [12, 0]);

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />
      <div style={{ position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)", width: 1520, padding: "0 40px" }}>

        {/* Quotation mark — League Gothic instead of Georgia for broadcast feel */}
        <div style={{
          fontSize: 280, fontFamily: f.display, color: colors.yellow,
          lineHeight: 0.8, opacity: markOp, marginBottom: -30, marginLeft: -12, userSelect: "none",
          letterSpacing: "-0.04em",
        }}>{"\u201C"}</div>

        {/* Quote text — word-by-word reveal */}
        <div style={{ fontSize: variant === "dramatic" ? 58 : 50, fontFamily: f.body,
          color: colors.white, lineHeight: 1.55, fontWeight: 600 }}>
          {words.map((w, i) => {
            const wf = qStart + i / wpf;
            const wOp = interpolate(frame, [wf, wf + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return <span key={i} style={{ opacity: wOp, display: "inline-block", marginRight: 14 }}>{w}</span>;
          })}
        </div>

        {/* Attribution bar — sharp horizontal rule */}
        <div style={{
          width: 80, height: 4, background: colors.yellow,
          marginTop: 44, marginBottom: 24, opacity: attrOp,
          transform: `scaleX(${attrOp})`, transformOrigin: "left",
        }} />

        <div style={{ opacity: attrOp, transform: `translateY(${attrSlide}px)` }}>
          <div style={{ fontSize: 36, fontFamily: f.display,
            color: colors.white, letterSpacing: "0.04em",
            textTransform: "uppercase" }}>{attribution}</div>
          {role && <div style={{ fontSize: 22, fontFamily: f.mono,
            color: colors.text2, marginTop: 6, letterSpacing: "0.06em" }}>{role}</div>}
        </div>
      </div>
      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
