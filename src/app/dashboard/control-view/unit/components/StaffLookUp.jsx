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
  {
    id: "S004",
    lastName: "Brown",
    firstName: "Michael",
    jobTitle: "Data Analyst",
    department: "Data Science",
    email: "michael.brown@company.com",
  },
  {
    id: "S005",
    lastName: "Taylor",
    firstName: "Olivia",
    jobTitle: "HR Specialist",
    department: "Human Resources",
    email: "olivia.taylor@company.com",
  },
  {
    id: "S006",
    lastName: "Lee",
    firstName: "Daniel",
    jobTitle: "Frontend Developer",
    department: "Engineering",
    email: "daniel.lee@company.com",
  },
  {
    id: "S007",
    lastName: "Martinez",
    firstName: "Sophia",
    jobTitle: "Marketing Executive",
    department: "Marketing",
    email: "sophia.martinez@company.com",
  },
  {
    id: "S008",
    lastName: "Harris",
    firstName: "William",
    jobTitle: "Finance Officer",
    department: "Finance",
    email: "william.harris@company.com",
  },
  {
    id: "S009",
    lastName: "Clark",
    firstName: "Emily",
    jobTitle: "QA Engineer",
    department: "Quality Assurance",
    email: "emily.clark@company.com",
  },
  {
    id: "S010",
    lastName: "Lewis",
    firstName: "Benjamin",
    jobTitle: "Backend Developer",
    department: "Engineering",
    email: "benjamin.lewis@company.com",
  },
  {
    id: "S011",
    lastName: "Walker",
    firstName: "Ava",
    jobTitle: "Business Analyst",
    department: "Operations",
    email: "ava.walker@company.com",
  },
  {
    id: "S012",
    lastName: "Young",
    firstName: "James",
    jobTitle: "UI Designer",
    department: "Design",
    email: "james.young@company.com",
  },
];


export default function StaffLookup({ onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredStaffs = SAMPLE_STAFFS.filter((staff) =>
    `${staff.firstName} ${staff.lastName} ${staff.jobTitle} ${staff.email} ${staff.department}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );


  const handleRowClick = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      if (selectedIds.length >= 3) return; // Max 3 selections
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSubmit = () => {
    const selectedStaff = SAMPLE_STAFFS.filter((staff) =>
      selectedIds.includes(staff.id)
    );
    onSelect(selectedStaff);
    onClose();
  };

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
                  onClick={() => handleRowClick(c.id)}
                  className={`cursor-pointer ${
                    selectedIds.includes(c.id)
                      ? "bg-gray-200"
                      : "hover:bg-gray-100"
                  }`}
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


        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-600">
            {selectedIds.length} / 3 selected
          </span>
          <button
            onClick={handleSubmit}
            disabled={selectedIds.length === 0}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-1 rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
