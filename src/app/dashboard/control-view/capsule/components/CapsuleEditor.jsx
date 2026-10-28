"use client";
import React, { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { getCapsuleById, updateCapsule, updateCapsuleBlock } from "@/services/capsuleService";
import { getAllStaffs } from "@/services/staffService";
import { useFormStatus } from "@/context/FormStatusContext";
import StaffLookup from "../../unit/components/StaffLookUp";
import {
  CAPSULE_FRAMEWORK_AGES, CAPSULE_THRESHOLD_NAMES, CAPSULE_DIRECT_DELIVERY, CAPSULE_INDIRECT_DELIVERY,
  LOCKED_THRESHOLDS, thresholdsOf,
} from "../capsuleConfig";
import { PERIOD_TYPES, BENCHMARK_TYPES } from "./sharedLists";

const emptyCapsule = {
  capsuleName: "", capsuleId: "", startDate: "", endDate: "", capsuleDirector: "",
  capsuleType: "", signatureProfile: "", environment: "", frameworkAge: "",
  benchmarks: [], assignedLeaders: [], assignedAssessors: [], passThresholds: {},
};

const inputCls = "col-span-3 w-full border border-gray-300 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent";

/** Entity Editor of the Capsule tab (same layout as the Unit Entity Editor). */
const CapsuleEditor = ({ capsuleDbId, onClose, showCapsuleForm, showEditBlockManager, activeTab, onSave, selectedBlock }) => {
  const [capsule, setCapsule] = useState(emptyCapsule);
  const [capsuleDirectors, setCapsuleDirectors] = useState([]);
  const [blockData, setBlockData] = useState({ ppId: "", periodType: "", shortDescription: "", delivery: "", manageType: "" });
  const [lookupFor, setLookupFor] = useState(null);
  const [showLookup, setShowLookup] = useState(false);
  const { setFormStatus } = useFormStatus();

  useEffect(() => {
    if (!capsuleDbId) return;
    (async () => {
      try {
        const data = await getCapsuleById(capsuleDbId);
        const assignedLeaders = (data.staffAssignments || []).filter((sa) => sa.roleType === "Leader").map((sa) => sa.staff?.id ?? sa.staffId);
        const assignedAssessors = (data.staffAssignments || []).filter((sa) => sa.roleType === "Assessor").map((sa) => sa.staff?.id ?? sa.staffId);
        setCapsule({
          capsuleName: data.capsuleName || "",
          capsuleId: data.capsuleId || "",
          startDate: data.capsuleStartDate || "",
          endDate: data.capsuleEndDate || "",
          capsuleDirector: data.capsuleDirector || "",
          capsuleType: data.capsuleType || "",
          signatureProfile: data.signatureProfile || "",
          environment: data.environment || "",
          frameworkAge: data.frameworkAge || "",
          benchmarks: (data.benchmarks || []).map((bm) => ({ ...bm })),
          assignedLeaders,
          assignedAssessors,
          passThresholds: thresholdsOf(data),
        });
        if (assignedLeaders.length) {
          try {
            const staffs = await getAllStaffs(sessionStorage.getItem("activeClientId"));
            setCapsuleDirectors((staffs || []).filter((s) => assignedLeaders.includes(s.id)));
          } catch { setCapsuleDirectors([]); }
        } else {
          setCapsuleDirectors([]);
        }
      } catch (err) {
        console.error("Failed to load capsule:", err);
      }
    })();
  }, [capsuleDbId]);

  useEffect(() => {
    if (!selectedBlock) return;
    setBlockData({
      ppId: selectedBlock.ppId ?? "",
      periodType: selectedBlock.periodType || PERIOD_TYPES[0],
      shortDescription: selectedBlock.shortDescription || "",
      delivery: selectedBlock.delivery || (activeTab === "Direct" ? CAPSULE_DIRECT_DELIVERY[0] : CAPSULE_INDIRECT_DELIVERY[0]),
      manageType: selectedBlock.manageType || "",
    });
  }, [selectedBlock, activeTab]);

  const handleChange = (field, value) => setCapsule((prev) => ({ ...prev, [field]: value }));
  const handleThresholdChange = (key, value) =>
    setCapsule((prev) => ({ ...prev, passThresholds: { ...prev.passThresholds, [key]: value } }));

  const handleStaffSelect = (selected) => {
    if (lookupFor === "leaders") {
      setCapsule((prev) => ({
        ...prev,
        assignedLeaders: selected.map((s) => s.id),
        capsuleDirector: selected.some((s) => String(s.id) === String(prev.capsuleDirector)) ? prev.capsuleDirector : (selected[0]?.id ?? ""),
      }));
      setCapsuleDirectors(selected);
    } else if (lookupFor === "assessors") {
      setCapsule((prev) => ({ ...prev, assignedAssessors: selected.map((s) => s.id) }));
    }
    setShowLookup(false);
    setLookupFor(null);
  };

  const handleBenchmarkChange = (index, field, value) =>
    setCapsule((prev) => {
      const benchmarks = prev.benchmarks.map((b, i) => (i === index ? { ...b, [field]: value } : b));
      return { ...prev, benchmarks };
    });

  const addBenchmark = () =>
    setCapsule((prev) => {
      const last = parseInt(prev.benchmarks[prev.benchmarks.length - 1]?.benchmarkId, 10) || 0;
      return { ...prev, benchmarks: [...prev.benchmarks, { id: null, benchmarkId: String(last + 1), benchmarkType: "", benchmarkRef: "", benchmarkDescription: "" }] };
    });

  const deleteBenchmark = (index) =>
    setCapsule((prev) => ({
      ...prev,
      benchmarks: prev.benchmarks.filter((_, i) => i !== index).map((b, i) => ({ ...b, benchmarkId: String(i + 1) })),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!capsule.frameworkAge) {
      alert("Please select the Framework Age (Years)");
      return;
    }
    setFormStatus("Processing...");
    try {
      const staffLookup = [
        ...capsule.assignedLeaders.map((id) => ({ staffId: id, roleType: "Leader" })),
        ...capsule.assignedAssessors.map((id) => ({ staffId: id, roleType: "Assessor" })),
      ];
      const saved = await updateCapsule(capsuleDbId, {
        capsuleName: capsule.capsuleName,
        capsuleId: capsule.capsuleId,
        capsuleStartDate: capsule.startDate,
        capsuleEndDate: capsule.endDate,
        capsuleDirector: capsule.capsuleDirector,
        capsuleType: capsule.capsuleType,
        signatureProfile: capsule.signatureProfile,
        environment: capsule.environment,
        frameworkAge: capsule.frameworkAge,
        benchmarks: capsule.benchmarks,
        staffLookup,
        ...capsule.passThresholds,
      });
      onSave(saved);
      onClose();
    } catch (err) {
      console.error("Failed to update capsule:", err);
      toast.error(err.message || "Failed to update capsule");
      setFormStatus("Ready...");
    }
  };

  const handleSaveBlock = async (e) => {
    e.preventDefault();
    if (!selectedBlock) return;
    setFormStatus("Processing");
    try {
      await updateCapsuleBlock(selectedBlock.id, blockData);
      setFormStatus("Assessment Block Manager Updated");
      onClose();
    } catch (err) {
      console.error("Failed to update block:", err);
      toast.error(err.message || "Failed to update assessment block");
    }
  };

  const editing = { onFocus: () => setFormStatus("Editing..."), onBlur: () => setFormStatus("Ready...") };

  return (
    <div className="h-full flex flex-col bg-white border border-gray-200">
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
          <Edit className="w-5 h-5" />
          Entity Editor
        </div>
      </div>

      {showCapsuleForm && (
        <form onSubmit={handleSubmit} className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col">
          <div className="flex-1 p-4">
            <div className="grid grid-cols-5 gap-x-2 gap-y-3 text-xs items-center">
              {[
                { label: "Capsule Name", key: "capsuleName" },
                { label: "Capsule ID", key: "capsuleId" },
                { label: "Start Date", key: "startDate", type: "date" },
                { label: "End Date", key: "endDate", type: "date" },
              ].map(({ label, key, type }) => (
                <React.Fragment key={key}>
                  <label className="col-span-2 text-gray-700 font-medium text-xs">{label}:</label>
                  <input name={key} value={capsule[key] || ""} {...editing} onChange={(e) => handleChange(key, e.target.value)} type={type || "text"} className={inputCls} />
                </React.Fragment>
              ))}

              <label className="col-span-2 flex items-center text-gray-700 text-xs">Assigned Leaders:</label>
              <div className="col-span-3 flex items-center gap-2">
                <button type="button" onClick={() => { setLookupFor("leaders"); setShowLookup(true); }} className="px-2 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 text-xs">+ Add Leader</button>
                <div className="text-xs text-gray-700">Max 3</div>
              </div>

              <label className="col-span-2 text-gray-700 text-xs font-medium whitespace-nowrap">Assigned Assessors:</label>
              <div className="col-span-3 flex items-center gap-3">
                <button type="button" onClick={() => { setLookupFor("assessors"); setShowLookup(true); }} className="px-2 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 ">+ Add Assessor</button>
                <span className="text-xs text-gray-700 ">Max 3</span>
              </div>

              <label className="col-span-2 flex items-center text-gray-700">Capsule Director:</label>
              <select
                value={capsule.capsuleDirector || ""}
                onChange={(e) => handleChange("capsuleDirector", e.target.value)}
                className="col-span-3 w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              >
                <option value="" disabled>Select Capsule Director</option>
                {capsuleDirectors.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select>

              {[
                ["Capsule Type", "capsuleType"],
                ["Signature Profile", "signatureProfile"],
                ["Environment", "environment"],
              ].map(([label, key]) => (
                <React.Fragment key={key}>
                  <label className="col-span-2 text-gray-700 font-medium text-xs">{label}:</label>
                  <input name={key} disabled value={capsule[key] || ""} type="text" className={inputCls} />
                </React.Fragment>
              ))}

              <label className="col-span-2 text-gray-700 font-medium text-xs">Framework Age (Years):</label>
              <select name="frameworkAge" value={capsule.frameworkAge || ""} {...editing} onChange={(e) => handleChange("frameworkAge", e.target.value)} className={inputCls}>
                <option value="" disabled>Select Framework Age</option>
                {CAPSULE_FRAMEWORK_AGES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {capsule.capsuleType && Object.keys(capsule.passThresholds).length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="pb-2 font-semibold text-gray-800 text-xs">Pass/Fail Thresholds for {capsule.capsuleType}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(capsule.passThresholds).map(([k, v]) => {
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
                          {...editing}
                          onChange={(e) => handleThresholdChange(k, e.target.value)}
                          className={`w-full border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent ${locked ? "bg-gray-100" : "bg-white"}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="pb-2 font-semibold text-gray-800 text-xs">Capsule Benchmarks</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      {["BID", "Benchmark Type", "Benchmark Ref", "Description", "Action"].map((h) => (
                        <th key={h} className="whitespace-nowrap border border-gray-300 px-2 py-1 text-center">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {capsule.benchmarks.map((bm, index) => (
                      <tr key={index} className="even:bg-gray-50">
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <input disabled type="text" value={bm.benchmarkId} className="w-full px-2 py-1 border text-center text-xs" />
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <select value={bm.benchmarkType} {...editing} onChange={(e) => handleBenchmarkChange(index, "benchmarkType", e.target.value)} className="w-full px-2 py-1 border">
                            <option value="" disabled>Select Type</option>
                            {BENCHMARK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <input type="text" value={bm.benchmarkRef} {...editing} onChange={(e) => handleBenchmarkChange(index, "benchmarkRef", e.target.value)} className="w-full px-2 py-1 border" />
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <input type="text" value={bm.benchmarkDescription} {...editing} onChange={(e) => handleBenchmarkChange(index, "benchmarkDescription", e.target.value)} className="w-full px-2 py-1 border" />
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <button type="button" onClick={(e) => { e.stopPropagation(); deleteBenchmark(index); }} className="px-1 py-1 text-gray-800 hover:text-gray-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={addBenchmark} className="flex items-center gap-2 mt-3 px-3 py-2 bg-gray-200 text-black hover:bg-gray-300 text-xs">
                + Add Benchmark
              </button>
            </div>
          </div>

          <div className=" p-2 ">
            <div className="flex justify-end">
              <button type="submit" className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm transition-colors">Edit</button>
            </div>
          </div>
        </form>
      )}

      {showEditBlockManager && (
        <form onSubmit={handleSaveBlock} className="flex-1 overflow-auto flex flex-col">
          <div className="flex-1 p-4">
            <div className="grid grid-cols-[140px_auto] gap-x-2 gap-y-3 text-xs items-center">
              <label className="col-span-1 flex items-center text-gray-700">Period Type:</label>
              <select className="w-full border px-2 py-0.5" {...editing} value={blockData.periodType} onChange={(e) => setBlockData((p) => ({ ...p, periodType: e.target.value }))}>
                {PERIOD_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>

              <label className="col-span-1 flex items-center text-gray-700">Short Description:</label>
              <input
                type="text"
                placeholder="Enter short description"
                value={blockData.shortDescription}
                {...editing}
                onChange={(e) => setBlockData((p) => ({ ...p, shortDescription: e.target.value }))}
                className="border border-black px-2 py-1 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 w-full"
              />

              <label className="col-span-1 flex items-center text-gray-700">Delivery:</label>
              <select className="w-full border px-2 py-0.5" {...editing} value={blockData.delivery} onChange={(e) => setBlockData((p) => ({ ...p, delivery: e.target.value }))}>
                {(activeTab === "Direct" ? CAPSULE_DIRECT_DELIVERY : CAPSULE_INDIRECT_DELIVERY).map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="border-t border-gray-200 px-3 py-2 bg-gray-50">
            <div className="flex justify-end">
              <button type="submit" className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm transition-colors">Edit</button>
            </div>
          </div>
        </form>
      )}

      {showLookup && (
        <StaffLookup
          onClose={() => { setShowLookup(false); setLookupFor(null); }}
          onSelect={handleStaffSelect}
          selectedIds={lookupFor === "leaders" ? capsule.assignedLeaders : capsule.assignedAssessors}
          lookupFor={lookupFor}
        />
      )}
    </div>
  );
};

export default CapsuleEditor;
