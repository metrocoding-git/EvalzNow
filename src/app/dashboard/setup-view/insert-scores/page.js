"use client";
import { useState, useMemo } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import ClientEditor from "../../control-view/admin/components/ClientEditor";
import CompetencyAccounting from "./components/CompetencyAccounting";

export default function EntitiesManager() {
  const [showEdit, setShowEdit] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [ScoresOpen, setScoresOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(true);
  const [activeCandidateId, setActiveCandidateId] = useState(null);
  const [sortColumn, setSortColumn] = useState("lastName");
  const [sortDirection, setSortDirection] = useState("asc"); // or 'desc'

  const data = useMemo(()=>[
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
  ], []);

const sortedData = useMemo(() => {
  const sorted = [...data].sort((a, b) => {
    const valA = a[sortColumn];
    const valB = b[sortColumn];

    if (typeof valA === "string" && typeof valB === "string") {
      const aStr = valA.toLowerCase();
      const bStr = valB.toLowerCase();
      if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }

    // Numeric comparison
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
  return sorted;
}, [data, sortColumn, sortDirection]);


  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1">
        <div className="flex-grow border-2 border-blue-500 rounded-md flex flex-col h-3/5">
          {/* Header */}
          <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
            <div className="grid grid-cols-3 gap-1 text-blue-800 font-semibold text-sm w-full">
              {["lastName", "firstName", "id"].map((col) => (
                <button
                  key={col}
                  onClick={() => handleSort(col)}
                  className="flex items-center space-x-1 hover:underline"
                >
                  <span className="capitalize">{col === "id" ? "ID" : col.replace(/([A-Z])/g, " $1")}</span>
                  {sortColumn === col ? (
                    sortDirection === "asc" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => console.log("Add new entity")}
              className="hover:bg-blue-300 text-blue-950 rounded-md text-sm p-1 ml-2"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            {/* Toggle Sessions */}
            <div
              className="flex items-center cursor-pointer select-none hover:bg-blue-50 rounded-md px-4 py-2"
              onClick={() => setOpenMenu(!openMenu)}
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
                {/* Session Info */}
                <div className="px-4 mt-2">
                  <div className="border border-blue-200 p-2 rounded-lg">
                    <p className="text-sm text-gray-400">Unit Name: Unit 1</p>
                    <p className="text-sm text-gray-400">Unit ID: UA123</p>
                    <p className="text-sm text-gray-400">Unit Type: Group</p>
                    <p className="text-sm text-gray-400">
                      Signature Profile: Signature 1
                    </p>
                  </div>
                </div>

                {/* Candidate Rows */}
                <div className="mt-2">
                  {sortedData.map((item) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-3 gap-1 items-center px-4 py-1 text-sm rounded-md cursor-pointer ${
                        activeCandidateId === item.id
                          ? "bg-blue-100 font-semibold text-blue-800"
                          : "hover:bg-blue-50"
                      }`}
                      onClick={() => {
                        setSelectedEntity(item);
                        setShowEdit(true);
                      }}
                      onDoubleClick={() => {
                        setScoresOpen(true);
                        setActiveCandidateId(item.id);
                        setShowEdit(true);
                      }}
                    >
                      <div>{item.lastName}</div>
                      <div>{item.firstName}</div>
                      <div>{item.id}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Editor Panel */}
          <div className="h-2/5 overflow-auto my-2">
            <ClientEditor
              onClose={() => setShowEdit(false)}
              entity={selectedEntity}
              showForm={showEdit}
            />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-6/12 lg:w-9/12 bg-white flex flex-col border-2 h-full border-blue-200 rounded-md p-1 ml-1">
        {ScoresOpen && <CompetencyAccounting />}
      </div>
    </div>
  );
}
