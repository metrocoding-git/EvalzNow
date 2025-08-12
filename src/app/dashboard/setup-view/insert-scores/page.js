"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  ChevronRight,
  Search,
} from "lucide-react";
import ClientEditor from "../../control-view/admin/components/ClientEditor";
import CompetencyAccounting from "./components/CompetencyAccounting";

export default function EntitiesManager() {
  // Initial table data in state
  const [data, setData] = useState([
    { id: 1, environment: '', firstName: "John", lastName: "Doe" },
    { id: 2, environment: '', firstName: "Jane", lastName: "Smith" },
    { id: 3, firstName: "Bob", lastName: "Johnson" },
    { id: 4, firstName: "Alice", lastName: "Williams" },
    { id: 5, firstName: "Charlie", lastName: "Brown" },
    { id: 6, firstName: "David", lastName: "Jones" },
    { id: 7, firstName: "Eva", lastName: "Miller" },
    { id: 8, firstName: "Frank", lastName: "Davis" },
    { id: 9, firstName: "Grace", lastName: "Wilson" },
    { id: 10, firstName: "Henry", lastName: "Moore" },
  ]);

  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [ScoresOpen, setScoresOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(true);
  const [activeCandidateId, setActiveCandidateId] = useState(null);
  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const [rightClickedEntity, setRightClickedEntity] = useState(null);

  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.visible) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };

    if(data.length>0){
      setSelectedEntity(data[0]);
      setScoresOpen(true);
      setShowEdit(true);
    }else{
      setSelectedEntity(null);
       setScoresOpen(false);
      setShowEdit(false);
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [contextMenu.visible,data]);

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortColumn];
    const valB = b[sortColumn];

    if (typeof valA === "string" && typeof valB === "string") {
      return sortDirection === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return sortDirection === "asc" ? valA - valB : valB - valA;
  });

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
      <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-gray-200">
        <div className="flex-grow flex flex-col h-3/5">
          {/* Header */}
          <div className="flex flex-col items-center bg-gray-100 px-4 py-2 border-b border-gray-300">
             <div className="relative w-full mb-2">
              <input
                type="text"
                className="border w-full pl-2 pr-8 py-1 text-sm"
                placeholder="Search"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
            <div className="grid grid-cols-3 gap-1 text-gray-800 font-semibold text-sm w-full">
              {["lastName", "firstName", "id"].map((col) => (
                <button
                  key={col}
                  onClick={() => handleSort(col)}
                  className="flex items-center space-x-1 hover:underline"
                >
                  <span className="capitalize">
                    {col === "id" ? "ID" : col.replace(/([A-Z])/g, " $1")}
                  </span>
                </button>
              ))}
            </div>
            {/* <button
              onClick={() => console.log("Add new entity")}
              className="hover:bg-gray-300 text-gray-950 text-sm p-1 ml-2"
            >
              <Plus className="w-4 h-4" />
            </button> */}
          </div>

          <div className="flex-1 overflow-auto">
            {/* Toggle Sessions */}
            <div
              className="flex items-center cursor-pointer select-none hover:bg-gray-50 px-4 py-2"
              onClick={() => setOpenMenu(!openMenu)}
            >
              <span
                className={`transition-transform duration-200 text-gray-600 mr-1 ${
                  openMenu ? "rotate-90" : "rotate-0"
                }`}
              >
                <ChevronRight />
              </span>
              <span
                className={`text-md text-gray-800 ml-2 ${
                  openMenu ? "font-bold text-black" : ""
                }`}
              >
                Details
              </span>
            </div>

            {openMenu && (
              <>
                {/* Session Info */}
                <div className="px-4">
                  <div className="border border-gray-200 p-2">
                    <p className="text-sm text-gray-600">Unit Name: Unit 1</p>
                    <p className="text-sm text-gray-600">Unit ID: UA123</p>
                    <p className="text-sm text-gray-600">Unit Type: Group</p>
                    <p className="text-sm text-gray-600">
                      Signature Profile: Signature 1
                    </p>
                  </div>
                </div>

                {/* Candidate Rows */}
                <div className="mt-2">
                  {sortedData.map((item) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-3 gap-1 items-center px-4 py-1 text-sm cursor-pointer ${
                        selectedEntity?.id === item.id
                          ? "bg-blue-100 border-l-4 border-l-blue-400 text-black"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={(e) => {
                        setSelectedEntity(item);
                        setShowEdit(true);
                        e.stopPropagation();
                      }}
                      onDoubleClick={(e) => {
                        setScoresOpen(true);
                        setSelectedEntity(item);
                        e.stopPropagation();
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setRightClickedEntity(item);
                        setContextMenu({
                          visible: true,
                          x: e.clientX,
                          y: e.clientY,
                        });
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
            {/* <ClientEditor
              onClose={() => setShowEdit(false)}
              entity={selectedEntity}
              showForm={showEdit}
            /> */}

          {/* scoring criteria form */}
          
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white flex flex-col  overflow-y-auto">
        {ScoresOpen && <CompetencyAccounting />}
      </div>

      {contextMenu.visible && (
        <div
          className="absolute bg-gray-50 border border-gray-300 shadow-md z-50 w-60"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 w-full text-left"
            onClick={(e) => {
              setShowEdit(true);
              e.stopPropagation();
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
          >
            <span className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" /> Edit
            </span>
            <span className="text-gray-400 text-xs ml-4">Ctrl + E</span>
          </button>

          <button
            className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 w-full text-left border-t border-gray-200"
            onClick={() => {
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete
            </span>
            <span className="text-gray-400 text-xs ml-4">Del</span>
          </button>
        </div>
      )}
    </div>
  );
}
