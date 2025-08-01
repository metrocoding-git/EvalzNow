"use client";

import {
  Edit3,
  Eye,
  Trash2,
  CopyPlus,
  Plus,
  Trash,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CandidateEditor from "./components/CandidateEditor";
import CreateCandidateForm from "./components/CreateCandidateForm";

export default function CandidateControl() {
  const contextRef = useRef(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showList, setShowList] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [dataList, setDataList] = useState([
    { id: "001", firstName: "John", lastName: "Doe" },
    { id: "002", firstName: "Jane", lastName: "Smith" },
    { id: "003", firstName: "Alex", lastName: "Johnson" },
    { id: "004", firstName: "Emily", lastName: "Davis" },
    { id: "005", firstName: "Chris", lastName: "Brown" },
    { id: "006", firstName: "Pat", lastName: "Miller" },
    { id: "007", firstName: "Taylor", lastName: "Wilson" },
    { id: "008", firstName: "Jordan", lastName: "Moore" },
    { id: "009", firstName: "Morgan", lastName: "Taylor" },
    { id: "010", firstName: "Casey", lastName: "Anderson" },
  ]);

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedCandidate: null,
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      const isContextMenuClick =
        contextRef.current && contextRef.current.contains(e.target);
      const isCandidateClick = e.target.closest(".candidate-item");

      // If clicked outside both context menu and client item will deselect
      if (!isContextMenuClick && !isCandidateClick) {
        setContextMenu({ visible: false, x: 0, y: 0, selectedCandidate: null });
        setSelectedCandidate(null);
        setShowEdit(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = (id) => {
    const updated = dataList.filter((c) => c.id !== id);
    setDataList(updated);
    if (selectedCandidate?.id === id) {
      setSelectedCandidate(null);
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
              Name
            </div>
            <div className="flex gap-2">
              <button
                className="hover:bg-blue-300 text-blue-950 rounded-md text-sm p-1 cursor-pointer"
                onClick={() => setShowAdd(true)}
              >
                <Plus className="w-4 h-4 inline" />
              </button>
              {selectedCandidate && (
                <div className="flex gap-1 candidate-item">
                  <button
                    className="hover:bg-blue-300 text-blue-700 rounded-md text-sm p-1 cursor-pointer"
                    onClick={() => setShowEdit(true)}
                  >
                    <Edit3 className="w-4 h-4 inline" />
                  </button>
                  <button
                    className="hover:bg-red-300 text-red-700 rounded-md text-sm p-1 cursor-pointer"
                    onClick={() => handleDelete(selectedCandidate.name)}
                  >
                    <Trash className="w-4 h-4 inline" />
                  </button>
                </div>
              )}
            </div>
          </div>

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
              <p className="text-black text-lg">
                Candidates ({dataList.length})
              </p>
            </div>
            {showList &&
              dataList.map((item, index) => {
                const isSelected = selectedCandidate?.id === item.id;
                return (
                  <div
                    key={item.id}
                   className={`staff-item flex items-center justify-between cursor-pointer p-1 rounded-md pl-2 ${
                      isSelected ? "bg-blue-600 text-white" : "hover:bg-blue-50 text-black" 
                    }`}
                    onClick={() => {
                      setSelectedCandidate(item);
                      setShowEdit(false);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedCandidate(item);
                      setContextMenu({
                        visible: true,
                        x: e.pageX,
                        y: e.pageY,
                        selectedCandidate: item,
                      });
                    }}
                  >
                    <div className="text-sm">
                      {item.lastName} {item.firstName} {item.id}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

  
          <div className="h-2/3 overflow-auto my-2">
            <CandidateEditor
              onClose={() => setShowEdit(false)}
              showForm={showEdit && selectedCandidate}
            />
          </div>

      </div>

      <div className="w-6/12 lg:w-9/12 bg-white overflow-auto relative">
        <div className="h-full border-2 border-blue-200 rounded-md flex flex-col mx-1">
          {showAdd && (
            <div className="overflow-auto my-2">
              <CreateCandidateForm onClose={() => setShowAdd(false)} />
            </div>
          )}
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
              setSelectedCandidate(contextMenu.selectedCandidate);
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
              handleDelete(contextMenu.selectedCandidate.name);
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
