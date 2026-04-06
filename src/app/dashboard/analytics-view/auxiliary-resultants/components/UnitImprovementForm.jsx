"use client";
import { useFormStatus } from "@/context/FormStatusContext";
import { createCandidateMarks, createUnitImprovement } from "@/services/auxiliaryService";
import { ListFilterPlus, X } from "lucide-react";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function UnitImprovementForm({ onClose, onSuccess, entryNumber = 1 , unitId}) {
  const [form, setForm] = useState({
    lesson: ""});
  const { setFormStatus } = useFormStatus();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (label, value) => {
    setForm((prev) => ({ ...prev, [label]: value }));
  };

  // Validate required fields
  const isFormValid = () => {
    return (
      form.lesson.trim() !== ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!isFormValid()) {
      toast.error("Please fill all required fields.");
      return;
    }
  
    if (form.lesson.length > 80) {
      toast.error("Concern Identified cannot exceed 80 characters.");
      return;
    }
    setFormStatus("Processing...");
    setIsSubmitting(true);
  
    try {
      
  
      const data = {
        unitId: unitId,
        lesson: form.lesson,
      };
  
      const response = await createUnitImprovement(data);
  
      if (response) {
        onSuccess();
        onClose();
        setFormStatus("Assessment Chain Created");
        
      }
    } catch (error) {
      toast.error("Failed to save entry.");
      setFormStatus("Creating...");
    } finally {
      setIsSubmitting(false);
      
    }
  };
  

  return (
    <form className="flex flex-col h-full w-full bg-white border shadow-2xl border-gray-200" onSubmit={handleSubmit}>
      
      {/* HEADER */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2 text-black font-semibold">
          <ListFilterPlus className="w-5 h-5" />
          Create Unit Improvement & Optimization Entry
        </div>

        <button
          onClick={onClose}
          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-1 space-y-3 text-sm max-w-xl">

          {/* Impact Type */}
          <label className="col-span-1 text-gray-700 flex items-center">
            Lesson Learned or Improvement: <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            maxLength={80}
            className="col-span-1 border border-gray-300 px-2 py-1 text-sm"
            value={form.lesson}
            onChange={(e) => handleChange("lesson", e.target.value)}
            required
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-gray-300 p-2 pr-6 bg-gray-50">
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className={`px-4 py-1 bg-gray-200 text-sm ${
              !isFormValid() || isSubmitting
                ? "cursor-not-allowed"
                : "hover:bg-gray-300"
            }`}
          >
            Close
          </button>
        </div>
      </div>

      <Toaster position="top-right" />
    </form>
  );
}
