"use client";

import {
  Edit3,
  Trash2,
  Plus,
  Trash,
  ChevronRight,
  ChevronDown,
  Users,
  Search,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import CreateClientForm from "./components/CreateClientForm";
import ClientEditor from "./components/ClientEditor";

export default function AdminControl() {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showList, setShowList] = useState(true);
  const formRef = useRef(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("lastName");
  const [dataList, setDataList] = useState([
    {
      id: "5678",
      firstName: "Sadeesha",
      lastName: "Perera",
    },
    {
      id: "5679",
      firstName: "Nadeesha",
      lastName: "Silva",
    },
    {
      id: "5680",
      firstName: "Kasun",
      lastName: "Fernando",
    },
    {
      id: "5681",
      firstName: "Dilani",
      lastName: "Gunasekara",
    },
    {
      id: "5682",
      firstName: "Tharindu",
      lastName: "Jayasinghe",
    },
  ]);

  //Sort order state
  const getSortedDataList = () => {
    const sorted = [...dataList].sort((a, b) => {
      const valA = (a[sortBy] || "").toLowerCase();
      const valB = (b[sortBy] || "").toLowerCase();
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedClient: null,
  });

  const contextRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const isContextMenuClick =
        contextRef.current && contextRef.current.contains(e.target);
      const isClientClick = e.target.closest(".client-item");
      const isFormClick = formRef.current && formRef.current.contains(e.target);

      // If clicked outside both context menu and client item will deselect
      if (!isContextMenuClick && !isClientClick && !isFormClick) {
        setContextMenu({ visible: false, x: 0, y: 0, selectedClient: null });
        setSelectedClient(null);
        setShowEdit(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = (id) => {
    const updatedData = dataList.filter((item) => item.id !== id);
    setDataList(updatedData);

    if (selectedClient?.id === id) {
      setSelectedClient(null);
      setShowEdit(false);
    }
  };

   return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Fixed width */}
      <div className="w-80 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="flex flex-col h-full">
          {/* Header with controls */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-1.5 flex-shrink-0">
            <div className="flex flex-col mb-3">
              <div className="flex justify-end gap-1">
                <button
                  className="inline-flex items-center px-1.5 py-1.5 text-xs font-medium text-white bg-gray-200 hover:bg-gray-400 transition-colors"
                  onClick={() => {
                    setShowAdd(true);
                    setSelectedClient(null);
                    setShowEdit(false);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 text-black" />
                </button>

                {selectedClient && (
                  <div className="flex gap-1 client-item">
                    <button
                      className="p-1.5 text-gray-600 bg-gray-200 hover:bg-gray-400 hover:text-white transition-colors"
                      onClick={() => handleDelete(selectedClient.id)}
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
                { key: "id", label: "Id" },
              ].map((col) => (
                <div
                  key={col.key}
                  className="flex items-center cursor-pointer hover:text-black transition-colors"
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

          {/* Client List Section - Fixed height */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="h-64 flex flex[1.2] flex-col overflow-auto">
              {/* List toggle */}
              <div className="px-4 py-1.5 border-b border-gray-100 flex-shrink-0">
                <div
                  className="flex items-center cursor-pointer select-none hover:text-gray-700 transition-colors"
                  onClick={() => setShowList((prev) => !prev)}
                >
                  {showList ? (
                    <ChevronDown className="w-4 h-4 text-gray-700 mr-2" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    Clients ({dataList.length})
                  </span>
                </div>
              </div>

              {/* Client items */}
              {showList && (
                <div className="flex-1 overflow-auto">
                  {getSortedDataList().map((item) => {
                    const isSelected =
                      selectedClient && selectedClient.id === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`client-item grid grid-cols-3 gap-2 items-center cursor-pointer px-4 py-2 border-b border-gray-50 transition-all ${
                          isSelected
                            ? "bg-gray-200 border-l-4 border-l-gray-500 text-black"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={(e) => {
                          setSelectedClient(item);
                          e.stopPropagation();
                          setShowEdit(true);
                          setShowAdd(false);
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setSelectedClient(item);
                          setContextMenu({
                            visible: true,
                            x: e.pageX,
                            y: e.pageY,
                            selectedClient: item,
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
                          className={`text-sm truncate ${
                            isSelected ? "text-black" : "text-gray-800"
                          }`}
                        >
                          {item.firstName}
                        </p>
                        <p
                          className={`text-sm font-mono truncate ${
                            isSelected ? "text-black" : "text-gray-800"
                          }`}
                        >
                          {item.id}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center px-4 py-1.5 cursor-pointer select-none hover:text-gray-700 transition-colors flex-shrink-0">
                <ChevronRight className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-900">
                  SaaS Service Usage Report
                </span>
              </div>
            </div>

            {/* Client Editor Section - Fixed height */}
            <div className="flex[0.8] border-t overflow-auto border-gray-200" ref={formRef}>
              <ClientEditor client={selectedClient} />
            </div>
          </div>
        </div>

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            ref={contextRef}
            className="absolute bg-gray-200 border hover:bg-red-50 border-gray-300 shadow-lg z-50 py-1 min-w-40"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className="flex items-center justify-between w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 border-gray-100 transition-colors"
              onClick={() => {
                handleDelete(contextMenu.selectedClient.id);
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
            >
              <span className="flex items-center">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </span>
              <span className="text-xs text-gray-400">Del</span>
            </button>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white">
        <div className="h-full flex flex-col">
          {showAdd && (
            <CreateClientForm onClose={() => setShowAdd(false)} />
          )}

          {/* Empty state when nothing is selected */}
          {!showAdd && !showEdit && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Client Management
                </h3>
                <p className="text-gray-500 mb-4">
                  Select a client to view details or create a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
