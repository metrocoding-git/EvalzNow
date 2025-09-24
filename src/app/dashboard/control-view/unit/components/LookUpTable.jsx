// SearchLookup.js - Create this as a separate component file
"use client";
import { getAllCandidates } from "@/services/candidateService";
import { createUnitRoster } from "@/services/unitRosterService";
import { X, Search, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function SearchLookup({ onClose, selectedUnit, refreshRoster, refreshCandidateData}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("lastName");
  const [sortOrder, setSortOrder] = useState("asc");
  const searchInputRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [candidateData, setCandidateData] = useState([]);
  
  
// Fetch all candidates on mount
useEffect(() => {
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await getAllCandidates();
      setCandidateData(Array.isArray(data) ? data : []); // ✅ store in state
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
      setError("Failed to load candidates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  fetchCandidates();
}, []);

  // Filter data based on search term
  const filteredData = candidateData.filter(candidate =>
    candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.candidateId.toLowerCase().includes(searchTerm.toLowerCase())
    // candidate.specialIdNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // candidate.dateOfBirth.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  // Sort filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    const fieldA = (a[sortField] || "").toLowerCase();
    const fieldB = (b[sortField] || "").toLowerCase();
    if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
  
  

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  // Focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);


  

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-white shadow-xl w-11/12 max-w-4xl max-h-[80vh] border-1 border-gray-400 flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200  flex justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Candidate Lookup</h2>
          <X className="hover:bg-gray-200 rounded-sm  p-1 text-gray-500" onClick={onClose} />

          
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by name, candidate ID, or special ID..."
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>

        {/* Column Headers */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-6 gap-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
            <div className="flex items-center justify-center cursor-pointer hover:text-gray-900 transition-colors">Action</div>
            <div
              className="flex items-center justify-center cursor-pointer hover:text-gray-900 transition-colors"
              onClick={() => handleSort("lastName")}
            >
              Last Name
              {sortField === "lastName" && (
                <span className="ml-1">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
              )}
            </div>
            <div
              className="flex items-center   justify-center cursor-pointer hover:text-gray-900 transition-colors"
              onClick={() => handleSort("firstName")}
            >
              First Name
              {sortField === "firstName" && (
                <span className="ml-1">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
              )}
            </div>
            <div
              className="flex items-center  justify-center cursor-pointer hover:text-gray-900 transition-colors"
              onClick={() => handleSort("candidateId")}
            >
              Candidate ID
              {sortField === "candidateId" && (
                <span className="ml-1">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
              )}
            </div>
            <div
              className="flex items-center justify-center  cursor-pointer hover:text-gray-900 transition-colors"
              onClick={() => handleSort("specialIdNo")}
            >
              Special ID No.
              {sortField === "specialIdNo" && (
                <span className="ml-1">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
              )}
            </div>
            <div
              className="flex items-center  justify-center cursor-pointer hover:text-gray-900 transition-colors"
              onClick={() => handleSort("dateOfBirth")}
            >
              Date of Birth
              {sortField === "dateOfBirth" && (
                <span className="ml-1">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
          {sortedData.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">No candidates found matching your search.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sortedData.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`grid grid-cols-6 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${selectedIds.includes(candidate.id) ? "bg-gray-200" : "hover:bg-gray-100"}`}
                  onClick={() => toggleSelect(candidate.id)}
                >
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(candidate.id)}
                      onChange={() => toggleSelect(candidate.id)}
                      onClick={() => toggleSelect(candidate.id)}
                      className="w-4 h-4 text-sm text-center font-medium text-gray-900 rounded focus:ring-blue-500"
                    /> 
                  </div>

                  <div className="text-sm text-center font-medium text-gray-900 truncate">
                    {candidate.lastName}
                  </div>
                  <div className="text-sm  text-center text-gray-900 truncate">
                    {candidate.firstName}
                  </div>
                  <div className="text-sm  text-center text-gray-900 font-mono truncate">
                    {candidate.candidateId}
                  </div>
                  <div className="text-sm  text-center text-gray-900 font-mono truncate">
                    {candidate.specialIdNo}
                  </div>
                  <div className="text-sm  text-center text-gray-900 truncate">
                    {new Date(candidate.dateOfBirth).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {sortedData.length} of {candidateData.length} candidates
          </p>
          <button
            type="button"
            onClick={async () => {
              try {
                const selectedCandidates = candidateData.filter(c =>
                  selectedIds.includes(c.id)
                );
            
                for (const candidate of selectedCandidates) {
                  const payload = {
                    unitId: selectedUnit?.id || selectedUnit?.unitId,
                    candidateId: candidate.id,
                    presentCount: 0,
                    excusedAbsences: 0,
                    unexcusedAbsences: 0,
                    excusedTardies: 0,
                    unexcusedTardies: 0,
                    unitOutcome: "Ongoing",
                  };
            
                  await createUnitRoster(payload);
                }
            
                console.log("✅ All candidates added to roster");

                if (refreshRoster) {
                  await refreshRoster();
                }
                
                if (refreshCandidateData) {
                  await refreshCandidateData();
                }

                onClose();
              } catch (err) {
                console.error("❌ Error creating roster:", err);
                alert("Failed to add candidates to roster. Please try again.");
              }
            }}
            
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}