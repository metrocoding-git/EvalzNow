'use client';
import { useState } from 'react';
import RibbonPanel from '@/components/RibbonPanel';
import MaterialEditor from '@/components/MaterialEditor';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('Edit');
  const [showMaterialEditor, setShowMaterialEditor] = useState(false);

  const handleToolClick = (label) => {
    if (label === 'Edit') {
      setShowMaterialEditor(true);
    }
  };

  return (
    <>
      {/* Ribbon bar below the TopRibbon from layout */}
      <RibbonPanel activeTabLabel={activeTab} onToolClick={handleToolClick} />

      {/* Material Editor popout */}
      {showMaterialEditor && (
        <MaterialEditor onClose={() => setShowMaterialEditor(false)} />
      )}
    </>
  );
}
