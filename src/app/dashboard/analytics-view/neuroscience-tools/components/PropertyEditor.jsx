import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const lineStyles = [
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
  { label: "Dash-Dot", value: "dashdot" },
];

const symbolStyles = [
  { label: "Circle", value: "circle" },
  { label: "Square", value: "square" },
  { label: "Triangle", value: "triangle" },
  { label: "Diamond", value: "diamond" },
];

export default function PropertyEditor({ properties, onChange }) {
  const [expanded, setExpanded] = useState({
    standard: true,
    lineAttribute: false,
    symbolAttribute: false,
  });

  const [visibility, setVisibility] = useState(properties.visibility ?? true);
  const [layer, setLayer] = useState(properties.layer ?? 1);

  const [lineStyle, setLineStyle] = useState(
    properties.lineStyle ?? "solid"
  );
  const [lineThickness, setLineThickness] = useState(
    properties.lineThickness ?? 2
  );
  const [lineColor, setLineColor] = useState(
    properties.lineColor ?? "#10b981"
  );

  const [symbolStyle, setSymbolStyle] = useState(
    properties.symbolStyle ?? "circle"
  );
  const [symbolColor, setSymbolColor] = useState(
    properties.symbolColor ?? "#2185d0"
  );
  const [symbolFrequency, setSymbolFrequency] = useState(
    properties.symbolFrequency ?? 1
  );
  const [symbolScaleSize, setSymbolScaleSize] = useState(
    properties.symbolScaleSize ?? 1
  );
  const [shadeArea, setShadeArea] = useState(
    properties.shadeArea ?? "#ffffff"
  );

  const toggleExpand = (section) =>
    setExpanded((p) => ({ ...p, [section]: !p[section] }));

  const updateParent = (newProps) => {
    onChange?.({
      ...properties,
      visibility,
      layer,
      lineStyle,
      lineThickness,
      lineColor,
      symbolStyle,
      symbolColor,
      symbolFrequency,
      symbolScaleSize,
      shadeArea,
      ...newProps,
    });
  };

  return (
    <div className="w-full space-y-6 text-gray-700 text-xs p-2 border border-gray-300 bg-white rounded-lg">

      {/* --- STANDARD --- */}
      <div>
        <button
          type="button"
          onClick={() => toggleExpand("standard")}
          className="flex items-center w-full font-semibold"
        >
          {expanded.standard ? (
            <ChevronDown className="w-4 h-4 mr-2" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2" />
          )}
          Standard
        </button>

        {expanded.standard && (
          <div className="space-y-3 pl-6 mt-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={visibility}
                onChange={(e) => {
                  setVisibility(e.target.checked);
                  updateParent({ visibility: e.target.checked });
                }}
              />
              <span>Visibility</span>
            </label>

            <label className="flex items-center space-x-2">
              <span>Layer</span>
              <input
                type="number"
                min={0}
                value={layer}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setLayer(v);
                  updateParent({ layer: v });
                }}
                className="w-20 border rounded px-2 py-1"
              />
            </label>
          </div>
        )}
      </div>

      {/* --- LINE ATTRIBUTE --- */}
      <div>
        <button
          type="button"
          onClick={() => toggleExpand("lineAttribute")}
          className="flex items-center w-full font-semibold"
        >
          {expanded.lineAttribute ? (
            <ChevronDown className="w-4 h-4 mr-2" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2" />
          )}
          Line Attribute
        </button>

        {expanded.lineAttribute && (
          <div className="space-y-3 pl-6 mt-2 flex flex-col">
            <label className="font-semibold">Line Style</label>
            <select
              value={lineStyle}
              onChange={(e) => {
                setLineStyle(e.target.value);
                updateParent({ lineStyle: e.target.value });
              }}
              className="w-full border rounded px-2 py-1"
            >
              {lineStyles.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <label className="font-semibold">Line Color</label>
            <input
              type="color"
              value={lineColor}
              onChange={(e) => {
                setLineColor(e.target.value);
                updateParent({ lineColor: e.target.value });
              }}
              className="w-16 h-8 border rounded"
            />

            <label className="font-semibold">Line Thickness</label>
            <input
              type="number"
              min={1}
              max={10}
              value={lineThickness}
              onChange={(e) => {
                const v = Number(e.target.value);
                setLineThickness(v);
                updateParent({ lineThickness: v });
              }}
              className="w-20 border rounded px-2 py-1"
            />
          </div>
        )}
      </div>

      {/* --- SYMBOL ATTRIBUTE --- */}
      <div className="">
        <button
          type="button"
          onClick={() => toggleExpand("symbolAttribute")}
          className="flex items-center w-full font-semibold"
        >
          {expanded.symbolAttribute ? (
            <ChevronDown className="w-4 h-4 mr-2" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2" />
          )}
          Symbol Attribute
        </button>

        {expanded.symbolAttribute && (
          <div className="space-y-3 pl-6 mt-2 flex flex-col">
            <label className="font-semibold">Symbol Style</label>
            <select
              value={symbolStyle}
              onChange={(e) => {
                setSymbolStyle(e.target.value);
                updateParent({ symbolStyle: e.target.value });
              }}
              className="w-full border rounded px-2 py-1"
            >
              {symbolStyles.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <label className="font-semibold">Symbol Color</label>
            <input
              type="color"
              value={symbolColor}
              onChange={(e) => {
                setSymbolColor(e.target.value);
                updateParent({ symbolColor: e.target.value });
              }}
              className="w-16 h-8 border rounded"
            />

            <label className="font-semibold">Symbol Frequency</label>
            <input
              type="number"
              min={1}
              max={10}
              value={symbolFrequency}
              onChange={(e) => {
                const v = Number(e.target.value);
                setSymbolFrequency(v);
                updateParent({ symbolFrequency: v });
              }}
              className="w-20 border rounded px-2 py-1"
            />

            <label className="font-semibold">Symbol Scale Size</label>
            <input
              type="number"
              min={1}
              max={10}
              step={0.1}
              value={symbolScaleSize}
              onChange={(e) => {
                const v = Number(e.target.value);
                setSymbolScaleSize(v);
                updateParent({ symbolScaleSize: v });
              }}
              className="w-20 border rounded px-2 py-1"
            />

            <label className="font-semibold">Shade Area</label>
            <input
              type="color"
              value={shadeArea}
              onChange={(e) => {
                setShadeArea(e.target.value);
                updateParent({ shadeArea: e.target.value });
              }}
              className="w-16 h-8 border rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
}
