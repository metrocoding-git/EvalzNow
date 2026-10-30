"use client";
import React, { useEffect, useState } from "react";
import { Edit } from "lucide-react";
import useCapsuleAnalytics from "./useCapsuleAnalytics";

/** Toggle switch used in the Secondary Input Area (same look as the unit screens). */
export function Toggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} className="relative w-12 h-6 cursor-pointer">
      <div className={`absolute inset-0 rounded-full transition-colors duration-300 ${on ? "bg-gray-600" : "bg-gray-300"}`} />
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${on ? "translate-x-6" : "translate-x-0"}`} />
    </div>
  );
}

/** Secondary Input Area – PP ID range, Critical Reference range, optional Thresholds toggle + extra fields. */
export function SecondaryInputArea({ onSubmit, resetSignal, showThresholds = true, showRanges = true, extra = null, extraValues = {} }) {
  const [v, setV] = useState({ ppIdFrom: "", ppIdTo: "", criticalDateFrom: "", criticalDateTo: "", thresholdEnabled: false });
  useEffect(() => {
    setV({ ppIdFrom: "", ppIdTo: "", criticalDateFrom: "", criticalDateTo: "", thresholdEnabled: false });
  }, [resetSignal]);
  const set = (k, val) => setV((p) => ({ ...p, [k]: val }));

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex justify-between items-center bg-gray-100 px-4 py-1 border-b border-gray-300">
        <div className="flex items-center text-sm gap-2 text-gray-800 font-semibold">
          <Edit className="w-5 h-5" />
          Secondary Input Area
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-1 text-xs">
        {showRanges && (
          <>
            <div className="gap-1 text-xs p-2">
              <label className="block font-medium text-gray-700 mb-1">PP ID Range</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center">
                  <label className="w-1/2">From:</label>
                  <input type="number" value={v.ppIdFrom} onChange={(e) => set("ppIdFrom", e.target.value === "" ? "" : parseInt(e.target.value, 10))} className="border px-2 py-1 w-full" placeholder="From (e.g., -3)" />
                </div>
                <div className="flex items-center">
                  <label className="w-1/2">To:</label>
                  <input type="number" value={v.ppIdTo} onChange={(e) => set("ppIdTo", e.target.value === "" ? "" : parseInt(e.target.value, 10))} className="border px-2 py-1 w-full" placeholder="To (e.g., 3)" />
                </div>
              </div>
            </div>
            <div className="w-full gap-1 text-xs p-2">
              <label className="block font-medium text-gray-700 mb-1">Critical Reference Range</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center">
                  <label className="w-1/2">From:</label>
                  <input type="date" value={v.criticalDateFrom} onChange={(e) => set("criticalDateFrom", e.target.value)} className="border px-2 py-1 w-full" />
                </div>
                <div className="flex items-center">
                  <label className="w-1/2">To:</label>
                  <input type="date" value={v.criticalDateTo} onChange={(e) => set("criticalDateTo", e.target.value)} className="border px-2 py-1 w-full" />
                </div>
              </div>
            </div>
          </>
        )}
        {showThresholds && (
          <div className="flex items-center justify-between p-2">
            <label className="font-medium text-gray-800">Thresholds</label>
            <Toggle on={v.thresholdEnabled} onChange={(on) => set("thresholdEnabled", on)} />
          </div>
        )}
        {typeof extra === "function" ? extra(v, set) : extra}
      </div>
      <div className="border-t border-gray-200 p-2 bg-gray-50">
        <div className="flex justify-end">
          <button type="button" onClick={() => onSubmit({ ...v, ...extraValues })} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm transition-colors">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Layout of a capsule analytics screen (same structure as the unit screens):
 * left = candidate list + Details + Secondary Input Area; right = level selector + the screen content.
 *
 * children(ctx) renders the right panel; ctx = useCapsuleAnalytics() state.
 */
export default function CapsuleAnalyticsShell({
  levels = true, defaultLevel = "candidate", secondary = {}, children, onlyCandidateList = false,
}) {
  const ctx = useCapsuleAnalytics({ defaultLevel });
  const { capsule, candidates, level, setLevel, activeCandidateId, setActiveCandidateId, selectedCandidateIds,
    toggleCandidate, setFilters, resetSignal, ready } = ctx;
  const [openMenu, setOpenMenu] = useState(true);
  const [sort, setSort] = useState({ key: "lastName", dir: "asc" });

  const sorted = [...candidates].sort((a, b) => {
    const r = String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? ""), undefined, { numeric: true });
    return sort.dir === "asc" ? r : -r;
  });
  const capsuleLevel = level === "capsule";
  const sortBy = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  if (ready && !capsule) {
    return <div className="p-8 text-center text-gray-500">No Capsule Selected. Activate a capsule in Control View → Capsule (ESC + 3).</div>;
  }

  return (
    <div className="w-full flex flex-col">
      <div className="h-full flex flex-col overflow-hidden mx-1 px-1">
        <div className="flex-1 overflow-auto bg-white">
          <div className="flex h-full overflow-hidden w-full">
            {/* Sidebar */}
            <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-gray-200">
              <div className={`flex-grow border-gray-300 flex flex-col ${onlyCandidateList ? "h-full" : "h-1/2"}`}>
                <div className={`bg-gray-100 py-2 border-b border-gray-300 grid ${capsuleLevel ? "grid-cols-4" : "grid-cols-3"} px-4 text-gray-800 font-semibold text-sm`}>

                  <div onClick={() => sortBy("lastName")} className="cursor-pointer">Last Name</div>
                  <div onClick={() => sortBy("firstName")} className="cursor-pointer">First Name</div>
                  <div onClick={() => sortBy("candidateId")} className="cursor-pointer">Candidate ID</div>
                </div>
                <div className="flex-1 overflow-auto">
                  <div className="px-3 py-1">
                    <div className="flex items-center cursor-pointer select-none hover:bg-blue-50 rounded-md px-2 py-1" onClick={() => setOpenMenu(!openMenu)}>
                      <span className={`transition-transform duration-200 text-gray-600 mr-1 ${openMenu ? "rotate-90" : "rotate-0"}`}>▶</span>
                      <span className={`text-md text-gray-600 ml-2 ${openMenu ? "font-bold" : ""}`}>Details</span>
                    </div>
                    {openMenu && (
                      <>
                        {capsule && (
                          <div className="items-center justify-center px-4">
                            <div className="border border-gray-200 p-1">
                              <span className="text-sm text-gray-400">Capsule Name: {capsule.capsuleName}</span><br />
                              <span className="text-sm text-gray-400">Capsule ID: {capsule.capsuleId}</span><br />
                              <span className="text-sm text-gray-400">Capsule Type: {capsule.capsuleType}</span><br />
                              <span className="text-sm text-gray-400">Signature Profile: {capsule.signatureProfile}</span>
                            </div>
                          </div>
                        )}
                        <div className="flex-1 overflow-auto px-4 py-2 space-y-1">
                          {sorted.map((item) => (
                            <div
                              key={item.id}
                              className={`grid ${capsuleLevel ? "grid-cols-4" : "grid-cols-3 px-2"} gap-2 items-center text-sm py-1 cursor-pointer
                                ${activeCandidateId === item.id && !capsuleLevel ? "bg-blue-100 border-l-4 border-blue-400" : "hover:bg-gray-100"}`}
                              onClick={() => setActiveCandidateId(item.id)}
                            >
                              {capsuleLevel && (
                                <input
                                  type="checkbox"
                                  className="h-4 w-4"
                                  checked={selectedCandidateIds.includes(item.id)}
                                  onChange={(e) => toggleCandidate(item.id, e.target.checked)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                              <span className="text-gray-800">{item.lastName}</span>
                              <span className="text-gray-800">{item.firstName}</span>
                              <span className="text-gray-600">{item.candidateId}</span>
                            </div>
                          ))}
                          {ready && sorted.length === 0 && (
                            <div className="px-2 py-3 text-center text-gray-500 text-sm">No candidates found for this capsule.</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {!onlyCandidateList && (
                <div className="h-1/2 overflow-auto">
                  <SecondaryInputArea
                    onSubmit={(values) => setFilters(values)}
                    resetSignal={resetSignal}
                    showThresholds={secondary.thresholds !== false}
                    showRanges={secondary.ranges !== false}
                    extra={secondary.extra ? (v, set) => secondary.extra(v, set, ctx) : null}
                  />
                </div>
              )}
            </div>

            {/* Right Panel */}
            <div className="w-6/12 lg:w-9/12 bg-white flex flex-col border-1 h-full border-gray-200 ml-1 min-w-0">
              {levels && (
                <div className="flex space-x-0 px-0 bg-gray-50">
                  <div className="w-6/12 lg:w-9/12 flex flex-col h-full border-gray-200 p-1">
                    <div className="flex justify-start items-center space-x-2">
                      {activeCandidateId && (
                        <select
                          value={capsuleLevel ? "activateCapsuleLevel" : "activateCandidateLevel"}
                          onChange={(e) => setLevel(e.target.value === "activateCapsuleLevel" ? "capsule" : "candidate")}
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="activateCandidateLevel">Candidate Level</option>
                          <option value="activateCapsuleLevel">Capsule Level</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {capsule && children(ctx)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
