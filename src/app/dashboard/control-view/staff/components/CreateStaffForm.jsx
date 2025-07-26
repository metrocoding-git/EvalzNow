"use client";
import { ListFilterPlus, X } from "lucide-react";
import { useState } from "react";

const accessLevels = [
  "Full Access [No restrictions on the client account]",
  "Leaders Access [Cannot access the Staff Control // Cannot put negative marks for leaders]",
];

const accountStatuses = ["Enabled", "Disabled"];

export default function CreateStaffForm({ onClose }) {
  const [form, setForm] = useState({});

  const handleChange = (label, value) => {
    setForm((prev) => ({ ...prev, [label]: value }));
  };

  return (
    <div className="bg-gray-50 text-black border shadow-lg rounded overflow-y-auto z-50 m-4 max-h-screen">
      <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
        <div className="flex items-center gap-2 text-blue-800 font-semibold">
          <ListFilterPlus className="w-5 h-5" />
          CREATE STAFF
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
          "Job Title",
          "Department",
          "Date of Birth",
          "Date of Employment",
          "Employee No.",
          "Contact Number",
          "Company E-mail Address",
        ].map((label, idx) => (
          <div key={idx} className="flex items-center">
            <label className="w-48 pr-2 text-gray-700">{label}:</label>
            <input
              type={label.includes("Date") ? "date" : "text"}
              className="flex-1 border px-2 py-1 rounded bg-white"
              onChange={(e) => handleChange(label, e.target.value)}
            />
          </div>
        ))}

        {/* Access Level Dropdown */}
        <div className="flex items-center">
          <label className="w-48 pr-2 text-gray-700">Access Level:</label>
          <select
            className="flex-1 border px-2 py-1 rounded bg-white"
            onChange={(e) => handleChange("Access Level", e.target.value)}
          >
            <option value="">Select Access Level</option>
            {accessLevels.map((level, i) => (
              <option key={i} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Account Status Dropdown */}
        <div className="flex items-center">
          <label className="w-48 pr-2 text-gray-700">Account Status:</label>
          <select
            className="flex-1 border px-2 py-1 rounded bg-white"
            onChange={(e) => handleChange("Account Status", e.target.value)}
          >
            <option value="">Select Status</option>
            {accountStatuses.map((status, i) => (
              <option key={i} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="pt-4 flex justify-end gap-2">
          <button
            onClick={() => onClose()}
            className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Close
          </button>
          <button
            type="submit"
            className="px-4 py-1 text-sm bg-blue-600 text-white border border-blue-700 rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
