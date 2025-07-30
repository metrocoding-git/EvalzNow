"use client";
export default function BottomRibbon({ activeTab, activeButton }) {
  return (
    <div className="w-full bg-gray-200 shadow-sm text-sm font-medium border-1 border-black mt-1 p-2">
      <p className="text-sm text-gray-700">Ready...</p>

      {activeTab === "Analytics View" && (
        <div className="w-full mt-1">
          <p className="text-xs font-semibold text-blue-600 uppercase">
            ACTIVE ANALYTICS TAB: {activeButton}
          </p>
        </div>
      )}
    </div>
  );
}
