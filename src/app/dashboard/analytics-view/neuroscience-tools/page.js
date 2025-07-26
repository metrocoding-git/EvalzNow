"use client";
import { useState } from "react";
import ClientEditor from "../../control-view/admin/components/ClientEditor";
import RightPanel from "./components/RightPanel";

export default function NeuroscienceTools() {
  const [activeTab, setActiveTab] = useState("Neuroscience Tools");
    const [showEdit, setShowEdit] = useState(true);




  return (
    <div className="w-full flex px-4 py-4 gap-4 ">
      {/* Left panel */}
      <div className="w-1/4 border-r pr-4">
          {showEdit && (
          <div className="h-2/3 border-1 rounded-sm p-1 overflow-auto ">
            {/* <EditorArea onClose={() => setShowEditor(false)} /> */}
            <ClientEditor onClose={() => setShowEdit(false)} />
          </div>
        )}
      </div>

      {/* Right panel */}
       <div className="w-4/5 overflow-y-auto max-h-screen pr-2">
        <RightPanel />
      </div>
    </div>
  );
}
