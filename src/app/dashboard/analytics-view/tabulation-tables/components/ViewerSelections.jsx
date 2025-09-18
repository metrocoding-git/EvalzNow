'use client';
import React, { useEffect, useRef, useState } from 'react';
import ScoringCriteria from './ScoringCriteria';
import { FolderOutput, RefreshCw } from 'lucide-react';
import PropertyEditor from '../../components/PropertyEditor';
import { getUnitAndCandidateSummary } from '@/services/tabulationTableService';
import { useUnit } from '@/context/UnitContext';


export default function ViewerSelections({candidate, unitId}) {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // const { unitId, setUnitId } = useUnit();

  console.log(candidate);
  const data = [
    { id: 1, firstName: "John", lastName: "Doe", candidateStartDate: "2022-01-01", unitStartDate: "2022-01-01" },
    { id: 2, firstName: "Jane", lastName: "Smith", candidateStartDate: "2022-01-01", unitStartDate: "2022-01-01" },
  ]


  const [tableData, setTableData] = useState([
    // {
    //   "PP ID": 1,
    //   "Critical Reference Date": "2025-08-02",
    //   "Day Count (Days)": 8,
    //   "Productivity_CSD": 85,
    //   "Productivity_USD": 80,
    //   'RRN': 30,
    //   "PRN": 90,
    //   "ARN": 88,
    //   "XLR": 80,
    //   "XRR": 82,
    //   "XSR": 78,
    //   "XWR": 75,
    //   "XTR": 70,
    //   "XPR": 77,
    //   "XRVSR": 84,
    //   "XPVSR": 86,
    //   "XAVSR": 83,
    //   "XEP": 88,
    //   "XCP": 87,
    //   "XBP": 3,
    //   "MSIP": 5,
    //   "STA/P": 95,
    //   "IC": 2,
    //   "ΔRRN": 10,
    //   "ΔPRN": 12,
    //   "ΔARN": 12,
    //   "GEQ": 7,
    //   "STA/G": 92,
    //   "RRGT1": 6,
    //   "PRGT1": 8,
    //   "ARGT1": 7,
    //   "RRGT2": 5,
    //   "PRGT2": 7,
    //   "ARGT2": 6,
    //   "RRGT3": 4,
    //   "PRGT3": 6,
    //   "ARGT3": 5,
    //   "RRGT4": 3,
    //   "PRGT4": 5,
    //   "ARGT4": 4,
    //   "RRGT5": 2,
    //   "PRGT5": 4,
    //   "ARGT5": 3
    // },    
    // {
    //   "PP ID": 2,
    //   "Critical Reference Date": "2025-08-02",
    //   "Day Count (Days)": 8,
    //   "Productivity_CSD": 85,
    //   "Productivity_USD": 80,
    //   'RRN': 30,
    //   "PRN": 90,
    //   "ARN": 88,
    //   "XLR": 80,
    //   "XRR": 82,
    //   "XSR": 78,
    //   "XWR": 75,
    //   "XTR": 70,
    //   "XPR": 77,
    //   "XRVSR": 84,
    //   "XPVSR": 86,
    //   "XAVSR": 83,
    //   "XEP": 88,
    //   "XCP": 87,
    //   "XBP": 3,
    //   "MSIP": 5,
    //   "STA/P": 95,
    //   "IC": 2,
    //   "ΔRRN": 10,
    //   "ΔPRN": 12,
    //   "ΔARN": 12,
    //   "GEQ": 7,
    //   "STA/G": 92,
    //   "RRGT1": 6,
    //   "PRGT1": 8,
    //   "ARGT1": 7,
    //   "RRGT2": 5,
    //   "PRGT2": 7,
    //   "ARGT2": 6,
    //   "RRGT3": 4,
    //   "PRGT3": 6,
    //   "ARGT3": 5,
    //   "RRGT4": 3,
    //   "PRGT4": 5,
    //   "ARGT4": 4,
    //   "RRGT5": 2,
    //   "PRGT5": 4,
    //   "ARGT5": 3
    // }
    ]);


    // Move this above your return
const headers = {
  'PP ID': 'Performance Profile Identifier',
  'Critical Reference Date': 'The key date for assessment',
  'Day Count (Days)': 'Number of days in assessment period',
  'Productivity_CSD': 'Productivity score at candidate start date',
  'Productivity_USD': 'Productivity score at unit start date',
  'RRN': 'Receptive Ratio of the Performance Point',
  'PRN': 'Productive Ratio of the Performance Point',
  'ARN': 'Acuity Ratio of the Performance Point',
  'XLR': 'Listening Ratio',
  'XRR': 'Reading Ratio',
  'XSR': 'Speaking Ratio',
  'XWR': 'Writing Ratio',
  'XTR': 'Theory-Based Ratio',
  'XPR': 'Practical Ratio',
  'XRVSR': 'Receptive Variable Scoring Ratio',
  'XPVSR': 'Productive Variable Scoring Ratio',
  'XAVSR': 'Acuity Variable Scoring Ratio',
  'XEP': 'Equivalent Proficiency',
  'XCP': 'Composite Proficiency',
  'XBP': 'Band Proficiency',
  'MSIP': 'Margins of Interaction Proficiency',
  'STA/P': 'Stability in Proficiency',
  'IC': 'Interaction Class Based on Performance Point',
  'ΔRRN': 'Receptive Ratio Growth Differential',
  'ΔPRN': 'Productive Ratio Growth Differential',
  'ΔARN': 'Acuity Ratio Growth Differential',
  'GEQ': 'Equivalent Growth',
  'STA/G': 'Stability in Growth',
  'RRGT1': 'Projected Receptive Ratio Component for Growth Target 1',
  'PRGT1': 'Projected Productive Ratio Component for Growth Target 1',
  'ARGT1': 'Projected Acuity Ratio Component for Growth Target 1',
  'RRGT2': 'Projected Receptive Ratio Component for Growth Target 2',
  'PRGT2': 'Projected Productive Ratio Component for Growth Target 2',
  'ARGT2': 'Projected Acuity Ratio Component for Growth Target 2',
  'RRGT3': 'Projected Receptive Ratio Component for Growth Target 3',
  'PRGT3': 'Projected Productive Ratio Component for Growth Target 3',
  'ARGT3': 'Projected Acuity Ratio Component for Growth Target 3',
  'RRGT4': 'Projected Receptive Ratio Component for Growth Target 4',
  'PRGT4': 'Projected Productive Ratio Component for Growth Target 4',
  'ARGT4': 'Projected Acuity Ratio Component for Growth Target 4',
  'RRGT5': 'Projected Receptive Ratio Component for Growth Target 5',
  'PRGT5': 'Projected Productive Ratio Component for Growth Target 5',
  'ARGT5': 'Projected Acuity Ratio Component for Growth Target 5',
};

console.log("tabulation table unit id:", unitId);
console.log("tabulation table candidate key: ", candidate.id);

useEffect(() => {
  const fetchTabulationData = async () => {
    if (!unitId || !candidate?.id) {
      setTableData([]); // clear previous table data
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getUnitAndCandidateSummary(unitId, candidate.id);

      const formattedData = data.map(item => ({
        "PP ID": item.subPpId,
        "Critical Reference Date": item.criticalRefDate,
        "Day Count (Days)": item.dayCount,
        "Productivity_CSD": item.productivityCSD,
        "Productivity_USD": item.productivityUSD,
        "RRN": item.RRN,
        "PRN": item.PRN,
        "ARN": item.ARN,
        "XLR": item.XLR,
        "XRR": item.XRR,
        "XSR": item.XSR,
        "XWR": item.XWR,
        "XTR": item.XTR,
        "XPR": item.XPR,
        "XRVSR": item.XRVSR,
        "XPVSR": item.XPVSR,
        "XAVSR": item.XAVSR,
        "XEP": item.XEP,
        "XCP": item.XCP,
        "XBP": item.XBP,
        "MSIP": item.MSIP,
        "STA/P": item["STA/P"],
        "IC": item.IC,
        "ΔRRN": item["ΔRRN"],
        "ΔPRN": item["ΔPRN"],
        "ΔARN": item["ΔARN"],
        "GEQ": item.GEQ,
        "STA/G": item["STA/G"],
        "RRGT1": item.RRGT1,
        "PRGT1": item.PRGT1,
        "ARGT1": item.ARGT1,
        "RRGT2": item.RRGT2,
        "PRGT2": item.PRGT2,
        "ARGT2": item.ARGT2,
        "RRGT3": item.RRGT3,
        "PRGT3": item.PRGT3,
        "ARGT3": item.ARGT3,
        "RRGT4": item.RRGT4,
        "PRGT4": item.PRGT4,
        "ARGT4": item.ARGT4,
        "RRGT5": item.RRGT5,
        "PRGT5": item.PRGT5,
        "ARGT5": item.ARGT5,
      }));

      setTableData(formattedData);
    } catch (err) {
      console.error("Failed to fetch tabulation data:", err);
      setError("Failed to load table data.");
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  fetchTabulationData();
}, [unitId, candidate?.id]);

   

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

          <div className=" h-full overflow-hidden w-full my-1 flex-col">
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

            <div className=" flex flex-col flex-1 min-h-55 border border-gray-200 ">
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
                            {Object.entries(headers).map(([header, description]) => (
                              <th 
                                key={header}
                                className="whitespace-nowrap text-center border-1 border-gray-400 px-2 py-1 group relative"
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
                          {tableData.length > 0 ? (
                            tableData.map((row, rowIndex) => (
                              <tr key={rowIndex} className="cursor-pointer hover:bg-gray-100">
                                {Object.keys(headers).map((header) => (
                                  <td
                                    key={header}
                                    className="border text-center border-gray-200 px-2 py-1 whitespace-nowrap"
                                  >
                                    {row[header] ?? '-'}
                                  </td>
                                ))}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={Object.keys(headers).length} className="text-center py-4">
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
