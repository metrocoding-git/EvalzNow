"use client";
import React, { useState, useEffect } from "react";
import { Edit, X } from "lucide-react";
import { updateClient } from "@/services/clientService";
import { getCompanySize } from "@/services/companyService";

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

export default function ClientEditor({ client, onClose, onSave, showForm }) {
  const [form, setForm] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [companySize, setCompanySize] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (client) {
      setForm({
        "Executive Last Name": client.lastName || "",
        "Executive First Name": client.firstName || "",
        "Executive Job Title": client.jobTitle || "",
        "Executive E-mail Address": client.emailAddress || "", // Fixed field name to match backend
        "Company Name": client.companyName || "",
        "Company Contact Number": client.companyContactNumber || "", // Fixed field name
        "Institutional Type": client.institutionalType || "", // Fixed field name
        "Business Registration No.": client.businessRegistrationNo || "", // Fixed field name
        Country: client.country || "",
        "Company Size": client.companySizeId || "", // Changed to companySizeId to match backend
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
  

  const handleChange = (label, value) => {
    setForm((prev) => ({ ...prev, [label]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Map form fields to match your backend model
      const updatedData = {
        lastName: form["Executive Last Name"],
        firstName: form["Executive First Name"],
        jobTitle: form["Executive Job Title"],
        emailAddress: form["Executive E-mail Address"],
        companyName: form["Company Name"],
        companyContactNumber: form["Company Contact Number"],
        institutionalType: form["Institutional Type"],
        businessRegistrationNo: form["Business Registration No."],
        country: form["Country"],
        companySizeId: form["Company Size"], // Make sure this matches your backend
        status: form["Status"],
      };

      // Call the update API
      const updatedClient = await updateClient(client.id, updatedData);
      
      // Notify parent component
      onSave(updatedClient);
    } catch (error) {
      console.error("Update error:", error);
      setError(error.response?.data?.message || "Failed to update client");
    } finally {
      setIsSubmitting(false);
    }
  };

  // if (!client) {
  //   return (
  //     <div className="h-full flex items-center justify-center text-gray-500 text-sm">
  //     </div>
  //   );
  // }

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2 text-black font-semibold text-sm">
          <Edit className="w-4 h-4" />
          Entity Editor
        </div>
        
      </div>

      {!client ? (
        <div className="flex-1 flex items-center justify-center p-4 text-gray-500 text-sm">

        </div>
      ) : showForm ? (

     
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
            value={client.executiveId}
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
            {companySize.map((size, i) => (
                <option key={i} value={size.id}> {/* Use size.id as value if needed */}
                  {size.tier} - {size.size} {/* Access the properties you want to display */}
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
                onClick={handleSubmit}
                
                className="px-4 py-1 bg-gray-200 hover:bg-gray-300 text-xs"
              >
                Edit
              </button>

          </div>
        </div>
      </div> ) : (
        <div className="p-4 text-gray-500 text-sm">No form to display.</div>
      )}
    </div>
  );
}
