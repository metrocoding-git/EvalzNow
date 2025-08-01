"use client";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Edit3,
  Plus,
  ShieldUser,
  Trash,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import UnitEditor from "./components/UnitEditor";
import CreateUnitForm from "./components/CreateUnitForm";
import UnitRoster from "./components/UnitRoster";

export default function UnitControl() {
  const contextRef = useRef(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showList, setShowList] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showUnitRoster, setUnitRoster] = useState(false);

  const [dataList, setDataList] = useState([
    { id: "u001", name: "Unit1" },
    { id: "u002", name: "Unit2" },
    { id: "u003", name: "Unit3" },
    { id: "u004", name: "Unit4" },
  ]);

  // This used to manage right-click context menu
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedUnit: null,
  });
  const [rightClickedIndex, setRightClickedIndex] = useState(null);

  const handleDelete = (id) => {
    console.log(`Delete item with name: ${id}`);
    const updatedData = dataList.filter((item) => item.id !== id);
    setDataList(updatedData);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      const isContextMenuClick =
        contextRef.current && contextRef.current.contains(e.target);
      const isUnitClick = e.target.closest(".unit-item");

      // If clicked outside both context menu and client item will deselect
      if (!isContextMenuClick && !isUnitClick) {
        setContextMenu({ visible: false, x: 0, y: 0, selectedUnit: null });
        setSelectedUnit(null);
        setShowEdit(false);
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
            showEdit ? "h-1/3" : "flex-grow"
          }`}
        >
          {/* Header */}
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
              {selectedUnit && (
                <div className="flex gap-2 unit-item">
                  <button
                    className="hover:bg-blue-300 text-blue-700 rounded-md text-sm p-1 cursor-pointer"
                    onClick={() => setShowEdit(true)}
                  >
                    <Edit3 className="w-4 h-4 inline" />
                  </button>
                  <button
                    className="hover:bg-red-300 text-red-700 rounded-md text-sm p-1 cursor-pointer"
                    onClick={() => handleDelete(selectedUnit.id)}
                  >
                    <Trash className="w-4 h-4 inline" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable content */}
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
                Units ({dataList.length})
              </p>
            </div>
            {showList &&
              dataList.map((item, index) => {
                const isSelected = selectedUnit && selectedUnit.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`unit-item flex items-center justify-between cursor-pointer p-1 rounded-md pl-2 ${
                      isSelected ? "bg-blue-600 text-white" : "hover:bg-blue-50"
                    }`}
                    onClick={() => {
                      setSelectedUnit(item);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedUnit(item);
                      setContextMenu({
                        visible: true,
                        x: e.pageX,
                        y: e.pageY,
                        selectedUnit: item,
                      });
                      setRightClickedIndex(index);
                    }}
                  >
                    <div className="ml-2 text-sm">
                      {item.name} {item.id}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
       

        {/* Bottom 1/3 Section */}

        <div className="h-2/3 overflow-auto my-2">
          <UnitEditor
            onClose={() => setShowEdit(false)}
            showForm={selectedUnit && showEdit}
          />
        </div>
      </div>

      <div className="w-6/12 lg:w-9/12 bg-white  flex flex-col border-2 h-full border-blue-200 rounded-md p-1 ml-1">
        {showAdd && (
          <div className="overflow-auto my-2">
            <CreateUnitForm onClose={() => setShowAdd(false)} />
          </div>
        )}

        {!showAdd && showUnitRoster && (
          <UnitRoster onClose={() => setUnitRoster(false)} />
        )}
      </div>

      {/* Right-click context menu */}
      {contextMenu.visible && (
        <div
          className="unit-item absolute bg-blue-50 border border-gray-300 rounded-md shadow-md z-50 w-64"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-blue-200 w-full text-left"
            onClick={(e) => {
              setSelectedUnit(contextMenu.selectedUnit);
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
              setSelectedUnit(contextMenu.selectedUnit);
              setUnitRoster(true);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Unit Config
            </span>
            <span className="text-gray-400 text-xs ml-4">Del</span>
          </button>

          <button
            className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-blue-200 w-full text-left border-t border-gray-200"
            onClick={() => {
              handleDelete(contextMenu.selectedUnit.id);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete
            </span>
            <span className="text-gray-400 text-xs ml-4">Del</span>
          </button>

          <button
            className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-blue-200 w-full text-left border-t border-gray-200"
            onClick={() => {
              handleDelete(contextMenu.selectedUnit.id);
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />Activate Setup View
            </span>
            <span className="text-gray-400 text-xs ml-4">CTRL + 2</span>
          </button>
        </div>
      )}
    </div>
  );
}
