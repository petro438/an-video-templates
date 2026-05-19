import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, type ScoreboardProps } from "../lib/theme-an";
import { f } from "../lib/fonts-an";

export const ScoreboardAN: React.FC<ScoreboardProps> = ({
  teamA, teamB, event, date, badge, useLogo, speed,
}) => {
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
      {/* Left spine */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 12,
        background: colors.green, transform: `scaleY(${cardOp})`, transformOrigin: "top",
      }} />

      <div style={{ position: "absolute", left: 80, right: 80, top: "50%", transform: "translateY(-50%)" }}>
        {/* Event meta */}
        {(event || date) && (
          <div style={{ marginBottom: 32, opacity: metaOp }}>
            {event && <div style={{
              fontSize: 18, fontFamily: f.mono, color: colors.text3,
              letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 500,
            }}>{event}</div>}
            {date && <div style={{
              fontSize: 16, fontFamily: f.mono, color: colors.text3,
              marginTop: 6, letterSpacing: "0.08em",
            }}>{date}</div>}
          </div>
        )}

        {/* Score row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Team A */}
          <div style={{ opacity: cardOp, transform: `translateX(${aSlide}px)` }}>
            {useLogo && teamA.logo ? (
              <img src={teamA.logo} style={{ width: 100, height: 100, objectFit: "contain" }} />
            ) : (
              <div style={{
                fontSize: 88, fontFamily: f.display, fontWeight: 700,
                color: winner === "A" ? colors.text1 : colors.text3,
                letterSpacing: "-0.02em", lineHeight: 0.95,
              }}>{teamA.name}</div>
            )}
            <div style={{
              fontSize: 220, fontFamily: f.stats, fontWeight: 700,
              color: winner === "A" ? colors.green : colors.text3,
              lineHeight: 0.9, letterSpacing: "-0.04em",
              fontVariantNumeric: "tabular-nums",
            }}>{sA}</div>
          </div>

          {/* Center divider + badge */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity: cardOp }}>
            {badge && (
              <div style={{
                background: badge === "UPSET" ? colors.redMuted : colors.surface3,
                color: badge === "UPSET" ? colors.red : colors.text1,
                fontSize: 14, fontFamily: f.mono, fontWeight: 600,
                padding: "8px 16px", letterSpacing: "0.14em",
                borderRadius: 9999,
                border: badge === "UPSET" ? `1px solid ${colors.red}` : `1px solid ${colors.border}`,
                transform: `scale(${badgeScale})`, opacity: badgeOp,
              }}>{badge}</div>
            )}
            <div style={{ width: 1, height: 180, background: colors.border }} />
          </div>

          {/* Team B */}
          <div style={{ textAlign: "right", opacity: cardOp, transform: `translateX(${bSlide}px)` }}>
            {useLogo && teamB.logo ? (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <img src={teamB.logo} style={{ width: 100, height: 100, objectFit: "contain" }} />
              </div>
            ) : (
              <div style={{
                fontSize: 88, fontFamily: f.display, fontWeight: 700,
                color: winner === "B" ? colors.text1 : colors.text3,
                letterSpacing: "-0.02em", lineHeight: 0.95,
              }}>{teamB.name}</div>
            )}
            <div style={{
              fontSize: 220, fontFamily: f.stats, fontWeight: 700,
              color: winner === "B" ? colors.green : colors.text3,
              lineHeight: 0.9, letterSpacing: "-0.04em",
              fontVariantNumeric: "tabular-nums",
            }}>{sB}</div>
          </div>
        </div>

        {/* Bottom rule — animates from left */}
        <div style={{ height: 2, background: colors.green, marginTop: 32, width: `${barW}%`, borderRadius: 1 }} />
      </div>

      <div style={styles.watermark}>
        <span style={{ color: colors.green, marginRight: 8 }}>●</span>ACTION NETWORK
      </div>
    </AbsoluteFill>
  );
};
