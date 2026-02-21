"use client";

import SecurePdfViewer from "@/components/PdfViewers";
import { useRouter } from "next/navigation";
import { useState } from "react";

const helpDocs = [
  "1.0 Introduction.pdf",
  "2.0 Brain Function and Causality.pdf",
  "3.0 Evalznow Fundamentals.pdf",
  "4.0 General Use - Education.pdf",
  "5.0 General Use - Industry.pdf",
  "6.0 Psychometrics and ML.pdf",
  "7.0 Issues - Pre-existing Models.pdf",
  "8.0 Policy & Legal.pdf"
];

const editActions = [
  { name: "Copy", shortcut: "CTRL + C" },
  { name: "Cut", shortcut: "CTRL + X" },
  { name: "Paste", shortcut: "CTRL + V" },
  { name: "Refresh", shortcut: "CTRL + R" }
];

const viewActions = [
  { name: "Switch to Control View", shortcut: "CTRL + 1", path: "/dashboard/control-view" },
  { name: "Switch to Setup View", shortcut: "CTRL + 2", path: "/dashboard/setup-view" },
  { name: "Switch to Analysis View", shortcut: "CTRL + 3", path: "/dashboard/analytics-view" }
];

const otherHotKeys = [
    
    { name: "Tabulation Tables", key: "CTRL + 4" },
    { name: "Proficiency Metrics", key: "CTRL + 5" },
    { name: "Growth Metrics", key: "CTRL + 6" },
    { name: "Hybrid Metrics", key: "CTRL + 7" },
    { name: "Unit Distributions", key: "CTRL + 8" },
    { name: "Auxiliary Resultants", key: "CTRL + 9" },
    { name: "Neuroscience Tools", key: "CTRL + 0" },
    { name: "Global Analytics", key: "CTRL + -" },
    { name: "Data Extractions", key: "CTRL + =" },
    { name: "Data Reports", key: "CTRL + [" }
  ];
  

export default function SettingsPage() {
  const router = useRouter();
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("activeClientId");
    router.push("/login");
  };

  const openDoc = (file) => {
    setSelectedDoc(file);
  };

  // Helper function to remove .pdf extension
  const removePdfExtension = (filename) => {
    return filename.replace(/\.pdf$/i, '');
  };
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      
      {/* ====== Left Menu Panel ====== */}
      <div className="w-96 bg-white p-6 overflow-y-auto border-r border-gray-200 mb-35">
        
        {/* ===== File Menu ===== */}
        <div className="mb-6">
          {/* <h2 className="text-lg font-bold mb-2">File</h2> */}

          {/* Help Documentation */}
          <div className="ml-2 mb-2">
            <h3 className="text-lg text-center font-semibold mb-1">Help Documentation</h3>
            <ul className="space-y-1">
              {helpDocs.map((doc) => (
                <li
                  key={doc}
                  className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                  onClick={() => openDoc(doc)}
                >
                  {removePdfExtension(doc)}
                </li>
              ))}
            </ul>
          </div>

          {/* Log Out */}
          <div className="mt-4">
            <button
              onClick={handleLogout}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded"
            >
              Log Out
            </button>
          </div>
        </div>

        <hr/>
        <br />

        {/* ===== Edit Menu ===== */}
        {/* <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Edit Menu</h2>
          <ul className="ml-2 space-y-1">
            {editActions.map((action) => (
              <li
                key={action.name}
                className="flex justify-between px-2 py-1 rounded"
              >
                <span>{action.name}</span>
                <kbd className="bg-gray-200 px-1 rounded text-xs">{action.shortcut}</kbd>
              </li>
            ))}
          </ul>
        </div> */}

        {/* <hr/>
        <br /> */}

        {/* ===== View Menu ===== */}
        {/* <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">View Menu</h2>
          <ul className="ml-2 space-y-1">
            {viewActions.map((view) => (
              <li
                key={view.name}
                className="flex justify-between px-2 py-1  rounded "
                onClick={() => router.push(view.path)}
              >
                <span>{view.name}</span>
                <kbd className="bg-gray-200 px-1 rounded text-xs">{view.shortcut}</kbd>
              </li>
            ))}
          </ul>
        </div> */}

        {/* <hr />
        <br /> */}

        {/* ===== Other Hot Keys ===== */}
        {/* <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Other Hot Keys</h2>

          <ul className="ml-2 space-y-1">
              {otherHotKeys.map((item) => (
              <li
                  key={item.name}
                  className="flex justify-between px-2 py-1 rounded "
              >
                  <span>{item.name}</span>

                  
                  <kbd className="bg-gray-200 border border-gray-300 px-2 py-0.5 rounded text-xs font-mono shadow-sm">
                  {item.key}
                  </kbd>
              </li>
              ))}
          </ul>
        </div> */}
      </div>

      

      {/* ===== Right Content Panel ===== */}
      <div className="flex-1 bg-gray-50 overflow-auto p-4 pb-4 mb-40">
        {selectedDoc ? (
          <SecurePdfViewer file={selectedDoc} />
        ) : (
          <div className="text-gray-400 text-center mt-20">
            Select a Help Documentation file to view it here.
          </div>
        )}
      </div>
    </div>
  );
}
