"use client";
import { useState } from "react";

export default function GlobalAnalytics() {
  const [activeTab, setActiveTab] = useState("Global Analytics");
  const [showEdit, setShowEdit] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState(null);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-6/12 lg:w-3/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1">
        <div className="flex-grow border-2 border-blue-500 rounded-md flex flex-col"></div>
      </div>

      {/* Right Panel */}
      <div className="w-6/12 lg:w-9/12 flex flex-col border-2 h-full border-blue-200 rounded-md p-1">
        {/* Content for Global Analytics goes here */}
      </div>
    </div>
  );
}
