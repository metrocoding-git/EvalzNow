"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserRoleRedirect } from '@/utils/authHelpers';
import { login, resetPassword } from "@/services/accountService";
import toast, { Toaster } from "react-hot-toast";
import { useFormStatus } from "@/context/FormStatusContext";


export default function PasswordForm() {
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState('');
  const { setFormStatus } = useFormStatus();
  const router = useRouter();

  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormStatus("Creating");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Optional: validate token with backend before redirect
      router.push("/welcome");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setFormStatus("processing");
      if (!token) {
        setError("Invalid or missing token");
        return;
      }

      const res = await resetPassword({
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setFormStatus("Password Reset Successful");
      // toast.success(res.message || "Password reset successful");

      router.push("/login");
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Reset failed";

      toast.error(msg);
      setError(msg);
      setFormStatus("Ready...");
    }
  };


  return (
    <div className="flex-1 relative flex items-center justify-center p-12 bg-white">
      {/* Top left "Return Home" */}
      <div className="absolute top-4 left-4 text-sm font-bold cursor-pointer hover:text-gray-900 transition-colors" 
        onClick={() => router.push("/login")}
      >
        &lt;&lt; RETURN LOGIN
      </div>
  
      {/* Login Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <h2 className="text-2xl text-black font-bold text-center">EVALZNOW</h2>
        <p className="text-center text-xs">
          PLEASE ENTER YOUR PASSWORD AND CONFIRM PASSWORD
        </p>
  
        <input
          type="text"
          name="password"
          placeholder="PASSWORD"
          className="w-full p-3 border border-gray-400 focus:outline-none text-black focus:border-blue-500 transition-colors placeholder-black"
          onChange={handleChange}
          value={formData.password}
        />

        <input
          type="text"
          name="confirmPassword"
          placeholder="CONFIRM PASSWORD"
          className="w-full p-3 border border-gray-400 focus:outline-none text-black focus:border-blue-500 transition-colors placeholder-black"
          onChange={handleChange}
          value={formData.confirmPassword}
        />
  
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
  
        <button
          type="submit"
          className="bg-blue-900 text-white py-3 w-full hover:bg-blue-800 transition-colors font-medium"
        >
          SUBMIT
        </button>
      </form>
  
      {/* Bottom-right copyright */}
      <div className="absolute bottom-4 right-4 text-xs font-bold">
        © EvalzNow. All Rights Reserved.
      </div>
  
    </div>
  );
  
}
