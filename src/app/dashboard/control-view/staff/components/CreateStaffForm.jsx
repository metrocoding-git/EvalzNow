"use client";
import { ListFilterPlus, X } from "lucide-react";
import React, { useState } from "react";

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
    <div className="flex flex-col h-full w-full bg-white z-20 border shadow-2xl border-gray-200">

      {/* Header */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 text-black font-semibold">
          <ListFilterPlus className="w-5 h-5" />
          Create Staff
        </div>

        {/* Close icon */}
        <button
          onClick={onClose}
          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-1 space-y-3 text-sm max-w-xl">
          {[
            "Last Name",
            "First Name",
            "Job Title",
            "Department",
            "Date of Birth",
            "Date of Employment",
            "Staff ID",
            "Contact Number",
            "Company E-mail Address",
          ].map((label, idx) => (
            <React.Fragment key={idx}>
              <label className="col-span-1 flex items-center text-gray-700">
                {label}:
              </label>
              <input
                type={label.includes("Date") ? "date" : "text"}
                className="col-span-1 border border-gray-300 px-2 py-1 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                onChange={(e) => handleChange(label, e.target.value)}
              />
            </React.Fragment>
          ))}

          {/* Access Level Dropdown */}
          <label className="col-span-1 flex items-center text-gray-700">Access Level:</label>
          <select
            className="col-span-1 border border-gray-300 px-2 py-1 bg-gray-100 text-sm"
            onChange={(e) => handleChange("Access Level", e.target.value)}
          >
            <option value="">Select Access Level</option>
            {accessLevels.map((level, i) => (
              <option key={i} value={level}>
                {level}
              </option>
            ))}
          </select>


          {/* Account Status Dropdown */}

          <label className="col-span-1 flex items-center text-gray-700">Account Status:</label>
          <select
            className="col-span-1 border border-gray-300 px-2 py-1 bg-gray-100 text-sm"
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

      {/* Fixed Footer */}
      <div className="border-t border-gray-300 p-2 pr-6 bg-gray-50 flex-shrink-0">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 bg-gray-200 hover:bg-gray-300 text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}