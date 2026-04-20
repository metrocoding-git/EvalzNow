"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { getUserRoleRedirect } from '@/utils/authHelpers';
import { login, recoverAccount } from "@/services/accountService";
import toast, { Toaster } from "react-hot-toast";


export default function RecoverForm() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const res = await recoverAccount({
        username: formData.username,
      });
  
      toast.success(res.message);
  
    } catch (err) {
      setError(err.response?.data?.message || "Recovery failed");
    }
  };

  return (
    <div className="flex-1 relative flex items-center justify-center p-12 bg-white">
      {/* Top left "Return Home" */}
      <div className="absolute top-4 left-4 text-sm font-bold cursor-pointer hover:text-gray-900 transition-colors" 
        onClick={() => router.push("/login")}
      >
        &lt;&lt; BACK
      </div>
  
      {/* Login Form */}
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
        <h2 className="text-2xl text-black font-bold text-center">EVALZNOW</h2>
        <p className="text-center text-xs">
          PLEASE ENTER YOUR EMAIL ADDRESS
        </p>
  
        <input
          type="text"
          name="username"
          placeholder="EMAIL"
          className="w-full p-3 border border-gray-400 focus:outline-none text-black focus:border-blue-500 transition-colors placeholder-black"
          onChange={handleChange}
          value={formData.username}
        />
  
        {/* {error && <p className="text-red-600 text-sm text-center">{error}</p>} */}
  
        <button
          type="submit"
          className="bg-blue-900 text-white py-3 w-full hover:bg-blue-800 transition-colors font-medium"
          onClick={handleLogin}
        >
          RECOVER
        </button>
      </form>
  
      {/* Bottom-right copyright */}
      <div className="absolute bottom-4 right-4 text-xs font-bold">
        © EvalzNow. All Rights Reserved.
      </div>
  
    </div>
  );
  
}
