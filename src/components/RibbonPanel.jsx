"use client";
import { Trash2, Edit3, Scissors, Copy, Move, FolderOpen, Gauge, SlidersHorizontal, BetweenHorizontalStart, ChartSpline, TrendingUp, TableProperties, LandPlot } from 'lucide-react';
import IconButton from './IconButton';
import { useState } from "react";
import SubIconButton from './SubIconButton';
import { useRouter } from 'next/navigation';

const ribbonItems = [
  { path: '/icons/Control_View.png', label: 'Control View', link: '/dashboard/control-view' },
  { path: '/icons/Setup_View.png', label: 'Setup View', link: '/dashboard/setup-view' },
  { path: '/icons/Analytics_View.png', label: 'Analytics View', link: '/dashboard/analytics-view' },
];

const analyticItems = [
   { path: '/icons/Scoring_Trends.png', label: 'Scoring Trends', link: '/dashboard/analytics-view/scoring-trends' },
  { path: '/icons/Tabulation_Tables.png', label: 'Tabulation Tables', link: '/dashboard/analytics-view/tabulation-tables' },
  { path: '/icons/Proficiency_Metrics.png', label: 'Proficiency Metrics', link: '/dashboard/analytics-view/proficiency-metrics' },
  { path: '/icons/Growth_Metrics.png', label: 'Growth Metrics', link: '/dashboard/analytics-view/growth-metrics' },
  { path: '/icons/Hybrid_Metrics.png', label: 'Hybrid Metrics', link: '/dashboard/analytics-view/hybrid-metrics' },
  { path: '/icons/Unit_Distributions.png', label: 'Unit Distributions', link: '/dashboard/analytics-view/unit-distributions' },
  { path: '/icons/Auxiliary_Resultants.png', label: 'Auxiliary Resultants', link: '/dashboard/analytics-view/auxiliary-resultants' },
  { path: '/icons/Neuroscience_Tools.png', label: 'Neuroscience Tools', link: '/dashboard/analytics-view/neuroscience-tools' },
  { path: '/icons/Global_Analytics.png', label: 'Global Analytics', link: '/dashboard/analytics-view/global-analytics'  },
  { path: '/icons/Data_Extractions.png', label: 'Data Extractions', link: '/dashboard/analytics-view/data-extractions' },
  { path: '/icons/Data_Reports.png', label: 'Data Reports', link: '/dashboard/analytics-view/data-reports' },
];

export default function RibbonPanel() {

  const [activeTab, setActiveTab] = useState('Control View');
  const [activeButton, setActiveButton] = useState('Control View');
  const router = useRouter();


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
              onClick={() => {setActiveButton(item.label);
                if (item.link)router.push(item.link);}}
              active={activeButton === item.label}
            />
          ))}
        </div>
      )}


      {/* <p className="text-sm text-gray-500">No tools available for {activeTabLabel}</p> */}
    </div>
  );
}
