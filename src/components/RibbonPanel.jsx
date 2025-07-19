'use client';
import { FilePlus, Upload, Trash2, Edit3, Scissors, Copy, Move, Save, FolderOpen , Gauge  } from 'lucide-react';
import IconButton from './IconButton';

const ribbonItems = {
  Files: [
    { icon: <FilePlus />, label: 'New' },
    { icon: <Upload />, label: 'Import' },
    { icon: <Save />, label: 'Save' },
    { icon: <Trash2 />, label: 'Delete' },
  ],
  Edit: [
    { icon: <Edit3 />, label: 'Edit' },
    { icon: <Scissors />, label: 'Cut' },
    { icon: <Copy />, label: 'Copy' },
    { icon: <Move />, label: 'Move' },
  ],
  Topology:[
    {icon: <FolderOpen />, label: 'Files'},
    {icon:<Gauge/>, label: 'Measure'},
    { icon: <Move />, label: 'Move' },
  ]
  // Add other entries for other tabs.
};

export default function RibbonPanel({ activeTabLabel }) {
  const tools = ribbonItems[activeTabLabel] || [];

  return (
    <div className="w-full bg-gray-50 border-b px-2 py-1 flex gap-1">
      {tools.length > 0 ? (
        tools.map((tool, i) => <IconButton key={i} icon={tool.icon} label={tool.label} />)
      ) : (
        <p className="text-sm text-gray-500">No tools available for {activeTabLabel}</p>
      )}
    </div>
  );
}
