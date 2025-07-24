"use client";
import { useState } from "react";
import RibbonPanel from "./RibbonPanel";
import { Copy, Edit3, FilePlus, Import, Save, Trash2, Upload } from "lucide-react";

export default function BottomRibbon() {
  const [activeTab, setActiveTab] = useState(0);

  const tabItems = [
    { icon: <FilePlus />, label: 'New' },
    { icon: <Edit3 />, label: 'Edit' },
    { icon: <Trash2 />, label: 'Delete' },
    { icon: <Import />, label: 'Import' },
    { icon: <Upload />, label: 'Upload' },
    { icon: <Save />, label: 'Save' },
    { icon: <Copy />, label: 'Copy' },
  ]

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  return (
    <div className="w-full bg-gray-200  shadow-sm text-sm font-medium border-1 border-black mt-1">
      {/* Tabs row */}

      <p className="text-sm text-gray-500">Ready</p>

    </div>
  );
}
