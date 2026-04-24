import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, type RetroTVProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "RetroTV",
  name: "T20: Retro TV",
  icon: "📺",
  description: "CRT television frame overlay — composite highlights inside the screen",
  durationDefault: 150,
  fields: [
    { key: "screenColor", label: "Screen Fill", type: "color", placeholder: "#00FF00 for chroma key", default: "#00FF00" },
    { key: "caption", label: "Caption (optional)", type: "text", placeholder: "4th Quarter Highlights", default: "" },
    { key: "channel", label: "Channel Label", type: "text", placeholder: "CH 3", default: "" },
    { key: "showStatic", label: "Power-On Static", type: "toggle", default: true },
    { key: "showScanlines", label: "Heavy Scanlines", type: "toggle", default: true },
    { key: "frameColor", label: "TV Frame Color", type: "color", default: "#1A1510" },
  ],
};

const SCREEN = { x: 200, y: 80, w: 1520, h: 855, r: 40 };

function StaticNoise({ opacity }: { opacity: number }) {
  if (opacity <= 0) return null;
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < 300; i++) {
    const x = Math.floor((i * 7919 + i * i * 31) % SCREEN.w);
    const y = Math.floor((i * 6271 + i * i * 17) % SCREEN.h);
    const size = 2 + (i % 4);
    const bright = 120 + (i * 37) % 136;
    dots.push(
      <div key={i} style={{
        position: "absolute",
        left: SCREEN.x + x, top: SCREEN.y + y,
        width: size, height: size,
        background: `rgba(${bright},${bright},${bright},${opacity * 0.7})`,
      }} />
    );
  }
  return <>{dots}</>;
}

export const RetroTV: React.FC<RetroTVProps> = ({
  screenColor = "#00FF00", caption, channel, showStatic = true,
  showScanlines = true, frameColor = "#1A1510", speed,
}) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();

  const powerOn = spring({ frame, fps, config: anim.springSmooth, durationInFrames: 20 });
  const screenScaleY = interpolate(powerOn, [0, 1], [0.01, 1]);
  const screenScaleX = interpolate(powerOn, [0, 0.3, 1], [0.3, 0.6, 1]);
  const screenBright = interpolate(powerOn, [0, 0.5, 1], [2, 1.3, 1]);

  const staticOpacity = showStatic
    ? interpolate(powerOn, [0, 0.6, 0.85, 1], [0, 0.8, 0.3, 0])
    : 0;

  const captionEnter = spring({ frame: frame - 25, fps, config: anim.springSnappy, durationInFrames: 12 });
  const captionOp = interpolate(captionEnter, [0, 1], [0, 1]);

  const channelEnter = spring({ frame: frame - 5, fps, config: anim.springSnappy, durationInFrames: 10 });
  const channelOp = interpolate(channelEnter, [0, 1], [0, 1]);

  const woodGrain = `linear-gradient(180deg,
    ${frameColor} 0%,
    ${lighten(frameColor, 15)} 12%,
    ${frameColor} 25%,
    ${lighten(frameColor, 8)} 40%,
    ${frameColor} 55%,
    ${lighten(frameColor, 12)} 70%,
    ${frameColor} 85%,
    ${lighten(frameColor, 6)} 100%)`;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* TV Housing */}
      <div style={{
        position: "absolute", inset: 0,
        background: woodGrain,
        borderRadius: 24,
      }}>
        {/* Inner bevel */}
        <div style={{
          position: "absolute",
          left: SCREEN.x - 16, top: SCREEN.y - 16,
          width: SCREEN.w + 32, height: SCREEN.h + 32,
          borderRadius: SCREEN.r + 8,
          background: "#0A0A0A",
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)",
        }} />

        {/* Screen area */}
        <div style={{
          position: "absolute",
          left: SCREEN.x, top: SCREEN.y,
          width: SCREEN.w, height: SCREEN.h,
          borderRadius: SCREEN.r,
          overflow: "hidden",
          background: screenColor,
          transform: `scaleX(${screenScaleX}) scaleY(${screenScaleY})`,
          filter: `brightness(${screenBright})`,
        }}>
          {/* Scanlines */}
          {showScanlines && (
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.18) 4px)",
              pointerEvents: "none", zIndex: 5,
            }} />
          )}

          {/* Screen glare */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.06) 0%, transparent 60%)",
            pointerEvents: "none", zIndex: 6,
          }} />

          {/* Vignette */}
          <div style={{
            position: "absolute", inset: 0,
            boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.4)",
            borderRadius: SCREEN.r,
            pointerEvents: "none", zIndex: 7,
          }} />
        </div>

        {/* Static noise overlay */}
        <StaticNoise opacity={staticOpacity} />

        {/* Channel indicator */}
        {channel && (
          <div style={{
            position: "absolute",
            left: SCREEN.x + 40, top: SCREEN.y + 24,
            fontSize: 36, fontFamily: f.mono, color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.08em", opacity: channelOp,
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            zIndex: 20,
          }}>{channel}</div>
        )}

        {/* Caption bar */}
        {caption && (
          <div style={{
            position: "absolute",
            left: SCREEN.x + 30, right: 1920 - SCREEN.x - SCREEN.w + 30,
            bottom: 1080 - SCREEN.y - SCREEN.h + 30,
            opacity: captionOp, zIndex: 20,
          }}>
            <div style={{
              background: "rgba(0,0,0,0.75)",
              padding: "12px 24px",
              display: "inline-block",
            }}>
              <div style={{
                fontSize: 28, fontFamily: f.body, color: "#FFFFFF",
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>{caption}</div>
            </div>
          </div>
        )}

        {/* Power LED */}
        <div style={{
          position: "absolute",
          right: 80, bottom: 30,
          width: 10, height: 10, borderRadius: 5,
          background: interpolate(powerOn, [0, 0.5, 1], [0, 0, 1]) > 0.5 ? "#E82020" : "#330000",
          boxShadow: powerOn > 0.5 ? "0 0 8px #E82020" : "none",
        }} />

        {/* Brand area bottom-right */}
        <div style={{
          position: "absolute", right: 110, bottom: 24,
          fontSize: 12, fontFamily: f.mono, color: colors.text4,
          letterSpacing: "0.2em", textTransform: "uppercase",
        }}>ACTION</div>

        {/* Fake speaker grille — left side */}
        <div style={{
          position: "absolute", left: 40, top: SCREEN.y + 200,
          width: 120, display: "flex", flexDirection: "column", gap: 6,
        }}>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} style={{
              height: 3, background: lighten(frameColor, 20),
              opacity: 0.4, borderRadius: 1,
            }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

function lighten(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
