import React from "react";

const CompetencyAccountingTable = ({ data }) => {
  return (
    <div className="overflow-x-auto border-2 border-blue-200 rounded-md shadow-sm">
      <table className="min-w-full table-auto text-sm text-left border-collapse">
        <thead className="bg-blue-100 text-blue-900">
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3">Master PP ID Callout</th>
            <th className="px-4 py-3">Short Description</th>
            <th className="px-4 py-3">Duration</th>
            <th className="px-4 py-3">Critical Reference Date</th>
            <th className="px-4 py-3">Missing Competencies</th>
            <th className="px-4 py-3">Error</th>
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
