"use client";
import { ListFilterPlus, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";

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
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center bg-gray-100 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2 text-black font-semibold">
          <Plus className="w-5 h-5" />
          Create Client
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3 text-sm">
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
            <div key={idx} className="flex items-center">
              <label className="w-48 pr-2 text-gray-700">{label}:</label>
              <input
                type="text"
                className="flex-1 border border-gray-300 px-2 py-1 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                onChange={(e) => handleChange(label, e.target.value)}
              />
            </div>
          ))}

          {/* Executive ID - generated, non-editable */}
          <div className="flex items-center">
            <label className="w-48 pr-2 text-gray-700">Executive ID:</label>
            <input
              type="text"
              value={executiveId}
              disabled
              className="flex-1 border border-gray-300 px-2 py-1 bg-gray-100 text-sm"
            />
          </div>

          {/* Company Size Dropdown */}
          <div className="flex items-center">
            <label className="w-48 pr-2 text-gray-700">Company Size:</label>
            <select
              className="flex-1 border border-gray-300 px-2 py-1 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              onChange={(e) => handleChange("Company Size", e.target.value)}
            >
              <option value="">Select Size</option>
              {companySizes.map((size, i) => (
                <option key={i} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center">
            <label className="w-48 pr-2 text-gray-700">Status:</label>
            <select
              className="flex-1 border border-gray-300 px-2 py-1 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              onChange={(e) => handleChange("Status", e.target.value)}
            >
              <option value="Activate">Activate</option>
              <option value="Deactivate">Deactivate</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                // Save form data here if needed
                if (onClose) onClose();
              }}
              className="px-4 py-1 bg-gray-200 hover:bg-gray-300 text-sm transition-colors"
            >
               Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
