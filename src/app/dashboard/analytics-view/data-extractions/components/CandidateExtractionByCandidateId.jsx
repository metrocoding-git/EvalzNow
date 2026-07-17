

const downloadCSV = (headers, rows, filename) => {
  return new Promise((resolve) => {
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

    const csv = metaLines.join("\n") + headers.map(csvEscape).join(",") + "\n" + rows.map(r => r.map(csvEscape).join(",")).join("\n");
  
    const blob = new Blob(
      ["\uFEFF" + csv], // UTF-8 BOM (Excel safe)
      { type: "text/csv;charset=utf-8;" }
    );
  
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    setTimeout(() => {
      resolve();
    }, 1500);

  });
  };
  
  const shouldShowDeltaARN = (unitType) => {
    // Only show deltaARN for "Third Parameter" unit type
    return unitType === "Third Parameter";
  };
  
  const safe = (v) => {
    if (v === null || v === undefined || v === "") return "-";
    
    // Handle ISO date strings - extract only the date part
    if (typeof v === "string" && v.includes("T") && v.match(/^\d{4}-\d{2}-\d{2}T/)) {
      return v.split("T")[0]; // Returns "2025-12-05"
    }
    
    return String(v);
  };
  
  const formatToThreeDecimals = (v) => {
    if (v === null || v === undefined || v === '-') return "-";
    const n = Number(v);
    return isNaN(n) ? "-" : n.toFixed(3);
  };

const HEADERS = [
    "Last Name","First Name","Candidate ID","Candidate Start Date","Nationality",
    "Gender","Ethnicity","Income","Religion","Marital Status","Job Type",
    "Date of Birth","Special ID No.","Unit Name","Unit ID","Unit Start Date",
    "Unit End Date","Signature Profile","Unit Type","Environment","PP ID",
    "Short Description","Period Type","Delivery","Critical Reference Date",
    "Day Count (Days)","Productivity_CSD","Productivity_USD","RRN","PRN","ARN",
    "XLR","XRR","XSR","XWR","XTR","XPR","XRVSR","XPVSR","XAVSR","XEP","XCP","XBP",
    "MSIP","STA/P","IC","ΔRRN","ΔPRN","ΔARN","GEQ","STA/G",
    "RRGT1","PRGT1","ARGT1","RRGT2","PRGT2","ARGT2","RRGT3","PRGT3","ARGT3",
    "RRGT4","PRGT4","ARGT4","RRGT5","PRGT5","ARGT5","Linked BIDs",
    "RMS/P Frontal/L","RMS/P Occipital/L","RMS/P Parietal/L","RMS/P Temporal/L",
    "RMS/P Frontal/R","RMS/P Occipital/R","RMS/P Parietal/R","RMS/P Temporal/R",
    "Load/P Frontal/L","Load/P Occipital/L","Load/P Parietal/L","Load/P Temporal/L",
    "Load/P Frontal/R","Load/P Occipital/R","Load/P Parietal/R","Load/P Temporal/R",
    "RMS/G Frontal/L","RMS/G Occipital/L","RMS/G Parietal/L","RMS/G Temporal/L",
    "RMS/G Frontal/R","RMS/G Occipital/R","RMS/G Parietal/R","RMS/G Temporal/R",
    "Load/G Frontal/L","Load/G Occipital/L","Load/G Parietal/L","Load/G Temporal/L",
    "Load/G Frontal/R","Load/G Occipital/R","Load/G Parietal/R","Load/G Temporal/R",
    "Observations & Goals","Action Status"
  ];

  const buildRow = (values) => {
    if (values.length !== HEADERS.length) {
      console.error("CSV column mismatch:", values.length, HEADERS.length);
    }
    return values.map(safe);
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
  
  
    const getActionStatus = (status) => {
      return status === null || status === undefined || status === ""
        ? "Open"
        : status;
    };
    
/**
 * OPTION 2
 * candidate-level extraction
 */
export const extractCandidateUnitsCSV = async ({ extractionData, clientId, candidateId  }) => {
    if (!extractionData?.units?.length) {
      return Promise.resolve();
    }

    const rows = [];
  
    extractionData.units.forEach(({ unit, candidates }) => {
      candidates.forEach((candidate) => {
  
        const competencyMap = new Map(
          (candidate.competencyResults || []).map(c => [c.ppId, c])
        );
  
        const needMap = new Map(
          (candidate.needAssessments || []).map(n => [n.ppId, n])
        );
  
        (candidate.pps || []).forEach((pp) => {
          const competency = competencyMap.get(pp.ppId) || {};
          const need = needMap.get(pp.ppId) || {};
          const neuro = candidate.neuroScienceRms;
          rows.push(buildRow([
            candidate.lastName,
            candidate.firstName,
            candidate.candidateCode,
            candidate.candidateStartDate,
            candidate.nationality,
            candidate.gender,
            candidate.ethnicity,
            candidate.income,
            candidate.religion,
            candidate.maritalStatus,
            candidate.jobType,
            candidate.dateOfBirth,
            candidate.specialIdNo,
  
            unit.unitName,
            unit.unitId,
            unit.unitStartDate,
            unit.unitEndDate,
            unit.signatureProfile,
            unit.unitType,
            unit.environment,
  
            pp.ppId,
            pp.shortDescription,
            pp.periodType,
            pp.delivery,
  
            competency.criticalRefDate,
            competency.cumulativeDuration,
            competency.Productivity_CSD,
            competency.Productivity_USD,
            competency.RRN,
            competency.PRN,
            competency.ARN,
            competency.XLR,
            competency.XRR,
            competency.XSR,
            competency.XWR,
            competency.XTR,
            competency.XPR,
            competency.XRVSR,
            competency.XPVSR,
            competency.XAVSR,
            competency.XEP,
            competency.XCP,
            competency.XBP,
            competency.MSIP,
            competency.STAP,
            competency.IC,
            competency.deltaRRN,
            competency.deltaPRN,
            shouldShowDeltaARN(unit.unitType) ? competency.deltaARN : "-",
            competency.GEQ,
            competency.STAG,
  
            competency.RRGT1,
            competency.PRGT1,
            competency.ARGT1,
            competency.RRGT2,
            competency.PRGT2,
            competency.ARGT2,
            competency.RRGT3,
            competency.PRGT3,
            competency.ARGT3,
            competency.RRGT4,
            competency.PRGT4,
            competency.ARGT4,
            competency.RRGT5,
            competency.PRGT5,
            competency.ARGT5,
  
            need.bIds?.join(","),

            // ===================== RMS / PROFICIENCY =====================
            getRMS(neuro, pp.ppId, "Frontal Lobe - Left"),
            getRMS(neuro, pp.ppId, "Occipital Lobe - Left"),
            getRMS(neuro, pp.ppId, "Parietal Lobe - Left"),
            getRMS(neuro, pp.ppId, "Temporal Lobe - Left"),

            getRMS(neuro, pp.ppId, "Frontal Lobe - Right"),
            getRMS(neuro, pp.ppId, "Occipital Lobe - Right"),
            getRMS(neuro, pp.ppId, "Parietal Lobe - Right"),
            getRMS(neuro, pp.ppId, "Temporal Lobe - Right"),

            // ===================== LOAD / PROFICIENCY =====================
            getLoadP(neuro, pp.ppId, "Frontal Lobe - Left"),
            getLoadP(neuro, pp.ppId, "Occipital Lobe - Left"),
            getLoadP(neuro, pp.ppId, "Parietal Lobe - Left"),
            getLoadP(neuro, pp.ppId, "Temporal Lobe - Left"),

            getLoadP(neuro, pp.ppId, "Frontal Lobe - Right"),
            getLoadP(neuro, pp.ppId, "Occipital Lobe - Right"),
            getLoadP(neuro, pp.ppId, "Parietal Lobe - Right"),
            getLoadP(neuro, pp.ppId, "Temporal Lobe - Right"),

            // ===================== RMS / GROWTH =====================
            getDeltaRMS(neuro, pp.ppId, "Frontal Lobe - Left"),
            getDeltaRMS(neuro, pp.ppId, "Occipital Lobe - Left"),
            getDeltaRMS(neuro, pp.ppId, "Parietal Lobe - Left"),
            getDeltaRMS(neuro, pp.ppId, "Temporal Lobe - Left"),

            getDeltaRMS(neuro, pp.ppId, "Frontal Lobe - Right"),
            getDeltaRMS(neuro, pp.ppId, "Occipital Lobe - Right"),
            getDeltaRMS(neuro, pp.ppId, "Parietal Lobe - Right"),
            getDeltaRMS(neuro, pp.ppId, "Temporal Lobe - Right"),

            // ===================== LOAD / GROWTH =====================
            getLoadG(neuro, pp.ppId, "Frontal Lobe - Left"),
            getLoadG(neuro, pp.ppId, "Occipital Lobe - Left"),
            getLoadG(neuro, pp.ppId, "Parietal Lobe - Left"),
            getLoadG(neuro, pp.ppId, "Temporal Lobe - Left"),

            getLoadG(neuro, pp.ppId, "Frontal Lobe - Right"),
            getLoadG(neuro, pp.ppId, "Occipital Lobe - Right"),
            getLoadG(neuro, pp.ppId, "Parietal Lobe - Right"),
            getLoadG(neuro, pp.ppId, "Temporal Lobe - Right"),

            need.observation,
            need.status || "Open"
          ]));
        });
      });
    });
  
    await downloadCSV( HEADERS, rows, `Data Extraction.csv`);
      
  };
  
