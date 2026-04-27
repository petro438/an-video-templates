import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type StatComparisonProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "StatComparison", name: "T2: Stat Comparison", icon: "⚖️",
  description: "Side-by-side stat bars comparing two entities",
  durationDefault: 180,
  fields: [
    { key: "entityA.name", label: "Entity A", type: "text", placeholder: "BOS", default: "BOS" },
    { key: "entityA.color", label: "A Color", type: "color", default: "#FFFFFF" },
    { key: "entityA.logo", label: "A Logo URL", type: "text", placeholder: "https://...", default: "" },
    { key: "entityB.name", label: "Entity B", type: "text", placeholder: "MIL", default: "MIL" },
    { key: "entityB.color", label: "B Color", type: "color", default: "#FFFFFF" },
    { key: "entityB.logo", label: "B Logo URL", type: "text", placeholder: "https://...", default: "" },
    { key: "useLogo", label: "Show Logos", type: "toggle", default: false },
    { key: "stats", label: "Stats", type: "stat-rows", default: [
      { label: "PPG", valueA: 110, valueB: 105, suffix: "" },
      { label: "FG%", valueA: 47, valueB: 45, suffix: "%" },
    ]},
  ],
};

const Bar: React.FC<{
  label: string; valueA: number; valueB: number; suffix?: string; index: number; speed?: number;
}> = ({ label, valueA, valueB, suffix = "", index, speed }) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();
  const delay = 10 + index * 6;
  const enter = spring({ frame: frame - delay, fps, config: anim.springSmooth, durationInFrames: 18 });
  const op = interpolate(enter, [0, 1], [0, 1]);
  const prog = interpolate(enter, [0, 1], [0, 1]);
  const total = valueA + valueB || 1;
  const ratioA = valueA / total;
  const aWins = valueA >= valueB;
  const bw = 920;

  return (
    <div style={{ display: "flex", alignItems: "center", opacity: op, marginBottom: 16 }}>
      {/* Value A */}
      <div style={{ width: 160, textAlign: "right", fontSize: 52, fontFamily: f.stats,
        color: aWins ? colors.yellow : colors.text3, paddingRight: 28, letterSpacing: "0.01em" }}>
        {Math.round(valueA * prog)}{suffix}
      </div>
      {/* Bar A */}
      <div style={{ width: bw / 2, display: "flex", justifyContent: "flex-end" }}>
        <div style={{ height: 44, width: ratioA * bw / 2 * prog,
          background: aWins ? colors.yellow : colors.surface3 }} />
      </div>
      {/* Label */}
      <div style={{ width: 260, textAlign: "center", fontSize: 17, fontFamily: f.mono,
        color: colors.text3, textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</div>
      {/* Bar B */}
      <div style={{ width: bw / 2, display: "flex" }}>
        <div style={{ height: 44, width: (1 - ratioA) * bw / 2 * prog,
          background: !aWins ? colors.yellow : colors.surface3 }} />
      </div>
      {/* Value B */}
      <div style={{ width: 160, fontSize: 52, fontFamily: f.stats,
        color: !aWins ? colors.yellow : colors.text3, paddingLeft: 28, letterSpacing: "0.01em" }}>
        {Math.round(valueB * prog)}{suffix}
      </div>
    </div>
  );
};

export const StatComparison: React.FC<StatComparisonProps> = ({ entityA, entityB, stats, useLogo, speed }) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();
  const hdrEnter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 12 });
  const hdrOp = interpolate(hdrEnter, [0, 1], [0, 1]);
  const ruleW = interpolate(hdrEnter, [0, 1], [0, 100]);

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 1720 }}>
        {/* Entity names */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 20, opacity: hdrOp }}>
          {useLogo && entityA.logo ? (
            <img src={entityA.logo} style={{ width: 120, height: 120, objectFit: "contain" }} />
          ) : (
            <div style={{ fontSize: 100, fontFamily: f.display,
              color: entityA.color || colors.text1, textTransform: "uppercase",
              letterSpacing: "0.03em", lineHeight: 0.9 }}>{entityA.name}</div>
          )}
          <div style={{ fontSize: 20, fontFamily: f.mono, color: colors.text4,
            letterSpacing: "0.25em", paddingBottom: 12 }}>VS</div>
          {useLogo && entityB.logo ? (
            <img src={entityB.logo} style={{ width: 120, height: 120, objectFit: "contain" }} />
          ) : (
            <div style={{ fontSize: 100, fontFamily: f.display,
              color: entityB.color || colors.text1, textTransform: "uppercase",
              letterSpacing: "0.03em", lineHeight: 0.9, textAlign: "right" }}>{entityB.name}</div>
          )}
        </div>
        {/* Yellow dividing rule — expands full width */}
        <div style={{ height: 4, background: colors.yellow, marginBottom: 32, width: `${ruleW}%` }} />
        {stats.map((s, i) => <Bar key={i} label={s.label} valueA={s.valueA} valueB={s.valueB} suffix={s.suffix} index={i} speed={speed} />)}
      </div>
      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
