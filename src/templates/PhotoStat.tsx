import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type PhotoStatProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "PhotoStat", name: "T9: Photo + Stat", icon: "📸",
  description: "Stat overlay for use on top of a photo or clip",
  durationDefault: 180,
  fields: [
    { key: "headline", label: "Headline", type: "text", placeholder: "The Dynasty", default: "" },
    { key: "stats", label: "Stats", type: "stat-rows", default: [
      { label: "Record", value: "44-0" },
      { label: "Gold Medals", value: "4" },
    ]},
    { key: "photoSide", label: "Photo Side", type: "select", options: ["left", "right"], default: "left" },
    { key: "accentColor", label: "Accent Color", type: "color", default: "#00c358" },
  ],
};

export const PhotoStat: React.FC<PhotoStatProps> = ({
  headline, stats, photoSide = "left", accentColor = colors.yellow, speed,}) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();

  const panelEnter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 18 });
  const panelOp = interpolate(panelEnter, [0, 1], [0, 1]);
  const slideX = interpolate(panelEnter, [0, 1], [photoSide === "left" ? 60 : -60, 0]);

  const isRight = photoSide === "right";

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />

      {/* Photo placeholder zone */}
      <div style={{
        position: "absolute",
        [isRight ? "right" : "left"]: 0,
        top: 0, bottom: 0, width: "55%",
        background: `linear-gradient(${isRight ? "270deg" : "90deg"}, ${colors.bg} 0%, ${colors.surface2}50 30%, ${colors.surface2}20 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          fontSize: 16, fontFamily: f.mono, color: colors.text4,
          border: `1px dashed ${colors.border}`, padding: "18px 36px",
          borderRadius: 0,               // sharp dashed placeholder
          letterSpacing: "0.1em", textTransform: "uppercase",
        }}>PHOTO / CLIP LAYER</div>
      </div>

      {/* Stat overlay panel */}
      <div style={{
        position: "absolute",
        [isRight ? "left" : "right"]: 80,
        top: "50%", transform: `translateY(-50%) translateX(${slideX}px)`,
        opacity: panelOp, width: 720,
      }}>
        {/* Top accent bar */}
        <div style={{ height: 5, background: accentColor, marginBottom: 28 }} />

        {/* Headline */}
        {headline && (
          <div style={{ fontSize: 68, fontFamily: f.display,
            color: colors.white, marginBottom: 40, textTransform: "uppercase",
            letterSpacing: "0.04em", lineHeight: 1.0 }}>{headline}</div>
        )}

        {/* Stat rows */}
        {(stats || []).map((stat: any, i: number) => {
          const sd = 8 + i * 5;
          const se = spring({ frame: frame - sd, fps, config: anim.springSnappy, durationInFrames: 12 });
          const sOp = interpolate(se, [0, 1], [0, 1]);
          const sSlide = interpolate(se, [0, 1], [20, 0]);

          return (
            <div key={i} style={{ marginBottom: 28, opacity: sOp, transform: `translateX(${sSlide}px)` }}>
              <div style={{ fontSize: 18, fontFamily: f.mono,
                color: colors.text3, letterSpacing: "0.1em", textTransform: "uppercase",
                marginBottom: 6 }}>{stat.label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 5, height: 56, background: accentColor }} />
                <div style={{ fontSize: 72, fontFamily: f.stats, color: colors.white,
                  letterSpacing: "0.02em" }}>{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
