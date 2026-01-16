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
  

  function renderAssessmentBlocks(pps = []) {
    if (!pps || !pps.length) return "     XXX";
  
    return pps
      .map(
        (pp) =>
          `     ${String(pp.ppId).padEnd(10)}` +
          `     ${pp.periodType.padEnd(20)}` +
          `     ${pp.delivery.padEnd(30)}` +
          `     ${pp.shortDescription}`
      )
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
          const score = scores.find(s => s.ppId === r.ppId);
          const dayCount = score?.dayCount ?? "XXX";
    
          let row =
            `     ${String(r.ppId).padEnd(10)}  ` +
            `     ${fmt(dayCount).padEnd(10)}  `;
    
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

  
  function renderAssessmentChain(assessmentChain = []) {
    if (!Array.isArray(assessmentChain) || !assessmentChain.length) {
      return "     XXX";
    }
  
    const renderedChains = assessmentChain
      .map((chain,index) => {
        const content = renderSingleChain(chain);
        if (!content) return null;
  
        return {
          header: `||| ASSESSMENT CHAIN ${index + 1} |||`,
          body: content
        };
      })
      .filter(Boolean);
  
    if (!renderedChains.length) return "     XXX";
  
    // Split into columns (side by side)
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
  
  
  function fmt3(value) {
    return Number.isFinite(value) ? value.toFixed(3) : "X.XXX";
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
    const cognitiveLoad = neuro?.neuroScienceRms?.cognitiveLoad;
    if (!cognitiveLoad) return "";
  
    const sums = sumCognitiveLoad(cognitiveLoad);
  
    const profLines = [];
    const growthLines = [];
  
    Object.entries(sums).forEach(([lobe, values]) => {
      const side = lobeSide(lobe);
      const short = lobeShortName(lobe);
  
      profLines.push(
        `     P/ Cognitive Load (${side}) - ${short.padEnd(16)} :     ${fmt3(values.proficiency)}`
      );
  
      growthLines.push(
        `     G/ Cognitive Load (${side}) - ${short.padEnd(16)} :     ${fmt3(values.growth)}`
      );
    });
  
    return `
  ${profLines.join("\n")}
  
  ${growthLines.join("\n")}
  `.trim();
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
    }
  
    if (hasMetric(unitType, "deltaPRN")) {
      lines.push(`     Cumulative Growth - ΔPRN                  :     ${fmt(cumulative.deltaPRN)}`);
      lines.push(`     Average Growth - ΔPRN                     :     ${fmt(averages.deltaPRN)}`);
    }
  
    if (unitType === "Third Parameter") {
      lines.push(`     Average Growth - ΔARN                     :     ${fmt(averages.deltaARN)}`);
    }
  
    lines.push(`     Average Equivalent Growth - ∆GEQ          :     ${fmt(averages.GEQ)}`);
  
    return lines.join("\n");
  }
  
  
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
  }) {
    const today = new Date().toDateString();

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

    const needsAssessmentRows = renderNeedsAssessmentRows( needAssessments, competencyRows);

    const { table1: assignmentRows1, table2: assignmentRows2 } =  renderRecordOfAssignments(scores);

    const assessmentChainBlock = renderAssessmentChain(assessmentChain);

    const candidateMarksRows = renderCandidateMarksRows(candidateMarks);

    const cognitiveLoadBlock = renderCognitiveLoad(neuro);


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
 CANDIDATE DETAILS :
---------------------------------------

  Last Name                            :     ${candidate.lastName ?? "XXX"}
  First Name                           :     ${candidate.firstName ?? "XXX"}
  Candidate ID                         :     ${candidate.candidateId ?? "XXX"}
  Candidate Start Date                 :     ${candidate.candidateStartDate ?? "XXX"}
  Nationality                          :     ${candidate.nationality ?? "XXX"}
  Date of Birth                        :     ${candidate.dateOfBirth ?? "XXX"}
  Special ID No.                       :     ${candidate.specialIdNo ?? "XXX"}

---------------------------------------
 UNIT DETAILS :
---------------------------------------

  Unit Name                            :     ${unitMeta.unitName ?? "XXX"}
  Unit ID                              :     ${unitMeta.unitId ?? "XXX"}
  Unit Start Date                      :     ${unitMeta.unitStartDate ?? "XXX"}
  Unit End Date                        :     ${unitMeta.unitEndDate ?? "XXX"}
  Signature Profile                    :     ${unitMeta.signatureProfile ?? "XXX"}
  Unit Type                            :     ${unitMeta.unitType ?? "XXX"}
  Unit Roster Count                    :     ${roster.totalTally ?? "XXX"}
  
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

     Unilateral Proficiency in Reading          :     PASS → ${unitMeta.XRR ?? "XXX"} ≥ 0.700
     Unilateral Proficiency in Listening        :     PASS → ${unitMeta.XLR ?? "XXX"} ≥ 0.700
     Unilateral Proficiency in Speaking         :     PASS → ${unitMeta.XSR ?? "XXX"} ≥ 0.700
     Unilateral Proficiency in Writing          :     PASS → ${unitMeta.XWR ?? "XXX"} ≥ 0.700
	 Equivalent Proficiency                     :     PASS → ${unitMeta.XEP ?? "XXX"} ≥ 0.700
     Composite Proficiency                      :     PASS → ${unitMeta.XCP ?? "XXX"} ≥ 0.700
     Band Proficiency                           :     PASS → ${unitMeta.XBP ?? "XXX"} ≥ 0.700

     Receptive Growth Differential              :     PASS → ${unitMeta.deltaRRN ?? "XXX"} ≥ 0.000
     Productive Growth Differential             :     PASS → ${unitMeta.deltaPRN ?? "XXX"} ≥ 0.000
     Equivalent Growth                          :     PASS → ${unitMeta["∆GEQ"] ?? "XXX"} ≥ 0.000

     Butler Interaction Proficiency             :     PASS → ${unitMeta.MSIP ?? "XXX"} ≤ 0.450
     Interaction Class                          :     PASS → ${unitMeta.IC ?? "XXX"} ≥ 2

     Interaction Class 0: Failing
     Interaction Class 1: At-Risk
     Interaction Class 2: Acceptable
     Interaction Class 3: Standard
     Interaction Class 4: Advanced
     Interaction Class 5: Exceptional

     Unit Outcome for Candidate                 :     ${roster.unitOutcome ?? "XXX"}

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

     ||| PP ID |||     ||| RRN |||     ||| PRN |||     ||| XRR |||     ||| XLR |||     ||| XSR |||     ||| XWR |||     ||| XEP |||     ||| XCP |||     ||| XBP |||     ||| STA/P |||

     ${proficiencyRows}

     ${renderAverageBlock(competencyAverages, unitMeta.unitType)}


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

     ||| PP ID |||     ||| DAYCOUNT |||     ||| ΔRRN |||     ||| ΔPRN |||     ||| ∆GEQ |||     ||| STA/G |||

     ${growthRows}

     ${renderGrowthSummary(competencyCumalative, competencyAverages, unitMeta.unitType)}


---------------------------------------
 TABULATIONS - HYBRID:
---------------------------------------

          •	The Butler Interaction Proficiency is used to determine if a candidate can demonstrate mastery based on an acceptable interaction among all inclusive variables.
          •	The Interaction Class is an interaction constant based on skills mastery within a pre-defined interaction envelope among all inclusive variables.

     ||| PP ID |||     ||| DAYCOUNT |||     ||| MSIP |||     ||| IC |||

     ${hybridRows}

     Butler Interaction Proficiency - MSIP    :     ${competencyAverages.MSIP ?? "XXX"}
     Average Interaction Class - IC           :     ${competencyAverages.IC ?? "XXX"}

*******************************************************                                  SECTION 05                               *******************************************************

---------------------------------------
 BUTLER PRODUCTIVITY & UTILIZATION:
---------------------------------------

     ||| PP ID |||     ||| CRITICAL REFERENCE DATE |||     ||| DAYCOUNT |||     ||| PRODUCTIVITY RATES - CSD |||     ||| PRODUCTIVITY RATES - USD |||

     Effort -  CSD Reference                   :     X.XXX
     Effort -  USD Reference                   :     X.XXX

---------------------------------------
 ATTENDANCE TRACKING:
---------------------------------------

     Attendance % - Present                    :     ${roster.percentages.present ?? "XXX"}
     Attendance % - Excused Absences           :     ${roster.percentages.excusedAbsences ?? "XXX"}
     Attendance % - Unexcused Absences         :     ${roster.percentages.unexcusedAbsences ?? "XXX"}
     Attendance % - Excused Tardies            :     ${roster.percentages.excusedTardies ?? "XXX"}
     Attendance % - Unexcused Tardies          :     ${roster.percentages.unexcusedTardies ?? "XXX"}

---------------------------------------
 ENGAGEMENT TRACKING:
---------------------------------------

     Engagement Level % - High                :     ${engagementPercentages.High ?? "XXX"}
     Engagement Level % - Medium              :     ${engagementPercentages.Medium ?? "XXX"}
     Engagement Level % - Low                 :     ${engagementPercentages.Low ?? "XXX"}
     Engagement Level % - Not Applicable      :     ${engagementPercentages["N/A"] ?? "XXX"}


*******************************************************                                  SECTION 06                               *******************************************************

---------------------------------------
 BENCHMARKS:
---------------------------------------

     ||| PP ID |||     ||| BIDs |||     ||| BENCHMARK TYPE |||     ||| BENCHMARK REF |||     ||| BENCHMARK DESCRIPTION |||

     ${benchmarkRows}

---------------------------------------
 CANDIDATE MARKS:
---------------------------------------

     ||| ENTRY |||     ||| IMPACT TYPE |||     ||| CONCERN IDENTIFIED |||     ||| IDENTITY DATE |||     ||| CONCERN RESOLVED |||     ||| RESOLUTION DATE |||

     ${candidateMarksRows}

---------------------------------------
 NEEDS ASSESSMENT:
---------------------------------------

     ||| PP ID |||     ||| CRITICAL REFERENCE DATE |||     ||| ACTION STATUS |||     ||| OBSERVATIONS & GOALS |||

     ${needsAssessmentRows}

---------------------------------------
 NEEDS ASSESSMENT CHAIN:
---------------------------------------

    ${assessmentChainBlock}


*******************************************************                                  SECTION 08                               *******************************************************

---------------------------------------
 NEUROSCIENCE INDICATORS:
---------------------------------------

     ||| PP ID |||     ||| DAYCOUNT |||     ||| P/ RMS (L) - Frontal |||     ||| P/ RMS (L) - Occipital Lobe |||     ||| P/ RMS (L) - Parietal |||     ||| P/ RMS (L) - Temporal |||

     ||| PP ID |||     ||| DAYCOUNT |||     ||| P/ RMS (R) - Frontal |||     ||| P/ RMS (R) - Occipital Lobe |||     ||| P/ RMS (R) - Parietal |||     ||| P/ RMS (R) - Temporal |||

     P/ Cognitive Load (L) - Frontal         :     X.XXX
     P/ Cognitive Load (L) - Occipital       :     X.XXX
     P/ Cognitive Load (L) - Parietal        :     X.XXX
     P/ Cognitive Load (L) - Temporal        :     X.XXX
     P/ Cognitive Load (R) - Frontal         :     X.XXX
     P/ Cognitive Load (R) - Occipital       :     X.XXX
     P/ Cognitive Load (R) - Parietal        :     X.XXX
     P/ Cognitive Load (R) - Temporal        :     X.XXX

     ||| PP ID |||     ||| DAYCOUNT |||     ||| G/ RMS (L) - Frontal |||     ||| G/ RMS (L) - Occipital Lobe |||     ||| G/ RMS (L) - Parietal |||     ||| G/ RMS (L) - Temporal |||

     ||| PP ID |||     ||| DAYCOUNT |||     ||| G/ RMS (R) - Frontal |||     ||| G/ RMS (R) - Occipital Lobe |||     ||| G/ RMS (R) - Parietal |||     ||| G/ RMS (R) - Temporal |||

     G/ Cognitive Load (L) - Frontal         :     X.XXX
     G/ Cognitive Load (L) - Occipital       :     X.XXX
     G/ Cognitive Load (L) - Parietal        :     X.XXX
     G/ Cognitive Load (L) - Temporal        :     X.XXX
     G/ Cognitive Load (R) - Frontal         :     X.XXX
     G/ Cognitive Load (R) - Occipital       :     X.XXX
     G/ Cognitive Load (R) - Parietal        :     X.XXX
     G/ Cognitive Load (R) - Temporal        :     X.XXX

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
  