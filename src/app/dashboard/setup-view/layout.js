"use client";
import { Children, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Insert Scores", path: "/dashboard/setup-view/insert-scores" },
  { label: "Preview", path: "/dashboard/setup-view/preview" },
];

export default function SetupViewLayout({ children }) {
  const pathname = usePathname();
  const currentTab = tabs.find(tab => pathname?.startsWith(tab.path))?.label || "Insert Scores";

  const [activeTab, setActiveTab] = useState(currentTab);

  return (
    <div className="w-full flex flex-col">
      <div className="h-full flex flex-col overflow-hidden m-0.5 border-1 border-gray-800 ">

        {/* Tab buttons */}
        <div className="flex space-x-0 px-0 pt-0.5 border-b border-gray-200 bg-gray-100 ">
          {tabs.map((tab, index) => (
            <Link href={tab.path} key={index}>
              <span
                onClick={() => setActiveTab(tab.label)}
                className={
                  `relative px-5 py-1 text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer ` +
                  (activeTab === tab.label
                    ? "text-gray-800 bg-white border-t-2 border-blue-400  shadow-sm"
                    : "text-gray-600 hover:text-gray-600 border-t border-r border-b-transparent border-gray-300 hover:bg-gray-50")
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
