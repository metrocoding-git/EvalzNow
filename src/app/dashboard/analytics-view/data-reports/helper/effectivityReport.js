// Effectivity blocks shared by the Candidate, Unit and Global .ez reports.
import { kv, n2, n3, table, text } from "./reportFormat";

export const EFFECTIVITY_TYPES = ["Holistic", "Mission-Focused", "Not Applicable", "Proactive Dominant", "Reactive Dominant"];
const PARAMS = Array.from({ length: 10 }, (_, i) => i);
const pNum = (i) => String(i + 1).padStart(2, "0");

export const EFFECTIVITY_INTRO = [
  "     Effectivity Parameters examine all possible interactions among all inclusive variables to a deeper level.  As the parameter increases, the strength of the interaction increases.",
  "",
  "     The thresholds and the Pass/Fail criteria of all parameters are as follow:",
  "",
];

/** "Effectivity Parameter 01 : PASS → Parameter 01 ≤ 0.058" (fixed thresholds per unit type). */
export function effectivityThresholdLines(thresholds) {
  return PARAMS.map((i) => kv(`Effectivity Parameter ${pNum(i)}`, `PASS → Parameter ${pNum(i)} ≤ ${n3(thresholds?.[i])}`));
}

/** Candidate tables: categories per PP ID, then parameters 01-05 and 06-10. */
export function effectivityRows(effectivity, dayCountByPp = new Map()) {
  const rows = effectivity?.rows || [];
  const day = (r) => n2(dayCountByPp.get(r.ppId) ?? r.totalDuration);
  const param = (r, i) => (r.parameters ? n3(r.parameters[i]) : "-");
  return [
    ...table(["PP ID", "DAYCOUNT", "Type", "Gap", "Segment", "Context", "Purpose"],
      rows.map((r) => [r.ppId, day(r), text(r.effectivityType), text(r.effectivityGap), text(r.effectivitySegment), text(r.effectivityContext), text(r.effectivityPurpose)])),
    ...table(["PP ID", "DAYCOUNT", ...PARAMS.slice(0, 5).map((i) => `Parameter ${pNum(i)}`)],
      rows.map((r) => [r.ppId, day(r), ...PARAMS.slice(0, 5).map((i) => param(r, i))])),
    ...table(["PP ID", "DAYCOUNT", ...PARAMS.slice(5).map((i) => `Parameter ${pNum(i)}`)],
      rows.map((r) => [r.ppId, day(r), ...PARAMS.slice(5).map((i) => param(r, i))])),
  ];
}

/** "Effectivity Type % - Holistic : 0.250" lines (prefix differs for the Global report). */
export function effectivityTypeLines(typeBreakdown, { label = (t) => `Effectivity Type % - ${t}`, indent = 5, width = 42 } = {}) {
  return EFFECTIVITY_TYPES.map((t) => kv(label(t), typeBreakdown ? n3(typeBreakdown.percentages?.[t]) : "-", { indent, width }));
}

/** "Pass % Effectivity Parameter 01 : 0.250" lines. */
export function effectivityPassLines(passFractions, { label = (n) => `Pass % Effectivity Parameter ${n}`, indent = 5, width = 42 } = {}) {
  return PARAMS.map((i) => kv(label(pNum(i)), n3(passFractions?.[i]), { indent, width }));
}
