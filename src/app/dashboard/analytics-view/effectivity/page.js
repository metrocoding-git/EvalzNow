"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getUniRostertByUnitId } from "@/services/unitRosterService";
import { getEffectivityOptions } from "@/services/effectivityService";
import PlotSelections from "./components/PlotSelections";
import SecondaryInputForm from "./components/SecondaryArea";

export default function EffectivityPage() {
  const router = useRouter();
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [unitData, setUnitData] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [activeCandidateId, setActiveCandidateId] = useState(null);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [selectedSort, setSelectedSort] = useState("activateCandidateLevel");
  const [filters, setFilters] = useState(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [options, setOptions] = useState(null);
  const [openMenu, setOpenMenu] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setSelectedUnitId(sessionStorage.getItem("selectedUnitId"));
    getEffectivityOptions().then(setOptions).catch((e) => console.error("Effectivity options:", e));
  }, []);

  useEffect(() => {
    if (!selectedUnitId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const roster = await getUniRostertByUnitId(selectedUnitId);
        if (cancelled) return;
        if (!Array.isArray(roster) || roster.length === 0) {
          setUnitData(null);
          setCandidates([]);
          router.replace("/dashboard/control-view/unit");
          return;
        }
        setUnitData(roster[0].unit);
        const unique = Array.from(new Map(roster.map((r) => [r.candidate.id, r.candidate])).values())
          .sort((a, b) => a.id - b.id);
        setCandidates(unique);
        setActiveCandidateId(unique[0]?.id ?? null);
      } catch (err) {
        console.error("Failed to fetch unit roster:", err);
        if (!cancelled) setError("Failed to load unit roster. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedUnitId, router]);

  // New level -> clear the secondary inputs
  useEffect(() => {
    setFilters(null);
    setResetSignal((p) => p + 1);
  }, [selectedSort]);

  const resetFilters = () => {
    setFilters(null);
    setResetSignal((p) => p + 1);
  };

  const isUnitLevel = selectedSort === "activateUnitLevel";
  const plotCandidate = useMemo(
    () => (isUnitLevel ? selectedCandidateIds : activeCandidateId),
    [isUnitLevel, selectedCandidateIds, activeCandidateId]
  );

  return (
    <div className="w-full flex flex-col">
      <div className="h-full flex flex-col overflow-hidden p-1">
        <div className="flex-1 overflow-auto bg-white border-gray-300 p-1">
          <div className="flex h-full overflow-hidden w-full">
            {/* Sidebar */}
            <div className="w-6/12 lg:w-3/12 flex flex-col border-1 h-full border-gray-200">
              <div className="flex-grow flex flex-col h-1/2">
                <div className={`bg-gray-100 py-2 border-b border-gray-300 grid ${isUnitLevel ? "grid-cols-4" : "grid-cols-3"} px-4 text-gray-800 font-semibold text-sm`}>
                  {isUnitLevel && (
                    <div>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        title="Select all candidates"
                        checked={candidates.length > 0 && selectedCandidateIds.length === candidates.length}
                        onChange={(e) => setSelectedCandidateIds(e.target.checked ? candidates.map((c) => c.id) : [])}
                      />
                    </div>
                  )}
                  <div className="whitespace-nowrap">Last Name</div>
                  <div className="whitespace-nowrap">First Name</div>
                  <div className="whitespace-nowrap">Candidate ID</div>
                </div>

                <div className="flex-1 overflow-auto">
                  <div className="px-3 py-1">
                    <div
                      className="flex items-center cursor-pointer select-none hover:bg-blue-50 rounded-md px-2 py-1"
                      onClick={() => setOpenMenu(!openMenu)}
                    >
                      <span className={`transition-transform duration-200 text-gray-600 mr-1 ${openMenu ? "rotate-90" : "rotate-0"}`}>▶</span>
                      <span className={`text-md text-gray-600 ml-2 ${openMenu ? "font-bold" : ""}`}>Details</span>
                    </div>

                    {openMenu && (
                      <>
                        {unitData && (
                          <div className="px-4">
                            <div className="border border-gray-200 p-1">
                              <span className="text-sm text-gray-400">Unit Name: {unitData.unitName}</span><br />
                              <span className="text-sm text-gray-400">Unit ID: {unitData.unitId}</span><br />
                              <span className="text-sm text-gray-400">Unit Type: {unitData.unitType}</span><br />
                              <span className="text-sm text-gray-400">Signature Profile: {unitData.signatureProfile}</span>
                            </div>
                          </div>
                        )}
                        {loading && <div className="px-4 py-2 text-sm text-gray-400">Loading candidates...</div>}
                        {error && <div className="px-4 py-2 text-sm text-red-500">{error}</div>}
                        <div className="flex-1 overflow-auto px-4 py-2 space-y-1">
                          {candidates.map((item) => (
                            <div
                              key={item.id}
                              className={`grid ${isUnitLevel ? "grid-cols-4" : "grid-cols-3 px-2"} gap-2 items-center text-sm py-1 cursor-pointer
                                ${activeCandidateId === item.id && !isUnitLevel ? "bg-blue-100 border-l-4 border-blue-400" : "hover:bg-gray-100"}`}
                              onClick={() => setActiveCandidateId(item.id)}
                            >
                              {isUnitLevel && (
                                <input
                                  type="checkbox"
                                  className="h-4 w-4"
                                  checked={selectedCandidateIds.includes(item.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) =>
                                    setSelectedCandidateIds((prev) =>
                                      e.target.checked ? [...prev, item.id] : prev.filter((id) => id !== item.id)
                                    )
                                  }
                                />
                              )}
                              <span className="text-gray-800">{item.lastName}</span>
                              <span className="text-gray-800">{item.firstName}</span>
                              <span className="text-gray-600">{item.candidateId}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-1/2 overflow-auto">
                <SecondaryInputForm onSubmit={setFilters} resetSignal={resetSignal} />
              </div>
            </div>

            {/* Right panel */}
            <div className="w-6/12 lg:w-9/12 bg-white flex flex-col border-1 h-full border-gray-200 p-1 ml-1">
              <div className="flex space-x-0 bg-gray-50">
                <div className="flex flex-col h-full border-gray-200 p-1">
                  <div className="flex justify-start items-center space-x-2">
                    {activeCandidateId && (
                      <select
                        value={selectedSort}
                        onChange={(e) => setSelectedSort(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="activateCandidateLevel">Candidate Level</option>
                        <option value="activateUnitLevel">Unit Level</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {activeCandidateId && (
                <PlotSelections
                  selectedSort={selectedSort}
                  unitId={selectedUnitId}
                  unitType={unitData?.unitType}
                  candidateId={plotCandidate}
                  candidates={candidates}
                  filters={filters}
                  options={options}
                  onResetFilters={resetFilters}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
