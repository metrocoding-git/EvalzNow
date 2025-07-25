"use client";
import { useState } from "react";
import { Plus, X, ShieldUser, ChevronRight } from "lucide-react";
import CompetencyAccounting from "./components/PlotSelections";
import ClientEditor from "./components/ClientEditor";
import SecondaryArea from "./components/SecondaryArea";
import PlotSelections from "./components/PlotSelections";


export default function AnalyticsView() {
    const [showEdit, setShowEdit] = useState(false);
    const [showSecondary, setShowSecondary] = useState(false);

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
        {
            unitName: "Group A",
            unitID: "UA123",
            unitType: "Type A",
            signatureProfile: "Profile A",
            items: [
                { id: 1, firstName: "John", lastName: "Doe" },
                { id: 2, firstName: "Jane", lastName: "Smith" },
            ],
        },
        {
            unitName: "Group B",
            unitID: "UB456",
            unitType: "Type B",
            signatureProfile: "Profile B",
            items: [
                { id: 3, firstName: "Alice", lastName: "Brown" },
                { id: 4, firstName: "Bob", lastName: "Johnson" },
            ],
        },
        {
            unitName: "Group C",
            unitID: "UC789",
            unitType: "Type C",
            signatureProfile: "Profile C",
            items: [
                { id: 5, firstName: "Charlie", lastName: "Davis" },
                { id: 6, firstName: "Eve", lastName: "Wilson" },
            ],
        },
        {
            unitName: "Group D",
            unitID: "UD012",
            unitType: "Type D",
            signatureProfile: "Profile D",
            items: [
                { id: 7, firstName: "Frank", lastName: "Garcia" },
                { id: 8, firstName: "Grace", lastName: "Martinez" },
            ],
        },
    ];
    const [openGroups, setOpenGroups] = useState({});
    const [openEntities, setOpenEntities] = useState({});
    const toggleGroup = (index) => {
        setOpenGroups((prev) => ({ ...prev, [index]: !prev[index] }));
    };
    const toggleEntity = (id) => {
        console.log(openEntities);
        setOpenEntities((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDelete = (id) => {
        setEntities((prev) => prev.filter((item) => item.id !== id));
    };



    return (
        <div className="flex h-full overflow-hidden w-full">
            {/* Sidebar */}
            <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1">
                <div className="flex-grow border-2 border-blue-500 rounded-md flex flex-col h-2/4">
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
                        {data.map((group, index) => (
                            <div key={index} className=" px-3 py-1">
                                {/* Dropdown Toggle */}
                                <div
                                    className="flex items-center cursor-pointer select-none hover:bg-blue-50 rounded-md px-2 py-1"
                                    onClick={() => toggleGroup(index)}
                                >
                                    <span
                                        className={`transition-transform duration-200 text-gray-600 mr-1 ${openGroups[index] ? "rotate-90" : "rotate-0"
                                            }`}
                                    >
                                        ▶
                                    </span>

                                    <span className="text-sm text-gray-700 font-medium">
                                        {group.unitName} ({group.unitID}) - {group.unitType} - {group.signatureProfile}
                                    </span>
                                </div>

                                {/* Dropdown Content */}
                                {openGroups[index] && (
                                    <>
                                        <div className=" items-center justify-center  px-4 ">
                                            <div className="border border-blue-200 p-1 rounded-lg">
                                                <span className="text-sm text-gray-400">
                                                    Unit Name: {group.unitName}
                                                </span>
                                                <br />
                                                <span className="text-sm text-gray-400">
                                                    Unit ID: {group.unitID}
                                                </span>
                                                <br />
                                                <span className="text-sm text-gray-400">
                                                    Unit Type: {group.unitType}
                                                </span>
                                                <br />
                                                <span className="text-sm text-gray-400">
                                                    Signature Profile: {group.signatureProfile}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-1 mt-2 px-4">
                                            {group.items.map((entity) => (
                                                <div key={entity.id}>
                                                    {/* Entity Header */}
                                                    <div
                                                        className="flex items-center justify-between hover:bg-blue-50 p-1 rounded-md cursor-pointer"
                                                        onClick={() => {
                                                            toggleEntity(entity.id);
                                                            setShowEdit(true);
                                                            setShowSecondary(true);
                                                        }}
                                                        onDoubleClick={() => {
                                                            setScoresOpen(true);
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2">

                                                            <ChevronRight className={`w-4 h-4 text-gray-500 ${openEntities[entity.id] ? "rotate-90" : "rotate-0"}`} />

                                                            <ShieldUser className="w-5 h-5 text-blue-400" />
                                                            <span className="text-sm text-black">
                                                                {entity.firstName} {entity.lastName} ({entity.id})
                                                            </span>
                                                        </div>

                                                    </div>

                                                    {/* Entity Details */}
                                                    {openEntities[entity.id] && (
                                                        <div className="items-center justify-center px-4 mt-1">
                                                            <div className="border border-blue-200 p-2 rounded-lg text-sm text-gray-400">
                                                                <div>First name: {entity.firstName}</div>
                                                                <div>Last name: {entity.lastName}</div>
                                                                <div>Candidate Id: {entity.id}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Secondary Input Area */}
                {showSecondary && (
                    <div className="h-1/4 overflow-auto my-2">
                        <SecondaryArea
                            onClose={() => setShowSecondary(false)}
                        />
                    </div>
                )}

                {/* Editor */}
                {showEdit && (
                    <div className="h-1/4 overflow-auto my-2">
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
                    <PlotSelections />
                )}

            </div>
        </div>
    );
}