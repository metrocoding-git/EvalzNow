"use client";
import { useState } from "react";
import { Plus, X, ShieldUser, ChevronRight } from "lucide-react";
import ClientEditor from "../../control-view/admin/components/ClientEditor";
import ScoringCriteria from "./components/ScoringCriteria";
import UnitRoster from "./components/CompetencyAccounting";
import CompetencyAccounting from "./components/CompetencyAccounting";

export default function EntitiesManager() {
  const [showEdit, setShowEdit] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [open, setOpen] = useState(false);
  const [ScoresOpen, setScoresOpen] = useState(false);

  const [entities, setEntities] = useState([
    { id: 1, firstName: "Candidate", lastName: "One" },
    { id: 2, firstName: "Candidate", lastName: "Two" },
    { id: 3, firstName: "Candidate", lastName: "Three" },
    { id: 4, firstName: "Candidate", lastName: "Four" },
  ]);

  const data = [
    { id: 1, firstName: "John", lastName: "Doe" },
    { id: 2, firstName: "Jane", lastName: "Smith" },
    { id: 3, firstName: "Bob", lastName: "Johnson" },
    { id: 4, firstName: "Alice", lastName: "Williams" },
    { id: 5, firstName: "Charlie", lastName: "Brown" },
    { id: 6, firstName: "David", lastName: "Jones" },
    { id: 7, firstName: "Eva", lastName: "Miller" },
    { id: 8, firstName: "Frank", lastName: "Davis" },
    { id: 9, firstName: "Grace", lastName: "Wilson" },
    { id: 10, firstName: "Henry", lastName: "Moore" },
  ];
  const [openMenu, setopenMenu] = useState(true);




  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1">
        <div className="flex-grow border-2 border-blue-500 rounded-md flex flex-col h-3/5">
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

          <div className="flex-1 overflow-auto">
            <div className=" px-3 py-1">
              <div
                className="flex items-center cursor-pointer select-none hover:bg-blue-50 rounded-md px-2 py-1"
                onClick={() => setopenMenu(!openMenu)}
              >

                < span
                  className={`transition-transform duration-200 text-gray-600 mr-1 ${openMenu ? "rotate-90" : "rotate-0"
                    }`}
                >
                  ▶
                </span>
                <span className={`text-md text-gray-600 ml-2 ${openMenu ? "font-bold" : ""}`}>Sessions</span>
              </div>

              {openMenu && (
                <>
                  <div className=" items-center justify-center  px-4 ">
                    <div className="border border-blue-200 p-1 rounded-lg">
                      <span className="text-sm text-gray-400">
                        Unit Name: Unit 1
                      </span>
                      <br />
                      <span className="text-sm text-gray-400">
                        Unit ID: UA123
                      </span>
                      <br />
                      <span className="text-sm text-gray-400">
                        Unit Type: Group
                      </span>
                      <br />
                      <span className="text-sm text-gray-400">
                        Signature Profile: Signature 1
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 mt-2 px-4">
                    {data.map((item, index) => (
                      <div key={item.id}>
                        {/* Entity Header */}
                        <div
                          className="flex items-center justify-between hover:bg-blue-50 p-1 rounded-md cursor-pointer"
                          onClick={() => {
                            setShowEdit(true);
                            setShowSecondary(true);
                          }}
                          onDoubleClick={() => {
                            setScoresOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-2">

                            <ShieldUser className="w-5 h-5 text-blue-400" />
                            <span className="text-sm text-black">
                              {item.firstName} {item.lastName} ({item.id})
                            </span>
                          </div>

                        </div>

                      </div>

                    ))
                    }
                  </div>
                </>
              )}


            </div>

            {/* Dropdown Content */}

          </div>
        </div>

        {/* Editor */}
        {showEdit && (
          <div className="h-2/5 overflow-auto my-2">
            <ClientEditor
              onClose={() => setShowEdit(false)}
              entity={selectedEntity}
            />
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="w-6/12 lg:w-9/12 bg-white  flex flex-col border-2 h-full border-blue-200 rounded-md p-1 ml-1">


        {ScoresOpen && (
          <CompetencyAccounting />
        )}

      </div>
    </div>
  );
}
