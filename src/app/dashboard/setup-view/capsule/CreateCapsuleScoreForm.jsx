"use client";
import React, { useEffect, useState } from "react";
import { ListFilterPlus, X } from "lucide-react";
import toast from "react-hot-toast";
import ScoreFields, { emptyScore, validateScore } from "./ScoreFields";
import { createCapsuleScore, getCapsuleBlocksByCapsuleAndCandidate, getCapsuleCriticalRange } from "@/services/capsuleService";
import { useFormStatus } from "@/context/FormStatusContext";

/** "Insert Scores" form of the capsule Setup View (all fields mandatory, NM fields default "No"). */
export default function CreateCapsuleScoreForm({ capsule, candidate, markerName, onClose, onSaved }) {
  const [form, setForm] = useState(emptyScore);
  const [blocks, setBlocks] = useState([]);
  const [saving, setSaving] = useState(false);
  const { setFormStatus } = useFormStatus();

  useEffect(() => {
    if (!capsule?.id || !candidate?.id) return;
    getCapsuleBlocksByCapsuleAndCandidate(capsule.id, candidate.id).then((list) =>
      setBlocks([...list.filter((b) => b.ppId < 0).sort((a, b) => b.ppId - a.ppId), ...list.filter((b) => b.ppId > 0).sort((a, b) => a.ppId - b.ppId)])
    );
  }, [capsule?.id, candidate?.id]);

  const onChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const block = blocks.find((b) => String(b.id) === String(form.blockId));
    const range = block ? await getCapsuleCriticalRange(capsule.id, candidate.id, block.ppId) : null;
    const err = validateScore(form, range);
    if (err) { toast.error(err); return; }
    setSaving(true);
    setFormStatus("Processing...");
    try {
      await createCapsuleScore({
        ...form,
        capsuleId: capsule.id,
        candidate_id: candidate.id,
        candidate: { id: candidate.id, firstName: candidate.firstName, lastName: candidate.lastName, candidateId: candidate.candidateId },
        durationDays: parseFloat(form.durationDays),
        attainedScore: parseFloat(form.attainedScore),
        maxScore: parseFloat(form.maxScore),
      });
      setFormStatus("Score Created");
      onSaved?.();
      onClose();
    } catch (ex) {
      toast.error(ex.message || "Failed to save score");
      setFormStatus("Submission failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full w-full bg-white z-20 border shadow-2xl border-gray-200">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 text-black font-semibold">
          <ListFilterPlus className="w-5 h-5" />
          Insert Scores
        </div>
        <button type="button" onClick={() => { onClose(); setFormStatus("Ready.."); }} className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {blocks.length === 0 && (
          <p className="mb-3 text-sm text-gray-500">No assessment blocks for this candidate. Add them in Control View → Capsule → Capsule Config.</p>
        )}
        <ScoreFields form={form} onChange={onChange} blocks={blocks} capsuleType={capsule?.capsuleType} markerName={markerName} />
      </div>

      <div className="border-t border-gray-300 p-2 pr-6 bg-gray-50 flex-shrink-0">
        <div className="flex justify-end gap-2">
          <button type="submit" disabled={saving} className="px-4 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </form>
  );
}
