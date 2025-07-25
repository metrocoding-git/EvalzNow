"use client";
import { Children, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";


const tabs = [
  { label: "Admin", path: "/dashboard/control-view/admin" },
  { label: "Staff", path: "/dashboard/control-view/staff" },
  { label: "Candidate", path: "/dashboard/control-view/candidate" },
  { label: "Unit", path: "/dashboard/control-view/unit" }
];

export default function ControlViewLayout({ children }) {
  const pathname = usePathname();
  const currentTab = tabs.find(tab => pathname?.startsWith(tab.path))?.label || "Admin";

  const [activeTab, setActiveTab] = useState(currentTab);

  return (
    <div className="w-full flex flex-col">
      <div className="h-full flex flex-col overflow-hidden m-1 p-1 border-1 border-gray-800 rounded-md">

        {/* Tab buttons */}
        <div className="flex space-x-0 px-0 pt-2 border-b border-gray-200 bg-gray-50 ">
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

        {/* Active tab content */}
        <div className="flex-1 overflow-auto bg-white border border-t-0 border-gray-300 p-1">
          <div className="flex flex-col h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
