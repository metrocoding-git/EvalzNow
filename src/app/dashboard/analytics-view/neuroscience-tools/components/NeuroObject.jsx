"use client";
import { createClient } from "@/services/clientService";
import { getCompanySize } from "@/services/companyService";
import { ListFilterPlus, Plus, X } from "lucide-react";
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

            <table className="table-auto w-full text-sm border border-gray-300">
            <thead className="bg-gray-100">
                <tr>
                
                <th className="border border-gray-300 px-3 py-2 text-left">Cognitive Function</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Value</th>
                </tr>
            </thead>
            <tbody>
                {[
                // --- Frontal Lobe - Left ---
                { lobe: "Frontal Lobe - Left", func: "Ability to control/express language", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Ability to produce/form language", value: "No" },
                { lobe: "Frontal Lobe - Left", func: "Ability to pronounce target speech sounds/patterns", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Requires Analytical Thinking/Reasoning", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Requires Logical Reasoning", value: "No" },
                { lobe: "Frontal Lobe - Left", func: "Reasoning of Concrete/Tangible References", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Requires Pattern Recognition", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Utilizes Kinesthetic Speech", value: "No" },
                { lobe: "Frontal Lobe - Left", func: "Exhibits Linear Predictive Speech or Conversational Trajectories", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Requires Critical Thinking", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Requires Symbolic Thinking", value: "No" },
                { lobe: "Frontal Lobe - Left", func: "Requires Problem-Solving", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Demonstrates competency through primary motor control", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Discrimination of facial features", value: "No" },
                { lobe: "Frontal Lobe - Left", func: "Probabilitic Reasoning", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Deductive Reasoning (content-independent)", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Inductive Reasoning", value: "No" },
                { lobe: "Frontal Lobe - Left", func: "Analogical Reasoning (content-independent)", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Causal Reasoning", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Reading fluency & Verbal Reasoning", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Literacy", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Lingual Syntax and Grammatical Construction", value: "No" },
                { lobe: "Frontal Lobe - Left", func: "Decision-Making", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Casting/exercising judgment", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Executing sequences in body movement", value: "Yes" },
                { lobe: "Frontal Lobe - Left", func: "Functional Capacity - Frontal Lobe (L)", value: "Yes" },

                // --- Occipital Lobe - Left ---
                { lobe: "Occipital Lobe - Left", func: "Right Visual Acuity", value: "Yes" },
                { lobe: "Occipital Lobe - Left", func: "Visuospatial Processing + Color (Right-Hand Side)", value: "Yes" },
                { lobe: "Occipital Lobe - Left", func: "Visual Recognition (Right-Hand Side)", value: "No" },
                { lobe: "Occipital Lobe - Left", func: "Visual Attention (Right-Hand Side)", value: "Yes" },
                { lobe: "Occipital Lobe - Left", func: "Visual Perception (Right-Hand Side)", value: "Yes" },
                { lobe: "Occipital Lobe - Left", func: "Narrow Visual Span from right to left", value: "No" },
                { lobe: "Occipital Lobe - Left", func: "Functional Capacity - Occipital Lobe (L)", value: "Yes" },

                // ... repeat for Parietal Lobe (L), Temporal Lobe (L),
                // Frontal Lobe (R), Occipital Lobe (R), Parietal Lobe (R), Temporal Lobe (R)
                // using Yes/No values
                ].map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50">
                    
                    <td className="border border-gray-300 px-3 py-2">{row.func}</td>
                    <td className="border border-gray-300 px-3 py-2"><input type="text" className="border border-gray-300"/></td>
                </tr>
                ))}
            </tbody>
            </table>
            </div>

        
      
    </div>
  );
}
