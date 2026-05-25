// PropertyEditor.jsx - Fixed version
import React, { useState, useEffect } from "react";
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

// All 4 line color/style/thickness keys for competency charts
const COMPETENCY_LINE_KEYS = [
  "positive-attained",
  "positive-max",
  "negative-attained",
  "negative-max",
];

export default function PropertyEditor({ properties, onChange, selectedChart }) {
  const [expanded, setExpanded] = useState({
    standard: true,
    curveLabel: false,
    lineAttribute: false,
    symbolAttribute: false,
  });

  const COMPETENCY_KEYS = [
    "listening", "reading", "speaking", "writing",
    "theory", "practical", "receptive", "productive", "acuity",
  ];

  const isCompetencyChart = COMPETENCY_KEYS.includes(selectedChart?.key);

  // selectedLineType drives BOTH Standard selector and Line Attribute selector
  const [selectedLineType, setSelectedLineType] = useState(
    isCompetencyChart ? "positive-attained" : "positive"
  );

  // Reset selectedLineType when chart type changes
  useEffect(() => {
    setSelectedLineType(isCompetencyChart ? "positive-attained" : "positive");
  }, [isCompetencyChart]);

  const [selectedSymbolType, setSelectedSymbolType] = useState("positive");

  // ── Visibility ──
  const [positiveVisibility, setPositiveVisibility] = useState(properties.positiveVisibility ?? true);
  const [negativeVisibility, setNegativeVisibility] = useState(properties.negativeVisibility ?? true);
  const [positiveAttainedVisibility, setPositiveAttainedVisibility] = useState(properties.positiveAttainedVisibility ?? true);
  const [positiveMaxVisibility, setPositiveMaxVisibility] = useState(properties.positiveMaxVisibility ?? true);
  const [negativeAttainedVisibility, setNegativeAttainedVisibility] = useState(properties.negativeAttainedVisibility ?? true);
  const [negativeMaxVisibility, setNegativeMaxVisibility] = useState(properties.negativeMaxVisibility ?? true);

  // ── Line style/thickness per type ──
  const [positiveLineStyle, setPositiveLineStyle] = useState(properties.positiveLineStyle || "solid");
  const [negativeLineStyle, setNegativeLineStyle] = useState(properties.negativeLineStyle || "solid");
  const [positiveAttainedLineStyle, setPositiveAttainedLineStyle] = useState(properties.positiveAttainedLineStyle || "solid");
  const [positiveMaxLineStyle, setPositiveMaxLineStyle] = useState(properties.positiveMaxLineStyle || "solid");
  const [negativeAttainedLineStyle, setNegativeAttainedLineStyle] = useState(properties.negativeAttainedLineStyle || "solid");
  const [negativeMaxLineStyle, setNegativeMaxLineStyle] = useState(properties.negativeMaxLineStyle || "solid");

  const [positiveLineThickness, setPositiveLineThickness] = useState(properties.positiveLineThickness || 2);
  const [negativeLineThickness, setNegativeLineThickness] = useState(properties.negativeLineThickness || 2);
  const [positiveAttainedLineThickness, setPositiveAttainedLineThickness] = useState(properties.positiveAttainedLineThickness || 2);
  const [positiveMaxLineThickness, setPositiveMaxLineThickness] = useState(properties.positiveMaxLineThickness || 2);
  const [negativeAttainedLineThickness, setNegativeAttainedLineThickness] = useState(properties.negativeAttainedLineThickness || 2);
  const [negativeMaxLineThickness, setNegativeMaxLineThickness] = useState(properties.negativeMaxLineThickness || 2);

  // ── Line colors per type ──
  const [positiveLineColor, setPositiveLineColor] = useState(properties.positiveLineColor || "#10b981");
  const [negativeLineColor, setNegativeLineColor] = useState(properties.negativeLineColor || "#ef4444");
  const [positiveAttainedLineColor, setPositiveAttainedLineColor] = useState(properties.positiveAttainedLineColor || "#10b981");
  const [positiveMaxLineColor, setPositiveMaxLineColor] = useState(properties.positiveMaxLineColor || "#3b82f6");
  const [negativeAttainedLineColor, setNegativeAttainedLineColor] = useState(properties.negativeAttainedLineColor || "#ef4444");
  const [negativeMaxLineColor, setNegativeMaxLineColor] = useState(properties.negativeMaxLineColor || "#f59e0b");

  // ── Symbol props ──
  const [symbolStyle, setSymbolStyle] = useState(properties.symbolStyle || "circle");
  const [positiveSymbolColor, setPositiveSymbolColor] = useState(properties.positiveSymbolColor || "#10b981");
  const [negativeSymbolColor, setNegativeSymbolColor] = useState(properties.negativeSymbolColor || "#ef4444");
  const [symbolFrequency, setSymbolFrequency] = useState(properties.symbolFrequency || 1);
  const [symbolScaleSize, setSymbolScaleSize] = useState(properties.symbolScaleSize || 1);
  const [shadeArea, setShadeArea] = useState(properties.shadeArea || "#ffffff");

  // ── Helpers to read current line props based on selectedLineType ──
  const getCurrentLineColor = () => {
    switch (selectedLineType) {
      case "positive":               return positiveLineColor;
      case "negative":               return negativeLineColor;
      case "positive-attained":      return positiveAttainedLineColor;
      case "positive-max":           return positiveMaxLineColor;
      case "negative-attained":      return negativeAttainedLineColor;
      case "negative-max":           return negativeMaxLineColor;
      default:                       return "#10b981";
    }
  };

  const getCurrentLineStyle = () => {
    switch (selectedLineType) {
      case "positive":               return positiveLineStyle;
      case "negative":               return negativeLineStyle;
      case "positive-attained":      return positiveAttainedLineStyle;
      case "positive-max":           return positiveMaxLineStyle;
      case "negative-attained":      return negativeAttainedLineStyle;
      case "negative-max":           return negativeMaxLineStyle;
      default:                       return "solid";
    }
  };

  const getCurrentLineThickness = () => {
    switch (selectedLineType) {
      case "positive":               return positiveLineThickness;
      case "negative":               return negativeLineThickness;
      case "positive-attained":      return positiveAttainedLineThickness;
      case "positive-max":           return positiveMaxLineThickness;
      case "negative-attained":      return negativeAttainedLineThickness;
      case "negative-max":           return negativeMaxLineThickness;
      default:                       return 2;
    }
  };

  const getCurrentVisibility = () => {
    switch (selectedLineType) {
      case "positive":               return positiveVisibility;
      case "negative":               return negativeVisibility;
      case "positive-attained":      return positiveAttainedVisibility;
      case "positive-max":           return positiveMaxVisibility;
      case "negative-attained":      return negativeAttainedVisibility;
      case "negative-max":           return negativeMaxVisibility;
      default:                       return true;
    }
  };

  const toggleExpand = (section) =>
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));

  const updateParent = (newProps) => {
    onChange &&
      onChange({
        ...properties,
        positiveVisibility,
        negativeVisibility,
        positiveAttainedVisibility,
        positiveMaxVisibility,
        negativeAttainedVisibility,
        negativeMaxVisibility,
        positiveLineStyle,
        negativeLineStyle,
        positiveAttainedLineStyle,
        positiveMaxLineStyle,
        negativeAttainedLineStyle,
        negativeMaxLineStyle,
        positiveLineThickness,
        negativeLineThickness,
        positiveAttainedLineThickness,
        positiveMaxLineThickness,
        negativeAttainedLineThickness,
        negativeMaxLineThickness,
        positiveLineColor,
        negativeLineColor,
        positiveAttainedLineColor,
        positiveMaxLineColor,
        negativeAttainedLineColor,
        negativeMaxLineColor,
        symbolStyle,
        positiveSymbolColor,
        negativeSymbolColor,
        symbolFrequency,
        symbolScaleSize,
        shadeArea,
        ...newProps,
      });
  };

  // ── Handlers ──
  const handleLineColorChange = (color) => {
    switch (selectedLineType) {
      case "positive":          setPositiveLineColor(color);          updateParent({ positiveLineColor: color }); break;
      case "negative":          setNegativeLineColor(color);          updateParent({ negativeLineColor: color }); break;
      case "positive-attained": setPositiveAttainedLineColor(color);  updateParent({ positiveAttainedLineColor: color }); break;
      case "positive-max":      setPositiveMaxLineColor(color);       updateParent({ positiveMaxLineColor: color }); break;
      case "negative-attained": setNegativeAttainedLineColor(color);  updateParent({ negativeAttainedLineColor: color }); break;
      case "negative-max":      setNegativeMaxLineColor(color);       updateParent({ negativeMaxLineColor: color }); break;
    }
  };

  const handleLineStyleChange = (value) => {
    switch (selectedLineType) {
      case "positive":          setPositiveLineStyle(value);          updateParent({ positiveLineStyle: value }); break;
      case "negative":          setNegativeLineStyle(value);          updateParent({ negativeLineStyle: value }); break;
      case "positive-attained": setPositiveAttainedLineStyle(value);  updateParent({ positiveAttainedLineStyle: value }); break;
      case "positive-max":      setPositiveMaxLineStyle(value);       updateParent({ positiveMaxLineStyle: value }); break;
      case "negative-attained": setNegativeAttainedLineStyle(value);  updateParent({ negativeAttainedLineStyle: value }); break;
      case "negative-max":      setNegativeMaxLineStyle(value);       updateParent({ negativeMaxLineStyle: value }); break;
    }
  };

  const handleLineThicknessChange = (value) => {
    const num = Number(value);
    switch (selectedLineType) {
      case "positive":          setPositiveLineThickness(num);          updateParent({ positiveLineThickness: num }); break;
      case "negative":          setNegativeLineThickness(num);          updateParent({ negativeLineThickness: num }); break;
      case "positive-attained": setPositiveAttainedLineThickness(num);  updateParent({ positiveAttainedLineThickness: num }); break;
      case "positive-max":      setPositiveMaxLineThickness(num);       updateParent({ positiveMaxLineThickness: num }); break;
      case "negative-attained": setNegativeAttainedLineThickness(num);  updateParent({ negativeAttainedLineThickness: num }); break;
      case "negative-max":      setNegativeMaxLineThickness(num);       updateParent({ negativeMaxLineThickness: num }); break;
    }
  };

  const handleVisibilityChange = (checked) => {
    switch (selectedLineType) {
      case "positive":          setPositiveVisibility(checked);          updateParent({ positiveVisibility: checked }); break;
      case "negative":          setNegativeVisibility(checked);          updateParent({ negativeVisibility: checked }); break;
      case "positive-attained": setPositiveAttainedVisibility(checked);  updateParent({ positiveAttainedVisibility: checked }); break;
      case "positive-max":      setPositiveMaxVisibility(checked);       updateParent({ positiveMaxVisibility: checked }); break;
      case "negative-attained": setNegativeAttainedVisibility(checked);  updateParent({ negativeAttainedVisibility: checked }); break;
      case "negative-max":      setNegativeMaxVisibility(checked);       updateParent({ negativeMaxVisibility: checked }); break;
    }
  };

  const lineTypeLabel = {
    "positive":          "Positive",
    "negative":          "Negative",
    "positive-attained": "Positive Attained",
    "positive-max":      "Positive Max",
    "negative-attained": "Negative Attained",
    "negative-max":      "Negative Max",
  }[selectedLineType] || selectedLineType;

  const LineTypeSelect = ({ value, onChange }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="border rounded px-2 py-1 w-52">
      {!isCompetencyChart ? (
        <>
          <option value="positive">Positive PP IDs</option>
          <option value="negative">Negative PP IDs</option>
        </>
      ) : (
        <>
          <option value="positive-attained">Positive PP IDs Attained</option>
          <option value="positive-max">Positive PP IDs Max</option>
          <option value="negative-attained">Negative PP IDs Attained</option>
          <option value="negative-max">Negative PP IDs Max</option>
        </>
      )}
    </select>
  );

  return (
    <div className="w-full space-y-6 text-gray-700 text-xs p-1 pt-1 pb-2 border border-gray-300 bg-white mb-10 rounded-lg">
      {/* --- STANDARD --- */}
      <div>
        <button onClick={() => toggleExpand("standard")} className="flex items-center w-full font-semibold mb-2 cursor-pointer" type="button">
          {expanded.standard ? <ChevronDown className="w-5 h-5 mr-2" /> : <ChevronRight className="w-5 h-5 mr-2" />}
          Standard
        </button>

        {expanded.standard && (
          <div className="space-y-3 pl-7">
            <label className="block font-semibold mb-1">Select Type</label>
            <LineTypeSelect value={selectedLineType} onChange={setSelectedLineType} />

            <label className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                checked={getCurrentVisibility()}
                onChange={(e) => handleVisibilityChange(e.target.checked)}
              />
              <span>Visibility ({lineTypeLabel})</span>
            </label>
          </div>
        )}
      </div>

      {/* --- LINE ATTRIBUTES --- */}
      <div>
        <button onClick={() => toggleExpand("lineAttribute")} className="flex items-center w-full font-semibold mb-2 cursor-pointer" type="button">
          {expanded.lineAttribute ? <ChevronDown className="w-5 h-5 mr-2" /> : <ChevronRight className="w-5 h-5 mr-2" />}
          Line Attribute
        </button>

        {expanded.lineAttribute && (
          <div className="space-y-3 pl-7">
            <label className="block font-semibold mb-1">Line Type</label>
            <LineTypeSelect value={selectedLineType} onChange={setSelectedLineType} />

            <label className="block font-semibold mb-1 mt-3">Line Style</label>
            <select value={getCurrentLineStyle()} onChange={(e) => handleLineStyleChange(e.target.value)} className="w-full border rounded px-2 py-1">
              {lineStyles.map((style) => (
                <option key={style.value} value={style.value}>{style.label}</option>
              ))}
            </select>

            <label className="block font-semibold mb-1 mt-3">
              Line Color ({lineTypeLabel})
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={getCurrentLineColor()}
                onChange={(e) => handleLineColorChange(e.target.value)}
                className="w-16 h-8 p-0 border rounded cursor-pointer"
              />
            </div>

            <label className="block font-semibold mb-1 mt-3">Line Thickness</label>
            <input
              type="number"
              min={1}
              max={10}
              value={getCurrentLineThickness()}
              onChange={(e) => handleLineThicknessChange(e.target.value)}
              className="w-20 border rounded px-2 py-1"
            />
          </div>
        )}
      </div>

      {/* Symbol Attribute */}
      <div>
        <button onClick={() => toggleExpand("symbolAttribute")} className="flex items-center w-full font-semibold mb-2 cursor-pointer" type="button">
          {expanded.symbolAttribute ? <ChevronDown className="w-5 h-5 mr-2" /> : <ChevronRight className="w-5 h-5 mr-2" />}
          Symbol Attribute
        </button>

        {expanded.symbolAttribute && (
          <div className="space-y-3 pl-7">
            <label className="block font-semibold mb-1">Symbol Style</label>
            <select value={symbolStyle} onChange={(e) => { setSymbolStyle(e.target.value); updateParent({ symbolStyle: e.target.value }); }} className="w-full border rounded px-2 py-1">
              {symbolStyles.map((style) => (
                <option key={style.value} value={style.value}>{style.label}</option>
              ))}
            </select>

            <label className="block font-semibold mb-1">Symbol Type</label>
            <select value={selectedSymbolType} onChange={(e) => setSelectedSymbolType(e.target.value)} className="w-full border rounded px-2 py-1">
              <option value="positive">Positive PP IDs</option>
              <option value="negative">Negative PP IDs</option>
            </select>

            <label className="block font-semibold mb-1 mt-3">Symbol Color</label>
            <input
              type="color"
              value={selectedSymbolType === "positive" ? positiveSymbolColor : negativeSymbolColor}
              onChange={(e) => {
                const color = e.target.value;
                if (selectedSymbolType === "positive") {
                  setPositiveSymbolColor(color);
                  updateParent({ positiveSymbolColor: color });
                } else {
                  setNegativeSymbolColor(color);
                  updateParent({ negativeSymbolColor: color });
                }
              }}
              className="w-16 h-8 p-0 border rounded cursor-pointer"
            />

            <label className="block font-semibold mb-1 mt-3">Symbol Scale Size</label>
            <input
              type="number" min={1} max={10} step={0.1} value={symbolScaleSize}
              onChange={(e) => { const val = Number(e.target.value); setSymbolScaleSize(val); updateParent({ symbolScaleSize: val }); }}
              className="w-20 border rounded px-2 py-1"
            />

            <label className="block font-semibold mb-1 mt-3">Shade Area</label>
            <input
              type="color" value={shadeArea}
              onChange={(e) => { setShadeArea(e.target.value); updateParent({ shadeArea: e.target.value }); }}
              className="w-16 h-8 p-0 border rounded cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
}