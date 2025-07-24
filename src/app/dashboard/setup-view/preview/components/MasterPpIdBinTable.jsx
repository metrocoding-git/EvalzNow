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
    <div className="overflow-x-auto border-2 border-blue-200 rounded-md shadow-sm">
      <table className="min-w-full table-auto text-sm text-left border-collapse">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            <th className="px-4 py-2 border-b border-blue-300">Master PP ID Callout</th>
            <th className="px-4 py-2 border-b border-blue-300">Unit Name</th>
            <th className="px-4 py-2 border-b border-blue-300">Unit ID</th>
            <th className="px-4 py-2 border-b border-blue-300">Unit Type</th>
            <th className="px-4 py-2 border-b border-blue-300">Attained Listening</th>
            <th className="px-4 py-2 border-b border-blue-300">Max Listening</th>
            <th className="px-4 py-2 border-b border-blue-300">Attained Reading</th>
            <th className="px-4 py-2 border-b border-blue-300">Max Reading</th>
            <th className="px-4 py-2 border-b border-blue-300">Attained Speaking</th>
            <th className="px-4 py-2 border-b border-blue-300">Max Speaking</th>
            <th className="px-4 py-2 border-b border-blue-300">Attained Writing</th>
            <th className="px-4 py-2 border-b border-blue-300">Max Writing</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr
              key={index}
              className="hover:bg-blue-50 even:bg-white odd:bg-blue-50/30 transition-colors"
            >
              <td className="px-4 py-2 border-b border-blue-100">{row.ppId}</td>
              <td className="px-4 py-2 border-b border-blue-100">{row.unitName}</td>
              <td className="px-4 py-2 border-b border-blue-100">{row.unitId}</td>
              <td className="px-4 py-2 border-b border-blue-100">{row.unitType}</td>
              <td className="px-4 py-2 border-b border-blue-100">{row.listeningScore}</td>
              <td className="px-4 py-2 border-b border-blue-100">{row.maxListeningScore}</td>
              <td className="px-4 py-2 border-b border-blue-100">{row.readingScore}</td>
              <td className="px-4 py-2 border-b border-blue-100">{row.maxReadingScore}</td>
              <td className="px-4 py-2 border-b border-blue-100">{row.speakingScore}</td>
              <td className="px-4 py-2 border-b border-blue-100">{row.maxSpeakingScore}</td>
              <td className="px-4 py-2 border-b border-blue-100">{row.writingScore}</td>
              <td className="px-4 py-2 border-b border-blue-100">{row.maxWritingScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MasterPpIdBinTable;
