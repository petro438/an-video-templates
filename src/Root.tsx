import React from "react";
import { Composition } from "remotion";
import { OddsCard } from "./templates/OddsCard";
import { StatComparison } from "./templates/StatComparison";
import { BigNumber } from "./templates/BigNumber";
import { BigNumberAN } from "./templates/BigNumber-AN";
import { Timeline } from "./templates/Timeline";
import { QuoteCard } from "./templates/QuoteCard";
import { StandingsTable } from "./templates/StandingsTable";
import { Scoreboard } from "./templates/Scoreboard";
import { ScoreboardAN } from "./templates/Scoreboard-AN";
import { ProbabilityViz } from "./templates/ProbabilityViz";
import { PhotoStat } from "./templates/PhotoStat";
import { Explainer } from "./templates/Explainer";
import { Comparable } from "./templates/Comparable";
import { LowerThird } from "./templates/LowerThird";
import { HeatMap } from "./templates/HeatMap";
import { ScatterPlot } from "./templates/ScatterPlot";
import { FlexTable } from "./templates/FlexTable";
import { SeasonSchedule } from "./templates/SeasonSchedule";
import { GameFlash } from "./templates/GameFlash";
import { ListScanner } from "./templates/ListScanner";
import { DotStrip } from "./templates/DotStrip";
import { RetroTV } from "./templates/RetroTV";
import { Background } from "./templates/Background";
import { OldNewspaper } from "./templates/OldNewspaper";
import * as d from "./data/miracle-on-ice";

const C = { width: 1920, height: 1080, fps: 30 };
// Remotion expects LooseComponentType<Record<string, unknown>>. This cast
// satisfies that without weakening each component's own typed props.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rc = <T,>(comp: React.FC<T>): React.ComponentType<any> => comp as React.ComponentType<any>;

export const RemotionRoot: React.FC = () => (
  <>
    {/* T1 */}
    <Composition id="OddsCard" component={rc(OddsCard)} durationInFrames={150} {...C} defaultProps={d.miracleOddsCard} />
    {/* T2 */}
    <Composition id="StatComparison" component={rc(StatComparison)} durationInFrames={180} {...C} defaultProps={d.miracleStatComparison} />
    {/* T3 */}
    <Composition id="BigNumber" component={rc(BigNumber)} durationInFrames={150} {...C} defaultProps={d.miracleBigNumber1000} />
    <Composition id="BigNumber-Estimate" component={rc(BigNumber)} durationInFrames={150} {...C} defaultProps={d.miracleBigNumberEstimate} />
    <Composition id="BigNumber-AN" component={rc(BigNumberAN)} durationInFrames={150} {...C} defaultProps={d.miracleBigNumber1000} />
    {/* T4 */}
    <Composition id="Timeline" component={rc(Timeline)} durationInFrames={210} {...C} defaultProps={d.miracleTimeline} />
    {/* T5 */}
    <Composition id="QuoteCard" component={rc(QuoteCard)} durationInFrames={210} {...C} defaultProps={d.miracleQuoteBrooks} />
    {/* T6 */}
    <Composition id="StandingsTable" component={rc(StandingsTable)} durationInFrames={180} {...C} defaultProps={d.miracleStandings} />
    {/* T7 */}
    <Composition id="Scoreboard" component={rc(Scoreboard)} durationInFrames={150} {...C} defaultProps={d.miracleScoreFinal} />
    <Composition id="Scoreboard-AN" component={rc(ScoreboardAN)} durationInFrames={150} {...C} defaultProps={d.miracleScoreFinal} />
    {/* T8 */}
    <Composition id="ProbabilityViz" component={rc(ProbabilityViz)} durationInFrames={180} {...C} defaultProps={d.miracleProbDonut} />
    <Composition id="ProbabilityViz-Grid" component={rc(ProbabilityViz)} durationInFrames={180} {...C} defaultProps={d.miracleProbGrid} />
    {/* T9 */}
    <Composition id="PhotoStat" component={rc(PhotoStat)} durationInFrames={180} {...C} defaultProps={d.miraclePhotoStat} />
    {/* T10 */}
    <Composition id="Explainer" component={rc(Explainer)} durationInFrames={240} {...C} defaultProps={d.miracleExplainer} />
    {/* T11 */}
    <Composition id="Comparable" component={rc(Comparable)} durationInFrames={180} {...C} defaultProps={d.miracleComparable} />
    <Composition id="Comparable-Negated" component={rc(Comparable)} durationInFrames={180} {...C} defaultProps={d.miracleComparableNot} />
    {/* T12 */}
    <Composition id="LowerThird" component={rc(LowerThird)} durationInFrames={150} {...C} defaultProps={d.miracleLowerThird} />
    {/* T13 */}
    <Composition id="HeatMap" component={rc(HeatMap)} durationInFrames={210} {...C} defaultProps={d.miracleHeatMap} />
    {/* T14 */}
    <Composition id="ScatterPlot" component={rc(ScatterPlot)} durationInFrames={240} {...C} defaultProps={d.miracleScatterPlot} />
    {/* T15 */}
    <Composition id="FlexTable" component={rc(FlexTable)} durationInFrames={210} {...C} defaultProps={d.miracleFlexTable} />
    {/* T16 */}
    <Composition id="SeasonSchedule" component={rc(SeasonSchedule)} durationInFrames={240} {...C} defaultProps={d.miracleSeasonSchedule} />
    {/* T17 */}
    <Composition id="GameFlash" component={rc(GameFlash)} durationInFrames={300} {...C} defaultProps={d.miracleGameFlash} />
    {/* T18 */}
    <Composition id="ListScanner" component={rc(ListScanner)} durationInFrames={240} {...C} defaultProps={d.miracleListScanner} />
    {/* T19 */}
    <Composition id="DotStrip" component={rc(DotStrip)} durationInFrames={240} {...C} defaultProps={d.miracleDotStrip} />
    {/* T20 */}
    <Composition id="RetroTV" component={rc(RetroTV)} durationInFrames={150} {...C} defaultProps={{ screenColor: "#00FF00", channel: "CH 3", showStatic: true, showScanlines: true }} />
    {/* T21 */}
    <Composition id="Background" component={rc(Background)} durationInFrames={300} {...C} defaultProps={{ variant: "default" }} />
    {/* T22 */}
    <Composition id="OldNewspaper" component={rc(OldNewspaper)} durationInFrames={300} {...C} defaultProps={{ variant: "desk", zoomTarget: "center", zoomAmount: 1.3 }} />
  </>
);
