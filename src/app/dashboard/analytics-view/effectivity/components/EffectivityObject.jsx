"use client";
import { useEffect, useMemo, useState } from "react";
import { ListFilterPlus, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { deleteEffectivity, saveEffectivity } from "@/services/effectivityService";

export const EFFECTIVITY_FIELD_LABELS = [
  ["effectivityType", "Effectivity Type"],
  ["effectivityGap", "Effectivity Gap"],
  ["effectivitySegment", "Effectivity Segment"],
  ["effectivityContext", "Effectivity Context"],
  ["effectivityPurpose", "Effectivity Purpose"],
];

const emptyForm = () => Object.fromEntries(EFFECTIVITY_FIELD_LABELS.map(([k]) => [k, ""]));

/**
 * "+" form of the Effectivity menu: pick a PP ID Callout and choose the five
 * Effectivity categories. Saving an existing PP ID updates it.
 */
export default function EffectivityObject({ onClose, unitId, candidateId, rows = [], options, initialPpId, onSaved }) {
  const [ppId, setPpId] = useState(initialPpId ?? "");
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const current = useMemo(() => rows.find((r) => String(r.ppId) === String(ppId)) || null, [rows, ppId]);

  useEffect(() => {
    setForm(current ? Object.fromEntries(EFFECTIVITY_FIELD_LABELS.map(([k]) => [k, current[k] || ""])) : emptyForm());
  }, [current]);

  const hasAnyValue = Object.values(form).some(Boolean);

  const handleSave = async () => {
    if (ppId === "" || !candidateId) return;
    setSaving(true);
    try {
      const payload = { unitId: Number(unitId), candidateId: Number(candidateId), ppId: Number(ppId) };
      EFFECTIVITY_FIELD_LABELS.forEach(([k]) => { payload[k] = form[k] || null; });
      await saveEffectivity(payload);
      toast.success(current?.id ? "Effectivity object updated" : "Effectivity object saved");
      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error("Save effectivity failed:", err);
      toast.error(err?.response?.data?.message || "Could not save the effectivity object");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!current?.id) return;
    if (!window.confirm(`Remove the effectivity object of PP ID ${ppId}?`)) return;
    setSaving(true);
    try {
      await deleteEffectivity(current.id);
      toast.success("Effectivity object removed");
      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error("Delete effectivity failed:", err);
      toast.error("Could not remove the effectivity object");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white z-20 border shadow-2xl border-gray-200">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 text-black font-semibold">
          <ListFilterPlus className="w-5 h-5" />
          Effectivity Object
        </div>
        <button onClick={onClose} aria-label="Close" className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 text-xs space-y-3">
        <div className="grid grid-cols-3 items-center gap-3">
          <label className="text-gray-700 font-medium">PP ID Callout:</label>
          <select
            className="col-span-2 border px-2 py-1"
            value={ppId}
            onChange={(e) => setPpId(e.target.value)}
          >
            <option value="" disabled>Select PP ID</option>
            {rows.length === 0 && <option value="" disabled>No available PP IDs</option>}
            {rows.map((r) => (
              <option key={r.ppId} value={r.ppId}>
                {r.ppId}{r.id ? " (saved)" : ""}
              </option>
            ))}
          </select>
        </div>

        {EFFECTIVITY_FIELD_LABELS.map(([key, label]) => (
          <div key={key} className="grid grid-cols-3 items-center gap-3">
            <label className="text-gray-700">{label}:</label>
            <select
              className="col-span-2 border px-2 py-1 disabled:bg-gray-50"
              value={form[key]}
              disabled={ppId === ""}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            >
              <option value="">Select {label}</option>
              {(options?.options?.[key] || []).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2 bg-gray-50">
        <div>
          {current?.id && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm">Close</button>
          <button
            onClick={handleSave}
            disabled={saving || ppId === "" || !hasAnyValue}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : current?.id ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
