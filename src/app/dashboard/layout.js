'use client';
import { useState } from 'react';
import TopRibbon from '@/components/TopRibbon';
import InputArea from '@/components/InputArea';
import DisplayArea from '@/components/DisplayArea';
import EditorArea from '@/components/EditorArea';
import MainTabs from '@/components/MainTabs';

export default function DashboardLayout({ children }) {
  const [showInput, setShowInput] = useState(true);
  const [showDisplay, setShowDisplay] = useState(true);
  const [showEditor, setShowEditor] = useState(true);

  return (
    <div className="h-screen bg-white w-screen flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <TopRibbon />

       {/* Tabs right below top ribbon */}
      <MainTabs />


      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel with Input and Editor stacked vertically */}
        <div className="flex flex-col w-[300px] border-r">
          {/* Input Area */}
          {showInput && (
            <div className="h-1/2 overflow-auto">
              <InputArea onClose={() => setShowInput(false)} />
            </div>
          )}
          {/* Editor Area */}
          {showEditor && (
            <div className="h-1/2 overflow-auto">
              <EditorArea onClose={() => setShowEditor(false)} />
            </div>
          )}
        </div>

        {/* Display Area */}
        {showDisplay && (
          <div className="flex-1 bg-white overflow-auto relative">
            <DisplayArea onClose={() => setShowDisplay(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
