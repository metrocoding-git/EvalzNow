"use client";
import { useState } from "react";

export default function TopRibbon() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: "Files" },
    { label: "Edit" },
    { label: "Sketch" },
    { label: "Topology" },
    { label: "Assembly" },
    { label: "Connectors" },
    { label: "Morph" },
    { label: "Model" },
    { label: "Validate" },
    { label: "Analyze" },
    { label: "Optimize" },

  ];

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  return (
    <div className="w-full bg-white border-b shadow-sm px-1 py-1 flex items-center gap-2 text-sm font-medium">
      {tabs.map((tab, i) => (
        <div
          key={i}
          onClick={() => handleTabClick(i)}
          className={`flex items-center gap-1 cursor-pointer px-1 py-2 rounded-md transition-all duration-200 ${
            activeTab === i
              ? 'bg-blue-100 text-blue-600 border border-blue-200 shadow-sm'
              : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
          }`}
        >
          <span className="text-sm"></span>
          {tab.label}
        </div>
      ))}
    </div>
  );
}
