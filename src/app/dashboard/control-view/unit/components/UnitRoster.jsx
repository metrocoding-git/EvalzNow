"use client";

import React, { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import SearchLookup from "./LookUpTable";

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

export default function UnitRoster() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [showSearchLookup, setShowSearchLookup] = useState(false);

  const [points, setPoints] = useState(
    Array.from({ length: 20 }, () => ({ x: "", y: "" }))
  );
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("Direct");

  const handlePointChange = (index, field, value) => {
    const updated = [...points];
    updated[index][field] = value;
    setPoints(updated);
  };

  const toggleRowSelection = (index) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleDeleteCurve = () => {
    const updated = points.filter((_, index) => !selectedRows.includes(index));
    setPoints(updated);
    setSelectedRows([]); // reset selection
  };

  const moveRowUp = () => {
    if (selectedRows.length !== 1) return;
    const index = selectedRows[0];
    if (index === 0) return;

    const updated = [...points];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setPoints(updated);
    setSelectedRows([index - 1]);
  };

  const moveRowDown = () => {
    if (selectedRows.length !== 1) return;
    const index = selectedRows[0];
    if (index === points.length - 1) return;

    const updated = [...points];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    setPoints(updated);
    setSelectedRows([index + 1]);
  };

  const handleCandidateSelect = (candidate) => {
    console.log("Selected candidate:", candidate);
    // Here, handle the selected candidate:
    // - Add them to the roster
    // - Fill in the form fields
    // - Store the selection for further processing
    setShowSearchLookup(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="flex-grow h-1/2 border border-gray-300 flex flex-col ">
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

                  return (
                    <tr key={index}>
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

      <div className="h-1/2 my-2">
        <div className="border border-gray-300 flex flex-col">
          <div className="flex flex-col">
            <div>
              <h2 className="text-md font-semibold bg-gray-100 p-0.5 pl-2 flex items-center border-b border-gray-200">
                Assessment Block Manager
                <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
              </h2>
            </div>
            {/* Tab Buttons */}
            <div className="flex space-x-2 border-b p-1 bg-gray-50">
              <button
                className={`px-3 py-1 text-sm ${
                  activeTab === "Indirect"
                    ? "bg-gray-200 text-gray-800 font-semibold"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("Indirect")}
              >
                Indirect Performance Points (Master)
              </button>
              <button
                className={`px-3 py-1 text-sm ${
                  activeTab === "Direct"
                    ? "bg-gray-200 text-gray-800 font-semibold"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("Direct")}
              >
                <p>Direct Performance Points (Master)</p>
              </button>
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
                      <th className="border p-1">Period Type</th>
                      <th className="border p-1">Short Description</th>
                      <th className="border p-1">Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((_, index) => (
                      <tr key={`direct-${index}`}>
                        <td className="border flex justify-between p-1 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(index)}
                            onChange={() => toggleRowSelection(index)}
                            className="mr-1"
                          />
                          +{index + 1}
                        </td>

                        <td className="border p-1">
                          <select className="w-full border px-2 py-0.5">
                            {PERIOD_TYPES.map((type, i) => (
                              <option key={`direct-period-${i}`}>{type}</option>
                            ))}
                          </select>
                        </td>
                        <td className="border p-1">
                          <input
                            type="text"
                            maxLength={50}
                            placeholder="Short Description"
                            className="w-full border px-2 py-0.5"
                          />
                        </td>
                        <td className="border p-1">
                          <select className="w-full border px-2 py-0.5">
                            {DIRECT_DELIVERY.map((d, i) => (
                              <option key={`direct-delivery-${i}`}>{d}</option>
                            ))}
                          </select>
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
                      <th className="border p-1">Period Type</th>
                      <th className="border p-1">Short Description</th>
                      <th className="border p-1">Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((_, index) => (
                      <tr key={`indirect-${index}`}>
                        <td className="border flex justify-between p-1 ">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(index)}
                            onChange={() => toggleRowSelection(index)}
                            className="mr-1"
                          />
                          -{index + 1}
                        </td>

                        <td className="border p-1">
                          <select className="w-full border px-2 py-0.5">
                            {PERIOD_TYPES.map((type, i) => (
                              <option key={`indirect-period-${i}`}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="border p-1">
                          <input
                            type="text"
                            maxLength={50}
                            placeholder="Short Description"
                            className="w-full border px-2 py-0.5"
                          />
                        </td>
                        <td className="border p-1">
                          <select className="w-full border px-2 py-0.5">
                            {INDIRECT_DELIVERY.map((d, i) => (
                              <option key={`indirect-delivery-${i}`}>
                                {d}
                              </option>
                            ))}
                          </select>
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
    </>
  );
}
