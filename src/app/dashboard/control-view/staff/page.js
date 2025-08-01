"use client";

import {
  ChevronRight,
  Edit,
  Plus,
  UsersRound,
  X,
  Eye,
  Edit3,
  Trash2,
  CopyPlus,
  Trash,
  ChevronDown,
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
    { id: "S001", firstName: "John", lastName: "Doe" },
    { id: "S002", firstName: "Jane", lastName: "Smith" },
    { id: "S003", firstName: "Michael", lastName: "Brown" },
    { id: "S004", firstName: "Emily", lastName: "Clark" },
    { id: "S005", firstName: "David", lastName: "Lee" },
    { id: "S006", firstName: "Sarah", lastName: "Wilson" },
    { id: "S007", firstName: "Daniel", lastName: "Johnson" },
    { id: "S008", firstName: "Laura", lastName: "Martinez" },
    { id: "S009", firstName: "Chris", lastName: "Davis" },
    { id: "S010", firstName: "Anna", lastName: "White" },
  ]);

  const getSortedDataList = () => {
    const sorted = [...dataList].sort((a, b) => {
      const valA = a[sortBy].toLowerCase();
      const valB = b[sortBy].toLowerCase();
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
      <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1 ">
        <div
          className={`flex flex-col border-2 border-blue-500 rounded-md overflow-hidden ${
            showEdit ? "h-2/3" : "flex-grow"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center bg-blue-100  px-4 py-2 border-b border-blue-300">
            <div className="grid grid-cols-3 text-blue-800 font-semibold gap-2 pl-2 text-sm select-none">
              {[
                { key: "lastName", label: "Last Name" },
                { key: "firstName", label: "First Name" },
                { key: "id", label: "ID" },
              ].map((col) => (
                <div
                  key={col.key}
                  className="flex items-center cursor-pointer"
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
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      sortBy === col.key && sortOrder === "desc"
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                className="hover:bg-blue-300 text-blue-950 rounded-md text-sm p-1 cursor-pointer"
                onClick={() => setShowAdd(true)}
              >
                <Plus className="w-4 h-4 inline" />
              </button>
              {selectedStaff && (
                <>
                  <button
                    className="hover:bg-blue-300 text-blue-700 rounded-md text-sm p-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStaff(selectedStaff);
                      setShowEdit(true);
                      setContextMenu((prev) => ({ ...prev, visible: false }));
                    }}
                  >
                    <Edit3 className="w-4 h-4 inline" />
                  </button>
                  <button
                    className="hover:bg-red-300 text-red-700 rounded-md text-sm p-1 cursor-pointer"
                    onClick={() => handleDelete(selectedStaff.id)}
                  >
                    <Trash className="w-4 h-4 inline" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* List Toggle */}
          <div className="flex-1 overflow-auto px-3 py-2">
            <div
              className="flex items-center cursor-pointer select-none"
              onClick={() => setShowList((prev) => !prev)}
            >
              {showList ? (
                <ChevronDown className="w-4 h-4 text-gray-700 mr-2" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-700 mr-1" />
              )}
              <p className="text-black ml-1 text-lg">
                Staff ({dataList.length})
              </p>
            </div>

            {showList &&
              getSortedDataList().map((item, index) => {
                const isSelected = selectedStaff?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`staff-item grid grid-cols-3 items-center cursor-pointer p-1 rounded-md px-3 ${
                      isSelected ? "bg-blue-600 text-white" : "hover:bg-blue-50"
                    }`}
                    onClick={() => {
                      setSelectedStaff(item);
                      setShowEdit(false);
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
                    <p className="text-sm">{item.lastName}</p>
                    <p className="text-sm">{item.firstName}</p>
                    <p className="text-sm">{item.id}</p>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            className="absolute bg-blue-50 border border-gray-300 rounded-md shadow-md z-50 w-60"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-blue-200 w-full text-left"
              onClick={(e) => {
                setSelectedStaff(contextMenu.selectedStaff);
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
              className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-blue-200 w-full text-left border-t border-gray-200"
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

        <div className="h-2/3 overflow-auto my-2" ref={formRef}>
          <StaffEditor staff={selectedStaff} showForm={showEdit} />
        </div>
      </div>

      {/* Right Panel - Create Staff */}
      <div className="w-6/12 lg:w-9/12 bg-white overflow-auto relative">
        <div className="h-full border-2 border-blue-200 rounded-md flex flex-col mx-1">
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
