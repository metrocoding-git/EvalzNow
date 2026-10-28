"use client";
import React, { useEffect, useState } from "react";
import { ListFilterPlus, Trash2, X } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useFormStatus } from "@/context/FormStatusContext";
import StaffLookup from "../../unit/components/StaffLookUp";
import {
  CAPSULE_TYPES, CAPSULE_SIGNATURE_PROFILES, CAPSULE_ENVIRONMENTS, CAPSULE_FRAMEWORK_AGES,
  DEFAULT_CAPSULE_THRESHOLDS, CAPSULE_THRESHOLD_NAMES, LOCKED_THRESHOLDS, thresholdsOf,
} from "../capsuleConfig";
import { BENCHMARK_TYPES } from "./sharedLists";

const emptyForm = {
  capsuleName: "", capsuleId: "", startDate: "", endDate: "",
  capsuleType: "", signatureProfile: "", environment: "", frameworkAge: "", capsuleDirector: "",
  passThresholds: {}, benchmarks: [], assignedLeaders: [], assignedAssessors: [],
};

const selectCls = "col-span-2 border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent";

/** "Create Capsule" form – same layout as "Create Unit" with the Capsule configuration (Capacity_Part2). */
export default function CreateCapsuleForm({ onClose, onSubmit, capsuleData }) {
  const [form, setForm] = useState(emptyForm);
  const [capsuleDirectors, setCapsuleDirectors] = useState([]);
  const [lookupFor, setLookupFor] = useState(null);
  const [showLookup, setShowLookup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setFormStatus } = useFormStatus();

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleCapsuleTypeChange = (value) =>
    setForm((prev) => ({
      ...prev,
      capsuleType: value,
      // Only one profile / environment exist today, so pick them for the user
      signatureProfile: CAPSULE_SIGNATURE_PROFILES[0],
      environment: prev.environment || CAPSULE_ENVIRONMENTS[0],
      passThresholds: { ...(DEFAULT_CAPSULE_THRESHOLDS[value] || {}) },
    }));

  // Duplicate: prefill from the selected capsule (name and ID stay empty, as for units)
  useEffect(() => {
    if (!capsuleData) { setForm(emptyForm); return; }
    const staff = capsuleData.staffAssignments || [];
    const leaders = staff.filter((s) => s.roleType === "Leader");
    setForm({
      ...emptyForm,
      startDate: capsuleData.capsuleStartDate || "",
      endDate: capsuleData.capsuleEndDate || "",
      capsuleType: capsuleData.capsuleType || "",
      signatureProfile: capsuleData.signatureProfile || "",
      environment: capsuleData.environment || "",
      frameworkAge: capsuleData.frameworkAge || "",
      capsuleDirector: capsuleData.capsuleDirector || "",
      passThresholds: thresholdsOf(capsuleData),
      benchmarks: (capsuleData.benchmarks || []).map((bm, i) => ({
        id: String(i + 1), type: bm.benchmarkType || "", ref: bm.benchmarkRef || "", description: bm.benchmarkDescription || "",
      })),
      assignedLeaders: leaders.map((s) => s.staff?.id ?? s.staffId),
      assignedAssessors: staff.filter((s) => s.roleType === "Assessor").map((s) => s.staff?.id ?? s.staffId),
    });
    setCapsuleDirectors(leaders.map((s) => s.staff).filter((s) => s && s.firstName));
  }, [capsuleData]);

  const handleStaffSelect = (selected) => {
    if (lookupFor === "leaders") {
      handleChange("assignedLeaders", selected.map((s) => s.id));
      setCapsuleDirectors(selected);
    } else if (lookupFor === "assessors") {
      handleChange("assignedAssessors", selected.map((s) => s.id));
    }
    setShowLookup(false);
    setLookupFor(null);
  };

  const isFormValid = () =>
    form.capsuleName.trim() && form.capsuleId.trim() && form.startDate && String(form.capsuleDirector || "").trim() &&
    form.capsuleType && form.signatureProfile && form.environment && form.frameworkAge;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    setFormStatus("Processing...");
    try {
      const result = await onSubmit({
        capsuleName: form.capsuleName,
        capsuleId: form.capsuleId,
        capsuleStartDate: form.startDate,
        capsuleEndDate: form.endDate,
        capsuleDirector: form.capsuleDirector,
        capsuleType: form.capsuleType,
        signatureProfile: form.signatureProfile,
        environment: form.environment,
        frameworkAge: form.frameworkAge,
        benchmarks: form.benchmarks.map((bm, i) => ({
          benchmarkId: String(i + 1), benchmarkType: bm.type, benchmarkRef: bm.ref, benchmarkDescription: bm.description,
        })),
        staffLookup: [
          ...form.assignedLeaders.map((id) => ({ staffId: id, roleType: "Leader" })),
          ...form.assignedAssessors.map((id) => ({ staffId: id, roleType: "Assessor" })),
        ],
        ...form.passThresholds,
      });
      if (result !== false) {
        setFormStatus("Capsule Created");
        onClose();
      } else {
        setFormStatus("Submission failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBenchmark = (idx, field, value) =>
    setForm((f) => ({ ...f, benchmarks: f.benchmarks.map((b, i) => (i === idx ? { ...b, [field]: value } : b)) }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full w-full bg-white z-20 border shadow-2xl border-gray-200">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 text-black font-semibold">
          <ListFilterPlus className="w-5 h-5" />
          Create Capsule
        </div>
        <button type="button" onClick={onClose} className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col gap-6 text-sm w-full">
          {/* Basic details */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-3">
            {[
              { label: "Capsule Name", key: "capsuleName", type: "text" },
              { label: "Capsule ID", key: "capsuleId", type: "text" },
              { label: "Capsule Start Date", key: "startDate", type: "date" },
              { label: "Capsule End Date", key: "endDate", type: "date" },
            ].map(({ label, key, type }) => (
              <React.Fragment key={key}>
                <label className="col-span-1 flex items-center text-gray-700">{label}:</label>
                <input
                  type={type}
                  value={form[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  title={key === "capsuleId" ? "Capsule ID is always unique" : undefined}
                  className="col-span-2 border border-gray-300 px-2 py-1 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </React.Fragment>
            ))}
          </div>

          {/* Staff Assignment */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <h3 className="text-base font-semibold text-gray-800">Staff Assignment</h3>
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-gray-700">Assigned Leaders:</label>
              <div className="col-span-2 flex items-center gap-2">
                <button type="button" onClick={() => { setLookupFor("leaders"); setShowLookup(true); }} className="px-2 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm">+ Add Leader</button>
                <span className="text-sm text-gray-700">Max 3</span>
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-gray-700">Assigned Assessors:</label>
              <div className="col-span-2 flex items-center gap-2">
                <button type="button" onClick={() => { setLookupFor("assessors"); setShowLookup(true); }} className="px-3 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm">+ Add Assessor</button>
                <span className="text-sm text-gray-700">Max 3</span>
              </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-gray-700">Capsule Director:</label>
              <select value={form.capsuleDirector || ""} onChange={(e) => handleChange("capsuleDirector", e.target.value)} className={selectCls}>
                <option value="" disabled>Select Capsule Director</option>
                {capsuleDirectors.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>
          </div>

          {/* Capsule Configuration */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <h3 className="text-base font-semibold text-gray-800">Capsule Configuration</h3>
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-gray-700">Capsule Type:</label>
              <select value={form.capsuleType} onChange={(e) => handleCapsuleTypeChange(e.target.value)} className={selectCls}>
                <option value="" disabled>Select Capsule Type</option>
                {CAPSULE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {[
              { label: "Signature Profile", key: "signatureProfile", options: form.capsuleType ? CAPSULE_SIGNATURE_PROFILES : [] },
              { label: "Environment", key: "environment", options: CAPSULE_ENVIRONMENTS },
            ].map(({ label, key, options }) => (
              <div key={key} className="grid grid-cols-3 items-center gap-4">
                <label className="text-gray-700">{label}:</label>
                <select value={form[key] || ""} onChange={(e) => handleChange(key, e.target.value)} className={selectCls}>
                  <option value="" disabled>Select {label}</option>
                  {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-gray-700">Framework Age (Years):</label>
              <select value={form.frameworkAge || ""} onChange={(e) => handleChange("frameworkAge", e.target.value)} className={selectCls}>
                <option value="" disabled>Select Framework Age</option>
                {CAPSULE_FRAMEWORK_AGES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Pass/Fail Thresholds */}
          {form.capsuleType && (
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <h3 className="text-base font-semibold text-gray-800">Pass/Fail Thresholds for {form.capsuleType}</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(form.passThresholds).map(([k, v]) => {
                  const locked = LOCKED_THRESHOLDS.includes(k);
                  return (
                    <div key={k} className="space-y-1 relative group">
                      <div className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
                        {CAPSULE_THRESHOLD_NAMES[k] || k}
                      </div>
                      <label className="block text-gray-700 font-medium text-xs">{k}:</label>
                      <input
                        type="text"
                        value={v ?? ""}
                        disabled={locked}
                        onChange={(e) => handleChange("passThresholds", { ...form.passThresholds, [k]: e.target.value })}
                        className={`w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent ${locked ? "bg-gray-100" : "bg-white"}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Benchmarks */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <h3 className="text-base font-semibold text-gray-800">Capsule Benchmarks</h3>
            <div className="space-y-2">
              {form.benchmarks.map((bm, idx) => (
                <div key={idx} className="grid grid-cols-[80px_1fr_1fr_1fr_32px] items-end gap-2 p-2 border border-gray-100 ">
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-medium text-xs">BID:</label>
                    <input type="text" readOnly value={String(idx + 1)} className="w-full border border-gray-300 px-2 py-1 text-sm bg-gray-100 focus:outline-none" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-medium text-xs">Type:</label>
                    <select value={bm.type || ""} onChange={(e) => updateBenchmark(idx, "type", e.target.value)} className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                      <option value="" disabled>Select Type</option>
                      {BENCHMARK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-medium text-xs">Reference:</label>
                    <input type="text" maxLength={40} value={bm.ref || ""} onChange={(e) => updateBenchmark(idx, "ref", e.target.value)} className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-medium text-xs">Description:</label>
                    <input type="text" maxLength={40} value={bm.description || ""} onChange={(e) => updateBenchmark(idx, "description", e.target.value)} className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
                  </div>
                  <div className="flex items-end justify-center pb-1">
                    <button type="button" onClick={() => setForm((f) => ({ ...f, benchmarks: f.benchmarks.filter((_, i) => i !== idx) }))} className="text-gray-900 hover:text-gray-900">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, benchmarks: [...f.benchmarks, { id: String(f.benchmarks.length + 1), type: "", ref: "", description: "" }] }))}
                className="px-3 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm transition-colors"
              >
                + Add Benchmark
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300 p-2 pr-6 bg-gray-50 flex-shrink-0">
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className={`px-4 py-1 text-sm transition-colors ${!isFormValid() ? "bg-gray-200 cursor-not-allowed text-gray-400" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
          >
            Close
          </button>
        </div>
      </div>

      {showLookup && (
        <StaffLookup
          onClose={() => { setShowLookup(false); setLookupFor(null); }}
          onSelect={handleStaffSelect}
          selectedIds={lookupFor === "leaders" ? form.assignedLeaders : form.assignedAssessors}
        />
      )}
      <Toaster position="top-right" reverseOrder={false} />
    </form>
  );
}
