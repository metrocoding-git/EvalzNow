import { useEffect } from "react";

function extractStaffAssignments(staffAssignments = []) {
  const leaders = staffAssignments
    .filter(s => s.roleType === "Leader")
    .map(s => `${s.staff.lastName}, ${s.staff.firstName}`);

  const assessors = staffAssignments
    .filter(s => s.roleType === "Assessor")
    .map(s => `${s.staff.lastName}, ${s.staff.firstName}`);

  const pad = (arr, size = 3) =>
    Array.from({ length: size }, (_, i) => arr[i] ?? "-");

  return {
    leaders: pad(leaders),
    assessors: pad(assessors)
  };
}


function renderBenchmarkRows(benchmarks = []) {
  if (!benchmarks.length) {
    return "     -";
  }

  return benchmarks
    .map(b => {
      return (
        `     ${String(b.benchmarkId).padEnd(12)}` +
        `     ${b.benchmarkType.padEnd(22)}` +
        `     ${b.benchmarkRef.padEnd(22)}` +
        `     ${b.benchmarkDescription}`
      );
    })
    .join("\n");
}


function renderAssessmentBlocks(pps = []) {
  if (!pps || !pps.length) return "     -";

  const indent = "     ";
  const gap = "   ";

  return pps
    .map((pp) =>
      indent +
      String(pp.ppId ?? "").padEnd(12) + gap +
      String(pp.periodType ?? "").padEnd(22) + gap +
      String(pp.delivery ?? "").padEnd(32) + gap +
      String(pp.shortDescription ?? "")
    )
    .join("\n");
}



function renderCandidateMarksRows(candidateMarks = []) {
  if (!candidateMarks.length) {
    return "     -";
  }

  // Define column widths
  const colWidths = {
    entryNumber: 14,
    impactType: 20,
    concernIdentified: 30,
    identityDate: 20,
    concernResolved: 25,
    resolutionDate: 20
  };

  return candidateMarks
    .sort((a, b) => a.entryNumber - b.entryNumber)
    .map((mark, index) => {
      return (
        "         " +
        String(index + 1 ?? "-").padEnd(colWidths.entryNumber) +
        String(mark.impactType ?? "-").padEnd(colWidths.impactType) +
        String(mark.concernIdentified ?? "-").padEnd(colWidths.concernIdentified) +
        String(mark.identityDate ?? "-").padEnd(colWidths.identityDate) +
        String(mark.concernResolved ?? "-").padEnd(colWidths.concernResolved) +
        String(mark.resolutionDate ?? "-").padEnd(colWidths.resolutionDate)
      );
    })
    .join("\n");
}



const UNIT_TYPE_RULES = {
  ALL: {
    proficiency: ["RRN", "PRN"],
    growth: ["deltaRRN", "deltaPRN"],
  },

  "Communicative I/O": {
    proficiency: ["XRR", "XLR", "XSR", "XWR"],
    averages: ["XRR", "XLR", "XSR", "XWR"],
  },

  "Theory & Practice": {
    proficiency: ["XTR", "XPR"],
    averages: ["XTR", "XPR"],
  },

  "Third Parameter": {
    proficiency: ["ARN", "XRVSR", "XPVSR", "XAVSR"],
    averages: ["ARN"],
    growth: ["deltaARN"],
  },
};

const METRIC_LABELS = {
  RRN: "RRN",
  PRN: "PRN",
  ARN: "ARN",

  XRR: "XRR",
  XLR: "XLR",
  XSR: "XSR",
  XWR: "XWR",
  XTR: "XTR",
  XPR: "XPR",
  XRVSR: "XRVSR",
  XPVSR: "XPVSR",
  XAVSR: "XAVSR",

  deltaRRN: "ΔRRN",
  deltaPRN: "ΔPRN",
  deltaARN: "ΔARN",
  GEQ: "∆GEQ",
};

function renderProficiencyHeader(unitType) {
  const metrics = [
    ...UNIT_TYPE_RULES.ALL.proficiency,
    ...(UNIT_TYPE_RULES[unitType]?.proficiency ?? []),
  ];

  let header = "     ||| PP ID |||";

  metrics.forEach(m => {
    header += `     ||| ${METRIC_LABELS[m]} |||`;
  });

  header += "     ||| STA/P |||";
  return header;
}

function renderGrowthHeader(unitType) {
  const metrics = [
    ...UNIT_TYPE_RULES.ALL.growth,
    ...(UNIT_TYPE_RULES[unitType]?.growth ?? []),
    "GEQ",
  ].filter(Boolean);

  let header = "||| PP ID |||     ||| DAYCOUNT |||";

  metrics.forEach(m => {
    header += `     ||| ${METRIC_LABELS[m]} |||`;
  });

  header += "     ||| STA/G |||";
  return header;
}

const fmt = (v) => typeof v === "number" ? v.toFixed(3) : "-";
const fmt2 = (v) => typeof v === "number" ? v.toFixed(2) : "-";

const hasMetric = (unitType, metric) =>
  UNIT_TYPE_RULES.ALL?.proficiency?.includes(metric) ||
  UNIT_TYPE_RULES.ALL?.growth?.includes(metric) ||
  UNIT_TYPE_RULES[unitType]?.proficiency?.includes(metric) ||
  UNIT_TYPE_RULES[unitType]?.growth?.includes(metric) ||
  UNIT_TYPE_RULES[unitType]?.averages?.includes(metric);

function renderCompetencyProficiencyRows(results = [], unitType) {
  if (!results.length) return "     -";

  const cols = [
    ["RRN", 8],
    ["PRN", 8],
    ["XRR", 8],
    ["XLR", 8],
    ["XSR", 8],
    ["XWR", 8],
    ["XTR", 8],
    ["XPR", 8],
    ["ARN", 8],
    ["XRVSR", 8],
    ["XPVSR", 8],
    ["XAVSR", 8],
    ["XEP", 8],   // ADDED - Equivalent Proficiency
    ["XCP", 8],   // ADDED - Composite Proficiency
    ["XBP", 8],   // ADDED - Band Proficiency
  ].filter(([key]) => hasMetric(unitType, key) || ["XEP", "XCP", "XBP"].includes(key)); // Always include XEP, XCP, XBP

  return results
    .map(r => {
      let row =
        `         ${String(r.ppId).padEnd(10)}  `;

      cols.forEach(([key, w]) => {
        row += `     ${fmt(r[key]).padEnd(w)}  `;
      });

      row += `     ${(r.STAP ?? "-").padEnd(8)}  `;
      return row;
    })
    .join("\n");
}



function renderCompetencyGrowthRows(results = [], scores = [], unitType) {
  if (!results.length) return "     -";

  const cols = [
    ["deltaRRN", 8],
    ["deltaPRN", 8],
    ["deltaARN", 8],
    ["GEQ", 8],
  ].filter(([key]) => hasMetric(unitType, key) || key === "GEQ"); // Always include GEQ

  return results
    .map(r => {
      let row =
        `          ${String(r.ppId).padEnd(10)}  ` +
        `     ${fmt2(r.totalDuration).padEnd(14)}  `;

      cols.forEach(([key, w]) => {
        row += `     ${fmt(r[key]).padEnd(w)}  `;
      });

      row += `     ${(r.STAG ?? "-").padEnd(8)}  `;
      return row;
    })
    .join("\n");
}



function renderCompetencyHybridRows(results = [], scores = []) {
  if (!results.length) return "     -";

  return results
    .map(r => {
      return (
        `          ${String(r.ppId).padEnd(10)}  ` +
        `     ${fmt2(r.totalDuration).padEnd(13)}  ` +
        `     ${fmt(r.MSIP).padEnd(11)}  ` +
        `     ${Number(getICValue(r.unitType, r.signatureProfile, r.IC)).toFixed(2).padEnd(8)}  `
      );
    })
    .join("\n");
}

function renderAverages(averages = {}, unitType) {
  const lines = [];

  if (hasMetric(unitType, "RRN"))
    lines.push(`     Average Receptive Ratio - RRN             :     ${fmt(averages.RRN)}`);

  if (hasMetric(unitType, "PRN"))
    lines.push(`     Average Productive Ratio - PRN            :     ${fmt(averages.PRN)}`);

  if (unitType === "Third Parameter")
    lines.push(`     Average Acuity Ratio - ARN                :     ${fmt(averages.ARN)}`);

  return lines.join("\n");
}

function resolveActionStatus(bIds = [], observation = "") {
  const hasBids = Array.isArray(bIds) && bIds.length > 0;
  const hasObservation = Boolean(observation?.trim());

  if (hasBids && hasObservation) return "CLOSED";
  if (hasBids || hasObservation) return "PENDING";
  return "OPEN";
}


function renderNeedsAssessmentRows(needAssessments = [], competencyRows = []) {
  if (!needAssessments.length) return "     ";

  return needAssessments
    .map(na => {
      const competencyRow = competencyRows.find(c => c.ppId === na.ppId);

      const dayCount = competencyRow?.totalDuration ?? "-";
      const criticalRefDate = competencyRow?.criticalRefDate
        ? new Date(competencyRow.criticalRefDate).toISOString().split("T")[0]
        : "-";

      const benchmarkText = na.bIds?.length
        ? ` ${na.bIds.join(", ")}`
        : "";
      const actionStatus = resolveActionStatus(na.bIds, na.observation);
      const observation = na.observation?.trim() || "-";

      return (
        `       ${String(na.ppId).padEnd(13)}` +
        `       ${String(criticalRefDate).padEnd(30)}` +
        `       ${actionStatus.padEnd(18)}` +
        `       ${benchmarkText.padEnd(15)}` +
        `       ${observation}`
      );
    })
    .join("\n");
}

function renderRecordOfAssignments(scores = []) {
  if (!Array.isArray(scores) || scores.length === 0) {
    return {
      table1: "     -",
      table2: "     -"
    };
  }

  const padCol = (value, width) => {
    const str = String(value ?? "-");
    return (str.length > width ? str.slice(0, width - 1) + "…" : str).padEnd(width);
  };

  const durationStr = (v) => {
    const num = Number(v);
    return Number.isFinite(num) ? num.toFixed(2) : "-";
  };

  const table1 = scores
    .map(s =>
      `      ${padCol(s.ppId, 10)}` +
      `     ${padCol(durationStr(s.durationHrs), 12)}` +
      `     ${padCol(s.remarks, 45)}` +
      `     ${padCol(s.competency, 14)}` +
      `     ${padCol(s.attainedScore, 18)}` +
      `     ${padCol(s.maxScore, 10)}`
    )
    .join("\n");

  const table2 = scores
    .map(s =>
      `      ${padCol(s.ppId, 10)}` +
      `     ${padCol(durationStr(s.durationHrs), 12)}` +
      `     ${padCol(s.workflowStage, 22)}` +
      `     ${padCol(s.assessmentType, 30)}` +
      `     ${padCol(s.scheduleImpact, 30)}`
    )
    .join("\n");

  return { table1, table2 };
}

function hasSelectionData(sel) {
  return (
    sel.RRN != null ||
    sel.PRN != null ||
    sel.ARN != null ||
    (Array.isArray(sel.benchmarkIds) && sel.benchmarkIds.length > 0) ||
    sel.actionStatus
  );
}

function renderSingleChain(chain) {
  const validSelections = (chain.selections || []).filter(hasSelectionData);

  if (!validSelections.length) return null;

  return validSelections
    .map((sel, index) => {
      const ic = sel.ARN != null ? `<${fmt(sel.RRN)},${fmt(sel.PRN)},${fmt(sel.ARN)}>`
        : `<${fmt(sel.RRN)},${fmt(sel.PRN)}>`;
      const bids =
        Array.isArray(sel.benchmarkIds) && sel.benchmarkIds.length
          ? sel.benchmarkIds.join(", ")
          : "-";

      const crd = sel.criticalRefDate
        ? new Date(sel.criticalRefDate).toISOString().split("T")[0]
        : "-";

      const seq = index + 1;
      return (
        ` Performance Point ID ${sel.ppId ?? "-"}\n` +
        ` IC #${sel.IC}: ${ic}\n` +
        ` Benchmark IDs: ${bids}\n` +
        ` Action Status: ${sel.actionStatus ?? "-"}\n` +
        ` Critical Reference Date: ${crd}\n`
      );
    })
    .join("\n");
}


function renderAssessmentChain(assessmentChain = []) {
  if (!Array.isArray(assessmentChain) || !assessmentChain.length) {
    return "     -";
  }


  const renderedChains = assessmentChain
    .map((chain, index) => {
      const content = renderSingleChain(chain);
      if (!content) return null;

      return {
        header: `||| ASSESSMENT CHAIN ${index + 1} |||`,
        body: content
      };
    })
    .filter(Boolean);

  if (!renderedChains.length) return "     -";

  const headers = renderedChains.map(c => c.header.padEnd(40)).join("     ");
  const bodies = renderedChains.map(c => c.body.split("\n"));

  const maxLines = Math.max(...bodies.map(b => b.length));

  const rows = Array.from({ length: maxLines }, (_, i) =>
    bodies
      .map(col => (col[i] ?? "").padEnd(40))
      .join("     ")
  );

  return `${headers}\n\n${rows.join("\n")}`;
}

function buildDayCountByPpMap(competencyResults = []) {
  const map = new Map();

  competencyResults.forEach(r => {
    if (r?.ppId && r?.totalDuration != null) {
      map.set(r.ppId, r.totalDuration);
    }
  });

  return map;
}


function getRms(entry, mode, lobeName) {
  const lobe = entry?.lobes?.[lobeName];

  if (!lobe) return "-";

  if (mode === "proficiency") {
    return fmt3(lobe.RMS);
  }

  if (mode === "growth") {
    return fmt3(lobe.deltaRMS);
  }

  return "-";
}

function renderRmsProficiencyTables(neuro, competencyResults) {
  if (!Array.isArray(neuro?.data)) return "";

  const dayCountMap = buildDayCountByPpMap(competencyResults);

  const leftRows = [];
  const rightRows = [];

  neuro.data.forEach(entry => {
    const dayCount =
      dayCountMap.get(entry.ppId) ?? entry.dayCount ?? "-";

    leftRows.push(
      `     ${String(entry.ppId ?? "").padEnd(8)} ${String(dayCount).padEnd(10)} ` +
      `${getRms(entry, "proficiency", "Frontal Lobe - Left").padEnd(14)}` +
      `${getRms(entry, "proficiency", "Occipital Lobe - Left").padEnd(18)}` +
      `${getRms(entry, "proficiency", "Parietal Lobe - Left").padEnd(16)}` +
      `${getRms(entry, "proficiency", "Temporal Lobe - Left")}`
    );

    rightRows.push(
      `     ${String(entry.ppId ?? "").padEnd(8)} ${String(dayCount).padEnd(10)} ` +
      `${getRms(entry, "proficiency", "Frontal Lobe - Right").padEnd(14)}` +
      `${getRms(entry, "proficiency", "Occipital Lobe - Right").padEnd(18)}` +
      `${getRms(entry, "proficiency", "Parietal Lobe - Right").padEnd(16)}` +
      `${getRms(entry, "proficiency", "Temporal Lobe - Right")}`
    );
  });

  return `         ||| PP ID |||     ||| DAYCOUNT |||     ||| P/ RMS (L) - Frontal |||     ||| P/ RMS (L) - Occipital Lobe |||     ||| P/ RMS (L) - Parietal |||     ||| P/ RMS (L) - Temporal |||

  ${leftRows.join("\n  ")}

         ||| PP ID |||     ||| DAYCOUNT |||     ||| P/ RMS (R) - Frontal |||     ||| P/ RMS (R) - Occipital Lobe |||     ||| P/ RMS (R) - Parietal |||     ||| P/ RMS (R) - Temporal |||

  ${rightRows.join("\n  ")}`;
}


function renderRmsGrowthTables(neuro, competencyResults) {
  if (!Array.isArray(neuro?.data)) return "";

  const dayCountMap = buildDayCountByPpMap(competencyResults);

  const leftRows = [];
  const rightRows = [];

  neuro.data.forEach(entry => {
    const dayCount =
      dayCountMap.get(entry.ppId) ?? entry.dayCount ?? "-";

    leftRows.push(
      `     ${String(entry.ppId ?? "").padEnd(8)} ${String(dayCount).padEnd(10)} ` +
      `${getRms(entry, "growth", "Frontal Lobe - Left").padEnd(14)}` +
      `${getRms(entry, "growth", "Occipital Lobe - Left").padEnd(18)}` +
      `${getRms(entry, "growth", "Parietal Lobe - Left").padEnd(16)}` +
      `${getRms(entry, "growth", "Temporal Lobe - Left")}`
    );

    rightRows.push(
      `     ${String(entry.ppId ?? "").padEnd(8)} ${String(dayCount).padEnd(10)} ` +
      `${getRms(entry, "growth", "Frontal Lobe - Right").padEnd(14)}` +
      `${getRms(entry, "growth", "Occipital Lobe - Right").padEnd(18)}` +
      `${getRms(entry, "growth", "Parietal Lobe - Right").padEnd(16)}` +
      `${getRms(entry, "growth", "Temporal Lobe - Right")}`
    );
  });

  return `         ||| PP ID |||     ||| DAYCOUNT |||     ||| G/ RMS (L) - Frontal |||     ||| G/ RMS (L) - Occipital Lobe |||     ||| G/ RMS (L) - Parietal |||     ||| G/ RMS (L) - Temporal |||

  ${leftRows.join("\n  ")}

         ||| PP ID |||     ||| DAYCOUNT |||     ||| G/ RMS (R) - Frontal |||     ||| G/ RMS (R) - Occipital Lobe |||     ||| G/ RMS (R) - Parietal |||     ||| G/ RMS (R) - Temporal |||

  ${rightRows.join("\n  ")}`;
}

function fmt3(value) {
  return Number.isFinite(value) ? value.toFixed(3) : "-";
}

function sumCognitiveLoad(cognitiveLoad = {}) {
  const result = {};

  Object.entries(cognitiveLoad).forEach(([lobeName, data]) => {
    const profSum = (data.proficiency || []).reduce(
      (sum, p) => sum + (parseFloat(p.value) || 0),
      0
    );

    const growthSum = (data.growth || []).reduce(
      (sum, g) => sum + (parseFloat(g.value) || 0),
      0
    );

    result[lobeName] = {
      proficiency: profSum,
      growth: growthSum
    };
  });

  return result;
}

function lobeSide(lobeName) {
  return lobeName.includes("Left") ? "L" : "R";
}

function lobeShortName(lobeName) {
  return lobeName
    .replace(" - Left", "")
    .replace(" - Right", "");
}

function renderCognitiveLoad(neuro) {
  const cognitiveLoad = neuro?.cognitiveLoad;
  if (!cognitiveLoad) return "";

  const sums = sumCognitiveLoad(cognitiveLoad);

  const profLines = [];
  const growthLines = [];

  Object.entries(sums).forEach(([lobe, values]) => {
    const side = lobeSide(lobe);
    const short = lobeShortName(lobe);

    profLines.push(
      `    P/ Cognitive Load (${side}) - ${short.padEnd(16)} :     ${fmt3(values.proficiency)}`
    );

    growthLines.push(
      `    G/ Cognitive Load (${side}) - ${short.padEnd(16)} :     ${fmt3(values.growth)}`
    );
  });

  return `${profLines.join("\n")}

${growthLines.join("\n")}`;
}


function renderAverageBlock(averages = {}, unitType) {
  const lines = [];

  if (hasMetric(unitType, "RRN"))
    lines.push(`     Average Receptive Ratio - RRN             :     ${fmt(averages.RRN)}`);

  if (hasMetric(unitType, "PRN"))
    lines.push(`     Average Productive Ratio - PRN            :     ${fmt(averages.PRN)}`);

  if (unitType === "Third Parameter")
    lines.push(`     Average Acuity Ratio - ARN                :     ${fmt(averages.ARN)}`);

  lines.push(` `);
  lines.push(`     Average Equivalent Proficiency - XEP      :     ${fmt(averages.XEP)}`);
  lines.push(`     Average Composite Proficiency - XCP       :     ${fmt(averages.XCP)}`);
  lines.push(`     Average Band Proficiency - XBP            :     ${fmt(averages.XBP)}`);

  return lines.join("\n");
}

function renderGrowthSummary(cumulative = {}, averages = {}, unitType) {
  const lines = [];

  if (hasMetric(unitType, "deltaRRN")) {
    lines.push(`     Cumulative Growth - ΔRRN                  :     ${fmt(cumulative.deltaRRN)}`);
    lines.push(`     Average Growth - ΔRRN                     :     ${fmt(averages.deltaRRN)}`);
    lines.push(``);
  }

  if (hasMetric(unitType, "deltaPRN")) {
    lines.push(`     Cumulative Growth - ΔPRN                  :     ${fmt(cumulative.deltaPRN)}`);
    lines.push(`     Average Growth - ΔPRN                     :     ${fmt(averages.deltaPRN)}`);
    lines.push(``);
  }

  if (unitType === "Third Parameter") {
    lines.push(`     Cumulative Growth - ΔARN                  :     ${fmt(cumulative.deltaARN)}`);
    lines.push(`     Average Growth - ΔARN                     :     ${fmt(averages.deltaARN)}`);
    lines.push(``);
  }

  lines.push(`     Average Equivalent Growth - ∆GEQ          :     ${fmt(averages.GEQ)}`);

  return lines.join("\n");
}

function renderButlerProductivityRows(productivity = []) {
  if (!Array.isArray(productivity) || productivity.length === 0) {
    return "     -";
  }

  return productivity
    .map(r => {
      const date = r.criticalRefDate
        ? new Date(r.criticalRefDate).toISOString().split("T")[0]
        : "-";

      return (
        `     ${String(r.ppId).padEnd(10)}` +
        `     ${date.padEnd(30)}` +
        `     ${String(Number(r.totalDuration).toFixed(2) ?? "-").padEnd(12)}` +
        `     ${String(r.Productivity_CSD ?? "-").padEnd(28)}` +
        `     ${String(r.Productivity_USD ?? "-")}`
      );
    })
    .join("\n");
}

function renderIrregularitiesRows(irregularities = []) {
  if (!Array.isArray(irregularities) || irregularities.length === 0) {
    return `     NONE RECORDED`;
  }

  return irregularities
    .map((item, index) => {
      return `     ${String(index + 1).padEnd(10)}     ${String(item.type ?? "-").padEnd(28)}     ${item.comments ?? "-"}`;
    })
    .join("\n");
}

const getICValue = (unitType, signatureProfile, icString) => {
  if (!icString) return 0;

  // ---------- CASE 1 / CASE 2 ----------
  if (
    unitType === "Communicative I/O" ||
    unitType === "Theory & Practice"
  ) {
    if (
      signatureProfile === "Case 1: Solid Balanced" ||
      signatureProfile === "Case 2: Rigorous Balanced"
    ) {
      const map = {
        "0R0P": 0, "1R1P": 1, "2R2P": 2,
        "3R3P": 3, "4R4P": 4, "5R5P": 5
      };
      return map[icString] ?? 0;
    }

    // ---------- CASE 3a: PRODUCTIVE ----------
    if (signatureProfile === "Case 3a: Productive-Weighted") {
      const map = {
        "0R0P": 0, "0R1P": 0.5, "0R2P": 1,
        "1R2P": 1.5, "2R2P": 2, "2R3P": 2.5,
        "3R3P": 3, "3R4P": 3.5, "4R4P": 4,
        "5R5P": 5
      };
      return map[icString] ?? 0;
    }

    // ---------- CASE 3b: RECEPTIVE ----------
    if (signatureProfile === "Case 3b: Receptive-Weighted") {
      const map = {
        "0R0P": 0, "1R0P": 0.5, "2R0P": 1,
        "2R1P": 1.5, "2R2P": 2, "3R2P": 2.5,
        "3R3P": 3, "4R3P": 3.5, "4R4P": 4,
        "5R5P": 5
      };
      return map[icString] ?? 0;
    }
  }

  // ---------- TPRM ----------
  if (unitType === "Third Parameter") {
    const map = {
      "0R0P": 0, "1R1P": 1, "2R2P": 2,
      "3R3P": 3, "4R4P": 4, "5R5P": 5
    };
    return map[icString] ?? 0;
  }

  return 0;
};

export function buildCandidateEZReport({
  unitMeta,
  candidate,
  roster,
  scores,
  competency,
  neuro,
  engagement,
  candidateMarks,
  needAssessments,
  assessmentChain,
  effortResults,
}) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });


  const { leaders, assessors } = extractStaffAssignments(unitMeta.staffAssignments);

  const benchmarkRows = renderBenchmarkRows(unitMeta.benchmarks);

  const assessmentBlocks = renderAssessmentBlocks(candidate.pps);

  const engagementPercentages = engagement?.percentages ?? {};

  const competencyRows = Array.isArray(competency?.results) ? competency.results : [];

  const competencyAverages = Array.isArray(competency?.averages) ? competency.averages[0] ?? {}
    : competency?.averages ?? {};

  const competencyCumalative = Array.isArray(competency?.cumulative) ? competency.cumulative[0] ?? {}
    : competency?.cumulative ?? {};

  const cumulativeAverages = Array.isArray(competency?.cumulativeAverages) ? competency.cumulativeAverages[0] ?? {}
    : competency?.cumulativeAverages ?? {};

  const proficiencyRows =
    renderCompetencyProficiencyRows(competencyRows, unitMeta.unitType);

  const growthRows =
    renderCompetencyGrowthRows(competencyRows, scores, unitMeta.unitType);

  const hybridRows = renderCompetencyHybridRows(competencyRows, scores);

  const needsAssessmentRows = renderNeedsAssessmentRows(needAssessments, competencyRows);

  const { table1: assignmentRows1, table2: assignmentRows2 } = renderRecordOfAssignments(scores);

  const assessmentChainBlock = renderAssessmentChain(assessmentChain);

  const candidateMarksRows = renderCandidateMarksRows(candidateMarks);


  const rmsProficiencyTables = renderRmsProficiencyTables(neuro, competency?.results ?? []);

  const rmsGrowthTables = renderRmsGrowthTables(neuro, competency?.results ?? []);

  const cognitiveLoadBlock = renderCognitiveLoad(neuro);


  const productivityRows = renderButlerProductivityRows(competency?.results ?? []);

  const candidateFromScores = scores?.[0]?.candidate;
  const irregularityRows = renderIrregularitiesRows(candidateFromScores?.irregularities);



  // Inside buildCandidateEZReport, before the template string

  let unilateralProficiencySection = "";

  if (unitMeta.unitType === "Communicative I/O") {
    unilateralProficiencySection = `
     Unilateral Proficiency in Reading          :     PASS → XRR ≥ ${unitMeta.XRR ?? "-"}  
     Unilateral Proficiency in Listening        :     PASS → XLR ≥ ${unitMeta.XLR ?? "-"}  
     Unilateral Proficiency in Speaking         :     PASS → XSR ≥ ${unitMeta.XSR ?? "-"}  
     Unilateral Proficiency in Writing          :     PASS → XWR ≥ ${unitMeta.XWR ?? "-"}  `;
  } else if (unitMeta.unitType === "Theory & Practice") {
    unilateralProficiencySection = `
     Unilateral Proficiency - Theoretical Knowl :     PASS → XTR ≥ ${unitMeta.XTR ?? "-"}   
     Unilateral Proficiency - Practical Knowl   :     PASS → XPR ≥ ${unitMeta.XPR ?? "-"}    `;
  } else if (unitMeta.unitType === "Third Parameter") {
    unilateralProficiencySection = `
     Unilateral Proficiency - Receptive         :     PASS → XRVSR ≥ ${unitMeta.XRVSR ?? "-"}   
     Unilateral Proficiency - Productive        :     PASS → XPVSR ≥ ${unitMeta.XPVSR ?? "-"} 
     Unilateral Proficiency - Acuity            :     PASS → XAVSR ≥ ${unitMeta.XAVSR ?? "-"} `;
  } else {
    // fallback in case unitType is missing or unknown
    unilateralProficiencySection = `
     Unilateral Proficiency                     :     PASS → -`;
  }


  // Determine Proficiency Table Header based on unitType
  let proficiencyTableHeader = "";

  if (unitMeta.unitType === "Communicative I/O") {
    proficiencyTableHeader = `
        ||| PP ID |||     ||| RRN |||     ||| PRN |||     ||| XRR |||     ||| XLR |||     ||| XSR |||     ||| XWR |||     ||| XEP |||     ||| XCP |||     ||| XBP |||     ||| STA/P |||`;
  } else if (unitMeta.unitType === "Theory & Practice") {
    proficiencyTableHeader = `
        ||| PP ID |||     ||| RRN |||     ||| PRN |||     ||| XTR |||     ||| XPR |||     ||| XEP |||     ||| XCP |||     ||| XBP |||     ||| STA/P |||`;
  } else if (unitMeta.unitType === "Third Parameter") {
    proficiencyTableHeader = `
        ||| PP ID |||     ||| RRN |||     ||| PRN |||     ||| ARN |||     ||| XRVSR |||     ||| XPVSR |||     ||| XAVSR |||     ||| XEP |||     ||| XCP |||     ||| XBP |||     ||| STA/P |||`;
  } else {
    // fallback if unitType is unknown
    proficiencyTableHeader = `
        ||| PP ID |||     ||| RRN |||     ||| PRN |||     ||| XEP |||     ||| XCP |||     ||| XBP |||     ||| STA/P |||`;
  }


  // Determine growth table header based on unitType
  let growthTableHeader = "||| PP ID |||     ||| DAYCOUNT |||     ||| ΔRRN |||     ||| ΔPRN |||     ||| ∆GEQ |||     ||| STA/G |||";

  if (unitMeta.unitType === "Third Parameter") {
    // Add ΔARN for Third Parameter units
    growthTableHeader = "||| PP ID |||     ||| DAYCOUNT |||     ||| ΔRRN |||     ||| ΔPRN |||     ||| ΔARN |||     ||| ∆GEQ |||     ||| STA/G |||";
  }

  return `                                          
                                                     *******************************************************************************                                                                     
                                                     **                                                                           **
                                                     **                          EvalzNow Latest Edition                          **
                                                     **                                                                           **
                                                     **                     Human Capital Assessment Software                     **
                                                     **                              Ricky D. Butler                              **
                                                     **                                                                           **
                                                     **                                                                           **
                                                     **             The First Comprehensive Assessment Solution for               **
                                                     **                           Industry and Education                          **
                                                     **                                                                           **
                                                     **                      Unit Developmental Capabilities                      **
                                                     **                                                                           **
                                                     **                  Quantitative and Qualitative Assessments                 **
                                                     **                   Hybrid Proficiency & Growth Monitoring                  **
                                                     **                            Competency Accounting                          **
                                                     **                                                                           **
                                                     **                      Analysis Report Level: Candidate                     **
                                                     **                    Report Generation Date: ${today.padEnd(21)}          **
                                                     **                                                                           **
                                                     *******************************************************************************
                                                     **                  All Rights Reserved. COPYRIGHT (C) ${new Date().getFullYear()}                  **
                                                     **                   Compiled for Subscriber End User Use                    **
                                                     **     Decompilation or disassembly of this software strictly prohibited.    **
                                                     *******************************************************************************

*******************************************************                                 INTRODUCTION                              *******************************************************

     EvalzNow provides detailed, human capital assessments using an innovative approach known as Competency Accounting.  As the approach suggests, Competency Accounting is the
     measurement, the processing, and the communication of quantitative information and qualitative information regarding any performance-based entity such as students, employees, AI 
     humanoids, educational facilities, businesses, defense agencies, and so forth.  The foundation of the Competency Accounting approach centers on grouping independent variables 
     pertaining to the cerebral structure into exclusive categories prior to data processing for proficiency and growth.

     Proficiency, which passes the accountability to the candidate, is a static metric that is used to determine if a candidate can meet or can exceed a predefined benchmark or a 
     baseline threshold.  This determination is based on the candidate's ability to demonstrate mastery of core concepts/principles at a fixed point in time.

     Growth, which passes the accountability to the leader (instructor, manager, etc.), refers to the differential changes in productive skills and in receptive skills from one 
     performance point to another performance point. These differential changes, which can be correlated with normative measures at a candidate level, a unit level, or an institutional
     level, are dynamic indications of the direction of candidate progress.

     End Users are free to use data outputs, data extractions, and data reports at their lawful discretion; however, the Creator will not be held liable for the decisions of End Users 
     and the actions of End Users based on subjective interpretations.  Educators, instructors, executives, managers, and administrators should exercise sound judgment by combining 
     EvalzNow outputs with real-life observations, relatable experience, and direct accounts.


*******************************************************                                  SECTION 01                               *******************************************************

---------------------------------------
 CANDIDATE DETAILS :
---------------------------------------

  Last Name                            :     ${candidate.lastName ?? "-"}
  First Name                           :     ${candidate.firstName ?? "-"}
  Candidate ID                         :     ${candidate.candidateId ?? "-"}
  Candidate Start Date                 :     ${candidate.candidateStartDate ?? "-"}
  Nationality                          :     ${candidate.nationality ?? "-"}
  Date of Birth                        :     ${candidate.dateOfBirth ?? "-"}
  Special ID No.                       :     ${candidate.specialIdNo ?? "-"}

---------------------------------------
 UNIT DETAILS :
---------------------------------------

  Unit Name                            :     ${unitMeta.unitName ?? "-"}
  Unit ID                              :     ${unitMeta.unitId ?? "-"}
  Unit Start Date                      :     ${unitMeta.unitStartDate ?? "-"}
  Unit End Date                        :     ${unitMeta.unitEndDate ?? "-"}
  Signature Profile                    :     ${unitMeta.signatureProfile ?? "-"}
  Unit Type                            :     ${unitMeta.unitType ?? "-"}
  Unit Roster Count                    :     ${unitMeta.rosterStats.totalCount ?? "-"}
  
  Assigned Leader #1                   :     ${leaders[0]}
  Assigned Leader #2                   :     ${leaders[1]}
  Assigned Leader #3                   :     ${leaders[2]}

  Assigned Assessor #1                 :     ${assessors[0]}
  Assigned Assessor #2                 :     ${assessors[1]}
  Assigned Assessor #3                 :     ${assessors[2]}



*******************************************************                                  SECTION 02                               *******************************************************

---------------------------------------
 CANDIDATE IRREGULARITIES:
---------------------------------------

     ||| NOTE # |||     ||| IRREGULARITY TYPE |||     ||| COMMENTS |||

${irregularityRows}

---------------------------------------
 ASSESSMENT BLOCKS:
---------------------------------------

     ||| PP ID |||     ||| PERIOD TYPE |||     ||| DELIVERY |||     ||| SHORT DESCRIPTION |||

${assessmentBlocks}


*******************************************************                                  SECTION 03                               *******************************************************

---------------------------------------
 GRADE SCALE DEFINITION & THRESHOLDS:
---------------------------------------

     Based on the grade scale definitions of the unit, the pass/fail criteria for the proficiency thresholds, the hybrid thresholds, and the growth 
     thresholds of all courses are as follow:
     ${unilateralProficiencySection}
     Equivalent Proficiency                     :     PASS → XEP ≥ ${unitMeta.XEP ?? "-"}  
     Composite Proficiency                      :     PASS → XCP ≥ ${unitMeta.XCP ?? "-"}  
     Band Proficiency                           :     PASS → XBP ≥ ${unitMeta.XBP ?? "-"}  

     Receptive Growth Differential              :     PASS → ΔRRN ≥ ${unitMeta["ΔRRN"] ?? "-"} 
     Productive Growth Differential             :     PASS → ΔPRN ≥ ${unitMeta["ΔPRN"] ?? "-"} 
     Equivalent Growth                          :     PASS → ΔARN ≥ ${unitMeta["ΔGEQ"] ?? "-"} 

     Butler Interaction Proficiency             :     PASS → MSIP ≤ ${unitMeta.MSIP ?? "-"}  
     Interaction Class                          :     PASS → IC ≥ ${unitMeta.IC ?? "-"} 

     Interaction Class 0: Failing
     Interaction Class 1: At-Risk
     Interaction Class 2: Acceptable
     Interaction Class 3: Standard
     Interaction Class 4: Advanced
     Interaction Class 5: Exceptional

     Unit Outcome for Candidate                 :     ${roster.unitOutcome ?? "-"}


*******************************************************                                  SECTION 04                               *******************************************************

---------------------------------------
 TABULATIONS - PROFICIENCY:
---------------------------------------

     Proficiency, which passes the accountability to the student/worker, is a metric that is used to determine if a candidate can meet or can exceed a predefined benchmark or a baseline 
     threshold.  This determination is normally based on the candidate's ability to demonstrate mastery of core concepts at a fixed point in time. (Static Metric)

          •	The Unilateral Proficiency is used to determine if a candidate can demonstrate mastery of individual skills.
          •	The Equivalent Proficiency is used to determine if a candidate can demonstrate mastery when skills are resolved into an equivocated scalar.
          •	The Composite Proficiency is used to determine if a candidate can demonstrate mastery across all skills.
          •	The Band Proficiency is used to determine if a candidate can demonstrate mastery by averaging scores across all skills.

     ${proficiencyTableHeader}

${proficiencyRows}

${renderAverageBlock(competencyAverages, unitMeta.unitType)}


---------------------------------------
 TABULATIONS - GROWTH:
---------------------------------------

     Growth, which passes the accountability to the instructor/manager, refers to the differential changes in skills from one performance point to another performance point. 
     These differential changes, which can be correlated with normative measures at a candidate level, a unit level, or an institutional level, indicate the direction of candidate 
     progress. (Dynamic Metric)

     Candidate growth is based on the candidate's incremental progress from one point in time to another point with respect to time.

          •	If the differential change in input variables and/or output variables is negative, then the direction of candidate progress decreases due to retarded growth.
          •	If the differential change in input variables and/or output variables is zero, then the direction of candidate progress remains unchanged with no growth.
          •	If the differential change in input variables and/or output variables is positive, then the direction of candidate progress increases due to value-added growth.

     ${growthTableHeader}

${growthRows}

${renderGrowthSummary(competencyCumalative, competencyAverages, unitMeta.unitType)}


---------------------------------------
 TABULATIONS - HYBRID:
---------------------------------------

          •	The Butler Interaction Proficiency is used to determine if a candidate can demonstrate mastery based on an acceptable interaction among all inclusive variables.
          •	The Interaction Class is an interaction constant based on skills mastery within a pre-defined interaction envelope among all inclusive variables.

     ||| PP ID |||     ||| DAYCOUNT |||     ||| MSIP |||     ||| IC |||

${hybridRows}

     Average MSIP                             :     ${competencyAverages.MSIP ?? "-"}
     Average Interaction Class - IC           :     ${Number(getICValue(unitMeta.unitType, unitMeta.signatureProfile, competencyAverages.IC)).toFixed(2)}


*******************************************************                                  SECTION 05                               *******************************************************

---------------------------------------
 BUTLER PRODUCTIVITY & UTILIZATION:
---------------------------------------

     ||| PP ID |||     ||| CRITICAL REFERENCE DATE |||     ||| DAYCOUNT |||     ||| PRODUCTIVITY RATES - CSD |||     ||| PRODUCTIVITY RATES - USD |||

${productivityRows}

     Effort -  CSD Reference                   :     ${effortResults.data.CSD}
     Effort -  USD Reference                   :     ${effortResults.data.USD}

---------------------------------------
 ATTENDANCE TRACKING:
---------------------------------------

     Attendance % - Present                    :     ${Number(roster.percentages.present).toFixed(3) ?? "-"}
     Attendance % - Excused Absences           :     ${Number(roster.percentages.excusedAbsences).toFixed(3) ?? "-"}
     Attendance % - Unexcused Absences         :     ${Number(roster.percentages.unexcusedAbsences).toFixed(3) ?? "-"}
     Attendance % - Excused Tardies            :     ${Number(roster.percentages.excusedTardies).toFixed(3) ?? "-"}
     Attendance % - Unexcused Tardies          :     ${Number(roster.percentages.unexcusedTardies).toFixed(3) ?? "-"}

---------------------------------------
 ENGAGEMENT TRACKING:
---------------------------------------

     Engagement Level % - High                :     ${engagementPercentages.High != null ? engagementPercentages.High.toFixed(3) : "-"}
     Engagement Level % - Medium              :     ${engagementPercentages.Medium != null ? engagementPercentages.Medium.toFixed(3) : "-"}
     Engagement Level % - Low                 :     ${engagementPercentages.Low != null ? engagementPercentages.Low.toFixed(3) : "-"}
     Engagement Level % - Not Applicable      :     ${engagementPercentages["N/A"] != null ? engagementPercentages["N/A"].toFixed(3) : "-"}


*******************************************************                                  SECTION 06                               *******************************************************

---------------------------------------
 BENCHMARKS:
---------------------------------------

     ||| BIDs |||     ||| BENCHMARK TYPE |||     ||| BENCHMARK REF |||     ||| BENCHMARK DESCRIPTION |||

${benchmarkRows}

---------------------------------------
 CANDIDATE MARKS:
---------------------------------------

     ||| ENTRY |||     ||| IMPACT TYPE |||     ||| CONCERN IDENTIFIED |||     ||| IDENTITY DATE |||     ||| CONCERN RESOLVED |||     ||| RESOLUTION DATE |||

${candidateMarksRows}

---------------------------------------
 NEEDS ASSESSMENT:
---------------------------------------

     ||| PP ID |||     ||| CRITICAL REFERENCE DATE |||     ||| ACTION STATUS |||          ||| BIDS |||     ||| OBSERVATIONS & GOALS |||

${needsAssessmentRows}

---------------------------------------
 NEEDS ASSESSMENT CHAIN:
---------------------------------------

    ${assessmentChainBlock}


*******************************************************                                  SECTION 07                               *******************************************************

---------------------------------------
 RECORD OF ASSIGNMENTS:
---------------------------------------

      ||| PP ID |||     ||| DAYCOUNT |||     ||| TASK DECLARATION |||     ||| COMPETENCY |||     ||| ATTAINED SCORE |||     ||| MAX SCORE |||

${assignmentRows1}

      ||| PP ID |||     ||| DAYCOUNT |||     ||| WORKFLOW STAGE |||     ||| ASSESSMENT TYPE |||     ||| SCHEDULE IMPACT |||

${assignmentRows2}


*******************************************************                                  SECTION 08                               *******************************************************

---------------------------------------
 NEUROSCIENCE INDICATORS:
---------------------------------------


${rmsProficiencyTables}

${rmsGrowthTables}

${cognitiveLoadBlock}



*******************************************************                                  SECTION 09                               *******************************************************

---------------------------------------
 NOMENCLATURE:
---------------------------------------

     ∆ARN                                      :     Acuity Ratio Growth Differential
     ∆GEQ                                      :     Equivalent Growth
     ∆PRN                                      :     Productive Ratio Growth Differential
     ∆RRN                                      :     Receptive Ratio Growth Differential
     AAVS                                      :     Attained Acuity Variable Scores
     ALS                                       :     Attained Listening Score
     APS                                       :     Attained Practical Score
     APVS                                      :     Attained Productive Variable Scores
     AR                                        :     Acuity Ratio of Outputs
     ARGT                                      :     Projected Acuity Ratio Component for Growth Target
     ARN                                       :     Acuity Ratio of the Performance Point
     ARS                                       :     Attained Reading Score
     ARVS                                      :     Attained Receptive Variable Scores
     ASP                                       :     Attained Speaking Score
     ATS                                       :     Attained Theory-Based Score
     AWS                                       :     Attained Writing Score
     BID                                       :     Benchmark ID
     CID                                       :     Candidate ID
     CSD                                       :     Candidate Start Date
     DC                                        :     Day Count
     GT                                        :     Growth Target of a Performance Point
     IC                                        :     Interaction Class Based on Performance Point
     IEP                                       :     Individualized Educational Plan
     MAVS                                      :     Maximum Acuity Variable Scores
     MGS                                       :     Maximum Grammar Score
     MLS                                       :     Maximum Listening Score
     MPS                                       :     Maximum Practical Score
     MPVS                                      :     Maximum Productive Variable Scores
     MRS                                       :     Maximum Reading Score
     MRVS                                      :     Maximum Receptive Variable Scores
     MSIP                                      :     Margins of Interaction Proficiency
     MSS                                       :     Maximum Speaking Score
     MTS                                       :     Maximum Theory-Based Score
     MWS                                       :     Maximum Writing Score
     PP                                        :     Performance Point
     PR                                        :     Productive Ratio of Outputs
     PRGT                                      :     Projected Productive Ratio Component for Growth Target
     PRN                                       :     Productive Ratio of the Performance Point
     PTP                                       :     Projection Termination Point
     RMS                                       :     Root Mean Square
     RR                                        :     Receptive Ratio of Inputs
     RRGT                                      :     Projected Receptive Ratio Component for Growth Target
     RRN                                       :     Receptive Ratio of the Performance Point
     SGP                                       :     Student Growth Percentile
     SLA                                       :     Student Language Acquisition
     SMART                                     :     Specific/Measurable/Attainable/Relevancy (Realistic)/Time-Bound
     STA/G                                     :     Stability in Growth
     STA/P                                     :     Stability in Proficiency
     TEFL                                      :     Teaching English as a Foreign Language
     TTT                                       :     Teacher Talk Time
     USD                                       :     Unit Start Date
     VAM                                       :     Value-Added Model
     VTM                                       :     Value-Table Model
     XAVSR                                     :     Acuity Variable Scoring Ratio
     XBP                                       :     Band Proficiency
     XCP                                       :     Composite Proficiency
     XEP                                       :     Equivalent Proficiency
     XLR                                       :     Listening Ratio
     XPR                                       :     Practical Ratio
     XPVSR                                     :     Productive Variable Scoring Ratio
     XRR                                       :     Reading Ratio
     XRVSR                                     :     Receptive Variable Scoring Ratio
     XSR                                       :     Speaking Ratio
     XTR                                       :     Theory-Based Ratio
     XWR                                       :     Writing Ratio

---------------------------------------
 LEGAL NOTICE:
---------------------------------------

     Unless otherwise indicated, EvalzNow is the intellectual property of Ricky D. Butler (the Creator). All source codes, database builds, functionality, designs, logos, theories, 
     proprietary techniques, utilities, and methodologies are owned, are controlled, and are licensed to the Creator under applicable copyright laws and unfair competition laws of the 
     United States, foreign jurisdictions, and international conventions – whichever is more severe.

     All rights reserved. No part of this application or works associated with the development of the application may be reproduced, may be distributed, may be rewritten, may be edited, 
     may be modified, or may be transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written consent
     of the Creator. This includes any derivative works, any parallel works, or seemingly similar works of any form of any industry-related field – public or private.

     The aforementioned restrictions above also apply to the concept of Competency Accounting, which is an innovative idea that belongs to Ricky D. Butler.  This idea cannot be applied 
     in any manner, direct or indirect, without the written approval of the Creator.  Any unlawful use of the concept of Competency Accounting is subject to applicable copyright laws 
     and unfair competition laws of the United States, foreign jurisdictions, and international conventions – whichever is more severe.

     For Fair Use cases, any entity using our copywritten material for, but not limited to, criticism, commentary, news reporting, teaching, scholarship, research, or informative 
     purposes must attribute the work to the Creator.  The attribution is required regardless of the non-commercial intent, the educational intent, the scientific intent, or the 
     historical intent even if the purpose is transformative.  Please reach out to the Creator or the EvalzNow team for general inquiries or official requests.

     End Users, however, are free to use database feeds, data analytics, data extractions, and data reports at their lawful discretion.

                                                     *******************************************************************************
                                                     **                               End of Report                               **
                                                     *******************************************************************************`;
}