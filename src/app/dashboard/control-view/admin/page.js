'use client';
import { ChevronRight, Edit, Plus, ShieldUser, Upload, X } from 'lucide-react';
import { useState } from 'react';
import CreateClientForm from './components/CreateClientForm';
import ClientEditor from './components/ClientEditor';




export default function AdminControl() {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [dataList, setDataList] = useState([
    { name: "Sadeesha", age: 25, city: "Colombo" },
    { name: "Nadeesha", age: 30, city: "Kandy" },
    { name: "Kasun", age: 28, city: "Galle" },
    { name: "Dilani", age: 22, city: "Jaffna" },
    { name: "Tharindu", age: 27, city: "Matara" },
    { name: "Chathura", age: 29, city: "Negombo" },
    { name: "Saman", age: 31, city: "Batticaloa" },
    { name: "Kumara", age: 26, city: "Anuradhapura" },
    { name: "Lakshmi", age: 24, city: "Trincomalee" },
    { name: "Ravindu", age: 23, city: "Ratnapura" },
    { name: "Nisansala", age: 32, city: "Kurunegala" },
    { name: "Pradeep", age: 33, city: "Badulla" },
    { name: "Sithara", age: 34, city: "Colombo" },
    { name: "Thilini", age: 35, city: "Kandy" },
    { name: "Dinesh", age: 36, city: "Galle" },
    { name: "Anushka", age: 37, city: "Jaffna" },
    { name: "Ruwan", age: 38, city: "Matara" },
    { name: "Sajith", age: 39, city: "Negombo" },
    { name: "Chamika", age: 40, city: "Batticaloa" },
    { name: "Hiruni", age: 41, city: "Anuradhapura" },
    { name: "Kavindu", age: 42, city: "Trincomalee" },
    { name: "Dilshan", age: 43, city: "Ratnapura" },
    { name: "Nimali", age: 44, city: "Kurunegala" },
    { name: "Sahan", age: 45, city: "Badulla" },
    { name: "Piumi", age: 46, city: "Colombo" },
    { name: "Tharushi", age: 47, city: "Kandy" },
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
                  <ShieldUser className="ml-2 w-5 h-5 text-blue-400" />
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
            <ClientEditor onClose={() => setShowEdit(false)} />
          </div>
        )}
      </div>


      <div className="w-6/12 lg:w-9/12 bg-white overflow-auto relative">
        <div className="h-full border-2 border-blue-200 rounded-md  flex flex-col mx-1">
          {showAdd && (
            <div className="overflow-auto my-2">
              <CreateClientForm onClose={() => setShowAdd(false)} />
            </div>
          )}
        </div>
      </div>
    </div>

  );
};

