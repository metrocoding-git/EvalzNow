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

const analyticItems = [
  {
    path: "/icons/Scoring_Trends.png",
    label: "Scoring Trends",
    link: "/dashboard/analytics-view/scoring-trends",
    type: true,
  },
  {
    path: "/icons/Tabulation_Tables.png",
    label: "Tabulation Tables",
    link: "/dashboard/analytics-view/tabulation-tables",
    type: true,
  },
  {
    path: "/icons/Proficiency_Metrics.png",
    label: "Proficiency Metrics",
    link: "/dashboard/analytics-view/proficiency-metrics",
    type: true,
  },
  {
    path: "/icons/Growth_Metrics.png",
    label: "Growth Metrics",
    link: "/dashboard/analytics-view/growth-metrics",
    type: true,
  },
  {
    path: "/icons/Hybrid_Metrics.png",
    label: "Hybrid Metrics",
    link: "/dashboard/analytics-view/hybrid-metrics",
    type: true,
  },
  {
    path: "/icons/Unit_Distributions.png",
    label: "Unit Distributions",
    link: "/dashboard/analytics-view/unit-distributions",
    type: true,
  },
  {
    path: "/icons/Auxiliary_Resultants.png",
    label: "Auxiliary Resultants",
    link: "/dashboard/analytics-view/auxiliary-resultants",
    type: true,
  },
  {
    path: "/icons/Neuroscience_Tools.png",
    label: "Neuroscience Tools",
    link: "/dashboard/analytics-view/neuroscience-tools",
    type: true,
  },
  {
    path: "/icons/Global_Analytics.png",
    label: "Global Analytics",
    link: "/dashboard/analytics-view/global-analytics",
    type: true,
  },
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
];

export default function RibbonPanel() {
  const router = useRouter();
  const pathname = usePathname();

   const { activeTab, activeButton } = useMemo(() => {
    const matchedAnalytic = analyticItems.find((item) =>
      pathname.startsWith(item.link)
    );
    if (matchedAnalytic)
      return { activeTab: "Analytics View", activeButton: matchedAnalytic.label };

    const matchedRibbon = ribbonItems.find((item) =>
      pathname.startsWith(item.link)
    );
    if (matchedRibbon)
      return { activeTab: matchedRibbon.label, activeButton: matchedRibbon.label };

    return { activeTab: "Control View", activeButton: "Control View" };
  }, [pathname]);

  return (
    <div className="w-full bg-gray-50 border-b px-2 py-2 flex gap-1 my-1">
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

      <div className="flex flex-wrap justify-center gap-2">
        {analyticItems.map(
          (item, i) =>
            (activeTab === "Analytics View" || item.type) && (
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
    </div>
  );
}
