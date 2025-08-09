"use client";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Edit3,
  Play,
  Plus,
  Settings,
  ShieldUser,
  Trash,
  Trash2,
  UsersRound,
  X,
  Search,
  Copy,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import UnitEditor from "./components/UnitEditor";
import CreateUnitForm from "./components/CreateUnitForm";
import UnitRoster from "./components/UnitRoster";

export default function UnitControl() {
  const router = useRouter();
  const contextRef = useRef(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showList, setShowList] = useState(true);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const formRef = useRef(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showUnitRoster, setUnitRoster] = useState(false);

  const [dataList, setDataList] = useState([
    { id: "u001", name: "Unit1" },
    { id: "u002", name: "Unit2" },
    { id: "u003", name: "Unit3" },
    { id: "u004", name: "Unit4" },
  ]);

  const sortedDataList = [...dataList].sort((a, b) => {
    const fieldA = a[sortField].toLowerCase?.() ?? a[sortField];
    const fieldB = b[sortField].toLowerCase?.() ?? b[sortField];

    if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // This used to manage right-click context menu
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedUnit: null,
  });

  const handleDelete = (id) => {
    console.log(`Delete item with name: ${id}`);
    const updatedData = dataList.filter((item) => item.id !== id);
    setDataList(updatedData);
    if (selectedUnit?.id === id) {
      setSelectedUnit(null);
      setShowEdit(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      const isContextMenuClick =
        contextRef.current && contextRef.current.contains(e.target);
      const isUnitClick = e.target.closest(".unit-item");
      const isFormClick = formRef.current && formRef.current.contains(e.target);

      // If clicked outside both context menu and unit item will deselect
      if (!isContextMenuClick && !isUnitClick && !isFormClick) {
        setContextMenu({ visible: false, x: 0, y: 0, selectedUnit: null });
        setSelectedUnit(null);
        setShowEdit(false);
      }
    };

    if (showUnitRoster) return;

    if (dataList.length > 0) {
      setSelectedUnit(dataList[0]);
      setShowEdit(true);
      setShowAdd(false);
    } else {
      setSelectedUnit(null);
      setShowEdit(false);
    }
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [dataList, showUnitRoster]);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-1/2 lg:w-3/12 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="flex flex-col border-1 border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-1.5">
            {/* Control buttons */}
            <div className="flex flex-col mb-3">
              <div className="flex justify-end gap-1">
                <button
                  className="inline-flex items-center px-1.5 py-1.5 text-xs font-medium text-white bg-gray-200 hover:bg-gray-400 transition-colors"
                  onClick={() => {
                    setSelectedUnit(null);
                    setShowAdd(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 text-black" />
                </button>

                {selectedUnit && (
                  <div className="flex gap-1 unit-item">
                    <button
                      className="p-1.5 text-gray-600 bg-gray-200 hover:bg-gray-400 hover:text-white transition-colors"
                      onClick={() => handleDelete(selectedUnit.id)}
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
            <div className="grid grid-cols-2 gap-1 text-xs font-semibold text-black">
              <div
                className="flex items-center cursor-pointer select-none"
                onClick={() => {
                  if (sortField === "name") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortField("name");
                    setSortOrder("asc");
                  }
                }}
              >
                Name
              </div>
              <div
                className="flex items-center cursor-pointer select-none"
                onClick={() => {
                  if (sortField === "id") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortField("id");
                    setSortOrder("asc");
                  }
                }}
              >
                ID
              </div>
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
                Units ({dataList.length})
              </p>
            </div>

            {showList &&
              sortedDataList.map((item, index) => {
                const isSelected = selectedUnit && selectedUnit.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`unit-item grid grid-cols-2 gap-2 items-center cursor-pointer px-4 py-2 border-b border-gray-50 transition-all ${
                      isSelected
                        ? "bg-blue-100 border-l-4 border-l-blue-400 text-black"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedUnit(item);
                      setShowEdit(true);
                      setShowAdd(false);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedUnit(item);
                      setContextMenu({
                        visible: true,
                        x: e.pageX,
                        y: e.pageY,
                        selectedUnit: item,
                      });
                    }}
                  >
                    <p
                      className={`text-sm font-medium truncate ${
                        isSelected ? "text-black" : "text-gray-800"
                      }`}
                    >
                      {item.name}
                    </p>
                    <p
                      className={`text-sm font-medium truncate ${
                        isSelected ? "text-black" : "text-gray-800"
                      }`}
                    >
                      {item.id}
                    </p>
                    {isSelected && (
                      <div className="border border-gray-200 p-2 px-4">
                        <p className="text-sm text-gray-600">
                          Unit Name: Unit 1
                        </p>
                        <p className="text-sm text-gray-600">Unit ID: UA123</p>
                        <p className="text-sm text-gray-600">
                          Unit Type: Group
                        </p>
                        <p className="text-sm text-gray-600">
                          Signature Profile: Signature 1
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            ref={contextRef}
            className="unit-item absolute bg-gray-200 border font-semibold border-gray-300 shadow-md z-50 w-60"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className="flex justify-between items-center px-4 py-2 text-xs text-gray-800 hover:bg-gray-300 w-full text-left"
              onClick={(e) => {
                setSelectedUnit(contextMenu.selectedUnit);
                e.stopPropagation();
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
            >
              <span className="flex items-center gap-2">
                <Copy className="w-4 h-4" /> Duplicate
              </span>
              <span className="text-gray-400 text-xs ml-4">Ctrl + E</span>
            </button>

            <button
              className="flex justify-between items-center px-4 py-2 text-xs text-gray-800 hover:bg-gray-300 w-full text-left border-t border-gray-200"
              onClick={() => {
                setSelectedUnit(contextMenu.selectedUnit);
                setUnitRoster(true);
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> Unit Config
              </span>
              <span className="text-gray-400 text-xs ml-4">Ctrl + C</span>
            </button>

            <button
              className="flex justify-between items-center px-4 py-2 text-xs text-gray-800 hover:bg-red-200 w-full text-left border-t border-gray-200"
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
              className="flex justify-between items-center px-4 py-2 text-xs text-gray-800 hover:bg-gray-300 w-full text-left border-t border-gray-200"
              onClick={() => {
                setContextMenu((prev) => ({ ...prev, visible: false }));
                router.push("/dashboard/setup-view");
              }}
            >
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Activate Setup View
              </span>
              <span className="text-gray-400 text-xs ml-4">CTRL + 2</span>
            </button>
          </div>
        )}

        {/* Unit editor Section */}
        <div className="h-1/2 my-0.5" ref={formRef}>
          <UnitEditor
            onClose={() => setShowEdit(false)}
            showForm={selectedUnit && showEdit}
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white w-6/12 lg:w-9/12">
        <div className="h-full flex flex-col">
          {showAdd && (
            <div className="overflow-auto my-2 w-96">
              <CreateUnitForm onClose={() => setShowAdd(false)} />
            </div>
          )}

          {!showAdd && showUnitRoster && (
            <div>
              <UnitRoster onClose={() => setUnitRoster(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
