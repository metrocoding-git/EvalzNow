"use client";
import { ListFilterPlus } from "lucide-react";
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
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
          <ListFilterPlus className="w-4 h-4" /> Create Unit
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 text-sm space-y-4">
        {/* Basic Unit Details */}
        {[
          { label: "Unit Name", key: "unitName", type: "text" },
          { label: "Unit ID", key: "unitId", type: "text" },
          { label: "Unit Start Date", key: "startDate", type: "date" },
          { label: "Unit End Date", key: "endDate", type: "text", placeholder: "N/A if unknown" }
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} className="space-y-1">
            <label className="block text-gray-700 font-medium">{label}:</label>
            <input
              type={type}
              placeholder={placeholder}
              onChange={e => handleChange(key, e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
          </div>
        ))}

        {/* Assignment of Staff */}
        <div className="pt-4 border-t border-gray-200 space-y-3">
          <h3 className="text-base font-semibold text-gray-800">Staff Assignment</h3>
          <div className="space-y-3">
            {["Assigned Leaders", "Assigned Assessors", "Unit Director"].map((label, idx) => (
              <div key={idx} className="space-y-1">
                <label className="block text-gray-700 font-medium">{label}:</label>
                <select
                  multiple={label !== "Unit Director"}
                  onChange={e =>
                    handleChange(label, Array.from(e.target.selectedOptions).map(o => o.value))
                  }
                  className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  size={label !== "Unit Director" ? 3 : 1}
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
        <div className="pt-4 border-t border-gray-200 space-y-3">
          <h3 className="text-base font-semibold text-gray-800">Unit Configuration</h3>
          {[
            { label: "Unit Type", key: "unitType", options: UNIT_TYPES },
            { label: "Signature Profile", key: "signatureProfile", options: SIGNATURE_PROFILES },
            { label: "Environment", key: "environment", options: ENVIRONMENTS }
          ].map(({ label, key, options }) => (
            <div key={key} className="space-y-1">
              <label className="block text-gray-700 font-medium">{label}:</label>
              <select
                value={form[key] || ""}
                onChange={e => handleChange(key, e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              >
                <option value="">Select {label}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          ))}

          {form.environment === "Workforce" && (
            <div className="space-y-1">
              <label className="block text-gray-700 font-medium">Scoring System:</label>
              <select
                value={form.scoringSystem || ""}
                onChange={e => handleChange("scoringSystem", e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              >
                <option value="">Select System</option>
                {SCORING_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
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
                <div key={k} className="space-y-1">
                  <label className="block text-gray-700 font-medium text-xs">{k}:</label>
                  <input
                    type="number"
                    step="0.001"
                    value={v}
                    disabled={k === "IC"}
                    onChange={e =>
                      handleChange("passThresholds", { ...form.passThresholds, [k]: parseFloat(e.target.value) })
                    }
                    className={`w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent ${k === "IC" ? "bg-gray-100" : "bg-white"}`}
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
            {form.benchmarks.map((bm, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-gray-700 font-medium text-xs">Benchmark Ref:</label>
                  <input
                    type="text"
                    placeholder="≤40 chars"
                    maxLength={40}
                    className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    value={bm.ref}
                    onChange={e => {
                      const b = [...form.benchmarks];
                      b[idx].ref = e.target.value;
                      setForm(f => ({ ...f, benchmarks: b }));
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-gray-700 font-medium text-xs">Type:</label>
                  <select
                    className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    value={bm.type}
                    onChange={e => {
                      const b = [...form.benchmarks];
                      b[idx].type = e.target.value;
                      setForm(f => ({ ...f, benchmarks: b }));
                    }}
                  >
                    <option value="">Select Type</option>
                    {BENCHMARK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
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
              className="px-3 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm transition-colors"
            >
              + Add Benchmark
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="border-t border-gray-200 p-2 pr-6 bg-gray-50">
        <div className="flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800  text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}