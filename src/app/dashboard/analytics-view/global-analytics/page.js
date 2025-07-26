"use client";
import { useState } from "react";
import ClientEditor from "../components/ClientEditor";
import ChartView from "./components/ChartView";
import ChartList from "./components/ChartList";

export default function GlobalAnalytics() {
  const [activeTab, setActiveTab] = useState("Global Analytics");
  const [showEdit, setShowEdit] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState(null);
    const chartList = ["Chart A", "Chart B", "Chart C"];
      const [selectedChart, setSelectedChart] = useState("Chart A");

  return (
    <div className="w-full flex px-4 py-4 gap-4">
      {/* Left panel */}
      <div className="w-1/4 border-r pr-4">
        {showEdit && (
          <div className="h-2/3 border-1 rounded-sm p-1 overflow-auto">
            <ClientEditor onClose={() => setShowEdit(false)} />
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="w-4/5 max-h-screen overflow-hidden">
        <div className="flex flex-row h-full gap-4">
          <ChartList
            charts={chartList}
            selectedChart={selectedChart}
            onSelect={setSelectedChart}
          />
          <ChartView selectedChart={selectedChart} />
        </div>
      </div>
    </div>
  );
}
