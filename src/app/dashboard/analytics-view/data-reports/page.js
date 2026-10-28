"use client";
import { useState } from "react";
import {
  Plus,
  X,
  ShieldUser,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useUnit } from "@/context/UnitContext";
import { getUniRostertByUnitId } from "@/services/unitRosterService";
import { getDataReportByClient, getDataReportByUnit, getDataReportByUnitAllCandidates, getDataReportByUnitCandidate, getGlobalDataReportByClient } from "@/services/dataReportService";
import { extractDataReportByCandidateId } from "./DataReportByCandidateId";
import { buildCandidateEZReport } from "./ActiveCandidateEZReport";
import { downloadEZFile } from "./downloadEZ";
import { buildGlobalEZReport } from "./GlobalEZReport";
import { getEffortBu } from "@/services/auxiliaryService";
import { buildUnitEZReport } from "./ActiveUnitEZReport";
import { downloadEZFilesAsZip } from "./helper/downloadEZFilesAsZip";
import DownloadLoader from "@/components/DownloadLoader";
import { getICValue, getProductivityValue, getSTAPAndSTAGStableCount } from "@/services/globalAnalyticsService";
import { getActiveCapsuleId, getActiveEntityType } from "@/lib/activeEntity";
import { getAllCapsules, getCapsuleById } from "@/services/capsuleService";
import { getCapsuleCandidates } from "@/services/capsuleAnalyticsService";
import { buildCapsuleCandidateReport, buildCapsuleReport, buildClinicalReport, reportFileName } from "@/lib/capsule/capsuleReports";

export default function DataReports() {
  const tabs = [
    { label: "Session", path: "/dashboard/analytics-view/data-reports" },
  ];

  const pathname = usePathname();
  const currentTab =
    tabs.find((tab) => pathname?.startsWith(tab.path))?.label || "Session";
  const [showEdit, setShowEdit] = useState(false);
  const [showSecondary, setShowSecondary] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [RightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeCandidateId, setActiveCandidateId] = useState(null);
  // const { selectedUnitId, setSelectedUnitId } = useUnit();
  // const selectedUnitId = sessionStorage.getItem("selectedUnitId");
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [unitData, setUnitData] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeClientId, setActiveClientId] = useState(null);
  const [activeCandidateDataReport, setActiveCandidateDataReport] = useState(null);
  const [openMenu, setopenMenu] = useState(true);
  const [sortKey, setSortKey] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedReport, setSelectedReport] = useState(null);
  const [unitMeta, setUnitMeta] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [rosterByCandidate, setRosterByCandidate] = useState({});
  const [scoresByCandidate, setScoresByCandidate] = useState({});
  const [assessmentBlocksByCandidate, setAssessmentBlocksByCandidate] = useState({});
  const [competencyByCandidate, setCompetencyByCandidate] = useState({});
  const [neuroByCandidate, setNeuroByCandidate] = useState({});
  const [engagementByCandidate, setEngagementByCandidate] = useState({});
  const [assessmentChain, setAssessmentChain] = useState({});
  const [candidateMarks, setCandidateMarks] = useState({});
  const [needAssessment, setNeedAssessment] = useState({});
  const [effortResults, setEffortResults] = useState([]);

  // Unit or Capsule active (Capacity_Part17)
  const [entityMode, setEntityMode] = useState(null);
  const [capsuleData, setCapsuleData] = useState(null);
  const capsuleActive = entityMode === "capsule" && !!capsuleData;
  const unitActive = entityMode === "unit" && !!selectedUnitId;

  useEffect(() => {
    const mode = getActiveEntityType();
    setEntityMode(mode);
    if (mode === "unit") {
      const storedId = sessionStorage.getItem("selectedUnitId");
      setSelectedUnitId(storedId);
      return;
    }
    const capsuleId = getActiveCapsuleId();
    Promise.all([getCapsuleById(capsuleId), getCapsuleCandidates(capsuleId)])
      .then(([capsule, list]) => {
        setCapsuleData(capsule);
        setData([...list].sort((a, b) => a.id - b.id));
      })
      .catch((err) => console.error("Failed to load the active capsule:", err));
  }, []);

  /** Capsule / Clinical reports (UI phase, built in the browser). Returns true when handled. */
  const handleCapsuleExtract = async () => {
    const capsuleOptions = ["all-candidates-capsule", "capsule-report", "all-capsule-reports", "clinical-data"];
    if (!(capsuleOptions.includes(selectedReport) || (selectedReport === "candidate-report" && capsuleActive))) return false;
    setIsDownloading(true);
    try {
      if (selectedReport === "candidate-report") {
        const c = data.find((x) => x.id === activeCandidateId) || data[0];
        if (c) await downloadEZFile(await buildCapsuleCandidateReport(capsuleData.id, c.id), reportFileName("Candidate", `${c.lastName}_${c.firstName}`, c.candidateId));
      } else if (selectedReport === "all-candidates-capsule") {
        const files = [];
        for (const c of data) {
          files.push({ filename: reportFileName("Candidate", `${c.lastName}_${c.firstName}`, c.candidateId), content: await buildCapsuleCandidateReport(capsuleData.id, c.id) });
        }
        await downloadEZFilesAsZip(files, `Candidate Reports_${capsuleData.capsuleName}_${capsuleData.capsuleId}.zip`);
      } else if (selectedReport === "capsule-report") {
        await downloadEZFile(await buildCapsuleReport(capsuleData.id), reportFileName("Capsule", capsuleData.capsuleName, capsuleData.capsuleId));
      } else if (selectedReport === "all-capsule-reports") {
        const files = [];
        for (const c of await getAllCapsules()) {
          files.push({ filename: reportFileName("Capsule", c.capsuleName, c.capsuleId), content: await buildCapsuleReport(c.id) });
        }
        await downloadEZFilesAsZip(files, "Capsule Reports.zip");
      } else if (selectedReport === "clinical-data") {
        await downloadEZFile(await buildClinicalReport(), "Clinical Data Report.ez");
      }
    } catch (err) {
      console.error("Capsule report failed:", err);
    } finally {
      setIsDownloading(false);
    }
    return true;
  };

  const sortedData = [...data].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];

    if (sortKey === "id") {
      // Numeric comparison
      return sortOrder === "asc" ? valA - valB : valB - valA;
    } else {
      // String comparison (case insensitive)
      valA = valA.toString().toLowerCase();
      valB = valB.toString().toLowerCase();
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    }
  });

  useEffect(() => {
    if (data.length > 0 && activeCandidateId === null) {
      setActiveCandidateId(data[0].id);
      setRightPanelOpen(true);
      setShowEdit(true);
      setShowSecondary(true);
    }
  }, [data]);

  useEffect(() => {
    if (!selectedUnitId) return;

    const fetchRoster = async () => {
      try {
        setLoading(true);
        const roster = await getUniRostertByUnitId(selectedUnitId);

        if (!Array.isArray(roster) || roster.length === 0) {
          setUnitData(null);
          setData([]);
          // router.replace("/dashboard/control-view/unit");
          redirect("/dashboard/setup-view/unit");
          return;
        }

        // Extract unit (all rows share same unit)
        setUnitData(roster[0].unit);

        // Extract candidates
        const candidates = roster.map((r) => r.candidate);

        // Remove duplicates by candidate.id
        const uniqueCandidates = Array.from(
          new Map(candidates.map((c) => [c.id, c])).values()
        );

        // Sort by id ascending initially
        const sorted = [...uniqueCandidates].sort((a, b) => a.id - b.id);

        setData(sorted);
        setActiveCandidateId(sorted[0]?.id);

      } catch (err) {
        console.error("Failed to fetch unit roster:", err);
        setError("Failed to load unit roster. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoster();
  }, [selectedUnitId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedClientId = sessionStorage.getItem("activeClientId");
      setActiveClientId(storedClientId);
    }
  }, []);


  useEffect(() => {
    if (!selectedUnitId || !activeCandidateId) return;

    const fetchEffort = async () => {
      try {
        const response = await getEffortBu(selectedUnitId, activeCandidateId);

        console.log("Effort Response:", response);


        setEffortResults(response);
      } catch (err) {
        console.error("Failed to fetch effort data:", err);
        setEffortResults([]);
      }
    };

    fetchEffort();
  }, [selectedUnitId, activeCandidateId]);


  console.log("effortResults", effortResults);

  useEffect(() => {
    const fetchDataReportByActiveCandidateId = async () => {
      if (!selectedUnitId || !activeCandidateId) return;

      try {
        const response = await getDataReportByUnitCandidate(
          selectedUnitId,
          activeCandidateId
        );

        console.log("Data Report Response:", response);
        const extracted = extractDataReportByCandidateId(response);

        setUnitMeta(extracted.unitMeta);
        setCandidates(extracted.candidates);
        setRosterByCandidate(extracted.rosterByCandidate);
        setScoresByCandidate(extracted.scoresByCandidate);
        setAssessmentBlocksByCandidate(extracted.assessmentBlocksByCandidate);
        setCompetencyByCandidate(extracted.competencyByCandidate);
        setNeuroByCandidate(extracted.neuroByCandidate);
        setEngagementByCandidate(extracted.engagementByCandidate);
        setAssessmentChain(extracted.assessmentChain);
        setNeedAssessment(extracted.needAssessments);
        setCandidateMarks(extracted.candidateMarks);

        console.log("unitMeta", extracted.unitMeta);
        console.log("candidates", extracted.candidates);
        console.log("rosterByCandidate", extracted.rosterByCandidate);
        console.log("scoresByCandidate", extracted.scoresByCandidate);
        console.log("assessmentBlocksByCandidate", extracted.assessmentBlocksByCandidate);
        console.log("competencyByCandidate", extracted.competencyByCandidate);
        console.log("neuroByCandidate", extracted.neuroByCandidate);
        console.log("engagementByCandidate", extracted.engagementByCandidate);


      } catch (err) {
        console.error(err);
      }
    };

    fetchDataReportByActiveCandidateId();
  }, [selectedUnitId, activeCandidateId]);

  useEffect(() => {
    const fetchDataReportBySelectedUnit = async () => {
      if (!selectedUnitId) return;

      try {
        const response = await getDataReportByUnit(selectedUnitId);

        console.log("Unit Data Report Response:", response);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDataReportBySelectedUnit();
  }, [selectedUnitId]);

  useEffect(() => {
    const fetchGlobalDataReportByClient = async () => {
      if (!activeClientId) return;
      try {
        const response = await getGlobalDataReportByClient(activeClientId);
        console.log("Global Data Report Response:", response);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGlobalDataReportByClient();
  }, [activeClientId]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  }


  const handleExtract = async () => {
    if (await handleCapsuleExtract()) return;
    if (!selectedUnitId && selectedReport !== "global-data" && selectedReport !== "client-units")
      return;

    setIsDownloading(true);

    try {
      if (selectedReport === "candidate-report") {
        const candidate = candidates.find(c => c.id === activeCandidateId);

        if (!candidate) {
          console.warn("Candidate report data not loaded yet");
          return;
        }

        const ezText = buildCandidateEZReport({
          unitMeta,
          candidate,
          roster: rosterByCandidate[activeCandidateId],
          scores: scoresByCandidate[activeCandidateId] || [],
          competency: competencyByCandidate[activeCandidateId],
          neuro: neuroByCandidate[activeCandidateId],
          engagement: engagementByCandidate[activeCandidateId],
          candidateMarks: candidateMarks[activeCandidateId],
          assessmentChain: assessmentChain[activeCandidateId],
          needAssessments: needAssessment[activeCandidateId],
          effortResults: effortResults,
        });

        await downloadEZFile(
          ezText,
          `${candidate.lastName}_${candidate.firstName}_${candidate.specialIdNo}.ez`
        );

      } else if (selectedReport === "all-candidates-unit") {
        try {
          const response = await getDataReportByUnitAllCandidates(selectedUnitId);
          const extracted = extractDataReportByCandidateId(response);

          if (!extracted?.candidates?.length) {
            console.warn("No candidates found for this unit.");
            return;
          }


          const filesToZip = [];

          // ✅ Loop per candidate
          for (const candidate of extracted.candidates) {
            const candidateId = candidate.id;

            // ✅ IMPORTANT: Fetch the FULL candidate data report for THIS specific candidate
            let candidateDataReport;
            try {
              candidateDataReport = await getDataReportByUnitCandidate(
                selectedUnitId,
                candidateId
              );

              // Extract the data for this specific candidate
              const candidateExtracted = extractDataReportByCandidateId(candidateDataReport);

              // Get the specific candidate's data from the extracted result
              const candidateSpecificData = {
                unitMeta: candidateExtracted.unitMeta,
                candidate: candidateExtracted.candidates.find(c => c.id === candidateId),
                roster: candidateExtracted.rosterByCandidate[candidateId],
                scores: candidateExtracted.scoresByCandidate[candidateId] || [],
                competency: candidateExtracted.competencyByCandidate[candidateId],
                neuro: candidateExtracted.neuroByCandidate[candidateId],
                engagement: candidateExtracted.engagementByCandidate[candidateId],
                candidateMarks: candidateExtracted.candidateMarks[candidateId],
                assessmentChain: candidateExtracted.assessmentChain[candidateId],
                needAssessments: candidateExtracted.needAssessments[candidateId],
              };

              // ✅ Fetch effort data for this candidate
              let effortResults = [];
              try {
                effortResults = await getEffortBu(selectedUnitId, candidateId);
              } catch (e) {
                console.warn(`Effort data missing for candidate ${candidateId}`, e);
              }

              // ✅ Build report with FRESH data for this candidate
              const ezText = buildCandidateEZReport({
                ...candidateSpecificData,
                effortResults,
              });

              // downloadEZFile(
              //   ezText,
              //   `Candidate_Report_${candidate.lastName}_${candidate.id}.ez`
              // );

              filesToZip.push({
                filename: `${candidate.lastName}_${candidate.firstName}_${candidate.specialIdNo}.ez`,
                content: ezText,
              });

            } catch (e) {
              console.error(`Failed to fetch data for candidate ${candidateId}`, e);
              // Continue with other candidates even if one fails
              continue;
            }
          }

          await downloadEZFilesAsZip(filesToZip, `Candidate Reports Pull.zip`);

        } catch (err) {
          console.error("Failed to extract all candidate reports:", err);
        }
      } else if (selectedReport === "unit-report") {
        try {

          const response = await getDataReportByUnit(selectedUnitId);
          console.log("Unit Report Response:", response);
          if (!response?.unit) {
            console.warn("No unit data found");
            return;
          }

          const ezText = await buildUnitEZReport({
            unit: response.unit,
          });

          await downloadEZFile(
            ezText,
            `Unit_Report_${response.unit.unitName}_${response.unit.unitId}.ez`
          );
        } catch (err) {
          console.error("Failed to generate unit report:", err);
        }
      }

      else if (selectedReport === "client-units") {
        try {
          const response = await getDataReportByClient(activeClientId);

          if (!response?.units || !Array.isArray(response.units)) {
            console.warn("No units found for this client");
            return;
          }

          const filesToZip = [];

          // ✅ LOOP ALL UNITS
          for (const unit of response.units) {
            if (!unit?.unitId) continue;

            const ezText = await buildUnitEZReport({
              unit
            });

            // downloadEZFile(
            //   ezText,
            //   `Unit_Report_${unit.unitName}_${unit.unitId}.ez`
            // );

            filesToZip.push({
              filename: `Unit_Report_${unit.unitName}_${unit.unitId}.ez`,
              content: ezText,
            });
          }

          await downloadEZFilesAsZip(filesToZip, `Unit Reports Pull.zip`);

        } catch (err) {
          console.error("Failed to generate unit reports:", err);
        }
      }

      else if (selectedReport === "global-data") {
        try {
          const response = await getGlobalDataReportByClient(activeClientId);
          const icResponse = await getICValue(activeClientId);
          const stableResponse = await getSTAPAndSTAGStableCount(activeClientId);
          const urResponse = await getProductivityValue(activeClientId);

          const totalCandidates = response.totalUniqueCandidates || 0;
          const analytics = response.summary?.[0]?.globalAnalytics;
          const thresholds = response.summary?.[0]?.globalAnalyticsThreshold?.summary;

          if (!analytics || !thresholds) {
            console.warn("Incomplete global analytics data");
            return;
          }

          const ezText = buildGlobalEZReport({
            client: response.client,
            totalCandidates,
            analytics,
            thresholds,
            icValue: icResponse?.icDistribution,
            stableValue: stableResponse,
            productivityValue: urResponse?.distribution,
            frameworkAge: response.frameworkAge,
            effectivity: response.effectivity,
          });

          await downloadEZFile(
            ezText,
            `Global_Analytics_Report.ez`
          );
        } catch (err) {
          console.error("Failed to generate global report:", err);
        }
      }
    } catch (err) {
      console.error("Error during extraction:", err);
    }

    finally {
      setIsDownloading(false);
    }

  };


  return (
    <div className="w-full flex flex-col">
      <div className="h-full flex flex-col overflow-hidden  ">

        {/* Active tab content */}
        <div className="flex-1 overflow-auto bg-white m-1">
          <div className="flex flex-col h-full">
            {/* Main Content */}
            <div className="flex h-full overflow-hidden w-full">
              {/* Sidebar */}
              <div className="w-6/12 lg:w-4/12 flex flex-col border-2 h-full border-gray-200 ">
                <div className="flex-grow  flex flex-col h-2/4">
                  {/* Header */}
                  <div className="flex flex-col bg-gray-100 px-4 py-1.5 gap-2 border-b border-gray-300">
                    <div className="relative w-full ">
                      <input
                        type="text"
                        className="border w-full pl-2 pr-8 py-1 text-sm bg-white"
                        placeholder="Search"
                      />
                      <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                    </div>
                    {/* Table Header */}
                    <div className="grid grid-cols-3 gap-2 text-gray-800 font-semibold text-sm w-full">
                      <div
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => handleSort("lastName")}
                      >
                        Last Name
                      </div>

                      <div
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => handleSort("firstName")}
                      >
                        First Name
                      </div>

                      <div
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => handleSort("id")}
                      >
                        Candidate ID
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto">
                    <div className="px-3 py-1">
                      <div
                        className="flex items-center cursor-pointer select-none hover:bg-gray-50 px-2 py-1"
                        onClick={() => setopenMenu(!openMenu)}
                      >
                        <span
                          className={`transition-transform duration-200 text-gray-600 mr-1 ${openMenu ? "rotate-90" : "rotate-0"
                            }`}
                        >
                          ▶
                        </span>
                        <span
                          className={`text-md text-gray-600 ml-2 ${openMenu ? "font-bold" : ""
                            }`}
                        >
                          Details
                        </span>
                      </div>

                      {openMenu && (
                        <>
                          {capsuleActive && (
                            <div className=" items-center justify-center  px-4 ">
                              <div className="border border-gray-200 p-1">
                                <span className="text-sm text-gray-400">Capsule Name: {capsuleData.capsuleName}</span>
                                <br />
                                <span className="text-sm text-gray-400">Capsule ID: {capsuleData.capsuleId}</span>
                                <br />
                                <span className="text-sm text-gray-400">Capsule Type: {capsuleData.capsuleType}</span>
                                <br />
                                <span className="text-sm text-gray-400">Signature Profile: {capsuleData.signatureProfile}</span>
                              </div>
                            </div>
                          )}
                          {unitData && (
                            <div className=" items-center justify-center  px-4 ">
                              <div className="border border-gray-200 p-1">
                                <span className="text-sm text-gray-400">
                                  Unit Name: {unitData.unitName}
                                </span>
                                <br />
                                <span className="text-sm text-gray-400">
                                  Unit ID: {unitData.unitId}
                                </span>
                                <br />
                                <span className="text-sm text-gray-400">
                                  Unit Type: {unitData.unitType}
                                </span>
                                <br />
                                <span className="text-sm text-gray-400">
                                  Signature Profile: {unitData.signatureProfile}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Candidate List */}
                          <div className="space-y-1 px-4">
                            {sortedData.map((item) => (
                              <div
                                key={item.id}
                                className={`grid grid-cols-3 gap-2 items-center text-sm px-2 py-1 cursor-pointer
                                ${activeCandidateId === item.id
                                    ? "bg-blue-100 border-l-4 border-blue-400"
                                    : "hover:bg-gray-100"
                                  }`}
                                onClick={() => {
                                  setShowEdit(true);
                                  setShowSecondary(true);
                                }}
                                onDoubleClick={() => {
                                  setRightPanelOpen(true);
                                  setActiveCandidateId(item.id);
                                }}
                              >
                                <span className="text-gray-800">
                                  {item.lastName}
                                </span>
                                <span className="text-gray-800">
                                  {item.firstName}
                                </span>
                                <span>{item.candidateId}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              {RightPanelOpen && (
                <div className="w-6/12 lg:w-8/12 bg-white flex flex-col  border-2 ml-1 h-full border-gray-200 ">
                  <div className="flex-1 flex flex-col items-center justify-center pb-15 h-full bg-white shadow-md p-6 overflow-y-auto space-y-4">
                    {/* Report Extraction Options */}

                    <div className="flex flex-col justify-center items-center text-base font-semibold text-gray-800 my-8 leading-relaxed">
                      <p>EvalzNow – Human Capital & Education </p>
                      <p> Quantitative and Qualitative Assessment </p>
                      <p> Hybrid Proficiency & Growth Monitoring </p>
                      <p> Candidate & Unit/Capsule Report Generation</p>
                    </div>

                    <div className="flex flex-col justify-center space-y-3 text-sm ">
                      {[
                        {
                          id: "candidate-report",
                          label: "Extract Candidate Report for the Active Candidate",
                          disabled: !unitActive && !capsuleActive,
                        },
                        {
                          id: "all-candidates-unit",
                          label: "Extract All Candidate Reports for the Active Unit",
                          disabled: !unitActive,
                        },
                        {
                          id: "unit-report",
                          label: "Extract Unit Report for the Active Unit",
                          disabled: !unitActive,
                        },
                        {
                          id: "client-units",
                          label: "Extract All Unit Reports",
                          disabled: false,
                        },
                        {
                          id: "all-candidates-capsule",
                          label: "Extract All Candidate Reports for the Active Capsule",
                          disabled: !capsuleActive,
                        },
                        {
                          id: "capsule-report",
                          label: "Extract Capsule Report for the Active Capsule",
                          disabled: !capsuleActive,
                        },
                        {
                          id: "all-capsule-reports",
                          label: "Extract All Capsule Reports",
                          disabled: false,
                        },
                        {
                          id: "global-data",
                          label: "Extract Global Data Report",
                          disabled: false,
                        },
                        {
                          id: "clinical-data",
                          label: "Extract Clinical Data Report",
                          disabled: false,
                        },
                      ].map((item) => (
                        <div key={item.id} className={`flex items-center gap-2 ${item.disabled ? "opacity-50 cursor-not-allowed" : ""
                          }`}>
                          <input
                            id={item.id}
                            type="radio"
                            name="reportOption"
                            disabled={item.disabled}
                            onChange={() => setSelectedReport(item.id)}
                            className="w-4 h-4 text-gray-600 accent-black border-gray-300 focus:ring-black"
                          />
                          <label htmlFor={item.id} className={`text-gray-800 ${item.disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center ">
                      <button
                        type="submit"
                        onClick={handleExtract}
                        className="w-32 mt-4 bg-gray-200 hover:bg-gray-300 font-medium px-5 py-2 transition"
                      >
                        Extract
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isDownloading && <DownloadLoader />}
    </div>
  );
}
