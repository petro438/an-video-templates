import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type BackgroundProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "Background",
  name: "T21: Background",
  icon: "🎨",
  description: "Branded motion background — overlay tweets, videos, images in your NLE",
  durationDefault: 300,
  fields: [
    { key: "variant", label: "Style", type: "select", options: ["default", "minimal", "geometric", "gradient"], default: "default" },
    { key: "showWatermark", label: "Show Watermark", type: "toggle", default: true },
    { key: "showScanlines", label: "Show Scanlines", type: "toggle", default: true },
    { key: "accentColor", label: "Accent Color", type: "color", default: "#00c358" },
  ],
};

export const Background: React.FC<BackgroundProps> = ({
  variant = "default", showWatermark = true, showScanlines = true,
  accentColor = colors.green, speed,
}) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();

  const pulse = Math.sin(frame * 0.02) * 0.5 + 0.5;
  const drift = frame * 0.15;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>

      {variant === "default" && (
        <>
          <div style={{
            position: "absolute", top: -200, left: -200, width: 2320, height: 1480,
            background: `radial-gradient(ellipse at ${50 + Math.sin(frame * 0.008) * 15}% ${50 + Math.cos(frame * 0.006) * 15}%, ${accentColor}20 0%, transparent 60%)`,
          }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: accentColor, opacity: 0.6 }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: accentColor, opacity: 0.2 }} />
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: accentColor, opacity: 0.3 }} />
          <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 4, background: accentColor, opacity: 0.1 }} />
          {[0.2, 0.4, 0.6, 0.8].map((pos, i) => (
            <div key={i} style={{
              position: "absolute", left: `${pos * 100}%`, top: 0, bottom: 0, width: 1,
              background: colors.borderLight, opacity: 0.5 + pulse * 0.15,
            }} />
          ))}
          {[0.25, 0.5, 0.75].map((pos, i) => (
            <div key={i} style={{
              position: "absolute", top: `${pos * 100}%`, left: 0, right: 0, height: 1,
              background: colors.borderLight, opacity: 0.4,
            }} />
          ))}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(180deg, ${colors.surface}40 0%, transparent 15%, transparent 85%, ${colors.surface}40 100%)`,
          }} />
        </>
      )}

      {variant === "minimal" && (
        <>
          <div style={{
            position: "absolute", bottom: 60, left: 80, right: 80, height: 3,
            background: `linear-gradient(to right, transparent, ${accentColor}60, transparent)`,
          }} />
          <div style={{
            position: "absolute", top: 60, left: 80, right: 80, height: 2,
            background: `linear-gradient(to right, transparent, ${colors.borderLight}40, transparent)`,
          }} />
        </>
      )}

      {variant === "geometric" && (
        <>
          {Array.from({ length: 8 }, (_, i) => {
            const x = ((i * 271 + drift) % 2200) - 140;
            const y = ((i * 419 + drift * 0.7) % 1400) - 160;
            const size = 60 + (i % 3) * 40;
            const rot = drift * (0.3 + i * 0.1);
            return (
              <div key={i} style={{
                position: "absolute", left: x, top: y,
                width: size, height: size,
                border: `1px solid ${accentColor}`,
                opacity: 0.06 + (i % 2) * 0.03,
                transform: `rotate(${rot}deg)`,
              }} />
            );
          })}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(135deg, ${colors.bg} 0%, ${accentColor}05 50%, ${colors.bg} 100%)`,
          }} />
        </>
      )}

      {variant === "gradient" && (
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(${135 + Math.sin(frame * 0.005) * 20}deg, ${colors.bg} 0%, ${colors.surface2} 40%, ${accentColor}10 70%, ${colors.bg} 100%)`,
        }} />
      )}

      {showScanlines && <Scanlines />}

      {showWatermark && (
        <div style={styles.watermark}>ACTION</div>
      )}
    </AbsoluteFill>
  );
};
