"use client";
import React, { useState, useEffect } from "react";
import { ListFilterPlus } from "lucide-react";

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

export default function CreateClientForm({ client, showForm, onClose }) {
  const [form, setForm] = useState({});
  const [executiveId, setExecutiveId] = useState("");

  useEffect(() => {
    setExecutiveId(generateExecutiveId());
  }, []);

  const handleChange = (label, value) => {
    setForm((prev) => ({ ...prev, [label]: value }));
  };

  return (
    <div className="border-2 border-blue-500 rounded-md flex flex-col h-full">
      <div className="flex items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
        <div className="flex items-center gap-2 text-blue-800 font-semibold">
          <ListFilterPlus className="w-5 h-5" />
          ENTITY EDITOR
        </div>
      </div>

      {!client ? (
        <div className="h-full p-4 text-gray-500 text-sm">No client selected.</div>
      ) : showForm ? (
        <form className="grid grid-cols-2 gap-1 text-xs p-2 overflow-y-auto max-h-[80vh]">
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
              <label className="col-span-1 flex items-center">{label}:</label>
              <input
                type="text"
                className="col-span-1 border px-2 py-1 rounded bg-white"
                onChange={(e) => handleChange(label, e.target.value)}
              />
            </React.Fragment>
          ))}

          {/* Executive ID - generated, non-editable */}
          <label className="col-span-1 flex items-center">Executive ID:</label>
          <input
            type="text"
            value={executiveId}
            disabled
            className="col-span-1 border px-2 py-1 rounded bg-gray-100"
          />

          {/* Company Size Dropdown */}
          <label className="col-span-1 flex items-center">Company Size:</label>
          <select
            className="col-span-1 border px-2 py-1 rounded bg-white"
            onChange={(e) => handleChange("Company Size", e.target.value)}
          >
            <option value="">Select Size</option>
            {companySizes.map((size, i) => (
              <option key={i} value={size}>
                {size}
              </option>
            ))}
          </select>

          {/* Status Toggle */}
          <label className="col-span-1 flex items-center">Status:</label>
          <select
            className="col-span-1 border px-2 py-1 rounded bg-white"
            onChange={(e) => handleChange("Status", e.target.value)}
          >
            <option value="Activate">Activate</option>
            <option value="Deactivate">Deactivate</option>
          </select>

          {/* Buttons */}
          <div className="col-span-2 pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                // You can save form here if needed
                if (onClose) onClose();
              }}
              className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              Close
            </button>
          </div>
        </form>
      ) :(
        <div className="h-full p-4 text-gray-500 text-sm">
          Click edit to use client editor.
        </div>
      )}
    </div>
  );
}
