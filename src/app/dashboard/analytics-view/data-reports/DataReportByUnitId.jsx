export function extractDataReportByUnitId(payload) {
    const unit = payload?.unit;
    if (!unit) return null;
  
    const unitMeta = {
        id: unit.id,
        unitName: unit.unitName,
        unitId: unit.unitId,
        unitType: unit.unitType,
        signatureProfile: unit.signatureProfile,
        environment: unit.environment,
        unitStartDate: unit.unitStartDate,
        unitEndDate: unit.unitEndDate,
        XEP: unit.XEP ?? null,
        XRR: unit.XRR ?? null,
        XLR: unit.XLR ?? null,
        XSR: unit.XSR ?? null,
        XWR: unit.XWR ?? null,
        XCP: unit.XCP ?? null,
        XBP: unit.XBP ?? null,

        MSIP: unit.MSIP ?? null,
        IC: unit.IC ?? null,

        ΔRRN: unit["ΔRRN"] ?? null,
        ΔPRN: unit["ΔPRN"] ?? null,
        ΔARN: unit["ΔARN"] ?? null,
        ΔGEQ: unit["ΔGEQ"] ?? null,

        XTR: unit.XTR ?? null,
        XPR: unit.XPR ?? null,
        XRVSR: unit.XRVSR ?? null,
        XPVSR: unit.XPVSR ?? null,
        XAVSR: unit.XAVSR ?? null,

        rosterStats: unit.rosterStats ?? { totalCount: 0 },
        benchmarks: unit.benchmarks,
        staffAssignments: unit.staffAssignments
    };
  
    const candidates = [];
    const rosterByCandidate = {};
    const scoresByCandidate = {};
    const competencyByCandidate = {};
    const engagementByCandidate = {};
    const candidateMarks = {};
    const needAssessments = {};
  
    unit.candidates.forEach((c) => {
      candidates.push({
        id: c.candidateId,
        candidateId: c.candidateCode,
        firstName: c.firstName,
        lastName: c.lastName,
        nationality: c.nationality,
        gender: c.gender,
        specialIdNo: c.specialIdNo,
        dateOfBirth: c.dateOfBirth,
        candidateStartDate: c.candidateStartDate,	
        pps: c.pps
      });
  
      rosterByCandidate[c.candidateId] = c.roster?.[0] || null;
  
      scoresByCandidate[c.candidateId] = c.scores || [];
  
      assessmentBlocksByCandidate[c.candidateId] =
        c.scores?.map(s => s.assessmentBlock) || [];
  
      competencyByCandidate[c.candidateId] = {
        results: c.competencyResults || [],
        averages: c.competencyAverages || [],
        cumulative: c.competencyCumalative || [],
        cumulativeAverages: c.competencycumulativeAverages || []
      };
  
      neuroByCandidate[c.candidateId] = c.neuroScienceRms || null;
      engagementByCandidate[c.candidateId] = c.engageLevelStats || null;
      assessmentChain[c.candidateId] = c.assessmentChain || null;

      candidateMarks[c.candidateId] = c.candidateMarks || null;
      needAssessments[c.candidateId] = c.needAssessments || null;
    });
  
    return {
      unitMeta,
      candidates,
      rosterByCandidate,
      scoresByCandidate,
      assessmentBlocksByCandidate,
      competencyByCandidate,
      neuroByCandidate,
      engagementByCandidate,
      assessmentChain,
      needAssessments,
      candidateMarks,
    };
  }
  