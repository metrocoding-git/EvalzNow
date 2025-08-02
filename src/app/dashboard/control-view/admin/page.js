"use client";

import {
  Edit3,
  Trash2,
  Plus,
  Trash,
  ChevronRight,
  ChevronDown,
  Users,
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
      executiveId: "EX12345678",
      firstName: "Sadeesha",
      lastName: "Perera",
    },
    {
      executiveId: "EX12345679",
      firstName: "Nadeesha",
      lastName: "Silva",
    },
    {
      executiveId: "EX12345680",
      firstName: "Kasun",
      lastName: "Fernando",
    },
    {
      executiveId: "EX12345681",
      firstName: "Dilani",
      lastName: "Gunasekara",
    },
    {
      executiveId: "EX12345682",
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

  const handleDelete = (executiveId) => {
    const updatedData = dataList.filter(
      (item) => item.executiveId !== executiveId
    );
    setDataList(updatedData);

    if (selectedClient?.executiveId === executiveId) {
      setSelectedClient(null);
      setShowEdit(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Optimized for space efficiency */}
      <div className="w-80 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="flex flex-col overflow-hidden ">
          {/* Header with controls - Minimal padding */}
          <div className="bg-blue-50 border-b border-gray-200 px-4 py-3">
            {/* Control buttons - Compact layout */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-blue-800">Clients</h2>
              <div className="flex items-center gap-1">
                <button
                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  onClick={() => {
                    setSelectedClient(null);
                    setShowAdd(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add
                </button>

                {selectedClient && (
                  <div className="flex gap-1 client-item">
                    <button
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                      onClick={() => {
                        setShowEdit(true);
                        setContextMenu((prev) => ({ ...prev, visible: false }));
                      }}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                      onClick={() => handleDelete(selectedClient.executiveId)}
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Column Headers - Streamlined */}
            <div className="grid grid-cols-3 gap-1 text-xs font-medium text-blue-600 uppercase tracking-wide">
              {[
                { key: "lastName", label: "Last Name"},
                { key: "firstName", label: "First Name" },
                { key: "executiveId", label: "ID"},
              ].map((col) => (
                <div
                  key={col.key}
                  className={`${col.cols} flex items-center cursor-pointer hover:text-blue-700 transition-colors`}
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
                    className={`w-3 h-3 ml-1 transition-transform ${
                      sortBy === col.key && sortOrder === "desc"
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Client List - Optimized scrolling area */}
          <div className="flex-1 overflow-auto">
            {/* List toggle - Compact */}
            <div className="px-4 py-2 border-b border-gray-100">
              <div
                className="flex items-center cursor-pointer select-none hover:text-gray-700 transition-colors"
                onClick={() => setShowList((prev) => !prev)}
              >
                {showList ? (
                  <ChevronDown className="w-4 h-4 text-gray-500 mr-2" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500 mr-2" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  Clients ({dataList.length})
                </span>
              </div>
            </div>

            {/* Client items - Reduced padding */}
            {showList &&
              getSortedDataList().map((item, index) => {
                const isSelected =
                  selectedClient &&
                  selectedClient.executiveId === item.executiveId;
                return (
                  <div
                    key={item.executiveId}
                    className={`client-item grid grid-cols-12 gap-2 items-center cursor-pointer px-4 py-2.5 border-b border-gray-50 transition-all ${
                      isSelected 
                        ? "bg-blue-50 border-l-4 border-l-blue-500 text-blue-900" 
                        : "hover:bg-gray-50"
                    }`}
                    onClick={(e) => {
                      setSelectedClient(item);
                      e.stopPropagation();
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
                    <p className={`col-span-4 text-sm font-medium truncate ${
                      isSelected ? "text-blue-900" : "text-gray-900"
                    }`}>
                      {item.lastName}
                    </p>
                    <p className={`col-span-4 text-sm truncate ${
                      isSelected ? "text-blue-700" : "text-gray-600"
                    }`}>
                      {item.firstName}
                    </p>
                    <p className={`col-span-4 text-xs font-mono truncate ${
                      isSelected ? "text-blue-600" : "text-gray-500"
                    }`}>
                      {item.executiveId}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Context Menu - Modern styling */}
        {contextMenu.visible && (
          <div
            ref={contextRef}
            className="absolute bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-40"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={(e) => {
                setSelectedClient(contextMenu.selectedClient);
                setShowEdit(true);
                e.stopPropagation();
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
            >
              <span className="flex items-center">
                <Edit3 className="w-4 h-4 mr-2" /> Edit
              </span>
              <span className="text-xs text-gray-400">Ctrl+E</span>
            </button>

            <button
              className="flex items-center justify-between w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 transition-colors"
              onClick={() => {
                handleDelete(contextMenu.selectedClient.executiveId);
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

        {/* Client Editor - Optimized for space */}

          <div className="h-1/2 border-t border-gray-200" ref={formRef}>
            <ClientEditor client={selectedClient} showForm={showEdit} />
          </div>

      </div>

      {/* Right Panel - Clean layout */}
      <div className="flex-1 bg-white">
        <div className="h-full flex flex-col">
          {showAdd && (
            <div className="flex-1 overflow-auto">
              <CreateClientForm onClose={() => setShowAdd(false)} />
            </div>
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
                {/* <button
                  onClick={() => setShowAdd(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Client
                </button> */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}