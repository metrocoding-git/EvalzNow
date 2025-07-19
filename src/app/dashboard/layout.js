'use client';
import { useState } from 'react';
import TopRibbon from '@/components/TopRibbon';
import InputArea from '@/components/InputArea';
import DisplayArea from '@/components/DisplayArea';
import EditorArea from '@/components/EditorArea';

export default function DashboardLayout({ children }) {
  const [showInput, setShowInput] = useState(true);
  const [showDisplay, setShowDisplay] = useState(true);
  const [showEditor, setShowEditor] = useState(true);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <TopRibbon />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Input Area */}
        {showInput && (
          <div className="w-[240px] border-r bg-gray-50 overflow-auto">
            <InputArea onClose={() => setShowInput(false)} />
          </div>
        )}

        {/* Display Area */}
        {showDisplay && (
          <div className="flex-1 bg-white overflow-auto relative">
            <DisplayArea onClose={() => setShowDisplay(false)} />
            {children}
          </div>
        )}

        {/* Editor Area */}
        {showEditor && (
          <div className="w-[300px] border-l bg-gray-100 overflow-auto">
            <EditorArea onClose={() => setShowEditor(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
