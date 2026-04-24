import { colors } from "../lib/theme";

// T1
export const miracleOddsCard = {
  event: "1980 Winter Olympics · Medal Round",
  teamA: { name: "USSR", odds: "-350", role: "FAVORITE", color: colors.red },
  teamB: { name: "USA", odds: "+600", role: "UNDERDOG", color: colors.green },
  draw: { odds: "+500" }, variant: "three-way" as const,
};
// T2
export const miracleStatComparison = {
  entityA: { name: "USA" }, entityB: { name: "USSR" },
  stats: [
    { label: "Record", valueA: 4, valueB: 5, suffix: "W" },
    { label: "Goals For", valueA: 25, valueB: 51 },
    { label: "Goals Against", valueA: 10, valueB: 12 },
    { label: "Goal Diff", valueA: 15, valueB: 39 },
  ],
};
// T3
export const miracleBigNumber1000 = {
  number: "1000", suffix: "-1", label: "Pre-Tournament Odds to Win Gold",
  sublabel: "From a Monte Carlo simulation by Carlton Chin and Jay Granat", color: colors.red,
};
export const miracleBigNumberEstimate = {
  number: "8", suffix: "-1", label: "Best Estimate for the Miracle on Ice", color: colors.green,
};
// T4
export const miracleTimeline = {
  title: "Odds Movement — USA to Win Gold",
  points: [
    { label: "Pre-Tourney", value: 1000, annotation: "1000-1" },
    { label: "After Rd 2", value: 500, annotation: "" },
    { label: "After Rd 4", value: 100, annotation: "" },
    { label: "Pre-USSR", value: 17, annotation: "17-1" },
  ],
  yLabel: "Odds", color: colors.green,
};
// T5
export const miracleQuoteBrooks = {
  quote: "If we played them ten times, they might win nine. But not this game. Not tonight.",
  attribution: "Herb Brooks", role: "Head Coach, 1980 U.S. Olympic Hockey Team",
  variant: "dramatic" as const,
};
// T6
export const miracleStandings = {
  title: "1980 Olympic Hockey — Medal Round",
  columns: ["W", "L", "T", "PTS"],
  rows: [
    { rank: 1, name: "United States", values: ["2", "0", "1", "5"], highlight: true },
    { rank: 2, name: "Soviet Union", values: ["1", "1", "1", "4"] },
    { rank: 3, name: "Sweden", values: ["0", "1", "1", "2"] },
    { rank: 4, name: "Finland", values: ["1", "1", "0", "1"] },
  ], highlightColor: colors.green,
};
// T7
export const miracleScoreFinal = {
  teamA: { name: "USA", score: 4 }, teamB: { name: "USSR", score: 3 },
  event: "1980 Winter Olympics · Medal Round",
  date: "February 22, 1980 · Lake Placid, NY", badge: "UPSET",
};
// T8
export const miracleProbDonut = {
  percentage: 77, label: "Soviet Probability to Win Gold",
  sublabel: "Pre-tournament Monte Carlo simulation", variant: "donut" as const, color: colors.red,
};
export const miracleProbGrid = {
  percentage: 10, label: "In-Game Win Probability for USA",
  sublabel: "Based on shot data and conversion rates", variant: "icon-grid" as const, color: colors.green,
};
// T9
export const miraclePhotoStat = {
  headline: "Soviet Dominance",
  stats: [
    { label: "Consecutive Gold", value: "4" },
    { label: "Olympic Record", value: "44-0" },
    { label: "Goal Differential", value: "+39" },
  ],
  photoSide: "left" as const, accentColor: colors.red,
};
// T10
export const miracleExplainer = {
  title: "How We Made the Line",
  steps: [
    "Gathered SRS ratings from Hockey Reference",
    "Ran Monte Carlo simulation (10K iterations)",
    "Converted win probability to three-way market",
    "Applied ~10% sportsbook hold to each side",
  ],
  formula: "Implied Prob = 1 / (American Odds / 100 + 1)",
  accentColor: colors.green,
};
// T11
export const miracleComparable = {
  subjectA: { name: "Miracle on Ice", detail: "1980 Olympics · Hockey", stat: "+600" },
  subjectB: { name: "BC vs Notre Dame", detail: "1993 College Football", stat: "+450" },
  connector: "IS COMPARABLE TO", negated: false,
};
export const miracleComparableNot = {
  subjectA: { name: "Miracle on Ice", detail: "1980 Olympics · Hockey", stat: "+600" },
  subjectB: { name: "Leicester City", detail: "2015-16 Premier League", stat: "+500000" },
  connector: "IS COMPARABLE TO", negated: true,
};
// T12
export const miracleLowerThird = {
  primary: "Estimated Opening Line", secondary: "~10% hold · Three-way market",
  accentColor: colors.green,
};
// T13 — Heat Map: USA goals by period & opponent
export const miracleHeatMap = {
  title: "USA Goals by Period & Opponent",
  xLabels: ["1st", "2nd", "3rd"],
  yLabels: ["Sweden", "Czech.", "Norway", "Romania", "W. Germany", "USSR", "Finland"],
  data: [
    [2, 0, 0],
    [3, 0, 4],
    [5, 1, 0],
    [3, 3, 4],
    [3, 2, 2],
    [1, 1, 2],
    [2, 1, 1],
  ],
  colorLow: "#1E1E32",
  colorHigh: colors.green,
  showValues: true,
};
// T14 — Scatter Plot: Olympic hockey teams goals for vs goals against
export const miracleScatterPlot = {
  title: "1980 Olympic Hockey — Goals For vs Against",
  xLabel: "Goals Against",
  yLabel: "Goals For",
  points: [
    { label: "USA", x: 15, y: 29, color: colors.green },
    { label: "USSR", x: 9, y: 51, color: colors.red },
    { label: "Sweden", x: 14, y: 26 },
    { label: "Finland", x: 18, y: 26 },
    { label: "Czech.", x: 16, y: 40 },
    { label: "Canada", x: 22, y: 28 },
  ],
  quadrants: { topRight: "Elite", bottomLeft: "Eliminated" },
};
// T15 — Flex Table: Tournament scoring leaders
export const miracleFlexTable = {
  title: "1980 Olympics — Medal Round Leaders",
  columns: [
    { header: "Player", align: "left" as const },
    { header: "Country", align: "center" as const },
    { header: "G", align: "center" as const },
    { header: "A", align: "center" as const },
    { header: "PTS", align: "right" as const },
  ],
  rows: [
    { cells: ["Krutov", "USSR", "5", "4", "9"], highlight: false },
    { cells: ["Makarov", "USSR", "3", "6", "9"], highlight: false },
    { cells: ["Petrov", "USSR", "4", "4", "8"], highlight: false },
    { cells: ["Johnson", "USA", "5", "3", "8"], highlight: true },
    { cells: ["Eruzione", "USA", "3", "3", "6"], highlight: true },
  ],
  highlightColor: colors.green,
  showRank: true,
};
// T16 — Season Schedule: USA 1980 Olympic results
export const miracleSeasonSchedule = {
  title: "1980 Winter Olympics",
  team: "Team USA Hockey",
  games: [
    { name: "Game 1", values: ["vs Sweden", "T 2-2"], highlight: false },
    { name: "Game 2", values: ["vs Czechoslovakia", "W 7-3"], highlight: false },
    { name: "Game 3", values: ["vs Norway", "W 5-1"], highlight: false },
    { name: "Game 4", values: ["vs Romania", "W 7-2"], highlight: false },
    { name: "Game 5", values: ["vs W. Germany", "W 4-2"], highlight: false },
    { name: "Game 6", values: ["vs USSR", "W 4-3"], highlight: true },
    { name: "Game 7", values: ["vs Finland", "W 4-2"], highlight: false },
  ],
  accentColor: colors.green,
};
// T17 — Game Flash: same USA games, one at a time
export const miracleGameFlash = {
  title: "Road to Gold — 1980 USA Hockey",
  games: [
    { name: "Game 1", values: ["vs Sweden", "T 2-2"], highlight: false },
    { name: "Game 2", values: ["vs Czechoslovakia", "W 7-3"], highlight: false },
    { name: "Game 3", values: ["vs Norway", "W 5-1"], highlight: false },
    { name: "Game 4", values: ["vs Romania", "W 7-2"], highlight: false },
    { name: "Game 5", values: ["vs W. Germany", "W 4-2"], highlight: false },
    { name: "Game 6", values: ["vs USSR", "W 4-3"], highlight: false },
    { name: "Game 7", values: ["vs Finland", "W 4-2"], highlight: false },
  ],
  framesPerGame: 36,
  accentColor: colors.green,
};
// T18 — List Scanner: 1980 Olympics hockey final standings
export const miracleListScanner = {
  title: "1980 Winter Olympics — Final Standings",
  items: [
    { name: "USA", values: ["Gold"], highlight: true },
    { name: "USSR", values: ["Silver"], highlight: false },
    { name: "Sweden", values: ["Bronze"], highlight: false },
    { name: "Finland", values: ["4th"], highlight: false },
    { name: "Czechoslovakia", values: ["5th"], highlight: false },
    { name: "Canada", values: ["6th"], highlight: false },
    { name: "Poland", values: ["7th"], highlight: false },
    { name: "Romania", values: ["8th"], highlight: false },
    { name: "Netherlands", values: ["9th"], highlight: false },
    { name: "W. Germany", values: ["10th"], highlight: false },
    { name: "Norway", values: ["11th"], highlight: false },
    { name: "Japan", values: ["12th"], highlight: false },
  ],
  direction: "down" as const,
  accentColor: colors.green,
};
// T19 — Dot Strip: goals scored per team in 1980 Olympics
export const miracleDotStrip = {
  title: "1980 Winter Olympics — Goals Scored",
  items: [
    { name: "USSR", values: ["51"], highlight: false },
    { name: "Czechoslovakia", values: ["40"], highlight: false },
    { name: "USA", values: ["29"], highlight: true },
    { name: "Canada", values: ["28"], highlight: false },
    { name: "Sweden", values: ["26"], highlight: false },
    { name: "Finland", values: ["26"], highlight: false },
    { name: "Poland", values: ["15"], highlight: false },
    { name: "Romania", values: ["13"], highlight: false },
    { name: "W. Germany", values: ["21"], highlight: false },
    { name: "Netherlands", values: ["10"], highlight: false },
    { name: "Norway", values: ["14"], highlight: false },
    { name: "Japan", values: ["7"], highlight: false },
  ],
  sort: "descending" as const,
  showLabels: true,
  showValues: true,
  dotColor: colors.red,
  accentColor: colors.green,
};
