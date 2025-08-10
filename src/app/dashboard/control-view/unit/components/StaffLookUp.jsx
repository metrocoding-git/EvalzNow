import React, { useState } from "react";
import { X } from "lucide-react";

const SAMPLE_STAFFS = [
  {
    id: "S001",
    lastName: "Doe",
    firstName: "John",
    jobTitle: "Software Engineer",
    department: "Engineering",
    email: "john.doe@company.com",
  },
  {
    id: "S002",
    lastName: "Smith",
    firstName: "Jane",
    jobTitle: "Project Manager",
    department: "Operations",
    email: "jane.smith@company.com",
  },
  {
    id: "S003",
    lastName: "Johnson",
    firstName: "Alice",
    jobTitle: "UX Designer",
    department: "Design",
    email: "alice.johnson@company.com",
  },
];

export default function StaffLookup({ onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStaffs = SAMPLE_STAFFS.filter((staff) =>
    `${staff.firstName} ${staff.lastName} ${staff.jobTitle} ${staff.email} ${staff.department}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/0 backdrop-blur-xs flex justify-center items-center z-50">
      <div className="bg-white p-4 w-[600px] border shadow-2xl border-gray-200">        <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Staff Lookup</h2>
        <button onClick={onClose} className="cursor-pointer">
          <X className="w-5 h-5 text-gray-700" />
        </button>
      </div>

        <input
          type="text"
          placeholder="Search Staff..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 w-full mb-3 text-sm"
        />

        <table className="w-full border text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-1">Last Name</th>
              <th className="border p-1">First Name</th>
              <th className="border p-1">Job Title</th>
              <th className="border p-1">Department</th>
              <th className="border p-1">Company E-mail Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaffs.map((c) => (
              <tr
                key={c.id}
                onClick={() => {
                  onSelect(c);
                }}
                className="hover:bg-gray-100 cursor-pointer"
              >
                <td className="border p-1">{c.lastName}</td>
                <td className="border p-1">{c.firstName}</td>
                <td className="border p-1">{c.jobTitle}</td>
                <td className="border p-1">{c.department}</td>
                <td className="border p-1">{c.email}</td>
              </tr>
            ))}
            {filteredStaffs.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-2 text-gray-500">
                  No matching candidates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
