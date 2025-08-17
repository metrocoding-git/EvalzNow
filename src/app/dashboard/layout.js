"use client";
import BottomRibbon from '@/components/BottomRibbon';
import Loading from '@/components/Loading';
import RibbonPanel from '@/components/RibbonPanel';
import { useEffect, useState } from 'react';


export default function DashboardLayout({ children }) {
  const [activeTab, setActiveTab] = useState('');
  const [activeButton, setActiveButton] = useState('');

  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Simulate data fetching or initialization
    const timer = setTimeout(() => {
      setLoading(false); // Hide loading screen when done
    }, 1000); // Replace with real fetch completion

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading />;
  }

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
