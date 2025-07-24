'use client';
import { useState } from 'react';
import TopRibbon from '@/components/TopRibbon';
import InputArea from '@/components/InputArea';
import DisplayArea from '@/components/DisplayArea';
import EditorArea from '@/components/EditorArea';
import MainTabs from '@/components/MainTabs';
import BottomRibbon from '@/components/BottomRibbon';

export default function DashboardLayout({ children }) {



  return (
    <div className="h-screen bg-white w-screen flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <TopRibbon />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>

      {/* Bottom Ribbon */}
      <BottomRibbon />
    </div>
  );
}
