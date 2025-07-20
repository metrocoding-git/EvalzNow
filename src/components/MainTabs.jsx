"use client";
import { useState } from "react";
import clsx from "clsx";

const tabs = ["Model", "Session", "Components", "Materials"];

export default function MainTabs() {
  const [activeTab, setActiveTab] = useState("Model");

  return (
    <div className="border-b bg-gray-100 text-black">
      {/* Tab buttons */}
      <div className="flex px-2 pt-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-4 py-1 rounded-t-md text-sm font-medium",
              activeTab === tab
                ? "bg-white border border-b-0 border-gray-300"
                : "text-gray-600 hover:text-black"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <div className="bg-white border border-t-0 border-gray-300 overflow-auto">
        {activeTab === "Model" }
        {activeTab === "Session" }
        {activeTab === "Components" }
        {activeTab === "Materials"}
      </div>
    </div>
  );
}
