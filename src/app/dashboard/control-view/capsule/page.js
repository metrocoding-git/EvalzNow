"use client";
import { ChevronDown, ChevronRight, Play, Plus, Settings, Trash2, Search, Copy, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import CapsuleEditor from "./components/CapsuleEditor";
import CreateCapsuleForm from "./components/CreateCapsuleForm";
import CapsuleRoster from "./components/CapsuleRoster";
import CreateCapsuleBlockForm from "./components/CreateCapsuleBlockForm";
import {
  createCapsule, deleteCapsule, getAllCapsules, updateCapsule, getCapsuleRosterByCapsuleId,
} from "@/services/capsuleService";
import { useFormStatus } from "@/context/FormStatusContext";
import { activateCapsule } from "@/lib/activeEntity";
import { useRouter } from "next/navigation";

/**
 * Control View → Capsule.
 * Same structure as the Unit tab (list + Entity Editor on the left, Create form / Capsule Config on the right).
 * Capacity Accounting is kept separate from units, so this tab has its own data and its own "active capsule"
 * (sessionStorage "selectedCapsuleId").
 */
export default function CapsuleControl() {
  const router = useRouter();
  const contextRef = useRef(null);
  const formRef = useRef(null);
  const createFormRef = useRef(null);
  const controlsRef = useRef(null);
  const escHeld = useRef(false);

  const [dataList, setDataList] = useState([]);
  const [selectedCapsule, setSelectedCapsule] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddBlockManager, setShowAddBlockManager] = useState(false);
  const [showEditBlockManager, setShowEditBlockManager] = useState(false);
  const [showCapsuleRoster, setCapsuleRoster] = useState(false);
  const [capsuleToDuplicate, setCapsuleToDuplicate] = useState(null);

  const [showList, setShowList] = useState(true);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");

  const [capsuleRosterData, setCapsuleRosterData] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [activeTab, setActiveTab] = useState("Indirect");
  const [sortBy, setSortBy] = useState("lastName");
  const [candidateSortOrder, setCandidateSortOrder] = useState("asc");

  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, selectedCapsule: null });
  const { setFormStatus } = useFormStatus();

  // ---- data ------------------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const capsules = await getAllCapsules();
        setDataList(Array.isArray(capsules) ? capsules : []);
      } catch (err) {
        console.error("Failed to load capsules:", err);
        toast.error("Failed to load capsules.");
      }
    })();
  }, []);

  const refreshRoster = async (capsule = selectedCapsule) => {
    if (!capsule?.id) return [];
    const rows = await getCapsuleRosterByCapsuleId(capsule.id);
    setCapsuleRosterData(rows);
    return rows;
  };

  useEffect(() => {
    refreshRoster();
  }, [selectedCapsule?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- list ------------------------------------------------------------------
  const sortedDataList = [...dataList].sort((a, b) => {
    const value = (item) => (sortField === "id" ? String(item.capsuleId ?? "") : String(item[sortField] || "").toLowerCase());
    const cmp = value(a).localeCompare(value(b), undefined, { numeric: true });
    return sortOrder === "asc" ? cmp : -cmp;
  });
  const filteredCapsules = sortedDataList.filter((c) =>
    (c.capsuleName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.capsuleId || "").toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortOrder("asc"); }
  };
  const toggleCandidateSort = (field) => {
    if (sortBy === field) setCandidateSortOrder(candidateSortOrder === "asc" ? "desc" : "asc");
    else { setSortBy(field); setCandidateSortOrder("asc"); }
  };

  const filteredCandidates = capsuleRosterData
    .filter((r) => r.candidate)
    .filter((r) => {
      const term = searchTerm.toLowerCase();
      const c = r.candidate;
      return (c.lastName || "").toLowerCase().includes(term) ||
        (c.firstName || "").toLowerCase().includes(term) ||
        (c.candidateId || "").toLowerCase().includes(term);
    })
    .sort((a, b) => {
      const cmp = String(a.candidate?.[sortBy] ?? "").localeCompare(String(b.candidate?.[sortBy] ?? ""), undefined, { numeric: true, sensitivity: "base" });
      return candidateSortOrder === "asc" ? cmp : -cmp;
    });

  // Select the first capsule by default (as the Unit tab does)
  useEffect(() => {
    if (showCapsuleRoster) return;
    if (dataList.length > 0) {
      setSelectedCapsule((prev) => dataList.find((c) => c.id === prev?.id) || dataList[0]);
      setShowEdit(true);
      setShowAdd(false);
    } else {
      setSelectedCapsule(null);
      setShowEdit(false);
    }
  }, [dataList, showCapsuleRoster]);

  // Click outside the list / forms closes the context menu and the selection (same as units)
  useEffect(() => {
    const handleClickOutside = (e) => {
      const inside = [contextRef, formRef, createFormRef, controlsRef].some((r) => r.current && r.current.contains(e.target));
      if (!inside && !e.target.closest(".capsule-item")) {
        setContextMenu({ visible: false, x: 0, y: 0, selectedCapsule: null });
        if (!showCapsuleRoster) {
          setSelectedCapsule(null);
          setShowEdit(false);
        }
        setFormStatus("Ready...");
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [showCapsuleRoster, setFormStatus]);

  // ---- actions ---------------------------------------------------------------
  const handleCreate = async (newCapsule) => {
    if (dataList.some((c) => c.capsuleId?.toLowerCase() === newCapsule.capsuleId?.toLowerCase())) {
      toast.error(`A capsule with ID "${newCapsule.capsuleId}" already exists.`);
      setShowAdd(true);
      return false;
    }
    try {
      const data = await createCapsule({ ...newCapsule, clientId: sessionStorage.getItem("activeClientId") });
      setDataList((prev) => [...prev, data]);
      setSelectedCapsule(data);
      setShowAdd(false);
      return true;
    } catch (err) {
      console.error("Failed to create capsule:", err);
      toast.error(err.message || "Failed to create capsule. Please try again.");
      return false;
    }
  };

  const handleDelete = async (id) => {
    try {
      setFormStatus("processing...");
      await deleteCapsule(id);
      const updated = dataList.filter((c) => c.id !== id);
      setDataList(updated);
      setFormStatus("Capsule Deleted");
      if (selectedCapsule?.id === id) {
        setSelectedCapsule(updated[0] || null);
        setShowEdit(updated.length > 0);
      }
      setContextMenu((prev) => ({ ...prev, visible: false }));
    } catch (err) {
      console.error("Failed to delete capsule:", err);
      toast.error("Failed to delete capsule.");
    }
  };

  const handleCapsuleSave = async (updatedCapsule) => {
    setDataList((prev) => prev.map((c) => (c.id === updatedCapsule.id ? updatedCapsule : c)));
    setSelectedCapsule(updatedCapsule);
    setFormStatus("Capsule Updated");
    return updatedCapsule;
  };

  const handleDuplicate = (capsule) => {
    if (!capsule) return;
    setContextMenu((prev) => ({ ...prev, visible: false }));
    setCapsuleToDuplicate({
      ...capsule,
      staffAssignments: (capsule.staffAssignments || []).map((sa) => ({ roleType: sa.roleType, staff: { ...sa.staff } })),
    });
    setShowAdd(true);
    setFormStatus("Creating...");
  };

  const openCapsuleConfig = async (capsule) => {
    if (!capsule) return;
    setSelectedCapsule(capsule);
    activateCapsule(capsule.id);
    setCapsuleRoster(true);
    setShowAdd(false);
    setShowEdit(false);
    setContextMenu((prev) => ({ ...prev, visible: false }));
    const rows = await refreshRoster(capsule);
    setSelectedCandidate(rows[0]?.candidate || null);
  };

  // ESC + 2 → Setup View, ESC + 3 → Analytics View (with this capsule active)
  const activateView = (capsule, view) => {
    if (!capsule) return;
    activateCapsule(capsule.id);
    setContextMenu((prev) => ({ ...prev, visible: false }));
    router.push(view === "Setup View" ? "/dashboard/setup-view/insert-scores" : "/dashboard/analytics-view/scoring-trends");
  };

  // Hotkeys (same as units; Capsule Config = ESC + V)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") { escHeld.current = true; return; }
      if (!escHeld.current || !selectedCapsule) return;
      if (e.code === "KeyE") { e.preventDefault(); handleDuplicate(selectedCapsule); }
      if (e.code === "KeyV") { e.preventDefault(); openCapsuleConfig(selectedCapsule); }
      if (e.code === "Delete") { e.preventDefault(); handleDelete(selectedCapsule.id); }
      if (e.code === "Digit2") { e.preventDefault(); activateView(selectedCapsule, "Setup View"); }
      if (e.code === "Digit3") { e.preventDefault(); activateView(selectedCapsule, "Analytics View"); }
    };
    const handleKeyUp = (e) => { if (e.key === "Escape") escHeld.current = false; };
    const handleBlur = () => { escHeld.current = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }); // re-bound every render so the handlers always see the current selection

  const closeConfig = () => {
    setSelectedCapsule(null);
    setShowEdit(false);
    setShowAdd(false);
    setShowAddBlockManager(false);
    setShowEditBlockManager(false);
    setCapsuleRoster(false);
  };

  return (
    <div className="flex w-full h-full overflow-hidden">
      <div className="w-1/2 lg:w-4/12 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="flex flex-col border-1 border-gray-200 overflow-hidden h-1/2 ">
          {/* Header */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-1.5">
            <div className="flex flex-col mb-3">
              <div className="flex justify-end gap-1">
                {!showAdd && showCapsuleRoster ? (
                  <button
                    className="inline-flex items-center px-1.5 py-1.5 text-xs font-medium text-white bg-gray-200 hover:bg-gray-400 transition-colors cursor-pointer"
                    onClick={closeConfig}
                    title="Back to capsules"
                  >
                    <Undo2 className="w-3.5 h-3.5 text-black" />
                  </button>
                ) : (
                  <>
                    <button
                      ref={controlsRef}
                      title="Create Capsule"
                      className="inline-flex items-center px-1.5 py-1.5 text-xs font-medium text-white bg-gray-200 hover:bg-gray-400 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCapsule(null);
                        setCapsuleToDuplicate(null);
                        setShowAdd(true);
                        setShowEdit(false);
                        setFormStatus("Creating...");
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 text-black" />
                    </button>
                    {selectedCapsule && (
                      <div className="flex gap-1 capsule-item">
                        <button
                          title="Delete Capsule"
                          className="p-1.5 text-gray-800 bg-gray-200 hover:bg-gray-400 hover:text-gray-900 transition-colors"
                          onClick={() => handleDelete(selectedCapsule.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
            </div>

            {showCapsuleRoster ? (
              <div className="grid grid-cols-3 gap-1 text-xs font-semibold text-black">
                <div className="cursor-pointer select-none" onClick={() => toggleCandidateSort("lastName")}>Last Name</div>
                <div className="cursor-pointer select-none" onClick={() => toggleCandidateSort("firstName")}>First Name</div>
                <div className="cursor-pointer select-none" onClick={() => toggleCandidateSort("candidateId")}>Candidate ID</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1 text-xs font-semibold text-black">
                <div className="flex items-center cursor-pointer select-none" onClick={() => toggleSort("capsuleName")}>Name</div>
                <div className="flex items-center cursor-pointer select-none" onClick={() => toggleSort("id")}>Capsule ID</div>
              </div>
            )}
          </div>

          {/* Capsule Config: capsule details + roster candidates */}
          {!showAdd && showCapsuleRoster && (
            <div className=" pb-1 flex-1 overflow-auto">
              <div className="items-center justify-center px-4 py-2 mt-1 mb-2 ">
                <div className="border border-gray-200 p-2">
                  <span className="text-sm text-gray-600">Capsule Name: {selectedCapsule?.capsuleName || "N/A"}</span><br />
                  <span className="text-sm text-gray-600">Capsule ID: {selectedCapsule?.capsuleId || "N/A"}</span><br />
                  <span className="text-sm text-gray-600">Capsule Type: {selectedCapsule?.capsuleType || "N/A"}</span><br />
                  <span className="text-sm text-gray-600">Signature Profile: {selectedCapsule?.signatureProfile || "N/A"}</span>
                </div>
              </div>
              <div>
                {filteredCandidates.map((rosterItem) => (
                  <div
                    key={rosterItem.id}
                    className={`grid grid-cols-3 gap-1 px-4 py-1 border-b border-gray-200 cursor-pointer
                      ${selectedCandidate?.id === rosterItem.candidate?.id ? "bg-blue-100 border-l-4 border-l-blue-400 text-black" : "hover:bg-gray-50"}`}
                    onClick={() => setSelectedCandidate((prev) => (prev?.id === rosterItem.candidate?.id ? null : rosterItem.candidate))}
                  >
                    <div className="text-sm">{rosterItem.candidate?.lastName || "N/A"}</div>
                    <div className="text-sm">{rosterItem.candidate?.firstName || "N/A"}</div>
                    <div className="text-sm">{rosterItem.candidate?.candidateId || "N/A"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Capsule list */}
          {!showCapsuleRoster && (
            <div className="flex-[1.1] min-h-0 overflow-auto">
              <div
                className="flex items-center px-4 py-2 cursor-pointer select-none hover:text-gray-700 transition-colors"
                onClick={() => setShowList((prev) => !prev)}
              >
                {showList ? <ChevronDown className="w-4 h-4 text-gray-700 mr-2" /> : <ChevronRight className="w-4 h-4 text-gray-700 mr-1" />}
                <p className="text-sm font-medium text-gray-900">Capsules ({dataList.length})</p>
              </div>

              {showList && filteredCapsules.map((item) => {
                const isSelected = selectedCapsule && selectedCapsule.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`capsule-item grid grid-cols-2 gap-2 items-center cursor-pointer px-4 py-2 border-b border-gray-50 transition-all ${isSelected
                      ? "bg-blue-100 border-l-4 border-l-blue-400 text-black"
                      : "hover:bg-gray-50"}`}
                    onClick={() => { setSelectedCapsule(item); setShowEdit(true); setShowAdd(false); }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedCapsule(item);
                      setShowEdit(true);
                      setContextMenu({ visible: true, x: e.pageX, y: e.pageY, selectedCapsule: item });
                    }}
                  >
                    <p className={`text-sm font-medium truncate ${isSelected ? "text-black" : "text-gray-800"}`}>{item.capsuleName}</p>
                    <p className={`text-sm font-medium truncate ${isSelected ? "text-black" : "text-gray-800"}`}>{item.capsuleId}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            ref={contextRef}
            className="capsule-item absolute bg-gray-200 border font-semibold border-gray-300 shadow-md z-50 w-70"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className="flex justify-between items-center px-4 py-2 text-xs text-gray-800 hover:bg-gray-300 w-full text-left"
              onClick={(e) => { e.stopPropagation(); handleDuplicate(contextMenu.selectedCapsule); }}
            >
              <span className="flex items-center gap-2"><Copy className="w-4 h-4" /> Duplicate</span>
              <span className="text-gray-400 text-xs ml-4">ESC + E</span>
            </button>
            <button
              className="flex justify-between items-center px-4 py-2 text-xs text-gray-800 hover:bg-gray-300 w-full text-left border-t border-gray-200"
              onClick={() => openCapsuleConfig(contextMenu.selectedCapsule)}
            >
              <span className="flex items-center gap-2"><Settings className="w-4 h-4" /> Capsule Config</span>
              <span className="text-gray-400 text-xs ml-4">ESC + V</span>
            </button>
            <button
              className="flex justify-between items-center px-4 py-2 text-xs text-gray-800 hover:bg-red-200 w-full text-left border-t border-gray-200"
              onClick={() => handleDelete(contextMenu.selectedCapsule.id)}
            >
              <span className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete</span>
              <span className="text-gray-400 text-xs ml-4">ESC + Del</span>
            </button>
            <button
              className="flex justify-between items-center px-4 py-2 text-xs text-gray-800 hover:bg-gray-300 w-full text-left border-t border-gray-200"
              onClick={() => activateView(contextMenu.selectedCapsule, "Setup View")}
            >
              <span className="flex items-center gap-2"><Play className="w-4 h-4" /> Activate Setup View</span>
              <span className="text-gray-400 text-xs ml-4">ESC + 2</span>
            </button>
            <button
              className="flex justify-between items-center px-4 py-2 text-xs text-gray-800 hover:bg-gray-300 w-full text-left border-t border-gray-200"
              onClick={() => activateView(contextMenu.selectedCapsule, "Analytics View")}
            >
              <span className="flex items-center gap-2"><Play className="w-4 h-4" /> Activate Analytics View</span>
              <span className="text-gray-400 text-xs ml-4">ESC + 3</span>
            </button>
          </div>
        )}

        {/* Entity Editor */}
        <div className="h-1/2 my-0.5" ref={formRef}>
          <CapsuleEditor
            capsuleDbId={selectedCapsule?.id}
            selectedBlock={selectedBlock}
            onClose={() => { setShowEdit(false); setShowEditBlockManager(false); }}
            showCapsuleForm={!!selectedCapsule && showEdit && !showCapsuleRoster}
            showEditBlockManager={!!selectedCapsule && showEditBlockManager}
            activeTab={activeTab}
            onSave={handleCapsuleSave}
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white">
        {showAdd && (
          <div className="h-full flex flex-col" ref={createFormRef}>
            <CreateCapsuleForm
              onClose={() => { setShowAdd(false); setCapsuleToDuplicate(null); }}
              onSubmit={handleCreate}
              capsuleData={capsuleToDuplicate}
            />
          </div>
        )}

        {showAddBlockManager && (
          <div className="h-full flex flex-col">
            <CreateCapsuleBlockForm onClose={() => setShowAddBlockManager(false)} activeTab={activeTab} />
          </div>
        )}

        {!showAdd && showCapsuleRoster && (
          <div className="h-full overflow-auto">
            <CapsuleRoster
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setShowEditBlockManager={setShowEditBlockManager}
              setShowEdit={setShowEdit}
              capsuleRosterData={capsuleRosterData}
              selectedCapsule={selectedCapsule}
              selectedCandidate={selectedCandidate}
              onBlockSelect={setSelectedBlock}
              refreshCandidateData={() => refreshRoster()}
              showEditBlockManager={showEditBlockManager}
            />
          </div>
        )}
      </div>
    </div>
  );
}
