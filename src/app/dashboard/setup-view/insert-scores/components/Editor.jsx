"use client";
import React, { useState, useEffect } from "react";
import { Edit, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

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

const engageLevel = ["High", "Medium", "Low"];

const competencyTypes = {
  communicative: ["Listening", "Reading", "Speaking", "Writing"],
  'theory practical': ["Practice", "Theory"],
  'third parameter': ["Receptive", "Productive", "Acuity"],
  // Add more types if needed
};


export default function Editor({ details, performancePoints }) {
  const [form, setForm] = useState({});
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'communicative'; // Default to communicative if not specified
  const currentCompetencies = competencyTypes[type] || competencyTypes.communicative;
  const environment = searchParams.get('environment') || 'workspace';
  const mockPpIds =
    performancePoints === "Direct"
      ? ["1", "2", "3"]
      : performancePoints === "Indirect"
        ? ["-1", "-2"]
        : [];


  const [formData, setFormData] = useState({
    ppId: "",
    duration: "",
    referenceDate: "",
    task: "",
    workflowStage: "",
    attainedScore: "",
    maximumScore: "",
  });


  const handleChange = (label, value) => {
    setForm((prev) => ({ ...prev, [label]: value }));
  };


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
            <div className="p-4 text-xs space-y-3 bg-white">
              {/* PP ID */}
              <div className="flex items-center">
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
                  {performancePoints == ""}
                  {mockPpIds.map((pp, i) => (
                    <option key={i} value={pp}>
                      {pp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div className="flex items-center">
                <label className="w-40 pr-2 text-left text-gray-700">
                  Duration (hrs):
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.duration}
                  onChange={(e) => handleChange("duration", e.target.value)}
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
                  value={formData.referenceDate}
                  onChange={(e) => handleChange("referenceDate", e.target.value)}
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
                  value={formData.task}
                  onChange={(e) => handleChange("task", e.target.value)}
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

              {environment === "classroom" && (
                <>
                  <div className="flex items-center">
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
                  </div>

                  <div className="flex items-center">
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
                  </div>
                </>
              )}


            </div>
          </div>
        </>
      )}

    </div>
  );
}
