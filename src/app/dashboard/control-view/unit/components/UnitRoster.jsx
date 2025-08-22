"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import SearchLookup from "./LookUpTable";
import CreateBlockManagerForm from "./CreateBlockManagerForm";
import { deleteAssessmentBlock, getAssessmentBlockByUnitId } from "@/services/assessmentBlockManagerService";
import { deleteUnitRoster, getUniRostertByUnitId } from "@/services/unitRosterService";


export default function UnitRoster({ activeTab, setActiveTab, setShowEditBlockManager, setShowEdit, unitRosterData = [],
  selectedUnit, onBlockSelect  }) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [showSearchLookup, setShowSearchLookup] = useState(false);
  const [selectedEntitiyRows, setSelectedEntityRows] = useState([]);

  const [showCreateBlockForm, setShowCreateBlockForm] = useState(false);
  const [displayRosterData, setDisplayRosterData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [assessmentBlocks, setAssessmentBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);



  const [points, setPoints] = useState(
    Array.from({ length: 20 }, () => ({ x: "", y: "" }))
  );
  const [visible, setVisible] = useState(true);

  const handlePointChange = (index, field, value) => {
    // Update the specific roster entry
    setDisplayRosterData(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          [field]: value
        };
      }
      return updated;
    });
  };

  
  const toggleRowSelection = (index) => {
    // setSelectedRow((prev) =>
    //   prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    // );
    setSelectedRow(index)
  };

  const handleUnitRosterDeleteCurve = async () => {
    if (selectedEntitiyRows.length === 0) return;
  
    try {
      // Get the selected roster items to delete
      const itemsToDelete = selectedEntitiyRows.map(index => displayRosterData[index]);
  
      // Delete each item from the backend
      for (const item of itemsToDelete) {
        if (item.id) { // Make sure it has an ID
          await deleteUnitRoster(item.id);
        }
      }
  
      // Refresh roster table after deletion
      await fetchRosterData();
  
      // Clear selection
      setSelectedEntityRows([]);
  
      console.log("✅ Selected roster items deleted successfully");
    } catch (err) {
      console.error("❌ Failed to delete selected roster items:", err);
      alert("Failed to delete selected roster items. Please try again.");
    }
  };
  

  // Fetch all unit roster by unit id
  useEffect(() => {
    const fetchBlockByUnitId = async () => {
      try {
        setLoading(true);
        const blocks = await getAssessmentBlockByUnitId(selectedUnit.id);
        setAssessmentBlocks(Array.isArray(blocks) ? blocks : []);
        console.log("Assessment Block", blocks);
        // ❌ Missing: You're not storing the fetched data anywhere!
      } catch (err) {
        console.error("Failed to fetch units:", err);
        setError("Failed to load units. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchBlockByUnitId();
  }, [selectedUnit.id]);

  const handleBlockManagerDeleteCurve = () => {
    // const updated = points.filter((_, index) => !selectedRow.includes(index));
    // setPoints(updated);
    setSelectedRow(null); // reset selection
    setShowEditBlockManager(false);
  };

  const moveRowUp = () => {
    if (selectedRow === null || selectedRow === 0) return;
  
    // Find the block in full list
    const blockToMove = filteredAssessmentBlocks[selectedRow];
    const globalIndex = assessmentBlocks.findIndex(b => b.id === blockToMove.id);
  
    if (globalIndex > 0) {
      const updated = [...assessmentBlocks];
      [updated[globalIndex - 1], updated[globalIndex]] = [updated[globalIndex], updated[globalIndex - 1]];
      setAssessmentBlocks(updated);
      setSelectedRow(selectedRow - 1);
    }
  };
  
  const moveRowDown = () => {
    if (selectedRow === null || selectedRow === filteredAssessmentBlocks.length - 1) return;
  
    // Find the block in full list
    const blockToMove = filteredAssessmentBlocks[selectedRow];
    const globalIndex = assessmentBlocks.findIndex(b => b.id === blockToMove.id);
  
    if (globalIndex < assessmentBlocks.length - 1) {
      const updated = [...assessmentBlocks];
      [updated[globalIndex + 1], updated[globalIndex]] = [updated[globalIndex], updated[globalIndex + 1]];
      setAssessmentBlocks(updated);
      setSelectedRow(selectedRow + 1);
    }
  };
  

  // const handleCandidateSelect = (newUnitRosterEntries) => {
  //   console.log("Selected candidate in roster:", newUnitRosterEntries);
  //   // Here, handle the selected candidate:
  //   // - Add them to the roster
  //   // - Fill in the form fields
  //   // - Store the selection for further processing
  //   setDisplayRosterData(newUnitRosterEntries);
  //   setShowSearchLookup(false);
  // };



  const fetchRosterData = async () => {
    if (!selectedUnit?.id) return;
    try {
      setLoading(true);
      const roster = await getUniRostertByUnitId(selectedUnit.id);
      setDisplayRosterData(Array.isArray(roster) ? roster : []);
    } catch (err) {
      console.error("❌ Failed to fetch roster:", err);
      setError("Failed to load roster");
    } finally {
      setLoading(false);
    }
  };
  
  // call on mount or when unit changes
  useEffect(() => {
    fetchRosterData();
  }, [selectedUnit?.id]);
  


  const toggleRowSelectionMulti = (index) => {
    setSelectedEntityRows((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };


  const handleRowClick = (block, index) => {
    setSelectedRow(index);
    setSelectedBlock(block);   
    setShowEditBlockManager(true);
    setShowEdit(false);

    if (onBlockSelect) {
      onBlockSelect(block);
    }
  };

   // Extract candidate data from unit roster
   const existingCandidates = unitRosterData
   .filter(rosterItem => rosterItem.candidate)
   .map(rosterItem => rosterItem.candidate);

   const filteredAssessmentBlocks = assessmentBlocks.filter(block => 
    block.manageType === activeTab
  );

    const handleDeleteBlock = async () => {
      if (selectedRow === null) return; // no row selected
    
      try {
        const blockToDelete = filteredAssessmentBlocks[selectedRow];
        if (!blockToDelete) return;
    
        // Call API to delete
        await deleteAssessmentBlock(blockToDelete.id);
    
        // Remove from local state
        setAssessmentBlocks(prev => prev.filter(b => b.id !== blockToDelete.id));
    
        // Reset selection
        setSelectedRow(null);
        setShowEditBlockManager(false);
    
        console.log("Deleted block:", blockToDelete.id);
      } catch (err) {
        console.error("Failed to delete block:", err);
        alert("Failed to delete block. Please try again.");
      }
    };
  
   

  if (!visible) return null;

  return (
    <div className="flex flex-col h-full">
     
      <h2 className="text-md font-bold bg-gray-100 p-0.5  flex items-center border-b border-gray-200 relative">
        <span className="pl-2 text-md text-gray-800">Unit Config</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
        
        {showCreateBlockForm && (
          <div className="absolute top-0 left-0  z-50 h-[250px] bg-white shadow-2xl border border-gray-200 rounded-md">
            <CreateBlockManagerForm
              onClose={() => setShowCreateBlockForm(false)}
              unitId={selectedUnit.id}
              activeTab={activeTab}
            />
          </div>
        )}
          
      </h2>

       {/* Unit Roster */}
      <div className="h-1/2 overflow-hidden border border-gray-300 flex flex-col m-1">

        <div className="flex items-center justify-between border-b-1 border-gray-400 mb-1 px-1 mx-1 mt-1 text-gray-700 ">
          <h2 className="text-sm font-semibold mx-1">Unit Roster</h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearchLookup(true)}
              title="Search Candidates"
              className="text-gray-600 hover:text-black cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {selectedEntitiyRows.length > 0 && (
              <button
                onClick={handleUnitRosterDeleteCurve}
                title="Delete Selected Row(s)"
                className="text-gray-600 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}



          </div>
        </div>

        <div className="flex-1 overflow-auto px-3 ">
          <div className="flex-1 border border-gray-300 overflow-auto">
            <table className="w-full border text-left text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-1 w-8 text-center">#</th>
                  <th className="border p-1 w-[90px]">Last Name</th>
                  <th className="border p-1 w-[90px]">First Name</th>
                  <th className="border p-1 w-[90px]">Candidate ID</th>
                  <th className="border p-1 w-[90px]">Unit Outcome</th>
                  <th className="border p-1 w-[90px]">Present Count</th>
                  <th className="border p-1 w-24">Excused Absences</th>
                  <th className="border p-1 w-24">Unexcused Absences</th>
                  <th className="border p-1 w-24">Excused Tardies</th>
                  <th className="border p-1 w-24">Unexcused Tardies</th>
                  <th className="border p-1 w-16">Total Tally</th>
                </tr>
              </thead>
              <tbody>
                {displayRosterData.map((rosterItem, index) => {

                const candidate = rosterItem.candidate || {};
                // const isSelected = selectedEntitiyRows.includes(index);

                const present = parseInt(rosterItem.presentCount || 0);
                const excusedAbs = parseInt(rosterItem.excusedAbsences || 0);
                const unexcusedAbs = parseInt(rosterItem.unexcusedAbsences || 0);
                const excusedTardy = parseInt(rosterItem.excusedTardies || 0);
                const unexcusedTardy = parseInt(rosterItem.unexcusedTardies || 0);

                const total = present + excusedAbs + unexcusedAbs + excusedTardy + unexcusedTardy;

                  const isSelected = selectedEntitiyRows.includes(index);
                  return (
                    <tr key={index} onClick={() => toggleRowSelectionMulti(index)}
                      className={`cursor-pointer ${isSelected ? "bg-gray-200" : ""}`}>
                      <td className="border  text-center">{index + 1}</td>
                      <td className="border ">
                        <span className="block px-2 py-0.5 text-sm text-gray-800">
                          {candidate.lastName || "last name"}
                        </span>
                      </td>
                      <td className="border p-1">
                        <span className="block px-2 py-0.5 text-sm text-gray-800">
                          {candidate.firstName || "first name"}
                        </span>
                      </td>
                      <td className="border p-1">
                        <span className="block px-2 py-0.5 text-sm text-gray-800">
                          {candidate.candidateId || "candidate ID"}
                        </span>
                      </td>
                      <td className="border p-1">
                        <select className="w-full border px-2 py-0.5" value={rosterItem.unitOutcome || "0"}
                          onChange={(e) =>
                            handlePointChange(index, "unitOutcome", e.target.value)
                          }>
                          <option>Ongoing</option>
                          <option>Pass</option>
                          <option>Fail</option>
                        </select>
                      </td>
                      <td className="border p-1">
                        <input
                          type="number"
                          min="0"
                          value={rosterItem.presentCount || "0"}
                          onChange={(e) =>
                            handlePointChange(index, "present", e.target.value)
                          }
                          className="w-full border px-2 py-0.5"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="number"
                          min="0"
                          value={rosterItem.excusedAbsences || "0"}
                          onChange={(e) =>
                            handlePointChange(
                              index,
                              "excusedAbs",
                              e.target.value
                            )
                          }
                          className="w-full border px-2 py-0.5"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="number"
                          min="0"
                          value={rosterItem.unexcusedAbsences || "0"}
                          onChange={(e) =>
                            handlePointChange(
                              index,
                              "unexcusedAbs",
                              e.target.value
                            )
                          }
                          className="w-full border px-2 py-0.5"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="number"
                          min="0"
                          value={rosterItem.excusedTardies || "0"}
                          onChange={(e) =>
                            handlePointChange(
                              index,
                              "excusedTardy",
                              e.target.value
                            )
                          }
                          className="w-full border px-2 py-0.5"
                        />
                      </td>
                      <td className="border p-1">
                        <input
                          type="number"
                          min="0"
                          value={rosterItem.unexcusedTardies || "0"}
                          onChange={(e) =>
                            handlePointChange(
                              index,
                              "unexcusedTardy",
                              e.target.value
                            )
                          }
                          className="w-full border px-2 py-0.5"
                        />
                      </td>
                      <td className="border p-1 text-center">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assessment Block Manager */}
      <div className=" h-1/2 overflow-hidden flex flex-col m-1 ">
        <div className="border border-gray-300 flex flex-col">
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b-1 border-gray-400 mb-1 px-1 mx-1 mt-1 text-gray-700 ">
              <h2 className="text-sm font-semibold mx-1">Assessment Block Manager</h2>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowCreateBlockForm(true)}
                  title="Add new"
                  className="p-1.5 text-gray-600 hover:text-black transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 " />
                </button>


                {selectedRow !== null && (
                  <button
                    className="p-1.5 text-gray-600 hover:text-red-500 transition-colors cursor-pointer"
                    onClick={handleDeleteBlock}
                  >
                    <span className="flex items-center gap-2 ">
                      <Trash2 className="w-3.5 h-3.5 " />
                    </span>
                  </button>
                )}


                <button
                  onClick={moveRowUp}
                  title="Move Up"
                  className="text-gray-600 hover:text-black cursor-pointer p-1.5"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={moveRowDown}
                  title="Move Down"
                  className="text-gray-600 hover:text-black cursor-pointer p-1.5"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>


              </div>
            </div>
            <div className="flex items-center justify-between border-b p-1 bg-gray-100 mx-2">
              {/* Tab Buttons */}
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 text-sm cursor-pointer ${activeTab === "Indirect"
                    ? "bg-white border-t-2 border-blue-400 text-gray-800 font-semibold "
                    : "hover:bg-gray-100"
                    }`}
                  onClick={() => { setActiveTab("Indirect"); setSelectedRow(null); setShowEditBlockManager(false) }}
                >
                  Indirect Performance Points (Master)
                </button>
                <button
                  className={`px-3 py-1 text-sm cursor-pointer ${activeTab === "Direct"
                    ? "bg-white border-t-2 border-blue-400 text-gray-800 font-semibold "
                    : "hover:bg-gray-100"
                    }`}
                  onClick={() => { setActiveTab("Direct"); setSelectedRow(null); setShowEditBlockManager(false) }}
                >
                  <p>Direct Performance Points (Master)</p>
                </button>

              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-2">
            {activeTab === "Direct" && (
              <div className="max-h-60 flex-1 overflow-y-auto border border-gray-200">
                <table className="w-full text-left text-xs mb-7 border-collapse">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="border p-1 w-10 text-center">PP ID</th>
                      <th className="border p-1 text-center">Period Type</th>
                      <th className="border p-1 text-center">Short Description</th>
                      <th className="border p-1 text-center">Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssessmentBlocks.map((block, index) => (
                      <tr className={`hover:bg-gray-50 cursor-pointer ${selectedRow === index ? "bg-gray-200" : ""} `} key={`direct-${block.id}`}
                        onClick={() => handleRowClick(block, index)}>
                        {/* <td className="border flex justify-between p-1 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRow.includes(index)}
                            onChange={() =>{toggleRowSelection(index); setShowEditBlockManager(true); setShowEdit(false)} }
                            className="mr-1"
                          />
                          +{index + 1}
                        </td> */}
                        <td className="border p-1 text-center">{block.ppId}</td>
                        <td className="border p-1">{block.periodType}</td>
                        <td className="border p-1">{block.shortDescription}</td>
                        <td className="border p-1">{block.delivery}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "Indirect" && (
              <div className="max-h-60 flex-1 overflow-y-auto border border-gray-200">
                <table className="w-full text-left text-xs mb-7 border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="border p-1 w-10 text-center">PP ID</th>
                      <th className="border p-1 text-center">Period Type</th>
                      <th className="border p-1 text-center">Short Description</th>
                      <th className="border p-1 text-center">Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssessmentBlocks.map((block, index) => (

                      <tr className={`hover:bg-gray-50  cursor-pointer ${selectedRow === index ? "bg-gray-200" : ""} `}  key={`indirect-${block.id}`} 
                        onClick={() => handleRowClick(block, index)}>

                        <td className="border p-1 text-center">{block.ppId}</td>
                        <td className="border p-1">{block.periodType}</td>
                        <td className="border p-1">{block.shortDescription}</td>
                        <td className="border p-1">{block.delivery}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Lookup Modal */}
      {showSearchLookup && (
        <SearchLookup
          onClose={() => setShowSearchLookup(false)}
          refreshRoster={fetchRosterData}
          existingCandidates={existingCandidates}
          selectedUnit={selectedUnit}
          unitRosterData={unitRosterData}
        />
      )}

    </div>
  );
}
