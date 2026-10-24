// Effectivity columns of the Data Extraction CSV (one set per candidate PP ID).
const fmt3 = (v) => {
  if (v === null || v === undefined || v === "") return "-";
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(3) : "-";
};

export const EFFECTIVITY_HEADERS = [
  "Effectivity Type", "Effectivity Gap", "Effectivity Segment", "Effectivity Context", "Effectivity Purpose",
  ...Array.from({ length: 10 }, (_, i) => `Effectivity Parameter ${String(i + 1).padStart(2, "0")}`),
];

export function effectivityCells(candidate, ppId) {
  const e = candidate?.effectivityByPp?.[ppId] || {};
  return [
    e.effectivityType ?? "-",
    e.effectivityGap ?? "-",
    e.effectivitySegment ?? "-",
    e.effectivityContext ?? "-",
    e.effectivityPurpose ?? "-",
    ...Array.from({ length: 10 }, (_, i) => (e.parameters ? fmt3(e.parameters[i]) : "-")),
  ];
}
