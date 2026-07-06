// components/CandidateExtraction.jsx
const safe = (value, type = "string") => {
  if (value === null || value === undefined || value === "") return "-";

  if (type === "date") {
    // Handle ISO date strings like "2025-12-05T00:00:00.000Z"
    if (typeof value === "string" && value.includes("T")) {
      return value.split("T")[0]; // Returns "2025-12-05"
    }
    
    // Handle Date objects
    const d = new Date(value);
    if (isNaN(d)) return "-";
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  if (type === "number") {
    // ✅ If it's already a formatted string with decimals, preserve it
    if (typeof value === "string" && value.includes(".")) {
      return value;
    }
    return value;
  }

  return value;
};

const findByPpId = (arr = [], ppId) =>
  arr.find((item) => item.ppId === ppId) || {};

const csvEscape = (value) => {
  if (value === null || value === undefined) return "-";

  const str = String(value);

  // Escape double quotes
  const escaped = str.replace(/"/g, '""');

  // Wrap in quotes if needed
  if (/[",\n]/.test(escaped)) {
    return `"${escaped}"`;
  }

  return escaped;
};

const downloadCSV = (headers, rows, filename) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const metaLines = [
    "EvalzNow – A Novel Human Capital Assessment Method",
    "Competency Accounting for Education and Industry",
    "Hybrid Proficiency & Growth Monitoring",
    `Data Extraction Date: ${formattedDate}`,
    " ",
    " ", // blank line before table
  ];

  const csv = metaLines.join("\n") + headers.map(csvEscape).join(",") + "\n" + rows.map(r => r.map(csvEscape).join(",")).join("\n");

  const blob = new Blob(
    ["\uFEFF" + csv], // UTF-8 BOM (Excel safe)
    { type: "text/csv;charset=utf-8;" }
  );

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};


const formatToThreeDecimals = (v) => {
  if (v === null || v === undefined || v === '-') return "-";
  const n = Number(v);
  return isNaN(n) ? "-" : n.toFixed(3);
};


const resolveNeuro = (unit, candidate) => {
  if (candidate.neuroScienceRms) return candidate.neuroScienceRms;

  return unit?.neuroScienceRmsByCandidate?.[candidate.candidateId]
    || unit?.neuroScienceRms?.find(
         n => String(n.candidateId) === String(candidate.candidateId)
       )
    || null;
};

const getRMS = (neuro, ppId, lobe) => {
  const row = neuro?.data?.find(d => d.ppId === ppId);
  return formatToThreeDecimals(row?.lobes?.[lobe]?.RMS);
};

const getDeltaRMS = (neuro, ppId, lobe) => {
  const row = neuro?.data?.find(d => d.ppId === ppId);
  return formatToThreeDecimals(row?.lobes?.[lobe]?.deltaRMS);
};

const getLoadP = (neuro, ppId, lobe) =>
  formatToThreeDecimals(
    neuro?.cognitiveLoad?.[lobe]?.proficiency?.find(p => p.ppId === ppId)?.value
  );

const getLoadG = (neuro, ppId, lobe) =>
  formatToThreeDecimals(
    neuro?.cognitiveLoad?.[lobe]?.growth?.find(p => p.ppId === ppId)?.value
  );

  const UNIT_TYPE_FIELDS = {
    "Third Parameter": [
      "ARN","deltaARN","XRVSR","XPVSR","XAVSR",
      "ARGT1","ARGT2","ARGT3","ARGT4","ARGT5"
    ],
    "Communicative I/O": [
      "XLR","XRR","XSR","XWR"
    ],
    "Theory & Practice": [
      "XTR","XPR"
    ]
  };
  

export const extractActiveUnitCandidatesCSV = ({ extractionData }) => {
  if (!extractionData?.candidates?.length || !extractionData?.unit) return;

  const { unit, candidates } = extractionData;

  const headers = [
    "Last Name","First Name","Candidate ID","Candidate Start Date","Nationality","Gender","Ethnicity","Income","Religion","Marital Status","Job Type","Date of Birth","Special ID No.","Unit Name","Unit ID","Unit Start Date","Unit End Date","Signature Profile","Unit Type","Environment","PP ID","Short Description","Period Type","Delivery","Critical Reference Date","Day Count (Days)","Productivity_CSD","Productivity_USD","RRN","PRN","ARN","XLR","XRR","XSR","XWR","XTR","XPR","XRVSR","XPVSR","XAVSR","XEP","XCP","XBP","MSIP","STA/P","IC","ΔRRN","ΔPRN","ΔARN","GEQ","STA/G","RRGT1","PRGT1","ARGT1","RRGT2","PRGT2","ARGT2","RRGT3","PRGT3","ARGT3","RRGT4","PRGT4","ARGT4","RRGT5","PRGT5","ARGT5","Linked BIDs","RMS/P Frontal/L","RMS/P Occipital/L","RMS/P Parietal/L","RMS/P Temporal/L","RMS/P Frontal/R","RMS/P Occipital/R","RMS/P Parietal/R","RMS/P Temporal/R","Load/P Frontal/L","Load/P Occipital/L","Load/P Parietal/L","Load/P Temporal/L","Load/P Frontal/R","Load/P Occipital/R","Load/P Parietal/R","Load/P Temporal/R","RMS/G Frontal/L","RMS/G Occipital/L","RMS/G Parietal/L","RMS/G Temporal/L","RMS/G Frontal/R","RMS/G Occipital/R","RMS/G Parietal/R","RMS/G Temporal/R","Load/G Frontal/L","Load/G Occipital/L","Load/G Parietal/L","Load/G Temporal/L","Load/G Frontal/R","Load/G Occipital/R","Load/G Parietal/R","Load/G Temporal/R","Observations & Goals","Action Status"
  ];

  const resolveMetric = (unitType, competency, field) => {
    const allowed = UNIT_TYPE_FIELDS[unitType] || [];
  
    // ❌ Field not valid for this unit type
    if (!allowed.includes(field)) return "-";
  
    const value = competency?.[field];
  
    return value === null || value === undefined ? "-" : value;
  };
  
  const rows = [];

  candidates.forEach(candidate => {
    candidate.pps.forEach(pp => {
      const competency = findByPpId(candidate.competencyResults, pp.ppId);
      const need = findByPpId(candidate.needAssessments, pp.ppId);
      const neuro = resolveNeuro(unit, candidate); 


      rows.push([
        safe(candidate.lastName),
        safe(candidate.firstName),
        safe(candidate.candidateCode),
        safe(candidate.candidateStartDate, "date"),
        safe(candidate.nationality),
        safe(candidate.gender),
        safe(candidate.ethnicity),
        safe(candidate.income, "number"),
        safe(candidate.religion),
        safe(candidate.maritalStatus),
        safe(candidate.jobType),
        safe(candidate.dateOfBirth, "date"),
        safe(candidate.specialIdNo),
        safe(unit.unitName),
        safe(unit.unitId),
        safe(unit.unitStartDate, "date"),
        safe(unit.unitEndDate, "date"),
        safe(unit.signatureProfile),
        safe(unit.unitType),
        safe(unit.environment),
        safe(pp.ppId, "number"),
        safe(pp.shortDescription),
        safe(pp.periodType),
        safe(pp.delivery),
        safe(competency.criticalRefDate, "date"),
        safe(competency.cumulativeDuration, "number"),
        safe(competency.Productivity_CSD, "number"),
        safe(competency.Productivity_USD, "number"),
        safe(competency.RRN, "number"),
        safe(competency.PRN, "number"),
        safe(resolveMetric(unit.unitType, competency, "ARN"), "number"),
        safe(resolveMetric(unit.unitType, competency, "XLR"), "number"),
        safe(resolveMetric(unit.unitType, competency, "XRR"), "number"),
        safe(resolveMetric(unit.unitType, competency, "XSR"), "number"),
        safe(resolveMetric(unit.unitType, competency, "XWR"), "number"),

        safe(competency.XTR, "number"),
        safe(competency.XPR, "number"),
        safe(resolveMetric(unit.unitType, competency, "XRVSR"), "number"),
        safe(resolveMetric(unit.unitType, competency, "XPVSR"), "number"),
        safe(resolveMetric(unit.unitType, competency, "XAVSR"), "number"),
        safe(competency.XEP, "number"),
        safe(competency.XCP, "number"),
        safe(competency.XBP, "number"),
        safe(competency.MSIP, "number"),
        safe(competency.STAP, "number"),
        safe(competency.IC, "number"),
        safe(competency.deltaRRN, "number"),
        safe(competency.deltaPRN, "number"),
        safe(resolveMetric(unit.unitType, competency, "deltaARN"), "number"),
        safe(competency.GEQ, "number"),
        safe(competency.STAG, "number"),
        safe(competency.RRGT1, "number"),
        safe(competency.PRGT1, "number"),
        safe(resolveMetric(unit.unitType, competency, "ARGT1"), "number"),
        safe(competency.RRGT2, "number"),
        safe(competency.PRGT2, "number"),
        safe(resolveMetric(unit.unitType, competency, "ARGT2"), "number"),
        safe(competency.RRGT3, "number"),
        safe(competency.PRGT3, "number"),
        safe(resolveMetric(unit.unitType, competency, "ARGT3"), "number"),
        safe(competency.RRGT4, "number"),
        safe(competency.PRGT4, "number"),
        safe(resolveMetric(unit.unitType, competency, "ARGT4"), "number"),
        safe(competency.RRGT5, "number"),
        safe(competency.PRGT5, "number"),
        safe(resolveMetric(unit.unitType, competency, "ARGT5"), "number"),
        safe(need.bIds?.join(",")),
        
        safe(getRMS(neuro, pp.ppId, "Frontal Lobe - Left")),
        safe(getRMS(neuro, pp.ppId, "Occipital Lobe - Left")),
        safe(getRMS(neuro, pp.ppId, "Parietal Lobe - Left")),
        safe(getRMS(neuro, pp.ppId, "Temporal Lobe - Left")),

        safe(getRMS(neuro, pp.ppId, "Frontal Lobe - Right")),
        safe(getRMS(neuro, pp.ppId, "Occipital Lobe - Right")),
        safe(getRMS(neuro, pp.ppId, "Parietal Lobe - Right")),
        safe(getRMS(neuro, pp.ppId, "Temporal Lobe - Right")),

        // ===================== LOAD / PROFICIENCY =====================
        safe(getLoadP(neuro, pp.ppId, "Frontal Lobe - Left")),
        safe(getLoadP(neuro, pp.ppId, "Occipital Lobe - Left")),
        safe(getLoadP(neuro, pp.ppId, "Parietal Lobe - Left")),
        safe(getLoadP(neuro, pp.ppId, "Temporal Lobe - Left")),

        safe(getLoadP(neuro, pp.ppId, "Frontal Lobe - Right")),
        safe(getLoadP(neuro, pp.ppId, "Occipital Lobe - Right")),
        safe(getLoadP(neuro, pp.ppId, "Parietal Lobe - Right")),
        safe(getLoadP(neuro, pp.ppId, "Temporal Lobe - Right")),

        // ===================== RMS / GROWTH =====================
        safe(getDeltaRMS(neuro, pp.ppId, "Frontal Lobe - Left")),
        safe(getDeltaRMS(neuro, pp.ppId, "Occipital Lobe - Left")),
        safe(getDeltaRMS(neuro, pp.ppId, "Parietal Lobe - Left")),
        safe(getDeltaRMS(neuro, pp.ppId, "Temporal Lobe - Left")),

        safe(getDeltaRMS(neuro, pp.ppId, "Frontal Lobe - Right")),
        safe(getDeltaRMS(neuro, pp.ppId, "Occipital Lobe - Right")),
        safe(getDeltaRMS(neuro, pp.ppId, "Parietal Lobe - Right")),
        safe(getDeltaRMS(neuro, pp.ppId, "Temporal Lobe - Right")),

        // ===================== LOAD / GROWTH =====================
        safe(getLoadG(neuro, pp.ppId, "Frontal Lobe - Left")),
        safe(getLoadG(neuro, pp.ppId, "Occipital Lobe - Left")),
        safe(getLoadG(neuro, pp.ppId, "Parietal Lobe - Left")),
        safe(getLoadG(neuro, pp.ppId, "Temporal Lobe - Left")),

        safe(getLoadG(neuro, pp.ppId, "Frontal Lobe - Right")),
        safe(getLoadG(neuro, pp.ppId, "Occipital Lobe - Right")),
        safe(getLoadG(neuro, pp.ppId, "Parietal Lobe - Right")),
        safe(getLoadG(neuro, pp.ppId, "Temporal Lobe - Right")),

        safe(need.observation),
        safe(need.status || "Open")
      ]);
    });
  });

  downloadCSV(headers, rows, `Data Extraction.csv`);
};
