"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  Search,
  X,
  FolderSync,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import ScoringCriteria from "./ScoringCriteria";
import { useSearchParams } from 'next/navigation';

const MAIN_CRITERIA = [
  "Communication",
  "Intelligence",
  "Responsiveness",
  "Efficiency",
  "Adaptation",
  "Accuracy",
  "Verbal Reasoning",
  "Spatial Reasoning",
  "Numerical Reasoning",
  "Problem Solving",
  "Memory",
  "Data Checking",
  "Work Sampling",
  "Quality of Work",
  "Resourcefulness",
  "Following Instructions",
  "Working in Teams",
  "Working Alone",
  "Initiative",
  "Sick/Injury Avoidance",
];

export default function CompetencyAccounting() {
  const [scoreAdd, setScoreAdd] = useState(false);
  const [scores, setScores] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const handleAddScore = (newScore) => {
    setScores((prev) => [...prev, newScore]);
    setScoreAdd(false);
  };

  const searchParams = useSearchParams();
  const environment = searchParams.get('environment') || 'workspace';
  console.log('Current environment:', environment);
  const [tableData, setTableData] = useState([
    {
      firstName: "John",
      lastName: "Doe",
      cid: "CID001",
      ppId: "PP12345",
      duration: "3 months",
      criticalDate: "2025-09-15",
      taskDeclaration: "Task A",
      workflowStage: "In Progress",
      assessmentType: "Type 1",
      scheduleImpact: "Low",
      engageLevel: "High",
      competency: "Advanced",
      mc: Array.from({ length: 20 }, (_, i) => (i + 1) * 2), // Example MC1-MC20 scores
      cc: Array.from({ length: 20 }, (_, i) => (i + 1) * 3), // Example CC21-CC40 scores
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      cid: "CID002",
      ppId: "PP67890",
      duration: "6 months",
      criticalDate: "2025-10-20",
      taskDeclaration: "Task B",
      workflowStage: "Completed",
      assessmentType: "Type 2",
      scheduleImpact: "Medium",
      engageLevel: "Moderate",
      competency: "Intermediate",
      mc: Array.from({ length: 20 }, () => "-"),
      cc: Array.from({ length: 20 }, () => "-"),
    },
    {
      firstName: "John",
      lastName: "Doe",
      cid: "CID001",
      ppId: "-PP12345",
      duration: "3 months",
      criticalDate: "2025-09-15",
      taskDeclaration: "Task A",
      workflowStage: "In Progress",
      assessmentType: "Type 1",
      scheduleImpact: "Low",
      engageLevel: "High",
      competency: "Advanced",
      mc: Array.from({ length: 20 }, (_, i) => (i + 1) * 2), // Example MC1-MC20 scores
      cc: Array.from({ length: 20 }, (_, i) => (i + 1) * 3), // Example CC21-CC40 scores
    },
  ]);

  const [points, setPoints] = useState(
    Array.from({ length: 2 }, () => ({ x: "", y: "" }))
  );
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("Indirect");

  const handlePointChange = (index, field, value) => {
    const updated = [...points];
    updated[index][field] = value;
    setPoints(updated);
  };

  const handleDeleteCurve = () => {
    if (scores.length > 0) {
      setScores([]);
    } else {
      alert("No scores to delete.");
    }
  };

  if (!visible) return null;

  const moveRowUp = () => {
    if (selectedRow === null || selectedRow <= 0) return;
    setSelectedRow(selectedRow - 1);
  };
  
  const moveRowDown = () => {
    const filteredRowsCount = tableData.filter(row =>
      activeTab === "Indirect"
        ? row.ppId.startsWith("-")
        : !row.ppId.startsWith("-")
    ).length;
  
    if (selectedRow === null || selectedRow >= filteredRowsCount - 1) return;
    setSelectedRow(selectedRow + 1);
  };

  return (
    <>
      {/* Scoring Criteria is only applicable to the 'Workforce' Environment otherwise disable it. */}

      <div className="h-1/2 overflow-hidden border border-gray-300 flex flex-col">
       
        <h2 className="text-md font-bold bg-gray-100 p-0.5  flex items-center border-b border-gray-200">
          <span className="pl-2 text-md text-gray-800">Insert Scores for Competency Accounting</span>
          <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
        </h2>
          
        
          {/* Only hide the scoring criteria section when environment is classroom */}
          {environment !== 'classroom' && (
          <>
            <div className="flex items-center justify-between border-b-1 border-gray-400 mb-1 px-1 mx-1 mt-1 text-gray-700">

              <h2 className="text-sm font-semibold mx-1">Scoring Criteria</h2>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setScoreAdd(true)}
                  title="Create Material"
                  className="text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDeleteCurve}
                  title="Delete Curve"
                  className="text-red-600 hover:text-red-800 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  title="Update"
                  className="text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  <FolderSync className="w-3.5 h-3.5 " />
                </button>

                <button
                  title="Move Up"
                  className="text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5 " />
                </button>

                <button
                  title="Move Down"
                  className="text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5 " />
                </button>

                <button
                  title="Search Curve"
                  className="text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto px-3 ">
              <div className="flex-1  overflow-auto">
                {/* Scoring Criteria Table */}
            
                <table className="w-full mx-auto my-1 text-left text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border-1 border-gray-400 px-2 py-1 font-semibold">
                        ID
                      </th>
                      <th className="border-1 border-gray-400 px-2 py-1 font-semibold">
                        Main Criteria
                      </th>
                      <th className="border-1 border-gray-400 px-2 py-1 font-semibold">
                        ID
                      </th>
                      <th className="border-1 border-gray-400 px-2 py-1 font-semibold">
                        Custom Criteria
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MAIN_CRITERIA.map((criterion, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border-1 border-gray-400 px-2 py-1">
                          {index + 1}
                        </td>
                        <td className="border-1 border-gray-400 px-2 py-1">
                          {criterion}
                        </td>
                        <td className="border-1 border-gray-400 px-2 py-1">
                          {index + 21}
                        </td>
                        <td className="border-1 border-gray-400 px-2 py-1"><input
                          type="text"
                          className="w-full border border-gray-200 focus:outline-gray-200 px-1 py-0.5 text-sm"
                          placeholder="Enter custom criteria"
                        /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              
                </div> 
            </div>
        </>)}
        
      </div>

      <div className="h-1/2   border-t border-gray-800 flex flex-col mt-1">
        <div className="border border-gray-300 flex flex-col">
          {/* Tab Buttons */}
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
                  className={`px-3 py-1 text-sm cursor-pointer ${activeTab === "Indirect"
                    ? "bg-white border-t-2 border-blue-400 text-gray-800 font-semibold "
                    : "hover:bg-gray-100"
                    }`}
                  onClick={() => { setActiveTab("Indirect"); setSelectedRow(null);  }}
                >
                  Indirect Performance Points (Sub)
                </button>
                <button
                  className={`px-3 py-1 text-sm cursor-pointer ${activeTab === "Direct"
                    ? "bg-white border-t-2 border-blue-400 text-gray-800 font-semibold "
                    : "hover:bg-gray-100"
                    }`}
                  onClick={() => { setActiveTab("Direct"); setSelectedRow(null);  }}
                >
                  <p>Direct Performance Points (Sub)</p>
                </button>

              </div>

              {/* Right side: Plus button */}
              <div className="mr-1">
                <button
                  
                  title="Add new"
                  className="p-1.5 text-gray-600 hover:text-black transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 " />
                </button>


                {selectedRow && (
                  <button
                    className="p-1.5 text-gray-600 hover:text-red-500 transition-colors cursor-pointer"
                    onClick={() => {
                      // handleDelete(contextMenu.selectedUnit.id);
                      // setContextMenu((prev) => ({ ...prev, visible: false }));
                      handleBlockManagerDeleteCurve();
                    }}
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
          </div>
        
          <div className=" flex flex-col h-full">
            {/* bottom table */}
            <div className="overflow-x-auto px-3 py-2">
              <table className="w-full h-full text-left text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">First Name</th>
                    <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Last Name</th>
                    <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">CID</th>
                    <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">PP ID</th>
                    <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Duration</th>
                    <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Critical Reference Date</th>
                    <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Task Declaration</th>
                    <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Workflow Stage</th>
                    <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Assessment Type</th>
                    <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Schedule Impact</th>
                    <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Engage Level</th>
                    <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Competency</th>

                    {/* Only show MC and CC columns for Indirect tab */}
                    {activeTab === "Indirect" && (
                      <>
                        {/* MC1 - MC20 */}
                        {Array.from({ length: 20 }, (_, i) => (
                          <th
                            key={`mc-${i}`}
                            className="border-1 border-gray-400 px-2 py-1"
                          >{`MC${i + 1}`}</th>
                        ))}

                        {/* CC21 - CC40 */}
                        {Array.from({ length: 20 }, (_, i) => (
                          <th
                            key={`cc-${i + 21}`}
                            className="border-1 border-gray-400 px-2 py-1"
                          >{`CC${i + 21}`}</th>
                        ))}
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {tableData.length > 0 ? (
                    tableData
                      .filter((row) =>
                        activeTab === "Indirect"
                          ? row.ppId.startsWith("-")
                          : !row.ppId.startsWith("-")
                      )
                      .map((row, rowIndex) => (
                        <tr 
                          key={rowIndex}
                          onClick={() => setSelectedRow(rowIndex)}
                          className={`cursor-pointer hover:bg-gray-100 ${
                            selectedRow === rowIndex ? "bg-gray-200" : ""
                          }`}
                        >
                          <td className="border-1 border-gray-400 px-2 py-1">{row.firstName}</td>
                          <td className="border-1 border-gray-400 px-2 py-1">{row.lastName}</td>
                          <td className="border-1 border-gray-400 px-2 py-1">{row.cid}</td>
                          <td className="border-1 border-gray-400 px-2 py-1">{row.ppId}</td>
                          <td className="border-1 border-gray-400 px-2 py-1">{row.duration}</td>
                          <td className="border-1 border-gray-400 px-2 py-1">{row.criticalDate}</td>
                          <td className="border-1 border-gray-400 px-2 py-1">{row.taskDeclaration}</td>
                          <td className="border-1 border-gray-400 px-2 py-1">{row.workflowStage}</td>
                          <td className="border-1 border-gray-400 px-2 py-1">{row.assessmentType}</td>
                          <td className="border-1 border-gray-400 px-2 py-1">{row.scheduleImpact}</td>
                          <td className="border-1 border-gray-400 px-2 py-1">{row.engageLevel}</td>
                          <td className="border-1 border-gray-400 px-2 py-1">{row.competency}</td>

                          {/* Only show MC and CC data for Indirect tab */}
                          {activeTab === "Indirect" && (
                            <>
                              {row.mc.map((val, i) => (
                                <td
                                  key={`mc-${i}`}
                                  className="border-1 border-gray-400 px-2 py-1"
                                >
                                  {val}
                                </td>
                              ))}
                              {row.cc.map((val, i) => (
                                <td
                                  key={`cc-${i}`}
                                  className="border-1 border-gray-400 px-2 py-1"
                                >
                                  {val}
                                </td>
                              ))}
                            </>
                          )}
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td className="border-1 border-gray-400 px-2 py-1 text-center" colSpan={activeTab === "Indirect" ? 61 : 21}>
                        No data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {scoreAdd && (
        <div className="overflow-auto my-2">
          <ScoringCriteria onClose={() => setScoreAdd(false)} />
        </div>
      )}
    </>
  );
}
