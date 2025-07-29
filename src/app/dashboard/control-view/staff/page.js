'use client';

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
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import StaffEditor from './components/StaffEditor';
import CreateStaffForm from './components/CreateStaffForm';

export default function StaffControl() {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    staff: null,
  });

  const [dataList, setDataList] = useState([
    { name: 'staff1', age: 25, city: 'Colombo' },
    { name: 'staff2', age: 30, city: 'Kandy' },
    { name: 'staff3', age: 28, city: 'Galle' },
    { name: 'staff4', age: 22, city: 'Jaffna' },
    { name: 'staff5', age: 27, city: 'Matara' },
    { name: 'staff6', age: 29, city: 'Negombo' },
    { name: 'staff7', age: 31, city: 'Batticaloa' },
    { name: 'staff8', age: 26, city: 'Anuradhapura' },
    { name: 'staff9', age: 24, city: 'Trincomalee' },
    { name: 'staff10', age: 23, city: 'Ratnapura' },
    { name: 'staff11', age: 32, city: 'Kurunegala' },
    { name: 'staff12', age: 33, city: 'Badulla' },
    { name: 'staff13', age: 34, city: 'Colombo' },
  ]);

  const contextRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextRef.current && !contextRef.current.contains(e.target)) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDelete = (name) => {
    const updatedData = dataList.filter((item) => item.name !== name);
    setDataList(updatedData);
    // Clear selection if deleted
    if (selectedStaff?.name === name) {
      setSelectedStaff(null);
      setShowEdit(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden relative">
      <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1 relative">
        <div
          className={`flex flex-col border-2 border-blue-500 rounded-md overflow-hidden ${
            showEdit ? 'h-2/3' : 'flex-grow'
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
              <button className="hover:bg-red-300 text-red-700 rounded-md text-sm p-1 cursor-pointer">
                <Trash className="w-4 h-4 inline" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-auto px-3 py-2">
            <p className="text-black ml-1 text-lg">Staff ({dataList.length})</p>
            {dataList.map((item, index) => {
              const isSelected = selectedStaff && selectedStaff.name === item.name;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between cursor-pointer p-1 rounded-md pl-2 ${
                    isSelected ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'
                  }`}
                  onClick={() => {
                    setSelectedStaff(item);
                    setShowEdit(false); // Close editor on normal click
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({
                      visible: true,
                      x: e.pageX,
                      y: e.pageY,
                      staff: item,
                    });
                  }}
                >
                  <div className="flex items-center space-x-1">
                  
                    <UsersRound
                      className={`ml-2 w-5 h-5 ${
                        isSelected ? 'text-white' : 'text-blue-400'
                      }`}
                    />
                    <p className={`ml-1 ${isSelected ? 'text-white' : 'text-black'}`}>
                      {item.name}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            ref={contextRef}
            className="absolute bg-blue-50 border border-gray-300 rounded-md shadow-md z-50 w-60"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className="flex justify-between items-center px-4 py-2 text-sm text-gray-800 hover:bg-blue-200 w-full text-left"
              onClick={() => {
                setSelectedStaff(contextMenu.staff);
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
                // For now, just open editor as rename
                setSelectedStaff(contextMenu.staff);
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
                alert('Reviewing: ' + contextMenu.staff.name);
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
                handleDelete(contextMenu.staff.name);
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
                alert('Duplicate not implemented yet');
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

        {/* Editor Section */}
        {showEdit && (
          <div className="h-2/3 overflow-auto my-2">
            <StaffEditor
              staff={selectedStaff}
              onClose={() => setShowEdit(false)}
            />
          </div>
        )}
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
