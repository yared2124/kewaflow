"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Laptop,
  Globe,
  KeyRound,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  RefreshCw,
  LogOut,
  Eye,
  EyeOff,
  Copy,
  Download,
  X,
  ChevronRight,
  Sparkles,
  Share2,
} from "lucide-react";

interface SessionItem {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  isCurrent: boolean;
  lastActive: string;
}

interface SecurityLogItem {
  id: string;
  event: string;
  category: "auth" | "approval" | "integration" | "session";
  location: string;
  device: string;
  time: string;
  status: "Success" | "Verified" | "Authorized";
}

export default function SecuritySettingsPage() {
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [revealCodes, setRevealCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  // Active sessions in Addis Ababa, Ethiopia (PRD / Design mockup)
  const [sessions, setSessions] = useState<SessionItem[]>([
    {
      id: "sess-1",
      device: "MacBook Pro (macOS 15.1)",
      browser: "Google Chrome 129.0",
      location: "Addis Ababa, Ethiopia (Bole Subcity)",
      ip: "196.188.142.74",
      isCurrent: true,
      lastActive: "Active now",
    },
    {
      id: "sess-2",
      device: "iPhone 15 Pro (iOS 18.0)",
      browser: "Mobile Safari",
      location: "Addis Ababa, Ethiopia",
      ip: "196.188.140.22",
      isCurrent: false,
      lastActive: "2 hours ago",
    },
  ]);

  const recoveryCodes = [
    "KEWA-8821-X4B2",
    "KEWA-7719-P09K",
    "KEWA-4102-M28Z",
    "KEWA-6331-T88L",
    "KEWA-9044-K12A",
    "KEWA-5520-W91F",
    "KEWA-3188-B77D",
    "KEWA-2490-Q03N",
  ];

  const securityLogs: SecurityLogItem[] = [
    {
      id: "log-1",
      event: "AUTH_MFA_SUCCESS",
      category: "auth",
      location: "Addis Ababa, Ethiopia",
      device: "Chrome / macOS",
      time: "Today at 08:30 EAT",
      status: "Success",
    },
    {
      id: "log-2",
      event: "RE_AUTH_CHALLENGE",
      category: "approval",
      location: "Addis Ababa, Ethiopia",
      device: "Content Approval #3",
      time: "Today at 09:15 EAT",
      status: "Verified",
    },
    {
      id: "log-3",
      event: "META_TOKEN_ACCESSED",
      category: "integration",
      location: "KewaFlow Server Engine",
      device: "Graph API v21.0 Dispatch",
      time: "Yesterday at 18:42 EAT",
      status: "Authorized",
    },
    {
      id: "log-4",
      event: "SESSION_MFA_ENROLLED",
      category: "session",
      location: "Addis Ababa, Ethiopia",
      device: "TOTP Authenticator",
      time: "10 Oct 2026, 14:10 EAT",
      status: "Success",
    },
  ];

  const handleTerminateOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setAlertNotice("All other remote sessions were terminated successfully.");
    setTimeout(() => setAlertNotice(null), 4000);
  };

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Settings Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Settings
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Security policies, multi-factor authentication, active sessions, and access credentials.
          </p>
        </div>

        {/* Sub-nav Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          <Link
            href="/settings/security"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-slate-900 shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-kewa-teal" />
            Security
          </Link>
          <button
            onClick={() => {
              setAlertNotice("Meta Integrations settings view is available in Integrations tab.");
              setTimeout(() => setAlertNotice(null), 3000);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            Integrations
          </button>
          <button
            onClick={() => {
              setAlertNotice("AI Provider configuration is set to Anthropic & OpenAI adapters with hard monthly caps ($50/mo).");
              setTimeout(() => setAlertNotice(null), 3000);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            AI Providers
          </button>
        </div>
      </div>

      {/* Floating Notice Banner */}
      {alertNotice && (
        <div className="flex items-center justify-between p-3 text-xs bg-teal-50 text-kewa-teal border border-teal-200 rounded-lg animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{alertNotice}</span>
          </div>
          <button
            onClick={() => setAlertNotice(null)}
            className="text-teal-700 hover:text-teal-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Core Security Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* CARD 1: Multi-Factor Authentication (MFA) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Multi-Factor Authentication
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Mandatory protection for publishing & ad spend (AUTH-005, SEC-005)
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Enabled
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Your account is protected with TOTP hardware/authenticator app MFA. Re-authentication is enforced prior to publishing or spending.
            </p>

            {/* Registered Method Details */}
            <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                  <Smartphone className="w-3.5 h-3.5 text-slate-700" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    Authenticator App (TOTP)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    iPhone 15 Pro • Added Oct 10, 2026
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Primary
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Verified 2 hours ago
            </span>
            <button
              onClick={() => setShowMfaModal(true)}
              className="px-3 py-1.5 bg-kewa-teal hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              Manage MFA
            </button>
          </div>
        </div>

        {/* CARD 2: Active Sessions in Addis Ababa */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-kewa-cyan-dark shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Active Sessions
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Current sign-in sessions in Addis Ababa, Ethiopia
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                {sessions.length} Active
              </span>
            </div>

            {/* Session Items */}
            <div className="mt-3 space-y-2">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${sess.isCurrent
                    ? "bg-slate-50/80 border-slate-200"
                    : "bg-white border-slate-100 text-slate-600"
                    }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        {sess.browser}
                        {sess.isCurrent && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-teal-100 text-kewa-teal">
                            Current Session
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {sess.location} • <span className="font-mono text-[10px]">{sess.ip}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 shrink-0">
                    {sess.lastActive}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              IP subnet: Ethio Telecom
            </span>
            <div className="flex items-center gap-2">
              {sessions.length > 1 && (
                <button
                  onClick={handleTerminateOtherSessions}
                  className="px-2.5 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors"
                >
                  Log out others
                </button>
              )}
              <button
                onClick={() => {
                  setAlertNotice("All current sessions are localized to authorized Addis Ababa networks.");
                  setTimeout(() => setAlertNotice(null), 3500);
                }}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                View all sessions
              </button>
            </div>
          </div>
        </div>

        {/* CARD 3: Recovery Options (Break-Glass Protocol) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Recovery Options
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Emergency account lockout & break-glass access (SEC-006)
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                8 Codes Remaining
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Set up recovery codes for account lockout. Compliant with break-glass recovery requirements with audited identity re-verification.
            </p>

            {/* Quick Preview Box */}
            <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-800">
                  Emergency Vault Codes
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {revealCodes ? "KEWA-8821-X4B2 • KEWA-7719-P09K..." : "••••-••••-•••• • ••••-••••-••••"}
                </div>
              </div>
              <button
                onClick={() => setRevealCodes(!revealCodes)}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded transition-colors"
                title={revealCodes ? "Hide codes" : "Reveal codes"}
              >
                {revealCodes ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Verified email: yared@kewakibt.com
            </span>
            <button
              onClick={() => setShowRecoveryModal(true)}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Manage recovery
            </button>
          </div>
        </div>

        {/* CARD 4: Security Logs */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-kewa-teal shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Security Logs
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Immutable append-only audit trail (SEC-007)
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Tamper Evident
              </span>
            </div>

            {/* Micro Log Table */}
            <div className="mt-3 space-y-1.5">
              {securityLogs.map((log) => (
                <div
                  key={log.id}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <div>
                      <div className="font-mono text-[11px] font-semibold text-slate-800">
                        {log.event}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {log.location} • {log.device}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">
                      {log.status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {log.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Database-level append-only enforced
            </span>
            <Link
              href="/audit"
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              View logs
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* MODAL 1: Manage MFA Details */}
      {showMfaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Manage Multi-Factor Authentication
                </h3>
              </div>
              <button
                onClick={() => setShowMfaModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs text-emerald-900">
                  <span className="font-bold">MFA is Active & Enforced</span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Configured via Time-based One-Time Password (TOTP, RFC 6238).
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700">
                  Registered Device
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">
                      iPhone 15 Pro
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Google Authenticator / 1Password
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                    Primary
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-700">
                  Secret Key Fingerprint
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 font-mono text-[11px] text-slate-800 flex items-center justify-between">
                  <span>KEWA-TOTP-7881-A099-B74F</span>
                  <span className="text-[10px] text-slate-500">SHA-256</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowMfaModal(false)}
                className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowMfaModal(false);
                  setAlertNotice("MFA secret refreshed. Please scan new QR code on next login.");
                  setTimeout(() => setAlertNotice(null), 3500);
                }}
                className="px-3 py-1.5 bg-kewa-teal hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
              >
                Re-enroll Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Recovery Codes */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Break-Glass Recovery Codes
                </h3>
              </div>
              <button
                onClick={() => setShowRecoveryModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Treat these codes like your master password
                </p>
                <p className="text-[11px] text-amber-800 mt-1">
                  Each code can be used exactly once. Store them in an offline safe or your corporate password manager.
                </p>
              </div>

              {/* Codes Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800">
                {recoveryCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 bg-white rounded border border-slate-100 text-center text-[11px] font-semibold"
                  >
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>8 of 10 codes remaining</span>
                <button
                  onClick={handleCopyCodes}
                  className="flex items-center gap-1 text-kewa-teal hover:underline font-medium"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedCode ? "Copied!" : "Copy all codes"}
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowRecoveryModal(false)}
                className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium"
              >
                Done
              </button>
              <button
                onClick={() => {
                  setAlertNotice("Recovery codes downloaded to secure vault file.");
                  setShowRecoveryModal(false);
                  setTimeout(() => setAlertNotice(null), 3000);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Download Codes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
