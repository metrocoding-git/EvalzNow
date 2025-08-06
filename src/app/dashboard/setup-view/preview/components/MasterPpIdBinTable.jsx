import React from "react";

const MasterPpIdBinTable = ({ data }) => {
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
            <th className="px-4 py-2 border-1 border-gray-300">Attained Listening</th>
            <th className="px-4 py-2 border-1 border-gray-300">Max Listening</th>
            <th className="px-4 py-2 border-1 border-gray-300">Attained Reading</th>
            <th className="px-4 py-2 border-1 border-gray-300">Max Reading</th>
            <th className="px-4 py-2 border-1 border-gray-300">Attained Speaking</th>
            <th className="px-4 py-2 border-1 border-gray-300">Max Speaking</th>
            <th className="px-4 py-2 border-1 border-gray-300">Attained Writing</th>
            <th className="px-4 py-2 border-1 border-gray-300">Max Writing</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 bg-white  transition-colors"
            >
              <td className="px-4 py-2 border-1 border-gray-200">{row.ppId}</td>
              <td className="px-4 py-2 border-1 border-gray-200">{row.unitName}</td>
              <td className="px-4 py-2 border-1 border-gray-200">{row.unitId}</td>
              <td className="px-4 py-2 border-1 border-gray-200">{row.unitType}</td>
              <td className="px-4 py-2 border-1 border-gray-200">{row.listeningScore}</td>
              <td className="px-4 py-2 border-1 border-gray-200">{row.maxListeningScore}</td>
              <td className="px-4 py-2 border-1 border-gray-200">{row.readingScore}</td>
              <td className="px-4 py-2 border-1 border-gray-200">{row.maxReadingScore}</td>
              <td className="px-4 py-2 border-1 border-gray-200">{row.speakingScore}</td>
              <td className="px-4 py-2 border-1 border-gray-200">{row.maxSpeakingScore}</td>
              <td className="px-4 py-2 border-1 border-gray-200">{row.writingScore}</td>
              <td className="px-4 py-2 border-1 border-gray-200">{row.maxWritingScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MasterPpIdBinTable;
