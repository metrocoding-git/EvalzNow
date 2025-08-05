"use client";
import { useState } from "react";
import { Plus, X, ShieldUser, ChevronRight } from "lucide-react";
import ClientEditor from "./components/ClientEditor";
import SecondaryArea from "./components/SecondaryArea";
import PlotSelections from "./components/PlotSelections";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AnalyticsView() {
  const tabs = [{ label: "Session", path: "/dashboard/analytics-view" }];

  const pathname = usePathname();
  const currentTab =
    tabs.find((tab) => pathname?.startsWith(tab.path))?.label || "Session";

  const [selectedSort, setSelectedSort] = useState("activateCandidateLevel");

  const [activeTab, setActiveTab] = useState(currentTab);

  const [showEdit, setShowEdit] = useState(false);
  const [showSecondary, setShowSecondary] = useState(true);

  const [selectedEntity, setSelectedEntity] = useState(null);
  const [ScoresOpen, setScoresOpen] = useState(false);
  const [showSorter, setShowSorter] = useState(false);

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

  return (
    <div className="w-full flex flex-col">
      <div className="h-full flex flex-col overflow-hidden  border-1 border-gray-600 ">
        {/* Tab buttons */}
        <div className="flex space-x-0  border-b border-gray-200 bg-gray-50 ">
          <div className="w-6/12 lg:w-80 flex flex-col border-r-2 h-full border-gray-200 ">
            {tabs.map((tab, index) => (
              <Link href={tab.path} key={index}>
                <span
                  onClick={() => setActiveTab(tab.label)}
                  className={
                    `relative px-5 py-2 text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer ` +
                    (activeTab === tab.label
                      ? "text-gray-600 bg-white border border-b-transparent border-gray-300 shadow-sm"
                      : "text-gray-500 hover:text-gray-600 border-t border-r border-b-transparent border-gray-300 hover:bg-white")
                  }
                >
                  {tab.label}
                </span>
              </Link>
            ))}
          </div>
          <div className="w-6/12 lg:w-9/12 flex flex-col border-l-1 h-full border-gray-200  p-1">
            <div
              className="flex justify-start items-center space-x-2 px-4"
            >
              {showSorter && (
                <select
                  id="sorter"
                  name="sorter"
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  onBlur={() => setShowSorter(false)} // Hide on blur
                  className="border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="activateCandidateLevel">
                    Activate Candidate Level
                  </option>
                  <option value="activateUnitLevel">Activate Unit Level</option>
                </select>
              )}
            </div>
          </div>
        </div>
        {/* Active tab content */}
        <div className="flex-1 overflow-auto bg-white border border-t-0 border-gray-300 ">
          <div className="flex flex-col h-full">
            {/* Main Content */}
            <div className="flex h-full overflow-hidden w-full">
              {/* Sidebar */}
              <div className="w-6/12 lg:w-80 flex flex-col border-1 h-full border-gray-200 ">
                <div className="flex-grow border-2 border-gray-300 flex flex-col h-2/4">
                  {/* Header */}
                  <div className="flex justify-between items-center bg-gray-100 px-4 py-2 border-b border-gray-300">
                    <span className="grid grid-cols-3 gap-6 pl-2 text-gray-800 font-semibold text-sm">
                      <div>First Name</div>
                      <div>Last Name</div>
                      <div>ID</div>
                    </span>
                  </div>

                  <div className="flex-1 overflow-auto">
                    <div className=" px-3 py-1">
                      <div
                        className="flex items-center cursor-pointer select-none hover:bg-gray-50 rounded-md px-2 py-1"
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
                          <div className=" items-center justify-center  px-4 ">
                            <div className="border border-gray-200 p-1 rounded-lg">
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
                          <div className="space-y-1 mt-2 px-4">
                            {data.map((item, index) => (
                              <div key={item.id}>
                                {/* Entity Header */}
                                <div
                                  className="grid grid-cols-3 items-center justify-between hover:bg-gray-50 p-1 rounded-md cursor-pointer"
                                  onClick={() => {
                                    setShowEdit(true);
                                    setShowSecondary(true);
                                  }}
                                  onDoubleClick={() => {
                                    setScoresOpen(true);
                                    setShowSorter(true);
                                  }}
                                >
                                  <div>{item.firstName}</div>
                                  <div>{item.lastName}</div>
                                  <div> {item.id}</div>
                                </div>
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
                  <div className="h-1/4 overflow-auto my-2">
                    <SecondaryArea onClose={() => setShowSecondary(false)} />
                  </div>
                )}

                {/* Editor */}
                  <div className="h-1/4 overflow-auto my-2">
                    <ClientEditor
                      onClose={() => setShowEdit(false)}
                      entity={selectedEntity}
                    />
                  </div>
            
              </div>

              {/* Right Panel */}
              <div className="w-6/12 lg:w-9/12 bg-white  flex flex-col border-2 h-full border-gray-200 rounded-md p-1 ml-1">
                {ScoresOpen && <PlotSelections />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
