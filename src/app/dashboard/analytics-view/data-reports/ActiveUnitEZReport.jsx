import { getEffortBu } from "@/services/auxiliaryService";
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
        `     ${b.benchmarkDescription.padEnd(5)}     `
      );
    })
    .join("\n     ");
}




function renderCandidateMarksRows(candidateMarks = []) {
  if (!candidateMarks.length) {
    return "     -";
  }

  return candidateMarks
    .sort((a, b) => a.entryNumber - b.entryNumber)
    .map(mark => `
       ${mark.entryNumber ?? "-"}          ${mark.impactType ?? "-"}           ${mark.concernIdentified ?? "-"}           ${mark.identityDate ?? "-"}           ${mark.concernResolved ?? "-"}           ${mark.resolutionDate ?? "-"}
      `.trimEnd())
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
    proficiency: ["XRVSR", "XPVSR", "XAVSR"],
    averages: ["ARN"],          // ⬅ special average
    growth: ["deltaARN"],            // ⬅ ARN applies only here
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

// const fmt = (v) => typeof v === "number" ? v.toFixed(3) : "-";
const fmt = (v) => {
  const num = typeof v === "number" ? v : parseFloat(v);
  return v !== null && v !== undefined && v !== "" && !isNaN(num) ? num.toFixed(3) : "-";
};

const fmtDays = (v) => {
  const num = typeof v === "number" ? v : parseFloat(v);
  return v !== null && v !== undefined && v !== "" && !isNaN(num) ? num.toFixed(2) : "-";
};


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
    ["XRVSR", 8],
    ["XPVSR", 8],
    ["XAVSR", 8],
  ].filter(([key]) => hasMetric(unitType, key));

  return results
    .sort((a, b) => a.ppId - b.ppId)
    .map(r => {
      let row =
        `     ${String(r.ppId).padEnd(10)}  `;

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
    ["GEQ", 8],
    ["ARN", 8],
  ].filter(([key]) => hasMetric(unitType, key));

  return results
    .sort((a, b) => a.ppId - b.ppId)
    .map(r => {
      // const score = scores.find(s => s.ppId === r.ppId);
      // const dayCount = score?.durationHrs ?? "-";

      let row =
        `     ${String(r.ppId).padEnd(10)}  ` +
        `     ${fmt(r.totalDuration).padEnd(10)}  `;

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
    .sort((a, b) => a.ppId - b.ppId)
    .map(r => {
      // const score = scores.find(s => s.ppId === r.ppId);
      // const dayCount = score?.dayCount ?? "-";

      return (
        `     ${String(r.ppId).padEnd(10)}  ` +
        `     ${fmt(r.totalDuration).padEnd(10)}  ` +
        `     ${fmt(r.MSIP).padEnd(8)}  ` +
        `     ${(r.IC ?? "-").padEnd(8)}  `
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

function resolveActionStatus(bIds = []) {
  if (!Array.isArray(bIds) || bIds.length === 0) return "OPEN";
  if (bIds.length < 5) return "PENDING";
  return "CLOSED";
}

function renderNeedsAssessmentRows(needAssessments = [], competencyRows = []) {
  if (!needAssessments.length) return "     -";

  return needAssessments
    .map(na => {
      const competencyRow = competencyRows.find(c => c.ppId === na.ppId);

      const dayCount = competencyRow?.totalDuration ?? "-";
      const criticalRefDate = competencyRow?.criticalRefDate
        ? new Date(competencyRow.criticalRefDate).toISOString().split("T")[0]
        : "-";

      const actionStatus = resolveActionStatus(na.bIds);
      const observation = na.observation?.trim() || "-";

      return (
        `     ${String(na.ppId).padEnd(10)}` +
        `     ${String(criticalRefDate).padEnd(22)}` +
        `     ${String(dayCount).padEnd(12)}` +
        `     ${actionStatus.padEnd(10)}` +
        `     ${observation}`
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

  const table1 = scores
    .map(s =>
      `     ${String(s.ppId).padEnd(10)}` +
      `     ${String(s.durationHrs ?? "-").padEnd(12)}` +
      `     ${String(s.remarks ?? "-").padEnd(28)}` +
      `     ${String(s.attainedScore ?? "-").padEnd(18)}` +
      `     ${String(s.maxScore ?? "-")}`
    )
    .join("\n");

  const table2 = scores
    .map(s =>
      `     ${String(s.ppId).padEnd(10)}` +
      `     ${String(s.durationHrs ?? "-").padEnd(12)}` +
      `     ${String(s.workflowStage ?? "-").padEnd(20)}` +
      `     ${String(s.assessmentType ?? "-").padEnd(20)}` +
      `     ${String(s.scheduleImpact ?? "-")}`
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
    .map(sel => {
      const ic = `<${fmt(sel.RRN)},${fmt(sel.PRN)}>`;
      const bids =
        Array.isArray(sel.benchmarkIds) && sel.benchmarkIds.length
          ? sel.benchmarkIds.join(", ")
          : "-";

      const crd = sel.criticalRefDate
        ? new Date(sel.criticalRefDate).toISOString().split("T")[0]
        : "-";

      return (
        ` Performance Point ID ${sel.ppId ?? "-"}\n` +
        ` IC #: ${ic}\n` +
        ` Benchmark IDs: ${bids}\n` +
        ` Action Status: ${sel.actionStatus ?? "-"}\n` +
        ` Critical Reference Date: ${crd}\n`
      );
    })
    .join("\n");
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

    lines.push(`     Average Growth - ΔRRN                     :     ${fmt(averages.deltaRRN)}`);
  }

  if (hasMetric(unitType, "deltaPRN")) {

    lines.push(`     Average Growth - ΔPRN                     :     ${fmt(averages.deltaPRN)}`);
  }

  if (unitType === "Third Parameter") {
    lines.push(`     Average Growth - ΔARN                     :     ${fmt(averages.deltaARN)}`);
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
        `     ${String(r.totalDuration ?? "-").padEnd(12)}` +
        `     ${String(r.Productivity_CSD ?? "-").padEnd(28)}` +
        `     ${String(r.Productivity_USD ?? "-")}`
      );
    })
    .join("\n    ");
}




export async function buildUnitEZReport({ unit }) {
  const today = new Date().toDateString();

  const {
    unitName,
    unitId,
    unitStartDate,
    unitEndDate,
    unitType,
    environment,
    XRR, XLR, XSR, XWR, XPR, XTR, XRVSR, XPVSR, XAVSR, XEP, XCP, XBP,
    "ΔRRN": deltaRRN,
    "ΔPRN": deltaPRN,
    "ΔARN": deltaARN,
    "ΔGEQ": deltaGEQ,
    MSIP,
    IC,
    signatureProfile,
    rosterStats = {},
    staffAssignments = [],
    benchmarks = [],
    candidates = [],
    engageLevelStats,
    rosterPercentages,
    tabulationAverages,
    assessmentSummary,
    competencyStability,
    rosterCandidates = []
  } = unit;

  const { leaders, assessors } =
    extractStaffAssignments(staffAssignments);

  // Fetch effort data for all candidates in the unit
  const effortData = {};
  if (unitId && candidates.length) {
    await Promise.all(
      candidates.map(async (candidate) => {
        try {
          // Use the same getEffortBu function that works for single candidate
          const response = await getEffortBu(unitId, candidate.candidateId);

          console.log(`Effort response for candidate ${candidate.candidateId}:`, response);

          // Extract CSD and USD from the response
          // Based on your console.log of effortResults, adjust the path as needed
          effortData[candidate.candidateId] = {
            CSD: response?.data?.CSD ?? response?.CSD ?? "-",
            USD: response?.data?.USD ?? response?.USD ?? "-"
          };

        } catch (err) {
          console.error(`Failed to fetch effort for candidate ${candidate.candidateId}`, err);
          effortData[candidate.candidateId] = { CSD: "-", USD: "-" };
        }
      })
    );
  }

  const LEFT_PAD = 5;

  const rosterSource = rosterCandidates.length ? rosterCandidates : candidates;

  const rosterRows = rosterSource.map((c) => {
    const unitOutcome =
      c.unitOutcome ??
      (Array.isArray(c.roster) && c.roster[0]?.unitOutcome) ??
      "-";
    const candidateStartDate = c.candidateStartDate ?? c.startDate ?? "-";

    
    return (
      `${" ".repeat(LEFT_PAD)}` +
      `${String(c.lastName ?? "-").padEnd(15)}` +
      `${String(c.firstName ?? "-").padEnd(19)}` +
      `${String(c.candidateId ?? c.candidateId ?? "-").padEnd(20)}` +
      `${String(candidateStartDate).padEnd(28)}` +
      `${String(c.nationality ?? "-").padEnd(19)}` +
      `${String(unitOutcome).padEnd(15)}`
    );
  }).join("\n     ");


  const engagementPercentages = engageLevelStats?.percentages ?? {};

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

  //  getAvg function 
  const getAvg = key => {
    // Handle tabulationAverages as array
    if (Array.isArray(tabulationAverages)) {
      const found = tabulationAverages.find(t => {
        // Handle different possible field names
        if (t.metric === key) return true;
        if (key === "IC" && t.IC !== undefined) return true;
        if (key === "STAP" && t.STAP !== undefined) return true;
        if (key === "STAG" && t.STAG !== undefined) return true;
        return false;
      });

      if (found) {
        // Return based on what's available
        if (found.value !== undefined) return found.value;
        if (found[key] !== undefined) return found[key];
      }
    }

    // Handle tabulationAverages as object
    if (tabulationAverages && typeof tabulationAverages === 'object') {
      if (tabulationAverages[key] !== undefined) return tabulationAverages[key];
      if (key === "IC" && tabulationAverages.IC !== undefined) return tabulationAverages.IC;
      if (key === "STAP" && tabulationAverages.STAP !== undefined) return tabulationAverages.STAP;
      if (key === "STAG" && tabulationAverages.STAG !== undefined) return tabulationAverages.STAG;
    }

    return "-";
  };

  const interactionClass = getICValue(
    unitType,
    signatureProfile,
    getAvg("IC")
  );
  const benchmarkRows = renderBenchmarkRows(benchmarks);


  const passPct = (key, threshold, cmp = (v, t) => v >= t) => {
    if (threshold === null || threshold === undefined || threshold === "") return null;
    return calculatePassFraction(
      candidates,
      (avg) => parseFloat(avg[key]),
      (v) => cmp(v, Number(threshold))
    );
  };

  const line = (label, value) => `${label.padEnd(42)}:     ${fmt(value)}`;

  // ---------- PROFICIENCY ----------
  const unilateralByType = {
    "Communicative I/O": [["XRR", XRR], ["XLR", XLR], ["XSR", XSR], ["XWR", XWR]],
    "Theory & Practice": [["XTR", XTR], ["XPR", XPR]],
    "Third Parameter": [["XRVSR", XRVSR], ["XPVSR", XPVSR], ["XAVSR", XAVSR]],
  };

  const proficiencyUnilateralLines = (unilateralByType[unitType] ?? []).map(
    ([key, threshold]) => line(`Pass % Avg Unilateral - ${key}`, passPct(key, threshold))
  );

  const RATIO_PASS = 0.7;

  const ratioLines = [
    line("Pass % Avg Receptive Ratio - RRN", passPct("RRN", RATIO_PASS)),
    line("Pass % Avg Productive Ratio - PRN", passPct("PRN", RATIO_PASS)),
    ...(unitType === "Third Parameter"
      ? [line("Pass % Avg Acuity Ratio - ARN", passPct("ARN", RATIO_PASS))]
      : []),
  ];

  const growthLines = [
    line("Pass % Average Growth - ΔRRN", passPct("deltaRRN", deltaRRN)),
    line("Pass % Average Growth - ΔPRN", passPct("deltaPRN", deltaPRN)),
    ...(unitType === "Third Parameter"
      ? [line("Pass % Average Growth - ΔARN", passPct("deltaARN", deltaARN))]
      : []),
    "",
    line("Pass % Avg Equivalent Growth - ∆GEQ", passPct("GEQ", deltaGEQ)),
    line("Pass % Stability in Growth", competencyStability?.stagStableFraction),
  ];


  const firstCandidate = candidates[0];

  const leaderMarks = firstCandidate?.leaderMarks || [];

  const uniqueLeaderMarks = leaderMarks.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        x =>
          x.entryNumber === item.entryNumber &&
          x.impactType === item.impactType &&
          x.concernIdentified === item.concernIdentified &&
          x.identityDate === item.identityDate &&
          x.concernResolved === item.concernResolved &&
          x.resolutionDate === item.resolutionDate
      )
  );

  const leaderMarksRows =
    uniqueLeaderMarks
      .map(mark => {
        return (
          `     ${String(mark.entryNumber ?? "—").padEnd(10)}` +
          `     ${String(mark.impactType ?? "—").padEnd(16)}` +
          `     ${String(mark.concernIdentified ?? "—").padEnd(28)}` +
          `     ${String(mark.identityDate ?? "—").padEnd(18)}` +
          `     ${String(mark.concernResolved ?? "—").padEnd(18)}` +
          `     ${String(mark.resolutionDate ?? "—").padEnd(18)}`
        );
      })
      .join("\n     ") || "     —";

  const improvements = firstCandidate?.unitImprovement || [];

  const uniqueImprovements = improvements.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        x =>
          x.lesson === item.lesson &&
          JSON.stringify(x.bIds) === JSON.stringify(item.bIds) &&
          JSON.stringify(x.benchmarkIds) === JSON.stringify(item.benchmarkIds)
      )
  );

  const unitImprovementRows =
    uniqueImprovements
      .map((ui, index) => {
        const parseIds = (value) => {
          if (Array.isArray(value)) return value;
          if (typeof value === "string") {
            try {
              const parsed = JSON.parse(value);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }
          return [];
        };

        // const bids = parseIds(ui.bIds).join(", ") || "—";
        const benchmarkIds = parseIds(ui.benchmarkIds).join(", ") || "—";

        return (
          `     ${String(index + 1).padEnd(10)}` +
          // `     ${bids.padEnd(15)}` +
          `     ${String(ui.lesson ?? "—").padEnd(40)}` +
          `     ${benchmarkIds.padEnd(20)}`
        );
      })
      .join("\n     ") || "    —";

  function calculatePassFraction(candidates, getValue, passTest) {
    if (!Array.isArray(candidates) || !candidates.length) return 0;
    let total = 0;
    let passed = 0;

    const getAvgRow = (c) =>
      (c.competencyAverages ?? []).find((a) => a.ppId === "Average") ??
      c.competencyAverages?.[0] ??
      null;


    candidates.forEach(c => {
      const avg = getAvgRow(c);
      if (!avg) return;
      const value = getValue(avg);
      if (value === null || value === undefined || Number.isNaN(value)) return;
      total++;
      if (passTest(value)) passed++;
    });

    return total ? passed / total : 0;
  }

  const msipPassFraction = MSIP != null
    ? calculatePassFraction(
      candidates,
      avg => (typeof avg.MSIP === "number" ? avg.MSIP : parseFloat(avg.MSIP)),
      value => value <= MSIP
    )
    : 0;

  const icPassFraction = IC != null
    ? calculatePassFraction(
      candidates,
      avg => getICValue(unitType, signatureProfile, avg.IC),
      value => value >= IC
    )
    : 0;

  let unilateralProficiencySection = "";


  const getCandidateProductivity = (c) => {
    const avgRow =
      (c.competencyAverages ?? []).find((a) => a.ppId === "Average") ??
      c.competencyAverages?.[0] ??
      {};
    return { CSD: avgRow.Productivity_CSD, USD: avgRow.Productivity_USD };
  };

  const productivityRows =
    candidates
      .map((c) => {
        const { CSD, USD } = getCandidateProductivity(c);
        return (
          `   ${String(c.lastName ?? "-").padEnd(15)}` +
          `   ${String(c.firstName ?? "-").padEnd(15)}` +
          `   ${String(c.candidateId ?? c.id ?? "-").padEnd(20)}` +
          `   ${fmt(CSD).padEnd(18)}` +
          `   ${fmt(USD)}`
        );
      })
      .join("\n     ") || "     No productivity data available";



  if (unitType === "Communicative I/O") {
    unilateralProficiencySection = `
     Unilateral Proficiency in Reading          :     PASS → XRR ≥ ${XRR ?? "-"}  
     Unilateral Proficiency in Listening        :     PASS → XLR ≥ ${XLR ?? "-"}  
     Unilateral Proficiency in Speaking         :     PASS → XSR ≥ ${XSR ?? "-"}  
     Unilateral Proficiency in Writing          :     PASS → XWR ≥ ${XWR ?? "-"}  `;
  } else if (unitType === "Theory & Practice") {
    unilateralProficiencySection = `
     Unilateral Proficiency - Theoretical Knowl :     PASS → XTR ≥ ${XTR ?? "-"}   
     Unilateral Proficiency - Practical Knowl   :     PASS → XPR ≥ ${XPR ?? "-"}    `;
  } else if (unitType === "Third Parameter") {
    unilateralProficiencySection = `
     Unilateral Proficiency - Receptive         :     PASS → XRVSR ≥ ${XRVSR ?? "-"}   
     Unilateral Proficiency - Productive        :     PASS → XPVSR ≥ ${XPVSR ?? "-"} 
     Unilateral Proficiency - Acuity            :     PASS → XAVSR ≥ ${XAVSR ?? "-"} `;
  } else {
    // fallback in case unitType is missing or unknown
    unilateralProficiencySection = `
    Unilateral Proficiency                     :     PASS → -`;
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
                                                     **                      Analysis Report Level: Unit                          **
                                                     **                    Report Generation Date: ${today}                **
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
     baseline threshold.  This determination is based on the candidate’s ability to demonstrate mastery of core concepts/principles at a fixed point in time.

     Growth, which passes the accountability to the leader (instructor, manager, etc.), refers to the differential changes in productive skills and in receptive skills from one 
     performance point to another performance point. These differential changes, which can be correlated with normative measures at a candidate level, a unit level, or an institutional
     level, are dynamic indications of the direction of candidate progress.

     End Users are free to use data outputs, data extractions, and data reports at their lawful discretion; however, the Creator will not be held liable for the decisions of End Users 
     and the actions of End Users based on subjective interpretations.  Educators, instructors, executives, managers, and administrators should exercise sound judgment by combining 
     EvalzNow outputs with real-life observations, relatable experience, and direct accounts.


*******************************************************                                  SECTION 01                               *******************************************************

---------------------------------------
 UNIT DETAILS :
---------------------------------------

  Unit Name                            :     ${unitName ?? "-"}
  Unit ID                              :     ${unitId ?? "-"}
  Unit Start Date                      :     ${unitStartDate ?? "-"}
  Unit End Date                        :     ${unitEndDate ?? "-"}
  Signature Profile                    :     ${signatureProfile ?? "-"}
  Unit Type                            :     ${unitType ?? "-"}
  Environment                          :     ${environment ?? "-"}
  Unit Roster Count                    :     ${rosterStats.totalCount ?? "-"}
  
  Assigned Leader #1                   :     ${leaders[0]}
  Assigned Leader #2                   :     ${leaders[1]}
  Assigned Leader #3                   :     ${leaders[2]}

  Assigned Assessor #1                 :     ${assessors[0]}
  Assigned Assessor #2                 :     ${assessors[1]}
  Assigned Assessor #3                 :     ${assessors[2]}


*******************************************************                                  SECTION 02                               *******************************************************

---------------------------------------
 UNIT ROSTER:
---------------------------------------

     ||| LAST NAME |||     ||| FIRST NAME |||     ||| CANDIDATE ID |||     ||| CANDIDATE START DATE |||     ||| NATIONALITY |||     ||| UNIT OUTCOME |||

     ${rosterRows}

*******************************************************                                  SECTION 03                               *******************************************************

---------------------------------------
 GRADE SCALE DEFINITION & THRESHOLDS:
---------------------------------------

     Based on the grade scale definitions of the unit, the pass/fail criteria for the proficiency thresholds, the hybrid thresholds, and the growth 
     thresholds of all courses are as follow:
     ${unilateralProficiencySection}
     Equivalent Proficiency                     :     PASS → XEP ≥ ${XEP ?? "-"}  
     Composite Proficiency                      :     PASS → XCP ≥ ${XCP ?? "-"}  
     Band Proficiency                           :     PASS → XBP ≥ ${XBP ?? "-"}  

     Receptive Growth Differential              :     PASS → ΔRRN ≥ ${deltaRRN ?? "-"} 
     Productive Growth Differential             :     PASS → ΔPRN ≥ ${deltaPRN ?? "-"} 
     ${unitType === "Third Parameter"
      ? `Acuity Growth Differential                 :     PASS → ΔARN ≥ ${deltaARN ?? "-"}` : ""}
     Equivalent Growth                          :     PASS → ΔGEQ ≥ ${deltaGEQ ?? "-"} 

     Butler Interaction Proficiency             :     PASS → MSIP ≤ ${MSIP ?? "-"}  
     Interaction Class                          :     PASS → IC ≥ ${IC ?? "-"} 

     Interaction Class 0: Failing
     Interaction Class 1: At-Risk
     Interaction Class 2: Acceptable
     Interaction Class 3: Standard
     Interaction Class 4: Advanced
     Interaction Class 5: Exceptional

*******************************************************                                  SECTION 04                               *******************************************************

---------------------------------------
 TABULATIONS - PROFICIENCY:
---------------------------------------

     Proficiency, which passes the accountability to the student/worker, is a metric that is used to determine if a candidate can meet or can exceed a predefined benchmark or a baseline 
	 threshold.  This determination is normally based on the candidate’s ability to demonstrate mastery of core concepts at a fixed point in time. (Static Metric)

          •	The Unilateral Proficiency is used to determine if a candidate can demonstrate mastery of individual skills.
          •	The Equivalent Proficiency is used to determine if a candidate can demonstrate mastery when skills are resolved into an equivocated scalar.
          •	The Composite Proficiency is used to determine if a candidate can demonstrate mastery across all skills.
          •	The Band Proficiency is used to determine if a candidate can demonstrate mastery by averaging scores across all skills.

     Pass percentages below are based on the average values of each corresponding metric: 

     ${proficiencyUnilateralLines.join("\n     ")}

     ${ratioLines.join("\n     ")}
     ${line("Pass % Avg Equivalent Proficiency - XEP", passPct("XEP", XEP))}
     ${line("Pass % Avg Composite Proficiency - XCP", passPct("XCP", XCP))}
     ${line("Pass % Avg Band Proficiency - XBP", passPct("XBP", XBP))}

     ${line("Pass % Stability in Proficiency", competencyStability?.stapStableFraction)}

---------------------------------------
 TABULATIONS - GROWTH:
---------------------------------------

     Growth, which passes the accountability to the instructor/manager, refers to the differential changes in skills from one performance point to another performance point. 
	 These differential changes, which can be correlated with normative measures at a candidate level, a unit level, or an institutional level, indicate the direction of candidate 
	 progress. (Dynamic Metric)

     Candidate growth is based on the candidate’s incremental progress from one point in time to another point with respect to time.

          •	If the differential change in input variables and/or output variables is negative, then the direction of candidate progress decreases due to retarded growth.
          •	If the differential change in input variables and/or output variables is zero, then the direction of candidate progress remains unchanged with no growth.
          •	If the differential change in input variables and/or output variables is positive, then the direction of candidate progress increases due to value-added growth.

     Pass percentages below are based on the average values of each corresponding metric: 

     ${growthLines.join("\n     ")}

---------------------------------------
 TABULATIONS - HYBRID:
---------------------------------------

          •	The Butler Interaction Proficiency is used to determine if a candidate can demonstrate mastery based on an acceptable interaction among all inclusive variables.
          •	The Interaction Class is an interaction constant based on skills mastery within a pre-defined interaction envelope among all inclusive variables.

     Pass percentages below are based on the average values of each corresponding metric: 

     Pass % Avg Butler Int Proficiency - MSIP :     ${fmt(msipPassFraction)}
     Pass % Avg Interaction Class - IC        :     ${fmt(icPassFraction)}

*******************************************************                                  SECTION 05                               *******************************************************

---------------------------------------
 BUTLER PRODUCTIVITY & UTILIZATION:
---------------------------------------

     Pass percentages below are based on the average values of each corresponding metric: 

     ||| LAST NAME |||     ||| FIRST NAME |||     ||| CANDIDATE ID |||     ||| PRODUCTIVITY - CSD |||     ||| PRODUCTIVITY - USD |||

     ${productivityRows}
  
     ||| LAST NAME |||     ||| FIRST NAME |||     ||| CANDIDATE ID |||     ||| EFFORT - CSD |||     ||| EFFORT - USD |||

     ${candidates.map(c => {
        const lastName = c.lastName ?? "-";
        const firstName = c.firstName ?? "-";
        const candidateId = c.candidateId ?? c.id ?? "-";

        const CSD = c.effortBu?.data?.CSD;
        const USD = c.effortBu?.data?.USD;

        return (
          `   ${lastName.padEnd(15)}` +
          `   ${firstName.padEnd(15)}` +
          `   ${String(candidateId).padEnd(20)}` +
          `   ${fmt(CSD).padEnd(18)}` +
          `   ${fmt(USD)}`
        );
      }).join("\n     ") || "     No effort data available"}

---------------------------------------
 ATTENDANCE TRACKING:
---------------------------------------

     Attendance % - Present                    :     ${fmt(rosterPercentages?.present) ?? "-"}
     Attendance % - Excused Absences           :     ${fmt(rosterPercentages?.excusedAbsences) ?? "-"}
     Attendance % - Unexcused Absences         :     ${fmt(rosterPercentages?.unexcusedAbsences) ?? "-"}
     Attendance % - Excused Tardies            :     ${fmt(rosterPercentages?.excusedTardies) ?? "-"}
     Attendance % - Unexcused Tardies          :     ${fmt(rosterPercentages?.unexcusedTardies) ?? "-"}

---------------------------------------
 ENGAGEMENT TRACKING:
---------------------------------------

     Engagement Level % - High                :     ${fmt(engagementPercentages.High) ?? "-"}
     Engagement Level % - Medium              :     ${fmt(engagementPercentages.Medium) ?? "-"}
     Engagement Level % - Low                 :     ${fmt(engagementPercentages.Low) ?? "-"}
     Engagement Level % - Not Applicable      :     ${fmt(engagementPercentages["N/A"]) ?? "-"}

---------------------------------------
 NEEDS ASSESSMENT TRACKING:
---------------------------------------

     Action Status % - Open                   :     ${fmt(assessmentSummary?.statusPercentages?.Open) ?? 0}
     Action Status % - Closed                 :     ${fmt(assessmentSummary?.statusPercentages?.Pending) ?? 0}
     Action Status % - Pending                :     ${fmt(assessmentSummary?.statusPercentages?.Closed) ?? 0}

*******************************************************                                  SECTION 06                               *******************************************************

---------------------------------------
 BENCHMARKS:
---------------------------------------

     ||| BIDs |||     ||| BENCHMARK TYPE |||     ||| BENCHMARK REF |||     ||| BENCHMARK DESCRIPTION |||

     ${benchmarkRows}
---------------------------------------
 LEADER MARKS:
---------------------------------------

     ||| ENTRY |||     ||| IMPACT TYPE |||     ||| CONCERN IDENTIFIED |||     ||| IDENTITY DATE |||     ||| CONCERN RESOLVED |||     ||| RESOLUTION DATE |||

     ${leaderMarksRows}

---------------------------------------
 IMPROVEMENTS & OPTIMIZATION:
---------------------------------------

     ||| ENTRY # |||     ||| LESSONS LEARNED |||     ||| LINKED BENCHMARKS |||

     ${unitImprovementRows}

*******************************************************                                  SECTION 07                               *******************************************************

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
                                                     *******************************************************************************
                                                     `
};
