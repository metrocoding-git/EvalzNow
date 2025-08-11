"use client";

import React, { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import SearchLookup from "./LookUpTable";
import CreateBlockManagerForm from "./CreateBlockManagerForm";

const PERIOD_TYPES = [
  "Audit/Survey",
  "Blended - Instructor",
  "Blended - Platform",
  "Camp",
  "Case Study",
  "Certification",
  "Coaching",
  "Conditioning",
  "Exam/Test",
  "Experimental",
  "External Eval",
  "Flex",
  "Flipped",
  "Homework",
  "Immersion",
  "Intern/Co-Op",
  "Internal Eval",
  "Lab",
  "LMS - Distance",
  "Online - Distance",
  "Other",
  "Placement",
  "Probationary",
  "Promotion",
  "Pull-Out",
  "Push-In",
  "Reassigned Work",
  "Research/R&D",
  "Reskilling/CPD/CMP",
  "Rework",
  "Rotation",
  "Scaffolding",
  "Seminar",
  "Study Abroad",
  "Summer Program",
  "Training for Trainees",
  "Training for Trainers",
  "Work",
  "Workshop",
  "Work-Study",
];

const INDIRECT_DELIVERY = [
  "After Unit Operations (MISC)",
  "Before Unit Operations (MISC)",
  "Sensitivity or Exploratory Checking",
  "Pre-Employment",
];

const DIRECT_DELIVERY = [
  "During Unit Operations (on-site)",
  "During Unit Operations (practice)",
  "During Unit Operations (remote)",
  "During Unit Operations (training)",
];

export default function UnitRoster({ activeTab, setActiveTab, setShowEditBlockManager, setShowEdit }) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [showSearchLookup, setShowSearchLookup] = useState(false);
  const [selectedEntitiyRows, setSelectedEntityRows] = useState([]); 

  const [showCreateBlockForm, setShowCreateBlockForm] = useState(false);

  const [points, setPoints] = useState(
    Array.from({ length: 20 }, () => ({ x: "", y: "" }))
  );
  const [visible, setVisible] = useState(true);

  const handlePointChange = (index, field, value) => {
    const updated = [...points];
    updated[index][field] = value;
    setPoints(updated);
  };


  const toggleRowSelection = (index) => {
    // setSelectedRow((prev) =>
    //   prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    // );
    setSelectedRow(index)
  };

  const handleDeleteCurve = () => {
    // const updated = points.filter((_, index) => !selectedRow.includes(index));
    // setPoints(updated);
    setSelectedRow(null); // reset selection
  };

  const moveRowUp = () => {
    // if (selectedRow.length !== 1) return;

    // if (index === 0) return;

    const updated = [...points];
    // [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    // setPoints(updated);
    setSelectedRow(selectedRow - 1);
  };

  const moveRowDown = () => {
    // if (selectedRow.length !== 1) return;
    // if (index === points.length - 1) return;

    const updated = [...points];
    // [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    // setPoints(updated);
    console.log("11", selectedRow)
    setSelectedRow(selectedRow + 1);
    console.log("22", selectedRow)

  };

  const handleCandidateSelect = (candidate) => {
    console.log("Selected candidate:", candidate);
    // Here, handle the selected candidate:
    // - Add them to the roster
    // - Fill in the form fields
    // - Store the selection for further processing
    setShowSearchLookup(false);
  };

  const toggleRowSelectionMulti = (index) => {
    setSelectedEntityRows((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };
  

  if (!visible) return null;

  return (
    <div className="flex flex-col h-[80vh]">
      {/* Unit Config */}
      <div className="h-1/2 overflow-hidden border border-gray-300 flex flex-col">
        <h2 className="text-md font-bold bg-gray-100 p-0.5  flex items-center border-b border-gray-200">
          <span className="pl-2 text-md text-gray-800">Unit Config</span>
          <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
        </h2>

        <div className="flex items-center justify-between border-b-1 border-gray-400 mb-1 px-1 mx-1 mt-1 text-gray-700 ">
          <h2 className="text-sm font-semibold mx-1">Unit Roster</h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearchLookup(true)}
              title="Search Candidates"
              className="text-gray-600 hover:text-black cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={handleDeleteCurve}
              title="Delete Selected Row(s)"
              className="text-gray-600 hover:text-red-600 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={moveRowUp}
              title="Move Up"
              className="text-gray-600 hover:text-black cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
            </button>

            <button
              onClick={moveRowDown}
              title="Move Down"
              className="text-gray-600 hover:text-black cursor-pointer"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold my-1 mx-3">Entities</h4>
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
                {points.map((point, index) => {
                  const present = parseInt(point.present || 0);
                  const excusedAbs = parseInt(point.excusedAbs || 0);
                  const unexcusedAbs = parseInt(point.unexcusedAbs || 0);
                  const excusedTardy = parseInt(point.excusedTardy || 0);
                  const unexcusedTardy = parseInt(point.unexcusedTardy || 0);

                  const total =
                    present +
                    excusedAbs +
                    unexcusedAbs +
                    excusedTardy +
                    unexcusedTardy;
                  
                  const isSelected = selectedEntitiyRows.includes(index);
                  return (
                    <tr key={index} onClick={() => toggleRowSelectionMulti(index)} 
                      className={`cursor-pointer ${isSelected ? "bg-gray-200" : ""}`}>
                      <td className="border  text-center">{index + 1}</td>
                      <td className="border ">
                        <span className="block px-2 py-0.5 text-sm text-gray-800">
                          {point.lastName || "last name"}
                        </span>
                      </td>
                      <td className="border p-1">
                        <span className="block px-2 py-0.5 text-sm text-gray-800">
                          {point.firstName || "first name"}
                        </span>
                      </td>
                      <td className="border p-1">
                        <span className="block px-2 py-0.5 text-sm text-gray-800">
                          {point.candidateID || "candidate ID"}
                        </span>
                      </td>
                      <td className="border p-1">
                        <select className="w-full border px-2 py-0.5">
                          <option>Ongoing</option>
                          <option>Pass</option>
                          <option>Fail</option>
                        </select>
                      </td>
                      <td className="border p-1">
                        <input
                          type="number"
                          min="0"
                          value={point.present || ""}
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
                          value={point.excusedAbs || ""}
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
                          value={point.unexcusedAbs || ""}
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
                          value={point.excusedTardy || ""}
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
                          value={point.unexcusedTardy || ""}
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
      <div className=" h-1/2 overflow-hidden  border-t border-gray-800 flex flex-col mt-1">
        <div className="border border-gray-300 flex flex-col">
          <div className="flex flex-col">
            <div>
              <h2 className="text-md font-semibold bg-gray-100 p-0.5 pl-2 flex items-center border-b border-gray-200">
                Assessment Block Manager
                <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
              </h2>
            </div>


            <div className="flex items-center justify-between border-b p-1 bg-gray-100">
              {/* Tab Buttons */}
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 text-sm ${activeTab === "Indirect"
                    ? "bg-white border-t-2 border-blue-400 text-gray-800 font-semibold"
                    : "hover:bg-gray-100"
                    }`}
                  onClick={() => {setActiveTab("Indirect"); setSelectedRow(-0)}}
                >
                  Indirect Performance Points (Master)
                </button>
                <button
                  className={`px-3 py-1 text-sm ${activeTab === "Direct"
                    ? "bg-white border-t-2 border-blue-400 text-gray-800 font-semibold"
                    : "hover:bg-gray-100"
                    }`}
                  onClick={() => {setActiveTab("Direct"); setSelectedRow(+0)}}
                >
                  <p>Direct Performance Points (Master)</p>
                </button>

              </div>

              {/* Right side: Plus button */}
              <div className="mr-1">
                <button
                  onClick={() => setShowCreateBlockForm(true)}
                  title="Add new"
                  className="inline-flex items-center px-1.5 py-1.5 text-xs font-medium text-white bg-gray-200 hover:bg-gray-400 transition-colors rounded"
                >
                  <Plus className="w-3.5 h-3.5 text-black" />
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-2">
            {activeTab === "Direct" && (
              <div className="max-h-60 overflow-auto border border-gray-200">
                <table className="w-full text-left text-xs mb-7">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-1 w-10 text-center">PP ID</th>
                      <th className="border p-1 text-center">Period Type</th>
                      <th className="border p-1 text-center">Short Description</th>
                      <th className="border p-1 text-center">Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((_, index) => (
                      <tr className={`hover:bg-gray-50 cursor-pointer ${selectedRow === +index && 'bg-gray-100'} `} key={`direct-${index}`} onClick={() => { toggleRowSelection(+index); setShowEditBlockManager(true); setShowEdit(false) }}>
                        {/* <td className="border flex justify-between p-1 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRow.includes(index)}
                            onChange={() =>{toggleRowSelection(index); setShowEditBlockManager(true); setShowEdit(false)} }
                            className="mr-1"
                          />
                          +{index + 1}
                        </td> */}
                        <td className="border flex justify-between p-1 text-center">

                          +{index + 1}
                        </td>

                        <td className="border p-1">
                          {/* <select className="w-full border px-2 py-0.5">
                            {PERIOD_TYPES.map((type, i) => (
                              <option key={`direct-period-${i}`}>{type}</option>
                            ))}
                          </select> */}
                          Blended - Instructor
                        </td>
                        <td className="border p-1">
                          {/* <input
                            type="text"
                            maxLength={50}
                            placeholder="Short Description"
                            className="w-full border px-2 py-0.5"
                          /> */}
                          Sample Short Description
                        </td>
                        <td className="border p-1">
                          {/* <select className="w-full border px-2 py-0.5">
                            {DIRECT_DELIVERY.map((d, i) => (
                              <option key={`direct-delivery-${i}`}>{d}</option>
                            ))}
                          </select> */}
                          During Unit Operations (practice)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "Indirect" && (
              <div className="max-h-60 overflow-auto border border-gray-200">
                <table className="w-full text-left text-xs mb-7">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-1 w-10 text-center">PP ID</th>
                      <th className="border p-1 text-center">Period Type</th>
                      <th className="border p-1 text-center">Short Description</th>
                      <th className="border p-1 text-center">Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((_, index) => (

                      <tr className={`hover:bg-gray-50  cursor-pointer ${selectedRow === -index && 'bg-gray-100'} `} key={`indirect-${index}`} onClick={() => { toggleRowSelection(-index); setShowEditBlockManager(true); setShowEdit(false) }}>

                        <td className="border flex justify-between p-1 ">
                          {/* <input
                            type="checkbox"
                            checked={selectedRow.includes(index)}
                            onChange={() => toggleRowSelection(index)}
                            className="mr-1"
                          /> */}
                          -{index + 1}
                        </td>

                        <td className="border p-1">
                          {/* <select className="w-full border px-2 py-0.5">
                            {PERIOD_TYPES.map((type, i) => (
                              <option key={`indirect-period-${i}`}>
                                {type}
                              </option>
                            ))}
                          </select> */}
                          Blended - Instructor
                        </td>
                        <td className="border p-1">
                          {/* <input
                            type="text"
                            maxLength={50}
                            placeholder="Short Description"
                            className="w-full border px-2 py-0.5"
                          /> */}
                          Sample Description
                        </td>
                        <td className="border p-1">
                          {/* <select className="w-full border px-2 py-0.5">
                            {INDIRECT_DELIVERY.map((d, i) => (
                              <option key={`indirect-delivery-${i}`}>
                                {d}
                              </option>
                            ))}
                          </select> */}
                          Before Unit Operations (MISC)
                        </td>
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
          onSelect={handleCandidateSelect}
        />
      )}

    {showCreateBlockForm && (
      <div className="w-1/2 lg:w-9/12 bg-white mb-2">
        <div className="h-full flex flex-col w-96">
          <CreateBlockManagerForm
            onClose={() => setShowCreateBlockForm(false)}
            activeTab={activeTab}
          />
        </div>
      </div>
    )}

    
    </div>
  );
}
