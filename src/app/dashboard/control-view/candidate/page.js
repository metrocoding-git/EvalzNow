"use client";

import {
  Edit3,
  Eye,
  Trash2,
  CopyPlus,
  Plus,
  Trash,
  ChevronDown,
  ChevronRight,
  Search,
  List,
  View,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CandidateEditor from "./components/CandidateEditor";
import CreateCandidateForm from "./components/CreateCandidateForm";
import ReviewCandidate from "./components/ReviewCandidate";
import { createCandidate, deleteCandidate, getAllCandidates } from "@/services/candidateService";
import { createEthinicity, deleteEthinicity, getAllEthinicities, updateEthinicity } from "@/services/ethinictyService";
import { createIncome, deleteIncome, getAllIncomes, updateIncome } from "@/services/incomeService";
import { useFormStatus } from "@/context/FormStatusContext";

export default function CandidateControl() {
  const contextRef = useRef(null);
  const formRef = useRef(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showList, setShowList] = useState(true);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [ethnicities, setEthnicities] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [showObjects, setShowObjects] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataList, setDataList] = useState([
    // { id: "001", firstName: "John", lastName: "Doe" },
    // { id: "002", firstName: "Jane", lastName: "Smith" },
    // { id: "003", firstName: "Alex", lastName: "Johnson" },
    // { id: "004", firstName: "Emily", lastName: "Davis" },
    // { id: "005", firstName: "Chris", lastName: "Brown" },
    // { id: "006", firstName: "Pat", lastName: "Miller" },
    // { id: "007", firstName: "Taylor", lastName: "Wilson" },
    // { id: "008", firstName: "Jordan", lastName: "Moore" },
    // { id: "009", firstName: "Morgan", lastName: "Taylor" },
    // { id: "010", firstName: "Casey", lastName: "Anderson" },
  ]);

   // const [formStatus, setFormStatus] = useState("Ready");
   const { setFormStatus } = useFormStatus();

  // Fetch all candidates on mount
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const data = await getAllCandidates();
        const sortedData = Array.isArray(data)
          ? [...data].sort((a, b) => Number(a.id) - Number(b.id))
          : [];
        setDataList(sortedData);

        if (sortedData.length > 0) {
          setSelectedCandidate(sortedData[0]);
          setShowEdit(true);
        }
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
    const fetchEthnicity = async () => {
      try {
        setLoading(true);
        const data = await getAllEthinicities();
        // keep objects instead of just names
        setEthnicities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch ethnicities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEthnicity();
  }, []);


  // Fetch all candidates on mount
  useEffect(() => {
    const fetchIncome = async () => {
      try {
        setLoading(true);
        const data = await getAllIncomes();
        // keep objects instead of just names
        setIncomes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch ethnicities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIncome();
  }, []);
  
  


  // Create candidate
  const handleCreate = async (newCandidate) => {
    try {
      const created = await createCandidate(newCandidate);
      setDataList(prev => [...prev, created]);
      setSelectedCandidate(created);
      setShowAdd(false);
      setShowEdit(true);
    } catch (err) {
      console.error("Failed to create candidate:", err);
      setError("Failed to create candidate.");
    }
  };


  const getFilteredData = () => {
    const sorted = [...dataList].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === "id") {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = (valA || "").toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    // ✅ Filter by search term
    if (!searchTerm.trim()) return sorted;

    return sorted.filter((item) => {
      const term = searchTerm.toLowerCase();
      return (
        item.firstName?.toLowerCase().includes(term) ||
        item.lastName?.toLowerCase().includes(term) ||
        String(item.candidateId || item.id).toLowerCase().includes(term)
      );
    });
  };

   // Handle sorting
   const getSortedData = () => {
    return [...dataList].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === "id") {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = (valA || "").toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedCandidate: null,
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      const isContextMenuClick =
        contextRef.current && contextRef.current.contains(e.target);
      const isCandidateClick = e.target.closest(".candidate-item");
      const isFormClick = formRef.current && formRef.current.contains(e.target);

      // Only deselect if click is outside candidate item, context menu, and form
      if (!isContextMenuClick && !isCandidateClick && !isFormClick) {
        setContextMenu({ visible: false, x: 0, y: 0, selectedCandidate: null });
        // setSelectedCandidate(null);
        setShowEdit(false);
        setFormStatus("Ready...");
      }
    };

    if(dataList.length>0){
      setSelectedCandidate(dataList[0]);
      setShowEdit(true);
      setShowAdd(false);
    }else {
      setSelectedCandidate(null);
      setShowEdit(false);
    }

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [dataList]);

  

  const handleDelete = async (id) => {
    try {
      await deleteCandidate(id);
      const updated = dataList.filter(item => item.id !== id);
      setDataList(updated);
      if (selectedCandidate?.id === id) {
        setSelectedCandidate(updated[0] || null);
        setShowEdit(updated.length > 0);
      }
      setContextMenu(prev => ({ ...prev, visible: false }));
    } catch (err) {
      console.error("Failed to delete candidate:", err);
      setError("Failed to delete candidate.");
    }
  };

  const handleEthnicityChange = async (idx, value) => {
    const updated = [...ethnicities];
    updated[idx] = { ...updated[idx], name: value }; // keep existing id if any
    setEthnicities(updated);
  
    try {
      // If existing (has id) → update
      if (updated[idx].id) {
        await updateEthinicity(updated[idx].id, { name: value });
      } 
      // Else → create new
      else if (value.trim() !== "") {
        const created = await createEthinicity({ name: value });
        updated[idx] = created; // replace with saved object (with ID)
        setEthnicities([...updated]);
      }
    } catch (err) {
      console.error("Failed to save ethnicity:", err);
    }
  };
  
  
  const handleEthnicityDelete = async (idx) => {
    const eth = ethnicities[idx];
  
    try {
      // Only delete from backend if it has an ID
      if (eth.id) {
        await deleteEthinicity(eth.id);
      }
  
      // Remove from state
      setEthnicities(ethnicities.filter((_, i) => i !== idx));
    } catch (err) {
      console.error("Failed to delete ethnicity:", err);
    }
  };

  const handleAddEthnicity = () => {
    setEthnicities([...ethnicities, { name: "" }]); // no id yet
  };
  

  const handleIncomeChange = async (idx, value) => {
    const updated = [...incomes];
    updated[idx] = { ...updated[idx], name: value }; // keep existing id if any
    setIncomes(updated);
  
    try {
      // If existing (has id) → update
      if (updated[idx].id) {
        await updateIncome(updated[idx].id, { name: value });
      } 
      // Else → create new
      else if (value.trim() !== "") {
        const created = await createIncome({ name: value });
        updated[idx] = created; // replace with saved object (with ID)
        setIncomes([...updated]);
      }
    } catch (err) {
      console.error("Failed to save income:", err);
    }
  };
  
  const handleIncomeDelete = async (idx) => {
    const income = incomes[idx];
  
    try {
      // Only delete from backend if it has an ID
      if (income.id) {
        await deleteIncome(income.id);
      }
  
      // Remove from state
      setIncomes(incomes.filter((_, i) => i !== idx));
    } catch (err) {
      console.error("Failed to delete income:", err);
    }
  };
  
  const handleAddIncome = () => {
    setIncomes([...incomes, { name: "" }]); // no id yet
  };

  console.log("selected Candiate", selectedCandidate);
  

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-1/2 lg:w-3/12 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="flex flex-col border-1 border-gray-200  overflow-hidden h-1/2">
          {/* Header */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-1.5">
            {/* Control buttons */}
            <div className="flex flex-col mb-3">
              <div className="flex justify-end gap-1">
                <button
                  className="inline-flex items-center px-1.5 py-1.5 text-xs font-medium text-white bg-gray-200 hover:bg-gray-400 transition-colors"
                  onClick={() => {
                    setSelectedCandidate(null);
                    setShowAdd(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 text-black" />
                </button>

                {selectedCandidate && (
                  <div className="flex gap-1 candidate-item">
                    <button
                      className="p-1.5 text-gray-600 bg-gray-200 hover:bg-gray-400 hover:text-white transition-colors"
                      onClick={() => handleDelete(selectedCandidate.id)}
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
            {/* Column Headers */}
            <div className="grid grid-cols-3 gap-1 text-xs font-semibold text-black tracking-wide">
              {[
                { key: "lastName", label: "Last Name" },
                { key: "firstName", label: "First Name" },
                { key: "id", label: "Candidate ID" },
              ].map((col) => (
                <div
                  key={col.key}
                  className="flex items-center cursor-pointer select-none"
                  onClick={() => {
                    if (sortBy === col.key) {
                      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                    } else {
                      setSortBy(col.key);
                      setSortOrder("asc");
                    }
                  }}
                >
                  {col.label}
                </div>
              ))}
            </div>
          </div>

          {/* List Toggle */}
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
                Candidates ({dataList.length})
              </p>
            </div>

            {showList &&
              getFilteredData().map((item, index) => {
                const isSelected = selectedCandidate?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`candidate-item grid grid-cols-3 gap-2 items-center cursor-pointer px-4 py-2 border-b border-gray-50 transition-all ${
                      isSelected
                        ? "bg-blue-100 border-l-4 border-l-blue-400 text-black"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedCandidate(item);
                      setShowEdit(true);
                      setShowAdd(false);
                      setShowReview(false);
                      setFormStatus("Editing...");
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedCandidate(item);
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
                      {item.candidateId}
                    </p>
                  </div>
                );
              })}

            {/* Objects Section */}
            <div className="border-t border-gray-200">
              <div
                className="flex items-center cursor-pointer select-none text-sm font-medium text-gray-900 px-4 py-2 hover:text-gray-700 transition-colors"
                onClick={() => setShowObjects((prev) => !prev)}
              >
                {showObjects ? (
                  <ChevronDown className="w-4 h-4 text-gray-500 mr-2" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500 mr-2" />
                )}
                Objects
              </div>

              {showObjects && (
                <div className="px-4 py-2 space-y-4">
                  {/* Ethnicity Inputs */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Ethnicities (Max 10):
                    </label>
                    <div className="space-y-1">
                      {ethnicities.map((eth, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={25}
                            value={eth.name || ""}
                            onChange={(e) => handleEthnicityChange(idx, e.target.value)}
                            className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                            placeholder={`Ethnicity ${idx + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleEthnicityDelete(idx)}
                            className="text-red-500 text-xs"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {ethnicities.length < 10 && (
                        <button
                          type="button"
                          onClick={handleAddEthnicity}
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-sm text-gray-800"
                        >
                          + Add Ethnicity
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Income Inputs */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Incomes Ranges (Max 10):
                    </label>
                    <div className="space-y-1">
                      {incomes.map((income, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={25}
                            value={income.name || ""}
                            onChange={(e) => handleIncomeChange(idx, e.target.value)}
                            className="w-full border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                            placeholder={`Income Ranges ${idx + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleIncomeDelete(idx)}
                            className="text-red-500 text-xs"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {incomes.length < 10 && (
                        <button
                          type="button"
                          onClick={handleAddIncome}
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-sm text-gray-800"
                        >
                          + Add Income
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            ref={contextRef}
            className="absolute bg-gray-200 border border-gray-300 shadow-md z-50 w-56"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-gray-300 w-full text-left border-t border-gray-200"
              onClick={(item) => {
                setContextMenu((prev) => ({ ...prev, visible: false }));
                setSelectedCandidate(contextMenu.selectedCandidate);
                setShowReview(true);
                setShowEdit(false);
                setShowAdd(false);
              }}
            >
              <span className="flex items-center gap-2">
                <View className="w-4 h-4" /> Review
              </span>
              <span className="text-gray-400 text-xs ml-4">Ctrl + R</span>
            </button>

            <button
              className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-red-200 w-full text-left border-t border-gray-200"
              onClick={() => {
                handleDelete(contextMenu.selectedCandidate.id);
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
            >
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </span>
              <span className="text-gray-400 text-xs ml-4">Del</span>
            </button>
          </div>
        )}

        {/* Candidate editor Section */}
        <div className="h-1/2 overflow-auto my-0.5" ref={formRef}>
        <CandidateEditor
          candidate={selectedCandidate}
          showForm={showEdit}
          onSave={(updatedCandidate) => {
            setDataList((prev) =>
              prev.map((c) =>
                c.id === updatedCandidate.id ? updatedCandidate : c
              )
            );
            setSelectedCandidate(updatedCandidate);
            setFormStatus("Completed");

              // Optional: revert back to Ready after 2s
              setTimeout(() => setFormStatus("Ready..."), 2000);
          }}
        />

        </div>
      </div>

      {/* Right Panel - Create Candidate */}
      <div className="w-1/2 lg:w-9/12 bg-white">
        
          {showAdd && (
            <div className="h-full flex flex-col w-96">
              <CreateCandidateForm onClose={() => setShowAdd(false)} onCreate={handleCreate} />
            </div>
          )}
          {showReview && (
            <div className="h-full overflow-auto">
              <ReviewCandidate candidate={selectedCandidate} />
            </div>
          )}
       
      </div>
    </div>
  );
}
