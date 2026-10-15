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
  Sparkles,
  Calendar,
  Users,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@kewaflow.com");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/mfa");
    }, 500);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col lg:flex-row bg-[#F4F7F9] overflow-x-hidden font-sans">
      {/* ============================================================ */}
      {/* LEFT SIDE: Deep Petrol Teal Hero with 3D Mockup              */}
      {/* ============================================================ */}
      <div className="lg:w-[52%] bg-gradient-to-br from-[#123942] via-[#164854] to-[#0E2F37] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-14 relative overflow-hidden shrink-0">
        {/* Soft Background Radial Lighting */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#00CECB]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#134E5E]/40 rounded-full blur-2xl pointer-events-none" />

        {/* 1. Header: Logo & Tagline */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-1.5 flex items-center justify-center shrink-0 shadow-xs">
              <Image
                src="/brand/kewakibt-icon.png"
                alt="KewaFlow Icon"
                width={28}
                height={28}
                className="object-contain brightness-200"
                priority
              />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white block leading-none">
                KewaFlow
              </span>
              <span className="text-[11px] text-teal-100/70 font-medium tracking-normal mt-1 block">
                AI-Powered Social Media & Lead Management
              </span>
            </div>
          </div>
        </div>

        {/* 2. Main Headline & Subtitle */}
        <div className="relative z-10 my-8 lg:my-0 space-y-4 max-w-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Grow Your Brand,
            <br />
            <span className="text-teal-200">Smarter.</span>
          </h1>

          <p className="text-xs sm:text-sm text-teal-100/75 max-w-md leading-relaxed font-normal">
            Create, schedule, and manage your social media content — all in one place. Turn your ideas into engagement and real business growth.
          </p>

          {/* 3 Core Feature Items */}
          <div className="space-y-4 pt-3">
            {/* Feature 1 */}
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-teal-200 shrink-0">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">
                  AI Content Creation
                </span>
                <span className="text-[11px] text-teal-100/70 block">
                  Generate high-quality content with AI
                </span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-teal-200 shrink-0">
                <Calendar className="w-4 h-4 text-teal-200" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">
                  Smart Scheduling
                </span>
                <span className="text-[11px] text-teal-100/70 block">
                  Post at the best time, automatically
                </span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-teal-200 shrink-0">
                <Users className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">
                  Lead Management
                </span>
                <span className="text-[11px] text-teal-100/70 block">
                  Turn engagement into real business
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Devices Graphic (Laptop + Mobile + Social Floating Badges) */}
        <div className="relative z-10 hidden sm:block absolute right-4 lg:right-6 bottom-16 lg:bottom-12 w-64 lg:w-72 pointer-events-none">
          <Image
            src="/images/login-devices.png"
            alt="KewaFlow Dashboard and Mobile App Mockup"
            width={320}
            height={360}
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* 3. Bottom Hand-drawn Script Tagline */}
        <div className="relative z-10 pt-4">
          <div className="inline-block transform -rotate-3 text-cyan-200 font-serif italic text-lg sm:text-xl tracking-wide select-none">
            <span className="block">Build your brand.</span>
            <span className="block">Grow your business.</span>
            {/* Hand-drawn Underline SVG */}
            <svg
              className="w-36 h-2 text-cyan-300/80 mt-0.5"
              viewBox="0 0 144 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 5.5C40 2 100 2 142 5.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT SIDE: Clean Modern Form matching exact user mockup     */}
      {/* ============================================================ */}
      <div className="lg:w-[48%] bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        {/* Top Right: "Don't have an account? Contact admin ->" */}
        <div className="flex items-center justify-end gap-2.5 text-xs text-slate-500">
          <span>Don't have an account?</span>
          <button
            onClick={() => alert("Please contact your system administrator at admin@kewakibt.com to request access.")}
            className="px-3.5 py-1.5 rounded-full border border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
          >
            Contact admin →
          </button>
        </div>

        {/* Center: Sign-in Form */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          {/* Cyan/Teal Stylized Logo */}
          <div className="w-11 h-11 mb-3">
            <Image
              src="/brand/kewakibt-icon.png"
              alt="KewaFlow Icon"
              width={44}
              height={44}
              className="object-contain"
            />
          </div>

          <h2 className="text-3xl font-extrabold text-[#0D2538] tracking-tight">
            Welcome back
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Sign in to your KewaFlow account
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email Address Box */}
            <div className="border border-slate-200 rounded-xl p-3 bg-white focus-within:border-[#2D6A76] focus-within:ring-2 focus-within:ring-[#2D6A76]/10 transition-all flex items-center gap-3 shadow-2xs">
              <Mail className="w-5 h-5 text-slate-400 shrink-0 ml-0.5" />
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-medium text-slate-400 leading-tight">
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
            <div className="border border-slate-200 rounded-xl p-3 bg-white focus-within:border-[#2D6A76] focus-within:ring-2 focus-within:ring-[#2D6A76]/10 transition-all flex items-center gap-3 shadow-2xs">
              <Lock className="w-5 h-5 text-slate-400 shrink-0 ml-0.5" />
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-medium text-slate-400 leading-tight">
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
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#2D6A76] focus:ring-[#2D6A76] w-4 h-4"
                />
                <span className="text-slate-600 font-medium text-xs">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={() => alert("Break-glass recovery codes or Admin reset instructions have been dispatched.")}
                className="text-xs font-bold text-[#2D6A76] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign in Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#2D6A76] hover:bg-[#255862] text-white font-semibold text-xs transition-colors shadow-2xs flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400">
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
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors shadow-2xs"
          >
            {/* Google Multi-Color G Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>Continue with Google</span>
          </button>

          {/* Security Note */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Your data is protected with industry-standard security</span>
          </div>
        </div>

        {/* Bottom Version Footer */}
        <div className="text-center text-[10px] text-slate-400 py-1">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}
