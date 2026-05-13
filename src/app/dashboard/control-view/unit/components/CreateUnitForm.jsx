"use client";
import { ListFilterPlus, Trash, Trash2, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import StaffLookup from "./StaffLookUp";
import { getAllCandidates } from "@/services/candidateService";
import { createUnit } from "@/services/unitService";
import { useFormStatus } from "@/context/FormStatusContext";
import { Toaster } from "react-hot-toast";

const UNIT_TYPES = [
  "Communicative I/O",
  "Theory & Practice",
  "Third Parameter",
];
const ENVIRONMENTS = ["Workforce", "Classroom"];
const SIGNATURE_PROFILES = [
  "Case 1: Solid Balanced",
  "Case 2: Rigorous Balanced",
  "Case 3a: Productive‑Weighted",
  "Case 3b: Receptive‑Weighed",
];
const SCORING_SYSTEMS = ["3-Point", "5-Point"];

const BENCHMARK_TYPES = [
  "Academic",
  "Audit Requirement",
  "Baseline",
  "Company Standard",
  "Direct Job Function",
  "District Standard",
  "Experimental",
  "External",
  "Governmental",
  "Human Capital",
  "Innovation",
  "Internal",
  "Investment",
  "KPI",
  "Market Disruption",
  "Other",
  "Performance",
  "Regulatory",
  "Safety",
  "SARPs",
  "SLO",
  "Standard",
  "Strategic",
  "Team Building",
  "Trial & Error",
];

export default function CreateUnitForm({ onClose, staffPool = [], onSubmit, unitData }) {
  const [form, setForm] = useState({
    unitName: "",
    unitId: "",
    startDate: "",
    endDate: "",
    unitType: "",
    environment: "",
    signatureProfile: "",
    unitDirector: "",
    scoringSystem: "",
    passThresholds: {},
    benchmarks: [],
    assignedLeaders: [],
    assignedAssessors: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const [lookupFor, setLookupFor] = useState(null);
  const [showLookup, setShowLookup] = useState(false);
  const { formStatus, setFormStatus } = useFormStatus();

  const showThresholds = form.unitType !== "";

  const THRESHOLD_NAMES = {
    XEP: "Equivalent Proficiency",
    XRR: "Reading Ratio",
    XLR: "Listening Ratio",
    XSR: "Speaking Ratio",
    XWR: "Writing Ratio",
    XCP: "Composite Proficiency",
    XBP: "Band Proficiency",
    MSIP: "Butler Interaction Proficiency",
    ΔRRN: "Receptive Growth Differential",
    ΔPRN: "Productive Growth Differential",
    ΔARN: "Acuity Growth Differential",
    ΔGEQ: "Equivalent Growth Differential",
    IC: "Interaction Class",
    XTR: "Theory-Based Ratio",
    XPR: "Practice Ratio",
    XRVSR: "Receptive Variable Scoring Ratio",
    XPVSR: "Productive Variable Scoring Ratio",
    XAVSR: "Acuity Value Score Ratio"
  };

  const [unitDirectors, setUnitDirectors] = useState([]);
  const defaultThresholds = {
    "Communicative I/O": {
      XEP: 0.700,
      XRR: 0.700,
      XLR: 0.700,
      XSR: 0.700,
      XWR: 0.700,
      XCP: 0.700,
      XBP: 0.700,
      MSIP: 0.450,
      ΔRRN: 0.0,
      ΔPRN: 0.0,
      ΔGEQ: 0.0,
      IC: 2,
    },
    "Theory & Practice": {
      XEP: 0.700,
      XTR: 0.700,
      XPR: 0.700,
      XCP: 0.700,
      XBP: 0.700,
      MSIP: 0.450,
      ΔRRN: 0.0,
      ΔPRN: 0.0,
      ΔGEQ: 0.0,
      IC: 2,
    },
    "Third Parameter": {
      XEP: 0.700,
      XRVSR: 0.700,
      XPVSR: 0.700,
      XAVSR: 0.700,
      XCP: 0.700,
      XBP: 0.700,
      MSIP: 0.450,
      ΔRRN: 0.0,
      ΔPRN: 0.0,
      ΔARN: 0.0,
      ΔGEQ: 0.0,
      IC: 2,
    },
  };

  const getSignatureProfiles = (unitType) => {
    if (unitType === "Communicative I/O" || unitType === "Theory & Practice") {
      return [
        "Case 1: Solid Balanced",
        "Case 2: Rigorous Balanced",
        "Case 3a: Productive-Weighted",
        "Case 3b: Receptive-Weighted",
      ];
    }
    if (unitType === "Third Parameter") {
      return ["Case 1: Solid Balanced"];
    }
    return [];
  };

  useEffect(() => {
    if (unitData) return;
    setForm((prev) => ({ ...prev, signatureProfile: "" }));
  }, [form.unitType, unitData]);

  const handleStaffSelect = (selectedStaffArray) => {
    if (lookupFor === "leaders") {
      const leaderIds = selectedStaffArray.map((s) => s.id);
      handleChange("assignedLeaders", leaderIds);
      setUnitDirectors(selectedStaffArray);
    } else if (lookupFor === "assessors") {
      handleChange("assignedAssessors", selectedStaffArray.map((s) => s.id));
    } else if (lookupFor === "director") {
      handleChange("unitDirector", selectedStaffArray[0]?.id || "");
    }
    setShowLookup(false);
    setLookupFor(null);
  };

  useEffect(() => {
    if (form.unitType && defaultThresholds[form.unitType]) {
      setForm((prev) => ({ ...prev, passThresholds: defaultThresholds[form.unitType] }));
    } else {
      setForm((prev) => ({ ...prev, passThresholds: {} }));
    }
  }, [form.unitType]);

  const isFormValid = () => {
    return (
      form.unitName?.trim() &&
      form.unitId?.trim() &&
      form.startDate?.trim() &&
      form.unitDirector?.trim() &&
      form.unitType?.trim() &&
      form.signatureProfile?.trim() &&
      form.environment?.trim() &&
      (form.environment !== "Workforce" || form.scoringSystem?.trim())
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.unitName || !form.unitId || !form.unitType || !form.unitDirector) {
      alert("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    setFormStatus("Processing...");
    try {
      const benchmarks = form.benchmarks.map(bm => ({
        benchmarkType: bm.type,
        benchmarkRef: bm.ref,
        benchmarkDescription: bm.description
      }));

      const staffLookup = [
        ...(form.assignedLeaders || []).map((id) => ({ staffId: id, roleType: "Leader" })),
        ...(form.assignedAssessors || []).map((id) => ({ staffId: id, roleType: "Assessor" })),
      ];

      const unitDataPayload = {
        unitName: form.unitName,
        unitId: form.unitId,
        unitStartDate: form.startDate,
        unitEndDate: form.endDate,
        unitDirector: form.unitDirector,
        unitType: form.unitType,
        signatureProfile: form.signatureProfile,
        environment: form.environment,
        scoringSystem: form.scoringSystem,
        benchmarks: benchmarks,
        staffLookup: staffLookup,
        ...form.passThresholds,
      };

      const result = await onSubmit(unitDataPayload);
      if (result !== false) {
        setFormStatus("Unit Created");
        onClose();
      } else {
        setFormStatus("Submission failed");
      }
    } catch (error) {
      console.error("Error creating unit:", error);
      alert("Failed to create unit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!unitData) return;

    let assignedLeaders = [];
    let assignedAssessors = [];
    let unitDirectors = [];

    const staffSource = unitData.staffAssignments?.length > 0
      ? unitData.staffAssignments
      : unitData.staffMembers || [];

    if (Array.isArray(staffSource) && staffSource.length > 0) {
      if (staffSource[0]?.roleType) {
        assignedLeaders = staffSource.filter(sa => sa.roleType === "Leader").map(sa => sa.staff?.id || sa.staffId || sa.id || "");
        assignedAssessors = staffSource.filter(sa => sa.roleType === "Assessor").map(sa => sa.staff?.id || sa.staffId || sa.id || "");
        unitDirectors = staffSource.filter(sa => sa.roleType === "Leader").map(sa => sa.staff || sa).filter(Boolean);
      } else if (staffSource[0]?.StaffLookup?.roleType) {
        assignedLeaders = staffSource.filter(staff => staff.StaffLookup?.roleType === "Leader").map(staff => staff.id);
        assignedAssessors = staffSource.filter(staff => staff.StaffLookup?.roleType === "Assessor").map(staff => staff.id);
        unitDirectors = staffSource.filter(staff => staff.StaffLookup?.roleType === "Leader");
      } else {
        assignedLeaders = staffSource.map(staff => staff.id);
        unitDirectors = staffSource;
      }
    }

    setForm({
      unitName: "",
      unitId: "",
      startDate: unitData.unitStartDate || "",
      endDate: unitData.unitEndDate || "",
      unitType: unitData.unitType || "",
      environment: unitData.environment || "",
      signatureProfile: unitData.signatureProfile || "",
      unitDirector: unitData.unitDirector || "",
      passThresholds: unitData.passThresholds || defaultThresholds[unitData.unitType] || {},
      benchmarks: (unitData.benchmarks || []).map((bm, i) => ({
        id: String(i + 1),
        benchmarkId: bm.benchmarkId || "",
        type: bm.benchmarkType || "",
        ref: bm.benchmarkRef || "",
        description: bm.benchmarkDescription || "",
      })),
      assignedLeaders,
      assignedAssessors,
      scoringSystem: unitData.scoringSystem || "",
    });

    setUnitDirectors(unitDirectors);
  }, [unitData]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full w-full bg-white z-20 border shadow-2xl border-gray-200">

      {/* Header */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 text-black font-semibold">
          <ListFilterPlus className="w-5 h-5" />
          Create Unit
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col gap-6 text-sm w-full">

          {/* Basic Unit Details */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-3">
            {[
              { label: "Unit Name", key: "unitName", type: "text", required: true },
              { label: "Unit ID", key: "unitId", type: "text", required: true },
              { label: "Unit Start Date", key: "startDate", type: "date", required: true },
              { label: "Unit End Date", key: "endDate", type: "date" }
            ].map(({ label, key, type }) => (
              <React.Fragment key={key}>
                <label className="col-span-1 flex items-center text-gray-700">{label}:</label>
                <input
                  type={type}
                  required
                  value={form[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="col-span-2 border border-gray-300 px-2 py-1 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </React.Fragment>
            ))}
          </div>

          {/* Staff Assignment */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <h3 className="text-base font-semibold text-gray-800">Staff Assignment</h3>

            {/* Assigned Leaders */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-gray-700">Assigned Leaders:</label>
              <div className="col-span-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setLookupFor("leaders"); setShowLookup(true); }}
                  className="px-2 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm"
                >
                  + Add Leader
                </button>
                <span className="text-sm text-gray-700">Max 3</span>
              </div>
            </div>

            {/* Assigned Assessors */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-gray-700">Assigned Assessors:</label>
              <div className="col-span-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setLookupFor("assessors"); setShowLookup(true); }}
                  className="px-3 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm"
                >
                  + Add Assessor
                </button>
                <span className="text-sm text-gray-700">Max 3</span>
              </div>
            </div>

            {/* Unit Director */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-gray-700">Unit Director:</label>
              <select
                required
                value={form.unitDirector || ""}
                onChange={(e) => handleChange("unitDirector", e.target.value)}
                className="col-span-2 border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              >
                <option value="" disabled>Select Unit Director</option>
                {unitDirectors.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.firstName} {staff.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unit Configuration */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <h3 className="text-base font-semibold text-gray-800">Unit Configuration</h3>

            {[
              { label: "Unit Type", key: "unitType", options: UNIT_TYPES },
              { label: "Signature Profile", key: "signatureProfile", options: getSignatureProfiles(form.unitType) },
              { label: "Environment", key: "environment", options: ENVIRONMENTS },
            ].map(({ label, key, options }) => (
              <div key={key} className="grid grid-cols-3 items-center gap-4">
                <label className="text-gray-700">{label}:</label>
                <select
                  value={form[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="col-span-2 border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                >
                  <option value="" disabled>Select {label}</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}

            {form.environment === "Workforce" && (
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-gray-700">Scoring System:</label>
                <select
                  required
                  value={form.scoringSystem}
                  onChange={(e) => handleChange("scoringSystem", e.target.value)}
                  className="col-span-2 border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                >
                  <option value="" disabled>Select System</option>
                  {SCORING_SYSTEMS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Pass/Fail Thresholds Section */}
          {showThresholds && (
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <h3 className="text-base font-semibold text-gray-800">Pass/Fail Thresholds</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(form.passThresholds).map(([k, v]) => (
                  <div key={k} className="space-y-1 relative group">
                    <div className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
                      {THRESHOLD_NAMES[k] || k}
                    </div>
                    <label className="block text-gray-700 font-medium text-xs">{k}:</label>
                    <input
                      type="number"
                      step="0.001"
                      value={typeof v === "number" ? v.toFixed(3) : ""}
                      disabled={k === "IC"}
                      onChange={(e) =>
                        handleChange("passThresholds", {
                          ...form.passThresholds,
                          [k]: parseFloat(e.target.value),
                        })
                      }
                      className={`w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent ${
                        k === "IC" ? "bg-gray-100" : "bg-white"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benchmarks Section */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <h3 className="text-base font-semibold text-gray-800">Unit Benchmarks</h3>
            <div className="space-y-2">
              {(form.benchmarks || []).map((bm, idx) => (
                <div key={idx} className="grid grid-cols-[80px_1fr_1fr_1fr_32px] items-end gap-2 p-2 border border-gray-100 ">

                  {/* BID */}
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-medium text-xs">BID:</label>
                    <input
                      type="text"
                      maxLength={20}
                      className="w-full border border-gray-300 px-2 py-1 text-sm bg-gray-100 focus:outline-none"
                      value={bm.benchmarkId || bm.id || ""}
                      readOnly
                    />
                  </div>

                  {/* Benchmark Type */}
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-medium text-xs">Type:</label>
                    <select
                      className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={bm.type || ""}
                      onChange={(e) => {
                        const updated = [...form.benchmarks];
                        updated[idx].type = e.target.value;
                        setForm((f) => ({ ...f, benchmarks: updated }));
                      }}
                    >
                      <option value="" disabled>Select Type</option>
                      {BENCHMARK_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Benchmark Ref */}
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-medium text-xs">Reference:</label>
                    <input
                      type="text"
                      maxLength={40}
                      className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={bm.ref || ""}
                      onChange={(e) => {
                        const updated = [...form.benchmarks];
                        updated[idx].ref = e.target.value;
                        setForm((f) => ({ ...f, benchmarks: updated }));
                      }}
                    />
                  </div>

                  {/* Benchmark Description */}
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-medium text-xs">Description:</label>
                    <input
                      type="text"
                      maxLength={40}
                      className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={bm.description || ""}
                      onChange={(e) => {
                        const updated = [...form.benchmarks];
                        updated[idx].description = e.target.value;
                        setForm((f) => ({ ...f, benchmarks: updated }));
                      }}
                    />
                  </div>

                  {/* Delete */}
                  <div className="flex items-end justify-center pb-1">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = form.benchmarks.filter((_, i) => i !== idx);
                        const reordered = updated.map((bm, i) => ({ ...bm, id: String(i + 1) }));
                        setForm((f) => ({ ...f, benchmarks: reordered }));
                      }}
                      className="text-gray-900 hover:text-gray-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setForm((f) => {
                    const reordered = (f.benchmarks || []).map((bm, i) => ({ ...bm, id: String(i + 1) }));
                    const nextId = reordered.length + 1;
                    return {
                      ...f,
                      benchmarks: [...reordered, { id: String(nextId), ref: "", type: "", description: "" }],
                    };
                  })
                }
                className="px-3 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm transition-colors"
              >
                + Add Benchmark
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-gray-300 p-2 pr-6 bg-gray-50 flex-shrink-0">
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={!isFormValid()}
            className={`px-4 py-1 text-sm transition-colors ${
              !isFormValid()
                ? "bg-gray-200 cursor-not-allowed text-gray-400"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            Close
          </button>
        </div>
      </div>

      {showLookup && (
        <StaffLookup
          onClose={() => { setShowLookup(false); setLookupFor(null); }}
          onSelect={handleStaffSelect}
          selectedIds={
            lookupFor === "leaders"
              ? form.assignedLeaders || []
              : lookupFor === "assessors"
              ? form.assignedAssessors || []
              : lookupFor === "director"
              ? form.unitDirector ? [form.unitDirector] : []
              : []
          }
        />
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </form>
  );
}