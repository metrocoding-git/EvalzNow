"use client";

import {
  Trash,
  Plus,
  ChevronRight,
  ChevronDown,
  Search,
  Trash2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ClientEditor from "./components/ClientEditor";
import CreateClientForm from "./components/CreateClientForm";

export default function AdminControl() {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showList, setShowList] = useState(true);
  const formRef = useRef(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("id");
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


  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedClient: null,
  });

  // Sort the dataList based on sortBy and sortOrder
  const getSortedDataList = () => {
    return [...dataList].sort((a, b) => {
      const valA = (a[sortBy] || "").toLowerCase();
      const valB = (b[sortBy] || "").toLowerCase();
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  useEffect(() => {
    // Select first client by default
    if (dataList.length > 0) {
      setSelectedClient(dataList[0]);
    } else {
      setSelectedClient(null);
    }
  }, [dataList]);

  const handleDelete = (id) => {
    const updatedData = dataList.filter((item) => item.id !== id);
    setDataList(updatedData);
    if (selectedClient?.id === id) {
      setSelectedClient(updatedData[0] || null);
    }
  };

  const handleUpdateClient = (updatedClient) => {
    setDataList((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
    setSelectedClient(updatedClient);
  };

  return (
    <div className="flex h-full overflow-hidden">
      
      <div className="w-1/2 lg:w-3/12 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="flex flex-col border-1 border-gray-200 overflow-hidden">
          {/* Header with controls */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-1.5">
            {/* Control buttons */}
            <div className="flex flex-col mb-3">
                <div className="flex justify-end gap-1">
                  <button
                    className="inline-flex items-center px-1.5 py-1.5 text-xs font-medium text-white bg-gray-200 hover:bg-gray-400 transition-colors"
                    onClick={() => {
                      setSelectedClient(null);
                      
                      setShowAdd(true);
                      
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
            </div>

          {/* Column headers */}
          <div className="grid grid-cols-3 gap-1 text-xs font-semibold text-black tracking-wide px-4 py-2">
            {[
              { key: "lastName", label: "Last Name" },
              { key: "firstName", label: "First Name" },
              { key: "id", label: "Executive ID" },
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

          {/* Client list */}
          <div className="flex-[1.1] min-h-0 overflow-auto">
            {/* List toggle */}
            <div
              className="flex items-center px-4 py-2 cursor-pointer select-none hover:text-gray-700 transition-colors"
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

            {/* Client items */}
            {showList && (
              <div className="flex-1">
                {getSortedDataList().map((item) => {
                  const isSelected = selectedClient && selectedClient.id === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`client-item grid grid-cols-3 gap-2 items-center cursor-pointer px-4 py-2 border-b border-gray-50 transition-all ${
                        isSelected
                          ? "bg-blue-100 border-l-4 border-l-blue-400 text-black"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedClient(item)}
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

        {/* Client editor */}
        <div className="h-2/3 overflow-auto my-0.5" ref={formRef}>
          <ClientEditor
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
            onSave={handleUpdateClient}
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 lg:w-9/12 bg-white">
        <div className="h-full flex flex-col w-96">
          {showAdd && <CreateClientForm onClose={() => setShowAdd(false)} />}
        </div>
      </div>
    </div>
  );
}
