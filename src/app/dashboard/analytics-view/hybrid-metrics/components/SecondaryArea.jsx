"use client";
import { Edit } from "lucide-react";
import { useEffect, useState } from "react";

const SecondaryInputForm = ({ onClose, selectedSort, isSelectedInteractionClass, onSubmit, resetSignal }) => {
  const [ppIdFrom, setPpIdFrom] = useState(-3);
  const [ppIdTo, setPpIdTo] = useState(3);
  const [criticalDateFrom, setCriticalDateFrom] = useState("");
  const [criticalDateTo, setCriticalDateTo] = useState("");
  const [thresholdEnabled, setThresholdEnabled] = useState(false);
  const [showGrowthTarget, setShowGrowthTarget] = useState(false);
  const [selectedPpId, setSelectedPpId] = useState(null);
  const [unitMode, setUnitMode] = useState("averages"); // "averages" or "target"

  // sample PP IDs
  const ppIds = [-3, -2, -1, 1, 2, 3];

  useEffect(() => {
    setPpIdFrom(-3);
    setPpIdTo(3);
    setCriticalDateFrom("");
    setCriticalDateTo("");
    setThresholdEnabled(false);
  }, [resetSignal]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const values = {
      ppIdFrom,
      ppIdTo,
      criticalDateFrom,
      criticalDateTo,
      thresholdEnabled,
    };

    onSubmit(values);
    // setSecondaryValues(values);
    // console.log("Submitted:", { ppIdFrom, ppIdTo, criticalDate });
    // You can add fetch or state update logic here
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Section Header */}
      <div className="flex justify-between items-center bg-gray-100 px-4 py-1 border-b border-gray-300">
        <div className="flex items-center text-sm gap-2 text-gray-800 font-semibold">
          <Edit className="w-5 h-5" />
          Secondary Input Area
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-1 text-sm">
        {/* PP ID Range */}
        <div className="gap-1 text-xs p-2">
          <label className="block font-medium text-gray-700 mb-1">
            PP ID Range
          </label>

          <div className="flex flex-col gap-2">
            <div className="flex items-center ">
              <label htmlFor="" className="w-1/2">From:</label>
              <input
                type="number"
                value={ppIdFrom}
                onChange={(e) => {
                  const val = e.target.value;
                  setPpIdFrom(val === "" ? "" : parseInt(val));
                }}
                className="border px-2 py-1 w-full"
                placeholder="From (e.g., -3)"
              />
            </div>

            <div className="flex items-center ">
              <label htmlFor="" className="w-1/2">To:</label>
              <input
                type="number"
                value={ppIdTo}
                onChange={(e) => {
                  const val = e.target.value;
                  setPpIdTo(val === "" ? "" : parseInt(val));
                }} 
                className="border px-2 py-1 w-full"
                placeholder="To (e.g., 3)"
              />
            </div>

          </div>
        </div>


        {/* Critical Reference Date */}
        <div className="w-full gap-1 text-xs p-2">
          <label className="block font-medium text-gray-700 mb-1">
            Critical Reference Range
          </label>

          <div className="flex flex-col gap-2">
            <div className="flex items-center ">
              <label htmlFor="" className="w-1/2">From:</label>
              <input
                type="date"
                value={criticalDateFrom}
                onChange={(e) => setCriticalDateFrom(e.target.value)}
                className="border px-2 py-1 w-full" />
            </div>

            <div className="flex items-center ">
              <label htmlFor="" className="w-1/2">To:</label>
              <input
                type="date"
                value={criticalDateTo}
                onChange={(e) => setCriticalDateTo(e.target.value)}
                className="border px-2 py-1 w-full" />
            </div>
          </div>
        </div>

        {/* Threshold Toggle (only show if isSelectedInteractionClass is true) */}
        {isSelectedInteractionClass && (
          <div className="flex items-center justify-between p-2">
            <label className="font-medium text-gray-800">Enable Thresholds</label>
            <div
              onClick={() => setThresholdEnabled(!thresholdEnabled)}
              className="relative w-12 h-6 cursor-pointer"
            >
              <div
                className={`absolute inset-0 rounded-full transition-colors duration-300 ${thresholdEnabled ? "bg-gray-600" : "bg-gray-300"
                  }`}
              />
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${thresholdEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
              />
            </div>
          </div>
        )}


        {/* Candidate Level Options */}
        {selectedSort === "activateCandidateLevel" && !isSelectedInteractionClass && (
          <>
            {/* Growth Target Toggle */}
            <div className="flex items-center justify-between p-2">
              <label className="font-medium text-gray-800">
                Show Growth Target
              </label>
              <div
                onClick={() => setShowGrowthTarget(!showGrowthTarget)}
                className="relative w-12 h-6 cursor-pointer"
              >
                <div
                  className={`absolute inset-0 rounded-full transition-colors duration-300 ${showGrowthTarget ? "bg-gray-600" : "bg-gray-300"
                    }`}
                />
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${showGrowthTarget ? "translate-x-6" : "translate-x-0"
                    }`}
                />
              </div>
            </div>


          </>
        )}

        {/* Unit Level Options */}
        {selectedSort === "activateUnitLevel" && !isSelectedInteractionClass && (
          <>
            {/* Mode Switch */}
            <div className="p-2">
              <label className="block font-medium text-gray-700 mb-1">
                Select Mode
              </label>
              <select
                value={unitMode}
                onChange={(e) => setUnitMode(e.target.value)}
                className="border px-2 py-1 w-full"
              >
                <option value="averages">Individual PP ID Averages</option>
                <option value="target">PP ID Target</option>
              </select>
            </div>



            <div className="p-2">
              <label className="block font-medium text-gray-700 mb-1">
                Enter Target PP ID
              </label>
              <input
                type="number"
                value={selectedPpId ?? ""}
                onChange={(e) => setSelectedPpId(parseInt(e.target.value))}
                className="border px-2 py-1 w-full"
                placeholder="Enter -/+ PP ID"
              />
            </div>

          </>
        )}
      </div>

      {/* Submit Button */}
      <div className="border-t border-gray-200 p-2 bg-gray-50">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecondaryInputForm;
