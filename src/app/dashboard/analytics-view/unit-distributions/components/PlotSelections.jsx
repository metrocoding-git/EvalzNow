import { PlusIcon, DownloadIcon, Trash } from "lucide-react";

export default function PlotSelections() {
  return (
    <div className="border-2 border-blue-500 rounded-md bg-white">
      <div className="bg-blue-100 px-4 py-2 border-b border-blue-300 rounded-t-md">
        <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
          Plot Selections
        </h3>
      </div>

      <div className="p-3 text-xs text-gray-800">
        {/* Plot Selection Row */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-700">Plots</span>
          <div className="flex gap-1">
            <button className="p-1 border rounded hover:bg-blue-50 text-blue-700" title="Add Plot">
              <PlusIcon size={14} />
            </button>
            <button className="p-1 border rounded hover:bg-blue-50 text-blue-700" title="Delete Plot">
              <Trash size={14} />
            </button>
            <button className="p-1 border rounded hover:bg-blue-50 text-blue-700" title="Export Plot">
              <DownloadIcon size={14} />
            </button>
          </div>
        </div>

        {/* Pre-Programmed Chart Call-Outs */}
        <div>
          <h4 className="text-xs font-semibold mb-1 text-gray-600">Pre-Programmed Chart Call-Outs</h4>
          <ul className="list-disc pl-4 space-y-1 text-gray-700">
            <li>Callout A</li>
            <li>Callout B</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
