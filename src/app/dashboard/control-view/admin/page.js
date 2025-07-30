"use client";

import { Edit, Edit3, Eye, Trash2, CopyPlus, Plus, Trash, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import CreateClientForm from "./components/CreateClientForm";
import ClientEditor from "./components/ClientEditor";

export default function AdminControl() {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dataList, setDataList] = useState([
    { name: "Sadeesha", age: 25, lname: "Colombo" },
    { name: "Nadeesha", age: 30, lname: "Kandy" },
    { name: "Kasun", age: 28, lname: "Galle" },
    { name: "Dilani", age: 22, lname: "Jaffna" },
    { name: "Tharindu", age: 27, lname: "Matara" },
    { name: "Chathura", age: 29, lname: "Negombo" },
    { name: "Saman", age: 31, lname: "Batticaloa" },
    { name: "Kumara", age: 26, lname: "Anuradhapura" },
    { name: "Lakshmi", age: 24, lname: "Trincomalee" },
    { name: "Ravindu", age: 23, lname: "Ratnapura" },
    { name: "Nisansala", age: 32, lname: "Kurunegala" },
    { name: "Pradeep", age: 33, lname: "Badulla" },
    { name: "Sithara", age: 34, lname: "Colombo" },
    { name: "Thilini", age: 35, lname: "Kandy" },
    { name: "Dinesh", age: 36, lname: "Galle" },
    { name: "Anushka", age: 37, lname: "Jaffna" },
    { name: "Ruwan", age: 38, lname: "Matara" },
    { name: "Sajith", age: 39, lname: "Negombo" },
    { name: "Chamika", age: 40, lname: "Batticaloa" },
    { name: "Hiruni", age: 41, lname: "Anuradhapura" },
    { name: "Kavindu", age: 42, lname: "Trincomalee" },
    { name: "Dilshan", age: 43, lname: "Ratnapura" },
    { name: "Nimali", age: 44, lname: "Kurunegala" },
    { name: "Sahan", age: 45, lname: "Badulla" },
    { name: "Piumi", age: 46, lname: "Colombo" },
    { name: "Tharushi", age: 47, lname: "Kandy" },
  ]);

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedClient: null,
  });

  const contextRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextRef.current && !contextRef.current.contains(e.target)) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDelete = (name) => {
    const updatedData = dataList.filter((item) => item.name !== name);
    setDataList(updatedData);
    // If the deleted client was selected, clear selection
    if (selectedClient?.name === name) {
      setSelectedClient(null);
      setShowEdit(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden relative">
      <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1 relative">
        <div
          className={`flex flex-col border-2 border-blue-500 rounded-md overflow-hidden ${
            showEdit ? "h-2/3" : "flex-grow"
          }`}
        >
          <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
            <div className="flex items-center gap-2 text-blue-800 font-semibold">
              Name
            </div>
            <div className="flex gap-2">
              <button
                className="hover:bg-blue-300 text-blue-950 rounded-md text-sm p-1 cursor-pointer"
                onClick={() => setShowAdd(true)}
              >
                <Plus className="w-4 h-4 inline" />
              </button>
              <button className="hover:bg-red-300 text-red-700 rounded-md text-sm p-1 cursor-pointer">
                <Trash className="w-4 h-4 inline" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-3 py-2">
            <p className="text-black ml-1 text-lg">Clients ({dataList.length})</p>
            {dataList.map((item, index) => {
              const isSelected = selectedClient && selectedClient.name === item.name;
              return (
                <div
                  key={item.name + index}
                  className={`flex items-center justify-between cursor-pointer p-1 rounded-md pl-2 ${
                    isSelected ? "bg-blue-600 text-white" : "hover:bg-blue-50"
                  }`}
                  onClick={() => {
                    setSelectedClient(item);
                    setShowEdit(false); // Stop showing editor on single click
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({
                      visible: true,
                      x: e.pageX,
                      y: e.pageY,
                      selectedClient: item,
                    });
                  }}
                >
                  <p className={`ml-1 ${isSelected ? "text-white" : "text-black"}`}>
                    {index + 1} {item.name} {item.lname}
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
      onClick={() => {
        setSelectedClient(contextMenu.selectedClient);
        setShowEdit(true);
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
        setSelectedClient(contextMenu.selectedClient);
        setShowEdit(true);
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }}
    >
      <span className="flex items-center gap-2">
        <Edit className="w-4 h-4" /> Rename
      </span>
      <span className="text-gray-400 text-xs ml-4">Ctrl + R</span>
    </button>

    <button
      className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-blue-200 w-full text-left border-b border-gray-200"
      onClick={() => {
        alert("Reviewing: " + contextMenu.selectedClient.name);
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }}
    >
      <span className="flex items-center gap-2">
        <Eye className="w-4 h-4" /> Review
      </span>
      <span className="text-gray-400 text-xs ml-4">R</span>
    </button>

    <button
      className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-blue-200 w-full text-left border-b border-gray-200"
      onClick={() => {
        handleDelete(contextMenu.selectedClient.name);
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }}
    >
      <span className="flex items-center gap-2">
        <Trash2 className="w-4 h-4" /> Delete
      </span>
      <span className="text-gray-400 text-xs ml-4">Del</span>
    </button>

    <button
      className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-blue-200 w-full text-left border-b border-gray-200"
      onClick={() => {
        alert("Duplicate not implemented yet");
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }}
    >
      <span className="flex items-center gap-2">
        <CopyPlus className="w-4 h-4" /> Duplicate
      </span>
      <span className="text-gray-400 text-xs ml-4">Ctrl + D</span>
    </button>
  </div>
)}


        {showEdit && (
          <div className="h-2/3 overflow-auto my-2">
            <ClientEditor client={selectedClient} onClose={() => setShowEdit(false)} />
          </div>
        )}
      </div>

      <div className="w-6/12 lg:w-9/12 bg-white overflow-auto relative">
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
