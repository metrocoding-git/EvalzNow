'use client';
import { useState } from 'react';
import TopRibbon from '@/components/TopRibbon';
import InputArea from '@/components/InputArea';
import DisplayArea from '@/components/DisplayArea';
import EditorArea from '@/components/EditorArea';
import MainTabs from '@/components/MainTabs';
import BottomRibbon from '@/components/BottomRibbon';

export default function DashboardLayout({ children }) {
  const [showDisplay, setShowDisplay] = useState(true);


  return (
    <div className="h-screen bg-white w-screen flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <TopRibbon />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel with Input and Editor stacked vertically */}
        <div className="w-6/12 lg:w-3/12 border-r flex flex-col">

          {/* Tabs right below top ribbon */}
          <MainTabs />

        </div>

        {/* Display Area */}
        {showDisplay && (
          <div className="w-6/12 lg:w-9/12 bg-white overflow-auto relative">
            <DisplayArea onClose={() => setShowDisplay(false)} />
          </div>
        )}
      </div>

      {/* Bottom Ribbon */}
      <BottomRibbon />
    </div>
  );
}
