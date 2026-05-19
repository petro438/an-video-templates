import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, type BigNumberProps } from "../lib/theme-an";
import { f } from "../lib/fonts-an";

export const BigNumberAN: React.FC<BigNumberProps> = ({
  number, suffix = "", label, sublabel, color = colors.green, countUp = true, speed,
}) => {
  const frame = useCurrentFrame() * (speed || 1);
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

  const bandEnter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 12 });
  const bandScale = interpolate(bandEnter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={styles.darkBg}>
      {/* Left spine — brand accent */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 12, background: color,
        transform: `scaleY(${bandScale})`, transformOrigin: "top",
      }} />

      {/* Top band — label in brand color */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 0, height: 128, background: color,
        transform: `scaleY(${bandScale})`, transformOrigin: "top",
        display: "flex", alignItems: "center", paddingLeft: 80, paddingRight: 80,
        overflow: "hidden",
      }}>
        <div style={{
          fontSize: 56, fontFamily: f.display, color: "#1d1d25", fontWeight: 700,
          letterSpacing: "-0.01em",
          opacity: lblOp, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{label}</div>
      </div>

      {/* Number area */}
      <div style={{
        position: "absolute", left: 80, right: 80, top: 128, bottom: 0,
        display: "flex", flexDirection: "column", justifyContent: "center",
      }}>
        <div style={{
          fontSize: 260, fontFamily: f.stats, fontWeight: 700, color: colors.text1,
          lineHeight: 0.9, letterSpacing: "-0.03em",
          opacity: numOp, transform: `translateY(${lblSlide}px)`,
        }}>
          {display}
          {suffix && <span style={{ fontSize: 130, color: colors.text3, fontWeight: 600 }}>{suffix}</span>}
        </div>
        {sublabel && (
          <div style={{
            fontSize: 26, fontFamily: f.body, fontWeight: 400, color: colors.text2,
            marginTop: 32, maxWidth: 1100, lineHeight: 1.5,
            opacity: subOp,
          }}>{sublabel}</div>
        )}
      </div>

      <div style={styles.watermark}>
        <span style={{ color: colors.green, marginRight: 8 }}>●</span>ACTION NETWORK
      </div>
    </AbsoluteFill>
  );
};
