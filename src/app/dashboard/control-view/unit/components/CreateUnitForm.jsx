"use client";
import { ListFilterPlus, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import StaffLookup from "./StaffLookUp";
import { getAllCandidates } from "@/services/candidateService";

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
const SCORING_SYSTEMS = ["3‑Point", "5‑Point"];

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

export default function CreateUnitForm({ onClose, staffPool = [], onSubmit }) {
  const [form, setForm] = useState({
    unitName: "",
    unitId: "",
    startDate: "",
    endDate: "",
    unitType: "",
    environment: "",
    signatureProfile: "",
    unitDirector: "",
    passThresholds: {}, // Initialize to avoid undefined errors
    benchmarks: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const [lookupFor, setLookupFor] = useState(null);
  const [showLookup, setShowLookup] = useState(false);

  const showThresholds = form.unitType !== "";

  const [unitDirectors, setUnitDirectors] = useState([]);
  const defaultThresholds = {
    "Communicative I/O": {
      XEP: 0.7,
      XRR: 0.7,
      XLR: 0.7,
      XSR: 0.7,
      XWR: 0.7,
      XCP: 0.7,
      XBP: 0.7,
      MSIP: 0.45,
      ΔRRN: 0.0,
      ΔPRN: 0.0,
      ΔGEQ: 0.0,
      IC: 2,
    },
    "Theory & Practice": {
      XEP: 0.7,
      XTR: 0.7,
      XPR: 0.7,
      XCP: 0.7,
      XBP: 0.7,
      MSIP: 0.45,
      ΔRRN: 0.0,
      ΔPRN: 0.0,
      ΔGEQ: 0.0,
      IC: 2,
    },
    "Third Parameter": {
      XEP: 0.7,
      XRVSR: 0.7,
      XPVSR: 0.7,
      XAVSR: 0.7,
      XCP: 0.7,
      XBP: 0.7,
      MSIP: 0.45,
      ΔRRN: 0.0,
      ΔPRN: 0.0,
      ΔARN: 0.0,
      ΔGEQ: 0.0,
      IC: 2,
    },
  };

  const handleStaffSelect = (selectedStaff) => {
    if (lookupFor === "leaders") {
      const current = form.assignedLeaders || [];
      if (current.includes(selectedStaff.id)) return; // prevent duplicate

      if (current.length >= 3) {
        alert("You can select a maximum of 3 leaders.");
        return;
      }

      handleChange("assignedLeaders", [...current, selectedStaff.id]);
    } else if (lookupFor === "assessors") {
      const current = form.assignedAssessors || [];
      if (current.includes(selectedStaff.id)) return; // prevent duplicate

      if (current.length >= 3) {
        alert("You can select a maximum of 3 assessors.");
        return;
      }

      handleChange("assignedAssessors", [...current, selectedStaff.id]);
    } else if (lookupFor === "director") {
      handleChange("unitDirector", selectedStaff.id);
    }

    setShowLookup(false);
    setLookupFor(null);
  };

  useEffect(() => {
    if (form.unitType && defaultThresholds[form.unitType]) {
      setForm((prev) => ({
        ...prev,
        passThresholds: defaultThresholds[form.unitType],
      }));
    } else {
      // Fallback if unitType is invalid
      setForm((prev) => ({
        ...prev,
        passThresholds: {},
      }));
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
    
    // Basic validation
    if (!form.unitName || !form.unitId || !form.unitType || !form.unitDirector) {
      alert("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      // Prepare benchmarks data
      const benchmarks = form.benchmarks.map(bm => ({
        benchmarkType: bm.type,
        benchmarkRef: bm.ref,
        benchmarkDescription: bm.description
      }));

      // Prepare the complete unit data
      const unitData = {
        unitName: form.unitName,
        unitId: form.unitId,
        unitStartDate: form.startDate,
        unitEndDate: form.endDate,
        unitDirector: form.unitDirector,
        unitType: form.unitType,
        signatureProfile: form.signatureProfile,
        environment: form.environment,
        benchmarks: benchmarks
      };

      await onSubmit(unitData);
      console.log(unitData);
      onClose();
    } catch (error) {
      console.error("Error creating unit:", error);
      alert("Failed to create unit. Please try again.");
    }
    finally {
      setIsSubmitting(false);
    }
    
  };
  

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full w-full bg-white z-20 border shadow-2xl border-gray-200">

      {/* Header */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 text-black font-semibold">
          <ListFilterPlus className="w-5 h-5" />
          Create Unit
        </div>

        {/* Close icon */}
        <button
          onClick={onClose}
          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-1 gap-1 space-y-3 text-sm max-w-xl">

          {/* Basic Unit Details */}
          {[
            { label: "Unit Name", key: "unitName", type: "text", required: true },
            { label: "Unit ID", key: "unitId", type: "text", required: true },
            { label: "Unit Start Date", key: "startDate", type: "date", required: true },
            { label: "Unit End Date", key: "endDate", type: "date" }
          ].map(({ label, key, type, placeholder }) => (
            <React.Fragment key={key}>
              <label className="col-span-1 flex items-center text-gray-700">{label}:</label>
              <input
               type={type}
               required
               value={form[key] || ""}
               onChange={(e) => handleChange(key, e.target.value)}
                className="col-span-1 border border-gray-300 px-2 py-1 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
            </React.Fragment>
          ))}

          {/* Staff Assignment */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <h3 className="text-base font-semibold text-gray-800">
              Staff Assignment
            </h3>

            {/* Assigned Leaders */}
            <div className="flex justify-between gap-2 space-y-1">
              <label className="col-span-1 flex items-center text-gray-700">
                Assigned Leaders:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLookupFor("leaders");
                    setShowLookup(true);
                  }}
                  className="px-2 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm"
                >
                  + Add Leader
                </button>
                <div className="text-sm text-gray-700">
                  {/* {form.assignedLeaders?.length || 0} selected */}
                  Max 3
                </div>
              </div>
            </div>

            {/* Assigned Assessors */}
            <div className="flex justify-between gap-2 space-y-1">
              <label className="col-span-1 flex items-center text-gray-700">
                Assigned Assessors:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLookupFor("assessors");
                    setShowLookup(true);
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm"
                >
                  + Add Assessor
                </button>
                <div className="text-sm text-gray-700">
                  {/* {form.assignedAssessors?.length || 0} selected */}
                  Max 3
                </div>
              </div>
            </div>

            {/* Unit Director */}
            <div className="flex justify-between gap-2 space-y-1">

              {/* <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLookupFor("director");
                    setShowLookup(true);
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm"
                >
                  Select Director
                </button>
                <div className="text-sm text-gray-700">
                  {form.unitDirector
                    ? staffPool.find((s) => s.id === form.unitDirector)?.name ||
                    "Selected"
                    : "None"}
                </div>
              </div> */}

              <label className="col-span-1 flex items-center text-gray-700">
                Unit Director:
              </label>
              <select required value={form.unitDirector || ""}
                onChange={(e) => handleChange("unitDirector", e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              >
                <option value="">Select Unit Director</option>
                {unitDirectors.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.firstName} {staff.lastName} — {staff.jobTitle}
                  </option>
                ))}
              </select>

            </div>

          </div>

          {/* Fixed Fields */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <h3 className="text-base font-semibold text-gray-800">
              Unit Configuration
            </h3>
            {[
              { label: "Unit Type", key: "unitType", options: UNIT_TYPES },
              {
                label: "Signature Profile",
                key: "signatureProfile",
                options: SIGNATURE_PROFILES,
              },
              { label: "Environment", key: "environment", options: ENVIRONMENTS },
            ].map(({ label, key, options }) => (
              <div key={key} className="grid grid-cols-2 items-center gap-2">
                <label className="col-span-1 flex items-center text-gray-700">
                  {label}:
                </label>
                <select
                  value={form[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                >
                  <option value="" disabled>
                    Select {label}
                  </option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {form.environment === "Workforce" && (
              <div className="space-y-1">
                <label className="col-span-1 flex items-center text-gray-700">
                  Scoring System:
                </label>
                <select
                  required
                  value={form.scoringSystem || ""}
                  onChange={(e) => handleChange("scoringSystem", e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                >
                  <option value="">Select System</option>
                  {SCORING_SYSTEMS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Pass/Fail Thresholds Section */}
          {showThresholds && (
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <h3 className="text-base font-semibold text-gray-800">
                Pass/Fail Thresholds
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(form.passThresholds).map(([k, v]) => (
                  <div key={k} className="space-y-1">
                    <label className="block text-gray-700 font-medium text-xs">
                      {k}:
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={v}
                      disabled={k === "IC"}
                      onChange={(e) =>
                        handleChange("passThresholds", {
                          ...form.passThresholds,
                          [k]: parseFloat(e.target.value),
                        })
                      }
                      className={`w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent ${k === "IC" ? "bg-gray-100" : "bg-white"
                        }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benchmarks Section */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <h3 className="text-base font-semibold text-gray-800">
              Unit Benchmarks
            </h3>
            <div className="space-y-2">
              {(form.benchmarks || []).map((bm, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2">
                  {/* Benchmark ID */}
                  <div className="space-y-1">
                    <label className="block text-gray-700 font-medium text-xs">
                      Benchmark ID:
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 01"
                      maxLength={20}
                      className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      value={bm.id || ""}
                      onChange={(e) => {
                        const updated = [...form.benchmarks];
                        updated[idx].id = e.target.value;
                        setForm((f) => ({ ...f, benchmarks: updated }));
                      }}
                    />
                  </div>



                  {/* Benchmark Type */}
                  <div className="space-y-1">
                    <label className="block text-gray-700 font-medium text-xs">
                      Benchmark Type:
                    </label>
                    <select
                      className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      value={bm.type || ""}
                      onChange={(e) => {
                        const updated = [...form.benchmarks];
                        updated[idx].type = e.target.value;
                        setForm((f) => ({ ...f, benchmarks: updated }));
                      }}
                    >
                      <option value="">Select Type</option>
                      {BENCHMARK_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Benchmark Ref */}
                  <div className="space-y-1">
                    <label className="block text-gray-700 font-medium text-xs">
                      Benchmark Ref:
                    </label>
                    <input
                      type="text"
                      placeholder="40 chars"
                      maxLength={40}
                      className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      value={bm.ref || ""}
                      onChange={(e) => {
                        const updated = [...form.benchmarks];
                        updated[idx].ref = e.target.value;
                        setForm((f) => ({ ...f, benchmarks: updated }));
                      }}
                    />
                  </div>


                  {/* Benchmark Ref */}
                  <div className="space-y-1">
                    <label className="block text-gray-700 font-medium text-xs">
                      Benchmark Description:
                    </label>
                    <input
                      type="text"
                      placeholder="≤40 chars"
                      maxLength={40}
                      className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      value={bm.ref || ""}
                      onChange={(e) => {
                        const updated = [...form.benchmarks];
                        updated[idx].ref = e.target.value;
                        setForm((f) => ({ ...f, benchmarks: updated }));
                      }}
                    />
                  </div>


                </div>
              ))}

              {/* Add Benchmark Button */}
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    benchmarks: [
                      ...(f.benchmarks || []),
                      { id: "", ref: "", type: "" },
                    ],
                  }))
                }
                className="px-3 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm transition-colors"
              >
                + Add Benchmark
              </button>
            </div>
          </div>
        </div>
      </div>
      {/*  Bottom Actions */}
      <div className="border-t border-gray-300 p-2 pr-6 bg-gray-50 flex-shrink-0">
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={!isFormValid()}
            className={`px-4 py-1 bg-gray-200 hover:bg-gray-300 text-sm transition-colors ${
              !isFormValid() 
                ? "cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Close
          </button>
        </div>
      </div>



      {
        showLookup && (
          <StaffLookup
            onClose={() => {
              setShowLookup(false);
              setLookupFor(null);
            }}
            onSelect={(staffArray) => {
              setUnitDirectors(staffArray); // store selected staff here
            }}
          />
        )
      }
    </form >
  );
}
