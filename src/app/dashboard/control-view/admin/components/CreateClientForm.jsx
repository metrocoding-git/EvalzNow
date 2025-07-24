"use client";
import { Edit, ListFilterPlus, X } from "lucide-react";
import { useState } from "react";

const fields = [
  { label: "Solver Keyword:", value: "MAT1", type: "text", disabled: true },
  { label: "Name:", value: "material1", type: "text" },
  { label: "ID:", value: "1", type: "text" },
  { label: "Color:", type: "color" },
  { label: "Include:", type: "select", options: ["[Main Model]"] },
  { label: "Defined:", type: "checkbox" },
  { label: "Card Image:", type: "select", options: ["MAT1"] },
  { label: "User Comments:", type: "select", options: ["Hide In Menu/Export"] },
  { label: "E:", type: "text" },
  { label: "G:", type: "text" },
  { label: "NU:", type: "text" },
  { label: "RHO:", type: "text" },
  { label: "A:", type: "text" },
  { label: "TREF:", type: "text" },
  { label: "GE:", type: "text" },
  { label: "ST:", type: "text" },
  { label: "SC:", type: "text" },
  { label: "SS:", type: "text" },
];

const checkboxFields = [
  "MODULI",
  "RAYL",
  "MATS1",
  "MAT1",
  "MAT4",
  "MAT5",
  "MATFT",
  "MATX",
  "MATVP",
  "MATVE",
  "MATVF",
  "MATC",
  "MICRON",
  "MATVEC",
];

export default function CreateClientForm({ onClose }) {
  const [form, setForm] = useState({});

  const handleChange = (label, value) => {
    setForm((prev) => ({ ...prev, [label]: value }));
  };

  return (
    <div className=" bg-gray-50 text-black border shadow-lg rounded  overflow-y-auto z-50 m-4">

      <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
        <div className="flex items-center gap-2 text-blue-800 font-semibold">
          <ListFilterPlus className="w-5 h-5" />
          CREATE CLIENT
        </div>
        <button onClick={onClose}  className="text-red-500 hover:text-red-700 text-sm hover:bg-red-100 rounded-full p-1 cursor-pointer">
          <X className="w-4 h-4 " />
        </button>
      </div>
      <div className="p-3">
        <div className="text-xs p-3">
          {fields.map(
            ({ label, type, value = "", options = [], disabled }, idx) => (
              <div key={idx} className="flex items-center mb-2">
                <label className="w-32 pr-2 text-left text-gray-700">
                  {label}
                </label>
                {type === "text" && (
                  <input
                    type="text"
                    defaultValue={value}
                    disabled={disabled}
                    className="flex-1 border px-2 py-0.5 rounded bg-white"
                  />
                )}
                {type === "color" && (
                  <input
                    type="color"
                    className="w-8 h-6"
                    onChange={(e) => handleChange(label, e.target.value)}
                  />
                )}
                {type === "select" && (
                  <select className="flex-1 border px-2 py-1 rounded">
                    {options.map((opt, i) => (
                      <option key={i}>{opt}</option>
                    ))}
                  </select>
                )}
                {type === "checkbox" && (
                  <input type="checkbox" className="w-5 h-5" />
                )}
              </div>
            )
          )}

          {/* Checkbox grid */}
          <div className="mt-4">
            {checkboxFields.map((field, idx) => (
              <div key={idx} className="flex items-center mb-1">
                <label className="w-32 pr-2 text-left text-gray-700">
                  {field}:
                </label>
                <input type="checkbox" className="w-5 h-5" />
              </div>
            ))}
          </div>

          {/* Collapsible section */}
          <div className="mt-4 border-t pt-2">
            <h3 className="font-semibold mb-2 text-gray-800">Library Data</h3>
            <div className="flex items-center mb-2">
              <label className="w-32 pr-2 text-right text-gray-700">
                Revision:
              </label>
              <input type="text" className="flex-1 border px-2 py-1 rounded" />
            </div>
          </div>
        </div>

        <div className="flex flex-row-reverse gap-2">
          <button
            onClick={() => onClose()}
            className="px-4 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Close
          </button>
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-blue-600 text-white border border-blue-700 rounded hover:bg-blue-700 flex items-center gap-1"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
