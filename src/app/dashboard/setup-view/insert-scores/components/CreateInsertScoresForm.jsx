"use client";
import { getAssessmentBlockByUnitAndCandidate } from "@/services/assessmentBlockManagerService";
import { createInsertScore } from "@/services/insertScoreService";
import { getScoringCriteriaByUnitId } from "@/services/scoringCriteriaService";
import { ListFilterPlus, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

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

const MAIN_CRITERIA = [
  { name: "Communication", label: "MC1" },
  { name: "Intelligence", label: "MC2" },
  { name: "Responsiveness", label: "MC3" },
  { name: "Efficiency", label: "MC4" },
  { name: "Adaptation", label: "MC5" },
  { name: "Accuracy", label: "MC6" },
  { name: "Verbal Reasoning", label: "MC7" },
  { name: "Spatial Reasoning", label: "MC8" },
  { name: "Numerical Reasoning", label: "MC9" },
  { name: "Problem Solving", label: "MC10" },
  { name: "Memory", label: "MC11" },
  { name: "Data Checking", label: "MC12" },
  { name: "Work Sampling", label: "MC13" },
  { name: "Quality of Work", label: "MC14" },
  { name: "Resourcefulness", label: "MC15" },
  { name: "Following Instructions", label: "MC16" },
  { name: "Working in Teams", label: "MC17" },
  { name: "Working Alone", label: "MC18" },
  { name: "Initiative", label: "MC19" },
  { name: "Sick/Injury Avoidance", label: "MC20" },
];



const engageLevel = ["High", "Medium", "Low", "N/A"];

const competencyTypes = {
  communicative: ["Listening", "Reading", "Speaking", "Writing"],
  'theory & practice': ["Practice", "Theory"],
  'third parameter': ["Receptive", "Productive", "Acuity"],
  // Add more types if needed
};

const mockPpIds = ["001", "002", "003", "-001", "-002", "-003"];


export default function CreateInsertScoresForm({ onClose, candidateId }) {

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
  candidate_id: null,
  // Main criteria mc1 - mc20
  mc1: "",
  mc2: "",
  mc3: "",
  mc4: "",
  mc5: "",
  mc6: "",
  mc7: "",
  mc8: "",
  mc9: "",
  mc10: "",
  mc11: "",
  mc12: "",
  mc13: "",
  mc14: "",
  mc15: "",
  mc16: "",
  mc17: "",
  mc18: "",
  mc19: "",
  mc20: "",
  // Custom criteria cc1 - cc20
  cc1: "",
  cc2: "",
  cc3: "",
  cc4: "",
  cc5: "",
  cc6: "",
  cc7: "",
  cc8: "",
  cc9: "",
  cc10: "",
  cc11: "",
  cc12: "",
  cc13: "",
  cc14: "",
  cc15: "",
  cc16: "",
  cc17: "",
  cc18: "",
  cc19: "",
  cc20: "",
});


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ppIds, setPpIds] = useState([]);
  const [assessmentBlocks, setAssessmentBlocks] = useState([]); 
  const [customCriteria, setCustomCriteria] = useState([]);
  const searchParams = useSearchParams();
  const [scoringSystem, setScoringSystem] = useState();
  
  const environment = searchParams.get('environment') || 'workspace';
  const unitId = searchParams.get('unitId');

  const rawType = searchParams.get("type") || "communicative";
  const type = rawType.toLowerCase(); // normalize

  // Get the appropriate competencies based on type
  const currentCompetencies = competencyTypes[type] || competencyTypes.communicative;

  const handleChange = (label, value) => {
    setFormData((prev) => ({
      ...prev,
      [label]: value,
    }));

    
    // When ppId changes, update the assessmentBlockId accordingly
    if (label === "ppId") {
      const selectedBlock = assessmentBlocks.find(block => block.ppId === value);
      if (selectedBlock) {
        setFormData(prev => ({
          ...prev,
          assessmentBlockId: selectedBlock.id
        }));
      }
    }
  };

  const requiredFields = [
    "ppId",
    "durationHrs",
    "criticalRefDate",
    "remarks",
    "workflowStage",
    "assessmentType",
    "scheduleImpact",
    "engageLevel",
    "competency",
  ];
  
  // Check if any required field is empty
  const isSubmitDisabled = requiredFields.some(
    (field) => !formData[field] || formData[field].toString().trim() === ""
  ) || (environment === "Classroom" && (
        formData.attainedScore === null ||
        formData.attainedScore === "" ||
        formData.maxScore === null ||
        formData.maxScore === ""
      ));
  
  

  const handleSubmit = async () => {
    if (!formData.assessmentBlockId || !unitId) {
      setError("Missing unitId or assessmentBlockId.");
      return;
    }

    // const requiredFields = [
    //   "ppId",
    //   "durationHrs",
    //   "criticalRefDate",
    //   "remarks",
    //   "workflowStage",
    //   "assessmentType",
    //   "scheduleImpact",
    //   "engageLevel",
    //   "competency",
    // ];

    

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        toast.error(`Field "${field}" is required.`);
        return; // stop submission
      }
    }

    let attained = null;

    // Validation for Classroom environment
    if (environment === "Classroom") {
      attained = parseFloat(formData.attainedScore || 0);
      const max = parseFloat(formData.maxScore || 0);

      if (attained > max) {
        toast.error("Attained score cannot be greater than maximum score.");
        return; // stop submission
      }
    }

    if (formData.attainedScore !== null && parseFloat(formData.attainedScore) < 0) {
      toast.error("Attained Score cannot be negative.");
      return;
    }
  
    if (formData.maxScore !== null && parseFloat(formData.maxScore) < 0) {
      toast.error("Maximum Score cannot be negative.");
      return;
    }

    if (environment === "Workforce") {

      let maxAllowed = null;
      if (scoringSystem === "3-Point") maxAllowed = 3;
      if (scoringSystem === "5-Point") maxAllowed = 5;

      // Calculate Max Score
      let highest = 0;
      let filledCount = 0;

      // Sum up all mc + cc values
      let total = 0;
  
      for (let i = 1; i <= 20; i++) {
        const mcVal = parseFloat(formData[`mc${i}`] || 0);
        if (mcVal < 0) {
          toast.error(`Negative value found in MC${i}. Please enter only positive values.`);
          return;
        }
        if (maxAllowed !== null && mcVal > maxAllowed) {
          toast.error(`MC${i} exceeds allowed maximum (${maxAllowed}).`);
          return;
        }

        if (!isNaN(mcVal)) total += mcVal;
  
        const ccVal = parseFloat(formData[`cc${i}`] || 0);
        if (ccVal < 0) {
          toast.error(`Negative value found in CC${i}. Please enter only positive values.`);
          return;
        }
        if (maxAllowed !== null && ccVal > maxAllowed) {
          toast.error(`CC${i} exceeds allowed maximum (${maxAllowed}).`);
          return;
        }

        if (!isNaN(ccVal)) total += ccVal;
      }
  
      attained = total;


      for (let i = 1; i <= 20; i++) {
        const mcVal = parseFloat(formData[`mc${i}`] || 0);
        if (mcVal > 0) {
          filledCount++;
          if (mcVal > highest) highest = mcVal;
        }
    
        const ccVal = parseFloat(formData[`cc${i}`] || 0);
        if (ccVal > 0) {
          filledCount++;
          if (ccVal > highest) highest = ccVal;
        }
      }
    
      formData.maxScore = maxAllowed * filledCount;
    }
  

    try {
      setLoading(true);

      const payload = {
        ...formData,
        unitId: parseInt(unitId),
        candidate_id: parseInt(candidateId),
        durationHrs: formData.durationHrs ? parseFloat(formData.durationHrs) : null,
        attainedScore: attained !== null ? attained : null,
        maxScore: formData.maxScore ? parseInt(formData.maxScore) : null,
      };

      await createInsertScore(payload);
      console.log("successfully submitted.");
      onClose(); // Close the form after successful submission
    } catch (err) {
      console.error("Failed to create insert score:", err);
      toast.error("Failed to save insert score.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentCompetencies.length > 0) {
      setFormData((prev) => ({
        ...prev,
        competency: prev.competency || "",
      }));
    }
  }, [type]);
  

  useEffect(() => {
    const fetchCriteria = async () => {
      if (!unitId) return;
  
      try {
        const data = await getScoringCriteriaByUnitId(unitId);
        if (!Array.isArray(data)) throw new Error("Invalid scoring criteria response");
  
        setCustomCriteria(data.filter(c => c.criteria && c.criteria.trim() !== ""));


        const ccData = {};
        data.forEach((criteria, index) => {
          ccData[`cc${index + 1}`] = criteria.criteria || "";
        });

        setFormData((prev) => ({ ...prev, ...ccData }));
  
      } catch (err) {
        console.error("Failed to fetch scoring criteria:", err);
      }
    };
  
    fetchCriteria();
  }, [unitId]);

  console.log("custom criteria:", customCriteria);

  useEffect(() => {
    const fetchBlockInfo = async () => {
      if (!unitId || !candidateId) return;
  
      try {
        setLoading(true);
        const blocks = await getAssessmentBlockByUnitAndCandidate(unitId, candidateId);
  
        if (blocks?.length > 0) {
          const block = blocks[0]; // pick first block for simplicity
          setFormData((prev) => ({
            ...prev,
            assessmentBlockId: block.id, // set assessment block ID
            // ppId: block.ppId || "", // default PP ID if available
          }));

          if (environment === "Workforce" && block.unit?.scoringSystem) {
            setScoringSystem(block.unit.scoringSystem);
            console.log("scoring Points: ", block.unit.scoringSystem);
          }
          
  
          // Extract PP IDs and sort ascending (numeric or string)
          const ppList = blocks
          .map((b) => b.ppId)
          .filter((pp) => pp !== undefined && pp !== null && pp !== "")
          .sort((a, b) => {
            // Try numeric comparison first
            const numA = parseInt(a, 10);
            const numB = parseInt(b, 10);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB; // ascending
            // fallback to string compare
            return a.localeCompare(b);
          });

          setPpIds(ppList);

        } else {
          setFormData((prev) => ({ ...prev, assessmentBlockId: "", ppId: "" }));
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
  }, [unitId, candidateId]);
  

  return (
    <div className="flex flex-col h-full w-full bg-white z-20 border shadow-2xl border-gray-200">

      {/* Header */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 text-black font-semibold">
          <ListFilterPlus className="w-5 h-5" />
          Insert Scores
        </div>

        {/* Close icon */}
        <button
          onClick={onClose}
          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-1 space-y-3  max-w-xl">

          {/* PP ID */}
          <label className="w-40 pr-2 text-left text-gray-700">
            PP ID Callout:
          </label>
          <select
            value={formData.ppId}
            onChange={(e) => handleChange("ppId", e.target.value)}
            className="flex-1 border px-2 py-1"
          >
            <option value="" disabled>
              Select PP ID
            </option>
            {ppIds.map((pp, i) => (
              <option key={i} value={pp}>
                {pp}
              </option>
            ))}
          </select>


          {/* Duration */}

          <label className="w-40 pr-2 text-left text-gray-700">
            Duration (Days):
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.durationHrs}
            onChange={(e) => handleChange("durationHrs", e.target.value)}
            className="flex-1 border px-2 py-1"
          />


          {/* Critical Reference Date */}

          <label className="w-40 pr-2 text-left text-gray-700">
            Critical Ref. Date:
          </label>
          <input
            type="date"
            value={formData.criticalRefDate}
            onChange={(e) => handleChange("criticalRefDate", e.target.value)}
            className="flex-1 border px-2 py-1"
          />


          {/* Task Declaration */}

          <label className="w-40 pr-2 text-left text-gray-700">
            Task Declaration:
          </label>
          <input
            type="text"
            maxLength={50}
            value={formData.remarks}
            onChange={(e) => handleChange("remarks", e.target.value)}
            className="flex-1 border px-2 py-1"
          />


          {/* Workflow Stage */}

          <label className="w-40 pr-2 text-left text-gray-700">
            Workflow Stage:
          </label>
          <select
            value={formData.workflowStage}
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


          {/* Assessment Type */}

          <label className="w-40 pr-2 text-left text-gray-700">
            Assessment Type:
          </label>
          <select
            value={formData.assessmentType}
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


          {/* Schedule Impact */}

          <label className="w-40 pr-2 text-left text-gray-700">
            Schedule Impact:
          </label>
          <select
            value={formData.scheduleImpact}
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


          {/* Engage Level */}

          <label className="w-40 pr-2 text-left text-gray-700">
            Engage Level:
          </label>
          <select
            value={formData.engageLevel || ""}
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


          {/* Competency */}
          <label className="w-40 pr-2 text-left text-gray-700">
            Competency:
          </label>
          <select
            value={formData.competency || ""}
            onChange={(e) => handleChange("competency", e.target.value)}
            className="flex-1 border px-2 py-1"
          >
            <option value="" >
              Select Competency
            </option>
            {currentCompetencies.map((comp, i) => (
              <option key={i} value={comp}>
                {comp}
              </option>
            ))}
          </select>

          
          {environment === "Workforce" && (
            <div className="col-span-2 space-y-4 w-full ">
              {MAIN_CRITERIA.map((criteria, index) => {
                const fieldKey = `mc${index + 1}`;

                return (
                  <div key={fieldKey} className="flex items-center gap-2 w-full">
                    {/* Left side label */}
                    <label className="w-40 pr-2 text-left text-gray-700">
                      {criteria.label} ({criteria.name}):
                    </label>

                    {/* Right side input */}
                    <input
                      step="0.01"
                       min="0"
                      type="number"
                      onBlur={(e) =>
                        handleChange(fieldKey, parseFloat(e.target.value || 0).toFixed(2))
                      }
                      value={formData[fieldKey] || ""}
                      onChange={(e) => handleChange(fieldKey, e.target.value)}
                      className="flex-1 border px-2 py-1 w-42"
                    />
                  </div>
                );
              })}

              {customCriteria.length > 0 && customCriteria.map((criteria, index) => {
                const fieldKey = `cc${index + 1}`;
                return (
                  <div key={fieldKey} className="flex items-center gap-2 w-full">
                    <label className="w-60 pr-2 text-left text-gray-700">
                      CC{index + 1} ({criteria.criteria}):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData[fieldKey] || ""}
                      onChange={(e) => handleChange(fieldKey, e.target.value)}
                      onBlur={(e) =>
                        handleChange(fieldKey, parseFloat(e.target.value || 0).toFixed(2))
                      }
                      className="border px-2 py-1 flex-1 w-42"
                    />
                  </div>
                );
              })}
            </div>
          )}


          {environment === "Classroom" && (
            <>
              <label className="w-40 pr-2 text-left text-gray-700">
                Attained Score:
              </label>
              <input
                type="number"
                min={0}
                value={formData.attainedScore || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    attainedScore: e.target.value,
                  }))
                }
                className="flex-1 border px-2 py-1"
              />


              <label className="w-40 pr-2 text-left text-gray-700">
                Maximum Score:
              </label>
              <input
                type="number"
                min={1}
                value={formData.maxScore || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxScore: e.target.value,
                  }))
                }
                className="flex-1 border px-2 py-1"
              />

            </>
          )}
        </div>

          {/* <div className="text-xs"><p><i>{error}</i></p></div> */}
      </div>


      {/* Fixed Footer */}
      <div className="border-t border-gray-300 p-2 pr-6 bg-gray-50 flex-shrink-0">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={isSubmitDisabled || loading}
            onClick={handleSubmit}
            className={`px-4 py-1 text-sm transition-colors ${
              isSubmitDisabled || loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Close
          </button>
        </div>
      </div>

      <Toaster position="top-right" reverseOrder={false} />

    </div >
  );
}