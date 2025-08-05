"use client";

import {
  ChevronRight,
  Plus,
  X,
  Edit3,
  Trash2,
  Trash,
  ChevronDown,
  Search,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import StaffEditor from "./components/StaffEditor";
import CreateStaffForm from "./components/CreateStaffForm";

export default function StaffControl() {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showList, setShowList] = useState(true);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("lastName");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const formRef = useRef(null);


  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedStaff: null,
  });

  const [dataList, setDataList] = useState([
    { id: "001", firstName: "John", lastName: "Doe" },
    { id: "002", firstName: "Jane", lastName: "Smith" },
    { id: "003", firstName: "Michael", lastName: "Brown" },
    { id: "004", firstName: "Emily", lastName: "Clark" },
    { id: "005", firstName: "David", lastName: "Lee" },
    { id: "006", firstName: "Sarah", lastName: "Wilson" },
    { id: "007", firstName: "Daniel", lastName: "Johnson" },
    { id: "008", firstName: "Laura", lastName: "Martinez" },
    { id: "009", firstName: "Chris", lastName: "Davis" },
    { id: "010", firstName: "Anna", lastName: "White" },
  ]);

  const getSortedDataList = () => {
    const sorted = [...dataList].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === "id") {
        // Convert to numbers for numeric sorting
        valA = Number(valA);
        valB = Number(valB);
      } else {
        // For names: lowercase strings
        valA = (valA || "").toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const contextRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const isContextMenuClick =
        contextRef.current && contextRef.current.contains(e.target);
      const isStaffClick = e.target.closest(".staff-item");
      const isFormClick = formRef.current && formRef.current.contains(e.target);

      // Only deselect if click is outside staff item, context menu, and form
      if (!isContextMenuClick && !isStaffClick && !isFormClick) {
        setContextMenu({ visible: false, x: 0, y: 0, selectedStaff: null });
        setSelectedStaff(null);
        setShowEdit(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDelete = (id) => {
    const updatedData = dataList.filter((item) => item.id !== id);
    setDataList(updatedData);
    if (selectedStaff?.id === id) {
      setSelectedStaff(null);
      setShowEdit(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-80 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="flex flex-col border-1 border-gray-200  overflow-hidden">
          {/* Header */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-1.5">
            {/* Control buttons */}
            <div className="flex flex-col mb-3">
              <div className="flex justify-end gap-1">
                <button
                  className="inline-flex items-center px-1.5 py-1.5 text-xs font-medium text-white bg-gray-200 hover:bg-gray-400 transition-colors"
                  onClick={() => {
                    setSelectedStaff(null);
                    setShowAdd(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 text-black" />
                </button>

                {selectedStaff && (
                  <div className="flex gap-1 staff-item">
                    <button
                      className="p-1.5 text-gray-600 bg-gray-200 hover:bg-gray-400 hover:text-white transition-colors"
                      onClick={() => handleDelete(selectedStaff.id)}
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="relative w-full mt-1">
                <input
                  type="text"
                  className="border w-full pl-2 pr-8 py-1 text-sm"
                  placeholder="Search"
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
            </div>
            {/* Column Headers */}
            <div className="grid grid-cols-3 gap-1 text-xs font-semibold text-black tracking-wide">
              {[
                { key: "lastName", label: "Last Name" },
                { key: "firstName", label: "First Name" },
                { key: "id", label: "ID" },
              ].map((col) => (
                <div
                  key={col.key}
                  className="flex items-center cursor-pointer select-none"
                  onClick={() => {
                    if (sortBy === col.key) {
                      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                    } else {
                      setSortBy(col.key);
                      setSortOrder("asc");
                    }
                  }}
                >
                  {col.label}
                </div>
              ))}
            </div>
          </div>

          {/* List Toggle */}
          <div className="flex-[1.1] min-h-0 overflow-auto">
            <div
              className="flex items-center px-4 py-2 cursor-pointer select-none hover:text-gray-700 transition-colors"
              onClick={() => setShowList((prev) => !prev)}
            >
              {showList ? (
                <ChevronDown className="w-4 h-4 text-gray-700 mr-2" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-700 mr-1" />
              )}
              <p className="text-sm font-medium text-gray-900">
                Staff ({dataList.length})
              </p>
            </div>

            {showList &&
              getSortedDataList().map((item, index) => {
                const isSelected = selectedStaff?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`staff-item grid grid-cols-3 gap-2 items-center cursor-pointer px-4 py-2 border-b border-gray-50 transition-all ${
                      isSelected
                        ? "bg-gray-200 border-l-4 border-l-gray-500 text-black"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedStaff(item);
                      setShowEdit(true);
                      setShowAdd(false);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedStaff(item);
                      setContextMenu({
                        visible: true,
                        x: e.pageX,
                        y: e.pageY,
                        selectedStaff: item,
                      });
                    }}
                  >
                    <p
                      className={`text-sm font-medium truncate ${
                        isSelected ? "text-black" : "text-gray-800"
                      }`}
                    >
                      {item.lastName}
                    </p>
                    <p
                      className={`text-sm font-medium truncate ${
                        isSelected ? "text-black" : "text-gray-800"
                      }`}
                    >
                      {item.firstName}
                    </p>
                    <p
                      className={`text-sm font-medium truncate ${
                        isSelected ? "text-black" : "text-gray-800"
                      }`}
                    >
                      {item.id}
                    </p>
                  </div>
                );
              })}

            
          </div>
        </div>

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            className="absolute bg-gray-200 border border-gray-300 shadow-md z-50 w-56"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-red-200 w-full text-left border-t border-gray-200"
              onClick={() => {
                handleDelete(contextMenu.selectedStaff.id);
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

        {/* Staff editor Section */}

        <div className="h-2/3 overflow-auto my-0.5" ref={formRef}>
          <StaffEditor staff={selectedStaff} showForm={showEdit} />
        </div>
      </div>

      {/* Right Panel - Create Staff */}
      <div className="flex-1 bg-white w-6/12 lg:w-9/12">
        <div className="h-full flex flex-col">
          {showAdd && (
            <div className="overflow-auto my-2">
              <CreateStaffForm onClose={() => setShowAdd(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
