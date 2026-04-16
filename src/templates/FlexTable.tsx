import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, anim, styles, Scanlines, type FlexTableProps, type TemplateSchema } from "../lib/theme";
import { f } from "../lib/fonts";

export const schema: TemplateSchema = {
  id: "FlexTable", name: "T15: Flex Table", icon: "📋",
  description: "Flexible table — variable columns, variable rows, no rank required",
  durationDefault: 210,
  fields: [
    { key: "title", label: "Title", type: "text", placeholder: "Passing Stats by Quarter", default: "" },
    { key: "columns", label: "Columns (header, align)", type: "textarea", placeholder: "Player,left\nYards,right\nTDs,center", default: [
      { header: "Player", align: "left" },
      { header: "YDS", align: "right" },
      { header: "TD", align: "center" },
      { header: "INT", align: "center" },
      { header: "RTG", align: "right" },
    ]},
    { key: "rows", label: "Rows", type: "paste-table", default: [
      { cells: ["Mahomes", "312", "3", "0", "118.2"], highlight: true },
      { cells: ["Allen", "287", "2", "1", "101.4"] },
      { cells: ["Burrow", "241", "2", "0", "104.8"] },
      { cells: ["Hurts", "198", "1", "1", "88.2"] },
    ]},
    { key: "highlightColor", label: "Highlight Color", type: "color", default: "#00c358" },
    { key: "showRank", label: "Show Rank", type: "toggle", default: false },
  ],
};

export const FlexTable: React.FC<FlexTableProps> = ({
  title, columns, rows, highlightColor = colors.yellow, showRank = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEnter = spring({ frame, fps, config: anim.springSnappy, durationInFrames: 12 });
  const titleOp = interpolate(titleEnter, [0, 1], [0, 1]);

  if (!columns || columns.length === 0) return <AbsoluteFill style={styles.darkBg} />;

  // Auto-size columns to fit within 1600px
  const rankW = showRank ? 70 : 0;
  const available = 1640 - rankW;
  const colW = Math.floor(available / columns.length);

  // Font sizes based on row count — shrink for many rows
  const rowCount = rows?.length || 1;
  const numFontSize = rowCount > 8 ? 28 : rowCount > 6 ? 34 : 40;
  const nameFontSize = rowCount > 8 ? 24 : rowCount > 6 ? 28 : 32;
  const rowPad = rowCount > 8 ? "12px 0" : rowCount > 6 ? "16px 0" : "20px 0";

  const alignMap = { left: "left" as const, center: "center" as const, right: "right" as const };

  return (
    <AbsoluteFill style={styles.darkBg}>
      <Scanlines />
      <div style={{ position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)", width: Math.min(rankW + columns.length * colW, 1720) }}>

        {/* Title */}
        {title && (
          <div style={{ marginBottom: 20, opacity: titleOp }}>
            <div style={{ fontSize: 64, fontFamily: f.display, color: colors.white,
              textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</div>
            <div style={{ height: 4, background: highlightColor, marginTop: 10, width: `${titleOp * 100}%` }} />
          </div>
        )}

        {/* Column headers */}
        <div style={{ display: "flex", padding: "14px 0",
          borderBottom: `2px solid ${colors.borderLight}`, opacity: titleOp }}>
          {showRank && (
            <div style={{ width: rankW, fontSize: 13, fontFamily: f.mono,
              color: colors.text3, textTransform: "uppercase", letterSpacing: "0.14em" }}>#</div>
          )}
          {columns.map((col, i) => (
            <div key={i} style={{
              width: colW,
              textAlign: alignMap[col.align || "left"],
              fontSize: 13, fontFamily: f.mono, color: colors.text3,
              textTransform: "uppercase", letterSpacing: "0.14em",
              paddingRight: i < columns.length - 1 ? 12 : 0,
            }}>{col.header}</div>
          ))}
        </div>

        {/* Rows */}
        {(rows || []).map((row, i) => {
          const d = 8 + i * 4;
          const re = spring({ frame: frame - d, fps, config: anim.springSnappy, durationInFrames: 12 });
          const rOp = interpolate(re, [0, 1], [0, 1]);
          const rSlide = interpolate(re, [0, 1], [-28, 0]);
          const hl = row.highlight;

          return (
            <div key={i} style={{
              display: "flex", padding: rowPad,
              background: hl ? `${highlightColor}0E` : "transparent",
              borderBottom: `1px solid ${colors.border}`,
              borderLeft: hl ? `5px solid ${highlightColor}` : "5px solid transparent",
              paddingLeft: hl ? 10 : 0,
              opacity: rOp, transform: `translateX(${rSlide}px)`,
            }}>
              {showRank && (
                <div style={{ width: rankW, fontSize: numFontSize, fontFamily: f.stats,
                  color: hl ? highlightColor : colors.text3 }}>{i + 1}</div>
              )}
              {(row.cells || []).map((cell, j) => {
                const col = columns[j];
                const isFirst = j === 0;
                const align = col ? alignMap[col.align || "left"] : "left";
                return (
                  <div key={j} style={{
                    width: colW,
                    textAlign: align,
                    fontSize: isFirst ? nameFontSize : numFontSize,
                    fontFamily: isFirst ? f.body : f.stats,
                    fontWeight: isFirst && hl ? 700 : 400,
                    color: hl ? (isFirst ? colors.text1 : colors.white) : (isFirst ? colors.text2 : colors.text3),
                    letterSpacing: isFirst ? "0.02em" : "0.01em",
                    paddingRight: j < columns.length - 1 ? 12 : 0,
                  }}>{cell}</div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div style={styles.watermark}>ACTION</div>
    </AbsoluteFill>
  );
};
