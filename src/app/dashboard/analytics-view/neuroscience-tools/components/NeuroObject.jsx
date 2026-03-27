"use client";
import { createClient } from "@/services/clientService";
import { getCompanySize } from "@/services/companyService";
import { getInsertScoreByUnitAndCandidate } from "@/services/insertScoreService";
import { createNeuroObject, getNeuroObjectbyUnitAndCandidate } from "@/services/neuroScienceService";
import { getUnitAndMultipleCandidateSummary } from "@/services/tabulationTableService";
import { ChevronLeft, ChevronRight, ListFilterPlus, Plus, X } from "lucide-react";
import React, { useState, useEffect } from "react";

// Generate 10-char random alphanumeric ID
const generateExecutiveId = () => {
  return Math.random().toString(36).substring(2, 12).toUpperCase();
};

const companySizes = [
  "Tier 1 - Micro-Size: 1-4 Candidates",
  "Tier 2 - Small-Size : 5-19 Candidates",
  "Tier 3 - Medium-Size : 20-99 Candidates",
  "Tier 4 - Large-Size : 100-249 Candidates",
  "Tier 5 - Low Enterprise : 250-999 Candidates",
  "Tier 6 - High Enterprise : 1000-2499 Candidates",
  "Tier 7 - Small Campus : 2500-4999 Candidates",
  "Tier 8 - Medium Campus : 5000-14999 Candidates",
  "Tier 9 - Large Campus : 15000-50000 Candidates",
  "Tier 10 - Mass Network : > 50000 Candidates",
];


export default function NeuroObject({ onClose, unitId, candidateId, onSaved }) {
  const [form, setForm] = useState({});
  const [executiveId, setExecutiveId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companySize, setCompanySize] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPP, setSelectedPP] = useState(null);
  const [answers, setAnswers] = useState({});
  const [expanded, setExpanded] = useState({}); // track expanded lobes
  const [assessmentData, setAssessmentData] = useState([]);

  const [existingNeuroObjectPPs, setExistingNeuroObjectPPs] = useState([]); // Store PP IDs that already have neuro objects
  

  const handleChange = (idx, value) => {
    setAnswers((prev) => ({
      ...prev,
      [idx]: value,
    }));
  };


  const rows = [
    // --- Frontal Lobe - Left ---
    { lobe: "Frontal Lobe - Left", func: "Ability to control/express language", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Ability to produce/form language", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Ability to pronounce target speech sounds/patterns", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Requires Analytical Thinking/Reasoning", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Requires Logical Reasoning", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Reasoning of Concrete/Tangible References", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Requires Pattern Recognition", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Utilizes Kinesthetic Speech", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Exhibits Linear Predictive Speech or Conversational Trajectories", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Requires Critical Thinking", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Requires Symbolic Thinking", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Requires Problem-Solving", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Demonstrates competency through primary motor control", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Discrimination of facial features", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Probabilitic Reasoning", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Deductive Reasoning (content-independent)", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Inductive Reasoning", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Analogical Reasoning (content-independent)", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Causal Reasoning", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Reading fluency & Verbal Reasoning", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Literacy", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Lingual Syntax and Grammatical Construction", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Decision-Making", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Casting/exercising judgment", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Executing sequences in body movement", value: "No" },
    { lobe: "Frontal Lobe - Left", func: "Functional Capacity - Frontal Lobe (L)", value: "No" },

    // --- Occipital Lobe - Left ---
    { lobe: "Occipital Lobe - Left", func: "Right Visual Acuity", value: "No" },
    { lobe: "Occipital Lobe - Left", func: "Visuospatial Processing + Color (Right-Hand Side)", value: "No" },
    { lobe: "Occipital Lobe - Left", func: "Visual Recognition (Right-Hand Side)", value: "No" },
    { lobe: "Occipital Lobe - Left", func: "Visual Attention (Right-Hand Side)", value: "No" },
    { lobe: "Occipital Lobe - Left", func: "Visual Perception (Right-Hand Side)", value: "No" },
    { lobe: "Occipital Lobe - Left", func: "Narrow Visual Span from right to left", value: "No" },
    { lobe: "Occipital Lobe - Left", func: "Functional Capacity - Occipital Lobe (L)", value: "No" },

    // --- Parietal Lobe - Left ---
    { lobe: "Parietal Lobe - Left", func: "Long-Term Memory Retrieval", value: "No" },
    { lobe: "Parietal Lobe - Left", func: "Sensory/Episodic memory", value: "No" },
    { lobe: "Parietal Lobe - Left", func: "Kinesthetic Perception", value: "No" },
    { lobe: "Parietal Lobe - Left", func: "Mental Self-Perception", value: "No" },
    { lobe: "Parietal Lobe - Left", func: "Mental Strategies", value: "No" },
    { lobe: "Parietal Lobe - Left", func: "Tracking body positioning and movements", value: "No" },
    { lobe: "Parietal Lobe - Left", func: "Processing 3D Environments", value: "No" },
    { lobe: "Parietal Lobe - Left", func: "Sensory Information", value: "No" },
    { lobe: "Parietal Lobe - Left", func: "Functional Capacity - Parietal Lobe (L)", value: "No" },


    // --- Temporal Lobe - Left ---
    { lobe: "Temporal Lobe - Left", func: "Memory Storage and Knowledge Recall", value: "No" },
    { lobe: "Temporal Lobe - Left", func: "Linking meaning to written words", value: "No" },
    { lobe: "Temporal Lobe - Left", func: "Linking meaning to spoken words", value: "No" },
    { lobe: "Temporal Lobe - Left", func: "Comprehension/processing of communicative inputs", value: "No" },
    { lobe: "Temporal Lobe - Left", func: "Recollecting Verbal Details", value: "No" },
    { lobe: "Temporal Lobe - Left", func: "Learning/internalization", value: "No" },
    { lobe: "Temporal Lobe - Left", func: "Linking sound frequencies to different action responses", value: "No" },
    { lobe: "Temporal Lobe - Left", func: "Social Cognition", value: "No" },
    { lobe: "Temporal Lobe - Left", func: "Short-Term Visual Perception", value: "No" },
    { lobe: "Temporal Lobe - Left", func: "Functional Capacity - Temporal Lobe", value: "No" },



    // --- Frontal Lobe - Right ---
    { lobe: "Frontal Lobe - Right", func: "Non-Verbal processing", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Artifactual Reasoning", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Abstract Reasoning", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Working Memory (primary)", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Face Perception", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Planning/organizing events", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Requires attention and concentration", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Connects to emotional control/expression", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Connects to deep mental fitness/IQ", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Assessment of Performance based on creativity", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Assessment of Performance based on imagination", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Assessment of Performance based on music/art", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Mechanical Reasoning", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Deductive Reasoning (content-dependent)", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Analogical Reasoning (content-dependent)", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Voluntary Movement of Kinesthetic Learning", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Awareness", value: "No" },
    { lobe: "Frontal Lobe - Right", func: "Functional Capacity - Frontal Lobe (R)", value: "No" },

    // --- Occipital Lobe - Right ----
    { lobe: "Occipital Lobe - Right", func: "Left Visual Acuity", value: "No" },
    { lobe: "Occipital Lobe - Right", func: "Visuospatial Processing + Color (Left-Hand Side)", value: "No" },
    { lobe: "Occipital Lobe - Right", func: "Visual Recognition (Left-Hand Side)", value: "No" },
    { lobe: "Occipital Lobe - Right", func: "Visual Attention (Left-Hand Side)", value: "No" },
    { lobe: "Occipital Lobe - Right", func: "Visual Perception (Left-Hand Side)", value: "No" },
    { lobe: "Occipital Lobe - Right", func: "Narrow Visual Span from left to right", value: "No" },
    { lobe: "Occipital Lobe - Right", func: "Functional Capacity - Occipital Lobe (R)", value: "No" },


    // --- Parietal Lobe - Right ----
    { lobe: "Parietal Lobe - Right", func: "Working Memory (secondary)", value: "No" },
    { lobe: "Parietal Lobe - Right", func: "Numerical Quantification", value: "No" },
    { lobe: "Parietal Lobe - Right", func: "Numerical Reasoning", value: "No" },
    { lobe: "Parietal Lobe - Right", func: "Spatial Reasoning", value: "No" },
    { lobe: "Parietal Lobe - Right", func: "Spatial Acuity", value: "No" },
    { lobe: "Parietal Lobe - Right", func: "Spatial Orientation", value: "No" },
    { lobe: "Parietal Lobe - Right", func: "Symbolic Relationships", value: "No" },
    { lobe: "Parietal Lobe - Right", func: "Functional Capacity - Parietal Lobe (R)", value: "No" },


    // --- Temporal Lobe - Right ----
    { lobe: "Temporal Lobe - Right", func: "Auditory Speech Discrimination", value: "No" },
    { lobe: "Temporal Lobe - Right", func: "Recollecting Non-Verbal Details", value: "No" },
    { lobe: "Temporal Lobe - Right", func: "Object Recognition", value: "No" },
    { lobe: "Temporal Lobe - Right", func: "Symbolic Recognition", value: "No" },
    { lobe: "Temporal Lobe - Right", func: "Facial Recognition", value: "No" },
    { lobe: "Temporal Lobe - Right", func: "Data Recognition in various context", value: "No" },
    { lobe: "Temporal Lobe - Right", func: "Auditory Acuity", value: "No" },
    { lobe: "Temporal Lobe - Right", func: "Temporal Acuity", value: "No" },
    { lobe: "Temporal Lobe - Right", func: "Functional Capacity - Temporal Lobe (R)", value: "No" },
  ];


  // Filtered assessment data - only PP IDs that don't exist in neuro object responses
  const filteredAssessmentData = assessmentData.filter(
    item => !existingNeuroObjectPPs.includes(item.ppId)
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!unitId || !candidateId) return;
  
      setLoading(true);
      setError(null);
  
      try {
        // Fetch both insert scores and neuro objects in parallel
        const insertScoreData = await getInsertScoreByUnitAndCandidate(
          unitId,
          candidateId
        );
  
        const neuroObjectData =
          (await getNeuroObjectbyUnitAndCandidate(unitId, candidateId)) || [];
  
        // Process insert scores
       
  
        console.log("Fetched insert scores:", insertScoreData);
  
        const extracted = insertScoreData.reduce((acc, item) => {
          if (item.ppId > 0 && !acc.some(i => i.ppId === item.ppId)) {
            acc.push({ 
              ppId: item.ppId, 
              assessmentBlockId: item.assessmentBlockId 
            });
          }
          return acc;
        }, []);
        
        setAssessmentData(extracted);
  
        // Process neuro objects to extract existing PP IDs
        if (Array.isArray(neuroObjectData)) {
          console.log("Fetched neuro objects:", neuroObjectData);
          
          // Extract unique PP IDs from neuro object responses
          const existingPPs = neuroObjectData.reduce((acc, item) => {
            if (item.ppId && !acc.includes(item.ppId)) {
              acc.push(item.ppId);
            }
            return acc;
          }, []);
          
          setExistingNeuroObjectPPs(existingPPs);
          console.log("Existing PP IDs in neuro objects:", existingPPs);
        }
  
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
        setAssessmentData([]);
        setExistingNeuroObjectPPs([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [unitId, candidateId]);

  // Group rows by lobe
  const grouped = rows.reduce((acc, row, idx) => {
    if (!acc[row.lobe]) acc[row.lobe] = [];
    acc[row.lobe].push({ ...row, idx });
    return acc;
  }, {});

  const handleSubmit = async () => {
    if (!selectedPP) {
      alert("Please select a PP ID");
      return;
    }
  
    const responses = rows.map((row, idx) => ({
      lobe: row.lobe,
      functionName: row.func,
      value: answers[idx] ?? row.value ?? "No",
    }));
  
    const payload = {
      unitId,
      candidateId,
      assessmentBlockId: selectedPP.assessmentBlockId,
      ppId: selectedPP.ppId,
      responses,
    };
  
    try {
      setIsSubmitting(true);
      await createNeuroObject(payload);

      if (onSaved) onSaved();
      // Refresh the list after creating a new neuro object
      const neuroObjectData = await getNeuroObjectbyUnitAndCandidate(unitId, candidateId);
      if (Array.isArray(neuroObjectData)) {
        const existingPPs = neuroObjectData.reduce((acc, item) => {
          if (item.ppId && !acc.includes(item.ppId)) {
            acc.push(item.ppId);
          }
          return acc;
        }, []);
        setExistingNeuroObjectPPs(existingPPs);
      }
      // Clear the selected PP and answers
      setSelectedPP(null);
      setAnswers({});
     
    } catch (err) {
      console.error("Failed to create Neuro Object", err);
      alert("Failed to save Neuro Object");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="flex flex-col h-full w-full bg-white z-20 border shadow-2xl border-gray-200">

      {/* Header */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 text-black font-semibold">
          <ListFilterPlus className="w-5 h-5" />
          Neuro Object
        </div>



        {/* Close icon */}
        <button
          onClick={onClose}
          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="text-xs text-gray-600 mt-2 w-full flex gap-2 pl-3 pr-4 items-center">
        <label className="pr-2 text-left text-gray-700 whitespace-nowrap">
          PP ID Callout:
        </label>
        <select
          className="flex-1 border px-2 py-1 w-full"
          value={selectedPP?.ppId ?? ""}
          onChange={(e) => {
            const pp = filteredAssessmentData.find(
              (item) => String(item.ppId) === e.target.value
            );
            setSelectedPP(pp || null);
          }}
        >
          <option value="" disabled>Select PP ID</option>
          {filteredAssessmentData.length === 0 ? (
            <option value="" disabled>
              No available PP IDs
            </option>
          ) : (
            filteredAssessmentData.map((item, i) => (
              <option key={i} value={item.ppId}>
                {item.ppId}
              </option>
            ))
          )}
        </select>


      </div>

          

      <div className="text-xs text-gray-600 mt-2 w-full overflow-auto">
        {Object.keys(grouped).map((lobe) => (
          <div key={lobe} className="border border-gray-300 mb-2 rounded">
            {/* Lobe Header */}
            <button
              onClick={() =>
                setExpanded((prev) => ({ ...prev, [lobe]: !prev[lobe] }))
              }
              className="w-full flex justify-between items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 font-medium"
            >
              <span>{lobe}</span>
              {expanded[lobe] ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {/* Lobe Rows */}
            {expanded[lobe] && (
              <table className="table-auto w-full text-xs border-t border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 text-xs px-2 py-1 text-left">
                      Cognitive Function
                    </th>
                    <th className="border border-gray-300 text-xs px-2 py-1 text-center">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[lobe].map((row) => (
                    <tr key={row.idx} className="hover:bg-blue-50">
                      <td className="border border-gray-300 px-2 py-1">
                        {row.func}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <select
                          value={answers[row.idx] ?? row.value ?? ""}
                          onChange={(e) => handleChange(row.idx, e.target.value)}
                          className="border border-gray-300 px-2 py-1"
                        >
                          <option value="" disabled>
                            Select
                          </option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>

      {/* Fixed footer */}
      <div className="border-t border-gray-300 p-2 pr-6 bg-gray-50 flex-shrink-0">
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-1 bg-gray-200 hover:bg-gray-300 text-xs transition-colors disabled:opacity-50
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
