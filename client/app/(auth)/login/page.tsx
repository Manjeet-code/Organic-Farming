"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLoginSubmit = async (emailToUse: string, passwordToUse: string) => {
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", {
        email: emailToUse,
        password: passwordToUse,
      });

      login(data);

      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLoginSubmit(email, password);
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    handleLoginSubmit(demoEmail, "password123");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-200/50 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-3 cursor-pointer mb-2">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-emerald-950 p-1 border border-emerald-700 shadow-sm flex items-center justify-center">
            <img src="/icon.png" alt="The Farm Brothers Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col text-left">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              THE FARM <span className="text-emerald-600 font-extrabold">BROTHERS</span>
            </h2>
            <span className="text-[10px] font-semibold text-emerald-700 tracking-wider uppercase mt-0.5">
              From Our Farm For Your Family
            </span>
          </div>
        </Link>
        <h2 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Need a customer account?{" "}
          <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-500 transition">
            Register here
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/60 sm:rounded-2xl sm:px-10 border border-slate-200">

          {/* Demo Account Shortcuts for Fast Testing */}
          <div className="mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <p className="font-bold text-slate-700 mb-2">🚀 Quick Role Demo Accounts (One-Click):</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount("customer@farmfresh.com")}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold py-1.5 px-2 rounded-lg border border-emerald-300 transition text-center truncate"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("ops.gomti@farmfresh.com")}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-1.5 px-2 rounded-lg border border-blue-300 transition text-center truncate"
              >
                Delivery Ops
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("admin@farmfresh.com")}
                className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold py-1.5 px-2 rounded-lg border border-amber-300 transition text-center truncate"
              >
                Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Email Address</label>
              <div className="mt-1.5">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-slate-300 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 text-sm outline-none transition"
                  placeholder="name@farmfresh.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Password</label>
              <div className="mt-1.5">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-slate-300 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 text-sm outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full justify-center rounded-xl bg-emerald-600 py-3.5 px-4 text-sm font-bold text-white shadow-md hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

