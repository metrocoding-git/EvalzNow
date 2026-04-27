import { getUnitByCandidateId } from "@/services/unitRosterService";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function ReviewCandidate({ candidate }) {
  if (!candidate) {
    return (
      <div className="p-4 text-gray-600">
        No candidate selected for review.
      </div>
    );
  }

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");


  const filteredUnits = units.filter((unit) => {
    const term = searchTerm.toLowerCase();
  
    return (
      unit.unitId?.toLowerCase().includes(term) ||
      unit.unitName?.toLowerCase().includes(term) ||
      unit.status?.toLowerCase().includes(term)
    );
  });

   // Fetch all units by candidate ID
   useEffect(() => {
    const fetchUnitByCandidatesId = async () => {
      try {
        setLoading(true);
        const data = await getUnitByCandidateId(candidate.id);

        console.log("units", data);
        // Ensure it's an array, otherwise fallback
        if (Array.isArray(data)) {
          setUnits(data);
        } else {
          setUnits([]);
        }
      } catch (err) {
        console.error("Failed to fetch candidates:", err);
        setError("Failed to load units. Showing mock data instead.");
      } finally {
        setLoading(false);
      }
    };

    fetchUnitByCandidatesId();
  }, [candidate.id]);


  // Mock unit data (simulate DB response)
  const mockUnits = [
    { id: "U001", name: "Unit Alpha", status: "Active" },
    { id: "U002", name: "Unit Beta", status: "Inactive" },
    { id: "U003", name: "Unit Gamma", status: "Active" },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Review: {candidate.lastName?.trim()} {candidate.firstName}{" "} {candidate.candidateId}
        </h2>

        <div className="relative mt-1 w-70">
          <input
            type="text"
            className="border w-full pl-2 pr-8 py-1 text-sm bg-white"
            placeholder="Search"
            value={searchTerm}               
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
        </div>
      </div>
      

      <div className="border-t border-gray-200 pt-2">
        <h3 className="text-md font-medium text-gray-800 mb-2">
          Connected Units
        </h3>
        <ul className="grid grid-cols-2 gap-3">

          {filteredUnits.length === 0 && !loading && (
            <li className="text-gray-500">No units found.</li>
          )}

          
          {filteredUnits.map((unit) => (
            <li
              key={unit.id}
              className="p-3 bg-gray-100 border border-gray-300 shadow-sm flex gap-3"
            >
              <div className="text-sm text-gray-600">Unit ID: {unit.unitId}</div>
              <div className="text-sm text-gray-600">Unit Name: <span className="font-semibold">{unit.unitName}</span></div>
              <div className="text-sm text-gray-600">Status: {unit.status}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
