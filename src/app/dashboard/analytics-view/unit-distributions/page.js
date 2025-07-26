"use client";

import { useState } from "react";
import RightPanel from "./components/RightPanel";
import ClientEditor from "../components/ClientEditor";

export default function UnitDistributions() {
  const [showEdit, setShowEdit] = useState(true);

  return (
    <div className="w-full overflow-y-auto h-full flex px-4 py-4 gap-4"> 

      {/* Left Panel */}
      <div className="w-1/4 border-r pr-4 overflow-hidden">
        {showEdit && (
          <div className="h-full border rounded-sm p-1 overflow-auto">
            <ClientEditor onClose={() => setShowEdit(false)} />
          </div>
        )}
      </div>

      {/* Right Panel (scrollable) */}
      <div className="w-4/5 overflow-y-auto h-full pr-2">
        <RightPanel />
      </div>
    </div>
  );
}
