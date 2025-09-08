"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  ChevronRight,
  Search,
} from "lucide-react";
import ClientEditor from "../../control-view/admin/components/ClientEditor";
import CompetencyAccounting from "./components/CompetencyAccounting";
import Editor from "./components/Editor";
import CreateStaffForm from "../../control-view/staff/components/CreateStaffForm";
import CreateInsertScoresForm from "./components/CreateInsertScoresForm";
import { useRouter, useSearchParams } from "next/navigation";
import { getUniRostertByUnitId } from "@/services/unitRosterService";
import { getAssessmentBlockByUnitAndCandidate } from "@/services/assessmentBlockManagerService";

export default function EntitiesManager() {
  // Initial table data in state
  const [data, setData] = useState([
    { id: 1, firstName: "John", lastName: "Doe" },
    { id: 2, firstName: "Jane", lastName: "Smith" },
    { id: 3, firstName: "Bob", lastName: "Johnson" },
    { id: 4, firstName: "Alice", lastName: "Williams" },
    { id: 5, firstName: "Charlie", lastName: "Brown" },
    { id: 6, firstName: "David", lastName: "Jones" },
    { id: 7, firstName: "Eva", lastName: "Miller" },
    { id: 8, firstName: "Frank", lastName: "Davis" },
    { id: 9, firstName: "Grace", lastName: "Wilson" },
    { id: 10, firstName: "Henry", lastName: "Moore" },
  ]);

  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [ScoresOpen, setScoresOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(true);
  const [activeCandidateId, setActiveCandidateId] = useState(null);
  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const [rightClickedEntity, setRightClickedEntity] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTab, setActiveTab] = useState("Indirect");
  const [scoreAdd, setScoreAdd] = useState(false);
  const [candidateList, setCandidateList] = useState([]);
  const [unitData, setUnitData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formParams, setFormParams] = useState({ unitId: null, assessmentBlockId: null, ppId: null });

  const router = useRouter();
  const searchParams = useSearchParams();
  const unitQuery = searchParams.get("unitId");
 
  useEffect(() => {
    if (!unitQuery) {
      router.replace("/dashboard/control-view/unit");
    }
  }, [unitQuery, router]);

  useEffect(() => {
    const fetchCandidateByUnitId = async () => {
      if (!unitQuery) return;
  
      try {
        setLoading(true);
        const data = await getUniRostertByUnitId(unitQuery) || [];
  
        if (!Array.isArray(data) || data.length === 0) {
          
          setUnitData(null);
          setCandidateList([]);
          router.replace("/dashboard/control-view/unit");
          return;
        }
  
        // Extract unit data from the first row
        setUnitData(data[0].unit || null);
  
        // Extract candidate data
        const candidates = data.map(item => item.candidate);
  
        // Remove duplicates by candidate id
        const uniqueCandidates = Array.from(
          new Map(candidates.map(c => [c.id, c])).values()
        );
  
        setCandidateList(uniqueCandidates);
  
        console.log("Unit Data:", data[0].unit);
        console.log("Candidate List:", uniqueCandidates);
      } catch (err) {
        console.error("Failed to fetch unit roster:", err);
        setError("Failed to load unit roster. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchCandidateByUnitId();
  }, [unitQuery]);

    // Redirect if unitData is null
  // useEffect(() => {
  //   if (unitData === null) {
  //     router.replace("/dashboard/control-view/unit");
  //   }
  // }, [unitData, router]);
  

  console.log(unitQuery);

  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.visible) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };

    if (candidateList.length > 0) {
      setSelectedEntity(candidateList[0]);
      setScoresOpen(true);
      setShowEdit(true);
    } else {
      setSelectedEntity(null);
      setScoresOpen(false);
      setShowEdit(false);
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [contextMenu.visible, candidateList]);

  const sortedData = [...candidateList].sort((a, b) => {
    const valA = a[sortColumn];
    const valB = b[sortColumn];

    if (typeof valA === "string" && typeof valB === "string") {
      return sortDirection === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return sortDirection === "asc" ? valA - valB : valB - valA;
  });

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };


  useEffect(() => {
    const fetchBlockInfo = async () => {
      if (!unitQuery || !selectedEntity?.id) return;

      try {
        setLoading(true);
        const blocks = await getAssessmentBlockByUnitAndCandidate(unitQuery, selectedEntity.id);
        
        console.log(blocks);
        if (Array.isArray(blocks) && blocks.length > 0) {
          // For simplicity, take the first block
          const block = blocks[0];
          setFormParams({
            unitId: block.unitId,
            assessmentBlockId: block.id,
            ppId: block.ppId
          });
        } else {
          setFormParams({ unitId: null, assessmentBlockId: null, ppId: null });
        }

      } catch (err) {
        console.error("Failed to fetch block info:", err);
        setError("Failed to load candidate block data.");
        setFormParams({ unitId: null, assessmentBlockId: null, ppId: null });
      } finally {
        setLoading(false);
      }
    };

    fetchBlockInfo();
  }, [unitQuery, selectedEntity?.id]);

  console.log("params: ", formParams);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-gray-200">
        <div className="flex-grow flex flex-col h-1/2">
          {/* Header */}
          <div className="flex flex-col items-center bg-gray-100 px-4 py-2 border-b border-gray-300">
            <div className="relative w-full mb-2">
              <input
                type="text"
                className="border w-full pl-2 pr-8 py-1 text-sm bg-white"
                placeholder="Search"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
            <div className="grid grid-cols-3 gap-1 text-gray-800 font-semibold text-sm w-full">
              {["lastName", "firstName", "id"].map((col) => (
                <button
                  key={col}
                  onClick={() => handleSort(col)}
                  className="flex items-center space-x-1 hover:underline"
                >
                  <span className="capitalize">
                    {col === "id" ? "Candidate ID" : col.replace(/([A-Z])/g, " $1")}
                  </span>
                </button>
              ))}
            </div>
            {/* <button
              onClick={() => console.log("Add new entity")}
              className="hover:bg-gray-300 text-gray-950 text-sm p-1 ml-2"
            >
              <Plus className="w-4 h-4" />
            </button> */}
          </div>

          <div className="flex-1 overflow-auto">
            {/* Toggle Sessions */}
            <div
              className="flex items-center cursor-pointer select-none hover:bg-gray-50 px-4 py-2"
              onClick={() => setOpenMenu(!openMenu)}
            >
              <span
                className={`transition-transform duration-200 text-gray-600 mr-1 ${openMenu ? "rotate-90" : "rotate-0"
                  }`}
              >
                <ChevronRight />
              </span>
              <span
                className={`text-md text-gray-800 ml-2 ${openMenu ? "font-bold text-black" : ""
                  }`}
              >
                Details
              </span>
            </div>

            {openMenu && (
              <>
                {/* Session Info */}
                <div className="px-4">
                  <div className="border border-gray-200 p-2">
                    <p className="text-sm text-gray-600">
                      Unit Name: {unitData?.unitName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Unit ID: {unitData?.unitId || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Unit Type: {unitData?.unitType || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Signature Profile: {unitData?.signatureProfile || "N/A"} 
                    </p>
                  </div>
                </div>

                {/* Candidate Rows */}
                <div className="mt-2">
                  {sortedData.map((item) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-3 gap-1 items-center px-4 py-1 text-sm cursor-pointer ${selectedEntity?.id === item.id
                        ? "bg-blue-100 border-l-4 border-l-blue-400 text-black"
                        : "hover:bg-gray-50"
                        }`}
                      onClick={(e) => {
                        setSelectedEntity(item);
                        setShowEdit(true);
                        e.stopPropagation();
                      }}
                      onDoubleClick={(e) => {
                        setScoresOpen(true);
                        setSelectedEntity(item);
                        e.stopPropagation();
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setRightClickedEntity(item);
                        setContextMenu({
                          visible: true,
                          x: e.clientX,
                          y: e.clientY,
                        });
                      }}
                    >
                      <div>{item.lastName}</div>
                      <div>{item.firstName}</div>
                      <div>{item.id}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Editor Panel */}
          <div className="h-1/2 overflow-auto my-2">
            <Editor
              details={selectedRow}
              performancePoints={activeTab}
              onClose={() => setScoreAdd(false)}
            />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white flex flex-col  overflow-y-auto">
        {scoreAdd && (
          <div className="w-1/2 lg:w-9/12 bg-white h-full">
            <div className="h-full flex flex-col w-96">
              <CreateInsertScoresForm onClose={() => setScoreAdd(false)} candidateId={selectedEntity?.id} />
            </div>
          </div>
        )}
        {ScoresOpen && !scoreAdd && <CompetencyAccounting selectedRow={selectedRow} candidateId={selectedEntity?.id} setSelectedRow={setSelectedRow} activeTab={activeTab} setActiveTab={setActiveTab} scoreAdd={scoreAdd} setScoreAdd={setScoreAdd} />}
      </div>



    </div>
  );
}
