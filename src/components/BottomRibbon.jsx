"use client";
import { useState } from "react";
import RibbonPanel from "./RibbonPanel";
import { Copy, Edit3, FilePlus, Import, Save, Trash2, Upload } from "lucide-react";

export default function BottomRibbon() {
  const [activeTab, setActiveTab] = useState(0);

  const tabItems = [
    { icon: <FilePlus />, label: 'New' },
    { icon: <Edit3 />, label: 'Edit' },
    { icon: <Trash2 />, label: 'Delete' },
    { icon: <Import />, label: 'Import' },
    { icon: <Upload />, label: 'Upload' },
    { icon: <Save />, label: 'Save' },
    { icon: <Copy />, label: 'Copy' },
  ]

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  return (
    <div className="w-full bg-gray-200  shadow-sm text-sm font-medium border-1 border-black mt-1">
      {/* Tabs row */}
      <div className="w-full bg-gray-50 border-b px-2 py-2 flex gap-1 my-1">
        {tabItems.map((tab, i) => (
          // <div
          //   key={i}
          //   onClick={() => handleTabClick(i)}
          //   className={`cursor-pointer px-2 py-2 rounded-md transition-all ${activeTab === i
          //     ? "bg-blue-100 text-blue-600 border border-blue-200 shadow-sm"
          //     : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
          //     }`}
          // >
          //   {tab.label}
          // </div>

          <div
            key={i}
            onClick={() => handleTabClick(i)}
            className={`group flex flex-col justify-center items-center px-1 py-1  h-16 w-24 p-3  mx-1 rounded-md cursor-pointer shadow-md hover:shadow-md hover:bg-blue-50 transition-all duration-200 ease-in-out ${activeTab === i
              ? "bg-blue-100 text-blue-600 border border-blue-200 shadow-sm"
              : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              }`}
          >
            <div className="mb-1">
              {tab.icon}
            </div>
            <div className="text-xs text-gray-700 group-hover:text-blue-800 text-center hover:font-bold">
              {tab.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
