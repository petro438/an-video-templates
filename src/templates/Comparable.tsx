import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type ComparableProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "Comparable", name: "T11: Comparable Card", icon: "🔄",
  description: "Analogy comparison — 'This is like that'",
  durationDefault: 180,
  fields: [
    { key: "subjectA.name", label: "Subject A", type: "text", placeholder: "Miracle on Ice", default: "" },
    { key: "subjectA.detail", label: "A Detail", type: "text", placeholder: "1980 Olympics", default: "" },
    { key: "subjectA.stat", label: "A Stat", type: "text", placeholder: "+600", default: "" },
    { key: "subjectB.name", label: "Subject B", type: "text", placeholder: "BC vs Notre Dame", default: "" },
    { key: "subjectB.detail", label: "B Detail", type: "text", placeholder: "1993 College Football", default: "" },
    { key: "subjectB.stat", label: "B Stat", type: "text", placeholder: "+450", default: "" },
    { key: "connector", label: "Connector", type: "text", placeholder: "IS COMPARABLE TO", default: "IS COMPARABLE TO" },
    { key: "negated", label: "Negated (strikethrough)", type: "toggle", default: false },
  ],
};

const ComparableSide: React.FC<{
  name: string; detail: string; stat: string; logo?: string; useLogo?: boolean; delay: number; negated: boolean; speed?: number;
}> = ({ name, detail, stat, logo, useLogo, delay, negated, speed }) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: anim.springSnappy, durationInFrames: 15 });
  const op = interpolate(enter, [0, 1], [0, 1]);
  const slideY = interpolate(enter, [0, 1], [20, 0]);

  return (
    <div style={{
      flex: 1, ...styles.card, padding: "52px 44px", textAlign: "center",
      opacity: op, transform: `translateY(${slideY}px)`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Top accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: colors.yellow }} />

      {useLogo && logo ? (
        <img src={logo} style={{ width: 80, height: 80, objectFit: "contain", marginBottom: 14 }} />
      ) : (
        <div style={{ fontSize: 52, fontFamily: f.display,
          color: colors.white, textTransform: "uppercase", letterSpacing: "0.04em",
          marginBottom: 14 }}>{name}</div>
      )}

      <div style={{ fontSize: 22, fontFamily: f.mono,
        color: colors.text2, marginBottom: 32, letterSpacing: "0.06em",
        textTransform: "uppercase" }}>{detail}</div>

      <div style={{ fontSize: 88, fontFamily: f.stats, color: colors.yellow,
        letterSpacing: "0.02em" }}>{stat}</div>

      {/* Strikethrough overlay */}
      {negated && (() => {
        const strikeEnter = spring({ frame: frame - delay - 15, fps, config: anim.springSmooth, durationInFrames: 12 });
        const strikeW = interpolate(strikeEnter, [0, 1], [0, 100]);
        return (
          <div style={{
            position: "absolute", top: "50%", left: 0, right: 0,
            height: 4, background: colors.red,
            width: `${strikeW}%`, transform: "rotate(-4deg)",
          }} />
        );
      })()}
    </div>
  );
};

export const Comparable: React.FC<ComparableProps> = ({
  subjectA, subjectB, connector = "IS COMPARABLE TO", negated = false, useLogo, speed,
}) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();

  const connEnter = spring({ frame: frame - 12, fps, config: anim.springSmooth, durationInFrames: 12 });
  const connOp = interpolate(connEnter, [0, 1], [0, 1]);

  const negEnter = spring({ frame: frame - 25, fps, config: anim.springBouncy, durationInFrames: 15 });
  const negOp = negated ? interpolate(negEnter, [0, 1], [0, 1]) : 0;

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />
      <div style={{ position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)", width: 1560 }}>
        <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
          <ComparableSide {...subjectA} useLogo={useLogo} delay={5} negated={false} speed={speed} />

          {/* Connector */}
          <div style={{
            width: 220, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 10,
            opacity: connOp, flexShrink: 0,
          }}>
            <div style={{ width: 60, height: 2, background: colors.borderLight }} />
            <div style={{ fontSize: 17, fontFamily: f.mono,
              color: negated ? colors.red : colors.text2,
              letterSpacing: "0.06em", textAlign: "center", lineHeight: 1.4,
              textDecoration: negated ? "line-through" : "none",
            }}>{connector}</div>
            <div style={{ width: 60, height: 2, background: colors.borderLight }} />

            {negated && (
              <div style={{
                fontSize: 52, fontFamily: f.stats, color: colors.red,
                opacity: negOp, letterSpacing: "0.04em",
              }}>NOT</div>
            )}
          </div>

          <ComparableSide {...subjectB} useLogo={useLogo} delay={10} negated={false} speed={speed} />
        </div>
      </div>

      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
