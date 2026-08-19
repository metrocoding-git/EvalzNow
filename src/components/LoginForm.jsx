"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { getUserRoleRedirect } from '@/utils/authHelpers';
import { login } from "@/services/accountService";
import toast, { Toaster } from "react-hot-toast";


export default function LoginForm() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Optional: validate token with backend before redirect
      router.push("/welcome");
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await login(formData);

      // ✅ Show success toast
      toast.success("Login successful!");

      // Save JWT in localStorage
      localStorage.setItem("token", res.token);
      sessionStorage.setItem('activeClientId', res.user.clientId);

      // Save logged-in user data in localStorage
      localStorage.setItem("user", JSON.stringify(res.user));

      router.push("/welcome");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Login failed");
      setError(err.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <div className="flex-1 relative flex items-center justify-center p-6 sm:p-8 md:p-12 bg-white min-h-[600px] md:min-h-0">
      {/* Top left "Return Home" */}
      <a
        href="/"
        aria-label="Return home"
        title="Return home"
        className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white shadow-md transition hover:scale-105 hover:shadow-lg"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-[#7a1229]">
          <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>


      {/* Login Form */}
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
        <h2 className="text-2xl text-black font-bold text-center">EVALZNOW</h2>
        <p className="text-center text-xs">
          PLEASE ENTER YOUR USERNAME AND PASSWORD TO LOGIN
        </p>

        <input
          type="text"
          name="username"
          placeholder="EMAIL"
          className="w-full p-3 border border-gray-400 focus:outline-none text-black focus:border-blue-500 transition-colors placeholder-black"
          onChange={handleChange}
          value={formData.username}
        />

        <input
          type="password"
          name="password"
          placeholder="PASSWORD"
          className="w-full p-3 border border-gray-400 focus:outline-none text-black focus:border-blue-500 transition-colors placeholder-black"
          onChange={handleChange}
          value={formData.password}
        />

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <div className="text-center text-xs cursor-pointer" onClick={() => router.push("/accountRecovery")}>
          RECOVER PASSWORD
        </div>

        <button
          type="submit"
          className="bg-blue-900 text-white py-3 w-full hover:bg-blue-800 transition-colors font-medium"
        >
          LOGIN
        </button>
      </form>

      {/* Bottom-right copyright */}
      <div className="absolute bottom-4 right-4 text-xs font-bold">
        © EvalzNow. All Rights Reserved.
      </div>

    </div>
  );

}
