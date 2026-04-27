import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Img } from "remotion";
import { colors, anim, type OldNewspaperProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "OldNewspaper",
  name: "T22: Newspaper Clipping",
  icon: "📰",
  description: "Showcase newspaper clippings/images with vintage framing and Ken Burns zoom",
  durationDefault: 300,
  fields: [
    { key: "imageUrl", label: "Image URL", type: "text", placeholder: "https://... or local path", default: "" },
    { key: "caption", label: "Caption", type: "text", placeholder: "The New York Times, Nov 4 1980", default: "" },
    { key: "variant", label: "Background", type: "select", options: ["desk", "paper", "dark"], default: "desk" },
    { key: "zoomTarget", label: "Zoom Target", type: "select", options: ["center", "top", "bottom", "left", "right", "none"], default: "center" },
    { key: "zoomAmount", label: "Zoom Amount", type: "number", placeholder: "1.3", default: 1.3 },
  ],
};

const DESK_COLOR = "#3B2E22";
const PAPER_BG = "#F5EEDD";

export const OldNewspaper: React.FC<OldNewspaperProps> = ({
  imageUrl, caption, variant = "desk", zoomTarget = "center", zoomAmount = 1.3, speed,
}) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();

  const fadeIn = spring({ frame, fps, config: anim.springSmooth, durationInFrames: 20 });
  const opacity = interpolate(fadeIn, [0, 1], [0, 1]);

  const zoomProg = zoomTarget === "none" ? 1
    : interpolate(frame, [15, 260], [1, zoomAmount], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const origins: Record<string, string> = {
    center: "50% 50%", top: "50% 20%", bottom: "50% 80%",
    left: "20% 50%", right: "80% 50%", none: "50% 50%",
  };

  const captionEnter = spring({ frame: frame - 20, fps, config: anim.springSnappy, durationInFrames: 12 });
  const captionOp = interpolate(captionEnter, [0, 1], [0, 1]);

  const bgStyle: React.CSSProperties = variant === "desk" ? {
    backgroundColor: DESK_COLOR,
    backgroundImage: `
      linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.3) 100%),
      repeating-linear-gradient(90deg, transparent 0px, transparent 120px, rgba(0,0,0,0.05) 120px, rgba(0,0,0,0.05) 122px)`,
  } : variant === "paper" ? {
    backgroundColor: PAPER_BG,
    backgroundImage: `radial-gradient(ellipse at 30% 30%, rgba(0,0,0,0.02) 0%, transparent 50%)`,
  } : {
    backgroundColor: colors.bg,
  };

  const shadowColor = variant === "paper" ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.5)";
  const borderColor = variant === "paper" ? "#D4C4A8" : variant === "desk" ? "#2A2218" : colors.borderLight;

  return (
    <AbsoluteFill style={bgStyle}>
      {/* Clipping container */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: `translate(-50%, -50%)`,
        width: imageUrl ? 1600 : 1200,
        height: imageUrl ? 900 : 700,
        opacity,
      }}>
        {/* Shadow layer */}
        <div style={{
          position: "absolute", inset: -4,
          boxShadow: `0 8px 40px ${shadowColor}, 0 2px 12px ${shadowColor}`,
          border: `3px solid ${borderColor}`,
          background: variant === "paper" ? PAPER_BG : variant === "desk" ? "#F0E8D8" : colors.surface,
        }} />

        {/* Image or placeholder */}
        <div style={{
          position: "absolute", inset: 0, overflow: "hidden",
          transformOrigin: origins[zoomTarget] || "50% 50%",
          transform: `scale(${zoomProg})`,
        }}>
          {imageUrl ? (
            <Img src={imageUrl} style={{
              width: "100%", height: "100%", objectFit: "cover",
            }} />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              background: variant === "paper" ? PAPER_BG : "#E8DCC8",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 16,
            }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>📰</div>
              <div style={{
                fontSize: 18, fontFamily: f.mono, color: variant === "paper" ? "#999" : "#666",
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>Paste image URL above</div>
            </div>
          )}
        </div>

        {/* Vintage edge effect — subtle tape/pin marks */}
        {variant === "desk" && (
          <>
            <div style={{
              position: "absolute", top: -8, left: 60, width: 80, height: 16,
              background: "rgba(200,180,140,0.6)", transform: "rotate(-1deg)",
              borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }} />
            <div style={{
              position: "absolute", top: -8, right: 80, width: 70, height: 16,
              background: "rgba(200,180,140,0.5)", transform: "rotate(1.5deg)",
              borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }} />
          </>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <div style={{
          position: "absolute", bottom: 40, left: 0, right: 0,
          textAlign: "center", opacity: captionOp,
        }}>
          <div style={{
            display: "inline-block",
            padding: "10px 28px",
            background: variant === "paper" ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.5)",
            borderRadius: 0,
          }}>
            <span style={{
              fontSize: 18, fontFamily: f.mono,
              color: variant === "paper" ? "#6B6150" : colors.text2,
              letterSpacing: "0.06em", fontStyle: "italic",
            }}>{caption}</span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
