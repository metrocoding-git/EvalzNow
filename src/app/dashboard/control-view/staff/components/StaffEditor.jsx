import React,{ useState, useEffect } from "react";
import { Edit } from "lucide-react";

const accessLevels = [
  "Full Access",
  "Leaders Access",
];

const accountStatuses = ["Enabled", "Disabled"];

const StaffEditor = ({ onClose, showForm, staff }) => {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (staff) {
      setForm({
        "Last Name": staff.lastName || "",
        "First Name": staff.firstName || "",
        "Job Title": staff.jobTitle || "",
        "Department": staff.department || "",
        "Date of Birth": staff.dob || "",
        "Date of Employment": staff.doe || "",
        "Staff No.": staff.id || "",
        "Contact Number": staff.phone || "",
        "Company E-mail Address": staff.email || "",
        "Access Level": staff.accessLevel || accessLevels[0],
        "Account Status": staff.status || accountStatuses[0],
      });
    }
  }, [staff]);

  const handleChange = (label, value) => {
    setForm((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

 return (
  <div className="border border-gray-300 flex flex-col h-full">
    {/* Header */}
    <div className="flex items-center bg-gray-100 px-4 py-1 border-b border-gray-300">
      <div className="flex items-center gap-2 text-gray-800 font-semibold">
        <Edit className="w-5 h-5" />
        Entity Editor
      </div>
    </div>

    {!staff ? (
      <div className="flex-1 flex items-center justify-center p-4 text-gray-500 text-sm"></div>
    ) : showForm ? (
      <form className="p-2 text-xs grid grid-cols-2 gap-1 overflow-y-auto">
        {/* Text Inputs */}
        {[
          "Last Name",
          "First Name",
          "Job Title",
          "Department",
          "Date of Birth",
          "Date of Employment",
          "Staff ID",
          "Contact Number",
          "Company E-mail Address",
        ].map((label, idx) => (
          <React.Fragment key={idx}>
            <label className="flex items-center text-gray-700">
              {label}:
            </label>
            <input
              type={label.includes("Date") ? "date" : "text"}
              className="border border-gray-300 px-2 py-1 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={form[label] || ""}
              onChange={(e) => handleChange(label, e.target.value)}
            />
          </React.Fragment>
        ))}

        {/* Dropdowns */}
        <label className="flex items-center text-gray-700">
          Access Level:
        </label>
        <select
          className="border border-gray-300 px-2 py-1 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
          value={form["Access Level"]}
          onChange={(e) => handleChange("Access Level", e.target.value)}
        >
          {accessLevels.map((level, i) => (
            <option key={i} value={level}>
              {level}
            </option>
          ))}
        </select>

        <label className="flex items-center text-gray-700">
          Account Status:
        </label>
        <select
          className="border border-gray-300 px-2 py-1 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
          value={form["Account Status"]}
          onChange={(e) => handleChange("Account Status", e.target.value)}
        >
          {accountStatuses.map((status, i) => (
            <option key={i} value={status}>
              {status}
            </option>
          ))}
        </select>

        {/* Buttons */}
        <div className="col-span-2 pt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 bg-gray-200 hover:bg-gray-300 text-xs"
          >
            Edit
          </button>
        </div>
      </form>
    ) : (
      <div className="p-4 text-gray-500 text-sm">No form to display.</div>
    )}
  </div>
);

};

export default StaffEditor;
