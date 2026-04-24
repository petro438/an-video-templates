import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type SeasonScheduleProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "SeasonSchedule",
  name: "T16: Season Schedule",
  icon: "📅",
  description: "Season schedule grid showing W/L results in green and red",
  durationDefault: 240,
  fields: [
    { key: "title", label: "Title", type: "text", placeholder: "2024 NFL Season", default: "" },
    { key: "team", label: "Team Name", type: "text", placeholder: "Chiefs", default: "" },
    { key: "games", label: "Games", type: "paste-table", default: [
      { name: "WK 1", values: ["vs Ravens", "W 27-20"], highlight: false },
      { name: "WK 2", values: ["@ Bengals", "L 17-25"], highlight: false },
    ]},
    { key: "accentColor", label: "Team Color", type: "color", default: "#00c358" },
  ],
};

export const SeasonSchedule: React.FC<SeasonScheduleProps> = ({
  title, team, games, accentColor = colors.green, speed,}) => {
  const frame = useCurrentFrame() * (speed || 1);
  const { fps } = useVideoConfig();

  const titleEnter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 12 });
  const titleOp = interpolate(titleEnter, [0, 1], [0, 1]);

  if (!games || games.length === 0) return <AbsoluteFill style={styles.darkBg} />;

  const cols = Math.min(4, Math.ceil(games.length / 4) > 4 ? 4 : Math.ceil(games.length / Math.ceil(games.length / 4)));
  const rows = Math.ceil(games.length / cols);
  const cellW = Math.floor(1640 / cols);
  const cellH = Math.min(120, Math.floor(700 / rows));

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />
      <div style={{ position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)", width: cellW * cols }}>

        {title && (
          <div style={{ marginBottom: 8, opacity: titleOp }}>
            <div style={{ fontSize: 64, fontFamily: f.display, color: colors.white,
              textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</div>
          </div>
        )}
        {team && (
          <div style={{ marginBottom: 20, opacity: titleOp }}>
            <div style={{ fontSize: 28, fontFamily: f.body, color: accentColor,
              textTransform: "uppercase", letterSpacing: "0.08em" }}>{team}</div>
            <div style={{ height: 4, background: accentColor, marginTop: 8, width: `${titleOp * 100}%` }} />
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {games.map((game, i) => {
            const cells = game.cells ?? [game.name, ...(game.values || [])];
            const week = cells[0] || "";
            const opponent = cells[1] || "";
            const result = cells[2] || "";
            const isWin = result.toUpperCase().startsWith("W");
            const isLoss = result.toUpperCase().startsWith("L");
            const resultColor = isWin ? colors.green : isLoss ? colors.red : colors.text3;
            const bgColor = isWin ? "rgba(0,195,88,0.08)" : isLoss ? "rgba(232,32,32,0.08)" : "transparent";

            const d = 10 + i * 3;
            const re = spring({ frame: frame - d, fps, config: anim.springSnappy, durationInFrames: 12 });
            const rOp = interpolate(re, [0, 1], [0, 1]);
            const rScale = interpolate(re, [0, 1], [0.85, 1]);

            return (
              <div key={i} style={{
                width: cellW, height: cellH, padding: "8px 12px",
                borderBottom: `1px solid ${colors.border}`,
                borderRight: (i % cols !== cols - 1) ? `1px solid ${colors.border}` : "none",
                background: bgColor,
                borderLeft: `4px solid ${resultColor}`,
                opacity: rOp, transform: `scale(${rScale})`,
                display: "flex", flexDirection: "column", justifyContent: "center",
              }}>
                <div style={{ fontSize: 13, fontFamily: f.mono, color: colors.text3,
                  textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{week}</div>
                <div style={{ fontSize: 22, fontFamily: f.body, color: colors.text2,
                  marginBottom: 2 }}>{opponent}</div>
                <div style={{ fontSize: 28, fontFamily: f.stats, color: resultColor,
                  letterSpacing: "0.02em" }}>{result}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
