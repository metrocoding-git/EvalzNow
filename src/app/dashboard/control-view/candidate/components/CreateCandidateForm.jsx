"use client";
import { ListFilterPlus, X } from "lucide-react";
import { useState } from "react";

const genderOptions = ["Female", "Male", "Non-Disclosed", "Other"];
const religionOptions = [
  "African Diaspora Religions",
  "Agnosticism",
  "Atheism",
  "Buddhism",
  "Christianity",
  "Confucianism",
  "Druze",
  "Gnosticism",
  "Hinduism",
  "Indigenous American Religions",
  "Islam",
  "Jainism",
  "Judaism",
  "Non-disclosed",
  "Other",
  "Rastafarianism",
  "Shinto",
  "Sikhism",
  "Strictly Spiritual",
  "Traditional African Religions",
  "Zoroastrianism",
];
const maritalStatusOptions = ["Married", "Non-disclosed", "Other", "Separated", "Single"];
const jobTypeOptions = ["Contractor", "Employee", "Non-disclosed", "Other", "Student", "Trainee", "Trainer"];

export default function CreateCandidateForm({ onClose }) {
  const [form, setForm] = useState({});

  const handleChange = (label, value) => {
    setForm((prev) => ({ ...prev, [label]: value }));
  };

  return (
    <div className="bg-gray-50 text-black border shadow-lg rounded overflow-y-auto z-50 m-4 max-h-screen">
      <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
        <div className="flex items-center gap-2 text-blue-800 font-semibold">
          <ListFilterPlus className="w-5 h-5" />
          CREATE CANDIDATE
        </div>
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700 text-sm hover:bg-red-100 rounded-full p-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 text-sm space-y-3 overflow-y-auto">
        {[
          "Last Name",
          "First Name",
          "Candidate ID",
          "Special ID No.",
          "Date of Birth",
          "Start Date",
        ].map((label, idx) => (
          <div key={idx} className="flex items-center">
            <label className="w-52 pr-2 text-gray-700">{label}:</label>
            <input
              type={label.includes("Date") ? "date" : "text"}
              className="flex-1 border px-2 py-1 rounded bg-white"
              onChange={(e) => handleChange(label, e.target.value)}
            />
          </div>
        ))}

        {/* Socioeconomic Fields */}
        <h3 className="pt-2 font-semibold text-gray-800">Socioeconomic Factors</h3>
        {[
          { label: "Nationality", options: ["Non-disclosed", "United States", "Canada", "India", "Germany", "Other"] },
          { label: "Gender", options: genderOptions },
          { label: "Ethnicity", options: ["Non-Disclosed", "Asian", "Black", "Hispanic", "White", "Mixed", "Other"] },
          { label: "Income", options: ["Non-Disclosed", "< $20k", "$20k-$50k", "$50k-$100k", "> $100k"] },
          { label: "Religion", options: religionOptions },
          { label: "Marital Status", options: maritalStatusOptions },
          { label: "Job Type", options: jobTypeOptions },
        ].map(({ label, options }, idx) => (
          <div key={idx} className="flex items-center">
            <label className="w-52 pr-2 text-gray-700">{label}:</label>
            <select
              className="flex-1 border px-2 py-1 rounded bg-white"
              onChange={(e) => handleChange(label, e.target.value)}
            >
              <option value="">Select {label}</option>
              {options.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}

        {/* Irregularities */}
        <h3 className="pt-2 font-semibold text-gray-800">Irregularities</h3>
        {["Disability", "Special Needs", "Other"].map((label, idx) => (
          <div key={idx} className="flex items-center">
            <label className="w-52 pr-2 text-gray-700">{idx + 1}. {label}:</label>
            <input type="checkbox" className="w-5 h-5" onChange={(e) => handleChange(label, e.target.checked)} />
          </div>
        ))}

        {/* Comments */}
        <div className="flex items-center">
          <label className="w-52 pr-2 text-gray-700">Comments:</label>
          <input
            type="text"
            maxLength={40}
            className="flex-1 border px-2 py-1 rounded bg-white"
            placeholder="Max 40 characters"
            onChange={(e) => handleChange("Comments", e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="pt-4 flex justify-end gap-2">
          {/* From this close button both Save and close should be done */}
          <button
            onClick={() => onClose()}
            className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Close
          </button>
          
        </div>
      </div>
    </div>
  );
}
