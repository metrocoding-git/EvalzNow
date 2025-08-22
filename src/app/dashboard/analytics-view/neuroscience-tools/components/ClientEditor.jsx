"use client";
import React, { useState, useEffect } from "react";
import { Edit, ListFilterPlus } from "lucide-react";

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

export default function ClientEditor({ client, onClose }) {
  const [form, setForm] = useState({});
  const [executiveId, setExecutiveId] = useState("");

  const [answers, setAnswers] = useState({});
  useEffect(() => {
    setExecutiveId(generateExecutiveId());
  }, []);

  const handleChange = (label, value) => {
    setForm((prev) => ({ ...prev, [label]: value }));
  };

  

  const rows = [
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
  ];

   return (
    <div className="h-full flex flex-col">
      <div className="flex items-center bg-gray-100 px-4 py-1.5 border-1 border-gray-200">
        <div className="flex items-center gap-2 text-black font-semibold text-sm">
          <Edit className="w-4 h-4" />
          Entity Editor
        </div>
      </div>

      {!client ? (
        <div className="flex-1 p-4 text-gray-500 text-sm flex items-center justify-center">
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto m-1">
          <table className="table-auto w-full text-xs border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left">Function</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50">
                  <td className="border border-gray-300 px-3 py-2">{row.func}</td>
                  <td className="border border-gray-300 px-3 py-2">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
