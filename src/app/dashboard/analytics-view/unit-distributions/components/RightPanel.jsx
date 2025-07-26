import PlotSelections from "./PlotSelections";
import PropertyEditorTabs from "./PropertyEditorTabs";
import ChartDisplay from "./ChartDisplay";

export default function RightPanel() {
  return (
    <div className="flex h-full w-full gap-4">
      {/* Left Section */}
      <div className="w-1/3 flex flex-col gap-4">
        {/* Top: Plot Selections */}
        <PlotSelections />

        {/* Bottom: Property Editor and Tables */}
        <PropertyEditorTabs />
      </div>

      {/* Right Section: Chart Display */}
      <div className="w-2/3">
        <ChartDisplay />
      </div>
    </div>
  );
}
