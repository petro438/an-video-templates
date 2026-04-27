// ═══════════════════════════════════════════════════════════════
// Action Network Video Template — Retro Broadcast Design System
// VHS-era ESPN aesthetic: CRT darkness, broadcast yellow, hot geometry
// ═══════════════════════════════════════════════════════════════
import React from "react";

export const colors = {
  bg: "#08080F",           // near-black navy — CRT off state
  surface: "#0F0F1C",
  surface2: "#161626",
  surface3: "#1E1E32",
  card: "#0F0F1C",
  // Primary accent — broadcast yellow (ESPN-era gold)
  yellow: "#00c358",
  yellowLight: "#FFDC33",
  yellowDark: "#CC9900",
  yellowMuted: "rgba(255,208,0,0.12)",
  // Alias: templates reference colors.green as the main accent
  green: "#00c358",
  greenLight: "#FFDC33",
  greenDark: "#CC9900",
  greenMuted: "rgba(255,208,0,0.12)",
  // Broadcast red — loss / negative / alert
  red: "#E82020",
  redMuted: "rgba(232,32,32,0.12)",
  orange: "#FF5500",       // retro sideline orange
  gold: "#00c358",
  blue: "#1A5FE8",         // deep broadcast blue
  cyan: "#00C8FF",         // CRT phosphor highlight
  white: "#FFFFFF",        // crisp white — no aged cream
  text1: "#FFFFFF",
  text2: "#99AABB",        // cool mid-tone
  text3: "#445566",        // muted blue-gray
  text4: "#1E1E30",        // barely visible on bg
  border: "#1A1A2E",
  borderLight: "#252540",
  borderBright: "#00c358",
} as const;

// ── Typography ──
// Display: League Gothic — newspaper headline meets broadcast chyron
// Stats:   Bebas Neue   — scoreboard numbers, tall all-caps
// Body:    Barlow Condensed — broadcast-appropriate, compact, legible
// Mono:    IBM Plex Mono — data, timestamps, source attributions
export const fonts = {
  display: "'League Gothic', 'Arial Narrow', sans-serif",
  stats: "'Bebas Neue', 'Impact', sans-serif",
  body: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  mono: "'IBM Plex Mono', 'SF Mono', monospace",
} as const;

export const layout = { width: 1920, height: 1080, safeMargin: 80 } as const;

export const anim = {
  springSnappy: { damping: 280, stiffness: 400, mass: 0.65 }, // decisive, slams in
  springBouncy: { damping: 12, stiffness: 200, mass: 0.9 },   // energetic
  springSmooth: { damping: 38, stiffness: 150, mass: 0.9 },   // smooth but quick
  fadeIn: 8, stagger: 2, countUp: 20,
} as const;

export const styles = {
  darkBg: { backgroundColor: colors.bg } as React.CSSProperties,
  card: {
    backgroundColor: colors.card,
    borderRadius: 0,          // sharp corners — hard geometry, no SaaS softness
    border: `2px solid ${colors.borderLight}`,
  } as React.CSSProperties,
  watermark: {
    position: "absolute" as const, bottom: 32, right: 48,
    fontSize: 14, fontFamily: fonts.mono, fontWeight: 400,
    color: colors.text4, letterSpacing: "0.25em", textTransform: "uppercase" as const,
  } as React.CSSProperties,
} as const;

// ── CRT Scan-Line Overlay ──
// Drop <Scanlines /> inside any AbsoluteFill to add the retro CRT texture.
export const Scanlines: React.FC = () => (
  React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      backgroundImage:
        "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.10) 3px, rgba(0,0,0,0.12) 4px)",
      pointerEvents: "none",
      zIndex: 100,
    },
  })
);

// ── Schema Field Types ──
export type FieldType =
  | "text" | "textarea" | "number" | "select" | "color" | "toggle"
  | "stat-rows" | "text-list" | "table-rows" | "paste-stats" | "paste-table"
  | "paste-lines" | "paste-kv" | "paste-points";

export interface SchemaField {
  key: string;
  label: string;
  type: FieldType;
  default: any;
  placeholder?: string;
  options?: string[];
  showWhen?: { field: string; value: any };
}

export interface TemplateSchema {
  id: string;
  name: string;
  icon: string;
  description: string;
  durationDefault: number;
  fields: SchemaField[];
}

// ── Shared Prop Interfaces ──
export interface OddsCardProps {
  event?: string;
  teamA: { name: string; odds: string; role?: string; color?: string; logo?: string };
  teamB: { name: string; odds: string; role?: string; color?: string; logo?: string };
  draw?: { odds: string };
  variant?: "two-way" | "three-way";
  useLogo?: boolean;
  speed?: number;
}
export interface BigNumberProps {
  number: string; suffix?: string; label: string; sublabel?: string;
  color?: string; countUp?: boolean;
  speed?: number;
}
export interface QuoteCardProps {
  quote: string; attribution: string; role?: string;
  variant?: "standard" | "dramatic";
  speed?: number;
}
export interface LowerThirdProps {
  primary: string; secondary?: string; accentColor?: string;
  position?: "left" | "right";
  speed?: number;
}
export interface StatComparisonProps {
  entityA: { name: string; color?: string; logo?: string };
  entityB: { name: string; color?: string; logo?: string };
  stats: Array<{ label: string; valueA: number; valueB: number; suffix?: string }>;
  useLogo?: boolean;
  speed?: number;
}
export interface ScoreboardProps {
  teamA: { name: string; score: number; logo?: string };
  teamB: { name: string; score: number; logo?: string };
  event?: string; date?: string; badge?: string;
  useLogo?: boolean;
  speed?: number;
}
export interface ProbabilityVizProps {
  percentage: number; label: string; sublabel?: string;
  variant?: "donut" | "icon-grid"; color?: string;
  speed?: number;
}
export interface StandingsTableProps {
  title: string; columns: string[];
  rows: Array<{ rank?: number; name: string; values: string[]; highlight?: boolean }>;
  highlightColor?: string;
  useLogo?: boolean;
  speed?: number;
}
export interface TimelineProps {
  title: string;
  points: Array<{ label: string; value: number; annotation?: string }>;
  yLabel?: string; color?: string;
  speed?: number;
}
export interface PhotoStatProps {
  headline?: string;
  stats: Array<{ label: string; value: string }>;
  photoSide?: "left" | "right";
  accentColor?: string;
  speed?: number;
}
export interface ExplainerProps {
  title: string;
  steps: string[];
  formula?: string;
  accentColor?: string;
  speed?: number;
}
export interface ComparableProps {
  subjectA: { name: string; detail: string; stat: string; logo?: string };
  subjectB: { name: string; detail: string; stat: string; logo?: string };
  connector?: string;
  negated?: boolean;
  useLogo?: boolean;
  speed?: number;
}
export interface HeatMapProps {
  title?: string;
  xLabels: string[];
  yLabels: string[];
  data: number[][];
  colorLow?: string;
  colorHigh?: string;
  showValues?: boolean;
  speed?: number;
}
export interface ScatterPlotProps {
  title?: string;
  xLabel?: string;
  yLabel?: string;
  points: Array<{ label: string; x: number; y: number; color?: string }>;
  quadrants?: { topLeft?: string; topRight?: string; bottomLeft?: string; bottomRight?: string };
  useLogo?: boolean;
  speed?: number;
}
export interface FlexTableProps {
  title?: string;
  columns: Array<{ header: string; align?: "left" | "center" | "right" }>;
  rows: Array<{ cells?: string[]; name?: string; values?: string[]; highlight?: boolean }>;
  highlightColor?: string;
  showRank?: boolean;
  useLogo?: boolean;
  speed?: number;
}
export interface SeasonScheduleProps {
  title?: string;
  team?: string;
  teamLogo?: string;
  games: Array<{ cells?: string[]; name?: string; values?: string[]; highlight?: boolean }>;
  accentColor?: string;
  speed?: number;
}
export interface GameFlashProps {
  title?: string;
  games: Array<{ cells?: string[]; name?: string; values?: string[]; highlight?: boolean }>;
  framesPerGame?: number;
  useLogo?: boolean;
  accentColor?: string;
  speed?: number;
}
export interface BackgroundProps {
  variant?: "default" | "minimal" | "geometric" | "gradient";
  showWatermark?: boolean;
  showScanlines?: boolean;
  accentColor?: string;
  speed?: number;
}
export interface OldNewspaperProps {
  imageUrl?: string;
  caption?: string;
  variant?: "desk" | "paper" | "dark";
  zoomTarget?: "center" | "top" | "bottom" | "left" | "right" | "none";
  zoomAmount?: number;
  speed?: number;
}
export interface RetroTVProps {
  screenColor?: string;
  caption?: string;
  channel?: string;
  showStatic?: boolean;
  showScanlines?: boolean;
  frameColor?: string;
  speed?: number;
}
export interface DotStripProps {
  title?: string;
  items: Array<{ cells?: string[]; name?: string; values?: string[]; highlight?: boolean }>;
  sort?: "descending" | "ascending" | "none";
  showLabels?: boolean;
  showValues?: boolean;
  dotColor?: string;
  accentColor?: string;
  speed?: number;
}
export interface ListScannerProps {
  title?: string;
  items: Array<{ cells?: string[]; name?: string; values?: string[]; highlight?: boolean }>;
  display?: "list" | "dots";
  showRank?: boolean;
  showLabels?: boolean;
  direction?: "down" | "up";
  dotColor?: string;
  accentColor?: string;
  speed?: number;
}
