import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, type LowerThirdProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "LowerThird", name: "T12: Lower Third", icon: "🏷️",
  description: "Classic broadcast lower third — speaker or source credit",
  durationDefault: 150,
  fields: [
    { key: "primary", label: "Primary", type: "text", placeholder: "Speaker Name", default: "" },
    { key: "secondary", label: "Secondary", type: "text", placeholder: "Title / Organization", default: "" },
    { key: "accentColor", label: "Accent", type: "color", default: "#00c358" },
    { key: "position", label: "Position", type: "select", options: ["left", "right"], default: "left" },
  ],
};

export const LowerThird: React.FC<LowerThirdProps> = ({
  primary, secondary, accentColor = colors.yellow, position = "left", speed,}) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps, durationInFrames } = useVideoConfig();

  // Enter
  const enter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 14 });

  // Exit
  const exitStart = durationInFrames - 18;
  const exit = frame > exitStart
    ? interpolate(frame, [exitStart, durationInFrames - 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  const slideX = position === "left"
    ? interpolate(enter, [0, 1], [-480, 0]) + interpolate(exit, [0, 1], [0, -480])
    : interpolate(enter, [0, 1], [480, 0]) + interpolate(exit, [0, 1], [0, 480]);

  const op = interpolate(exit, [0, 1], [1, 0]);

  // Accent block width grows from 0 to full slightly after slide starts
  const blockEnter = spring({ frame: frame - 4, fps, config: anim.springSnappy, durationInFrames: 12 });
  const blockW = interpolate(blockEnter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute",
        bottom: 80,
        [position]: 60,
        display: "flex",
        alignItems: "stretch",
        transform: `translateX(${slideX}px)`,
        opacity: op,
      }}>
        {/* Accent block — solid color, primary text dark-on-color */}
        <div style={{
          background: accentColor,
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          minWidth: `${blockW * 260}px`,
          overflow: "hidden",
          borderRadius: 0,
        }}>
          <div style={{
            fontSize: 38,
            fontFamily: f.display,
            color: colors.bg,           // dark text on accent color
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
            opacity: blockW,
          }}>{primary}</div>
        </div>

        {/* Dark secondary panel */}
        {secondary && (
          <div style={{
            background: `${colors.surface}F2`,
            padding: "18px 28px",
            display: "flex",
            alignItems: "center",
            borderTop: `2px solid ${accentColor}`,
            borderRight: `1px solid ${colors.borderLight}`,
            borderBottom: `1px solid ${colors.borderLight}`,
            borderLeft: "none",
            borderRadius: 0,
          }}>
            <div style={{
              fontSize: 22,
              fontFamily: f.mono,
              color: colors.text2,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}>{secondary}</div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
