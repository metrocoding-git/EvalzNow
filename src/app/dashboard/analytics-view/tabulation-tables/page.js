"use client";
import { useState } from "react";
import { Plus, X, ShieldUser, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ViewerSelections from "./components/PlotSelections";

export default function TabulationTables() {

    const tabs = [
        { label: "Session", path: "/dashboard/analytics-view/scoring-trends" },
    ];

    const pathname = usePathname();
    const currentTab = tabs.find(tab => pathname?.startsWith(tab.path))?.label || "Session";

    const [activeTab, setActiveTab] = useState(currentTab);

    const [ViewerOpen, setViewerOpen] = useState(false);

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




    return (

        <div className="w-full flex flex-col">
            <div className="h-full flex flex-col overflow-hidden m-1 p-1 border-1 border-gray-800 rounded-md">

                {/* Tab buttons */}
                <div className="flex space-x-0 px-0 pt-2 border-b border-gray-200 bg-gray-50 ">
                    <div className="w-6/12 lg:w-3/12 flex flex-col border-r-2 h-full border-gray-200  p-1">
                        {tabs.map((tab, index) => (
                            <Link href={tab.path} key={index}>
                                <span
                                    onClick={() => setActiveTab(tab.label)}
                                    className={
                                        `relative px-5 py-2 text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer ` +
                                        (activeTab === tab.label
                                            ? "text-blue-600 bg-white border border-b-transparent border-gray-300 rounded-t-lg shadow-sm"
                                            : "text-gray-500 hover:text-blue-600 border-t border-r border-b-transparent border-gray-300 rounded-t-lg hover:bg-white")
                                    }
                                >
                                    {tab.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                 
                </div>
                {/* Active tab content */}
                <div className="flex-1 overflow-auto bg-white border border-t-0 border-gray-300 p-1">
                    <div className="flex flex-col h-full">

                        {/* Main Content */}
                        <div className="flex h-full overflow-hidden w-full">
                            {/* Sidebar */}
                            <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1">
                                <div className="flex-grow border-2 border-blue-500 rounded-md flex flex-col h-full">

                                    {/* Header */}
                                    <div className="flex justify-between items-center bg-blue-100 px-4 py-2 border-b border-blue-300">
                                        <span className="text-blue-800 font-semibold text-sm">Entities</span>
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
                                                                        }}
                                                                        onDoubleClick={() => {
                                                                            setViewerOpen(true);
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

                             
                            </div>

                            {/* Right Panel */}
                            <div className="w-6/12 lg:w-9/12 bg-white  flex flex-col border-2 h-full border-blue-200 rounded-md p-1 ml-1">

                                {ViewerOpen && (
                                    <ViewerSelections />
                                )}

                            </div>
                        </div>
                        {/* ------- */}

                        
                    </div>
                </div>
            </div>
        </div >
    );
}