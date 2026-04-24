import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type GameFlashProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "GameFlash",
  name: "T17: Game Flash",
  icon: "⚡",
  description: "Games flash onto screen one at a time — opponent, score, result",
  durationDefault: 300,
  fields: [
    { key: "title", label: "Title", type: "text", placeholder: "2024 Season Results", default: "" },
    { key: "games", label: "Games (week, opponent, score)", type: "paste-table", default: [
      { name: "WK 1", values: ["vs Ravens", "W 27-20"], highlight: false },
      { name: "WK 2", values: ["@ Bengals", "L 17-25"], highlight: false },
    ]},
    { key: "framesPerGame", label: "Frames Per Game", type: "number", placeholder: "30", default: 30 },
    { key: "accentColor", label: "Accent Color", type: "color", default: "#00c358" },
  ],
};

export const GameFlash: React.FC<GameFlashProps> = ({
  title, games, framesPerGame = 30, accentColor = colors.green, speed,}) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();

  if (!games || games.length === 0) return <AbsoluteFill style={styles.darkBg} />;

  const titleEnter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 12 });
  const titleOp = interpolate(titleEnter, [0, 1], [0, 1]);

  const titleFrames = 20;
  const gameFrame = frame - titleFrames;
  const activeIndex = Math.floor(gameFrame / framesPerGame);
  const localFrame = gameFrame - activeIndex * framesPerGame;

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />
      <div style={{ position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)", width: 1400, textAlign: "center" }}>

        {title && (
          <div style={{ marginBottom: 60, opacity: titleOp }}>
            <div style={{ fontSize: 48, fontFamily: f.display, color: colors.text3,
              textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</div>
            <div style={{ height: 3, background: accentColor, marginTop: 12,
              width: `${titleOp * 40}%`, marginLeft: "30%" }} />
          </div>
        )}

        {games.map((game, i) => {
          if (i !== activeIndex) return null;

          const cells = game.cells ?? [game.name, ...(game.values || [])];
          const week = cells[0] || "";
          const opponent = cells[1] || "";
          const result = cells[2] || "";
          const isWin = result.toUpperCase().startsWith("W");
          const isLoss = result.toUpperCase().startsWith("L");
          const resultColor = isWin ? colors.green : isLoss ? colors.red : colors.text2;

          const enterSpring = spring({ frame: localFrame, fps, config: anim.springSnappy, durationInFrames: 10 });
          const enterOp = interpolate(enterSpring, [0, 1], [0, 1]);
          const enterSlide = interpolate(enterSpring, [0, 1], [60, 0]);

          const scoreDelay = 6;
          const scoreSpring = spring({ frame: localFrame - scoreDelay, fps, config: anim.springBouncy, durationInFrames: 12 });
          const scoreOp = interpolate(scoreSpring, [0, 1], [0, 1]);
          const scoreScale = interpolate(scoreSpring, [0, 1], [0.5, 1]);

          return (
            <div key={i}>
              <div style={{ opacity: enterOp, transform: `translateY(${enterSlide}px)` }}>
                <div style={{ fontSize: 22, fontFamily: f.mono, color: colors.text3,
                  textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16 }}>{week}</div>
                <div style={{ fontSize: 80, fontFamily: f.display, color: colors.white,
                  textTransform: "uppercase", letterSpacing: "0.03em", lineHeight: 1.1 }}>{opponent}</div>
              </div>
              <div style={{ marginTop: 30, opacity: scoreOp, transform: `scale(${scoreScale})` }}>
                <div style={{ fontSize: 100, fontFamily: f.stats, color: resultColor,
                  letterSpacing: "0.04em" }}>{result}</div>
                <div style={{ width: 120, height: 5, background: resultColor,
                  margin: "12px auto 0", opacity: 0.6 }} />
              </div>
            </div>
          );
        })}

        <div style={{ position: "absolute", bottom: -80, left: 0, right: 0,
          display: "flex", justifyContent: "center", gap: 6 }}>
          {games.map((_, i) => {
            const done = i < activeIndex;
            const active = i === activeIndex;
            const cells = games[i].cells ?? [games[i].name, ...(games[i].values || [])];
            const result = cells[2] || "";
            const isWin = result.toUpperCase().startsWith("W");
            const dotColor = done ? (isWin ? colors.green : colors.red) : active ? colors.white : colors.text4;
            return <div key={i} style={{ width: active ? 24 : 8, height: 8,
              borderRadius: 4, background: dotColor, transition: "all 0.2s" }} />;
          })}
        </div>
      </div>

      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
