"use client";
import React from "react";
import {
  CAUSE_TYPES, CONDITION_TYPES, SEVERITY_LEVELS, SCAN_TYPES, MONITOR_TYPES, THERAPY_TYPES,
  ENGAGE_LEVELS, NEURO_MARKER_COUNT, capacitiesOf,
} from "../../control-view/capsule/capsuleConfig";
import { WORKFLOW_STAGES, ASSESSMENT_TYPES, SCHEDULE_IMPACTS } from "./scoreLists";

/** Insert Scores fields for Capacity Accounting (Capacity_Part4). All fields are mandatory. */
export const SELECT_FIELDS = [
  { key: "workflowStage", label: "Workflow Stage", options: WORKFLOW_STAGES, placeholder: "Select Stage" },
  { key: "assessmentType", label: "Assessment Type", options: ASSESSMENT_TYPES },
  { key: "scheduleImpact", label: "Schedule Impact", options: SCHEDULE_IMPACTS },
  { key: "engageLevel", label: "Engage Level", options: ENGAGE_LEVELS },
];

export const CLINICAL_FIELDS = [
  { key: "causeType", label: "Cause Type", options: CAUSE_TYPES },
  { key: "conditionType", label: "Condition Type", options: CONDITION_TYPES },
  { key: "severityLevel", label: "Severity Level", options: SEVERITY_LEVELS },
  { key: "scanType", label: "Scan Type", options: SCAN_TYPES },
  { key: "monitorType", label: "Monitor Type", options: MONITOR_TYPES },
  { key: "therapyType", label: "Therapy Type", options: THERAPY_TYPES },
];

export const emptyNm = () => Array.from({ length: NEURO_MARKER_COUNT }, () => "No");

export const emptyScore = () => ({
  blockId: "",
  durationDays: "",
  criticalRefDate: "",
  taskDeclaration: "",
  workflowStage: "",
  assessmentType: "",
  scheduleImpact: "",
  engageLevel: "",
  capacity: "",
  attainedScore: "",
  maxScore: "",
  causeType: "",
  conditionType: "",
  severityLevel: "",
  scanType: "",
  monitorType: "",
  therapyType: "",
  nm: emptyNm(),
});

const LABELS = {
  blockId: "PP ID Callout",
  durationDays: "Duration (Days)",
  criticalRefDate: "Critical Ref. Date",
  taskDeclaration: "Task Declaration",
  capacity: "Capacity",
  attainedScore: "Attained Score",
  maxScore: "Maximum Score",
  ...Object.fromEntries([...SELECT_FIELDS, ...CLINICAL_FIELDS].map((f) => [f.key, f.label])),
};

/** Returns an error message, or null when the score can be saved. */
export function validateScore(form, range) {
  for (const key of Object.keys(LABELS)) {
    if (form[key] === undefined || form[key] === null || String(form[key]).trim() === "") {
      return `"${LABELS[key]}" is required.`;
    }
  }
  const duration = parseFloat(form.durationDays);
  if (!(duration > 0)) return "Duration cannot be 0. Please enter a valid duration.";
  const attained = parseFloat(form.attainedScore);
  const max = parseFloat(form.maxScore);
  if (Number.isNaN(attained) || attained < 0) return "Attained score cannot be a negative value.";
  if (Number.isNaN(max) || max <= 0) return "Maximum score must be greater than 0.";
  if (attained > max) return "Attained score cannot be greater than maximum score.";
  if (range?.startDate && form.criticalRefDate < range.startDate) {
    return `Critical Ref. Date cannot be before ${range.startDate}.`;
  }
  if (range?.endDate && form.criticalRefDate > range.endDate) {
    return `Critical Ref. Date cannot be after ${range.endDate}.`;
  }
  return null;
}

const inputCls = "flex-1 border px-2 py-1 bg-white";

/**
 * The field grid used by the Insert Scores form and the Entity Editor.
 * `markerName(i)` gives the label of clinical marker CM i (custom names for CM89–CM100).
 */
export default function ScoreFields({ form, onChange, blocks, capsuleType, markerName, compact = false }) {
  const set = (key) => (e) => onChange(key, e.target.value);
  // Full form: every label on one line (wide label column); compact (Entity Editor) wraps as before
  const lbl = compact ? "text-xs text-gray-700" : "text-gray-700 whitespace-nowrap self-center";
  const ctl = compact ? `${inputCls} text-xs` : inputCls;

  const select = (key, options, placeholder) => (
    <select value={form[key] || ""} onChange={set(key)} className={ctl}>
      <option value="" disabled>{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div className={compact ? "grid grid-cols-2 gap-1 space-y-1 max-w-xl" : "grid grid-cols-[max-content_minmax(16rem,1fr)] gap-x-6 gap-y-3 max-w-3xl"}>
      <label className={lbl}>PP ID Callout:</label>
      <select value={form.blockId || ""} onChange={set("blockId")} className={ctl}>
        <option value="" disabled>Select PP ID</option>
        {blocks.map((b) => <option key={b.id} value={b.id}>{b.ppId}</option>)}
      </select>

      <label className={lbl}>Duration (Days):</label>
      <input
        type="number" min="0" step="0.01" value={form.durationDays} onChange={set("durationDays")}
        onBlur={(e) => e.target.value !== "" && onChange("durationDays", parseFloat(e.target.value || 0).toFixed(2))}
        className={ctl}
      />

      <label className={lbl}>Critical Ref. Date:</label>
      <input type="date" value={form.criticalRefDate} onChange={set("criticalRefDate")} className={ctl} />

      <label className={lbl}>Task Declaration:</label>
      <input type="text" maxLength={50} value={form.taskDeclaration} onChange={set("taskDeclaration")} className={ctl} />

      {SELECT_FIELDS.map((f) => (
        <React.Fragment key={f.key}>
          <label className={lbl}>{f.label}:</label>
          {select(f.key, f.options, f.placeholder || `Select ${f.label}`)}
        </React.Fragment>
      ))}

      <label className={lbl}>Capacity:</label>
      {select("capacity", capacitiesOf(capsuleType).map((c) => c.name), "Select Capacity")}

      <label className={lbl}>Attained Score:</label>
      <input type="number" min="0" step="0.01" value={form.attainedScore} onChange={set("attainedScore")} className={ctl} />

      <label className={lbl}>Maximum Score:</label>
      <input type="number" min="0" step="0.01" value={form.maxScore} onChange={set("maxScore")} className={ctl} />

      {CLINICAL_FIELDS.map((f) => (
        <React.Fragment key={f.key}>
          <label className={lbl}>{f.label}:</label>
          {select(f.key, f.options, `Select ${f.label}`)}
        </React.Fragment>
      ))}

      {(form.nm || emptyNm()).map((v, i) => (
        <React.Fragment key={`nm-${i}`}>
          <label className={lbl}>CM{i + 1} ({markerName(i + 1)}):</label>
          <select
            value={v || "No"}
            onChange={(e) => {
              const nm = [...(form.nm || emptyNm())];
              nm[i] = e.target.value;
              onChange("nm", nm);
            }}
            className={ctl}
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </React.Fragment>
      ))}
    </div>
  );
}
