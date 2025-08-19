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

export default function CompetencyAccounting({ selectedRow, setSelectedRow, activeTab, setActiveTab, scoreAdd, setScoreAdd }) {

  const [scores, setScores] = useState([]);

  const handleAddScore = (newScore) => {
    setScores((prev) => [...prev, newScore]);
    setScoreAdd(false);
  };

  const searchParams = useSearchParams();
  const environment = searchParams.get('environment') || 'workspace';
  const [tableData, setTableData] = useState([
    {
      firstName: "John",
      lastName: "Doe",
      cid: "CID001",
      ppId: "1",
      duration: "14",
      criticalDate: "2025-09-15",
      taskDeclaration: "Task A",
      workflowStage: "In Progress",
      assessmentType: "Type 1",
      scheduleImpact: "Low",
      engageLevel: "High",
      competency: "Advanced",
      AttainedScore: "20",
      MaximumScore: "10"
    },
    {
      firstName: "2John",
      lastName: "2Doe22",
      cid: "CID002",
      ppId: "2",
      duration: "3",
      criticalDate: "2025-09-15",
      taskDeclaration: "Task A",
      workflowStage: "In Progress",
      assessmentType: "Type 1",
      scheduleImpact: "Low",
      engageLevel: "High",
      competency: "Advanced",
      AttainedScore: "30",
      MaximumScore: "50"
    },

    {
      firstName: "5Jane",
      lastName: "3Smith",
      cid: "CID005",
      ppId: "3",
      duration: "6",
      criticalDate: "2025-10-20",
      taskDeclaration: "Task B",
      workflowStage: "Completed",
      assessmentType: "Type 2",
      scheduleImpact: "Medium",
      engageLevel: "Moderate",
      competency: "Intermediate",
      AttainedScore: "20",
      MaximumScore: "10"
    },
    {
      firstName: "John",
      lastName: "Doe",
      cid: "CID001",
      ppId: "-1",
      duration: "3",
      criticalDate: "2025-09-15",
      taskDeclaration: "Task A",
      workflowStage: "In Progress",
      assessmentType: "Type 1",
      scheduleImpact: "Low",
      engageLevel: "High",
      competency: "Advanced",
      AttainedScore: "20",
      MaximumScore: "10"
    },
    {
      firstName: "John",
      lastName: "Doe",
      cid: "CID001",
      ppId: "-2",
      duration: "12",
      criticalDate: "2025-09-15",
      taskDeclaration: "Task A",
      workflowStage: "In Progress",
      assessmentType: "Type 1",
      scheduleImpact: "Low",
      engageLevel: "High",
      competency: "Advanced",
      AttainedScore: "200",
      MaximumScore: "500"
    },
  ]);

  const [workspaceTableData, setWorkspaceTableData] = useState([
    {
      firstName: "John",
      lastName: "Doe",
      cid: "CID001",
      ppId: "1",
      duration: "3",
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
      firstName: "2John",
      lastName: "2Doe22",
      cid: "CID002",
      ppId: "2",
      duration: "3",
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
      firstName: "5Jane",
      lastName: "3Smith",
      cid: "CID005",
      ppId: "3",
      duration: "6",
      criticalDate: "2025-10-20",
      taskDeclaration: "Task B",
      workflowStage: "Completed",
      assessmentType: "Type 2",
      scheduleImpact: "Medium",
      engageLevel: "Moderate",
      competency: "Intermediate",
      mc: Array.from({ length: 20 }, (_, i) => (i + 1) * 5), // Example MC1-MC20 scores
      cc: Array.from({ length: 20 }, (_, i) => (i + 1) * 2), // Example CC21-CC40 scores
    },
    {
      firstName: "John",
      lastName: "Doe",
      cid: "CID001",
      ppId: "-1",
      duration: "15",
      criticalDate: "2025-09-15",
      taskDeclaration: "Task A",
      workflowStage: "In Progress",
      assessmentType: "Type 1",
      scheduleImpact: "Low",
      engageLevel: "High",
      competency: "Advanced",
      mc: Array.from({ length: 20 }, (_, i) => (i + 1) * 3), // Example MC1-MC20 scores
      cc: Array.from({ length: 20 }, (_, i) => (i + 1) * 1), // Example CC21-CC40 scores
    },
    {
      firstName: "John",
      lastName: "Doe",
      cid: "CID001",
      ppId: "-2",
      duration: "14",
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
      <h2 className="text-md font-bold bg-gray-100 p-0.5  flex items-center border-b border-gray-200">
        <span className="pl-2 text-md text-gray-800">Insert Scores for Competency Accounting</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
      </h2>

      {/* Scoring Criteria is only applicable to the 'Workforce' Environment otherwise disable it. */}
      {environment !== 'classroom' && (
        <div className="h-1/2 overflow-hidden border border-gray-300 m-1 flex flex-col">
          {/* Only hide the scoring criteria section when environment is classroom */}
          <div className="flex items-center justify-between border-b-1 border-gray-400 mb-1 px-1 mx-1 mt-1 text-gray-700">

            <h2 className="text-sm font-semibold mx-1">Scoring Criteria</h2>

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
        </div>
      )}

      <div className={` ${environment === 'classroom' ? ' h-full' : 'h-1/2'} border border-gray-300 flex flex-col m-1`}>
        <div className=" flex flex-col h-full p-1">
          {/* Tab Buttons */}
          <div className="flex flex-col">

            <div className="flex items-center justify-between border-b p-1 bg-gray-100">
              {/* Tab Buttons */}
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 text-sm cursor-pointer ${activeTab === "Indirect"
                    ? "bg-white border-t-2 border-blue-400 text-gray-800 font-semibold "
                    : "hover:bg-gray-100"
                    }`}
                  onClick={() => { setActiveTab("Indirect"); setSelectedRow(null); }}
                >
                  Indirect Performance Point (Sub)

                </button>
                <button
                  className={`px-3 py-1 text-sm cursor-pointer ${activeTab === "Direct"
                    ? "bg-white border-t-2 border-blue-400 text-gray-800 font-semibold "
                    : "hover:bg-gray-100"
                    }`}
                  onClick={() => { setActiveTab("Direct"); setSelectedRow(null); }}
                >
                  Direct Performance Point (Sub)
                </button>

              </div>

              {/* Right side: Plus button */}
              <div className="mr-1">
                <button
                  onClick={() => setScoreAdd(true)}
                  title="Create Material"
                  className="p-1 text-gray-600 hover:text-black transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>


                {selectedRow && (
                  <button
                    className="p-1 text-gray-600 hover:text-red-500 transition-colors cursor-pointer"
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
                  className="text-gray-600 hover:text-black cursor-pointer p-1"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={moveRowDown}
                  title="Move Down"
                  className="text-gray-600 hover:text-black cursor-pointer p-1"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

          <div className="flex-1 p-2">
            {/* bottom table */}
            {environment == 'workspace' && (
              <>
                {activeTab === "Direct" && (
                  <div className="h-full overflow-auto border border-gray-200">
                    <table className="w-full text-left text-xs mb-7">
                      <thead className="bg-gray-100">
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

                        </tr>
                      </thead>
                      <tbody>
                        {workspaceTableData.length > 0 ? (
                          workspaceTableData
                            .filter((row) =>
                              activeTab === "Indirect"
                                ? row.ppId.startsWith("-")
                                : !row.ppId.startsWith("-")
                            )
                            .map((row, rowIndex) => (
                              <tr
                                key={rowIndex}
                                onClick={() => setSelectedRow(rowIndex + 1)}
                                className={`cursor-pointer hover:bg-gray-100 ${selectedRow === rowIndex + 1 ? "bg-gray-200" : ""
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
                              </tr>
                            ))
                        ) : (
                          <tr>

                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === "Indirect" && (
                  <div className="h-full overflow-auto border border-gray-200">
                    <table className="w-full text-left text-xs mb-7">
                      <thead className="bg-gray-50">
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

                        </tr>
                      </thead>
                      <tbody>
                        {workspaceTableData.length > 0 ? (
                          workspaceTableData
                            .filter((row) =>
                              activeTab === "Indirect"
                                ? row.ppId.startsWith("-")
                                : !row.ppId.startsWith("-")
                            )
                            .map((row, rowIndex) => (
                              <tr
                                key={rowIndex}
                                onClick={() => setSelectedRow(rowIndex + 1)}
                                className={`cursor-pointer hover:bg-gray-100 ${selectedRow === rowIndex + 1 ? "bg-gray-200" : ""
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
                              </tr>
                            ))
                        ) : (
                          <tr>

                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
            {environment == 'classroom' && (
              <>
                {activeTab === "Direct" && (
                  <div className="h-full overflow-auto border border-gray-200">
                    <table className="w-full text-left text-xs mb-7">
                      <thead className="bg-gray-100">
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
                          <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Attained Score</th>
                          <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Maximum Score</th>
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
                                onClick={() => setSelectedRow(rowIndex + 1)}
                                className={`cursor-pointer hover:bg-gray-100 ${selectedRow === rowIndex + 1 ? "bg-gray-200" : ""
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
                                <td className="border-1 border-gray-400 px-2 py-1">{row.AttainedScore}</td>
                                <td className="border-1 border-gray-400 px-2 py-1">{row.MaximumScore}</td>
                              </tr>
                            ))
                        ) : (
                          <tr>

                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === "Indirect" && (
                  <div className="h-full overflow-auto border border-gray-200">
                    <table className="w-full text-left text-xs mb-7">
                      <thead className="bg-gray-50">
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
                          <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Attained Score</th>
                          <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Maximum Score</th>
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
                                onClick={() => setSelectedRow(rowIndex + 1)}
                                className={`cursor-pointer hover:bg-gray-100 ${selectedRow === rowIndex + 1 ? "bg-gray-200" : ""
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
                                <td className="border-1 border-gray-400 px-2 py-1">{row.AttainedScore}</td>
                                <td className="border-1 border-gray-400 px-2 py-1">{row.MaximumScore}</td>
                              </tr>
                            ))
                        ) : (
                          <tr>

                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>

      {/* {scoreAdd && (
        <div className="overflow-auto my-2">
          <ScoringCriteria onClose={() => setScoreAdd(false)} />
        </div>
      )} */}
    </>
  );
}
