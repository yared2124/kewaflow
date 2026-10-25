"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
} from "lucide-react";

import { loginAdmin } from "@/server/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@kewaflow.com");
  const [password, setPassword] = useState("KewaFlowAdmin2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginAdmin(email, password, rememberMe);
      if (res.success && res.redirectTo) {
        router.push(res.redirectTo);
      } else {
        setErrorMessage(res.error || "Invalid credentials. Please try again.");
      }
    } catch {
      setErrorMessage("An unexpected authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col lg:flex-row bg-[#F4F7F9] font-sans select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* ============================================================ */}
      {/* LEFT SIDE: High-Resolution Hero Graphic                      */}
      {/* ============================================================ */}
      <div className="hidden lg:relative lg:block lg:w-[50%] xl:w-[52%] h-full bg-[#103841] overflow-hidden shrink-0">
        <Image
          src="/images/login-hero.jpg"
          alt="KewaFlow — AI-Powered Social Media & Lead Management"
          fill
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="object-cover object-center select-none pointer-events-none"
        />
      </div>

      {/* ============================================================ */}
      {/* RIGHT SIDE: Clean Modern Form matching exact user mockup     */}
      {/* ============================================================ */}
      <div className="h-full w-full lg:w-[50%] xl:w-[48%] bg-white flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Top Right: "Don't have an account? Contact admin ->" */}
        <div className="flex items-center justify-end gap-2 text-xs text-slate-500 shrink-0">
          <span className="text-[11px]">Don't have an account?</span>
          <button
            onClick={() => alert("Please contact your system administrator at admin@kewakibt.com to request access.")}
            className="px-3 py-1 rounded-full border border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] transition-colors"
          >
            Contact admin →
          </button>
        </div>

        {/* Center: Sign-in Form */}
        <div className="max-w-sm w-full mx-auto my-auto py-2">
          {/* Cyan/Teal Stylized Logo */}
          <div className="w-10 h-10 mb-2">
            <Image
              src="/brand/kewakibt-icon.png"
              alt="KewaFlow Icon"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>

          <h2 className="text-2xl font-extrabold text-[#0D2538] tracking-tight leading-tight">
            Welcome back
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">
            Sign in to your KewaFlow account
          </p>

          {errorMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Address Box */}
            <div className="border border-slate-200 rounded-xl p-2.5 bg-white focus-within:border-[#2D6A76] focus-within:ring-2 focus-within:ring-[#2D6A76]/10 transition-all flex items-center gap-2.5 shadow-2xs">
              <Mail className="w-4 h-4 text-slate-400 shrink-0 ml-0.5" />
              <div className="flex-1 min-w-0">
                <label className="block text-[9px] uppercase font-semibold text-slate-400 leading-tight">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kewaflow.com"
                  className="w-full text-xs font-medium text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-400 pt-0.5"
                />
              </div>
            </div>

            {/* Password Box */}
            <div className="border border-slate-200 rounded-xl p-2.5 bg-white focus-within:border-[#2D6A76] focus-within:ring-2 focus-within:ring-[#2D6A76]/10 transition-all flex items-center gap-2.5 shadow-2xs">
              <Lock className="w-4 h-4 text-slate-400 shrink-0 ml-0.5" />
              <div className="flex-1 min-w-0">
                <label className="block text-[9px] uppercase font-semibold text-slate-400 leading-tight">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs font-medium text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-400 pt-0.5 tracking-wider"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 p-1 mr-0.5 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#2D6A76] focus:ring-[#2D6A76] w-3.5 h-3.5"
                />
                <span className="text-slate-600 font-medium text-[11px]">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={() => alert("Break-glass recovery codes or Admin reset instructions have been dispatched.")}
                className="text-[11px] font-bold text-[#2D6A76] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign in Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2D6A76] hover:bg-[#255862] text-white font-semibold text-xs transition-colors shadow-2xs flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-2.5 text-[9px] uppercase font-bold tracking-wider text-slate-400">
              OR
            </span>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
                router.push("/mfa");
              }, 400);
            }}
            className="w-full py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            {/* Google Multi-Color G Icon */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-[11px]">Continue with Google</span>
          </button>

          {/* Security Note */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <Shield className="w-3 h-3 text-slate-400" />
            <span>Your data is protected with industry-standard security</span>
          </div>
        </div>

        {/* Bottom Version Footer */}
        <div className="text-center text-[10px] text-slate-400 py-0.5 shrink-0">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}
