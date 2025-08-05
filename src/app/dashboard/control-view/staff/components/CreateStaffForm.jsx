"use client";
import { ListFilterPlus, X } from "lucide-react";
import { useState } from "react";

const accessLevels = [
  "Full Access",
  "Leaders Access",
];

const accountStatuses = ["Enabled", "Disabled"];

export default function CreateStaffForm({ onClose }) {
  const [form, setForm] = useState({});

  const handleChange = (label, value) => {
    setForm((prev) => ({ ...prev, [label]: value }));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center bg-gray-100 px-4 py-2 border-b border-gray-300 gap-2 text-gray-800 font-semibold flex-shrink-0">
        <ListFilterPlus className="w-5 h-5" />
        Create Staff
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="text-sm space-y-3">
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
              <label className="w-48 pr-2 text-gray-700 flex-shrink-0">{label}:</label>
              <input
                type={label.includes("Date") ? "date" : "text"}
                className="flex-1 border px-2 py-1 rounded bg-white"
                onChange={(e) => handleChange(label, e.target.value)}
              />
            </div>
          ))}

          {/* Access Level Dropdown */}
          <div className="flex items-center">
            <label className="w-48 pr-2 text-gray-700 flex-shrink-0">Access Level:</label>
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
            <label className="w-48 pr-2 text-gray-700 flex-shrink-0">Account Status:</label>
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
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="border-t border-gray-300 p-2 pr-6 bg-gray-50 flex-shrink-0">
        <div className="flex justify-end ">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}