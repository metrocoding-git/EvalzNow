// SearchLookup.js - Create this as a separate component file
"use client";
import { getAllCandidates } from "@/services/candidateService";
import { X, Search, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function SearchLookup({ onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("lastName");
  const [sortOrder, setSortOrder] = useState("asc");
  const searchInputRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [candidateData, setCandidateData] = useState([]);
  // Sample data - replace with your database data later
  // const candidateData = [
    // {
    //   id: "C001",
    //   lastName: "Perera",
    //   firstName: "Sadeesha",
    //   candidateId: "CAND-2024-001",
    //   specialIdNo: "SP-001-2024",
    //   dateOfBirth: "1990-05-15"
    // },
    // {
    //   id: "C002",
    //   lastName: "Silva",
    //   firstName: "Nadeesha",
    //   candidateId: "CAND-2024-002",
    //   specialIdNo: "SP-002-2024",
    //   dateOfBirth: "1988-08-22"
    // },
    // {
    //   id: "C003",
    //   lastName: "Fernando",
    //   firstName: "Kasun",
    //   candidateId: "CAND-2024-003",
    //   specialIdNo: "SP-003-2024",
    //   dateOfBirth: "1992-12-10"
    // },
    // {
    //   id: "C004",
    //   lastName: "Gunasekara",
    //   firstName: "Dilani",
    //   candidateId: "CAND-2024-004",
    //   specialIdNo: "SP-004-2024",
    //   dateOfBirth: "1985-03-28"
    // },
    // {
    //   id: "C005",
    //   lastName: "Jayasinghe",
    //   firstName: "Tharindu",
    //   candidateId: "CAND-2024-005",
    //   specialIdNo: "SP-005-2024",
    //   dateOfBirth: "1991-07-14"
    // },
    // {
    //   id: "C006",
    //   lastName: "Wijeratne",
    //   firstName: "Chamika",
    //   candidateId: "CAND-2024-006",
    //   specialIdNo: "SP-006-2024",
    //   dateOfBirth: "1987-11-05"
    // },
    // {
    //   id: "C007",
    //   lastName: "Mendis",
    //   firstName: "Sachini",
    //   candidateId: "CAND-2024-007",
    //   specialIdNo: "SP-007-2024",
    //   dateOfBirth: "1993-01-18"
    // },
    // {
    //   id: "C008",
    //   lastName: "Rathnayake",
    //   firstName: "Nuwan",
    //   candidateId: "CAND-2024-008",
    //   specialIdNo: "SP-008-2024",
    //   dateOfBirth: "1989-09-30"
    // }
  // ];

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
    candidate.candidateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.specialIdNo.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="grid grid-cols-5 gap-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
            <div
              className="flex items-center cursor-pointer hover:text-gray-900 transition-colors"
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
              className="flex items-center cursor-pointer hover:text-gray-900 transition-colors"
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
              className="flex items-center cursor-pointer hover:text-gray-900 transition-colors"
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
              className="flex items-center cursor-pointer hover:text-gray-900 transition-colors"
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
              className="flex items-center cursor-pointer hover:text-gray-900 transition-colors"
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
                  className={`grid grid-cols-5 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${selectedIds.includes(candidate.id) ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  onClick={() => toggleSelect(candidate.id)}
                >
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {candidate.lastName}
                  </div>
                  <div className="text-sm text-gray-900 truncate">
                    {candidate.firstName}
                  </div>
                  <div className="text-sm text-gray-900 font-mono truncate">
                    {candidate.candidateId}
                  </div>
                  <div className="text-sm text-gray-900 font-mono truncate">
                    {candidate.specialIdNo}
                  </div>
                  <div className="text-sm text-gray-900 truncate">
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
            onClick={() => {
              // Find selected candidates
              const selectedCandidates = candidateData.filter(c =>
                selectedIds.includes(c.id)
              );
              console.log("Selected Candidates:", selectedCandidates);
          
              // Optionally pass them back to parent
              if (onSelect) {
                onSelect(selectedCandidates);
              }
          
              // Close the modal
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white  border border-gray-300 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}