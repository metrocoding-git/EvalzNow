"use client";
import { Children, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Session", path: "/dashboard/analytics-view" },
];

export default function SetupViewLayout({ children }) {
  const pathname = usePathname();
  const currentTab = tabs.find(tab => pathname?.startsWith(tab.path))?.label || "Session";

  const [selectedSort, setSelectedSort] = useState("Activates in Analytics View");


  const [activeTab, setActiveTab] = useState(currentTab);

  return (
    <div className="w-full flex flex-col">
      <div className="h-full flex flex-col overflow-hidden m-1 p-1 border-1 border-gray-800 rounded-md">

        {/* Tab buttons */}
        <div className="flex space-x-0 px-0 pt-2 border-b border-gray-200 bg-gray-50 ">
          <div className="w-6/12 lg:w-3/12 flex flex-col border-r-2 h-full border-gray-200  p-1">
            {tabs.map((tab, index) => (
              <Link href={tab.path} key={index}>
                <span
                  onClick={() => setActiveTab(tab.label)}
                  className={
                    `relative px-5 py-2 text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer ` +
                    (activeTab === tab.label
                      ? "text-blue-600 bg-white border border-b-transparent border-gray-300 rounded-t-lg shadow-sm"
                      : "text-gray-500 hover:text-blue-600 border-t border-r border-b-transparent border-gray-300 rounded-t-lg hover:bg-white")
                  }



                >
                  {tab.label}
                </span>
              </Link>
            ))}
          </div>
          <div className="w-6/12 lg:w-9/12 flex flex-col border-l-2 h-full border-gray-200  p-1">
            <div className="flex justify-start items-center space-x-2 px-4">
              <select
                id="sorter"
                name="sorter"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="Activates in Analytics View">Activates in Analytics View</option>
                <option value="shown for plots with multiple levels">shown for plots with multiple levels</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active tab content */}
        <div className="flex-1 overflow-auto bg-white border border-t-0 border-gray-300 p-1">
          <div className="flex flex-col h-full">
            {children}
          </div>
        </div>
      </div>
    </div >
  );
}
