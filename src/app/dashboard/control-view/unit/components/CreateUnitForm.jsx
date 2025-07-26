"use client";
import { ListFilterPlus, X } from "lucide-react";
import { useState, useEffect } from "react";

const UNIT_TYPES = ["Communicative I/O", "Theory & Practice", "Third Parameter"];
const ENVIRONMENTS = ["Workforce", "Classroom"];
const SIGNATURE_PROFILES = [
  "Case 1: Solid Balanced",
  "Case 2: Rigorous Balanced",
  "Case 3a: Productive‑Weighted",
  "Case 3b: Receptive‑Weighed"
];
const SCORING_SYSTEMS = ["3‑Point", "5‑Point"];

const BENCHMARK_TYPES = [
  "Academic", "Audit Requirement", "Baseline", "Company Standard", "Direct Job Function",
  "District Standard", "Experimental", "External", "Governmental", "Human Capital",
  "Innovation", "Internal", "Investment", "KPI", "Market Disruption", "Other",
  "Performance", "Regulatory", "Safety", "SARPs", "SLO", "Standard", "Strategic",
  "Team Building", "Trial & Error"
];

export default function CreateUnitForm({ onClose, staffPool = [] }) {
  const [form, setForm] = useState({
    unitType: "",
    environment: "",
    signatureProfile: "",
    scoringSystem: "",
    passThresholds: {},
    benchmarks: []
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const showThresholds = form.unitType !== "";

  const defaultThresholds = {
    "Communicative I/O": {
      XEP: 0.700, XRR: 0.700, XLR: 0.700, XSR: 0.700, XWR: 0.700,
      XCP: 0.700, XBP: 0.700, MSIP: 0.450, ΔRRN: 0.000,
      ΔPRN: 0.000, ΔGEQ: 0.000, IC: 2
    },
    "Theory & Practice": {
      XEP: 0.700, XTR: 0.700, XPR: 0.700, XCP: 0.700, XBP: 0.700,
      MSIP: 0.450, ΔRRN: 0.000, ΔPRN: 0.000, ΔGEQ: 0.000, IC: 2
    },
    "Third Parameter": {
      XEP: 0.700, XRVSR: 0.700, XPVSR: 0.700, XAVSR: 0.700,
      XCP: 0.700, XBP: 0.700, MSIP: 0.450, ΔRRN: 0.000,
      ΔPRN: 0.000, ΔARN: 0.000, ΔGEQ: 0.000, IC: 2
    }
  };

  useEffect(() => {
    if (form.unitType) {
      setForm(prev => ({
        ...prev,
        passThresholds: defaultThresholds[form.unitType]
      }));
    }
  }, [form.unitType]);

  return (
    <div className="bg-gray-50 text-black border shadow-lg rounded overflow-y-auto max-h-screen z-50 m-4">
      <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
        <div className="flex items-center gap-2 text-blue-800 font-semibold">
          <ListFilterPlus className="w-5 h-5" /> CREATE UNIT
        </div>
        <button onClick={onClose} className="text-red-500 hover:text-red-700 text-sm hover:bg-red-100 rounded-full p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 text-sm space-y-4">
        {/* Basic Unit Details */}
        {[
          { label: "Unit Name", key: "unitName", type: "text" },
          { label: "Unit ID", key: "unitId", type: "text" },
          { label: "Unit Start Date", key: "startDate", type: "date" },
          { label: "Unit End Date", key: "endDate", type: "text", placeholder: "N/A if unknown" }
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} className="flex items-center">
            <label className="w-48 pr-2 text-gray-700">{label}:</label>
            <input
              type={type}
              placeholder={placeholder}
              onChange={e => handleChange(key, e.target.value)}
              className="flex-1 border px-2 py-1 rounded"
            />
          </div>
        ))}

        {/* Assignment of Staff */}
        <div className="pt-4 border-t space-y-2">
          <h3 className="text-base font-semibold text-gray-800">Staff Assignment</h3>
          <div className="flex space-x-4">
            {["Assigned Leaders", "Assigned Assessors", "Unit Director"].map((label, idx) => (
              <div key={idx} className="flex-1">
                <label className="block text-gray-700 mb-1">{label}:</label>
                <select
                  multiple={label !== "Unit Director"}
                  onChange={e =>
                    handleChange(label, Array.from(e.target.selectedOptions).map(o => o.value))
                  }
                  className="w-full border px-2 py-1 rounded"
                >
                  {staffPool.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Fields */}
        <div className="space-y-2">
          {[
            { label: "Unit Type", key: "unitType", options: UNIT_TYPES },
            { label: "Signature Profile", key: "signatureProfile", options: SIGNATURE_PROFILES },
            { label: "Environment", key: "environment", options: ENVIRONMENTS }
          ].map(({ label, key, options }) => (
            <div key={key} className="flex items-center">
              <label className="w-48 pr-2 text-gray-700">{label}:</label>
              <select
                value={form[key] || ""}
                onChange={e => handleChange(key, e.target.value)}
                className="flex-1 border px-2 py-1 rounded"
              >
                <option value="">Select {label}</option>
                {options.map(opt => <option key={opt}>{opt}</option>)}
              </select>
            </div>
          ))}

          {form.environment === "Workforce" && (
            <div className="flex items-center">
              <label className="w-48 pr-2 text-gray-700">Scoring System:</label>
              <select
                value={form.scoringSystem || ""}
                onChange={e => handleChange("scoringSystem", e.target.value)}
                className="flex-1 border px-2 py-1 rounded"
              >
                <option value="">Select System</option>
                {SCORING_SYSTEMS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Pass/Fail Thresholds Section */}
        {showThresholds && (
          <div className="pt-4 border-t">
            <h3 className="text-base font-semibold text-gray-800">Pass/Fail Thresholds</h3>
            {Object.entries(form.passThresholds).map(([k, v]) => (
              <div key={k} className="flex items-center mb-1">
                <label className="w-48 pr-2 text-gray-700">{k}:</label>
                <input
                  type="number"
                  step="0.001"
                  value={v}
                  disabled={k === "IC"}
                  onChange={e =>
                    handleChange("passThresholds", { ...form.passThresholds, [k]: parseFloat(e.target.value) })
                  }
                  className="flex-1 border px-2 py-1 rounded bg-white"
                />
              </div>
            ))}
          </div>
        )}

        {/* Benchmarks Section */}
        <div className="pt-4 border-t space-y-2">
          <h3 className="text-base font-semibold text-gray-800">Unit Benchmarks</h3>
          {/* Example: dynamic repeating entries */}
          {form.benchmarks.map((bm, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Benchmark Ref (≤40 chars)"
                maxLength={40}
                className="flex-1 border px-2 py-1 rounded"
                value={bm.ref}
                onChange={e => {
                  const b = [...form.benchmarks];
                  b[idx].ref = e.target.value;
                  setForm(f => ({ ...f, benchmarks: b }));
                }}
              />
              <select
                className="w-48 border px-2 py-1 rounded"
                value={bm.type}
                onChange={e => {
                  const b = [...form.benchmarks];
                  b[idx].type = e.target.value;
                  setForm(f => ({ ...f, benchmarks: b }));
                }}
              >
                {BENCHMARK_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setForm(f => ({
                ...f,
                benchmarks: [...(f.benchmarks || []), { ref: "", type: "" }]
              }))
            }
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            + Add Benchmark
          </button>
        </div>

        {/* Form Actions */}
        <div className="flex flex-row-reverse gap-2 pt-4">
          <button onClick={onClose} className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">
            Close
          </button>
          <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            Create Unit
          </button>
        </div>
      </div>
    </div>
  );
}
