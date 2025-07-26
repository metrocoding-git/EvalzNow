import { useState } from "react";

export default function PropertyEditorTabs() {
  const [activeTab, setActiveTab] = useState("Property Editor");

  return (
    <div className="border-2 border-blue-500 rounded-md flex flex-col">
      <div className="flex border-b border-blue-300 bg-blue-100 rounded-t-md">
        {["Property Editor", "Tables"].map((tab) => (
          <button
            key={tab}
            className={`flex-1 px-4 py-2 text-sm text-blue-800 font-semibold hover:bg-blue-200 transition ${
              activeTab === tab ? "bg-white border-l border-r border-blue-300 -mb-px" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-3 text-xs text-gray-800 bg-white rounded-b-md">
        {activeTab === "Property Editor" ? (
          <ul className="list-disc pl-4 space-y-1">
            <li>Zoom, rotate, translate the unit cube (3D)</li>
            <li>Fixed XYZ scale: [0,1] with 0.1 increment</li>
            <li>Toggle interaction lines/surfaces ON/OFF</li>
            <li>Toggle gridlines ON/OFF</li>
            <li>Change curve color</li>
            <li>Change plane/surface colors</li>
            <li>Replace XYZ coordinate labels</li>
          </ul>
        ) : (
          <p>Shows data plotted on the X/Y/Z axes.</p>
        )}
      </div>
    </div>
  );
}
