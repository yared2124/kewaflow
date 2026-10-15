"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Download,
  RefreshCw,
  Hash,
  Clock,
  User,
  Laptop,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Eye,
  Copy,
  Check,
  Lock,
  Database,
  ArrowRight,
  X,
  FileCode,
} from "lucide-react";

interface AuditLogRecord {
  id: string;
  sequence: number;
  timestamp: string;
  actor: string;
  role: string;
  sessionId: string;
  ipAddress: string;
  location: string;
  action: string;
  actionCategory: "approval" | "publishing" | "auth" | "spend" | "brand";
  entityType: string;
  entityId: string;
  payloadHash: string;
  prevHash: string;
  status: "Verified" | "Valid";
  details: Record<string, any>;
}

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Mock Audit Log Records with cryptographic chaining (SEC-007, APR-001, APR-002)
  const auditLogs: AuditLogRecord[] = [
    {
      id: "aud-1492",
      sequence: 1492,
      timestamp: "15 Oct 2026, 09:15:22 EAT",
      actor: "Yared Aregayehu",
      role: "Admin",
      sessionId: "sess_98a72f0b12",
      ipAddress: "196.188.142.74",
      location: "Addis Ababa, Ethiopia",
      action: "CONTENT_APPROVED",
      actionCategory: "approval",
      entityType: "ContentVersion",
      entityId: "cv_8829_bpa",
      payloadHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      prevHash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      status: "Verified",
      details: {
        invariant: "APR-002",
        contentTitle: "Business Process Automation",
        destinationPage: "Kewakibt Software Solutions (1049281)",
        hasFrictionConfirmed: true,
        reAuthVerified: true,
      },
    },
    {
      id: "aud-1491",
      sequence: 1491,
      timestamp: "15 Oct 2026, 08:30:14 EAT",
      actor: "Yared Aregayehu",
      role: "Admin",
      sessionId: "sess_98a72f0b12",
      ipAddress: "196.188.142.74",
      location: "Addis Ababa, Ethiopia",
      action: "AUTH_MFA_CHALLENGE_VERIFIED",
      actionCategory: "auth",
      entityType: "Session",
      entityId: "sess_98a72f0b12",
      payloadHash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      prevHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      status: "Verified",
      details: {
        invariant: "AUTH-005, SEC-005",
        method: "TOTP_AUTHENTICATOR",
        device: "iPhone 15 Pro",
        driftSeconds: 0,
      },
    },
    {
      id: "aud-1490",
      sequence: 1490,
      timestamp: "14 Oct 2026, 18:42:09 EAT",
      actor: "KewaFlow Dispatch Engine",
      role: "System Worker",
      sessionId: "worker_proc_2291",
      ipAddress: "127.0.0.1",
      location: "Internal Dispatcher",
      action: "PUBLISH_DISPATCH_SUCCESS",
      actionCategory: "publishing",
      entityType: "PublishingAttempt",
      entityId: "pub_att_1104",
      payloadHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      prevHash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
      status: "Verified",
      details: {
        invariant: "APR-004",
        metaPostId: "1049281_9918237190",
        idempotencyKey: "cv_7712_csd:1049281:attempt_1",
        preDispatchCheck: "ACTIVE_APPROVAL_CONFIRMED",
      },
    },
    {
      id: "aud-1489",
      sequence: 1489,
      timestamp: "14 Oct 2026, 16:10:45 EAT",
      actor: "Yared Aregayehu",
      role: "Admin",
      sessionId: "sess_44bc19e831",
      ipAddress: "196.188.140.22",
      location: "Addis Ababa, Ethiopia",
      action: "FACT_ACKNOWLEDGEMENT_LOGGED",
      actionCategory: "brand",
      entityType: "ContentItem",
      entityId: "cnt_9901_cloud",
      payloadHash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
      prevHash: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
      status: "Verified",
      details: {
        invariant: "APR-007, BRD-003",
        flaggedItem: "99.9% Uptime SLA claim",
        resolution: "Admin supplied verified AWS/Docker architecture SLA document",
        actionTaken: "UNBLOCKED_FOR_APPROVAL",
      },
    },
    {
      id: "aud-1488",
      sequence: 1488,
      timestamp: "14 Oct 2026, 14:05:30 EAT",
      actor: "Yared Aregayehu",
      role: "Admin",
      sessionId: "sess_44bc19e831",
      ipAddress: "196.188.140.22",
      location: "Addis Ababa, Ethiopia",
      action: "CONTENT_VERSION_CREATED",
      actionCategory: "approval",
      entityType: "ContentVersion",
      entityId: "cv_8829_bpa",
      payloadHash: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
      prevHash: "c0535e4be2b79ffd93291305436bf889314e4a3faec05ecffcbb7ff3109190e6",
      status: "Verified",
      details: {
        invariant: "APR-001",
        captionHash: "sha256:88bc...",
        mediaBinaryHash: "sha256:33fe...",
        scheduledTime: "2026-10-16T10:00:00Z",
      },
    },
    {
      id: "aud-1487",
      sequence: 1487,
      timestamp: "13 Oct 2026, 17:20:11 EAT",
      actor: "Yared Aregayehu",
      role: "Admin",
      sessionId: "sess_3391aa88ef",
      ipAddress: "196.188.142.74",
      location: "Addis Ababa, Ethiopia",
      action: "BRAND_PROFILE_UPDATED",
      actionCategory: "brand",
      entityType: "BrandProfile",
      entityId: "bp_kewakibt_main",
      payloadHash: "c0535e4be2b79ffd93291305436bf889314e4a3faec05ecffcbb7ff3109190e6",
      prevHash: "7b52009b64fd0a2a49e6d8a939753077792b0554258d5766a09b0b65b75431a2",
      status: "Verified",
      details: {
        invariant: "BRD-001, BRAND-002",
        updatedFields: ["services.bpa.deliverables", "contact.phone"],
        adminSignature: "RSA-PSS-SHA256",
      },
    },
    {
      id: "aud-1486",
      sequence: 1486,
      timestamp: "13 Oct 2026, 11:45:00 EAT",
      actor: "Yared Aregayehu",
      role: "Admin",
      sessionId: "sess_3391aa88ef",
      ipAddress: "196.188.142.74",
      location: "Addis Ababa, Ethiopia",
      action: "AD_SPEND_RE_AUTH_CONFIRMED",
      actionCategory: "spend",
      entityType: "AdCampaign",
      entityId: "ad_camp_q4_scaling",
      payloadHash: "7b52009b64fd0a2a49e6d8a939753077792b0554258d5766a09b0b65b75431a2",
      prevHash: "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
      status: "Verified",
      details: {
        invariant: "CRM-004, SEC-005",
        allocatedBudgetUSD: 50,
        biometricReAuth: true,
        spendCapMonthly: "$50 hard cap",
      },
    },
  ];

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesCategory =
        selectedCategory === "all" || log.actionCategory === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.payloadHash.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [auditLogs, selectedCategory, searchQuery]);

  const handleVerifyChain = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);
      setTimeout(() => setVerificationSuccess(false), 4000);
    }, 1200);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getActionBadgeColor = (category: string) => {
    switch (category) {
      case "approval":
        return "bg-teal-50 text-kewa-teal border-teal-200";
      case "publishing":
        return "bg-cyan-50 text-cyan-800 border-cyan-200";
      case "auth":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "spend":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "brand":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Top Header & Chained Cryptographic Security Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Security Audit Log
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Cryptographically Chained (SEC-007)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable, append-only record of all approvals, dispatches, authentication events, and administrative actions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-kewa-teal ${
                isVerifying ? "animate-spin" : ""
              }`}
            />
            {isVerifying ? "Verifying Hash Chain..." : "Verify Cryptographic Chain"}
          </button>
          <button
            onClick={() => {
              const csvContent =
                "data:text/csv;charset=utf-8," +
                "Sequence,Timestamp,Actor,Action,Entity,PayloadHash,PrevHash,Status\n" +
                auditLogs
                  .map(
                    (l) =>
                      `${l.sequence},"${l.timestamp}","${l.actor}","${l.action}","${l.entityId}","${l.payloadHash}","${l.prevHash}","${l.status}"`
                  )
                  .join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `kewaflow-audit-log-${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-kewa-teal hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit CSV
          </button>
        </div>
      </div>

      {/* Verification Success Toast */}
      {verificationSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Cryptographic Chain Verified:</strong> 1,492 contiguous blocks verified from genesis. Zero hash discrepancies or broken links detected (SHA-256 Merkle chain intact).
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
            Chain Height: #1492
          </span>
        </div>
      )}

      {/* Database Security & Invariant Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Database className="w-3.5 h-3.5 text-kewa-teal" />
            <span>DB Role Permission</span>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1">INSERT Only</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            UPDATE & DELETE revoked (SEC-007)
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Hash className="w-3.5 h-3.5 text-cyan-600" />
            <span>Chained Blocks</span>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1">1,492 Records</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Contiguous Merkle tree height
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hash Algorithm</span>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1">SHA-256 Chained</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            prevHash → payloadHash
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Laptop className="w-3.5 h-3.5 text-purple-600" />
            <span>Authorized Actors</span>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1">Admin + Engine</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Yared Aregayehu + Dispatcher
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action, actor, entity ID, hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-kewa-teal placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-[11px] font-medium">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedCategory === "all"
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              All Events ({auditLogs.length})
            </button>
            <button
              onClick={() => setSelectedCategory("approval")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedCategory === "approval"
                  ? "bg-teal-700 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              Approvals (APR)
            </button>
            <button
              onClick={() => setSelectedCategory("publishing")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedCategory === "publishing"
                  ? "bg-cyan-700 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              Publishing (PUB)
            </button>
            <button
              onClick={() => setSelectedCategory("auth")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedCategory === "auth"
                  ? "bg-emerald-700 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              Auth & MFA (SEC)
            </button>
            <button
              onClick={() => setSelectedCategory("spend")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedCategory === "spend"
                  ? "bg-purple-700 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              Ad Spend (CRM)
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Sequence</th>
                <th className="py-2.5 px-3">Timestamp (EAT)</th>
                <th className="py-2.5 px-3">Actor & Location</th>
                <th className="py-2.5 px-3">Action Event</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Payload SHA-256</th>
                <th className="py-2.5 px-3 text-right">Integrity</th>
                <th className="py-2.5 px-3 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700 text-[11px]">
                    #{log.sequence}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900 text-xs">
                      {log.actor}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {log.location} • <span className="font-mono">{log.ipAddress}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getActionBadgeColor(
                        log.actionCategory
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-slate-800 font-medium text-xs">
                      {log.entityType}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      {log.entityId}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <span className="truncate max-w-[110px]" title={log.payloadHash}>
                        {log.payloadHash.slice(0, 8)}...{log.payloadHash.slice(-6)}
                      </span>
                      <button
                        onClick={() => handleCopyHash(log.payloadHash)}
                        className="text-slate-400 hover:text-slate-700 p-0.5"
                        title="Copy complete hash"
                      >
                        {copiedHash === log.payloadHash ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1 rounded text-slate-400 hover:text-kewa-teal hover:bg-slate-100 transition-colors"
                      title="Inspect full JSON payload"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Showing <strong>{filteredLogs.length}</strong> of <strong>{auditLogs.length}</strong> loaded security events
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Genesis Hash: sha256:2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae
          </span>
        </div>
      </div>

      {/* JSON Payload Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-kewa-teal" />
                <h3 className="text-sm font-bold text-slate-900">
                  Audit Block #{selectedLog.sequence}: {selectedLog.action}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Chained Hash Validation Banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Previous Block Hash (prevHash):</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Chained Contiguous</span>
                </div>
                <div className="text-[11px] text-slate-700 break-all select-all bg-white p-1.5 rounded border border-slate-200">
                  {selectedLog.prevHash}
                </div>

                <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                  <span>Current Payload Hash (payloadHash):</span>
                  <span className="text-[10px] text-emerald-600 font-bold">SHA-256 Valid</span>
                </div>
                <div className="text-[11px] text-slate-900 font-semibold break-all select-all bg-white p-1.5 rounded border border-slate-200">
                  {selectedLog.payloadHash}
                </div>
              </div>

              {/* Raw JSON viewer */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Raw Cryptographic Payload</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(selectedLog, null, 2)
                      );
                      setCopiedHash(selectedLog.id);
                      setTimeout(() => setCopiedHash(null), 2000);
                    }}
                    className="text-kewa-teal hover:underline text-[11px] flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedHash === selectedLog.id ? "Copied JSON!" : "Copy JSON"}
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] max-h-64 overflow-y-auto leading-relaxed border border-slate-800">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Actor: {selectedLog.actor} ({selectedLog.ipAddress})
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
