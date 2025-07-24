"use client";
import { useState } from "react";
import { Plus, X, ShieldUser, ChevronRight } from "lucide-react";
import ClientEditor from "../../control-view/admin/components/ClientEditor";
import ScoringCriteria from "./components/ScoringCriteria";

export default function EntitiesManager() {
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [open, setOpen] = useState(false);

  const [entities, setEntities] = useState([
    { id: 1, firstName: "Candidate", lastName: "One" },
    { id: 2, firstName: "Candidate", lastName: "Two" },
    { id: 3, firstName: "Candidate", lastName: "Three" },
    { id: 4, firstName: "Candidate", lastName: "Four" },
  ]);

  const handleDelete = (id) => {
    setEntities((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEdit = (entity) => {
    setSelectedEntity(entity);
    setShowEdit(true);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1">
        <div className="flex-grow border-2 border-blue-500 rounded-md flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
            <span className="text-blue-800 font-semibold text-sm">Entities</span>
            <button
              onClick={() => setShowAdd(true)}
              className="hover:bg-blue-300 text-blue-950 rounded-md text-sm p-1"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Dropdown Toggle */}
          <div
            className="flex items-center cursor-pointer select-none hover:bg-blue-50 rounded-md px-2 py-1"
            onClick={() => setOpen(!open)}
          >
            <span
              className={`transition-transform duration-200 text-gray-600 mr-1 ${
                open ? "rotate-90" : "rotate-0"
              }`}
            >
              ▶
            </span>
            <span className="text-sm text-gray-600">Details</span>
          </div>

          {/* Dropdown Content */}
          {open && (
            <div className="px-5 py-2 text-sm text-gray-700 space-y-1">
              <div>
                <strong>Unit Name:</strong> XXX
              </div>
              <div>
                <strong>Unit ID:</strong> XXX
              </div>
              <div>
                <strong>Unit Type:</strong> XXX
              </div>
              <div>
                <strong>Signature Profile:</strong> XXX
              </div>
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-auto px-3 py-2">
            {entities.map((entity) => (
              <div
                key={entity.id}
                onClick={() => handleEdit(entity)}
                className="flex items-center justify-between hover:bg-blue-50 p-1 rounded-md cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                  <ShieldUser className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-black">
                    {entity.firstName} {entity.lastName}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(entity.id);
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        {showEdit && (
          <div className="h-2/3 overflow-auto my-2">
            <ClientEditor
              onClose={() => setShowEdit(false)}
              entity={selectedEntity}
            />
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="w-6/12 lg:w-9/12 bg-white overflow-auto relative">
        <div className="h-full border-2 border-blue-200 rounded-md flex flex-col mx-1">
          {showAdd && (
            <div className="overflow-auto my-2">
              <ScoringCriteria onClose={() => setShowAdd(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
