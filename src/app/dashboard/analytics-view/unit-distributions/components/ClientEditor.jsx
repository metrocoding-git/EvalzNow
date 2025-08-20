"use client";
import { Edit } from "lucide-react";
import React, { useState } from "react";

export default function ClientEditor({ client }) {
  const [valueOption, setValueOption] = useState("Omit Candidate");
  const [selectedPpId, setSelectedPpId] = useState("");

  const availablePpIds = ["PP101", "PP102", "PP103", "PP104"];

  // Sample client if not passed
  const sampleClient = client || {
    firstName: "John",
    lastName: "Doe",
    id: "001",
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Section Header */}
      <div className="flex items-center bg-gray-100 px-4 py-1.5 border-b border-gray-300">
        <div className="flex items-center gap-2 text-black font-semibold text-sm">
            <Edit className="w-4 h-4" />
            Entity Editor
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 text-sm">
        {/* Candidate Info */}
        <div className="flex flex-col gap-1 text-xs p-2">
          <p>Last Name: {sampleClient.lastName}</p>
          <p>First Name: {sampleClient.firstName}</p>
          <p>Candidate ID: {sampleClient.id}</p>
        </div>

        {/* Value Selection */}
        <div className="gap-1 text-xs p-2">
          <label className="block font-medium text-gray-700 mb-1">Value</label>
          <select
            value={valueOption}
            onChange={(e) => setValueOption(e.target.value)}
            className="border px-2 py-1 w-full"
          >
            <option>Omit Candidate</option>
            <option>Candidate Average</option>
            <option>Available +PP ID Listings</option>
          </select>
        </div>

        {/* Conditionally render PP ID selector */}
        {valueOption === "Available +PP ID Listings" && (
          <div className="gap-1 text-xs p-2">
            <label className="block font-medium text-gray-700 mb-1">
              Select PP ID
            </label>
            <select
              value={selectedPpId}
              onChange={(e) => setSelectedPpId(e.target.value)}
              className="border px-2 py-1 w-full"
            >
              <option value="">-- Select PP ID --</option>
              {availablePpIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
        )} 
        
        {/* Buttons */} 
        <div className="col-span-2 pt-4 flex justify-end gap-2"> 
          <button type="button" className="px-4 py-1 bg-gray-200 hover:bg-gray-300 text-xs transition-colors"
           onClick={() => { 
            // Save form data here if needed 
             console.log("Saving client data:", form); }}  > 
             Cancel 
          </button> 
        </div>

      </div>
    </div>
  );
}
