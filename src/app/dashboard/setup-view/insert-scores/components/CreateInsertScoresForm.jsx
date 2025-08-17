"use client";
import { ListFilterPlus, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";

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
  'theory practical': ["Practice", "Theory"],
  'third parameter': ["Receptive", "Productive", "Acuity"],
  // Add more types if needed
};

const mockPpIds = ["001", "002", "003", "-001", "-002", "-003"];


export default function CreateInsertScoresForm({ onClose }) {

  const [formData, setFormData] = useState({
    ppId: "",
    duration: "",
    referenceDate: "",
    task: "",
    workflowStage: "",
  });

  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'communicative'; // Default to communicative if not specified
  const environment = searchParams.get('environment') || 'workspace';

  // Get the appropriate competencies based on type
  const currentCompetencies = competencyTypes[type] || competencyTypes.communicative;

  const handleChange = (label, value) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

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
        <div className="grid grid-cols-2 gap-1 space-y-3 text-sm max-w-xl">

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
            {mockPpIds.map((pp, i) => (
              <option key={i} value={pp}>
                {pp}
              </option>
            ))}
          </select>


          {/* Duration */}

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


          {/* Critical Reference Date */}

          <label className="w-40 pr-2 text-left text-gray-700">
            Critical Ref. Date:
          </label>
          <input
            type="date"
            value={formData.referenceDate}
            onChange={(e) => handleChange("referenceDate", e.target.value)}
            className="flex-1 border px-2 py-1"
          />


          {/* Task Declaration */}

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
            <option value="" disabled>
              Select Competency
            </option>
            {currentCompetencies.map((comp, i) => (
              <option key={i} value={comp}>
                {comp}
              </option>
            ))}
          </select>


          {environment === "classroom" && (
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
      </div>


      {/* Fixed Footer */}
      <div className="border-t border-gray-300 p-2 pr-6 bg-gray-50 flex-shrink-0">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 bg-gray-200 hover:bg-gray-300 text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div >
  );
}