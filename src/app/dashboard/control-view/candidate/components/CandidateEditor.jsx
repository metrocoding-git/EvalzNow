"use client";
import { useState } from "react";
import { Edit, X } from "lucide-react";

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
const maritalStatusOptions = [
  "Married",
  "Non-disclosed",
  "Other",
  "Separated",
  "Single",
];
const jobTypeOptions = [
  "Contractor",
  "Employee",
  "Non-disclosed",
  "Other",
  "Student",
  "Trainee",
  "Trainer",
];

const nationalityOptions = [
  "Non-disclosed",
  "United States",
  "Canada",
  "India",
  "Germany",
  "Other",
];
const ethnicityOptions = [
  "Non-Disclosed",
  "Asian",
  "Black",
  "Hispanic",
  "White",
  "Mixed",
  "Other",
];
const incomeOptions = [
  "Non-Disclosed",
  "< $20k",
  "$20k-$50k",
  "$50k-$100k",
  "> $100k",
];

const irregularityOptions = ["Disability", "Special Needs", "Other"];

const initialFormState = {
  "Last Name": "",
  "First Name": "",
  "Candidate ID": "",
  "Special ID No.": "",
  "Date of Birth": "",
  "Start Date": "",
  Nationality: "",
  Gender: "",
  Ethnicity: "",
  Income: "",
  Religion: "",
  "Marital Status": "",
  "Job Type": "",
  Disability: false,
  "Special Needs": false,
  Other: false,
  Comments: "",
};

const CandidateEditor = ({ onClose, showForm }) => {
  const [form, setForm] = useState(initialFormState);

  const handleChange = (label, value) => {
    setForm((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  return (
    <div className="border-2 border-blue-500 rounded-md flex flex-col h-full">
      <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
        <div className="flex items-center gap-2 text-blue-800 font-semibold">
          <Edit className="w-5 h-5" />
          CANDIDATE EDITOR
        </div>
      </div>

      {!showForm ? (
        <div className="p-4 text-gray-500 text-sm">No candidate selected.</div>
      ) : (
      <form className="p-4 space-y-3 text-sm overflow-y-auto max-h-[70vh]">
        {/* Text and Date Inputs */}
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
              value={form[label]}
              onChange={(e) => handleChange(label, e.target.value)}
            />
          </div>
        ))}

        {/* Dropdown Selects */}
        {[
          { label: "Nationality", options: nationalityOptions },
          { label: "Gender", options: genderOptions },
          { label: "Ethnicity", options: ethnicityOptions },
          { label: "Income", options: incomeOptions },
          { label: "Religion", options: religionOptions },
          { label: "Marital Status", options: maritalStatusOptions },
          { label: "Job Type", options: jobTypeOptions },
        ].map(({ label, options }, idx) => (
          <div key={idx} className="flex items-center">
            <label className="w-52 pr-2 text-gray-700">{label}:</label>
            <select
              className="flex-1 border px-2 py-1 rounded bg-white"
              value={form[label]}
              onChange={(e) => handleChange(label, e.target.value)}
            >
              <option value="">Select {label}</option>
              {options.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Checkboxes for Irregularities */}
        <h3 className="pt-2 font-semibold text-gray-800">Irregularities</h3>
        {irregularityOptions.map((label, idx) => (
          <div key={idx} className="flex items-center">
            <label className="w-52 pr-2 text-gray-700">
              {idx + 1}. {label}:
            </label>
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={form[label]}
              onChange={(e) => handleChange(label, e.target.checked)}
            />
          </div>
        ))}

        {/* Comments */}
        <div className="flex items-center">
          <label className="w-52 pr-2 text-gray-700">Comments:</label>
          <input
            type="text"
            maxLength={40}
            placeholder="Max 40 characters"
            className="flex-1 border px-2 py-1 rounded bg-white"
            value={form.Comments}
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
      </form>
      )}
    </div>
  );
};

export default CandidateEditor;
