"use client";
import { createClient } from "@/services/clientService";
import { getCompanySize } from "@/services/companyService";
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


export default function NeuroObject({onClose}) {
  const [form, setForm] = useState({});
  const [executiveId, setExecutiveId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companySize, setCompanySize] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [answers, setAnswers] = useState({});
  const [expanded, setExpanded] = useState({}); // track expanded lobes

  const handleChange = (idx, value) => {
    setAnswers((prev) => ({
      ...prev,
      [idx]: value,
    }));
  };


  const rows = [
    // --- Frontal Lobe ---
    { lobe: "Frontal Lobe", func: "Ability to control/express language", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Ability to produce/form language", value: "No" },
    { lobe: "Frontal Lobe", func: "Ability to pronounce target speech sounds/patterns", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Requires Analytical Thinking/Reasoning", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Requires Logical Reasoning", value: "No" },
    { lobe: "Frontal Lobe", func: "Reasoning of Concrete/Tangible References", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Requires Pattern Recognition", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Utilizes Kinesthetic Speech", value: "No" },
    { lobe: "Frontal Lobe", func: "Exhibits Linear Predictive Speech or Conversational Trajectories", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Requires Critical Thinking", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Requires Symbolic Thinking", value: "No" },
    { lobe: "Frontal Lobe", func: "Requires Problem-Solving", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Demonstrates competency through primary motor control", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Discrimination of facial features", value: "No" },
    { lobe: "Frontal Lobe", func: "Probabilitic Reasoning", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Deductive Reasoning (content-independent)", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Inductive Reasoning", value: "No" },
    { lobe: "Frontal Lobe", func: "Analogical Reasoning (content-independent)", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Causal Reasoning", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Reading fluency & Verbal Reasoning", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Literacy", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Lingual Syntax and Grammatical Construction", value: "No" },
    { lobe: "Frontal Lobe", func: "Decision-Making", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Casting/exercising judgment", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Executing sequences in body movement", value: "Yes" },
    { lobe: "Frontal Lobe", func: "Functional Capacity - Frontal Lobe", value: "Yes" },
  
    // --- Occipital Lobe ---
    { lobe: "Occipital Lobe", func: "Right Visual Acuity", value: "Yes" },
    { lobe: "Occipital Lobe", func: "Visuospatial Processing + Color (Right-Hand Side)", value: "Yes" },
    { lobe: "Occipital Lobe", func: "Visual Recognition (Right-Hand Side)", value: "No" },
    { lobe: "Occipital Lobe", func: "Visual Attention (Right-Hand Side)", value: "Yes" },
    { lobe: "Occipital Lobe", func: "Visual Perception (Right-Hand Side)", value: "Yes" },
    { lobe: "Occipital Lobe", func: "Narrow Visual Span from right to left", value: "No" },
    { lobe: "Occipital Lobe", func: "Functional Capacity - Occipital Lobe", value: "Yes" },
    { lobe: "Occipital Lobe", func: "Left Visual Acuity", value: "Yes" },
    { lobe: "Occipital Lobe", func: "Visuospatial Processing + Color (Left-Hand Side)", value: "Yes" },
    { lobe: "Occipital Lobe", func: "Visual Recognition (Left-Hand Side)", value: "Yes" },
    { lobe: "Occipital Lobe", func: "Visual Attention (Left-Hand Side)", value: "Yes" },
    { lobe: "Occipital Lobe", func: "Visual Perception (Left-Hand Side)", value: "Yes" },
    { lobe: "Occipital Lobe", func: "Narrow Visual Span from left to right", value: "Yes" },
    { lobe: "Occipital Lobe", func: "Functional Capacity - Occipital Lobe", value: "Yes" },
  
    // --- Parietal Lobe ---
    { lobe: "Parietal Lobe", func: "Long-Term Memory Retrieval", value: "Yes" },
    { lobe: "Parietal Lobe", func: "Sensory/Episodic memory", value: "Yes" },
    { lobe: "Parietal Lobe", func: "Kinesthetic Perception", value: "No" },
    { lobe: "Parietal Lobe", func: "Mental Self-Perception", value: "Yes" },
    { lobe: "Parietal Lobe", func: "Mental Strategies", value: "Yes" },
    { lobe: "Parietal Lobe", func: "Tracking body positioning and movements", value: "Yes" },
    { lobe: "Parietal Lobe", func: "Processing 3D Environments", value: "Yes" },
    { lobe: "Parietal Lobe", func: "Sensory Information", value: "Yes" },
    { lobe: "Parietal Lobe", func: "Functional Capacity - Parietal Lobe", value: "Yes" },
    { lobe: "Parietal Lobe", func: "Working Memory (secondary)", value: "Yes" },
    { lobe: "Parietal Lobe", func: "Numerical Quantification", value: "Yes" },
    { lobe: "Parietal Lobe", func: "Numerical Reasoning", value: "Yes" },
    { lobe: "Parietal Lobe", func: "Spatial Reasoning", value: "Yes" },
    { lobe: "Parietal Lobe", func: "Spatial Acuity", value: "Yes" },
    { lobe: "Parietal Lobe", func: "Spatial Orientation", value: "Yes" },
    { lobe: "Parietal Lobe", func: "Symbolic Relationships", value: "Yes" },
    { lobe: "Parietal Lobe", func: "Functional Capacity - Parietal Lobe", value: "Yes" },
  
    // --- Temporal Lobe ---
    { lobe: "Temporal Lobe", func: "Memory Storage and Knowledge Recall", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Linking meaning to written words", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Linking meaning to spoken words", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Comprehension/processing of communicative inputs", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Recollecting Verbal Details", value: "No" },
    { lobe: "Temporal Lobe", func: "Learning/internalization", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Linking sound frequencies to different action responses", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Social Cognition", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Short-Term Visual Perception", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Functional Capacity - Temporal Lobe", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Auditory Speech Discrimination", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Recollecting Non-Verbal Details", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Object Recognition", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Symbolic Recognition", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Facial Recognition", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Data Recognition in various context", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Auditory Acuity", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Temporal Acuity", value: "Yes" },
    { lobe: "Temporal Lobe", func: "Functional Capacity - Temporal Lobe", value: "Yes" },
  ];
  
  

    // Group rows by lobe
    const grouped = rows.reduce((acc, row, idx) => {
      if (!acc[row.lobe]) acc[row.lobe] = [];
      acc[row.lobe].push({ ...row, idx });
      return acc;
    }, {})
  

  return (
    <div  className="flex flex-col h-full w-full bg-white z-20 border shadow-2xl border-gray-200">
     
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


    
      <div className="text-sm text-gray-600 mt-2 w-full overflow-auto">
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
              <table className="table-auto w-full text-sm border-t border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left">
                      Cognitive Function
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[lobe].map((row) => (
                    <tr key={row.idx} className="hover:bg-blue-50">
                      <td className="border border-gray-300 px-3 py-2">
                        {row.func}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
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


        
      
    </div>
  );
}
