import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type OddsCardProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "OddsCard", name: "T1: Odds Card", icon: "💰",
  description: "Moneyline, spread, or over/under display",
  durationDefault: 150,
  fields: [
    { key: "event", label: "Event Label", type: "text", placeholder: "NFL Week 1 · Sunday", default: "" },
    { key: "teamA.name", label: "Team A Name", type: "text", placeholder: "KC", default: "KC" },
    { key: "teamA.odds", label: "Team A Odds", type: "text", placeholder: "-180", default: "-180" },
    { key: "teamA.role", label: "Team A Role", type: "select", options: ["FAVORITE", "UNDERDOG", ""], default: "FAVORITE" },
    { key: "teamA.color", label: "Team A Color", type: "color", default: "#E82020" },
    { key: "teamB.name", label: "Team B Name", type: "text", placeholder: "DET", default: "DET" },
    { key: "teamB.odds", label: "Team B Odds", type: "text", placeholder: "+155", default: "+155" },
    { key: "teamB.role", label: "Team B Role", type: "select", options: ["FAVORITE", "UNDERDOG", ""], default: "UNDERDOG" },
    { key: "teamB.color", label: "Team B Color", type: "color", default: "#00c358" },
    { key: "variant", label: "Variant", type: "select", options: ["two-way", "three-way"], default: "two-way" },
    { key: "draw.odds", label: "Draw Odds", type: "text", placeholder: "+500", default: "", showWhen: { field: "variant", value: "three-way" } },
  ],
};

const OddsSide: React.FC<{
  name: string; odds: string; role?: string; teamColor?: string; delay: number;
}> = ({ name, odds, role, teamColor, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: anim.springSnappy, durationInFrames: 15 });
  const slideY = interpolate(enter, [0, 1], [24, 0]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  const isNumeric = /^[+-]?\d+/.test(odds);
  let displayOdds = odds;
  if (isNumeric) {
    const prefix = odds.startsWith("+") ? "+" : odds.startsWith("-") ? "-" : "";
    const num = parseFloat(odds.replace(/[^0-9]/g, ""));
    const p = spring({ frame: frame - delay - 4, fps, config: anim.springSmooth, durationInFrames: 20 });
    displayOdds = `${prefix}${Math.round(interpolate(p, [0, 1], [0, num]))}`;
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 8, transform: `translateY(${slideY}px)`, opacity }}>
      <div style={{ fontSize: 72, fontFamily: f.display,
        color: teamColor || colors.white, letterSpacing: "0.02em", textTransform: "uppercase" }}>{name}</div>
      <div style={{ fontSize: 130, fontFamily: f.stats,
        color: colors.white, lineHeight: 1, letterSpacing: "0.02em" }}>{displayOdds}</div>
      {role && (
        // Sharp rectangular broadcast label — no pill shape
        <div style={{
          border: `1.5px solid ${colors.borderLight}`,
          color: colors.text2, fontSize: 18,
          fontFamily: f.mono, letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "7px 20px", marginTop: 8,
          borderRadius: 0,
        }}>{role}</div>
      )}
    </div>
  );
};

export const OddsCard: React.FC<OddsCardProps> = ({
  event, teamA, teamB, draw, variant = draw ? "three-way" : "two-way",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardEnter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 18 });
  const cardScale = interpolate(cardEnter, [0, 1], [0.97, 1]);
  const cardOpacity = interpolate(cardEnter, [0, 1], [0, 1]);
  const barW = interpolate(cardEnter, [0, 1], [0, 100]);

  const drawEnter = spring({ frame: frame - 20, fps, config: anim.springSmooth, durationInFrames: 12 });
  const drawOp = variant === "three-way" ? interpolate(drawEnter, [0, 1], [0, 1]) : 0;
  const drawSlide = interpolate(drawEnter, [0, 1], [12, 0]);

  let displayDraw = draw?.odds || "";
  if (draw && /^[+-]?\d+/.test(draw.odds)) {
    const pre = draw.odds.startsWith("+") ? "+" : draw.odds.startsWith("-") ? "-" : "";
    const n = parseFloat(draw.odds.replace(/[^0-9]/g, ""));
    const dp = spring({ frame: frame - 24, fps, config: anim.springSmooth, durationInFrames: 18 });
    displayDraw = `${pre}${Math.round(interpolate(dp, [0, 1], [0, n]))}`;
  }

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />
      <div style={{ position: "absolute", top: "50%", left: "50%",
        transform: `translate(-50%, -50%) scale(${cardScale})`,
        opacity: cardOpacity, width: 1500, ...styles.card, padding: "64px 80px", overflow: "hidden" }}>
        {/* Top yellow accent bar — expands left to right */}
        <div style={{ position: "absolute", top: 0, left: 0, height: 6,
          width: `${barW}%`, background: colors.yellow }} />
        {event && (
          <div style={{ textAlign: "center", fontSize: 20, fontFamily: f.mono,
            color: colors.text3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 44 }}>{event}</div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <OddsSide name={teamA.name} odds={teamA.odds} role={teamA.role} teamColor={teamA.color} delay={5} />
          {/* Center divider — bold vertical rule */}
          <div style={{ width: 2, height: 200, background: colors.borderLight, margin: "0 60px", flexShrink: 0 }} />
          <OddsSide name={teamB.name} odds={teamB.odds} role={teamB.role} teamColor={teamB.color} delay={10} />
        </div>
        {variant === "three-way" && draw && (
          <div style={{ textAlign: "center", marginTop: 32, paddingTop: 24,
            borderTop: `1px solid ${colors.border}`, opacity: drawOp, transform: `translateY(${drawSlide}px)` }}>
            <div style={{ fontSize: 16, fontFamily: f.mono,
              color: colors.text3, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>DRAW</div>
            <div style={{ fontSize: 84, fontFamily: f.stats, color: colors.orange, letterSpacing: "0.02em" }}>{displayDraw}</div>
          </div>
        )}
      </div>
      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
