"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { getUserRoleRedirect } from '@/utils/authHelpers';

export default function LoginForm() {
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await res.json();
      const redirectTo = getUserRoleRedirect(data.role);
      router.push(redirectTo);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 relative flex items-center justify-center p-12 bg-white">
      <div className="absolute top-4 left-4 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
        &lt;&lt; RETURN HOME
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
        <h2 className="text-2xl text-black font-bold text-center">EVALZNOW</h2>
        <p className="text-center text-xs text-gray-500">
          PLEASE ENTER YOUR USERNAME AND PASSWORD TO LOGIN
        </p>

        <input
          type="text"
          name="username"
          placeholder="USERNAME"
          className="w-full p-3 border border-gray-400 focus:outline-none text-black focus:border-blue-500 transition-colors"
          onChange={handleChange}
          value={formData.username}
        />

        <input
          type="password"
          name="password"
          placeholder="PASSWORD"
          className="w-full p-3 border border-gray-400 focus:outline-none text-black focus:border-blue-500 transition-colors"
          onChange={handleChange}
          value={formData.password}
        />

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <div className="text-right text-xs text-blue-700 hover:underline cursor-pointer">
          RECOVER PASSWORD
        </div>

        <button
          type="submit"
          className="bg-blue-900 text-white py-3 w-full hover:bg-blue-800 transition-colors font-medium"
        >
          LOGIN
        </button>

        <div className="text-center text-xs text-gray-400 mt-4">
          © EvalzNow. All Rights Reserved.
        </div>
      </form>
    </div>
  );
}
