"use client";

import IconButton from "./IconButton";
import SubIconButton from "./SubIconButton";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

const ribbonItems = [
  {
    path: "/icons/Control_View.png",
    label: "Control View",
    link: "/dashboard/control-view",
  },
  {
    path: "/icons/Setup_View.png",
    label: "Setup View",
    link: "/dashboard/setup-view",
  },
  {
    path: "/icons/Analytics_View.png",
    label: "Analytics View",
    link: "/dashboard/analytics-view",
  },
];

// Categorized analytics items
const analyticCategories = [
  {
    name: "Preliminary",
    items: [
      {
        path: "/icons/Scoring_Trends.png",
        label: "Scoring Trends",
        link: "/dashboard/analytics-view/scoring-trends",
        type: false,
      },
      {
        path: "/icons/Tabulation_Tables.png",
        label: "Tabulation Tables",
        link: "/dashboard/analytics-view/tabulation-tables",
        type: false,
      },
    ],
  },
  {
    name: "Essentials",
    items: [
      {
        path: "/icons/Proficiency_Metrics.png",
        label: "Proficiency Metrics",
        link: "/dashboard/analytics-view/proficiency-metrics",
        type: false,
      },
      {
        path: "/icons/Growth_Metrics.png",
        label: "Growth Metrics",
        link: "/dashboard/analytics-view/growth-metrics",
        type: false,
      },
      {
        path: "/icons/Hybrid_Metrics.png",
        label: "Hybrid Metrics",
        link: "/dashboard/analytics-view/hybrid-metrics",
        type: false,
      },
    ],
  },
  {
    name: "Formatives",
    items: [
      {
        path: "/icons/Unit_Distributions.png",
        label: "Unit Distributions",
        link: "/dashboard/analytics-view/unit-distributions",
        type: false,
      },
      {
        path: "/icons/Auxiliary_Resultants.png",
        label: "Auxiliary Resultants",
        link: "/dashboard/analytics-view/auxiliary-resultants",
        type: false,
      },
      {
        path: "/icons/Neuroscience_Tools.png",
        label: "Neuroscience Tools",
        link: "/dashboard/analytics-view/neuroscience-tools",
        type: false,
      },
      {
        path: "/icons/Global_Analytics.png",
        label: "Global Analytics",
        link: "/dashboard/analytics-view/global-analytics",
        type: true,
      },
    ],
  },
  {
    name: "Outputs",
    items: [
      {
        path: "/icons/Data_Extractions.png",
        label: "Data Extractions",
        link: "/dashboard/analytics-view/data-extractions",
        type: true,
      },
      {
        path: "/icons/Data_Reports.png",
        label: "Data Reports",
        link: "/dashboard/analytics-view/data-reports",
        type: true,
      },
    ],
  },
];

export default function RibbonPanel() {
  const router = useRouter();
  const pathname = usePathname();

  const { activeTab, activeButton } = useMemo(() => {
    // Check if current path matches any analytics item
    for (const category of analyticCategories) {
      const matchedAnalytic = category.items.find((item) =>
        pathname.startsWith(item.link)
      );
      if (matchedAnalytic)
        return { activeTab: "Analytics View", activeButton: matchedAnalytic.label };
    }

    // Check if current path matches any ribbon item
    const matchedRibbon = ribbonItems.find((item) =>
      pathname.startsWith(item.link)
    );
    if (matchedRibbon)
      return { activeTab: matchedRibbon.label, activeButton: matchedRibbon.label };

    return { activeTab: "Control View", activeButton: "Control View" };
  }, [pathname]);

  // Check if we should show category names and dividers
  const showCategories = activeTab === "Analytics View";

  return (
    <div className="w-full bg-gray-50 border-b border-gray-200 px-2 py-2 flex my-1">
      {/* Main ribbon items */}
      {ribbonItems.map((tool, i) => (
        <IconButton
          key={i}
          icon={tool.path}
          label={tool.label}
          onClick={() => router.push(tool.link)}
          active={activeTab === tool.label}
          link={tool.link}
        />
      ))}

      {/* Analytics sub-items with categories */}
      <div className="flex items-start ml-2">
        {analyticCategories.map((category, categoryIndex) => {
          // Filter items based on active tab
          const visibleItems = category.items.filter(item => 
            activeTab === "Analytics View" || item.type
          );
          
          // Skip rendering if no items are visible in this category
          if (visibleItems.length === 0) return null;
          
          return (
            <div key={categoryIndex} className="flex items-center">
              {/* Divider line between categories (except before the first category) */}
              {categoryIndex > 0 && showCategories && (
                <div className="h-14 w-[2px] bg-gray-300 mx-2 mb-4"></div>
              )}
              
              {/* Category container */}
              <div className="flex flex-col items-center mx-2">
                {/* Category items */}
                <div className="flex gap-2 mb-1">
                  {visibleItems.map(
                    (item, i) => (
                      <SubIconButton
                        key={i}
                        icon={item.path}
                        label={item.label}
                        onClick={() => {
                          if (item.link) router.push(item.link);
                        }}
                        active={activeButton === item.label}
                      />
                    )
                  )}
                </div>
                
                {/* Category label - centered below items (only show when Analytics View is active) */}
                {showCategories && (
                  <div className="text-xs text-gray-500 font-medium text-center w-full">
                    {category.name}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}