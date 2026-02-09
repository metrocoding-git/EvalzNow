"use client";
import { createAssessmentChain, createCandidateMarks } from "@/services/auxiliaryService";
import { getInsertScoreByUnitAndCandidate } from "@/services/insertScoreService";
import { getUnitAndMultipleCandidateSummary } from "@/services/tabulationTableService";
import { ListFilterPlus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const impactTypes = ["Negative", "Positive"];

const concernResolved = ["Yes", "No"];

export default function CreateChainForm({ onClose, onSuccess , unitId, candidateId}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
      selection1: null,
      selection2: null,
      selection3: null,
      selection4: null,
      selection5: null,
    });
    
  const [tableData, setTableData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (label, value) => {
    const selectedItem = ppIdList.find(
      (item) => item.blockId === Number(value)
    );
  
    setForm((prev) => ({
      ...prev,
      [label]: selectedItem || null,
    }));
  };
  

  // Validate required fields
  

  const isFormValid = () => {
    return form.selection1 !== null;
  };
  

  const getMinPpId = (prevSelection) => {
    return prevSelection ? prevSelection.ppId : -Infinity;
  };

  // Function to get next valid ppIds based on selection order: -1, -2, -3, 1, 2, 3
  const getNextValidPpIds = (prevSelection) => {
    if (!prevSelection) return ppIdList;
    
    const prevPpId = prevSelection.ppId;
    
    return ppIdList.filter(item => {
      // If previous was negative
      if (prevPpId < 0) {
        // Show smaller negatives (-2, -3... after -1) OR all positives
        return item.ppId < prevPpId || item.ppId > 0;
      }
      // If previous was positive, show only larger positives
      else {
        return item.ppId > prevPpId;
      }
    });
  };

  const selection1Min = getMinPpId(form.selection1);

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
  

console.log("table data check proper:", tableData)
  const selectedValues = Object.values(form).filter(Boolean);


  const ppIdList = tableData
  .map(item => ({
    blockId: item.assessmentBlockId,
    ppId: item.ppId
  }))
  .sort((a, b) => {
    // Sort: negatives first (descending: -1, -2, -3), then positives (ascending: 1, 2, 3)
    if (a.ppId < 0 && b.ppId < 0) return b.ppId - a.ppId; // -1, -2, -3...
    if (a.ppId >= 0 && b.ppId >= 0) return a.ppId - b.ppId; // 1, 2, 3...
    return a.ppId < 0 ? -1 : 1; // negatives before positives
  });

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      selection2: null,
      selection3: null,
      selection4: null,
      selection5: null,
    }));
  }, [form.selection1]);
  
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      selection3: null,
      selection4: null,
      selection5: null,
    }));
  }, [form.selection2]);
  
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      selection4: null,
      selection5: null,
    }));
  }, [form.selection3]);
  
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      selection5: null,
    }));
  }, [form.selection4]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!isFormValid()) {
      toast.error("Please fill all required fields.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const data = {
        unitId,
        candidateId,
        selection1: form.selection1?.blockId || null,
        selection2: form.selection2?.blockId || null,
        selection3: form.selection3?.blockId || null,
        selection4: form.selection4?.blockId || null,
        selection5: form.selection5?.blockId || null,
      };
  
      const response = await createAssessmentChain(data);
  
      if (response) {
        onSuccess();
        onClose();
      }
  
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to save entry.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <form className="flex flex-col h-full w-full bg-white border shadow-2xl border-gray-200" onSubmit={handleSubmit}>
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2 text-black font-semibold">
          <ListFilterPlus className="w-5 h-5" />
          Create Assessment Chain
        </div>

        <button
          onClick={onClose}
          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-1 space-y-3 text-sm max-w-xl">

          {/* Selection 1 */}
          <label className="col-span-1 text-gray-700 flex items-center">
            Selection 1: <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            value={form.selection1?.blockId || ""}
            onChange={(e) => handleChange("selection1", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white 
            focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            required
            >
            <option value="">Select PP ID</option>
              {ppIdList.map((item, index) => (
                  <option key={item.blockId} value={item.blockId}>
                  {item.ppId}
                </option>
                
              ))}
          </select>


          {/* Selection 2 */}
          <label className="col-span-1 text-gray-700 flex items-center">
            Selection 2: <span className="text-red-500 ml-1">*</span>
          </label>
          <select className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white 
           focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
           value={form.selection2?.blockId || ""}
           onChange={(e) => handleChange("selection2", e.target.value)}
           
            >
            <option value="">Select PP ID</option>
            {getNextValidPpIds(form.selection1)
              .map(item => (
                <option key={item.blockId} value={item.blockId}>
                  {item.ppId}
                </option>
            ))}
          </select>


          {/* Selection 3 */}
          <label className="col-span-1 text-gray-700 flex items-center">
            Selection 3: <span className="text-red-500 ml-1">*</span>
          </label>
          <select className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white 
           focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
           value={form.selection3?.blockId || ""}
            onChange={(e) => handleChange("selection3", e.target.value)}
           
            >
            <option value="">Select PP ID</option>
            {getNextValidPpIds(form.selection2)
              .map(item => (
                <option key={item.blockId} value={item.blockId}>
                  {item.ppId}
                </option>
            ))}
          </select>


          {/* Selection 4 */}
          <label className="col-span-1 text-gray-700 flex items-center">
            Selection 4: <span className="text-red-500 ml-1">*</span>
          </label>
          <select className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white 
           focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            value={form.selection4?.blockId || ""}
            onChange={(e) => handleChange("selection4", e.target.value)}
           
            >
            <option value="">Select PP ID</option>
            {getNextValidPpIds(form.selection3)
              .map(item => (
                <option key={item.blockId} value={item.blockId}>
                  {item.ppId}
                </option>
            ))}
          </select>


          {/* Selection 5 */}
          <label className="col-span-1 text-gray-700 flex items-center">
            Selection 5: <span className="text-red-500 ml-1">*</span>
          </label>
          <select className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white 
           focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
            value={form.selection5?.blockId || ""}
            onChange={(e) => handleChange("selection5", e.target.value)}
           
            >
            <option value="">Select PP ID</option>
            {getNextValidPpIds(form.selection4)
              .map(item => (
                <option key={item.blockId} value={item.blockId}>
                  {item.ppId}
                </option>
            ))}
          </select>

        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-gray-300 p-2 pr-6 bg-gray-50">
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className={`px-4 py-1 bg-gray-200 text-sm ${
              !isFormValid() || isSubmitting
                ? "cursor-not-allowed"
                : "hover:bg-gray-300"
            }`}
          >
            Close
          </button>
        </div>
      </div>

      <Toaster position="top-right" />
    </form>
  );
}