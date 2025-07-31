"use client";

import {
  Edit3,
  Trash2,
  Plus,
  Trash,
  ChevronRight,
  ChevronDown,
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
      const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
      const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
      if (nameA < nameB) return sortOrder === "asc" ? -1 : 1;
      if (nameA > nameB) return sortOrder === "asc" ? 1 : -1;
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
    <div className="flex h-full overflow-hidden">
      <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1">
        <div
          className={`flex flex-col border-2 border-blue-500 rounded-md overflow-hidden ${
            showEdit ? "h-2/3" : "flex-grow"
          }`}
        >
          <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
            <div className="flex items-center gap-2 text-blue-800 font-semibold">
              Last Name
            </div>
            <div className="flex items-center gap-2 text-blue-800 font-semibold">
             First Name
            </div>
            <div className="flex items-center gap-2 text-blue-800 font-semibold">
              ID
            </div>
            <div className="flex gap-2">
              <button
                className="hover:bg-blue-300 text-blue-950 rounded-md text-sm p-1 cursor-pointer"
                onClick={() => setShowAdd(true)}
              >
                <Plus className="w-4 h-4 inline" />
              </button>
              {selectedClient && (
                <div className="flex gap-1 client-item">
                  <button
                    className="hover:bg-blue-300 text-blue-700 rounded-md text-sm p-1 cursor-pointer"
                    onClick={() => {
                      setShowEdit(true);
                      setContextMenu((prev) => ({ ...prev, visible: false }));
                    }}
                  >
                    <Edit3 className="w-4 h-4 inline" />
                  </button>
                  <button
                    className="hover:bg-red-300 text-red-700 rounded-md text-sm p-1 cursor-pointer"
                    onClick={() => handleDelete(selectedClient.executiveId)}
                  >
                    <Trash className="w-4 h-4 inline" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto px-3 py-2">
            <div className="flex justify-between items-center cursor-pointer select-none">
              <div
                className="flex items-center cursor-pointer select-none"
                onClick={() => setShowList((prev) => !prev)}
              >
                {showList ? (
                  <ChevronDown className="w-4 h-4 text-gray-700 mr-2" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-700 mr-1" />
                )}
                <p className="text-black text-lg">
                  Clients ({dataList.length})
                </p>
              </div>
              <button
                onClick={() =>
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                className="text-blue-600 text-sm hover:underline"
              >
                Sort: {sortOrder === "asc" ? "A-Z" : "Z-A"}
              </button>
            </div>

            {showList &&
              getSortedDataList().map((item, index) => {
                const isSelected =
                  selectedClient &&
                  selectedClient.executiveId === item.executiveId;
                return (
                  <div
                    key={item.executiveId}
                    className={`client-item flex items-center justify-between cursor-pointer p-1 rounded-md pl-2 ${
                      isSelected ? "bg-blue-600 text-white" : "hover:bg-blue-50"
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
                        selectedClient:item,
                      });
                    }}
                  >
                    <p
                      className={`ml-1 text-sm ${
                        isSelected ? "text-white" : "text-black"
                      }`}
                    >
                      {item.lastName} {item.firstName} {item.executiveId}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>

        {contextMenu.visible && (
          <div
            ref={contextRef}
            className="absolute bg-blue-50 border border-gray-300 rounded-md shadow-md z-50 w-60"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-blue-200 w-full text-left"
              onClick={(e) => {
                setSelectedClient(contextMenu.selectedClient);
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
              className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-blue-200 w-full text-left border-b border-gray-200"
              onClick={() => {
                handleDelete(contextMenu.selectedClient.executiveId);
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

        <div className="h-2/3 overflow-auto my-2" ref={formRef}>
          <ClientEditor client={selectedClient} showForm={showEdit} />
        </div>
      </div>

      <div className="w-6/12 lg:w-9/12 bg-white overflow-auto">
        <div className="h-full border-2 border-blue-200 rounded-md flex flex-col mx-1">
          {showAdd && (
            <div className="overflow-auto my-2">
              <CreateClientForm onClose={() => setShowAdd(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
