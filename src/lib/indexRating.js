// Global Analytics – Index Rating bands for the Weight Index (WI).
// Shared by the Global Analytics index table and the Global .ez report so both
// always show the same rating.
//
//   WI <= 0.0903                 -> Negligent
//   0.0903 < WI <= 0.1075        -> Underperforming
//   0.1075 < WI <= 0.1246        -> Below Average
//   0.1246 < WI <= 0.3075        -> Average - Low End
//   0.3075 < WI <= 0.4905        -> Average - Mid
//   0.4905 < WI <= 0.6734        -> Average - Upper End
//   0.6734 < WI <= 0.6906        -> Above Average
//   WI > 0.6906                  -> Overperforming
export const INDEX_RATING_BANDS = [
  { max: 0.0903, label: "Negligent" },
  { max: 0.1075, label: "Underperforming" },
  { max: 0.1246, label: "Below Average" },
  { max: 0.3075, label: "Average - Low End" },
  { max: 0.4905, label: "Average - Mid" },
  { max: 0.6734, label: "Average - Upper End" },
  { max: 0.6906, label: "Above Average" },
];

export function getIndexRating(weightIndex) {
  const wi = Number(weightIndex);
  if (!Number.isFinite(wi)) return "Unknown value";
  for (const band of INDEX_RATING_BANDS) {
    if (wi <= band.max) return band.label;
  }
  return "Overperforming";
}
