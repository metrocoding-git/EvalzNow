import { useEffect } from "react";

function extractStaffAssignments(staffAssignments = []) {
    const leaders = staffAssignments
      .filter(s => s.roleType === "Leader")
      .map(s => `${s.staff.lastName}, ${s.staff.firstName}`);
  
    const assessors = staffAssignments
      .filter(s => s.roleType === "Assessor")
      .map(s => `${s.staff.lastName}, ${s.staff.firstName}`);
  
    const pad = (arr, size = 3) =>
      Array.from({ length: size }, (_, i) => arr[i] ?? "XXX");
  
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
          `     ${String(b.id).padEnd(12)}` +
          `     ${String(b.benchmarkId).padEnd(12)}` +
          `     ${b.benchmarkType.padEnd(22)}` +
          `     ${b.benchmarkRef.padEnd(22)}` +
          `     ${b.benchmarkDescription}`
        );
      })
      .join("\n");
  }
  

  
  
  function renderCandidateMarksRows(candidateMarks = []) {
    if (!candidateMarks.length) {
      return "     XXX";
    }
  
    return candidateMarks
      .sort((a, b) => a.entryNumber - b.entryNumber)
      .map(mark => `
       ${mark.entryNumber ?? "XXX"}          ${mark.impactType ?? "XXX"}           ${mark.concernIdentified ?? "XXX"}           ${mark.identityDate ?? "XXX"}           ${mark.concernResolved ?? "XXX"}           ${mark.resolutionDate ?? "XXX"}
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
  
  const fmt = (v) => typeof v === "number" ? v.toFixed(3) : "XXX";
  
  const hasMetric = (unitType, metric) =>
    UNIT_TYPE_RULES.ALL?.proficiency?.includes(metric) ||
    UNIT_TYPE_RULES.ALL?.growth?.includes(metric) ||
    UNIT_TYPE_RULES[unitType]?.proficiency?.includes(metric) ||
    UNIT_TYPE_RULES[unitType]?.growth?.includes(metric) ||
    UNIT_TYPE_RULES[unitType]?.averages?.includes(metric);

    function renderCompetencyProficiencyRows(results = [], unitType) {
      if (!results.length) return "     XXX";
    
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
    
          row += `     ${(r.STAP ?? "XXX").padEnd(8)}  `;
          return row;
        })
        .join("\n");
    }
    

  
    function renderCompetencyGrowthRows(results = [], scores = [], unitType) {
      if (!results.length) return "     XXX";
    
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
          // const dayCount = score?.durationHrs ?? "XXX";
    
          let row =
            `     ${String(r.ppId).padEnd(10)}  ` +
            `     ${fmt(r.totalDuration).padEnd(10)}  `;
    
          cols.forEach(([key, w]) => {
            row += `     ${fmt(r[key]).padEnd(w)}  `;
          });
    
          row += `     ${(r.STAG ?? "XXX").padEnd(8)}  `;
          return row;
        })
        .join("\n");
    }
    

  
  function renderCompetencyHybridRows(results = [], scores = []) {
    if (!results.length) return "     XXX";
  
    return results
      .sort((a, b) => a.ppId - b.ppId)
      .map(r => {
        // const score = scores.find(s => s.ppId === r.ppId);
        // const dayCount = score?.dayCount ?? "XXX";
  
        return (
          `     ${String(r.ppId).padEnd(10)}  ` +
          `     ${fmt(r.totalDuration).padEnd(10)}  ` +
          `     ${fmt(r.MSIP).padEnd(8)}  ` +
          `     ${(r.IC ?? "XXX").padEnd(8)}  `
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
    if (!needAssessments.length) return "     XXX";
  
    return needAssessments
      .map(na => {
        const competencyRow = competencyRows.find(c => c.ppId === na.ppId);
  
        const dayCount = competencyRow?.totalDuration ?? "XXX";
        const criticalRefDate = competencyRow?.criticalRefDate
          ? new Date(competencyRow.criticalRefDate).toISOString().split("T")[0]
          : "XXX";
  
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
        table1: "     XXX",
        table2: "     XXX"
      };
    }
  
    const table1 = scores
      .map(s =>
        `     ${String(s.ppId).padEnd(10)}` +
        `     ${String(s.durationHrs ?? "XXX").padEnd(12)}` +
        `     ${String(s.remarks ?? "XXX").padEnd(28)}` +
        `     ${String(s.attainedScore ?? "XXX").padEnd(18)}` +
        `     ${String(s.maxScore ?? "XXX")}`
      )
      .join("\n");
  
    const table2 = scores
      .map(s =>
        `     ${String(s.ppId).padEnd(10)}` +
        `     ${String(s.durationHrs ?? "XXX").padEnd(12)}` +
        `     ${String(s.workflowStage ?? "XXX").padEnd(20)}` +
        `     ${String(s.assessmentType ?? "XXX").padEnd(20)}` +
        `     ${String(s.scheduleImpact ?? "XXX")}`
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
          : "XXX";
  
        return (
          ` Performance Point ID ${sel.ppId ?? "XXX"}\n` +
          ` IC #: ${ic}\n` +
          ` Benchmark IDs: ${bids}\n` +
          ` Action Status: ${sel.actionStatus ?? "XXX"}\n` +
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
      return "     XXX";
    }
  
    return productivity
      .map(r => {
        const date = r.criticalRefDate
          ? new Date(r.criticalRefDate).toISOString().split("T")[0]
          : "XXX";
  
        return (
        `     ${String(r.ppId).padEnd(10)}` +
        `     ${date.padEnd(30)}` +
        `     ${String(r.totalDuration ?? "X.XXX").padEnd(12)}` + 
        `     ${String(r.Productivity_CSD ?? "X.XXX").padEnd(28)}` +
        `     ${String(r.Productivity_USD ?? "X.XXX")}`
        );
      })
      .join("\n    ");
  }
  
  
  
  
  export function buildUnitEZReport({ unit }) {
    const today = new Date().toDateString();
  
    const {
      unitName,
      unitId,
      unitStartDate,
      unitEndDate,
      unitType,
      XRR, XLR, XSR, XWR,XEP, XCP, XBP, 
      "∆RRN": deltaRRN,
      "∆PRN": deltaPRN,
      "∆GEQ": deltaGEQ,
      MSIP,
      IC,
      signatureProfile,
      staffAssignments = [],
      benchmarks = [],
      candidates = [],
      engageLevelStats,
      rosterPercentages,
      tabulationAverages,
      assessmentSummary,
    } = unit;
  
    const { leaders, assessors } =
      extractStaffAssignments(staffAssignments);

    const rosterRows = candidates.map(c => `
        ${c.lastName.padEnd(15)}
        ${c.firstName.padEnd(15)}
        ${String(c.candidateId).padEnd(10)}
        ${c.candidateStartDate ?? "XXX"}
   `).join("\n");
   
   const engagementPercentages = engageLevelStats?.percentages ?? {};

   const getAvg = key =>  tabulationAverages?.find(t => t.metric === key)?.value ?? "XXX";
  
   const benchmarkRows = renderBenchmarkRows(benchmarks);

   const proficiencyUnilateralLines = [];

    if (unitType === "Third Parameter") {
      proficiencyUnilateralLines.push(
        `     Pass % Avg Productive Ratio - ARN         :     ${getAvg("ARN") ?? "XXX"}`,
        `     Pass % Avg Unilateral - XRVSR             :     ${getAvg("XRVSR") ?? "XXX"}`,
        `     Pass % Avg Unilateral - XPVSR             :     ${getAvg("XPVSR") ?? "XXX"}`,
        `     Pass % Avg Unilateral - XAVSR             :     ${getAvg("XAVSR") ?? "XXX"}`
      );
    }

    if (unitType === "Communicative I/O") {
      proficiencyUnilateralLines.push(
        `     Pass % Avg Unilateral - XRR               :     ${getAvg("XRR") ?? "XXX"}`,
        `     Pass % Avg Unilateral - XLR               :     ${getAvg("XLR") ?? "XXX"}`,
        `     Pass % Avg Unilateral - XSR               :     ${getAvg("XSR") ?? "XXX"}`,
        `     Pass % Avg Unilateral - XWR               :     ${getAvg("XWR") ?? "XXX"}`
      );
    }

    if (unitType === "Theory & Practice") {
      proficiencyUnilateralLines.push(
        `     Pass % Avg Unilateral - XTR               :     ${getAvg("XTR") ?? "XXX"}`,
        `     Pass % Avg Unilateral - XPR               :     ${getAvg("XPR") ?? "XXX"}`
      );
    }


    const growthLines = [];

    growthLines.push(
      `     Pass % Average Growth - ΔRRN              :     ${getAvg("deltaRRN") ?? "XXX"}`,
      `     Pass % Average Growth - ΔPRN              :     ${getAvg("deltaPRN") ?? "XXX"}`
    );

    if (unitType === "Third Parameter") {
      growthLines.push(
        `     Pass % Average Growth - ΔARN              :     ${getAvg("deltaARN") ?? getAvg("deltaPRN") ?? "XXX"}`
      );
    }

    growthLines.push(
      `     
            Pass % Avg Equivalent Growth - ∆GEQ       :     ${getAvg("GEQ") ?? "XXX"}`,
      `     Pass % Stability in Growth                :     ${getAvg("STAG") ?? "XXX"}`
    );


    const leaderMarksRows = candidates.flatMap(candidate => {
      return (candidate.leaderMarks || []).map(mark => {
        return (
          `     ${String(mark.entryNumber ?? "—").padEnd(10)}` +
          `     ${String(mark.impactType ?? "—").padEnd(16)}` +
          `     ${String(mark.concernIdentified ?? "—").padEnd(28)}` +
          `     ${String(mark.identityDate ?? "—").padEnd(18)}` +
          `     ${String(mark.concernResolved ?? "—").padEnd(18)}` +
          `     ${String(mark.resolutionDate ?? "—").padEnd(18)}`
        );
      });
    }).join("\n") || "     —";
    
    
    const unitImprovementRows = candidates.flatMap(candidate => {
      return (candidate.unitImprovement || []).map((ui, index) => {
        const bids = Array.isArray(ui.bIds) && ui.bIds.length
          ? ui.bIds.join(", ")
          : "—";
          const benchmarkIds = Array.isArray(ui.benchmarkIds) && ui.benchmarkIds.length
          ? ui.benchmarkIds.join(", ")
          : "—";
    
        return (
          `     ${String(index + 1).padEnd(10)}` +
          `     ${bids.padEnd(15)}` +
          `     ${String(ui.lesson ?? "—").padEnd(40)}` +
          `     ${benchmarkIds.padEnd(20)}`
        );
      });
    }).join("\n") || "     —";
    
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
                                                     **                    Report Generation Date: ${today}                    **
                                                     **                                                                           **
                                                     *******************************************************************************
                                                     **                  All Rights Reserved. COPYRIGHT (C) ${new Date().getFullYear()}                **
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

  Unit Name                            :     ${unitName ?? "XXX"}
  Unit ID                              :     ${unitId ?? "XXX"}
  Unit Start Date                      :     ${unitStartDate ?? "XXX"}
  Unit End Date                        :     ${unitEndDate ?? "XXX"}
  Signature Profile                    :     ${signatureProfile ?? "XXX"}
  Unit Type                            :     ${unitType ?? "XXX"}
  Unit Roster Count                    :     
  
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

     Unilateral Proficiency in Reading          :     PASS → ${XRR ?? "XXX"} ≥ 0.700
     Unilateral Proficiency in Listening        :     PASS → ${XLR ?? "XXX"} ≥ 0.700
     Unilateral Proficiency in Speaking         :     PASS → ${XSR ?? "XXX"} ≥ 0.700
     Unilateral Proficiency in Writing          :     PASS → ${XWR ?? "XXX"} ≥ 0.700
	   Equivalent Proficiency                     :     PASS → ${XEP ?? "XXX"} ≥ 0.700
     Composite Proficiency                      :     PASS → ${XCP ?? "XXX"} ≥ 0.700
     Band Proficiency                           :     PASS → ${XBP ?? "XXX"} ≥ 0.700

     Receptive Growth Differential              :     PASS → ${deltaRRN ?? "XXX"} ≥ 0.000
     Productive Growth Differential             :     PASS → ${deltaPRN ?? "XXX"} ≥ 0.000
     Equivalent Growth                          :     PASS → ${deltaGEQ ?? "XXX"} ≥ 0.000

     Butler Interaction Proficiency             :     PASS → ${MSIP ?? "XXX"} ≤ 0.450
     Interaction Class                          :     PASS → ${IC ?? "XXX"} ≥ 2

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

    ${proficiencyUnilateralLines.join("\n")}

     Pass % Avg Receptive Ratio - RRN          :     ${getAvg("RRN") ?? "XXX"}
     Pass % Avg Productive Ratio - PRN         :     ${getAvg("PRN") ?? "XXX"}
	 
     Pass % Avg Equivalent Proficiency - XEP   :     ${getAvg("XEP") ?? "XXX"}
     Pass % Avg Composite Proficiency - XCP    :     ${getAvg("XCP") ?? "XXX"}
     Pass % Avg Band Proficiency - XBP         :     ${getAvg("XBP") ?? "XXX"}

     Pass % Stability in Proficiency           :     ${getAvg("STAP") ?? "XXX"}

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

    ${growthLines.join("\n")}




---------------------------------------
 TABULATIONS - HYBRID:
---------------------------------------

          •	The Butler Interaction Proficiency is used to determine if a candidate can demonstrate mastery based on an acceptable interaction among all inclusive variables.
          •	The Interaction Class is an interaction constant based on skills mastery within a pre-defined interaction envelope among all inclusive variables.


     Butler Interaction Proficiency - MSIP    :     ${getAvg("MSIP") ?? "XXX"}
     Average Interaction Class - IC           :     ${getAvg("IC") ?? "XXX"}

*******************************************************                                  SECTION 05                               *******************************************************

---------------------------------------
 BUTLER PRODUCTIVITY & UTILIZATION:
---------------------------------------

    Pass percentages below are based on the average values of each corresponding metric:

     Pass % Avg Productivity Rates - CSD    :     ${getAvg("Productivity_CSD")}
     Pass % Avg Productivity Rates - USD    :     ${getAvg("Productivity_USD")}


     ||| LAST NAME |||     ||| FIRST NAME |||     ||| CANDIDATE ID |||     ||| EFFORT - CSD |||     ||| EFFORT - USD |||


---------------------------------------
 ATTENDANCE TRACKING:
---------------------------------------

     Attendance % - Present                    :     ${rosterPercentages?.present ?? "XXX"}
     Attendance % - Excused Absences           :     ${rosterPercentages?.excusedAbsences ?? "XXX"}
     Attendance % - Unexcused Absences         :     ${rosterPercentages?.unexcusedAbsences ?? "XXX"}
     Attendance % - Excused Tardies            :     ${rosterPercentages?.excusedTardies ?? "XXX"}
     Attendance % - Unexcused Tardies          :     ${rosterPercentages?.unexcusedTardies ?? "XXX"}


---------------------------------------
 ENGAGEMENT TRACKING:
---------------------------------------

     Engagement Level % - High                :     ${engagementPercentages.High ?? "XXX"}
     Engagement Level % - Medium              :     ${engagementPercentages.Medium ?? "XXX"}
     Engagement Level % - Low                 :     ${engagementPercentages.Low ?? "XXX"}
     Engagement Level % - Not Applicable      :     ${engagementPercentages["N/A"] ?? "XXX"}

---------------------------------------
 NEEDS ASSESSMENT TRACKING:
---------------------------------------

     Open Assessments           :     ${assessmentSummary?.statusCounts?.Open ?? 0}
     Pending Assessments        :     ${assessmentSummary?.statusCounts?.Pending ?? 0}
     Closed Assessments         :     ${assessmentSummary?.statusCounts?.Closed ?? 0}


*******************************************************                                  SECTION 06                               *******************************************************

---------------------------------------
 BENCHMARKS:
---------------------------------------

     ||| PP ID |||     ||| BIDs |||     ||| BENCHMARK TYPE |||     ||| BENCHMARK REF |||     ||| BENCHMARK DESCRIPTION |||

     ${benchmarkRows}

---------------------------------------
 LEADER MARKS:
---------------------------------------

      ||| ENTRY |||     ||| IMPACT TYPE |||     ||| CONCERN IDENTIFIED |||     ||| IDENTITY DATE |||     ||| CONCERN RESOLVED |||     ||| RESOLUTION DATE |||

      ${leaderMarksRows}

---------------------------------------
 IMPROVEMENTS & OPTIMIZATION:
---------------------------------------

     ||| ENTRY # |||     ||| BIDs |||     ||| LESSONS LEARNED |||     ||| LINKED BENCHMARKS |||

    ${unitImprovementRows}



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
                                                     *******************************************************************************
  `.trim();
  }
  