import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type ScoreboardProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "Scoreboard", name: "T7: Scoreboard", icon: "🏒",
  description: "Final score with optional badge",
  durationDefault: 150,
  fields: [
    { key: "teamA.name", label: "Team A", type: "text", default: "USA" },
    { key: "teamA.score", label: "A Score", type: "number", default: 0 },
    { key: "teamA.logo", label: "A Logo URL", type: "text", placeholder: "https://...", default: "" },
    { key: "teamB.name", label: "Team B", type: "text", default: "USSR" },
    { key: "teamB.score", label: "B Score", type: "number", default: 0 },
    { key: "teamB.logo", label: "B Logo URL", type: "text", placeholder: "https://...", default: "" },
    { key: "useLogo", label: "Show Logos", type: "toggle", default: false },
    { key: "event", label: "Event", type: "text", default: "" },
    { key: "date", label: "Date", type: "text", default: "" },
    { key: "badge", label: "Badge", type: "select", options: ["", "UPSET", "FINAL", "EXHIBITION", "OT"], default: "" },
  ],
};

export const Scoreboard: React.FC<ScoreboardProps> = ({ teamA, teamB, event, date, badge, useLogo, speed,}) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();
  const cardEnter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 15 });
  const cardOp = interpolate(cardEnter, [0, 1], [0, 1]);
  const scoreProg = spring({ frame: frame - 8, fps, config: { damping: 40, stiffness: 100, mass: 1 }, durationInFrames: 18 });
  const sA = Math.round(interpolate(scoreProg, [0, 1], [0, teamA.score]));
  const sB = Math.round(interpolate(scoreProg, [0, 1], [0, teamB.score]));
  const winner = teamA.score > teamB.score ? "A" : teamB.score > teamA.score ? "B" : null;
  const badgeEnter = spring({ frame: frame - 20, fps, config: anim.springBouncy, durationInFrames: 15 });
  const badgeScale = interpolate(badgeEnter, [0, 1], [1.4, 1]);
  const badgeOp = interpolate(badgeEnter, [0, 1], [0, 1]);
  const barW = interpolate(cardEnter, [0, 1], [0, 100]);

  const aEnter = spring({ frame, fps, config: anim.springSmooth, durationInFrames: 16 });
  const aSlide = interpolate(aEnter, [0, 1], [-60, 0]);
  const bEnter = spring({ frame: frame - 3, fps, config: anim.springSmooth, durationInFrames: 16 });
  const bSlide = interpolate(bEnter, [0, 1], [60, 0]);
  const metaEnter = spring({ frame: frame - 18, fps, config: anim.springSmooth, durationInFrames: 12 });
  const metaOp = interpolate(metaEnter, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />

      {/* Left spine */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 14,
        background: colors.yellow, transform: `scaleY(${cardOp})`, transformOrigin: "top" }} />

      <div style={{ position: "absolute", left: 80, right: 80, top: "50%", transform: "translateY(-50%)" }}>
        {/* Event info */}
        {(event || date) && (
          <div style={{ marginBottom: 24, opacity: metaOp }}>
            {event && <div style={{ fontSize: 20, fontFamily: f.mono, color: colors.text3,
              letterSpacing: "0.16em", textTransform: "uppercase" }}>{event}</div>}
            {date && <div style={{ fontSize: 18, fontFamily: f.mono, color: colors.text4,
              marginTop: 6, letterSpacing: "0.08em" }}>{date}</div>}
          </div>
        )}

        {/* Score row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Team A */}
          <div style={{ opacity: cardOp, transform: `translateX(${aSlide}px)` }}>
            {useLogo && teamA.logo ? (
              <img src={teamA.logo} style={{ width: 100, height: 100, objectFit: "contain" }} />
            ) : (
              <div style={{ fontSize: 96, fontFamily: f.display,
                color: winner === "A" ? colors.text1 : colors.text3,
                textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 0.9 }}>{teamA.name}</div>
            )}
            <div style={{ fontSize: 220, fontFamily: f.stats,
              color: winner === "A" ? colors.yellow : colors.text3,
              lineHeight: 0.85, letterSpacing: "0.01em" }}>{sA}</div>
          </div>

          {/* Center — badge + divider */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: cardOp }}>
            {badge && (
              <div style={{
                background: badge === "UPSET" ? colors.red : colors.surface3,
                color: colors.white, fontSize: 18, fontFamily: f.mono,
                padding: "8px 20px", letterSpacing: "0.12em",
                borderRadius: 0,           // sharp badge
                border: badge !== "UPSET" ? `1px solid ${colors.borderLight}` : "none",
                transform: `scale(${badgeScale})`, opacity: badgeOp,
              }}>{badge}</div>
            )}
            <div style={{ width: 2, height: 180, background: colors.borderLight }} />
          </div>

          {/* Team B */}
          <div style={{ textAlign: "right", opacity: cardOp, transform: `translateX(${bSlide}px)` }}>
            {useLogo && teamB.logo ? (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <img src={teamB.logo} style={{ width: 100, height: 100, objectFit: "contain" }} />
              </div>
            ) : (
              <div style={{ fontSize: 96, fontFamily: f.display,
                color: winner === "B" ? colors.text1 : colors.text3,
                textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 0.9 }}>{teamB.name}</div>
            )}
            <div style={{ fontSize: 220, fontFamily: f.stats,
              color: winner === "B" ? colors.yellow : colors.text3,
              lineHeight: 0.85, letterSpacing: "0.01em" }}>{sB}</div>
          </div>
        </div>

        {/* Bottom rule — expands full width */}
        <div style={{ height: 3, background: colors.yellow, marginTop: 24, width: `${barW}%` }} />
      </div>

      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
