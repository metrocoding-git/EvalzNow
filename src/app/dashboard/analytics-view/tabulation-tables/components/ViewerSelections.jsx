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
      ppId: -1,
      criticalDate: "2025-08-01",
      dayCount: 12,
      productivityCSD: 95,
      productivityUSD: 88,
      "∆ARN": 12,
  "∆PRN": 18,
  "∆RRN": 25,
  "AAVS": 87,
  "ALS": 76,
  "APS": 91,
  "APVS": 64,
  "AR": 55,
  "ARGT": 32,
  "ARN": 47,
  "ARS": 72,
  "ARVS": 68,
  "ASP": 81,
  "ATS": 59,
  "AWS": 66,
  "BID": 1001,
  "CID": 5002,
  "CSD": 20210101,
  "DC": 120,
  "GEQ": 42,
  "GT": 53,
  "IC": 3,
  "IEP": 7,
  "MAVS": 95,
  "MGS": 88,
  "MLS": 91,
  "MPS": 86,
  "MPVS": 93,
  "MRS": 90,
  "MRVS": 85,
  "MSIP": 14,
  "MSS": 89,
  "MTS": 92,
  "MWS": 87,
  "PP": 4,
  "PR": 61,
  "PRGT": 39,
  "PRN": 45,
  "PTP": 5,
  "RMS": 27,
  "RR": 52,
  "RRGT": 34,
  "RRN": 41,
  "SGP": 78,
  "SLA": 22,
  "SMART": 9,
  "STA/G": 11,
  "STA/P": 13,
  "TEFL": 2,
  "TTT": 6,
  "USD": 20210315,
  "VAM": 19,
  "VTM": 21,
  "XAVSR": 44,
  "XBP": 56,
  "XCP": 63,
  "XEP": 71,
  "XLR": 54,
  "XPR": 62,
  "XPVSR": 48,
  "XRR": 58,
  "XRVSR": 49,
  "XSR": 67,
  "XTR": 73,
  "XWR": 69
    },
    {
      ppId: 1,
      criticalDate: "2025-08-02",
      dayCount: 8,
      productivityCSD: 85,
      productivityUSD: 80,
      "∆ARN": 12,
  "∆PRN": 18,
  "∆RRN": 25,
  "AAVS": 87,
  "ALS": 76,
  "APS": 91,
  "APVS": 64,
  "AR": 55,
  "ARGT": 32,
  "ARN": 47,
  "ARS": 72,
  "ARVS": 68,
  "ASP": 81,
  "ATS": 59,
  "AWS": 66,
  "BID": 1001,
  "CID": 5002,
  "CSD": 20210101,
  "DC": 120,
  "GEQ": 42,
  "GT": 53,
  "IC": 3,
  "IEP": 7,
  "MAVS": 95,
  "MGS": 88,
  "MLS": 91,
  "MPS": 86,
  "MPVS": 93,
  "MRS": 90,
  "MRVS": 85,
  "MSIP": 14,
  "MSS": 89,
  "MTS": 92,
  "MWS": 87,
  "PP": 4,
  "PR": 61,
  "PRGT": 39,
  "PRN": 45,
  "PTP": 5,
  "RMS": 27,
  "RR": 52,
  "RRGT": 34,
  "RRN": 41,
  "SGP": 78,
  "SLA": 22,
  "SMART": 9,
  "STA/G": 11,
  "STA/P": 13,
  "TEFL": 2,
  "TTT": 6,
  "USD": 20210315,
  "VAM": 19,
  "VTM": 21,
  "XAVSR": 44,
  "XBP": 56,
  "XCP": 63,
  "XEP": 71,
  "XLR": 54,
  "XPR": 62,
  "XPVSR": 48,
  "XRR": 58,
  "XRVSR": 49,
  "XSR": 67,
  "XTR": 73,
  "XWR": 69
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
            <div className=" flex flex-col border border-gray-200">
              <div className="flex-1 overflow-auto p-1">
                {candidate && (
                  <div className="px-3 py-1">
                    {/* Always show candidate details */}
                    <div className="items-center justify-center px-4">
                      <div className="p-1 rounded-lg mt-1 space-y-1">
                        <div className="grid grid-cols-5 text-sm text-gray-400">
                          <span>First Name:</span>
                          <span>{candidate.firstName}</span>
                        </div>
                        <div className="grid grid-cols-5 text-sm text-gray-400">
                          <span>Last Name:</span>
                          <span>{candidate.lastName}</span>
                        </div>
                        <div className="grid grid-cols-5 text-sm text-gray-400">
                          <span>ID:</span>
                          <span>{candidate.id}</span>
                        </div>
                        {candidate.candidateStartDate && (
                          <div className="grid grid-cols-5 text-sm text-gray-400">
                            <span>Candidate Start Date:</span>
                            <span>{candidate.candidateStartDate}</span>
                          </div>
                        )}
                        {candidate.unitStartDate && (
                          <div className="grid grid-cols-5 text-sm text-gray-400">
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

            <div className=" flex flex-col flex-1 min-h-0 border border-gray-200 ">
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
              <div className="flex-1 flex flex-col min-h-0">
                {/* {activeAdjustPropertieTab === 'Property editor' && (
                  <PropertyEditor
                    properties={chartProperties}
                    onChange={setChartProperties}
                  />
                )}

                {activeAdjustPropertieTab === 'Table' && ( */}
                
                  <div className="flex-1 overflow-auto">

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
                            '∆ARN'   : 'Acuity Ratio Growth Differential',
                            '∆PRN'   : 'Productive Ratio Growth Differential',
                            '∆RRN'   : 'Receptive Ratio Growth Differential',
                            'AAVS'   : 'Attained Acuity Variable Scores',
                            'ALS'    : 'Attained Listening Score',
                            'APS'    : 'Attained Practical Score',
                            'APVS'   : 'Attained Productive Variable Scores',
                            'AR'     : 'Acuity Ratio of Outputs',
                            'ARGT'   : 'Projected Acuity Ratio Component for Growth Target',
                            'ARN'    : 'Acuity Ratio of the Performance Point',
                            'ARS'    : 'Attained Reading Score',
                            'ARVS'   : 'Attained Receptive Variable Scores',
                            'ASP'    : 'Attained Speaking Score',
                            'ATS'    : 'Attained Theory-Based Score',
                            'AWS'    : 'Attained Writing Score',
                            'BID'    : 'Benchmark ID',
                            'CID'    : 'Candidate ID',
                            'CSD'    : 'Candidate Start Date',
                            'DC'     : 'Day Count',
                            'GEQ'    : 'Equivalent Growth',
                            'GT'     : 'Growth Target of a Performance Point',
                            'IC'     : 'Interaction Class Based on Performance Point',
                            'IEP'    : 'Individualized Educational Plan',
                            'MAVS'   : 'Maximum Acuity Variable Scores',
                            'MGS'    : 'Maximum Grammar Score',
                            'MLS'    : 'Maximum Listening Score',
                            'MPS'    : 'Maximum Practical Score',
                            'MPVS'   : 'Maximum Productive Variable Scores',
                            'MRS'    : 'Maximum Reading Score',
                            'MRVS'   : 'Maximum Receptive Variable Scores',
                            'MSIP'   : 'Margins of Interaction Proficiency',
                            'MSS'    : 'Maximum Speaking Score',
                            'MTS'    : 'Maximum Theory-Based Score',
                            'MWS'    : 'Maximum Writing Score',
                            'PP'     : 'Performance Point',
                            'PR'     : 'Productive Ratio of Outputs',
                            'PRGT'   : 'Projected Productive Ratio Component for Growth Target',
                            'PRN'    : 'Productive Ratio of the Performance Point',
                            'PTP'    : 'Projection Termination Point',
                            'RMS'    : 'Root Mean Square',
                            'RR'     : 'Receptive Ratio of Inputs',
                            'RRGT'   : 'Projected Receptive Ratio Component for Growth Target',
                            'RRN'    : 'Receptive Ratio of the Performance Point',
                            'SGP'    : 'Student Growth Percentile',
                            'SLA'    : 'Student Language Acquisition',
                            'SMART'  : 'Specific/Measurable/Attainable/Relevancy (Realistic)/Time-Bound',
                            'STA/G'  : 'Stability in Growth',
                            'STA/P'  : 'Stability in Proficiency',
                            'TEFL'   : 'Teaching English as a Foreign Language',
                            'TTT'    : 'Teacher Talk Time',
                            'USD'    : 'Unit Start Date',
                            'VAM'    : 'Value-Added Model',
                            'VTM'    : 'Value-Table Model',
                            'XAVSR'  : 'Acuity Variable Scoring Ratio',
                            'XBP'    : 'Band Proficiency',
                            'XCP'    : 'Composite Proficiency',
                            'XEP'    : 'Equivalent Proficiency',
                            'XLR'    : 'Listening Ratio',
                            'XPR'    : 'Practical Ratio',
                            'XPVSR'  : 'Productive Variable Scoring Ratio',
                            'XRR'    : 'Reading Ratio',
                            'XRVSR'  : 'Receptive Variable Scoring Ratio',
                            'XSR'    : 'Speaking Ratio',
                            'XTR'    : 'Theory-Based Ratio',
                            'XWR'    : 'Writing Ratio',

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
                                className="cursor-pointer hover:bg-gray-100"
                              >
                                {Object.keys({
                                  'PP ID': 'Performance Profile Identifier',
                                  'Critical Reference Date': 'The key date for assessment',
                                  'Day Count (Days)': 'Number of days in assessment period',
                                  'Productivity_CSD': 'Productivity score at candidate start date',
                                  'Productivity_USD': 'Productivity score at unit start date',
                                  '∆ARN': 'Acuity Ratio Growth Differential',
                                  '∆PRN': 'Productive Ratio Growth Differential',
                                  '∆RRN': 'Receptive Ratio Growth Differential',
                                  'AAVS': 'Attained Acuity Variable Scores',
                                  'ALS': 'Attained Listening Score',
                                  'APS': 'Attained Practical Score',
                                  'APVS': 'Attained Productive Variable Scores',
                                  'AR': 'Acuity Ratio of Outputs',
                                  'ARGT': 'Projected Acuity Ratio Component for Growth Target',
                                  'ARN': 'Acuity Ratio of the Performance Point',
                                  'ARS': 'Attained Reading Score',
                                  'ARVS': 'Attained Receptive Variable Scores',
                                  'ASP': 'Attained Speaking Score',
                                  'ATS': 'Attained Theory-Based Score',
                                  'AWS': 'Attained Writing Score',
                                  'BID': 'Benchmark ID',
                                  'CID': 'Candidate ID',
                                  'CSD': 'Candidate Start Date',
                                  'DC': 'Day Count',
                                  'GEQ': 'Equivalent Growth',
                                  'GT': 'Growth Target of a Performance Point',
                                  'IC': 'Interaction Class Based on Performance Point',
                                  'IEP': 'Individualized Educational Plan',
                                  'MAVS': 'Maximum Acuity Variable Scores',
                                  'MGS': 'Maximum Grammar Score',
                                  'MLS': 'Maximum Listening Score',
                                  'MPS': 'Maximum Practical Score',
                                  'MPVS': 'Maximum Productive Variable Scores',
                                  'MRS': 'Maximum Reading Score',
                                  'MRVS': 'Maximum Receptive Variable Scores',
                                  'MSIP': 'Margins of Interaction Proficiency',
                                  'MSS': 'Maximum Speaking Score',
                                  'MTS': 'Maximum Theory-Based Score',
                                  'MWS': 'Maximum Writing Score',
                                  'PP': 'Performance Point',
                                  'PR': 'Productive Ratio of Outputs',
                                  'PRGT': 'Projected Productive Ratio Component for Growth Target',
                                  'PRN': 'Productive Ratio of the Performance Point',
                                  'PTP': 'Projection Termination Point',
                                  'RMS': 'Root Mean Square',
                                  'RR': 'Receptive Ratio of Inputs',
                                  'RRGT': 'Projected Receptive Ratio Component for Growth Target',
                                  'RRN': 'Receptive Ratio of the Performance Point',
                                  'SGP': 'Student Growth Percentile',
                                  'SLA': 'Student Language Acquisition',
                                  'SMART': 'Specific/Measurable/Attainable/Relevancy (Realistic)/Time-Bound',
                                  'STA/G': 'Stability in Growth',
                                  'STA/P': 'Stability in Proficiency',
                                  'TEFL': 'Teaching English as a Foreign Language',
                                  'TTT': 'Teacher Talk Time',
                                  'USD': 'Unit Start Date',
                                  'VAM': 'Value-Added Model',
                                  'VTM': 'Value-Table Model',
                                  'XAVSR': 'Acuity Variable Scoring Ratio',
                                  'XBP': 'Band Proficiency',
                                  'XCP': 'Composite Proficiency',
                                  'XEP': 'Equivalent Proficiency',
                                  'XLR': 'Listening Ratio',
                                  'XPR': 'Practical Ratio',
                                  'XPVSR': 'Productive Variable Scoring Ratio',
                                  'XRR': 'Reading Ratio',
                                  'XRVSR': 'Receptive Variable Scoring Ratio',
                                  'XSR': 'Speaking Ratio',
                                  'XTR': 'Theory-Based Ratio',
                                  'XWR': 'Writing Ratio',
                                }).map((header) => {
                                  // normalize header key to match row keys
                                  let key = header;
                                  if (header === 'PP ID') key = 'ppId';
                                  if (header === 'Critical Reference Date') key = 'criticalDate';
                                  if (header.startsWith('Day Count')) key = 'dayCount';
                                  if (header === 'Productivity_CSD') key = 'productivityCSD';
                                  if (header === 'Productivity_USD') key = 'productivityUSD';

                                  return (
                                    <td
                                      key={key}
                                      className="border border-gray-200 px-2 py-1 whitespace-nowrap"
                                    >
                                      {row[key] !== undefined ? row[key] : '-'}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="70" className="text-center py-4">
                                No data available
                              </td>
                            </tr>
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
