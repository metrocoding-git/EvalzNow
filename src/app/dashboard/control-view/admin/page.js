'use client';
import { ChevronRight, Edit, Plus, ShieldUser, Upload, X } from 'lucide-react';
import { useState } from 'react';
import CreateClientForm from './components/CreateClientForm';
import ClientEditor from './components/ClientEditor';




export default function AdminControl() {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
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
            <p className="text-black ml-1 text-lg">Clients (29) </p>
            {dataList.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between cursor-pointer hover:bg-blue-50 p-1 rounded-md pl-2"
                onClick={() => setShowEdit(true)}
              >
                <div className="flex items-center space-x-1">
                  <p className="text-black ml-1">({index+1}) {item.name} {item.lname}</p>
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

