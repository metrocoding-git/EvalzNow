"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { Toaster } from "react-hot-toast";
import useActiveCapsule from "./useActiveCapsule";
import CapacityAccounting from "./CapacityAccounting";
import CreateCapsuleScoreForm from "./CreateCapsuleScoreForm";
import CapsuleScoreEditor from "./CapsuleScoreEditor";

/** Candidate list header + "Details" box – shared by Insert Scores and Preview. */
export function CapsuleSidebar({ capsule, candidates, selected, onSelect, columns = ["lastName", "firstName", "candidateId"] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenu, setOpenMenu] = useState(true);
  const [sort, setSort] = useState({ col: "lastName", dir: "asc" });

  const list = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return [...candidates]
      .filter((c) => [c.firstName, c.lastName, c.candidateId].some((v) => String(v || "").toLowerCase().includes(term)))
      .sort((a, b) => {
        const r = String(a[sort.col] ?? "").localeCompare(String(b[sort.col] ?? ""), undefined, { numeric: true });
        return sort.dir === "asc" ? r : -r;
      });
  }, [candidates, searchTerm, sort]);

  const label = { lastName: "Last Name", firstName: "First Name", candidateId: "Candidate ID" };

  return (
    <>
      <div className="flex flex-col items-center bg-gray-100 px-4 py-2 border-b border-gray-300">
        <div className="relative w-full mb-2">
          <input
            type="text"
            className="border w-full pl-2 pr-8 py-1 text-sm bg-white"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
        </div>
        <div className="grid grid-cols-3 gap-1 text-gray-800 font-semibold text-sm w-full">
          {columns.map((col) => (
            <button
              key={col}
              onClick={() => setSort((s) => ({ col, dir: s.col === col && s.dir === "asc" ? "desc" : "asc" }))}
              className="flex items-center space-x-1 hover:underline"
            >
              <span>{label[col]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex items-center cursor-pointer select-none hover:bg-gray-50 px-4 py-2" onClick={() => setOpenMenu(!openMenu)}>
          <span className={`transition-transform duration-200 text-gray-600 mr-1 ${openMenu ? "rotate-90" : "rotate-0"}`}>
            <ChevronRight />
          </span>
          <span className={`text-md text-gray-800 ml-2 ${openMenu ? "font-bold text-black" : ""}`}>Details</span>
        </div>
        {openMenu && (
          <>
            <div className="px-4">
              {!capsule ? (
                <div className="px-4 py-6 text-center text-gray-500">No Capsule Selected.</div>
              ) : (
                <div className="border border-gray-200 p-2">
                  <p className="text-sm text-gray-600">Capsule Name: {capsule.capsuleName || "N/A"}</p>
                  <p className="text-sm text-gray-600">Capsule ID: {capsule.capsuleId || "N/A"}</p>
                  <p className="text-sm text-gray-600">Capsule Type: {capsule.capsuleType || "N/A"}</p>
                  <p className="text-sm text-gray-600">Signature Profile: {capsule.signatureProfile || "N/A"}</p>
                </div>
              )}
            </div>
            <div className="mt-2">
              {list.length === 0 ? (
                <div className="px-4 py-3 text-center text-gray-500">No candidates found for this capsule.</div>
              ) : (
                list.map((item) => (
                  <div
                    key={item.id}
                    className={`grid grid-cols-3 gap-1 items-center px-4 py-1 text-sm cursor-pointer ${selected?.id === item.id
                      ? "bg-blue-100 border-l-4 border-l-blue-400 text-black"
                      : "hover:bg-gray-50"}`}
                    onClick={() => onSelect(item)}
                  >
                    {columns.map((col) => <div key={col}>{item[col]}</div>)}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

/** Setup View → Insert Scores when a capsule is active. */
export default function CapsuleInsertScores() {
  const { capsule, candidates, markerNames, markerName, reloadMarkers } = useActiveCapsule();
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("Indirect");
  const [selectedRow, setSelectedRow] = useState(null);
  const [scoreAdd, setScoreAdd] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!selected && candidates.length) setSelected(candidates[0]);
  }, [candidates, selected]);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-1/2 lg:w-4/12 flex flex-col border-1 h-full border-gray-200">
        <div className="flex-grow flex flex-col h-1/2 min-h-0">
          <CapsuleSidebar
            capsule={capsule}
            candidates={candidates}
            selected={selected}
            onSelect={(c) => { setSelected(c); setSelectedRow(null); }}
          />
        </div>
        <div className="h-1/2 overflow-auto my-2 border-t border-gray-200">
          {capsule && (
            <CapsuleScoreEditor
              capsule={capsule}
              row={selectedRow}
              markerName={markerName}
              onSaved={(saved) => { setSelectedRow(saved); setRefreshTrigger((n) => n + 1); }}
            />
          )}
        </div>
      </div>

      <div className="flex-1 bg-white flex flex-col overflow-y-auto">
        {scoreAdd && capsule && selected && (
          <div className="w-1/2 lg:w-9/12 bg-white h-full">
<<<<<<< HEAD
            {/* Wider than the unit form so every clinical marker label stays on one line */}
            <div className="h-full flex flex-col w-full max-w-[900px]">
=======
            <div className="h-full flex flex-col w-5/7">
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb
              <CreateCapsuleScoreForm
                capsule={capsule}
                candidate={selected}
                markerName={markerName}
                onClose={() => setScoreAdd(false)}
                onSaved={() => setRefreshTrigger((n) => n + 1)}
              />
            </div>
          </div>
        )}
        {!scoreAdd && capsule && (
          <CapacityAccounting
            capsule={capsule}
            candidateId={selected?.id}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedRow={selectedRow}
            setSelectedRow={setSelectedRow}
            onAdd={() => selected && setScoreAdd(true)}
            refreshTrigger={refreshTrigger}
            markerNames={markerNames}
            onMarkersChanged={() => reloadMarkers(capsule.id)}
          />
        )}
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
