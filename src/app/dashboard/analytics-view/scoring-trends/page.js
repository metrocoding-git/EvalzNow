"use client";
import { useState } from "react";
import {
  Plus,
  X,
  ShieldUser,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import SecondaryArea from "../components/SecondaryArea";
import PlotSelections from "./components/PlotSelections";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ScoringTrends() {
  const tabs = [
    { label: "Session", path: "/dashboard/analytics-view/scoring-trends" },
  ];

  const pathname = usePathname();
  const currentTab =
    tabs.find((tab) => pathname?.startsWith(tab.path))?.label || "Session";

  const [selectedSort, setSelectedSort] = useState("activateCandidateLevel");
  const [activeTab, setActiveTab] = useState(currentTab);
  const [showEdit, setShowEdit] = useState(true);
  const [showSecondary, setShowSecondary] = useState(true);
  const [ScoresOpen, setScoresOpen] = useState(false);
  const [openMenu, setopenMenu] = useState(true);
  const [sortKey, setSortKey] = useState("lastName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [activeCandidateId, setActiveCandidateId] = useState(null);

  const data = [
    { id: 1, firstName: "John", lastName: "Doe" },
    { id: 2, firstName: "Jane", lastName: "Smith" },
    { id: 3, firstName: "Bob", lastName: "Johnson" },
    { id: 4, firstName: "Alice", lastName: "Williams" },
    { id: 5, firstName: "Charlie", lastName: "Brown" },
    { id: 6, firstName: "David", lastName: "Jones" },
    { id: 7, firstName: "Eva", lastName: "Miller" },
    { id: 8, firstName: "Frank", lastName: "Davis" },
    { id: 9, firstName: "Grace", lastName: "Wilson" },
    { id: 10, firstName: "Henry", lastName: "Moore" },
  ];

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortKey === "id") {
      return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
    } else {
      const valA = a[sortKey].toLowerCase();
      const valB = b[sortKey].toLowerCase();
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
  });

  return (
    <div className="w-full flex flex-col">
      <div className="h-full flex flex-col overflow-hidden p-1 border-1 border-gray-800"> 
        {/* Active tab content */}
        <div className="flex-1 flex flex-col h-full overflow-auto bg-white border border-t-0 border-gray-300">
            {/* Main Content */}
            <div className="flex h-full overflow-hidden w-full">
              {/* Sidebar */}
              <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-gray-200 ">
                <div className="flex-grow border-2 border-gray-300 flex flex-col h-1/2">
                  {/* Header */}
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 grid grid-cols-3 text-gray-800 font-semibold text-sm">
                    <div
                      onClick={() => handleSort("lastName")}
                      className="cursor-pointer"
                    >
                      Last Name
                    </div>
                    <div
                      onClick={() => handleSort("firstName")}
                      className="cursor-pointer"
                    >
                      First Name
                    </div>
                    <div
                      onClick={() => handleSort("id")}
                      className="cursor-pointer"
                    >
                      Candidate ID
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <div className=" px-3 py-1">
                      <div
                        className="flex items-center cursor-pointer select-none hover:bg-gray-50 px-2 py-1"
                        onClick={() => setopenMenu(!openMenu)}
                      >
                        <span
                          className={`transition-transform duration-200 text-gray-600 mr-1 ${
                            openMenu ? "rotate-90" : "rotate-0"
                          }`}
                        >
                          ▶
                        </span>
                        <span
                          className={`text-md text-gray-600 ml-2 ${
                            openMenu ? "font-bold" : ""
                          }`}
                        >
                          Details
                        </span>
                      </div>

                      {openMenu && (
                        <>
                          <div className=" items-center justify-center  px-4 ">
                            <div className="border border-gray-200 p-1">
                              <span className="text-sm text-gray-400">
                                Unit Name: Unit 1
                              </span>
                              <br />
                              <span className="text-sm text-gray-400">
                                Unit ID: UA123
                              </span>
                              <br />
                              <span className="text-sm text-gray-400">
                                Unit Type: Group
                              </span>
                              <br />
                              <span className="text-sm text-gray-400">
                                Signature Profile: Signature 1
                              </span>
                            </div>
                          </div>
                          {/* Candidate Data */}
                          <div className="flex-1 overflow-auto px-4 py-2 space-y-1">
                            {sortedData.map((item) => (
                              <div
                                key={item.id}
                                className={`grid grid-cols-3 gap-2 items-center text-sm px-2 py-1 cursor-pointer
                                ${
                                  activeCandidateId === item.id
                                    ? "bg-blue-100 border-l-4 border-blue-400"
                                    : "hover:bg-gray-100"
                                }`}
                                onClick={() => {
                                  setShowEdit(true);
                                  setShowSecondary(true);
                                }}
                                onDoubleClick={() => {
                                  setScoresOpen(true);
                                  setActiveCandidateId(item.id);
                                }}
                              >
                                <span className="text-gray-800">
                                  {item.lastName}
                                </span>
                                <span className="text-gray-800">
                                  {item.firstName}
                                </span>
                                <span className="text-gray-600">{item.id}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Dropdown Content */}
                  </div>
                </div>

                {/* Secondary Input Area */}
                {showSecondary && (
                  <div className="h-1/2 overflow-auto my-2">
                    <SecondaryArea onClose={() => setShowSecondary(false)} />
                  </div>
                )}
              </div>

              {/* Right Panel */}
              <div className="w-6/12 lg:w-9/12 bg-white  flex flex-col border-2 h-full border-gray-200 p-1 ml-1">
                {ScoresOpen && <PlotSelections />}
              </div>
            </div>
    
         
        </div>
      </div>
    </div>
  );
}
