"use client";
import React, { useEffect, useState } from "react";
import { Edit } from "lucide-react";
import toast from "react-hot-toast";
import ScoreFields, { emptyNm, emptyScore, validateScore } from "./ScoreFields";
import { getCapsuleBlocksByCapsuleAndCandidate, getCapsuleCriticalRange, updateCapsuleScore } from "@/services/capsuleService";
import { useFormStatus } from "@/context/FormStatusContext";

/** Entity Editor (left, bottom) – edits the selected Capacity Accounting row. */
export default function CapsuleScoreEditor({ capsule, row, markerName, onSaved }) {
  const [form, setForm] = useState(emptyScore);
  const [blocks, setBlocks] = useState([]);
  const { setFormStatus } = useFormStatus();

  useEffect(() => {
    if (!row) return;
    setForm({ ...emptyScore(), ...row, nm: row.nm || emptyNm() });
    getCapsuleBlocksByCapsuleAndCandidate(capsule.id, row.candidate_id).then(setBlocks);
  }, [row, capsule?.id]);

  if (!row) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-b border-gray-200 font-semibold text-sm">
          <Edit className="w-4 h-4" /> Entity Editor
        </div>
      </div>
    );
  }

  const save = async (e) => {
    e.preventDefault();
    const block = blocks.find((b) => String(b.id) === String(form.blockId));
    const range = block ? await getCapsuleCriticalRange(capsule.id, row.candidate_id, block.ppId, row.id) : null;
    const err = validateScore(form, range);
    if (err) { toast.error(err); return; }
    setFormStatus("Processing...");
    const saved = await updateCapsuleScore(row.id, {
      ...form,
      ppId: block ? block.ppId : row.ppId,
      durationDays: parseFloat(form.durationDays),
      attainedScore: parseFloat(form.attainedScore),
      maxScore: parseFloat(form.maxScore),
    });
    setFormStatus("Score Updated");
    onSaved?.(saved);
  };

  return (
    <form onSubmit={save} className="flex flex-col h-full">
      <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 border-b border-gray-200 font-semibold text-sm">
        <Edit className="w-4 h-4" /> Entity Editor
      </div>
      <div className="flex-1 overflow-auto p-3">
        <ScoreFields
          form={form}
          onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
          blocks={blocks}
          capsuleType={capsule?.capsuleType}
          markerName={markerName}
          compact
        />
      </div>
      <div className="border-t border-gray-300 p-2 pr-4 bg-gray-50 flex justify-end">
        <button type="submit" className="px-4 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800">Edit</button>
      </div>
    </form>
  );
}
