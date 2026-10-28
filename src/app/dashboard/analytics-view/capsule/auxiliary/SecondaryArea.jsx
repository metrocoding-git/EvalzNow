"use client";
import { getAssessmentChainById, getEffortBu, updateAssessmentChain } from "@/services/capsuleAuxiliaryService";
import { getCapsuleInsertScoresForUnitScreens as getInsertScoreByUnitAndCandidate } from "@/services/capsuleAnalyticsService";
import { getCapsuleSummaryForUnitScreens as getUnitAndMultipleCandidateSummary } from "@/services/capsuleAnalyticsService";
import { Edit, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SecondaryInputForm = ({ onClose, selectedSort, onSubmit, resetSignal, unitId, candidateId, selectedChartKey, selectedAssessmentChain, 
  activeChainId, onSuccess  }) => {
  const [ppIdFrom, setPpIdFrom] = useState("");
  const [ppIdTo, setPpIdTo] = useState("");
  const [criticalDateFrom, setCriticalDateFrom] = useState("");
  const [criticalDateTo, setCriticalDateTo] = useState("");
  const [thresholdEnabled, setThresholdEnabled] = useState(false);
  const [csdEffort, setCsdEffort] = useState("");
  const [usdEffort, setUsdEffort] = useState("");
  const [tableData, setTableData] = useState([]);
  const [fetchedChain, setFetchedChain] = useState([]);
  const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

  useEffect(() => {
    setPpIdFrom("");
    setPpIdTo("");
    setCriticalDateFrom("");
    setCriticalDateTo("");
    setThresholdEnabled(false);
  }, [resetSignal]);

  useEffect(() => {
    const fetchData = async () => {
      if (!unitId || !candidateId) {
        setTableData([]);
        return;
      }
  
      setLoading(true);
      setError(null);
  
      try {
        // 1️⃣ Fetch tabulation data
        const tabulationRes = await getUnitAndMultipleCandidateSummary({
          unitId,
          candidate_id: candidateId,
        });
  
        const tabResults = tabulationRes.results || [];
        console.log("Tabulation Results:", tabResults);
  
        // 2️⃣ Fetch insert score data
        const insertScoreRes = await getInsertScoreByUnitAndCandidate(unitId, candidateId);
  
        const insertResults = insertScoreRes || [];
        console.log("Insert Score Results:", insertResults);
        // 3️⃣ Build lookup map: ppId → assessmentBlockId
        const ppToBlockMap = {};
        insertResults.forEach(row => {
          if (row.ppId !== 0 && row.assessmentBlockId) {
            ppToBlockMap[row.ppId] = row.assessmentBlockId;
          }
        });
  
        // 4️⃣ Merge datasets by ppId
        const mergedData = tabResults
          .filter(row => row.ppId !== 0 && ppToBlockMap[row.ppId])
          .map(row => ({
            ppId: row.ppId,
            assessmentBlockId: ppToBlockMap[row.ppId],
            RRN: row.RRN ?? 0,
            PRN: row.PRN ?? 0,
            ARN: row.ARN ?? 0,
            IC: row.IC ?? null,
          }));
  
        setTableData(mergedData);
  
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data");
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [unitId, candidateId]);
  
  const [chainForm, setChainForm] = useState({
    selection1: null,
    selection2: null,
    selection3: null,
    selection4: null,
    selection5: null,
  });

  useEffect(() => {
    const fetchChain = async () => {
      try {
        if (!selectedAssessmentChain) return;
  
        const res = await getAssessmentChainById(selectedAssessmentChain);
  
        console.log("CHAIN BY ID:", res.data);
  
        setFetchedChain(res.data);
  
      } catch (err) {
        console.error("Failed to fetch chain by id", err);
      }
    };
  
    fetchChain();
  }, [selectedAssessmentChain]);

  useEffect(() => {
    if (fetchedChain?.selections) {
  
      const mapped = {
        selection1: null,
        selection2: null,
        selection3: null,
        selection4: null,
        selection5: null,
      };
  
      fetchedChain.selections.forEach((sel) => {
        mapped[`selection${sel.selectionNumber}`] = {
          blockId: sel.blockId,
          ppId: sel.ppId,
        };
      });
  
      setChainForm(mapped);
    }
  }, [fetchedChain]);
  

  const ppIdList = tableData.map(item => ({
    blockId: item.assessmentBlockId,
    ppId: item.ppId
  }));

  const handleChainChange = (label, value) => {
    const selectedItem = ppIdList.find(
      (item) => item.blockId === Number(value)
    );
  
    setChainForm((prev) => ({
      ...prev,
      [label]: selectedItem || null,
    }));
  };

  const getAvailablePpIds = (currentKey) => {
    const selectedBlockIds = Object.entries(chainForm)
      .filter(([key, val]) => key !== currentKey && val)
      .map(([_, val]) => val.blockId);
  
    return ppIdList.filter(
      item => !selectedBlockIds.includes(item.blockId)
    );
  };

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

  const fetchAssessmentChain = async () => {
    try {
      if (!selectedChartKey) return;

      if (selectedChartKey === "nac") {

      }

    } catch (error) {
      console.error("Error fetching assessment chain:", error);
    }
  }

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
  
  
  const handleChainSubmit = async () => {
    try {
      const payload = {
        selection1: chainForm.selection1?.blockId || null,
        selection2: chainForm.selection2?.blockId || null,
        selection3: chainForm.selection3?.blockId || null,
        selection4: chainForm.selection4?.blockId || null,
        selection5: chainForm.selection5?.blockId || null,
      };
  
      console.log("UPDATE PAYLOAD:", payload);
  
      await updateAssessmentChain(
        selectedAssessmentChain,
        payload
      );
  
      // refresh UI
      onSubmit(payload);
      onSuccess && onSuccess();
  
      alert("Chain updated successfully");
  
    } catch (err) {
      console.error(err);
      alert("Failed to update chain");
    }
  };
  
  const isDisabled = (key) => {
    const order = ["selection1","selection2","selection3","selection4","selection5"];
    const index = order.indexOf(key);
  
    return order.slice(0, index).some(k => !chainForm[k]);
  };
  return (

    <>
      {/* 🔹 Assessment Chain Mode */}
      {selectedChartKey === "nac" && selectedAssessmentChain ? (
        <div className="flex flex-col h-full bg-white">

          {/* Header */}
          <div className="flex justify-between items-center bg-gray-100 px-4 py-2 border-b border-gray-300">
            <div className="flex items-center text-sm gap-2 text-gray-800 font-semibold">
              <Edit className="w-5 h-5" />
              Secondary Input Area
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-4 py-3">

              <p className="text-xs font-semibold text-gray-800 pb-3">
                 Assessment Chain {activeChainId}
              </p>
            <div className="grid grid-cols-2 gap-2 text-sm max-w-xl">

              
              {["selection1","selection2","selection3","selection4","selection5"].map((key, idx) => (
                <React.Fragment key={key}>
                  <label className="text-gray-700">
                    Selection {idx + 1}
                  </label>

                  <select
                    value={chainForm[key]?.blockId || ""}
                    onChange={(e) => handleChainChange(key, e.target.value)}
                    className="border px-2 py-1"
                  >
                    <option value="" disabled>Select PP ID</option>
                    {getAvailablePpIds(key).map(item => (
                      <option key={item.blockId} value={item.blockId}>
                        {item.ppId}
                      </option>
                    ))}
                  </select>
                </React.Fragment>
              ))}

            </div>
          </div>

          {/* Footer */}
          <div className=" p-2 bg-gray-50 flex justify-end">
            <button
              onClick={handleChainSubmit}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-sm"
            >
              Edit
            </button>
          </div>

        </div>
      ) : (
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
      )}
    </>
    
  );
};

export default SecondaryInputForm;
