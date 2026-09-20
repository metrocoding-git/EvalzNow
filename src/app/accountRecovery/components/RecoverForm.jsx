"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recoverAccount } from "@/services/accountService";
import toast, { Toaster } from "react-hot-toast";

export default function RecoverForm() {
  const [formData, setFormData] = useState({ username: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRecover = async (e) => {
    e.preventDefault();
    if (loading) return;                 // blocks double submits

    setLoading(true);
    try {
      const res = await recoverAccount({ username: formData.username.trim() });
      toast.success(res.message || "Recovery email sent successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Recovery failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 relative flex items-center justify-center p-12 bg-white">
      <Toaster position="top-right" reverseOrder={false} />

      <div
        className="absolute top-4 left-4 text-sm font-bold cursor-pointer hover:text-gray-900 transition-colors"
        onClick={() => router.push("/login")}
      >
        &lt;&lt; BACK
      </div>

      <form onSubmit={handleRecover} className="w-full max-w-sm space-y-6">
        <h2 className="text-2xl text-black font-bold text-center">EVALZNOW</h2>
        <p className="text-center text-xs">PLEASE ENTER YOUR EMAIL ADDRESS</p>

        <input
          type="text"
          name="username"
          placeholder="EMAIL"
          className="w-full p-3 border border-gray-400 focus:outline-none text-black focus:border-blue-500 transition-colors placeholder-black"
          onChange={handleChange}
          value={formData.username}
        />

        {/* no onClick here: the form's onSubmit already handles it */}
        <button
          type="submit"
          disabled={loading || !formData.username.trim()}
          className="bg-blue-900 text-white py-3 w-full hover:bg-blue-800 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "SENDING..." : "RECOVER"}
        </button>
      </form>

      <div className="absolute bottom-4 right-4 text-xs font-bold">
        © EvalzNow. All Rights Reserved.
      </div>
    </div>
  );
}