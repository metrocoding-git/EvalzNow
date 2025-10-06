"use client";
import React, { useEffect, useRef, useState } from "react";
import { Edit, Trash2, Trash } from "lucide-react";
import { getUnitById, updateUnit } from "@/services/unitService";
import { updateAssessmentBlock } from "@/services/assessmentBlockManagerService";
import { useFormStatus } from "@/context/FormStatusContext";
import StaffLookup from "./StaffLookUp";



const PERIOD_TYPES = [
  "Audit/Survey",
  "Blended - Instructor",
  "Blended - Platform",
  "Camp",
  "Case Study",
  "Certification",
  "Coaching",
  "Conditioning",
  "Exam/Test",
  "Experimental",
  "External Eval",
  "Flex",
  "Flipped",
  "Homework",
  "Immersion",
  "Intern/Co-Op",
  "Internal Eval",
  "Lab",
  "LMS - Distance",
  "Online - Distance",
  "Other",
  "Placement",
  "Probationary",
  "Promotion",
  "Pull-Out",
  "Push-In",
  "Reassigned Work",
  "Research/R&D",
  "Reskilling/CPD/CMP",
  "Rework",
  "Rotation",
  "Scaffolding",
  "Seminar",
  "Study Abroad",
  "Summer Program",
  "Training for Trainees",
  "Training for Trainers",
  "Work",
  "Workshop",
  "Work-Study",
];

const INDIRECT_DELIVERY = [
  "After Unit Operations (MISC)",
  "Before Unit Operations (MISC)",
  "Sensitivity or Exploratory Checking",
  "Pre-Employment",
];

const DIRECT_DELIVERY = [
  "During Unit Operations (on-site)",
  "During Unit Operations (practice)",
  "During Unit Operations (remote)",
  "During Unit Operations (training)",
];

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


const UnitEditor = ({ unitId, candidate, onClose, showUnitForm, showEditBlockManager, activeTab, showUnitRoster, onSave, selectedBlock, onBlockUpdate, onBlockSubmitStatus }) => {
  const [unit, setUnit] = useState({
    unitName: "",
    unitId: "",
    startDate: "",
    endDate: "",
    unitDirector: "",
    unitType: "",
    signatureProfile: "",
    environment: "",
    scoringSystem: "",
    benchmarks: []
  });
  const [unitDirectors, setUnitDirectors] = useState([]);
  const staffLookupRef = useRef(null);
  const [blockData, setBlockData] = useState({
    ppId: "",
    periodType: "",
    shortDescription: "",
    delivery: "",
    manageType: "",
  });
  const [lookupFor, setLookupFor] = useState(null);
  const [showLookup, setShowLookup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { setFormStatus } = useFormStatus();

  // Fetch unit data when unitId changes
  useEffect(() => {
    const fetchUnitData = async () => {
      if (!unitId) return;
      
      try {
        setIsLoading(true);
        const unitData = await getUnitById(unitId);
        console.log("unit data fetched -->", unitData);
        // Transform API data to match form state
        setUnit({
          unitName: unitData.unitName,
          unitId: unitData.unitId,
          startDate: unitData.unitStartDate,
          endDate: unitData.unitEndDate,
          unitDirector: unitData.unitDirector,
          unitType: unitData.unitType,
          signatureProfile: unitData.signatureProfile,
          environment: unitData.environment,
          scoringSystem: unitData.scoringSystem || "",
          benchmarks: (unitData.benchmarks || []).map(bm => ({
            id: bm.id,
            benchmarkId: bm.benchmarkId,
            benchmarkType: bm.benchmarkType || "",
            benchmarkRef: bm.benchmarkRef || "",
            benchmarkDescription: bm.benchmarkDescription || ""
          }))
        });
      } catch (err) {
        console.error("Failed to fetch unit data:", err);
        setError("Failed to load unit data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnitData();
  }, [unitId]);

 

  useEffect(() => {
    if (selectedBlock) {
      setBlockData({
        ppId: selectedBlock.ppId || "",
        periodType: selectedBlock.periodType || PERIOD_TYPES[0],
        shortDescription: selectedBlock.shortDescription || "",
        delivery: selectedBlock.delivery || (activeTab === "Direct" ? DIRECT_DELIVERY[0] : INDIRECT_DELIVERY[0]),
        manageType: selectedBlock.manageType || "",
      });
    }
  }, [selectedBlock]);

  const handleChange = (field, value) => {
    setUnit((prev) => ({ ...prev, [field]: value }));
  };

  const handleStaffSelect = (selectedStaffArray) => {
    if (lookupFor === "leaders") {
      const leaderIds = selectedStaffArray.map((s) => s.id);
      handleChange("assignedLeaders", leaderIds);
  
      // Update unitDirectors dropdown to match selected leaders
      setUnitDirectors(selectedStaffArray);
      
      // If there's only one leader selected, auto-set them as unit director
      if (selectedStaffArray.length === 1 && !unit.unitDirector) {
        handleChange("unitDirector", selectedStaffArray[0].id);
      }
      
    } else if (lookupFor === "assessors") {
      handleChange(
        "assignedAssessors",
        selectedStaffArray.map((s) => s.id)
      );
    } else if (lookupFor === "director") {
      handleChange("unitDirector", selectedStaffArray[0]?.id || "");
      setShowLookup(false);
      setLookupFor(null);
    }
  
    setShowLookup(false);
    setLookupFor(null);
  };
 
  // Handle benchmark field change
  const handleBenchmarkChange = (index, field, value) => {
    setUnit(prevUnit => {
      const updated = [...prevUnit.benchmarks];
      updated[index][field] = value;
      return { ...prevUnit, benchmarks: updated };
    });
  };

  console.log('selected Unit-->', unitId);
  const addBenchmark = () => {
    setUnit(prev => {
      // Get the current benchmarks
      const benchmarks = prev.benchmarks || [];
  
      // Find the last benchmarkId (fallback to 0 if none)
      let lastId = 0;
      if (benchmarks.length > 0) {
        const lastBenchmark = benchmarks[benchmarks.length - 1];
        const lastBenchmarkId = parseInt(lastBenchmark.benchmarkId, 10);
        if (!isNaN(lastBenchmarkId)) {
          lastId = lastBenchmarkId;
        }
      }
  
      // Create new benchmark with incremented benchmarkId
      const newBenchmark = {
        id: null,
        benchmarkId: (lastId + 1).toString(), // auto increment for UX
        benchmarkType: "",
        benchmarkRef: "",
        benchmarkDescription: "",
      };
  
      return {
        ...prev,
        benchmarks: [...benchmarks, newBenchmark],
      };
    });
  };
  

  // Delete a benchmark at a specific index
  const deleteBenchmark = (index) => {
    setUnit(prevUnit => {
      const updated = prevUnit.benchmarks.filter((_, i) => i !== index);
      // Reassign sequential IDs (1, 2, 3, ...)
    const reordered = updated.map((bm, i) => ({
      ...bm,
      benchmarkId: (i + 1).toString(),
    }));

    return {
      ...prevUnit,
      benchmarks: reordered,
    };
    });
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus("Processing..."); 
    setError(null);

    try {
      // Prepare the data for API
      const updatedUnit = {
        unitName: unit.unitName,
        unitId: unit.unitId,
        unitStartDate: unit.startDate,
        unitEndDate: unit.endDate,
        unitDirector: unit.unitDirector,
        unitType: unit.unitType,
        signatureProfile: unit.signatureProfile,
        environment: unit.environment,
        scoringSystem: unit.scoringSystem,
        benchmarks: unit.benchmarks
      };

      // Call API to update
      const savedUnit = await updateUnit(unitId, updatedUnit);
      
      // Notify parent component
      onSave(savedUnit);
      console.log(savedUnit);
      onClose();
    } catch (err) {
      console.error("Failed to update unit:", err);
      setError(err.response?.data?.message || "Failed to update unit");
      setFormStatus("Ready..."); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBlock = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    try {
      if (!blockData || !selectedBlock) return;
  
      // Call API to update the block
      const savedBlock = await updateAssessmentBlock(selectedBlock.id, blockData);
  
      // Notify parent about the updated block
      if (onBlockUpdate) {
        onBlockUpdate(savedBlock);
      }
  
      if (onBlockSubmitStatus) {
        onBlockSubmitStatus(true);
      }
  
      onClose();
    } catch (err) {
      console.error("Failed to update unit:", err);
  
      const message =
        err.response?.data?.message ||
        err.data?.message ||
        err.message ||
        "Failed to update unit";
  
      setError(message);
  
      if (onBlockSubmitStatus) {
        onBlockSubmitStatus(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  


  return (
    <div className="h-full flex flex-col bg-white border border-gray-200">
      {/* Header */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
          <Edit className="w-5 h-5" />
          Entity Editor
        </div>
      </div>

      {/* {!showUnitForm && !showEditBlockManager && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 text-sm">No unit selected.</div>
        </div>
      )} */}

      {showUnitForm && !showUnitRoster &&(
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto flex flex-col">
          {/* Scrollable form area */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-[140px_auto] gap-x-2 gap-y-3 text-sm items-center">
              {[
                { label: "Unit Name", key: "unitName" },
                { label: "Unit ID", key: "unitId" },
                { label: "Start Date", key: "startDate", type: "date" },
                { label: "End Date", key: "endDate", type: "date" },
              ].map(({ label, key, type }) => (
                <React.Fragment key={key}>
                  <label className="text-gray-700 font-medium text-xs">{label}:</label>
                  <input
                    name={key}
                    value={unit[key] || ""}
                    onFocus={() => setFormStatus("Editing...")}
                    onBlur={() => setFormStatus("Ready...")}
                    onChange={(e) => handleChange(key, e.target.value)}
                    type={type || "text"}
                    className="w-full border border-gray-300 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                </React.Fragment>
              ))}

              {/* Staff Assignment */}
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
                  className="px-1 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm"
                >
                  + Add Assessor
                </button>
                <div className="text-sm text-gray-700">
                  {/* {form.assignedAssessors?.length || 0} selected */}
                  Max 3
                </div>
              </div>

              <label className="col-span-1 flex items-center text-gray-700">
                Unit Director:
              </label>
              <select
                required
                value={unit.unitDirector || ""}
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

              <label className="text-gray-700 font-medium text-xs">Unit Type:</label>
              <input
                    name="unitType"
                    disabled
                    value={unit.unitType || ""}
                    onFocus={() => setFormStatus("Editing...")}
                    onBlur={() => setFormStatus("Ready...")}
                    type="text"
                    className="w-full border border-gray-300 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
             

              <label className="text-gray-700 font-medium text-xs">Signature Profile:</label>
              <input
                    name="signatureProfile"
                    disabled
                    value={unit.signatureProfile || ""}
                    onFocus={() => setFormStatus("Editing...")}
                    onBlur={() => setFormStatus("Ready...")}
                    type="text"
                    className="w-full border border-gray-300 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
              

              <label className="text-gray-700 font-medium text-xs">Environment:</label>
              <input
                    name="environment"
                    disabled
                    value={unit.environment || ""}
                    onFocus={() => setFormStatus("Editing...")}
                    onBlur={() => setFormStatus("Ready...")}
                    type="text"
                    className="w-full border border-gray-300 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
            
              {unit.environment === "Workforce" && (
                <>
                  <label className="text-gray-700 font-medium text-xs">Scoring System:</label>
                  <input
                    name="scoringSystem"
                    disabled
                    value={unit.scoringSystem || ""}
                    onFocus={() => setFormStatus("Editing...")}
                    onBlur={() => setFormStatus("Ready...")}
                    type="text"
                    className="w-full border border-gray-300 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                 
                </>
              )}
            </div>

            {/* Benchmarks Section - Now using table format like irregularities */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="pb-2 font-semibold text-gray-800 text-base">Unit Benchmarks</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="whitespace-nowrap border border-gray-300 px-8 py-1 text-left">BID</th>
                      <th className="whitespace-nowrap border border-gray-300 px-2 py-1 text-left">Benchmark Type</th>
                      <th className="whitespace-nowrap border border-gray-300 px-2 py-1 text-left">Benchmark Ref</th>
                      <th className="whitespace-nowrap border border-gray-300 px-2 py-1 text-left">Description</th>
                      <th className="whitespace-nowrap border border-gray-300 px-2 py-1 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unit.benchmarks.map((bm, index) => (
                      <tr key={index} className="even:bg-gray-50">
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <input
                            disabled
                            type="text"
                            value={bm.benchmarkId}
                            onFocus={() => setFormStatus("Editing...")}
                            onBlur={() => setFormStatus("Ready...")}
                            onChange={(e) => handleBenchmarkChange(index, "benchmarkId", e.target.value)}
                            className="w-full px-2 py-1 border text-center"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <select
                            value={bm.benchmarkType}
                            onFocus={() => setFormStatus("Editing...")}
                            onBlur={() => setFormStatus("Ready...")}
                            onChange={(e) => handleBenchmarkChange(index, "benchmarkType", e.target.value)}
                            className="w-full px-2 py-1 border"
                          >
                            <option value="">Select Type</option>
                            {BENCHMARK_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <input
                            type="text"
                            value={bm.benchmarkRef}
                            onFocus={() => setFormStatus("Editing...")}
                            onBlur={() => setFormStatus("Ready...")}
                            onChange={(e) => handleBenchmarkChange(index, "benchmarkRef", e.target.value)}
                            className="w-full px-2 py-1 border"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <input
                            type="text"
                            value={bm.benchmarkDescription}
                            onFocus={() => setFormStatus("Editing...")}
                onBlur={() => setFormStatus("Ready...")}
                            onChange={(e) => handleBenchmarkChange(index, "benchmarkDescription", e.target.value)}
                            className="w-full px-2 py-1 border"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); deleteBenchmark(index)}}
                            className="px-1 py-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={addBenchmark}
                className="flex items-center gap-2 mt-3 px-3 py-2 bg-gray-200 text-black hover:bg-gray-300 text-sm"
              >
                + Add Benchmark
              </button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className=" p-2 ">
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </form>
      )}

      {showEditBlockManager && (
        <form onSubmit={handleSaveBlock} className="flex-1 overflow-auto flex flex-col">
          {/* Scrollable form area */}
          <div className="flex-1 p-4">
            <div  className="grid grid-cols-[140px_auto] gap-x-2 gap-y-3 text-sm items-center">
              {/* Period Type */}

              <label className="col-span-1 flex items-center text-gray-700">
                Period Type:
              </label>
              <div className="flex items-center gap-2">
                <select className="w-full border px-2 py-0.5" 
                  onFocus={() => setFormStatus("Editing...")}
                  onBlur={() => setFormStatus("Ready...")}
                  value={blockData?.periodType}
                  onChange={(e) => setBlockData(prev => ({ ...prev, periodType: e.target.value }))} >
                  {PERIOD_TYPES.map((type, i) => (
                    <option key={`direct-period-${i}`}>{type}</option>
                  ))}
                </select>
              </div>


              {/* Short Description */}

              <label className="col-span-1 flex items-center text-gray-700">
                Short Description:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter short description"
                  name="shortDescription"
                  value={blockData?.shortDescription}
                  onFocus={() => setFormStatus("Editing...")}
                  onBlur={() => setFormStatus("Ready...")}
                  onChange={(e) => setBlockData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  className="col-span-1 border border-black px-2 py-1 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 w-full"
                />
              </div>


              {/* Delivery */}
              {/* {activeTab === "Direct" && ( */}
                <>
                  <label className="col-span-1 flex items-center text-gray-700">
                    Delivery:
                  </label>
                  <div className="flex items-center gap-2">
                    <select className="w-full border px-2 py-0.5" 
                      value={blockData?.delivery}
                      onFocus={() => setFormStatus("Editing...")}
                      onBlur={() => setFormStatus("Ready...")}
                      onChange={(e) => setBlockData(prev => ({ ...prev, delivery: e.target.value }))} >
                      {activeTab === "Direct"
                          ? DIRECT_DELIVERY.map((type, i) => <option key={i}>{type}</option>)
                          : INDIRECT_DELIVERY.map((type, i) => <option key={i}>{type}</option>)
                        }
                    </select>
                  </div>
                </>
              {/* )} */}

              {/* {activeTab === "Indirect" && (
                <>
                  <label className="col-span-1 flex items-center text-gray-700">
                    Delivery:
                  </label>
                  <div className="flex items-center gap-2">
                    <select className="w-full border px-2 py-0.5">
                      {INDIRECT_DELIVERY.map((type, i) => (
                        <option key={`direct-period-${i}`}>{type}</option>
                      ))}
                    </select>
                  </div>
                </>
              )} */}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-gray-200 p-2 bg-gray-50">
            <div className="flex justify-end">
              <button
                type="submit"
                // onClick={handleSaveBlock}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </form>
      )}

{
        showLookup && (
          <StaffLookup
            
            onClose={(e) => {
              setShowLookup(false);
              setLookupFor(null);
            }}
            onSelect={handleStaffSelect} // reuse handleStaffSelect
            selectedIds={
              lookupFor === "leaders"
                ? unit.assignedLeaders || []
                : lookupFor === "assessors"
                ? unit.assignedAssessors || []
                : lookupFor === "director"
                ? unit.unitDirector
                  ? [unit.unitDirector]
                  : []
                : []
            }
          />
        )
      }

    </div>
  );

};

export default UnitEditor;