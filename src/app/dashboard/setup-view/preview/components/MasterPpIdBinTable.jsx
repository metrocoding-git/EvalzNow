import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getAssessmentBlockByUnitId } from "@/services/assessmentBlockManagerService";

// Define competency types and their corresponding columns
const competencyTypes = {
  'Communicative I/O': [
    { attained: "Attained Listening Score", max: "Maximum Listening Score", dataKey: "listeningScore" },
    { attained: "Attained Reading Score", max: "Maximum Reading Score", dataKey: "readingScore" },
    { attained: "Attained Speaking Score", max: "Maximum Speaking Score", dataKey: "speakingScore" },
    { attained: "Attained Writing Score", max: "Maximum Writing Score", dataKey: "writingScore" }
  ],
  'Theory & Practice': [
    { attained: "Attained Theory Score", max: "Maximum Theory Score", dataKey: "theoryScore" },
    { attained: "Attained Practice Score", max: "Maximum Practice Score", dataKey: "practiceScore" }
  ],
  'Third Parameter': [
    { attained: "Attained Receptive Variable Score", max: "Maximum Receptive Variable Score", dataKey: "receptiveScore" },
    { attained: "Attained Productive Variable Score", max: "Maximum Productive Variable Score", dataKey: "productiveScore" },
    { attained: "Attained Acuity Variable Score", max: "Maximum Acuity Variable Score", dataKey: "acuityScore" }
  ]
};

const MasterPpIdBinTable = ({ data }) => {

  // Sort data by absolute ppId value, with negative values first
  const sortedData = [...data].sort((a, b) => {
    const absA = Math.abs(a.ppId);
    const absB = Math.abs(b.ppId);
    if (a.ppId < 0 && b.ppId > 0) return -1;
    if (a.ppId > 0 && b.ppId < 0) return 1;
    return absA - absB;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [assessmentBlocks, setAssessmentBlocks] = useState([]);

  const searchParams = useSearchParams();
  const unitId = searchParams.get('unitId');

  useEffect(() => {
    const fetchBlocks = async () => {
      if (!unitId) return;
      try {
        setLoading(true);
        const blocks = await getAssessmentBlockByUnitId(unitId);
        // Ensure it's always an array
        setAssessmentBlocks(Array.isArray(blocks) ? blocks : [blocks]);
      } catch (err) {
        console.error("Failed to fetch blocks:", err);
        setError("Failed to load blocks");
      } finally {
        setLoading(false);
      }
    };
    fetchBlocks();
  }, [unitId]);

  // Sort by ppId
  const sortedBlocks = [...assessmentBlocks].sort((a, b) => {
    const absA = Math.abs(a.ppId);
    const absB = Math.abs(b.ppId);
    if (a.ppId < 0 && b.ppId > 0) return -1;
    if (a.ppId > 0 && b.ppId < 0) return 1;
    return absA - absB;
  });

  // Determine current competencies based on unitType
  const currentUnitType = sortedBlocks[0]?.unit?.unitType || "";
  const currentCompetencies = competencyTypes[currentUnitType] || [];

  return (
    <div className="overflow-x-auto border-1 border-gray-200 shadow-sm h-full">
      <table className="w-full table-auto text-sm text-left border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Master PP ID Callout</th>
            <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Unit Name</th>
            <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Unit ID</th>
            <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">Unit Type</th>


            {currentCompetencies.map((comp, idx) => (
              <React.Fragment key={idx}>
                <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">{comp.attained}</th>
                <th className="whitespace-nowrap border-1 border-gray-400 px-2 py-1">{comp.max}</th>
              </React.Fragment>
            ))}

          </tr>
        </thead>
        <tbody>
        {sortedBlocks.map((row, index) => (
            <tr key={index}>
              <td className="border-1 border-gray-400 px-2 py-1">{row.ppId}</td>
              <td className="border-1 border-gray-400 px-2 py-1">{row.unit.unitName}</td>
              <td className="border-1 border-gray-400 px-2 py-1">{row.unit.unitId}</td>
              <td className="border-1 border-gray-400 px-2 py-1">{row.unit.unitType}</td>

              {/* Only render data cells for the current unit type */}
              {currentCompetencies.map((comp, idx) => {
                const attainedKey = `attained${comp.dataKey.charAt(0).toUpperCase() + comp.dataKey.slice(1)}`;
                const maxKey = `max${comp.dataKey.charAt(0).toUpperCase() + comp.dataKey.slice(1)}`;
                return (
                  <React.Fragment key={idx}>
                    <td className="border-1 border-gray-400 px-2 py-1">{row[attainedKey]}</td>
                    <td className="border-1 border-gray-400 px-2 py-1">{row[maxKey]}</td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MasterPpIdBinTable;