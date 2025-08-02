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
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DataExtractions() {
  const tabs = [
    { label: "Session", path: "/dashboard/analytics-view/unit-distributions" },
  ];

  const pathname = usePathname();
  const currentTab =
    tabs.find((tab) => pathname?.startsWith(tab.path))?.label || "Session";

  const [activeTab, setActiveTab] = useState(currentTab);

  const [showEdit, setShowEdit] = useState(false);
  const [showSecondary, setShowSecondary] = useState(true);

  const [open, setOpen] = useState(false);
  const [RightPanelOpen, setRightPanelOpen] = useState(false);
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
  const [openMenu, setopenMenu] = useState(true);
  const [sortKey, setSortKey] = useState("lastName");
  const [sortOrder, setSortOrder] = useState("asc");

  const sortedData = [...data].sort((a, b) => {
  let valA = a[sortKey];
  let valB = b[sortKey];

  if (sortKey === "id") {
    // Numeric comparison
    return sortOrder === "asc" ? valA - valB : valB - valA;
  } else {
    // String comparison (case insensitive)
    valA = valA.toString().toLowerCase();
    valB = valB.toString().toLowerCase();
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  }
});


  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

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
        </div>
        {/* Active tab content */}
        <div className="flex-1 overflow-auto bg-white border border-t-0 border-gray-300 p-1">
          <div className="flex flex-col h-full">
            {/* Main Content */}
            <div className="flex h-full overflow-hidden w-full">
              {/* Sidebar */}
              <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1">
                <div className="flex-grow border-2 border-blue-500 rounded-md flex flex-col h-2/4">
                  {/* Header */}
                  <div className=" bg-blue-100 px-4 py-2 border-b border-blue-300">
                    {/* Table Header */}
                    <div className="grid grid-cols-3 gap-2 text-blue-800 font-semibold text-sm w-full">
                      <div
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => handleSort("lastName")}
                      >
                        Last Name
                        {sortKey === "lastName" ? (
                          sortOrder === "asc" ? (
                            <ChevronUp className="w-4 h-4 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-blue-600" />
                          )
                        ) : (
                          // Show default (e.g., down) when not sorted
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>

                      <div
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => handleSort("firstName")}
                      >
                        First Name
                        {sortKey === "firstName" ? (
                          sortOrder === "asc" ? (
                            <ChevronUp className="w-4 h-4 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-blue-600" />
                          )
                        ) : (
                          // Show default (e.g., down) when not sorted
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>

                      <div
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => handleSort("id")}
                      >
                        ID
                        {sortKey === "id" ? (
                          sortOrder === "asc" ? (
                            <ChevronUp className="w-4 h-4 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-blue-600" />
                          )
                        ) : (
                          // Show default (e.g., down) when not sorted
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto">
                    <div className="px-3 py-1">
                      <div
                        className="flex items-center cursor-pointer select-none hover:bg-blue-50 rounded-md px-2 py-1"
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
                          Sessions
                        </span>
                      </div>

                      {openMenu && (
                        <>
                          <div className="px-4 py-2 border border-blue-200 rounded-lg mb-2">
                            <p className="text-sm text-gray-400">
                              Unit Name: Unit 1
                            </p>
                            <p className="text-sm text-gray-400">
                              Unit ID: UA123
                            </p>
                            <p className="text-sm text-gray-400">
                              Unit Type: Group
                            </p>
                            <p className="text-sm text-gray-400">
                              Signature Profile: Signature 1
                            </p>
                          </div>

                          {/* Candidate List */}
                          <div className="space-y-1 px-4">
                            {sortedData.map((item) => (
                              <div
                                key={item.id}
                                className={`grid grid-cols-3 gap-2 items-center text-sm rounded-md px-2 py-1 cursor-pointer
      ${activeCandidateId === item.id ? "bg-blue-200" : "hover:bg-blue-50"}`}
                                onClick={() => {
                                  setShowEdit(true);
                                  setShowSecondary(true);
                                }}
                                onDoubleClick={() => {
                                  setRightPanelOpen(true);
                                  setActiveCandidateId(item.id);
                                }}
                              >
                                <span className="text-gray-800">
                                  {item.lastName}
                                </span>
                                <span className="text-gray-800">
                                  {item.firstName}
                                </span>
                                <span>{item.id}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              {RightPanelOpen && (
                <div className="w-6/12 lg:w-9/12 bg-white flex flex-col border-2 h-full border-blue-200 rounded-md p-1 ml-1">
                  <div className="flex-1 h-full bg-white shadow-md rounded-2xl p-6 overflow-y-auto">
                    {/* Report Extraction Options */}
                    <div className="space-y-4">
                      <p className="text-base font-semibold text-gray-800 leading-relaxed">
                        EvalzNow – Human Capital & Education Quantitative and
                        Qualitative Assessment Hybrid Proficiency & Growth
                        Monitoring <br />
                        <span className="text-sm font-medium">
                          Candidate & Unit Report Generation
                        </span>
                      </p>

                      <div className="space-y-3 text-sm">
                        {[
                          {
                            id: "candidate-report",
                            label:
                              "Extract Candidate Report for the Active Candidate",
                          },
                          {
                            id: "all-candidates-unit",
                            label:
                              "Extract All Candidate Reports for the Active Unit",
                          },
                          {
                            id: "unit-report",
                            label: "Extract Unit Report for the Active Unit",
                          },
                          {
                            id: "all-units",
                            label: "Extract All Unit Reports",
                          },
                          {
                            id: "global-data",
                            label: "Extract Global Data Report",
                          },
                        ].map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2"
                          >
                            <input
                              id={item.id}
                              type="radio"
                              name="reportOption"
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor={item.id} className="text-gray-800">
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>

                      <button
                        type="submit"
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition"
                      >
                        Extract
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
