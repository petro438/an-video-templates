import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type StandingsTableProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "StandingsTable", name: "T6: Standings Table", icon: "🏆",
  description: "Rankings with highlighted rows",
  durationDefault: 180,
  fields: [
    { key: "title", label: "Title", type: "text", placeholder: "AFC East Standings", default: "" },
    { key: "columns", label: "Column Headers", type: "text-list", placeholder: "W,L,PTS", default: ["W", "L", "PTS"] },
    { key: "rows", label: "Rows", type: "table-rows", default: [
      { name: "Team 1", values: ["10", "3", "20"], highlight: true },
      { name: "Team 2", values: ["8", "5", "16"], highlight: false },
    ]},
    { key: "highlightColor", label: "Highlight Color", type: "color", default: "#00c358" },
  ],
};

export const StandingsTable: React.FC<StandingsTableProps> = ({ title, columns, rows, highlightColor = colors.yellow }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleEnter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 12 });
  const titleOp = interpolate(titleEnter, [0, 1], [0, 1]);
  const nameW = 480, dataW = 180, rankW = 90;
  const totalW = rankW + nameW + columns.length * dataW;

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: Math.min(totalW, 1720) }}>
        {/* Title with yellow bottom rule */}
        <div style={{ marginBottom: 0, opacity: titleOp }}>
          <div style={{ fontSize: 72, fontFamily: f.display, color: colors.text1,
            textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 0.9,
            marginBottom: 12 }}>{title}</div>
          <div style={{ height: 4, background: highlightColor, marginBottom: 0, width: `${titleOp * 100}%` }} />
        </div>

        <div style={{ overflow: "hidden" }}>
          {/* Column header row */}
          <div style={{ display: "flex", padding: "16px 0",
            borderBottom: `2px solid ${colors.borderLight}`, opacity: titleOp }}>
            <div style={{ width: rankW, fontSize: 14, fontFamily: f.mono,
              color: colors.text3, textTransform: "uppercase", letterSpacing: "0.14em" }}>#</div>
            <div style={{ width: nameW, fontSize: 14, fontFamily: f.mono,
              color: colors.text3, textTransform: "uppercase", letterSpacing: "0.14em" }}>NAME</div>
            {columns.map((c, i) => (
              <div key={i} style={{ width: dataW, textAlign: "center", fontSize: 14,
                fontFamily: f.mono, color: colors.text3, textTransform: "uppercase", letterSpacing: "0.14em" }}>{c}</div>
            ))}
          </div>

          {rows.map((row, i) => {
            const d = 8 + i * 5;
            const re = spring({ frame: frame - d, fps, config: anim.springSnappy, durationInFrames: 12 });
            const rOp = interpolate(re, [0, 1], [0, 1]);
            const rSlide = interpolate(re, [0, 1], [-32, 0]);
            const hl = row.highlight;
            return (
              <div key={i} style={{
                display: "flex", padding: "20px 0",
                background: hl ? `${highlightColor}0E` : "transparent",
                borderBottom: `1px solid ${colors.border}`,
                borderLeft: hl ? `5px solid ${highlightColor}` : "5px solid transparent",
                paddingLeft: hl ? 12 : 0,
                opacity: rOp, transform: `translateX(${rSlide}px)`,
              }}>
                <div style={{ width: rankW, fontSize: 40, fontFamily: f.stats,
                  color: hl ? highlightColor : colors.text3 }}>{row.rank ?? i + 1}</div>
                <div style={{ width: nameW, fontSize: 30,
                  fontFamily: f.body, color: hl ? colors.text1 : colors.text2,
                  fontWeight: hl ? 700 : 400, letterSpacing: "0.02em" }}>{row.name}</div>
                {row.values.map((v, j) => (
                  <div key={j} style={{ width: dataW, textAlign: "center", fontSize: 40,
                    fontFamily: f.stats, color: hl ? colors.text1 : colors.text3 }}>{v}</div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
