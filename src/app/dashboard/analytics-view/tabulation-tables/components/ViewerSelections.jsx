'use client';
import React, { useEffect, useRef, useState } from 'react';
import ScoringCriteria from './ScoringCriteria';
import { FolderOutput, RefreshCw } from 'lucide-react';
import PropertyEditor from '../../components/PropertyEditor';


export default function ViewerSelections() {
  const [openCandidate, setOpenCandidate] = useState({});
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


  const data = [
    { id: 1, firstName: "John", lastName: "Doe", candidateStartDate: "2022-01-01", unitStartDate: "2022-01-01" },
    { id: 2, firstName: "Jane", lastName: "Smith", candidateStartDate: "2022-01-01", unitStartDate: "2022-01-01" },
  ]


  if (!visible) return null;

  return (
    <>
      <h2 className="text-md font-bold bg-gray-100 p-2 flex items-center">
        <span className='pl-2 text-md'>Viewer Selections</span>
        <span className="flex-grow border-dotted border-t border-gray-400 mx-2"></span>
      </h2>
      <div className="flex h-full w-full my-2">
        <div className='w-full flex flex-col border-2 h-full border-blue-200 rounded-md p-1'>
          <div className="flex items-center justify-between mb-3 px-1 mx-1 mt-1 text-gray-700 ">
            <h2 className="text-sm font-semibold">Candidate Display</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => {}} title="Create Material" className='text-blue-600 hover:text-blue-800 cursor-pointer'>
                <RefreshCw className="w-4 h-4 hover:text-green-600" onClick={() => setScoreAdd(true)} />
              </button>
              <button title="Delete Curve" className='text-red-600 hover:text-red-800 cursor-pointer'>
                <FolderOutput className="w-4 h-4 hover:text-blue-600" />
              </button>

            </div>
          </div>

          <div className=" h-full overflow-hidden w-full my-2">
            <div className=" h-1/2 flex flex-col border border-gray-200  ">

              <div className="flex-1 overflow-auto  p-1 ">
                {data.map((candidate, index) => (
                  <div key={index} className=" px-3 py-1">
                    {/* Dropdown Toggle */}
                    <div
                      className="flex items-center cursor-pointer select-none hover:bg-blue-50 rounded-md px-2 py-1"
                      onClick={() => toggleGroup(index)}
                    >
                      <span
                        className={`transition-transform duration-200 text-gray-600 mr-1 ${openCandidate[index] ? "rotate-90" : "rotate-0"
                          }`}
                      >
                        ▶
                      </span>

                      <span className="text-sm text-gray-700 font-medium">
                        {candidate.firstName} {candidate.lastName} - {candidate.id} - {candidate.candidateStartDate} - {candidate.unitStartDate}
                      </span>
                    </div>

                    {/* Dropdown Content */}
                    {openCandidate[index] && (
                      <>
                        <div className=" items-center justify-center  px-4 ">
                          <div className="border border-blue-200 p-1 rounded-lg">
                            <span className="text-sm text-gray-400">
                              First Name : {candidate.firstName}
                            </span>
                            <br />
                            <span className="text-sm text-gray-400">
                              Last Name : {candidate.lastName}
                            </span>
                            <br />
                            <span className="text-sm text-gray-400">
                              Unit ID: {candidate.id}
                            </span>
                            <br />
                            <span className="text-sm text-gray-400">
                              Candidate Start Date: {candidate.candidateStartDate}
                            </span>
                            <br />
                            <span className="text-sm text-gray-400">
                              Unit Start Date: {candidate.unitStartDate}
                            </span>
                          </div>
                        </div>

                      </>
                    )}

                  </div>
                ))}
              </div>

            </div>


            <div className="h-1/2 flex flex-col border border-gray-200">
              {/* Tab Buttons */}
              <div className="flex space-x-2 border-b p-2">
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
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-auto p-2 h-full">
                {activeAdjustPropertieTab === 'Property editor' && (
                  <PropertyEditor
                    properties={chartProperties}
                    onChange={setChartProperties}
                  />
                )}

                {activeAdjustPropertieTab === 'Table' && (

                  <div className="text-sm text-gray-600 mt-2 w-full overflow-auto">

                  </div>


                )}
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
