"use client";
/**
 * Capsule Butler Locus charts (Capacity_Part10 / New Hybrid Models) – candidate level, positive PP IDs.
 * IDs continue the capsule Hybrid Metrics list (5 charts) → 6 … 13. The chart itself is shared with the
 * unit Hybrid Metrics (../components/ButlerLocusChart).
 */
import ButlerLocusChart, { ButlerLocusTable, butlerLocusCharts, butlerPoints, locusCurves } from "../components/ButlerLocusChart";

export const BUTLER_LOCUS_CHARTS = butlerLocusCharts([
  { short: "PC1", label: "Principals: ∆PC1 vs. PC1", xKey: "RRN", yKey: "deltaRRN" },
  { short: "PC2", label: "Principals: ∆PC2 vs. PC2", xKey: "PRN", yKey: "deltaPRN" },
  { short: "PC3", label: "Principals: ∆PC3 vs. PC3", xKey: "ARN", yKey: "deltaARN" },
  { short: "XEP", label: "Equivalent ∆GEQ vs. XEP", xKey: "XEP", yKey: "GEQ", yLabel: "∆GEQ" },
], 6);

export { ButlerLocusTable, butlerPoints, locusCurves };
export default ButlerLocusChart;
