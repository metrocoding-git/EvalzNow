'use client';
import { ChevronRight, Edit, Plus, ShieldUser, Upload, UsersRound, X } from 'lucide-react';
import { useState } from 'react';
import StaffEditor from './components/StaffEditor';
import CreateStaffForm from './components/CreateStaffForm';




export default function StaffControl() {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [dataList, setDataList] = useState([
    { name: "staff1", age: 25, city: "Colombo" },
    { name: "staff2", age: 30, city: "Kandy" },
    { name: "staff3", age: 28, city: "Galle" },
    { name: "staff4", age: 22, city: "Jaffna" },
    { name: "staff5", age: 27, city: "Matara" },
    { name: "staff6", age: 29, city: "Negombo" },
    { name: "staff7", age: 31, city: "Batticaloa" },
    { name: "staff8", age: 26, city: "Anuradhapura" },
    { name: "staff9", age: 24, city: "Trincomalee" },
    { name: "staff10", age: 23, city: "Ratnapura" },
    { name: "staff11", age: 32, city: "Kurunegala" },
    { name: "staff12", age: 33, city: "Badulla" },
    { name: "staff13", age: 34, city: "Colombo" },

  ]);

  const handleDelete = (name) => {
    console.log(`Delete item with id: ${name}`);
    const updatedData = dataList.filter((item, index) => item.name !== name || index !== dataList.findIndex(i => i.name === name));
    setDataList(updatedData);
  };
  return (

    <div className="flex h-full overflow-hidden">
      <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1">
        {/* Top 2/3 Section */}
        <div className="flex-grow h-2/3 border-2 border-blue-500 rounded-md flex flex-col ">
          {/* Header */}
          <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
            <div className="flex items-center gap-2 text-blue-800 font-semibold">
              Name
            </div>
            <button
              className="hover:bg-blue-300 text-blue-950 rounded-md text-sm p-1 cursor-pointer"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="w-4 h-4 inline" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-auto px-3 py-2">
            {dataList.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between cursor-pointer hover:bg-blue-50 p-1 rounded-md"
                onClick={() => setShowEdit(true)}
              >
                <div className="flex items-center space-x-1">
                  <ChevronRight className="w-4 h-4" />
                  <UsersRound className="ml-2 w-5 h-5 text-blue-400" />
                  <p className="text-black ml-1">{item.name}</p>
                </div>

                {/* Delete button stops event from bubbling */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent triggering setEdit(true)
                    handleDelete(item.name);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm hover:bg-red-100 rounded-full p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom 1/3 Section */}
        {showEdit && (
          <div className="h-2/3 overflow-auto my-2">
            {/* <EditorArea onClose={() => setShowEditor(false)} /> */}
            <StaffEditor onClose={() => setShowEdit(false)} />
          </div>
        )}
      </div>


      <div className="w-6/12 lg:w-9/12 bg-white overflow-auto relative">
        <div className="h-full border-2 border-blue-200 rounded-md  flex flex-col mx-1">
          {showAdd && (
            <div className="overflow-auto my-2">
              <CreateStaffForm onClose={() => setShowAdd(false)} />
            </div>
          )}
        </div>
      </div>
    </div>

  );
};

