"use client";
import { Trash2, Edit3, Scissors, Copy, Move, FolderOpen, Gauge, SlidersHorizontal, BetweenHorizontalStart, ChartSpline, TrendingUp, TableProperties, LandPlot } from 'lucide-react';
import IconButton from './IconButton';
import { useState } from "react";
import SubIconButton from './SubIconButton';

const ribbonItems = [
  { path: '/icons/Control_View.png', label: 'Control View', link: '/dashboard/control-view' },
  { path: '/icons/Setup_View.png', label: 'Setup View', link: '/dashboard/setup-view' },
  { path: '/icons/Analytics_View.png', label: 'Analytics View', link: '/dashboard/analytics-view' },
];

const analyticItems = [
  { path: '/icons/Scoring_Trends.png', label: 'Scoring Trends' },
  { path: '/icons/Tabulation_Tables.png', label: 'Tabulation Tables' },
  { path: '/icons/Proficiency_Metrics.png', label: 'Proficiency Metrics' },
  { path: '/icons/Growth_Metrics.png', label: 'Growth Metrics' },
  { path: '/icons/Hybrid_Metrics.png', label: 'Hybrid Metrics' },
  { path: '/icons/Unit_Distributions.png', label: 'Unit Distributions' },
  { path: '/icons/Auxiliary_Resultants.png', label: 'Auxiliary Resultants' },
  { path: '/icons/Neuroscience_Tools.png', label: 'Neuroscience Tools' },
  { path: '/icons/Global_Analytics.png', label: 'Global Analytics' },
  { path: '/icons/Data_Extractions.png', label: 'Data Extractions' },
  { path: '/icons/Data_Reports.png', label: 'Data Reports' },
];

export default function RibbonPanel() {

  const [activeTab, setActiveTab] = useState('Control View');
  const [activeButton, setActiveButton] = useState('Control View');


  return (
    <div className="w-full bg-gray-50 border-b px-2 py-2 flex gap-1 my-1">

      {ribbonItems.map((tool, i) => (
        <IconButton key={i} icon={tool.path} label={tool.label} onClick={() => { setActiveTab(tool.label), setActiveButton(tool.label) }} active={activeTab === tool.label} link={tool.link}  />

      ))}

      {activeTab === 'Analytics View' && (
        <div className="flex flex-wrap justify-center gap-2 ">
          {analyticItems.map((item, i) => (
            <SubIconButton
              key={i}
              icon={item.path}
              label={item.label}
              onClick={() => setActiveButton(item.label)}
              active={activeButton === item.label}
            />
          ))}
        </div>
      )}


      {/* <p className="text-sm text-gray-500">No tools available for {activeTabLabel}</p> */}
    </div>
  );
}
