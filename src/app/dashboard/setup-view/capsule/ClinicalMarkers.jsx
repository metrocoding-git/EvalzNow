"use client";
import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { CLINICAL_MARKERS, CUSTOM_MARKER_MAX_LENGTH } from "../../control-view/capsule/capsuleConfig";
=======
import { CLINICAL_MARKERS } from "../../control-view/capsule/capsuleConfig";
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb
import { updateCapsuleMarkerName } from "@/services/capsuleService";
import { useFormStatus } from "@/context/FormStatusContext";

/** First custom marker (CM89 … CM100 are "Custom Criteria #1 … #12" and can be renamed per capsule). */
const FIRST_CUSTOM = 89;

/**
 * "Scoring & Monitoring Markers" – the 100 Clinical Markers in two column pairs (CM 1–50 | CM 51–100),
 * same layout as the unit "Scoring Criteria" table.
 */
export default function ClinicalMarkers({ capsuleId, markerNames, onChanged }) {
  const [draft, setDraft] = useState({});
  const { setFormStatus } = useFormStatus();

  useEffect(() => { setDraft(markerNames || {}); }, [markerNames]);

  const save = async (i) => {
    const value = (draft[i] || "").trim();
    if ((markerNames?.[i] || "") === value) return;
    await updateCapsuleMarkerName(capsuleId, i, value);
    setFormStatus("Clinical Marker Updated");
    onChanged?.();
  };

  const cell = (i) =>
    i >= FIRST_CUSTOM ? (
      <input
        type="text"
<<<<<<< HEAD
        maxLength={CUSTOM_MARKER_MAX_LENGTH}
        title={`Up to ${CUSTOM_MARKER_MAX_LENGTH} characters`}
=======
        maxLength={40}
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb
        value={draft[i] || ""}
        placeholder={CLINICAL_MARKERS[i - 1]}
        onChange={(e) => setDraft((d) => ({ ...d, [i]: e.target.value }))}
        onBlur={() => save(i)}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="w-full border border-gray-200 px-2 py-0.5 text-center text-xs bg-white"
      />
    ) : (
      CLINICAL_MARKERS[i - 1]
    );

  return (
    <table className="w-full text-xs border-collapse">
      <thead className="bg-gray-100 sticky top-0 z-10">
        <tr>
          <th className="border border-gray-400 px-2 py-1 w-14">CM</th>
          <th className="border border-gray-400 px-2 py-1">Clinical Markers</th>
          <th className="border border-gray-400 px-2 py-1 w-14">CM</th>
          <th className="border border-gray-400 px-2 py-1">Clinical Markers</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 50 }, (_, r) => (
          <tr key={r}>
            <td className="border px-2 py-1 text-center">{r + 1}</td>
            <td className="border px-2 py-1 text-center">{cell(r + 1)}</td>
            <td className="border px-2 py-1 text-center">{r + 51}</td>
            <td className="border px-2 py-1 text-center">{cell(r + 51)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
