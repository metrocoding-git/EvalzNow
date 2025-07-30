"use client";
import {
  Plus,
  Trash,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import CandidateEditor from "./components/CandidateEditor";
import CreateCandidateForm from "./components/CreateCandidateForm";

export default function CandidateControl() {
  const contextRef = useRef(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [dataList, setDataList] = useState([
    { name: "Candidate1", age: 25, city: "Colombo" },
    { name: "Candidate2", age: 30, city: "Kandy" },
    { name: "Candidate3", age: 28, city: "Galle" },
    { name: "Candidate4", age: 22, city: "Jaffna" },
    { name: "Candidate5", age: 27, city: "Matara" },
    { name: "Candidate6", age: 29, city: "Negombo" },
    { name: "Candidate7", age: 31, city: "Batticaloa" },
    { name: "Candidate8", age: 26, city: "Anuradhapura" },
    { name: "Candidate9", age: 24, city: "Trincomalee" },
    { name: "Candidate10", age: 23, city: "Ratnapura" },
    { name: "Candidate11", age: 32, city: "Kurunegala" },
    { name: "Candidate12", age: 33, city: "Badulla" },
    { name: "Candidate13", age: 34, city: "Colombo" },
  ]);

  // This used to manage right-click context menu
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  });
  const [rightClickedIndex, setRightClickedIndex] = useState(null);

  const handleDelete = (name) => {
    console.log(`Delete item with id: ${name}`);
    const updatedData = dataList.filter(
      (item, index) =>
        item.name !== name ||
        index !== dataList.findIndex((i) => i.name === name)
    );
    setDataList(updatedData);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextRef.current && !contextRef.current.contains(e.target)) {
        setContextMenu({ visible: false, x: 0, y: 0, item: null });
        setRightClickedIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1">
        {/* Top 2/3 Section */}
        <div
          className={`flex flex-col border-2 border-blue-500 rounded-md overflow-hidden ${
            showEdit ? "h-2/3" : "flex-grow"
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
            <div className="flex items-center gap-2 text-blue-800 font-semibold">
              Name
            </div>
             <div className="flex gap-2">
              <button
                className="hover:bg-blue-300 text-blue-950 rounded-md text-sm p-1 cursor-pointer "
                onClick={() => setShowAdd(true)}
              >
                <Plus className="w-4 h-4 inline " />
              </button>
              <button className="hover:bg-red-300 text-red-700 rounded-md text-sm p-1 cursor-pointer ">
                <Trash className="w-4 h-4 inline" />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-auto px-3 py-2">
            {dataList.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between cursor-pointer p-1 rounded-md ${
                  rightClickedIndex === index
                    ? "bg-blue-50"
                    : "hover:bg-blue-50"
                }`}
                onClick={() => setShowEdit(true)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({
                    visible: true,
                    x: e.pageX,
                    y: e.pageY,
                    item,
                  });
                  setRightClickedIndex(index);
                }}
              >
                <div className="flex items-center space-x-1">
                  <UsersRound className="ml-2 w-5 h-5 text-blue-400" />
                  <p className="text-black ml-1">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom 1/3 Section */}
        {showEdit && (
          <div className="h-2/3 overflow-auto my-2">
            {/* <EditorArea onClose={() => setShowEditor(false)} /> */}
            <CandidateEditor onClose={() => setShowEdit(false)} />
          </div>
        )}
      </div>

      <div className="w-6/12 lg:w-9/12 bg-white overflow-auto relative">
        <div className="h-full border-2 border-blue-200 rounded-md  flex flex-col mx-1">
          {showAdd && (
            <div className="overflow-auto my-2">
              <CreateCandidateForm onClose={() => setShowAdd(false)} />
            </div>
          )}
        </div>
      </div>

      {/* Right-click context menu */}
      {contextMenu.visible && (
        <div
          ref={contextRef}
          className="absolute bg-blue-50 border border-gray-300 rounded-md shadow-md z-50 w-52"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-blue-200 w-full text-left border-b border-gray-200"
            onClick={() => {
              setShowEdit(true);
              setContextMenu({ ...contextMenu, visible: false });
            }}
          >
            <span>Review</span>
            <span className="text-gray-400 text-xs ml-4">R</span>
          </button>
        </div>
      )}
    </div>
  );
}
