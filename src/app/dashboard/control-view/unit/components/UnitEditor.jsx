"use client";
import React, { useEffect, useState } from "react";
import { Edit } from "lucide-react";
import { getUnitById, updateUnit } from "@/services/unitService";
import { updateAssessmentBlock } from "@/services/assessmentBlockManagerService";
import { useFormStatus } from "@/context/FormStatusContext";



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

  const [blockData, setBlockData] = useState({
    ppId: "",
    periodType: "",
    shortDescription: "",
    delivery: "",
    manageType: "",
  });
  

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

   // const [formStatus, setFormStatus] = useState("Ready");
   const { setFormStatus } = useFormStatus();

   // Fetch unit data when unitId changes
   useEffect(() => {
    const fetchUnitData = async () => {
      if (!unitId) return;
      
      try {
        setIsLoading(true);
        const unitData = await getUnitById(unitId);
        
        // Transform API data to match form state
        setUnit({
          unitName: unitData.unitName,
          unitId: unitData.unitId,
          startDate: unitData.unitStartDate, // Map API field to form field
          endDate: unitData.unitEndDate,     // Map API field to form field
          unitDirector: unitData.unitDirector,
          unitType: unitData.unitType,
          signatureProfile: unitData.signatureProfile,
          environment: unitData.environment,
          scoringSystem: unitData.scoringSystem || "",
          benchmarks: unitData.benchmarks || []
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
        periodType: selectedBlock.periodType || "",
        shortDescription: selectedBlock.shortDescription || "",
        delivery: selectedBlock.delivery || "",
        manageType: selectedBlock.manageType || "",
      });
    }
  }, [selectedBlock]);
  


  const handleChange = (field, value) => {
    setUnit((prev) => ({ ...prev, [field]: value }));
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
        unitStartDate: unit.startDate, // Map form field to API field
        unitEndDate: unit.endDate,     // Map form field to API field
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
  
      // Notify parent component
      // onSave(savedBlock);
      // console.log("Saved block:", savedBlock);

      if (onBlockSubmitStatus) {
        onBlockSubmitStatus(true); // success
      }

      
      onClose();
    } catch (err) {
      console.error("Failed to update unit:", err);
    
      // Handle different error shapes
      const message =
        err.response?.data?.message || // Axios-like
        err.data?.message ||           // your fetch API shape
        err.message ||                 // generic JS error
        "Failed to update unit";
    
      setError(message);

      if (onBlockSubmitStatus) {
        onBlockSubmitStatus(false); // failure
      }
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
                { label: "End Date", key: "endDate" },
              ].map(({ label, key, type }) => (
                <React.Fragment key={key}>
                  <label className="text-gray-700 font-medium text-xs">{label}:</label>
                  <input
                    name={key}
                    value={unit[key] || ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                    type={type || "text"}
                    className="w-full border border-gray-300 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                </React.Fragment>
              ))}

              <label className="text-gray-700 font-medium text-xs">Unit Type:</label>
              <select
                name="unitType"
                disabled
                value={unit.unitType || ""}
                onChange={(e) => handleChange("unitType", e.target.value)}
                className="w-full border border-gray-300 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              >
                <option value="">Select Unit Type</option>
                <option value="Communicative I/O">Communicative I/O</option>
                <option value="Theory & Practice">Theory & Practice</option>
                <option value="Third Parameter">Third Parameter</option>
              </select>

              <label className="text-gray-700 font-medium text-xs">Signature Profile:</label>
              <select
                name="signatureProfile"
                disabled
                value={unit.signatureProfile || ""}
                onChange={(e) => handleChange("signatureProfile", e.target.value)}
                className="w-full border border-gray-300 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              >
                <option value="">Select Profile</option>
                <option value="Case 1: Solid Balanced">Case 1: Solid Balanced</option>
                <option value="Case 2: Rigorous Balanced">Case 2: Rigorous Balanced</option>
                <option value="Case 3a: Productive-Weighted">Case 3a: Productive-Weighted</option>
                <option value="Case 3b: Receptive-Weighed">Case 3b: Receptive-Weighed</option>
              </select>

              <label className="text-gray-700 font-medium text-xs">Environment:</label>
              <select
                name="environment"
                disabled
                value={unit.environment || ""}
                onChange={(e) => handleChange("environment", e.target.value)}
                className="w-full border border-gray-300 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              >
                <option value="">Select Environment</option>
                <option value="Workforce">Workforce</option>
                <option value="Classroom">Classroom</option>
              </select>

              {unit.environment === "Workforce" && (
                <>
                  <label className="text-gray-700 font-medium text-xs">Scoring System:</label>
                  <select
                    name="scoringSystem"
                    disabled
                    value={unit.scoringSystem || ""}
                    onChange={(e) => handleChange("scoringSystem", e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  >
                    <option value="">Select System</option>
                    <option value="3-Point">3-Point</option>
                    <option value="5-Point">5-Point</option>
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-gray-200 p-2 bg-gray-50">
            <div className="flex justify-end">
              <button
                type="submit"
                // onClick={onClose}
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
                  value={blockData?.periodType || ""}
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
                  value={blockData?.shortDescription || ""}
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
                      value={blockData?.delivery || ""}
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

    </div>
  );

};

export default UnitEditor;