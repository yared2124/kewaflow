"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  KeyRound,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@kewakibt.com");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // Simulate authentication step and transition to mandatory MFA (AUTH-005)
    setTimeout(() => {
      setIsLoading(false);
      router.push("/mfa");
    }, 600);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row bg-slate-900 overflow-x-hidden">
      {/* LEFT SIDE: Brand Hero (Desktop) */}
      <div className="md:w-1/2 bg-[#0B132B] text-white flex flex-col justify-between p-6 sm:p-10 md:p-14 relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
        {/* Subtle Ambient Glowing Background Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-kewa-teal/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#00CECB]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-1.5 flex items-center justify-center shrink-0 shadow-xs">
              <Image
                src="/brand/kewakibt-icon.png"
                alt="KewaFlow Icon"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">
                KewaFlow
              </span>
              <span className="text-[10px] text-cyan-400 font-medium tracking-wide uppercase">
                Approval-First AI Platform
              </span>
            </div>
          </div>
        </div>

        {/* Center Value Proposition */}
        <div className="my-8 md:my-auto relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kewakibt Software Solutions • Admin Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
            Better Content.
            <br />
            <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              More Leads.
            </span>
            <br />
            Real Growth.
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            The approval-first marketing engine for Kewakibt Software Solutions.
            AI drafts compelling campaigns, you maintain complete administrative review,
            and KewaFlow reliably dispatches to Meta.
          </p>

          {/* 3 Core Invariants */}
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-md bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-white block">Approval Integrity (APR-001)</span>
                <span className="text-slate-400 text-[11px]">
                  Zero autonomous publishing. Every post and ad dollar requires explicit Admin sign-off.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-white block">Anti-Hallucination Grounding (BRD-001)</span>
                <span className="text-slate-400 text-[11px]">
                  All generated content is anchored exclusively in the verified Brand Profile & Service Catalogue.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-white block">Attribution & CRM Truth (CRM-001)</span>
                <span className="text-slate-400 text-[11px]">
                  Likes and impressions are never mislabeled as leads. Only genuine inquiries are tracked.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Hero Info */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400 border-t border-slate-800/80 pt-4">
          <span>Headquarters: Addis Ababa, Ethiopia</span>
          <span className="font-mono text-[11px] text-cyan-400">Security: SEC-001 — SEC-011 Active</span>
        </div>
      </div>

      {/* RIGHT SIDE: Clean Sign-in Card */}
      <div className="md:w-1/2 bg-white flex items-center justify-center p-6 sm:p-10 md:p-14">
        <div className="max-w-md w-full space-y-6">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-kewa-teal border border-teal-100 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Authentication (Screen 1)</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Sign in to KewaFlow
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to manage your approvals, media, and marketing engine.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kewakibt.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-kewa-teal text-slate-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  href="/settings/security"
                  className="text-[11px] text-kewa-teal hover:underline font-medium"
                >
                  Break-glass access?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-kewa-teal text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-kewa-teal focus:ring-kewa-teal w-3.5 h-3.5"
                />
                <span className="text-slate-600 text-xs">Keep me signed in</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Session validity: 30 days
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-kewa-teal hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-2xs"
            >
              {isLoading ? (
                <span>Validating credentials...</span>
              ) : (
                <>
                  <span>Sign In with Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mandatory MFA Notice Banner (AUTH-005, SEC-005) */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-800 block">
                Mandatory MFA Enforced (AUTH-005)
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Optional MFA is prohibited. After entering your password, you will be prompted for your 6-digit TOTP verification code.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] text-slate-400">
              KewaFlow v1.1 • Kewakibt Software Solutions PLC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
