"use client";
import React, { useState, useEffect } from "react";
import { Edit, X } from "lucide-react";

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

export default function ClientEditor({ client, onClose, onSave }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (client) {
      setForm({
        "Executive Last Name": client.lastName || "",
        "Executive First Name": client.firstName || "",
        "Executive Job Title": client.jobTitle || "",
        "Executive E-mail Address": client.email || "",
        "Company Name": client.companyName || "",
        "Company Contact Number": client.contactNumber || "",
        "Institutional Type": client.institutionType || "",
        "Business Registration No.": client.registrationNo || "",
        Country: client.country || "",
        "Company Size": client.companySize || "",
        Status: client.status || "Activate",
      });
    }
  }, [client]);

  const mapFormToClient = (form) => ({
    lastName: form["Executive Last Name"] || "",
    firstName: form["Executive First Name"] || "",
    jobTitle: form["Executive Job Title"] || "",
    email: form["Executive E-mail Address"] || "",
    companyName: form["Company Name"] || "",
    contactNumber: form["Company Contact Number"] || "",
    institutionType: form["Institutional Type"] || "",
    registrationNo: form["Business Registration No."] || "",
    country: form["Country"] || "",
    companySize: form["Company Size"] || "",
    status: form["Status"] || "Activate",
  });
  

  const handleChange = (label, value) => {
    setForm((prev) => ({ ...prev, [label]: value }));
  };

  if (!client) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        No client selected
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2 text-black font-semibold text-sm">
          <Edit className="w-4 h-4" />
          Entity Editor
        </div>
        
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-1 text-xs p-2 h-full">
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
                value={form[label] || ""}
                className="col-span-1 border border-gray-300 px-2 py-1 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
                onChange={(e) => handleChange(label, e.target.value)}
              />
            </React.Fragment>
          ))}

          {/* Executive ID */}
          <label className="col-span-1 flex items-center text-gray-700">Executive ID:</label>
          <input
            type="text"
            value={client.id}
            disabled
            className="col-span-1 border border-gray-300 px-2 py-1 bg-gray-100 text-xs"
          />

          {/* Company Size */}
          <label className="col-span-1 flex items-center text-gray-700">Company Size:</label>
          <select
            value={form["Company Size"] || ""}
            onChange={(e) => handleChange("Company Size", e.target.value)}
            className="col-span-1 border border-gray-300 px-2 py-1 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <option value="">Select Size</option>
            {companySizes.map((size, i) => (
              <option key={i} value={size}>
                {size}
              </option>
            ))}
          </select>

          {/* Status */}
          <label className="col-span-1 flex items-center text-gray-700">Status:</label>
          <select
            value={form["Status"] || "Activate"}
            onChange={(e) => handleChange("Status", e.target.value)}
            className="col-span-1 border border-gray-300 px-2 py-1 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <option value="Activate">Activate</option>
            <option value="Deactivate">Deactivate</option>
          </select>

          {/* Save Button */}
          <div className="col-span-2 pt-4 flex justify-end gap-2">
            <button
                type="button"
                onClick={() => {
                  const updatedClient = {
                    ...client,
                    ...mapFormToClient(form),
                  };
                  console.log("Saving client:", updatedClient);
                  onSave(updatedClient);
                }}
                
                className="px-4 py-1 bg-gray-200 hover:bg-gray-300 text-xs"
              >
                Edit
              </button>

          </div>
        </div>
      </div>
    </div>
  );
}
