"use client";
import BottomRibbon from '@/components/BottomRibbon';
import RibbonPanel from '@/components/RibbonPanel';
import { useState } from 'react';


export default function DashboardLayout({ children }) {
  const [activeTab, setActiveTab] = useState('');
  const [activeButton, setActiveButton] = useState('');

  return (
     <div className="h-screen bg-white w-screen flex flex-col overflow-hidden">
      <RibbonPanel
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeButton={activeButton}
        setActiveButton={setActiveButton}
      />

      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>

      <BottomRibbon activeTab={activeTab} activeButton={activeButton} />
    </div>
  );
}
