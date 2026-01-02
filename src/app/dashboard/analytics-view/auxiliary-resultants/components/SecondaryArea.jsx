"use client";
import { getEffortBu } from "@/services/auxiliaryService";
import { Edit, X } from "lucide-react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SecondaryInputForm = ({ onClose, selectedSort, onSubmit, resetSignal, unitId, candidateId, selectedChartKey }) => {
  const [ppIdFrom, setPpIdFrom] = useState(-3);
  const [ppIdTo, setPpIdTo] = useState(3);
  const [criticalDateFrom, setCriticalDateFrom] = useState("");
  const [criticalDateTo, setCriticalDateTo] = useState("");
  const [thresholdEnabled, setThresholdEnabled] = useState(false);
  const [csdEffort, setCsdEffort] = useState("");
  const [usdEffort, setUsdEffort] = useState("");


  useEffect(() => {
    setPpIdFrom(-3);
    setPpIdTo(3);
    setCriticalDateFrom("");
    setCriticalDateTo("");
    setThresholdEnabled(false);
  }, [resetSignal]);

  // Sample effort values
  // const csdEffort = "1.234";
  // const usdEffort = "5.678";

  // useEffect(() => {
  //   const fetchEffortData = async () => {
  //     try {
  //       if (!selectedChartKey) return;
  
  //       // Only fetch for Butler-related charts
  //       if (selectedChartKey === "bp-csd" || selectedChartKey === "bp-usd") {
  //         const response = await getEffortBu(unitId, candidateId);
  
  //         // based on your API response shape
  //         const { data } = response;
  
  //         setCsdEffort(data?.CSD ?? "");
  //         setUsdEffort(data?.USD ?? "");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching effort data:", error);
  //       setCsdEffort("");
  //       setUsdEffort("");
  //     }
  //   };
  
  //   fetchEffortData();
  // }, [selectedChartKey, unitId, candidateId]);
  

  const fetchEffort = async (filters) => {
    try {
      if (!selectedChartKey) return;
  
      if (selectedChartKey === "bp-csd" || selectedChartKey === "bp-usd") {
        const response = await getEffortBu(unitId, candidateId, filters);
  
        setCsdEffort(response?.data?.CSD ?? "");
        setUsdEffort(response?.data?.USD ?? "");
  
        console.log("EFFORT RESPONSE:", response);
      }
    } catch (error) {
      console.error("Error fetching effort BU:", error);
      setCsdEffort("");
      setUsdEffort("");
    }
  };

  useEffect(() => {
    // load with default filters
    const defaultFilters = {
      ppIdFrom,
      ppIdTo,
      criticalDateFrom,
      criticalDateTo
    };
  
    fetchEffort(defaultFilters);
  }, [selectedChartKey, unitId, candidateId]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (ppIdFrom !== "" && ppIdTo !== "" && ppIdFrom > ppIdTo) {
      alert("PP ID From cannot be greater than To");
      return;
    }
  
    const filters = {
      ppIdFrom,
      ppIdTo,
      criticalDateFrom,
      criticalDateTo
    };
  
    onSubmit(filters); 
    fetchEffort(filters); 
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
              <label htmlFor="" className="w-1/2">From:</label>
              <input
                type="date"
                value={criticalDateTo}
                onChange={(e) => setCriticalDateTo(e.target.value)}
                className="border px-2 py-1 w-full" />
            </div>
          </div>
        </div>

        {/* Effort Fields – only show if candidate level */}
        {selectedSort === "activateCandidateLevel" && selectedChartKey && (
          <>
            {selectedChartKey === "bp-csd"  && (
              <div className="gap-1 text-xs p-2 w-full">
                <label className="block font-medium text-gray-700 mb-1">
                  Effort – CSD
                </label>
                <input
                  type="text"
                  value={csdEffort}
                  disabled
                  className="border px-2 py-1 w-full text-gray-600"
                />
              </div>
            )}

            {selectedChartKey === "bp-usd" && (
              <div className="gap-1 text-xs p-2 w-full">
                <label className="block font-medium text-gray-700 mb-1">
                  Effort – USD
                </label>
                <input
                  type="text"
                  value={usdEffort}
                  disabled
                  className="border px-2 py-1 w-full text-gray-600"
                />
              </div>
            )}
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
