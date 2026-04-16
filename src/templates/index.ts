// ═══════════════════════════════════════════════════════════════
// Template Registry — Single import point for all schemas
// The builder form reads from this; when you add a template,
// add it here and the form auto-updates.
// ═══════════════════════════════════════════════════════════════

export { OddsCard, schema as OddsCardSchema } from "./OddsCard";
export { StatComparison, schema as StatComparisonSchema } from "./StatComparison";
export { BigNumber, schema as BigNumberSchema } from "./BigNumber";
export { Timeline, schema as TimelineSchema } from "./Timeline";
export { QuoteCard, schema as QuoteCardSchema } from "./QuoteCard";
export { StandingsTable, schema as StandingsTableSchema } from "./StandingsTable";
export { Scoreboard, schema as ScoreboardSchema } from "./Scoreboard";
export { ProbabilityViz, schema as ProbabilityVizSchema } from "./ProbabilityViz";
export { PhotoStat, schema as PhotoStatSchema } from "./PhotoStat";
export { Explainer, schema as ExplainerSchema } from "./Explainer";
export { Comparable, schema as ComparableSchema } from "./Comparable";
export { LowerThird, schema as LowerThirdSchema } from "./LowerThird";
export { HeatMap, schema as HeatMapSchema } from "./HeatMap";
export { ScatterPlot, schema as ScatterPlotSchema } from "./ScatterPlot";
export { FlexTable, schema as FlexTableSchema } from "./FlexTable";

import { schema as s1 } from "./OddsCard";
import { schema as s2 } from "./StatComparison";
import { schema as s3 } from "./BigNumber";
import { schema as s4 } from "./Timeline";
import { schema as s5 } from "./QuoteCard";
import { schema as s6 } from "./StandingsTable";
import { schema as s7 } from "./Scoreboard";
import { schema as s8 } from "./ProbabilityViz";
import { schema as s9 } from "./PhotoStat";
import { schema as s10 } from "./Explainer";
import { schema as s11 } from "./Comparable";
import { schema as s12 } from "./LowerThird";
import { schema as s13 } from "./HeatMap";
import { schema as s14 } from "./ScatterPlot";
import { schema as s15 } from "./FlexTable";

export const ALL_SCHEMAS = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15];

export const SCHEMA_MAP: Record<string, typeof s1> = Object.fromEntries(
  ALL_SCHEMAS.map(s => [s.id, s])
);
