"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Smartphone,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export default function MfaPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(["1", "2", "3", "4", "5", "6"]);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("KEWA-8821-X4B2");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input if digits empty
    if (!useBackupCode && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [useBackupCode]);

  const handleDigitChange = (index: number, value: string) => {
    // Take only the last character entered
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance to next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newDigits = pastedData.split("");
      setDigits(newDigits);
      inputRefs.current[5]?.focus();
      setErrorMessage(null);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!useBackupCode) {
      const code = digits.join("");
      if (code.length < 6) {
        setErrorMessage("Please enter all 6 digits of your verification code.");
        return;
      }
    } else {
      if (!backupCode.trim()) {
        setErrorMessage("Please enter a valid recovery code.");
        return;
      }
    }

    setIsVerifying(true);
    setErrorMessage(null);

    // Simulate cryptographic verification and session issuance
    setTimeout(() => {
      setIsVerifying(false);
      router.push("/dashboard");
    }, 700);
  };

  return (
    <div className="min-h-screen w-screen bg-[#0B132B] flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Subtle Background Lighting */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-kewa-teal/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-[#00CECB]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link href="/login" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center">
            <Image
              src="/brand/kewakibt-icon.png"
              alt="KewaFlow Icon"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="text-base font-bold text-white tracking-tight">
            KewaFlow
          </span>
        </Link>
        <span className="text-[11px] font-mono text-cyan-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
          SEC-005 MFA Check
        </span>
      </div>

      {/* Centered MFA Security Card */}
      <div className="relative z-10 max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-kewa-teal mx-auto shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Two-Factor Authentication
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Enter the 6-digit verification code from your authenticator app for{" "}
              <strong className="text-slate-800">admin@kewakibt.com</strong>.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            {!useBackupCode ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 text-center mb-3">
                  Verification Code (TOTP)
                </label>
                <div
                  className="flex items-center justify-center gap-2 sm:gap-2.5"
                  onPaste={handlePaste}
                >
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono border-2 border-slate-200 rounded-xl focus:border-kewa-teal focus:ring-2 focus:ring-kewa-teal/20 focus:outline-none text-slate-900 transition-all bg-slate-50"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 text-center mt-2.5">
                  Type your 6 digits or paste the complete code
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Emergency Recovery Code (SEC-006)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                    placeholder="KEWA-XXXX-XXXX"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold tracking-wider border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-kewa-teal text-slate-800 uppercase"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter one of your 8 remaining one-time break-glass recovery codes.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-kewa-teal hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-2xs"
            >
              {isVerifying ? (
                <span>Verifying TOTP Signature...</span>
              ) : (
                <>
                  <span>Verify & Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between TOTP and Backup code */}
          <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setErrorMessage(null);
              }}
              className="text-kewa-teal hover:underline font-semibold text-xs"
            >
              {useBackupCode
                ? "Use Authenticator App (TOTP) instead"
                : "Use a one-time backup recovery code"}
            </button>

            <Link
              href="/login"
              className="text-slate-400 hover:text-slate-600 text-[11px] flex items-center gap-1 mt-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to login</span>
            </Link>
          </div>
        </div>

        {/* Security Invariant Callout */}
        <div className="mt-4 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs text-slate-300 text-center max-w-md mx-auto">
          <p className="text-[11px]">
            <strong className="text-cyan-300">Invariant AUTH-005 Active:</strong> MFA is mandatory.
            All sessions are tied to your cryptographic key and logged in the immutable audit trail.
          </p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 text-center text-xs text-slate-500 py-2">
        KewaFlow v1.1 • Kewakibt Software Solutions PLC
      </div>
    </div>
  );
}
