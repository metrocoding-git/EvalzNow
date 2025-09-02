"use client";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Edit3,
  Play,
  Plus,
  Settings,
  ShieldUser,
  Trash,
  Trash2,
  UsersRound,
  X,
  Search,
  Copy,
  Undo2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import UnitEditor from "./components/UnitEditor";
import CreateUnitForm from "./components/CreateUnitForm";
import UnitRoster from "./components/UnitRoster";
import CreateBlockManagerForm from "./components/CreateBlockManagerForm";
import { createUnit, deleteUnit, getAllUnits, updateUnit } from "@/services/unitService";
import { getAllCandidates } from "@/services/candidateService";
import { getAllUnitRoster, getUniRostertByUnitId } from "@/services/unitRosterService";
import { useFormStatus } from "@/context/FormStatusContext";

export default function UnitControl() {
  const router = useRouter();
  const contextRef = useRef(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddBlockManager, setShowAddBlockManager] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [showEditBlockManager, setShowEditBlockManager] = useState(false);

  const [showList, setShowList] = useState(true);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const formRef = useRef(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showUnitRoster, setUnitRoster] = useState(false);

  // unit tabs
  const [activeTab, setActiveTab] = useState("Indirect");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataList, setDataList] = useState([
    // { id: "u001", environment:'classroom', name: "Unit1", type:'communicative' },
    // { id: "u002", environment:'workspace', name: "Unit2", type:'theory practical' },
    // { id: "u003", environment:'classroom', name: "Unit3", type:'third parameter' },
    // { id: "u004", environment:'workspace', name: "Unit4", type:'communicative' },
  ]);
  const [unitRosterData, setUnitRosterData] = useState([]);
  const [candidateList, setCandidateList] = useState([]);
  const [sortBy, setSortBy] = useState("id");
  const [candidateSortOrder, setCandidateSortOrder] = useState("asc");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isSelected, setIsSelected] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [blocks, setBlocks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

  // const [formStatus, setFormStatus] = useState("Ready");
  const { setFormStatus } = useFormStatus();

  // Fetch all units on mount
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const units = await getAllUnits();
        setDataList(Array.isArray(units) ? units : []);
        console.log(units);
        if (units.length > 0) {
          setSelectedUnit(units[0]);
          setShowEdit(true);
        }
      } catch (err) {
        console.error("Failed to fetch units:", err);
        setError("Failed to load units. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);


  // Fetch all candidates on mount
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const data = await getAllCandidates();
        setCandidateList(Array.isArray(data) ? data : []);
        console.log(data);
      } catch (err) {
        console.error("Failed to fetch candidates:", err);
        setError("Failed to load candidates. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  // Fetch all candidates on mount
  useEffect(() => {
    const fetchUnitRoster  = async () => {
      try {
        setLoading(true);
        const data = await getAllUnitRoster();
        setUnitRosterData(Array.isArray(data) ? data : []);
        // Extract unique candidates from roster data
        const uniqueCandidates = data.reduce((acc, rosterItem) => {
          if (rosterItem.candidate && !acc.some(c => c.id === rosterItem.candidate.id)) {
            acc.push(rosterItem.candidate);
          }
          return acc;
        }, []);
        
        setCandidateList(uniqueCandidates);
        // console.log(uniqueCandidates);
      } catch (err) {
        console.error("Failed to fetch candidates:", err);
        setError("Failed to load candidates. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUnitRoster();
  }, []);

  const handleRosterUpdate = (updatedRoster) => {
    setUnitRosterData(prev => {
      // Remove old roster item if exists
      const filtered = prev.filter(r => r.id !== updatedRoster.id);
      const newRosterData = [...filtered, updatedRoster];
  
      // Rebuild candidate list from updated roster
      const uniqueCandidates = newRosterData.reduce((acc, rosterItem) => {
        const candidate = rosterItem.candidate;
        if (candidate && !acc.some(c => c.id === candidate.id)) {
          acc.push(candidate);
        }
        return acc;
      }, []);
      setCandidateList(uniqueCandidates);
  
      return newRosterData;
    });
  };
  

  // Fetch all candidates on mount
  // Fetch unit roster by unit ID when selectedUnit changes
  useEffect(() => {
    const fetchUnitRosterByUnitId = async () => {
      if (!selectedUnit?.id) return;
      
      try {
        setLoading(true);
        const data = await getUniRostertByUnitId(selectedUnit.id) || [];
        if (data.length > 0) {
          setUnitRosterData(Array.isArray(data) ? data : []);
          console.log("Unit Roster Data:", data);
        }
        
      } catch (err) {
        console.error("Failed to fetch unit roster:", err);
        setError("Failed to load unit roster. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUnitRosterByUnitId();
  }, [selectedUnit?.id]);

  // Create candidate
  const handleCreate = async (newUnit) => {
    try {
      setLoading(true);
      
      // Prepare the data for API
      const unitData = {
        unitName: newUnit.unitName,
        unitId: newUnit.unitId,
        unitStartDate: newUnit.unitStartDate, // Changed from startDate
        unitEndDate: newUnit.unitEndDate,     // or newUnit.unitEndDate
        unitDirector: newUnit.unitDirector,
        unitType: newUnit.unitType,
        signatureProfile: newUnit.signatureProfile,
        environment: newUnit.environment,
        environment: newUnit.environment,
        benchmarks: newUnit.benchmarks
      };

      const createdUnit = await createUnit(unitData);
      
      // Update state
      setDataList(prev => [...prev, createdUnit]);
      setSelectedUnit(createdUnit);
      setShowAdd(false);
      setShowEdit(true);
      
      return createdUnit;
    } catch (err) {
      console.error("Failed to create unit:", err);
      setError("Failed to create unit. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };



  const sortedDataList = [...dataList].sort((a, b) => {
    const getValue = (item) => {
      const value = sortField === "name" ? item.unitName : item[sortField];
      return sortField === "id" ? String(value) : String(value || "").toLowerCase();
    };
  
    const valA = getValue(a);
    const valB = getValue(b);
  
    if (sortField === "id") {
      return sortOrder === "asc" 
        ? valA.localeCompare(valB, undefined, { numeric: true })
        : valB.localeCompare(valA, undefined, { numeric: true });
    }
  
    return sortOrder === "asc" 
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const filteredUnits = sortedDataList.filter(unit =>
    unit.unitName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle sorting
  const getSortedData = () => {
    return [...candidateList].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === "id") {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = (valA || "").toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return candidateSortOrder === "asc" ? -1 : 1;
      if (valA > valB) return candidateSortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  // This used to manage right-click context menu
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedUnit: null,
  });

  // Delete unit
  const handleDelete = async (id) => {
    try {
      await deleteUnit(id);
      const updated = dataList.filter(item => item.id !== id);
      setDataList(updated);
      
      if (selectedUnit?.id === id) {
        setSelectedUnit(updated[0] || null);
        setShowEdit(updated.length > 0);
      }
      
      setContextMenu(prev => ({ ...prev, visible: false }));
    } catch (err) {
      console.error("Failed to delete unit:", err);
      setError("Failed to delete unit.");
    }
  };

  // Select candidate from roster
  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate); // store selected candidate
    console.log("candidate key", selectedCandidate);
    // Optional: you can also update UnitRoster state if needed
  };


  useEffect(() => {
    const handleClickOutside = (e) => {
      const isContextMenuClick =
        contextRef.current && contextRef.current.contains(e.target);
      const isUnitClick = e.target.closest(".unit-item");
      const isFormClick = formRef.current && formRef.current.contains(e.target);

      // If clicked outside both context menu and unit item will deselect
      if (!isContextMenuClick && !isUnitClick && !isFormClick) {
        setContextMenu({ visible: false, x: 0, y: 0, selectedUnit: null });
        setSelectedUnit(null);
        setShowEdit(false);
        setFormStatus("Ready...");
      }
    };

    if (showUnitRoster) return;

    if (dataList.length > 0) {
      setSelectedUnit(dataList[0]);
      setShowEdit(true);
      setShowAdd(false);
    } else {
      setSelectedUnit(null);
      setShowEdit(false);
    }
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [dataList, showUnitRoster]);


  const handleBlockUpdate = (updatedBlock) => {
    // Update the assessment blocks in state if needed
    console.log("Block updated:", updatedBlock);
    // You might want to refresh the blocks data here
    fetchBlocksByUnitAndCandidate(); // Refresh the blocks
  };

  // Modify the handleUnitSave function in UnitControl
  const handleUnitSave = async (updatedUnit) => {
    try {
      setLoading(true);
      setFormStatus("Processing...");
      // Call the update API
      const result = await updateUnit(updatedUnit.id, updatedUnit);
      
      console.log(result);
      // Update the local state
      setDataList(prev =>
        prev.map(unit => unit.id === updatedUnit.id ? result : unit)
      );
      setSelectedUnit(result);
      setShowEdit(false);
      
      setFormStatus("Completed");
      setTimeout(() => setFormStatus("Ready..."), 2000);

      return result;
    } catch (err) {
      console.error("Failed to update unit:", err);
      setError("Failed to update unit. Please try again.");
      setFormStatus("Ready...");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add this computed value to get filtered roster data
  const filteredUnitRosterData = unitRosterData.filter(roster => 
    (roster.unitId === selectedUnit?.id || roster.unit?.id === selectedUnit?.id) &&
    (!selectedCandidate || roster.candidate?.id === selectedCandidate.id)
);





  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-1/2 lg:w-3/12 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      <div className="flex flex-col border-1 border-gray-200 overflow-hidden h-1/2 ">
          {/* Header */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-1.5">
            {/* Control buttons */}
          
            {/* Control buttons */}
            <div className="flex flex-col mb-3">
              <div className="flex justify-end gap-1">
                {!showAdd && showUnitRoster ? (
                  <button
                    className="inline-flex items-center px-1.5 py-1.5 text-xs font-medium text-white bg-gray-200 hover:bg-gray-400 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedUnit(null);
                      setShowEdit(false);
                      setShowAdd(false);
                      setShowAddBlockManager(false);
                      setShowEditBlockManager(false);
                      setUnitRoster(false);
                    }}
                  >
                    <Undo2 className="w-3.5 h-3.5 text-black"/>
                  </button>
                ) : (
                  <>
                    <button
                      className="inline-flex items-center px-1.5 py-1.5 text-xs font-medium text-white bg-gray-200 hover:bg-gray-400 transition-colors cursor-pointer"
                      onClick={() => {
                        if (showUnitRoster) {
                          setShowAddBlockManager(true);
                        } else {
                          setSelectedUnit(null);
                          setShowAdd(true);
                        }
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 text-black" />
                    </button>

                    {selectedUnit && (
                      <div className="flex gap-1 unit-item">
                        <button
                          className="p-1.5 text-gray-600 bg-gray-200 hover:bg-gray-400 hover:text-white transition-colors"
                          onClick={() => handleDelete(selectedUnit.id)}
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="relative w-full mt-1">
                <input
                  type="text"
                  className="border w-full pl-2 pr-8 py-1 text-sm bg-white"
                  placeholder="Search"
                  value={searchTerm}                 // ✅ Controlled input
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
            </div>

            {/* Conditional Column Headers */}
            {showUnitRoster ? (
              <div className="grid grid-cols-3 gap-1 text-xs font-semibold text-black">
                <div className="cursor-pointer select-none">Last Name</div>
                <div className="cursor-pointer select-none">First Name</div>
                <div className="cursor-pointer select-none">Candidate ID</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1 text-xs font-semibold text-black">
                <div
                  className="flex items-center cursor-pointer select-none"
                  onClick={() => {
                    if (sortField === "unitName") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortField("unitName");
                      setSortOrder("asc");
                    }
                  }}
                >
                  Name
                </div>
                <div
                  className="flex items-center cursor-pointer select-none"
                  onClick={() => {
                    if (sortField === "id") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortField("id");
                      setSortOrder("asc");
                    }
                  }}
                >
                  Unit ID
                </div>
              </div>
            )}
        
          </div>

          {/* <div className=""> */}
          {!showAdd && showUnitRoster && (
            <div className=" pb-1 flex-1 overflow-auto">
              

              {/* Unit Details (smaller and less prominent) */}
              <div className="items-center justify-center px-4 mt-1">
                <div className="border border-gray-200 p-2">
                  <span className="text-sm text-gray-600">
                    Unit Name: {selectedUnit?.unitName || "N/A"}
                  </span>
                  <br />
                  <span className="text-sm text-gray-600">
                    Unit ID: {selectedUnit?.unitId || "N/A"}
                  </span>
                  <br />
                  <span className="text-sm text-gray-600">
                    Unit Type: {selectedUnit?.unitType || "N/A"}
                  </span>
                  <br />
                  <span className="text-sm text-gray-600">
                    Signature Profile: {selectedUnit?.signatureProfile || "N/A"}
                  </span>
                </div>
              </div>

              {/* Candidate List */}
              <div className="max-h-40 overflow-y-auto">
                {unitRosterData
                  .filter(roster => roster.unitId === selectedUnit?.id)
                  .map((rosterItem, index) => (
                    <div 
                    key={index}
                    className={`grid grid-cols-3 gap-1 px-4 py-1 border-b border-gray-200 cursor-pointer 
                      ${selectedCandidate?.id === rosterItem.candidate?.id ? "bg-gray-100 " : "hover:bg-gray-50"}`}
                    onClick={() => handleCandidateSelect(rosterItem.candidate)}
                    >
                      <div className="text-sm">{rosterItem.candidate?.lastName || 'N/A'}</div>
                      <div className="text-sm">{rosterItem.candidate?.firstName || 'N/A'}</div>
                      <div className="text-sm">{rosterItem.candidate?.candidateId || 'N/A'}</div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          {/* </div> */}

          {/* List Toggle */}
          {!showUnitRoster && (
            <div className="flex-[1.1] min-h-0 overflow-auto">
              <div
                className="flex items-center px-4 py-2 cursor-pointer select-none hover:text-gray-700 transition-colors"
                onClick={() => setShowList((prev) => !prev)}
              >
                {showList ? (
                  <ChevronDown className="w-4 h-4 text-gray-700 mr-2" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-700 mr-1" />
                )}
                <p className="text-sm font-medium text-gray-900">
                  Units ({dataList.length})
                </p>
              </div>
              {/* <div className="items-center justify-center px-4">
                <div className="border border-gray-200 p-1">
                  <span className="text-sm text-gray-600">
                    Unit Name: {selectedUnit?.unitName || "N/A"}
                  </span>
                  <br />
                  <span className="text-sm text-gray-600">
                    Unit ID: {selectedUnit?.unitId || "N/A"}
                  </span>
                  <br />
                  <span className="text-sm text-gray-600">
                    Unit Type: {selectedUnit?.unitType || "N/A"}
                  </span>
                  <br />
                  <span className="text-sm text-gray-600">
                    Signature Profile: {selectedUnit?.signatureProfile || "N/A"}
                  </span>
                </div>
              </div> */}

              {showList &&
                filteredUnits.map((item, index) => {
                  const isSelected = selectedUnit && selectedUnit.id === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`unit-item grid grid-cols-2 gap-2 items-center cursor-pointer px-4 py-2 border-b border-gray-50 transition-all ${isSelected
                        ? "bg-blue-100 border-l-4 border-l-blue-400 text-black"
                        : "hover:bg-gray-50"
                        }`}
                      onClick={() => {
                        setSelectedUnit(item);
                        setShowEdit(true);
                        setShowAdd(false);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedUnit(item);
                        setContextMenu({
                          visible: true,
                          x: e.pageX,
                          y: e.pageY,
                          selectedUnit: item,
                        });
                      }}
                    >
                      <p
                        className={`text-sm font-medium truncate ${isSelected ? "text-black" : "text-gray-800"
                          }`}
                      >
                        {item.unitName}
                      </p>
                      <p
                        className={`text-sm font-medium truncate ${isSelected ? "text-black" : "text-gray-800"
                          }`}
                      >
                        {item.unitId}
                      </p>

                    </div>
                  );
                })}

                {/* Header */}
          

            {/* List Toggle */}
            <div className="flex-[1.1] min-h-0 overflow-auto">
            

            {/* {showList &&
              getSortedData().map((item, index) => {
                const isSelected = selectedCandidate?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`candidate-item grid grid-cols-3 gap-4 items-center cursor-pointer px-4 py-2 border-b border-gray-50 transition-all ${
                      isSelected
                        ? "bg-blue-100 border-l-4 border-l-blue-400 text-black"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      
                      setShowEdit(true);
                      setShowAdd(false);
                      setShowReview(false);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      setContextMenu({
                        visible: true,
                        x: e.pageX,
                        y: e.pageY,
                        selectedCandidate: item,
                      });
                    }}
                  >
                    <p
                      className={`text-sm font-medium truncate ${
                        isSelected ? "text-black" : "text-gray-800"
                      }`}
                    >
                      {item.lastName}
                    </p>
                    <p
                      className={`text-sm font-medium truncate ${
                        isSelected ? "text-black" : "text-gray-800"
                      }`}
                    >
                      {item.firstName}
                    </p>
                    <p
                      className={`text-sm font-medium truncate ${
                        isSelected ? "text-black" : "text-gray-800"
                      }`}
                    >
                      {item.id}
                    </p>
                  </div>
                );
              })} */}

            </div>
                
          </div>
          )}
        </div>


        {/* <div className="flex flex-col border-1 border-gray-200  overflow-hidden h-1/3">
          
        </div>  */}

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            ref={contextRef}
            className="unit-item absolute bg-gray-200 border font-semibold border-gray-300 shadow-md z-50 w-60"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className="flex justify-between items-center px-4 py-2 text-xs text-gray-800 hover:bg-gray-300 w-full text-left"
              onClick={(e) => {
                setSelectedUnit(contextMenu.selectedUnit);
                e.stopPropagation();
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
            >
              <span className="flex items-center gap-2">
                <Copy className="w-4 h-4" /> Duplicate
              </span>
              <span className="text-gray-400 text-xs ml-4">Ctrl + E</span>
            </button>

            <button
              className="flex justify-between items-center px-4 py-2 text-xs text-gray-800 hover:bg-gray-300 w-full text-left border-t border-gray-200"
              onClick={() => {
                const unit = contextMenu.selectedUnit;
                setSelectedUnit(unit);
                setUnitRoster(true);
                setShowAdd(false);

                // auto-select first candidate in roster
                const rosterForUnit = unitRosterData.filter(
                  r => r.unitId === unit.id || r.unit?.id === unit.id
                );
                if (rosterForUnit.length > 0) {
                  setSelectedCandidate(rosterForUnit[0].candidate);
                } else {
                  setSelectedCandidate(null);
                }

                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> Unit Config
              </span>
              <span className="text-gray-400 text-xs ml-4">Ctrl + C</span>
            </button>


            <button
              className="flex justify-between items-center px-4 py-2 text-xs text-gray-800 hover:bg-red-200 w-full text-left border-t border-gray-200"
              onClick={() => {
                handleDelete(contextMenu.selectedUnit.id);
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
            >
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </span>
              <span className="text-gray-400 text-xs ml-4">Del</span>
            </button>

            <button
              className="flex justify-between items-center px-4 py-2 text-xs text-gray-800 hover:bg-gray-300 w-full text-left border-t border-gray-200"
              onClick={() => {
                setContextMenu((prev) => ({ ...prev, visible: false }));
                router.push(`/dashboard/setup-view/insert-scores?unitId=${encodeURIComponent(contextMenu.selectedUnit.id)}&environment=${encodeURIComponent(contextMenu.selectedUnit.environment)}&type=${encodeURIComponent(contextMenu.selectedUnit.unitType)}`);
              }}
            >
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Activate Setup View
              </span>
              <span className="text-gray-400 text-xs ml-4">CTRL + 2</span>
            </button>
          </div>
        )}

        {/* Unit editor Section */}
        <div className="h-1/2 my-0.5" ref={formRef}>
          <UnitEditor
            unitId={selectedUnit?.id}
            candidateId={selectedCandidate?.id}
            selectedBlock={selectedBlock}
            onClose={() => {
              setShowEdit(false);
              setShowEditBlockManager(false);
            }}
            showUnitForm={selectedUnit && showEdit}
            showEditBlockManager={selectedUnit && showEditBlockManager}
            activeTab={activeTab}
            onSave={handleUnitSave} 
            updateUnit={updateUnit} 
          />

        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 lg:w-9/12 bg-white">
        {showAdd && (
          <div className="h-full flex flex-col w-96">
            <CreateUnitForm onClose={() => setShowAdd(false)} onSubmit={handleCreate}   />
          </div>
        )}

        {showAddBlockManager && (
          <div className="h-full flex flex-col w-96">
            <CreateBlockManagerForm onClose={() => setShowAddBlockManager(false)} activeTab={activeTab} />
          </div>
        )}

        {!showAdd && showUnitRoster && (
          <div className="h-full overflow-auto">
            <UnitRoster activeTab={activeTab}  setActiveTab={setActiveTab} setShowEditBlockManager={setShowEditBlockManager} setShowEdit={setShowEdit}
            unitRosterData={filteredUnitRosterData} // Pass filtered data
            selectedUnit={selectedUnit}
            selectedCandidate={selectedCandidate}
            onBlockSelect={setSelectedBlock}
            onRosterUpdate={handleRosterUpdate}
               />
          </div>
        )}
      </div>

    </div>
  );
}
