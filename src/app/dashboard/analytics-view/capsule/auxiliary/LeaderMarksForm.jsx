"use client";
import { useFormStatus } from "@/context/FormStatusContext";
import { createCandidateMarks, createLeaderMarks, updateCandidateMarks, updateLeaderMarks } from "@/services/capsuleAuxiliaryService";
import { getCapsuleAsUnit as getUnitById } from "@/services/capsuleAnalyticsService";
import { ListFilterPlus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const impactTypes = ["Negative", "Positive"];

const concernResolved = ["Yes", "No"];

const initialForm = {
  staffLookupId: "",
  impactType: "",
  concernIdentified: "",
  identityDate: "",
  concernResolved: "",
  resolutionDate: "",
};

export default function LeaderMarksForm({ onClose, onSuccess, entryNumber = 1 , unitId, editData, isOpen}) {
  const [form, setForm] = useState(initialForm);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaderData, setleaderData] = useState();
  const { setFormStatus } = useFormStatus();

  const todayStr = new Date().toISOString().split("T")[0];

  const handleChange = (label, value) => {
    setForm((prev) => ({ ...prev, [label]: value }));
  };

  // Validate required fields
  const isFormValid = () => {
    return (
      form.impactType.trim() !== "" &&
      form.concernIdentified.trim() !== "" &&
      form.identityDate.trim() !== ""
    );
  };


  useEffect(() => {
    const fetchLeaderData = async () => {
      try {
        if (!unitId) return;
  
        const data = await getUnitById(unitId);
        setleaderData(data.staffAssignments);
        
      } catch (err) {
        console.error("Error fetching auxiliary data", err);
      }
    };
  
    fetchLeaderData();
  }, [unitId]);

  useEffect(() => {
    if (!isOpen) return;
  
    if (editData) {
      setForm({
        staffLookupId: editData.staffLookupId || "",
        impactType: editData.impactType || "",
        concernIdentified: editData.concernIdentified || "",
        identityDate: editData.identityDate || "",
        concernResolved: editData.concernResolved || "",
        resolutionDate: editData.resolutionDate || "",
      });
    } else {
      setForm(initialForm);
    }
  }, [editData, isOpen]);

  useEffect(() => {
    if (!editData) {
      setForm(initialForm);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (form.concernIdentified.length > 80) {
      toast.error("Concern Identified cannot exceed 80 characters.");
      return;
    }
    setFormStatus("Processing...");
    setIsSubmitting(true);

    try {
      const data = {
        unitId: unitId,
        staffLookupId: form.staffLookupId,
        impactType: form.impactType,
        concernIdentified: form.concernIdentified,
        identityDate: form.identityDate,
        concernResolved: form.concernResolved || "No",
        resolutionDate: form.resolutionDate,
      };

      let response;

      if (editData) {
        response = await updateLeaderMarks(editData.id, data);
      } else {
        response = await createLeaderMarks(data);
      }
  
      if (response) {
        onSuccess();
        onClose();
        setFormStatus("Leader Mark Created");
        setForm(initialForm);
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
          {editData ? "Edit Leader Mark" : "Create Leader Mark"}
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

            {/* Staff leader/Accessor */}
          <label className="col-span-1 text-gray-700 flex items-center">
            Staff Leader/Accessor: <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            className="col-span-1 border border-gray-300 px-2 py-1 bg-white text-sm"
            value={form.staffLookupId || ""}
            onChange={(e) => handleChange("staffLookupId", e.target.value)}
            required
            >
            <option value="" disabled>Select Leader</option>
            {leaderData
                ?.filter((leader) => leader.roleType === "Leader") // optional: show only leaders
                .map((leader) => (
                <option key={leader.id} value={leader.id}>
                    {leader.staff.firstName} {leader.staff.lastName}
                </option>
                ))}
          </select>

          {/* Impact Type */}
          <label className="col-span-1 text-gray-700 flex items-center">
            Impact Type: <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            className="col-span-1 border border-gray-300 px-2 py-1 bg-white text-sm"
            value={form.impactType}
            onChange={(e) => handleChange("impactType", e.target.value)}
            required
          >
            <option value="" disabled>Select Type</option>
            {impactTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Concern Identified */}
          <label className="col-span-1 text-gray-700 flex items-center">
            Concern Identified: <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            maxLength={80}
            className="col-span-1 border border-gray-300 px-2 py-1 text-sm"
            value={form.concernIdentified}
            onChange={(e) => handleChange("concernIdentified", e.target.value)}
            required
          />

          {/* Identity Date */}
          <label className="col-span-1 text-gray-700 flex items-center">
            Identity Date: <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="date"
            max={todayStr}
            className="col-span-1 border border-gray-300 px-2 py-1 text-sm"
            value={form.identityDate}
            onChange={(e) => handleChange("identityDate", e.target.value)}
            required
          />

          {/* concern resolved */}
          <label className="col-span-1 text-gray-700 flex items-center">
            Concern Resolved:
          </label>
          <select
            className="col-span-1 border border-gray-300 px-2 py-1 bg-white text-sm"
            value={form.concernResolved}
            onChange={(e) => handleChange("concernResolved", e.target.value)}
            
          >
            <option value="" disabled>Select Type</option>
            {concernResolved.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Resolution Date */}
          <label className="col-span-1 text-gray-700 flex items-center">
            Resolution Date: 
          </label>
          <input
            type="date"
            max={todayStr}
            className="col-span-1 border border-gray-300 px-2 py-1 text-sm"
            value={form.resolutionDate}
            onChange={(e) => handleChange("resolutionDate", e.target.value)}
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
