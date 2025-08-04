"use client";
import { ListFilterPlus, Plus, X } from "lucide-react";
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
const irregularityOptions = ["Disability", "Special Needs", "Other"];

export default function CreateCandidateForm({ onClose }) {
  const [form, setForm] = useState({});
  const [rows, setRows] = useState([
    { id: "", type: "", comment: "" }
  ]);

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { id: "", type: "", comment: "" }]);
  };

  const handleChange = (label, value) => {
    setForm((prev) => ({ ...prev, [label]: value }));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center bg-gray-100 px-4 py-2 border-b border-gray-300 gap-2 text-gray-800 font-semibold flex-shrink-0">
        <ListFilterPlus className="w-5 h-5" />
        Create Candidate
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="text-sm space-y-3">
          {[
            "Last Name",
            "First Name",
            "Candidate ID",
            "Special ID No.",
            "Date of Birth",
            "Start Date",
          ].map((label, idx) => (
            <div key={idx} className="flex items-center">
              <label className="w-52 pr-2 text-gray-700 flex-shrink-0">{label}:</label>
              <input
                type={label.includes("Date") ? "date" : "text"}
                className="flex-1 border px-2 py-1 bg-white"
                onChange={(e) => handleChange(label, e.target.value)}
              />
            </div>
          ))}

          {/* Socioeconomic Fields */}
          <h3 className="pt-4 pb-2 font-semibold text-gray-800 border-t border-gray-200">Socioeconomic Factors</h3>
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
              <label className="w-52 pr-2 text-gray-700 flex-shrink-0">{label}:</label>
              <select
                className="flex-1 border px-2 py-1 bg-white"
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
          <h3 className="pt-4 pb-2 font-semibold text-gray-800 border-t border-gray-200">Irregularities</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-left">Irregularities</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">ID</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Comments</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="even:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1">
                      <select
                        value={row.type}
                        onChange={(e) => handleRowChange(index, "type", e.target.value)}
                        className="w-full px-2 py-1 border"
                      >
                        <option value="">Select</option>
                        {irregularityOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        min={1}
                        value={row.id}
                        onChange={(e) => handleRowChange(index, "id", e.target.value)}
                        className="w-full px-2 py-1 border"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        value={row.comment}
                        maxLength={40}
                        onChange={(e) => handleRowChange(index, "comment", e.target.value)}
                        className="w-full px-2 py-1 border"
                        placeholder="Max 40 characters"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button
            onClick={addRow}
            className="flex items-center gap-2 mt-3 px-3 py-1 bg-gray-500 text-white hover:bg-gray-700"
          >
            <Plus size={18} />
            Add Row
          </button>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="border-t border-gray-300 p-2 pr-6 bg-gray-50 flex-shrink-0">
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}