"use client";
import { createClient } from "@/services/clientService";
import { getCompanySize } from "@/services/companyService";
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


export default function CreateClientForm({ onClose, onCreate }) {
  const [form, setForm] = useState({});
  const [executiveId, setExecutiveId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companySize, setCompanySize] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setExecutiveId(generateExecutiveId());
  }, []);

  const handleChange = (label, value) => {
    setForm((prev) => ({ ...prev, [label]: value }));
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    const requiredFields = [
      "Executive Last Name",
      "Executive First Name",
      "Executive Job Title",
      "Executive E-mail Address",
      "Company Name",
      "Company Contact Number",
      "Institutional Type",
      "Business Registration No.",
      "Country",
      "Company Size",
      "Status"
    ];

    return requiredFields.every((field) => form[field] && form[field].trim() !== "");
  };


  useEffect(() => {
    const fetchCompanySize = async () => {
      try {
        setLoading(true);
        const data = await getCompanySize(); // Directly get data
        setCompanySize(data);
        console.log(data);
        if (!data) {
          throw new Error("No data received");
        }

      } catch (err) {
        console.error("Failed to fetch clients:", err);
        setError("Failed to load clients. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchCompanySize();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    try {
      const clientData = {
        lastName: form["Executive Last Name"],
        firstName: form["Executive First Name"],
        jobTitle: form["Executive Job Title"],
        emailAddress: form["Executive E-mail Address"],
        companyName: form["Company Name"],
        companyContactNumber: form["Company Contact Number"],
        institutionalType: form["Institutional Type"],
        businessRegistrationNo: form["Business Registration No."],
        country: form["Country"],
        companySizeId: form["Company Size"],
        status: form["Status"] || "Activate",
        executiveId: executiveId // Make sure to include this
      };
  
      onCreate(clientData);
      onClose();
      
    } catch (err) {
      console.error("Failed to create client:", err);
      // Try to get more detailed error message
      const errorMessage = err.response?.data?.message ||  err.message ||  "Failed to create client";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full w-full bg-white z-20 border shadow-2xl border-gray-200">
     
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 text-black font-semibold">
          <ListFilterPlus className="w-5 h-5" />
          Create Client
        </div>

        {/* Close icon */}
        <button
          onClick={onClose}
          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
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
                   type={label.includes("E-mail") ? "email" : "text"}
                  className="col-span-1 border border-gray-300 px-2 py-1 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                  onChange={(e) => handleChange(label, e.target.value)}
                  required
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
              required 
              onChange={(e) => handleChange("Company Size", e.target.value)}
              className="col-span-1 border border-gray-300 px-2 py-1 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="" disabled>
                Select Size
              </option>
              {companySize.map((size, i) => (
                <option key={i} value={size.id}> {/* Use size.id as value if needed */}
                  {size.tier} - {size.size} {/* Access the properties you want to display */}
                </option>
              ))}
            </select>

            {/* Status */}
            <label className="col-span-1 flex items-center text-gray-700">
              Status:
            </label>
            <select
               required
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
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className={`px-4 py-1 bg-gray-200 hover:bg-gray-300 text-sm transition-colors ${
                !isFormValid() || isSubmitting
                  ? "cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      
    </form>
  );
}
