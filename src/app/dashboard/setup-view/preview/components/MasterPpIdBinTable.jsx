import React from "react";
import { useSearchParams } from "next/navigation";

// Define competency types and their corresponding columns
const competencyTypes = {
  communicative: [
    { attained: "Attained Listening Score", max: "Maximum Listening Score", dataKey: "listeningScore" },
    { attained: "Attained Reading Score", max: "Maximum Reading Score", dataKey: "readingScore" },
    { attained: "Attained Speaking Score", max: "Maximum Speaking Score", dataKey: "speakingScore" },
    { attained: "Attained Writing Score", max: "Maximum Writing Score", dataKey: "writingScore" }
  ],
  'theory practical': [
    { attained: "Attained Theory Score", max: "Maximum Theory Score", dataKey: "theoryScore" },
    { attained: "Attained Practice Score", max: "Maximum Practice Score", dataKey: "practiceScore" }
  ],
  'third parameter': [
    { attained: "Attained Receptive Variable Score", max: "Maximum Receptive Variable Score", dataKey: "receptiveScore" },
    { attained: "Attained Productive Variable Score", max: "Maximum Productive Variable Score", dataKey: "productiveScore" },
    { attained: "Attained Acuity Variable Score", max: "Maximum Acuity Variable Score", dataKey: "acuityScore" }
  ]
};

const MasterPpIdBinTable = ({ data }) => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'communicative'; // Default to communicative
  const currentCompetencies = competencyTypes[type] || competencyTypes.communicative;

  // Sort data by absolute ppId value, with negative values first
  const sortedData = [...data].sort((a, b) => {
    const absA = Math.abs(a.ppId);
    const absB = Math.abs(b.ppId);
    if (a.ppId < 0 && b.ppId > 0) return -1;
    if (a.ppId > 0 && b.ppId < 0) return 1;
    return absA - absB;
  });

  return (
    <div className="overflow-x-auto border-1 border-gray-200 shadow-sm">
      <table className="w-full table-auto text-sm text-left border-collapse">
        <thead className="bg-gray-100 text-gray-900">
          <tr>
            <th className="px-4 py-2 border-1 border-gray-300">Master PP ID Callout</th>
            <th className="px-4 py-2 border-1 border-gray-300">Unit Name</th>
            <th className="px-4 py-2 border-1 border-gray-300">Unit ID</th>
            <th className="px-4 py-2 border-1 border-gray-300">Unit Type</th>
            
            {/* Dynamically render columns based on competency type */}
            {currentCompetencies.map((comp, index) => (
              <React.Fragment key={index}>
                <th className="px-4 py-2 border-1 border-gray-300">{comp.attained}</th>
                <th className="px-4 py-2 border-1 border-gray-300">{comp.max}</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50 bg-white transition-colors">
              <td className="px-4 py-2 border-1 border-gray-200">{row.ppId}</td>
              <td className="px-4 py-2 border-1 border-gray-200">{row.unitName}</td>
              <td className="px-4 py-2 border-1 border-gray-200">{row.unitId}</td>
              <td className="px-4 py-2 border-1 border-gray-200">{row.unitType}</td>
              
              {/* Dynamically render data cells based on competency type */}
              {currentCompetencies.map((comp, compIndex) => (
                <React.Fragment key={compIndex}>
                  <td className="px-4 py-2 border-1 border-gray-200">
                    {row[comp.dataKey] || '-'}
                  </td>
                  <td className="px-4 py-2 border-1 border-gray-200">
                    {row[`max${comp.dataKey.charAt(0).toUpperCase() + comp.dataKey.slice(1)}`] || '-'}
                  </td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MasterPpIdBinTable;