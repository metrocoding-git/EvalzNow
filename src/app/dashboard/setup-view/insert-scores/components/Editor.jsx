"use client";
import React, { useState, useEffect } from "react";
import { Edit, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getCriticalRefbyPpId, updateInsertScore } from "@/services/insertScoreService";
import { useFormStatus } from "@/context/FormStatusContext";
import { getAssessmentBlockByUnitAndCandidate } from "@/services/assessmentBlockManagerService";
import toast from "react-hot-toast";

const companySizes = [
  "Tier 1 - Micro-Size: 1-4 Candidates",
  "Tier 2 - Small-Size : 5-19 Candidates",
  "Tier 3 - Medium-Size : 20-99 Candidates",
  "Tier 4 - Large-Size : 100-249 Candidates",
  "Tier 5 - Low Enterprise : 250-999 Candidates",
  "Tier 6 - High Enterprise : 1000-2499 Candidates",
  "Tier 7 - Small Campus : 2500-4999 Candidates",
  "Tier 8 - Medium Campus : 5000-14999 Candidates",
  "Tier 9 - Large Campus : 15000-50000 Candidates",
  "Tier 10 - Mass Network : > 50000 Candidates",
];

const workflowStages = [
  "Analysis",
  "Backlog",
  "Completed",
  "Conceptual Phase",
  "Critical Phase",
  "Delivered",
  "Deployment",
  "Development",
  "En Route",
  "Facilitation",
  "Feasibility",
  "Follow-Up",
  "Formal Disposition",
  "Formal Request",
  "Implementation",
  "In Deliberation",
  "In Legal",
  "In Operation",
  "In Production",
  "In Progress",
  "In Queue",
  "In Review",
  "Instruction",
  "Kick-Off",
  "Logistics",
  "Maintenance",
  "Makers Learning",
  "Mock-Up",
  "Next Iteration",
  "On-Hold",
  "Optimization",
  "Other",
  "Overhaul",
  "Planning",
  "Policy Shift",
  "Preliminary Phase",
  "Preparation/CSR/CPD",
  "Procurement",
  "Ready for Delivery",
  "Ready for Review",
  "Rejected",
  "Servicing",
  "Simulation/Demo",
  "Staging",
  "Standard",
  "Tender/Bid",
  "Testing",
  "Waiting for External",
  "Waiting for Internal",
];

const assessmentTypes = [
  "Agile Model Target",
  "Behavior-driven Dev Target",
  "Coaching Objective",
  "Company Objective",
  "Confirmative",
  "Criterion-Referenced",
  "Data Security",
  "Deviation",
  "Diagnostic",
  "Domain-driven Dev Target",
  "Formative",
  "Gifted & Talented",
  "Human Capital",
  "IEP Objective",
  "Incremental Model Target",
  "Innovative",
  "Investigative/Root Cause",
  "Ipsative",
  "Key Performance",
  "Neuro-Linguistic Programming",
  "Norm-Referenced",
  "One-Time",
  "Other",
  "Peer",
  "Psychometric",
  "RAD Dev Target",
  "Risk",
  "Routine",
  "RUP Dev Target",
  "SCRUM Model target",
  "SEND Objective",
  "SMART Goal",
  "Special",
  "Spiral Model Target",
  "Summative",
  "Test-Driven Dev Target",
  "V Model Target",
  "Waterfall Model",
];

const scheduleImpacts = [
  "Abandoned",
  "Adjusted",
  "Ahead",
  "Constrained by cost",
  "Constrained by manhours",
  "Delayed",
  "Disrupted",
  "Downtime",
  "Escalated (important, not urgent)",
  "Escalated (urgent, not important)",
  "Escalated (urgent+ important)",
  "Extended",
  "Failed",
  "Force Majeure",
  "High Impact",
  "High-Time (short-staffed)",
  "High-Time (staffed)",
  "Intermittent",
  "Late (manageable)",
  "Late (unmanageable)",
  "Low Impact",
  "Miletone (approaching)",
  "Miletone (due)",
  "Miletone (overdue)",
  "Not Applicable",
  "On-Time",
  "On-Track",
  "Other",
  "Refined",
  "Rescheduled",
  "Scheduled",
  "Suspended",
  "Terminated",
];

const engageLevel = ["High", "Medium", "Low", "N/A"];

const competencyTypes = {
  communicative: ["Listening", "Reading", "Speaking", "Writing"],
  'theory & practice': ["Practice", "Theory"],
  'third parameter': ["Receptive", "Productive", "Acuity"],
  // Add more types if needed
};


export default function Editor({ details, performancePoints, onClose, onUpdate  }) {
  const [form, setForm] = useState({});
  const searchParams = useSearchParams();
  const { setFormStatus } = useFormStatus();
  const environment = searchParams.get('environment') || 'workspace';
  const unitId = searchParams.get('unitId');
  const [ppIds, setPpIds] = useState([]);
  const rawType = searchParams.get("type") || "communicative";
  const type = rawType.toLowerCase(); // normalize
  const [criticalRange, setCriticalRange] = useState(null);

  // Get the appropriate competencies based on type
  const currentCompetencies = competencyTypes[type] || competencyTypes.communicative;

  const mockPpIds =
    performancePoints === "Direct"
      ? ["1", "2", "3"]
      : performancePoints === "Indirect"
        ? ["-1", "-2"]
        : [];
       

  const [formData, setFormData] = useState({
    ppId: "",
    durationHrs: "",
    criticalRefDate: "",
    remarks: "",
    workflowStage: "",
    assessmentType: "",
    scheduleImpact: "",
    engageLevel: "",
    competency: "",
    attainedScore: null,
    maxScore: null,
    assessmentBlockId: null,
    unitId: null,
    candidate_id: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (details) {
      setFormData({
        ppId: details.ppId || "",
        durationHrs: details.durationHrs || "",
        criticalRefDate: details.criticalRefDate
        ? new Date(details.criticalRefDate).toISOString().split("T")[0]
        : "",
        remarks: details.remarks || "",
        workflowStage: details.workflowStage || "",
        assessmentType: details.assessmentType || "",
        scheduleImpact: details.scheduleImpact || "",
        engageLevel: details.engageLevel || "",
        competency: details.competency || "",
        attainedScore: details.attainedScore ?? null,
        maxScore: details.maxScore ?? null,
        assessmentBlockId: details.assessmentBlockId || null,
        unitId: details.unitId || null,
        candidate_id: details.candidate_id || null,
        task: details.task || "",
      });
    }
  }, [details]);

  const handleSubmit = async () => {
    if (!formData.assessmentBlockId || !formData.unitId) {
      setError("Missing unitId or assessmentBlockId.");
      return;
    }
  
    // Validate against critical date range
    if (criticalRange && formData.criticalRefDate) {
      const inputDate = new Date(formData.criticalRefDate);
      if (inputDate < criticalRange.start || inputDate > criticalRange.end) {
        toast.error(
          `Critical Ref. Date must be between ${criticalRange.start.toLocaleDateString()} and ${criticalRange.end.toLocaleDateString()}`
        );
        return; // ⛔ Stop submission
      }
    }

    try {
      setLoading(true);
      setFormStatus("Processing...");
  
      const payload = {
        ...formData,
        unitId: parseInt(formData.unitId), 
        candidate_id: parseInt(formData.candidate_id), 
        durationHrs: formData.durationHrs ? parseFloat(formData.durationHrs) : null,
        attainedScore: formData.attainedScore ? parseInt(formData.attainedScore) : null,
        maxScore: formData.maxScore ? parseInt(formData.maxScore) : null,
        criticalRefDate: formData.criticalRefDate
          ? new Date(formData.criticalRefDate).toISOString() 
          : null,
      };
  
      const response = await updateInsertScore(details.id, payload); 
      setFormStatus("Insert Score Updated");

      
      console.log("Successfully updated insert score.");
  
      if (onUpdate) onUpdate(response);
      onClose?.(); // Close the form if callback provided
    } catch (err) {
      console.error("Failed to update insert score:", err);
      setError("Failed to save insert score.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const fetchBlockInfo = async () => {
      if (!formData.unitId || !formData.candidate_id) return;
  
      try {
        setLoading(true);
        const blocks = await getAssessmentBlockByUnitAndCandidate(formData.unitId, formData.candidate_id);
  
        if (blocks?.length > 0) {
          
          // Extract PP IDs and sort ascending (numeric or string)
          const ppList = blocks
        .map((b) => b.ppId)
        .filter((pp) => pp !== undefined && pp !== null && pp !== "")
        .sort((a, b) => {
          const numA = parseInt(a, 10);
          const numB = parseInt(b, 10);

          // If both negative, sort descending
          if (numA < 0 && numB < 0) return numB - numA;
          // If both positive, sort ascending
          if (numA > 0 && numB > 0) return numA - numB;
          // Negatives come before positives
          if (numA < 0) return -1;
          if (numB < 0) return 1;

          // Fallback for strings
          return a.localeCompare(b);
        });

        setPpIds(ppList);

        } else {
          // setFormData((prev) => ({ ...prev, assessmentBlockId: "", ppId: "" }));
          setPpIds([]);
        }
      } catch (err) {
        console.error("Failed to fetch block info:", err);
        toast.error("Failed to load candidate block data.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchBlockInfo();
  }, [formData.unitId, formData.candidate_id]);

  useEffect(() => {
    const fetchCriticalRefByPpId = async () => {
      if (!formData.unitId || !formData.candidate_id || !formData.ppId) return;
  
      try {
        setLoading(true);
        const response = await getCriticalRefbyPpId(formData.unitId, formData.candidate_id, formData.ppId);
        console.log("selected pp id:->", response);
        // assuming your API returns { ppId, startDate, endDate }
        if (response) {
          setCriticalRange({
            start: new Date(response.startDate),
            end: new Date(response.endDate),
          });
        } else {
          setCriticalRange(null);
        }
      } catch (err) {
        console.error("Failed to fetch critical ref:", err);
        toast.error("Failed to load critical date range.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchCriticalRefByPpId();
  }, [formData.unitId, formData.candidate_id, formData?.ppId]);


  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2 text-black font-semibold text-sm">
          <Edit className="w-4 h-4" />
          Entity Editor
        </div>

      </div>

      {details && (
        <>
          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-4 text-xs space-y-3 bg-white">
              {/* PP ID */}
              <div className="flex items-center">
                <label className="w-40 pr-2 text-left text-gray-700">
                  PP ID Callout:
                </label>
                <select
                  value={formData.ppId}
                  onFocus={() => setFormStatus("Editing...")}
                  onBlur={() => setFormStatus("Ready...")}
                  onChange={(e) => handleChange("ppId", e.target.value)}
                  className="flex-1 border px-2 py-1"
                >
                  <option value="" disabled>
                    Select PP ID
                  </option>
                  {performancePoints == ""}
                  {ppIds.map((pp, i) => (
                    <option key={i} value={pp}>
                      {pp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div className="flex items-center">
                <label className="w-40 pr-2 text-left text-gray-700">
                  Duration (Days):
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  onFocus={() => setFormStatus("Editing...")}
                  onBlur={() => setFormStatus("Ready...")}
                  value={formData.durationHrs || ""}
                  onChange={(e) => handleChange("durationHrs", e.target.value)}
                  className="flex-1 border px-2 py-1"
                />
              </div>

              {/* Critical Reference Date */}
              <div className="flex items-center">
                <label className="w-40 pr-2 text-left text-gray-700">
                  Critical Ref. Date:
                </label>
                <input
                  type="date"
                  value={formData.criticalRefDate}
                  onFocus={() => setFormStatus("Editing...")}
                  onBlur={() => setFormStatus("Ready...")}
                  onChange={(e) => handleChange("criticalRefDate", e.target.value)}
                  className="flex-1 border px-2 py-1"
                />
              </div>

              {/* Task Declaration */}
              <div className="flex items-center">
                <label className="w-40 pr-2 text-left text-gray-700">
                  Task Declaration:
                </label>
                <input
                  type="text"
                  maxLength={50}
                  onFocus={() => setFormStatus("Editing...")}
                  onBlur={() => setFormStatus("Ready...")}
                  value={formData.remarks}
                  onChange={(e) => handleChange("remarks", e.target.value)}
                  className="flex-1 border px-2 py-1"
                />
              </div>

              {/* Workflow Stage */}
              <div className="flex items-center">
                <label className="w-40 pr-2 text-left text-gray-700">
                  Workflow Stage:
                </label>
                <select
                  value={formData.workflowStage}
                  onFocus={() => setFormStatus("Editing...")}
                  onBlur={() => setFormStatus("Ready...")}
                  onChange={(e) => handleChange("workflowStage", e.target.value)}
                  className="flex-1 border px-2 py-1"
                >
                  <option value="">Select Stage</option>
                  {workflowStages.map((stage, i) => (
                    <option key={i} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assessment Type */}
              <div className="flex items-center">
                <label className="w-40 pr-2 text-left text-gray-700">
                  Assessment Type:
                </label>
                <select
                  value={formData.assessmentType}
                  onFocus={() => setFormStatus("Editing...")}
                  onBlur={() => setFormStatus("Ready...")}
                  onChange={(e) => handleChange("assessmentType", e.target.value)}
                  className="flex-1 border px-2 py-1"
                >
                  <option value="">Select Assessment Type</option>
                  {assessmentTypes.map((type, i) => (
                    <option key={i} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Schedule Impact */}
              <div className="flex items-center">
                <label className="w-40 pr-2 text-left text-gray-700">
                  Schedule Impact:
                </label>
                <select
                  value={formData.scheduleImpact}
                  onFocus={() => setFormStatus("Editing...")}
                  onBlur={() => setFormStatus("Ready...")}
                  onChange={(e) => handleChange("scheduleImpact", e.target.value)}
                  className="flex-1 border px-2 py-1"
                >
                  <option value="">Select Schedule Impact</option>
                  {scheduleImpacts.map((impact, i) => (
                    <option key={i} value={impact}>
                      {impact}
                    </option>
                  ))}
                </select>
              </div>

              {/* Engage Level */}
              <div className="flex items-center">
                <label className="w-40 pr-2 text-left text-gray-700">
                  Engage Level:
                </label>
                <select
                  value={formData.engageLevel || ""}
                  onFocus={() => setFormStatus("Editing...")}
                  onBlur={() => setFormStatus("Ready...")}
                  onChange={(e) => handleChange("engageLevel", e.target.value)}
                  className="flex-1 border px-2 py-1"
                >
                  <option value="" disabled>
                    Select Engage Level
                  </option>
                  {engageLevel.map((level, i) => (
                    <option key={i} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Competency */}
              <div className="flex items-center">
                <label className="w-40 pr-2 text-left text-gray-700">
                  Competency:
                </label>
                <select
                  value={formData.competency || ""}
                  onFocus={() => setFormStatus("Editing...")}
                  onBlur={() => setFormStatus("Ready...")}
                  onChange={(e) => handleChange("competency", e.target.value)}
                  className="flex-1 border px-2 py-1"
                >
                  <option value="" disabled>
                    Select Competency
                  </option>
                  {currentCompetencies.map((comp, i) => (
                    <option key={i} value={comp}>
                      {comp}
                    </option>
                  ))}
                </select>
              </div>

              {environment === "Classroom" && (
                <>
                  <div className="flex items-center">
                    <label className="w-40 pr-2 text-left text-gray-700">
                      Attained Score:
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.attainedScore || ""}
                      onFocus={() => setFormStatus("Editing...")}
                      onBlur={() => setFormStatus("Ready...")}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          attainedScore: e.target.value,
                        }))
                      }
                      className="flex-1 border px-2 py-1"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="w-40 pr-2 text-left text-gray-700">
                      Maximum Score:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.maxScore || ""}
                      onFocus={() => setFormStatus("Editing...")}
                      onBlur={() => setFormStatus("Ready...")}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          maxScore: e.target.value,
                        }))
                      }
                      className="flex-1 border px-2 py-1"
                    />
                  </div>
                </>
              )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-1 bg-gray-200 hover:bg-gray-300 text-sm transition-colors"
              >
                Edit
              </button>
            </div>
            

            </form>
          </div>
        </>
      )}

    </div>
  );
}
