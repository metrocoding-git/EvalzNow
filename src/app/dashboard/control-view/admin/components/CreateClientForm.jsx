"use client";
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

export default function CreateClientForm({ onClose }) {
  const [form, setForm] = useState({});
  const [executiveId, setExecutiveId] = useState("");

  useEffect(() => {
    setExecutiveId(generateExecutiveId());
  }, []);

  const handleChange = (label, value) => {
    setForm((prev) => ({ ...prev, [label]: value }));
  };

  return (
    <div className="flex flex-col h-full bg-white z-20">
      {/* Header */}
      <div className="flex items-center bg-gray-100 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 text-black font-semibold">
          <Plus className="w-5 h-5" />
          Create Client
        </div>
      </div>

      {/* Scrollable form content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-1 space-y-3 text-sm max-w-xl">
          {[
            "Executive Last Name",
            "Executive First Name",
            "Executive Job Title",
            "Executive E-mail Address",
            "Company Name",
            "Company Contact Number",
            "Institutional Type",
            "Business Registration No.",
            "Country",
          ].map((label, idx) => (
            <React.Fragment key={idx}>
              <label className="col-span-1 flex items-center text-gray-700">
                {label}:
              </label>
              <input
                type="text"
                className="col-span-1 border border-gray-300 px-2 py-1 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                onChange={(e) => handleChange(label, e.target.value)}
              />
            </React.Fragment>
          ))}

          {/* Executive ID */}
          <label className="col-span-1 flex items-center text-gray-700">
            Executive ID:
          </label>
          <input
            type="text"
            value={executiveId}
            disabled
            className="col-span-1 border border-gray-300 px-2 py-1 bg-gray-100 text-sm"
          />

          {/* Company Size */}
          <label className="col-span-1 flex items-center text-gray-700">
            Company Size:
          </label>
          <select
            defaultValue=""
            onChange={(e) => handleChange("Company Size", e.target.value)}
            className="col-span-1 border border-gray-300 px-2 py-1 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <option value="" disabled>
              Select Size
            </option>
            {companySizes.map((size, i) => (
              <option key={i} value={size}>
                {size}
              </option>
            ))}
          </select>

          {/* Status */}
          <label className="col-span-1 flex items-center text-gray-700">
            Status:
          </label>
          <select
            className="col-span-1 border border-gray-300 px-2 py-1 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            onChange={(e) => handleChange("Status", e.target.value)}
          >
            <option value="Activate">Activate</option>
            <option value="Deactivate">Deactivate</option>
          </select>
        </div>
      </div>

      {/* Fixed footer */}
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
