import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type BigNumberProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "BigNumber", name: "T3: Big Number", icon: "🔢",
  description: "Single dramatic stat callout with count-up",
  durationDefault: 150,
  fields: [
    { key: "number", label: "Number", type: "text", placeholder: "67.5", default: "42" },
    { key: "suffix", label: "Suffix", type: "text", placeholder: "% or -1", default: "%" },
    { key: "label", label: "Label", type: "text", placeholder: "Soviet Shot Share", default: "Stat Label" },
    { key: "sublabel", label: "Sub-label", type: "textarea", placeholder: "Additional context...", default: "" },
    { key: "color", label: "Color", type: "color", default: "#00c358" },
    { key: "countUp", label: "Count-up", type: "toggle", default: true },
  ],
};

export const BigNumber: React.FC<BigNumberProps> = ({
  number, suffix = "", label, sublabel, color = colors.yellow, countUp = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numEnter = spring({ frame, fps, config: anim.springBouncy, durationInFrames: 22 });
  const numScale = interpolate(numEnter, [0, 1], [0.5, 1]);
  const numOp = interpolate(numEnter, [0, 1], [0, 1]);

  const lblEnter = spring({ frame: frame - 10, fps, config: anim.springSmooth, durationInFrames: 15 });
  const lblOp = interpolate(lblEnter, [0, 1], [0, 1]);
  const lblSlide = interpolate(lblEnter, [0, 1], [16, 0]);

  const subEnter = spring({ frame: frame - 16, fps, config: anim.springSmooth, durationInFrames: 12 });
  const subOp = interpolate(subEnter, [0, 1], [0, 1]);

  let display = number;
  if (countUp) {
    const np = number.replace(/[^0-9.]/g, "");
    const nv = parseFloat(np);
    if (!isNaN(nv)) {
      const prog = spring({ frame, fps, config: { damping: 40, stiffness: 80, mass: 1.5 }, durationInFrames: 24 });
      const cur = interpolate(prog, [0, 1], [0, nv]);
      const hasDec = np.includes(".");
      const dp = hasDec ? np.split(".")[1].length : 0;
      const fmt = hasDec ? cur.toFixed(dp) : Math.round(cur).toString();
      const pre = number.substring(0, number.indexOf(np));
      const post = number.substring(number.indexOf(np) + np.length);
      display = `${pre}${fmt}${post}`;
    }
  }

  // Band + spine slam in from top
  const bandEnter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 12 });
  const bandScale = interpolate(bandEnter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />

      {/* Left spine — color bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 14, background: color,
        transform: `scaleY(${bandScale})`, transformOrigin: "top",
      }} />

      {/* Top color band — label printed dark-on-color */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 0, height: 128, background: color,
        transform: `scaleY(${bandScale})`, transformOrigin: "top",
        display: "flex", alignItems: "center", paddingLeft: 80, paddingRight: 80,
        overflow: "hidden",
      }}>
        <div style={{
          fontSize: 66, fontFamily: f.display, color: colors.bg,
          textTransform: "uppercase", letterSpacing: "0.1em",
          opacity: lblOp, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{label}</div>
      </div>

      {/* Number area */}
      <div style={{
        position: "absolute", left: 80, right: 80, top: 128, bottom: 0,
        display: "flex", flexDirection: "column", justifyContent: "center",
      }}>
        <div style={{
          fontSize: 260, fontFamily: f.stats, color: colors.text1,
          lineHeight: 0.85, letterSpacing: "0.01em",
          opacity: numOp, transform: `translateY(${lblSlide}px)`,
        }}>
          {display}
          {suffix && <span style={{ fontSize: 130, color: colors.text3 }}>{suffix}</span>}
        </div>
        {sublabel && (
          <div style={{
            fontSize: 28, fontFamily: f.body, color: colors.text2,
            marginTop: 28, maxWidth: 1100, lineHeight: 1.6,
            opacity: subOp,
          }}>{sublabel}</div>
        )}
      </div>

      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
