"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useUnit } from "@/context/UnitContext";
import { getUniRostertByUnitId } from "@/services/unitRosterService";
import { getAssessmentBlockByUnitId } from "@/services/assessmentBlockManagerService";
import { getInsertScoresByUnitId } from "@/services/insertScoreService";

export default function CandidateSelectionTable({ rows, setRows, onClose }) {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const { selectedUnitId, setSelectedUnitId } = useUnit();
  const selectedUnitId = sessionStorage.getItem("selectedUnitId");

  const [data, setData] = useState([]);
  const ppIdOptions = ["1", "2", "3", "4", "5"];

  // const [rows, setRows] = useState([
  //   { id: 1, lastName: "Smith", firstName: "John", candidateId: "C001", value: "Omit", ppListings: "", isSelected: false },
  //   { id: 2, lastName: "Doe", firstName: "Jane", candidateId: "C002", value: "Omit", ppListings: "", isSelected: false },
  //   { id: 3, lastName: "Brown", firstName: "Alice", candidateId: "C003", value: "Omit", ppListings: "", isSelected: false },
  //   { id: 4, lastName: "Johnson", firstName: "Mike", candidateId: "C004", value: "Omit", ppListings: "", isSelected: false },
  // ]);

  useEffect(() => {
    if (!selectedUnitId || rows.length > 0) return;
  
    const fetchCandidates = async () => {
      try {
        setLoading(true);
  
        const roster = await getInsertScoresByUnitId(selectedUnitId);
  
        if (!Array.isArray(roster) || roster.length === 0) {
          setRows([]);
          redirect("/dashboard/setup-view/unit");
          return;
        }

        console.log("RAW PP DATA:", roster.map(r => ({
          candidate: r.candidate.id,
          ppId: r.ppId,
          subPpId: r.subPpId
        })));
  
        // --- 1. UNIQUE CANDIDATES ---
        const candidateMap = new Map();
        roster.forEach((item) => {
          candidateMap.set(item.candidate.id, item.candidate);
        });
  
        const uniqueCandidates = [...candidateMap.values()].sort(
          (a, b) => a.id - b.id
        );
  
        // --- 2. UNIQUE POSITIVE PP IDs ---
        const ppMap = {}; // key = candidateId, value = [unique ppIDs]
  
        roster.forEach((item) => {
          const cid = item.candidate.id;
  
          if (!ppMap[cid]) ppMap[cid] = [];
  
          const pp = Number(item.ppId);
  
          // Only include POSITIVE PP IDs
          if (pp > 0 && !ppMap[cid].includes(pp)) {
            ppMap[cid].push(pp);
          }
        });
  
        // --- 3. BUILD FINAL ROWS ---
        const finalRows = uniqueCandidates.map((c) => ({
          id: c.id,
          lastName: c.lastName,
          firstName: c.firstName,
          candidateId: c.candidateId,
          value: "Omit",
          ppListings: "",
          isSelected: false,
          availablePP: ppMap[c.id] || []
        }));
  
        setRows(finalRows);
      } catch (err) {
        console.error("Error loading roster:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [selectedUnitId]);
  

  const handleValueChange = (id, newValue) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          if (newValue === "Candidate Average") {
            // Automatically populate sample numbers
            return { ...row, value: newValue, ppListings: "" , isSelected: false};
          } else {
            return { ...row, value: newValue, ppListings: "", isSelected: false };
          }
        }
        return row;
      })
    );
  };

  const handlePPChange = (id, value) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ppListings: value } : row))
    );
  };

  const handleRowClick = (id) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id && row.value !== "Omit"
          ? { ...row, isSelected: !row.isSelected }
          : row
      )
    );
  };

  const handleCloseClick = () => {
  const selectedRows = rows.filter((row) => row.isSelected);

  // Build candidatePpList for API
  const candidatePpList = selectedRows.map((row) => ({
    candidateId: row.id,
    ppId: row.ppListings ? Number(row.ppListings) : null
  }));

  onClose({
    selectedRows,
    candidatePpList
  });
};


  const selectedCount = rows.filter(row => row.isSelected).length;
  const isSubmitEnabled = selectedCount >= 3;

  return (
    <div className="fixed inset-0 bg-black/0 backdrop-blur-xs flex justify-center items-center z-50 border shadow-2xl border-gray-200">
      <div className="bg-white w-[900px] border shadow-2xl border-gray-200">
        <div className="flex justify-between items-center  bg-gray-100 px-2 py-1 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Distribution Form</h2>
          <button onClick={onClose} className="cursor-pointer p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors">
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Table */}
        <div className="p-6 text-xs">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 border">Last Name</th>
                <th className="px-2 py-1 border">First Name</th>
                <th className="px-2 py-1 border">Candidate ID</th>
                <th className="px-2 py-1 border">Selection</th>
                <th className="px-2 py-1 border">Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row.id)}
                  className={`cursor-pointer ${row.isSelected ? "bg-gray-100 " : ""} ${row.value === "Omit" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <td className="px-2 py-1 border text-center">{row.lastName}</td>
                  <td className="px-2 py-1 border text-center">{row.firstName}</td>
                  <td className="px-2 py-1 border text-center">{row.candidateId}</td>
                  <td className="px-2 py-1 border text-center">
                    <select
                      className="border rounded p-1"
                      value={row.value}
                      onChange={(e) => handleValueChange(row.id, e.target.value)}
                    >
                      <option value="Omit">Omit Candidate</option>
                      <option value="Candidate Average">Candidate Average</option>
                      <option value="Available + PP ID Listings">Available by PP ID</option>
                    </select>
                  </td>
                  <td className="px-2 py-1 border text-center">
                    {row.value === "Available + PP ID Listings" && (
                      <select
                        className="border rounded p-1 w-full"
                        value={row.ppListings}
                        onChange={(e) => handlePPChange(row.id, e.target.value)}
                      >
                        <option value="">Select PP ID</option>

                        {row.availablePP.length > 0 ? (
                          row.availablePP.map((pp) => (
                            <option key={pp} value={pp}>{pp}</option>
                          ))
                        ) : (
                          <option disabled>No PP IDs</option>
                        )}
                      </select>
                    )}

                    {row.value === "Candidate Average" && (
                      <span className="block text-center">{row.ppListings}</span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        

        <div className="border-t border-gray-300 py-2 px-6 bg-gray-50 flex-shrink-0">
          <div className="flex justify-end items-center ">
            <button
              onClick={handleCloseClick}
              disabled={!isSubmitEnabled}
              className={`px-4 py-1 text-sm transition-colors ${isSubmitEnabled ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-300 cursor-not-allowed"}`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
