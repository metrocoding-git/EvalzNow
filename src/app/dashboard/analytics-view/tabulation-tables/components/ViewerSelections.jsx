'use client';
import React, { useEffect, useRef, useState } from 'react';
import ScoringCriteria from './ScoringCriteria';
import { FolderOutput, RefreshCw } from 'lucide-react';
import PropertyEditor from '../../components/PropertyEditor';


export default function ViewerSelections({candidate}) {
  const [openCandidate, setOpenCandidate] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleGroup = (index) => {
    setOpenCandidate((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const [chartProperties, setChartProperties] = useState({
  // Standard
  visibility: true,
  layer: 1,
  reference: false,

  // Curve Label
  showLabel: false,
  labelType: "X Type",
  showLabelPrefix: false,
  labelPrefix: "X File name",
  showLabelSuffix: false,
  labelSuffix: "Y subcase",

  // Line Attribute
  lineStyle: "solid",
  lineColor: "#3b82f6",
  lineThickness: 2,

  // Symbol Attribute
  symbolStyle: "circle",
  symbolColor: "#3b82f6",
  symbolFrequency: 1,
  symbolScaleSize: 1,

  // Shade area
  shadeArea: "#ffffff",
});


  const [ScoreAdd, setScoreAdd] = useState(false);

  const [visible, setVisible] = useState(true);
  const [activeAdjustPropertieTab, setActiveAdjustPropertieTab] = useState('Table');

  console.log(candidate);
  const data = [
    { id: 1, firstName: "John", lastName: "Doe", candidateStartDate: "2022-01-01", unitStartDate: "2022-01-01" },
    { id: 2, firstName: "Jane", lastName: "Smith", candidateStartDate: "2022-01-01", unitStartDate: "2022-01-01" },
  ]


  const workspaceTableData = [
    {
      ppId: "PP-001",
      criticalDate: "2025-08-01",
      dayCount: 12,
      productivityCSD: 95,
      productivityUSD: 88,
      rrn: 10,
      prn: 8,
      arn: 6,
      xlr: 4,
      xrr: 5,
      xsr: 7,
      xwr: 9,
      xtr: 6,
      xpr: 8,
      xrvsr: 3,
      xpvsr: 4,
      xavsr: 2,
      xep: 6,
      xcp: 7,
      xbp: 5,
      msip: "Yes",
      stap: "STA1",
      ic: "IC1",
      deltaRrn: 1,
      deltaPrn: -1,
      deltaArn: 0,
      geq: "Pass",
      stag: "G1",
      rrgt1: 2,
      prgt1: 3,
      argt1: 1,
      rrgt2: 4,
      prgt2: 2,
      argt2: 3,
      rrgt3: 1,
      prgt3: 2,
      argt3: 2,
      rrgt4: 0,
      prgt4: 1,
      argt4: 0,
      rrgt5: 1,
      prgt5: 1,
      argt5: 1
    },
    {
      ppId: "PP-002",
      criticalDate: "2025-08-02",
      dayCount: 8,
      productivityCSD: 85,
      productivityUSD: 80,
      rrn: 8,
      prn: 7,
      arn: 5,
      xlr: 3,
      xrr: 4,
      xsr: 5,
      xwr: 6,
      xtr: 5,
      xpr: 6,
      xrvsr: 2,
      xpvsr: 3,
      xavsr: 1,
      xep: 4,
      xcp: 5,
      xbp: 4,
      msip: "No",
      stap: "STA2",
      ic: "IC2",
      deltaRrn: 0,
      deltaPrn: 1,
      deltaArn: -1,
      geq: "Fail",
      stag: "G2",
      rrgt1: 1,
      prgt1: 2,
      argt1: 1,
      rrgt2: 2,
      prgt2: 1,
      argt2: 2,
      rrgt3: 0,
      prgt3: 1,
      argt3: 1,
      rrgt4: 1,
      prgt4: 0,
      argt4: 1,
      rrgt5: 0,
      prgt5: 0,
      argt5: 0
    }];

  if (!visible) return null;

  return (
    <>
      <h2 className="text-md font-bold bg-gray-100 p-0.5  flex items-center ">
        <span className="pl-2 text-md text-gray-800">Viewers</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
      </h2>
      <div className="flex h-full w-full my-2 mx-1">
        <div className='w-full flex flex-col border-1 h-full border-gray-200  p-1'>
          <div className="flex items-center justify-between  mb-3 px-1 mx-1 mt-1 text-gray-700 ">
            <h2 className="text-sm font-semibold mx-1">Candidate Display</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => {}} title="Create Material" className='text-blue-600 hover:text-blue-800 cursor-pointer'>
                <RefreshCw className="w-4 h-4 hover:text-green-600" onClick={() => setScoreAdd(true)} />
              </button>
              <button title="Delete Curve" className='text-red-600 hover:text-red-800 cursor-pointer'>
                <FolderOutput className="w-4 h-4 hover:text-blue-600" />
              </button>

            </div>
          </div>

          <div className=" h-full overflow-hidden w-full my-1">
            <div className="h-1/2 flex flex-col border border-gray-200">
              <div className="flex-1 overflow-auto p-1">
                {candidate && (
                  <div className="px-3 py-1">
                    {/* Always show candidate details */}
                    <div className="items-center justify-center px-4">
                      <div className="p-1 rounded-lg mt-1 space-y-1">
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>First Name:</span>
                          <span>{candidate.firstName}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Last Name:</span>
                          <span>{candidate.lastName}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>ID:</span>
                          <span>{candidate.id}</span>
                        </div>
                        {candidate.candidateStartDate && (
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>Candidate Start Date:</span>
                            <span>{candidate.candidateStartDate}</span>
                          </div>
                        )}
                        {candidate.unitStartDate && (
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>Unit Start Date:</span>
                            <span>{candidate.unitStartDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>

            <div className="h-1/2 flex flex-col border border-gray-200">
              <h2 className="text-sm font-semibold mx-1 p-2 text-gray-600">Candidate </h2>
              {/* <div className="flex space-x-2 border-b p-2">
                <button
                  className={`px-3 py-1 text-sm rounded-t cursor-pointer ${activeAdjustPropertieTab === 'Property editor'
                    ? 'bg-blue-100 text-blue-600 font-semibold'
                    : 'hover:bg-gray-100'
                    }`}
                  onClick={() => setActiveAdjustPropertieTab('Property editor')}
                >
                  Property editor
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-t cursor-pointer ${activeAdjustPropertieTab === 'Table'
                    ? 'bg-blue-100 text-blue-600 font-semibold'
                    : 'hover:bg-gray-100'
                    }`}
                  onClick={() => setActiveAdjustPropertieTab('Table')}
                >
                  Table
                </button>
              </div> */}

              {/* Tab Content */}
              <div className="flex-1 overflow-auto p-2 h-full">
                {/* {activeAdjustPropertieTab === 'Property editor' && (
                  <PropertyEditor
                    properties={chartProperties}
                    onChange={setChartProperties}
                  />
                )}

                {activeAdjustPropertieTab === 'Table' && ( */}

                  <div className="text-sm text-gray-800 w-full overflow-auto">

                    {/* table */}
                    <table className="w-full text-left text-xs mb-7">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.entries({
                            'PP ID': 'Performance Profile Identifier',
                            'Critical Reference Date': 'The key date for assessment',
                            'Day Count (Days)': 'Number of days in assessment period',
                            'Productivity_CSD': 'Productivity score at candidate start date',
                            'Productivity_USD': 'Productivity score at unit start date',
                            'RRN': 'Reading Ratio Normalized',
                            'PRN': 'Productivity Ratio Normalized',
                            'ARN': 'Assessment Ratio Normalized',
                            'XLR': 'Listening Ratio Score',
                            'XRR': 'Reading Ratio Score',
                            'XSR': 'Speaking Ratio Score',
                            'XWR': 'Writing Ratio Score',
                            'XTR': 'Theory-Based Ratio Score',
                            'XPR': 'Practical Ratio Score',
                            'XRVSR': 'Receptive Variable Score Ratio',
                            'XPVSR': 'Productive Variable Score Ratio',
                            'XAVSR': 'Acuity Variable Score Ratio',
                            'XEP': 'Equivalent Proficiency Score',
                            'XCP': 'Composite Proficiency Score',
                            'XBP': 'Band Proficiency Score',
                            'MSIP': 'Butler Interaction Proficiency',
                            'STA/P': 'Stability in Proficiency',
                            'IC': 'Interaction Coefficient',
                            'ΔRRN': 'Change in Reading Ratio',
                            'ΔPRN': 'Change in Productivity Ratio',
                            'ΔARN': 'Change in Assessment Ratio',
                            'GEQ': 'General Evaluation Quality',
                            'STA/G': 'Stability Grade',
                            'RRGT1': 'Reading Ratio Grade Threshold 1',
                            'PRGT1': 'Productivity Ratio Grade Threshold 1',
                            'ARGT1': 'Assessment Ratio Grade Threshold 1',
                            'RRGT2': 'Reading Ratio Grade Threshold 2',
                            'PRGT2': 'Productivity Ratio Grade Threshold 2',
                            'ARGT2': 'Assessment Ratio Grade Threshold 2',
                            'RRGT3': 'Reading Ratio Grade Threshold 3',
                            'PRGT3': 'Productivity Ratio Grade Threshold 3',
                            'ARGT3': 'Assessment Ratio Grade Threshold 3',
                            'RRGT4': 'Reading Ratio Grade Threshold 4',
                            'PRGT4': 'Productivity Ratio Grade Threshold 4',
                            'ARGT4': 'Assessment Ratio Grade Threshold 4',
                            'RRGT5': 'Reading Ratio Grade Threshold 5',
                            'PRGT5': 'Productivity Ratio Grade Threshold 5',
                            'ARGT5': 'Assessment Ratio Grade Threshold 5'
                          }).map(([header, description]) => (
                            <th 
                              key={header}
                              className="whitespace-nowrap border-1 border-gray-400 px-2 py-1 group relative"
                            >
                              {header}
                              <div className="absolute hidden group-hover:block z-50 top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                                {description}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {workspaceTableData.length > 0 ? (
                          workspaceTableData.map((row, rowIndex) => (
                            <tr
                              key={rowIndex}
                              
                              className={`cursor-pointer hover:bg-gray-100 `}
                            >
                              <td className="border-1 border-gray-400 px-2 py-1">{row.ppId}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.criticalDate}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.dayCount}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.productivityCSD}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.productivityUSD}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.rrn}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.prn}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.arn}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.xlr}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.xrr}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.xsr}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.xwr}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.xtr}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.xpr}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.xrvsr}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.xpvsr}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.xavsr}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.xep}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.xcp}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.xbp}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.msip}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.stap}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.ic}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.deltaRrn}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.deltaPrn}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.deltaArn}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.geq}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.stag}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.rrgt1}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.prgt1}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.argt1}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.rrgt2}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.prgt2}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.argt2}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.rrgt3}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.prgt3}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.argt3}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.rrgt4}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.prgt4}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.argt4}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.rrgt5}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.prgt5}</td>
                              <td className="border-1 border-gray-400 px-2 py-1">{row.argt5}</td>
                            </tr>

                          ))
                        ) : (
                          <tr><td colSpan="44" className="text-center py-4">No data available</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                {/* )} */}
              </div>
            </div>
          </div>
        </div>


      </div>






      {ScoreAdd && (
        <div className="overflow-auto my-2">
          <ScoringCriteria onClose={() => setScoreAdd(false)} />
        </div>
      )}

    </>
  );
}
