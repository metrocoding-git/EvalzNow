import React from "react";

const CompetencyAccountingTable = ({ data }) => {
  return (
    <div className="overflow-x-auto border-1 border-gray-200 shadow-sm">
      <table className="min-w-full table-auto text-sm text-left border-collapse">
        <thead className="bg-gray-100 text-gray-900">
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 border-1 border-gray-300">Master PP ID Callout</th>
            <th className="px-4 py-3 border-1 border-gray-300">Short Description</th>
            <th className="px-4 py-3 border-1 border-gray-300">Duration</th>
            <th className="px-4 py-3 border-1 border-gray-300">Critical Reference Date</th>
            <th className="px-4 py-3 border-1 border-gray-300">Missing Competencies</th>
            <th className="px-4 py-3 border-1 border-gray-300">Error</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {data.map((row, index) => (
            <tr key={index} className="border-t border-gray-100 hover:bg-gray-50 transition">
              <td className="px-4 py-2">{row.ppId}</td>
              <td className="px-4 py-2">{row.shortDescription}</td>
              <td className="px-4 py-2">{row.duration}</td>
              <td className="px-4 py-2">{row.criticalRefDate}</td>
              <td className="px-4 py-2">{row.missingCompetencies}</td>
              <td className="px-4 py-2">{row.error}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompetencyAccountingTable;
