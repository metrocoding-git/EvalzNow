"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  X,
  ShieldUser,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import SecondaryArea from "../components/SecondaryArea";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ClientEditor from "./components/ClientEditor";
import RightPanel from "./components/RightPanel";
import CurveEditor from "./components/CurveEditor";
import PlotSelections from "./components/PlotSelections";
import { getUniRostertByUnitId } from "@/services/unitRosterService";
import { useUnit } from "@/context/UnitContext";

export default function NeuroscienceTools() {
  const tabs = [
    { label: "Session", path: "/dashboard/analytics-view/unit-distributions" },
  ];

  const [neuroRefreshSignal, setNeuroRefreshSignal] = useState(0);

  const pathname = usePathname();
  const currentTab =
    tabs.find((tab) => pathname?.startsWith(tab.path))?.label || "Session";

  const [activeTab, setActiveTab] = useState(currentTab);

  const [showEdit, setShowEdit] = useState(false);
  const [showSecondary, setShowSecondary] = useState(true);

  const [selectedEntity, setSelectedEntity] = useState(null);
  const [open, setOpen] = useState(false);
  const [ScoresOpen, setScoresOpen] = useState(false);
  const [sortKey, setSortKey] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  // const [activeCandidateId, setActiveCandidateId] = useState(null);
  const [activeAdjustPropertieTab, setActiveAdjustPropertieTab] = useState('');
  const [activeChart, setActiveChart] = useState(false);


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // const { selectedUnitId, setSelectedUnitId } = useUnit();
  const selectedUnitId = sessionStorage.getItem("selectedUnitId");
  const [unitData, setUnitData] = useState(null);      // store unit details
  const [data, setData] = useState([]); 
  const [activeCandidateId, setActiveCandidateId] = useState(
    data.length > 0 ? data[0].id : null
  );

  const [secondaryValues, setSecondaryValues] = useState(null);
  const [resetSignal, setResetSignal] = useState(0);
  
  useEffect(() => {
    if (activeCandidateId) {
      setScoresOpen(true);
    }
  }, [activeCandidateId]);

  const [openMenu, setopenMenu] = useState(true);

  const triggerNeuroRefresh = () => {
    setNeuroRefreshSignal(prev => prev + 1);
  };
  
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortKey === "id") {
      return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
    } else {
      const valA = a[sortKey].toLowerCase();
      const valB = b[sortKey].toLowerCase();
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
  });

  const resetFilters = () => {
    setSecondaryValues({
      ppIdFrom: null,
      ppIdTo: null,
      criticalDateFrom: null,
      criticalDateTo: null,
    });

    // 🔁 trigger reset for SecondaryArea inputs
    setResetSignal((prev) => prev + 1);
  };

  // Fetch candidates + unit details by selectedUnitId
  useEffect(() => {
    if (!selectedUnitId) return;

    const fetchRoster = async () => {
      try {
        setLoading(true);
        const roster = await getUniRostertByUnitId(selectedUnitId);

        if (!Array.isArray(roster) || roster.length === 0) {
          setUnitData(null);
          setData([]);
          // router.replace("/dashboard/control-view/unit");
          redirect("/dashboard/setup-view/unit");
          return;
        }

        // Extract unit (all rows share same unit)
        setUnitData(roster[0].unit);

        // Extract candidates
        const candidates = roster.map((r) => r.candidate);

        // Remove duplicates by candidate.id
        const uniqueCandidates = Array.from(
          new Map(candidates.map((c) => [c.id, c])).values()
        );

        // Sort by id ascending initially
        const sorted = [...uniqueCandidates].sort((a, b) => a.id - b.id);

        setData(sorted);
        setActiveCandidateId(sorted.length > 0 ? sorted[0].id : null);
      } catch (err) {
        console.error("Failed to fetch unit roster:", err);
        setError("Failed to load unit roster. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoster();
  }, [selectedUnitId]);

  return (
    <div className="w-full flex flex-col">
      <div className="h-full flex flex-col overflow-hidden ">
        {/* Tab buttons */}
        <div className="flex space-x-0 px-0  bg-gray-50 ">
          {/* <div className="w-6/12 lg:w-3/12 flex flex-col border-r-2 h-full border-gray-200  p-1">
            {tabs.map((tab, index) => (
              <Link href={tab.path} key={index}>
                <span
                  onClick={() => setActiveTab(tab.label)}
                  className={
                    `relative px-5 py-2 text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer ` +
                    (activeTab === tab.label
                      ? "text-blue-600 bg-white border border-b-transparent border-gray-300 rounded-t-lg shadow-sm"
                      : "text-gray-500 hover:text-blue-600 border-t border-r border-b-transparent border-gray-300 rounded-t-lg hover:bg-white")
                  }
                >
                  {tab.label}
                </span>
              </Link>
            ))}
          </div> */}
        </div>
        {/* Active tab content */}
        <div className="flex-1 overflow-auto bg-white  p-1">
          <div className="flex flex-col h-full">
            {/* Main Content */}
            <div className="flex h-full overflow-hidden w-full">
              {!(activeAdjustPropertieTab === 'Indicators' || activeAdjustPropertieTab === 'Loads') && (
                <>
                  {/* Sidebar */}
                  <div className="w-6/12 lg:w-3/12 flex flex-col border-1 h-full border-gray-200  ">
                    <div className="flex-grow flex flex-col h-1/3">
                      {/* Header */}
                      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 grid grid-cols-3 text-gray-800 font-semibold text-sm">
                        <div
                          onClick={() => handleSort("lastName")}
                          className="cursor-pointer"
                        >
                          Last Name
                        </div>
                        <div
                          onClick={() => handleSort("firstName")}
                          className="cursor-pointer"
                        >
                          First Name
                        </div>
                        <div
                          onClick={() => handleSort("id")}
                          className="cursor-pointer"
                        >
                          Candidate ID
                        </div>
                      </div>
                      <div className="flex-1 overflow-auto">
                        <div className=" px-3 py-1">
                          <div
                            className="flex items-center cursor-pointer select-none hover:bg-gray-50 px-2 py-1"
                            onClick={() => setopenMenu(!openMenu)}
                          >
                            <span
                              className={`transition-transform duration-200 text-gray-600 mr-1 ${openMenu ? "rotate-90" : "rotate-0"
                                }`}
                            >
                              ▶
                            </span>
                            <span
                              className={`text-md text-gray-600 ml-2 ${openMenu ? "font-bold" : ""
                                }`}
                            >
                              Details
                            </span>
                          </div>

                          {openMenu && (
                        <>
                          {unitData && (
                          <div className=" items-center justify-center  px-4 ">
                            <div className="border border-gray-200 p-1">
                              <span className="text-sm text-gray-400">
                                Unit Name: {unitData.unitName}
                              </span>
                              <br />
                              <span className="text-sm text-gray-400">
                                Unit ID: {unitData.unitId}
                              </span>
                              <br />
                              <span className="text-sm text-gray-400">
                                Unit Type: {unitData.unitType}
                              </span>
                              <br />
                              <span className="text-sm text-gray-400">
                                Signature Profile: {unitData.signatureProfile}
                              </span>
                            </div>
                          </div>
                          )}

                          {/* Candidate Data */}
                          <div className="flex-1 overflow-auto px-4 py-2 space-y-1">
                            {sortedData.map((item) => (
                              <div
                                key={item.id}
                                className={`grid grid-cols-3 gap-2 items-center text-sm px-2 py-1 cursor-pointer
                                ${
                                  activeCandidateId === item.id
                                    ? "bg-blue-100 border-l-4 border-blue-400"
                                    : "hover:bg-gray-100"
                                }`}
                                onClick={() => {
                                  setShowEdit(true);
                                  setShowSecondary(true);
                                  setActiveCandidateId(item.id); // ✅ mark candidate as active
                                }}
                                onDoubleClick={() => {
                                  setScoresOpen(true);
                                  setActiveCandidateId(item.id);
                                }}
                              >
                                <span className="text-gray-800">
                                  {item.lastName}
                                </span>
                                <span className="text-gray-800">
                                  {item.firstName}
                                </span>
                                <span className="text-gray-600">{item.id}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                        </div>

                        {/* Dropdown Content */}
                      </div>
                    </div>

                    {/* Secondary Input Area */}
                    {showSecondary && (
                      <div className="h-1/3 overflow-auto ">
                        <SecondaryArea onClose={() => setShowSecondary(false)} onSubmit={(values) => { setSecondaryValues(values); }} resetSignal={resetSignal} />
                      </div>
                    )}

                    {/* Editor */}
                    <div className="h-1/3 overflow-auto ">
                      <ClientEditor
                        onClose={() => setShowEdit(false)} unitId={unitData?.id} candidateId={activeCandidateId}
                        client={true} refreshSignal={neuroRefreshSignal}
                        showForm={showEdit}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Right Panel */}
              <div className=" w-9/12 bg-white flex flex-col border-1 h-full border-gray-200 p-1 ml-1">
                {/* {ScoresOpen && <CurveEditor />} */}

                <PlotSelections activeChart={activeChart} unitId={unitData?.id} candidateId={activeCandidateId}
                  setActiveChart={setActiveChart} filters={secondaryValues} onResetFilters={resetFilters} onNeuroRefresh={triggerNeuroRefresh} />


              </div>

            </div>
            {/* ------- */}
          </div>
        </div>
      </div>
    </div>
  );
}
