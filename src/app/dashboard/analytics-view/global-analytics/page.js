"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, ShieldUser } from "lucide-react";
import SecondaryArea from "../components/SecondaryArea";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ClientEditor from "../components/ClientEditor";
import CurveEditor from "./components/CurveEditor";

export default function GlobalAnalytics() {
  const tabs = [
    { label: "Session", path: "/dashboard/analytics-view/unit-distributions" },
  ];
  const pathname = usePathname();
  const currentTab =
    tabs.find((tab) => pathname?.startsWith(tab.path))?.label || "Session";

  const [activeTab, setActiveTab] = useState(currentTab);
  const [showEdit, setShowEdit] = useState(false);
  const [showSecondary, setShowSecondary] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [openMenu, setopenMenu] = useState(true);
  const [ScoresOpen, setScoresOpen] = useState(false);
  const [activeCandidateId, setActiveCandidateId] = useState(null);
  const [sortKey, setSortKey] = useState("lastName");
  const [sortOrder, setSortOrder] = useState("asc");

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

  const sortedData = [...data].sort((a, b) => {
    if (sortKey === "id") {
      return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
    } else {
      const valA = a[sortKey].toLowerCase();
      const valB = b[sortKey].toLowerCase();
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
        {/* Tabs */}
        <div className="flex space-x-0 px-0 pt-2 border-b border-gray-200 bg-gray-50">
          <div className="w-6/12 lg:w-3/12 flex flex-col border-r-2 h-full border-gray-200 p-1">
            {tabs.map((tab, index) => (
              <Link href={tab.path} key={index}>
                <span
                  onClick={() => setActiveTab(tab.label)}
                  className={`relative px-5 py-2 text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer ${
                    activeTab === tab.label
                      ? "text-blue-600 bg-white border border-b-transparent border-gray-300 rounded-t-lg shadow-sm"
                      : "text-gray-500 hover:text-blue-600 border-t border-r border-b-transparent border-gray-300 rounded-t-lg hover:bg-white"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-white border border-t-0 border-gray-300 p-1">
          <div className="flex h-full overflow-hidden w-full">
            {/* Sidebar */}
            <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1">
              <div className="flex-grow border-2 border-blue-500 rounded-md flex flex-col h-2/4">
                {/* Header */}
                <div className="bg-blue-100 px-4 py-2 border-b border-blue-300 grid grid-cols-3 text-blue-800 font-semibold text-sm">
                  <div
                    onClick={() => handleSort("lastName")}
                    className="cursor-pointer flex items-center gap-1"
                  >
                    Last Name{" "}
                    {sortKey === "lastName" ? (
                      sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div
                    onClick={() => handleSort("firstName")}
                    className="cursor-pointer flex items-center gap-1"
                  >
                    First Name{" "}
                    {sortKey === "firstName" ? (
                      sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div
                    onClick={() => handleSort("id")}
                    className="cursor-pointer flex items-center gap-1"
                  >
                    ID{" "}
                    {sortKey === "id" ? (
                      sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Candidate Data */}
                <div className="flex-1 overflow-auto px-4 py-2 space-y-1">
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
                        setScoresOpen(true);
                        setActiveCandidateId(item.id);
                      }}
                    >
                      <span className="text-gray-800">{item.lastName}</span>
                      <span className="text-gray-800">{item.firstName}</span>
                      <span className="text-gray-600">{item.id}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secondary Area */}
              {showSecondary && (
                <div className="h-1/4 overflow-auto my-2">
                  <SecondaryArea onClose={() => setShowSecondary(false)} />
                </div>
              )}

              {/* Editor */}
              <div className="h-1/4 overflow-auto my-2">
                <ClientEditor
                  onClose={() => setShowEdit(false)}
                  client={true}
                  showForm={showEdit}
                />
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-6/12 lg:w-9/12 bg-white flex flex-col border-2 h-full border-blue-200 rounded-md p-1 ml-1">
              {ScoresOpen && <CurveEditor />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
