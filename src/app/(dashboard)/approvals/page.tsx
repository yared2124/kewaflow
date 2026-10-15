"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  Eye,
  ChevronDown,
  ShieldAlert,
  Clock,
  Sparkles,
  ExternalLink,
  ThumbsUp,
  MessageSquare,
  Share2,
} from "lucide-react";

interface ApprovalItem {
  id: string;
  title: string;
  subtitle: string;
  createdAgo: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  thumbnail: string;
  caption: string;
  hashtags: string;
  platform: string;
  hasUnverifiedFacts: boolean;
  unverifiedClaim?: string;
}

const INITIAL_APPROVAL_ITEMS: ApprovalItem[] = [
  {
    id: "app-1",
    title: "Custom Software Development",
    subtitle: "Enterprise solutions for growing businesses",
    createdAgo: "Created 4 hours ago",
    type: "Text + Image",
    status: "pending",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80",
    caption: "Turn your ideas into powerful digital solutions. We build scalable, secure and user-friendly software tailored to your business needs.",
    hashtags: "#CustomSoftware #Kewakibt #Reliability",
    platform: "Facebook Page",
    hasUnverifiedFacts: false,
  },
  {
    id: "app-2",
    title: "Business Process Automation",
    subtitle: "Eliminate repetitive tasks and reduce errors",
    createdAgo: "Created 5 hours ago",
    type: "Text + Image",
    status: "pending",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&auto=format&fit=crop&q=80",
    caption: "Streamline your operations, reduce manual work, and increase productivity with intelligent automation solutions.",
    hashtags: "#ProcessAutomation #Kewakibt #Efficiency",
    platform: "Facebook Page",
    hasUnverifiedFacts: false,
  },
  {
    id: "app-3",
    title: "Cloud Solutions for SMEs",
    subtitle: "High-uptime architecture built for Ethiopian enterprises",
    createdAgo: "Created 6 hours ago",
    type: "Text + Image",
    status: "pending",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80",
    caption: "Modernize your data infrastructure with zero downtime. Cloud architecture designed for resilience and cost control.",
    hashtags: "#CloudTech #Kewakibt #Architecture",
    platform: "Facebook Page",
    hasUnverifiedFacts: true,
    unverifiedClaim: "Claimed 99.999% uptime guarantee (Requires Admin service verification)",
  },
];

export default function ApprovalQueuePage() {
  const [items, setItems] = useState<ApprovalItem[]>(INITIAL_APPROVAL_ITEMS);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reviewingItem, setReviewingItem] = useState<ApprovalItem | null>(null);

  // Approval Friction UX states (APR-009)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasConfirmedReview, setHasConfirmedReview] = useState(false);

  const pendingItems = items.filter((i) => i.status === "pending");
  const approvedItems = items.filter((i) => i.status === "approved");
  const rejectedItems = items.filter((i) => i.status === "rejected");

  const displayedItems =
    activeTab === "pending"
      ? pendingItems
      : activeTab === "approved"
        ? approvedItems
        : rejectedItems;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApprove = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "approved" as const } : item
      )
    );
    if (reviewingItem?.id === id) {
      setReviewingItem(null);
    }
  };

  const handleReject = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "rejected" as const } : item
      )
    );
    if (reviewingItem?.id === id) {
      setReviewingItem(null);
    }
  };

  const handleBulkApprove = () => {
    setItems((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id)
          ? { ...item, status: "approved" as const }
          : item
      )
    );
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4 max-w-[1320px] mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Approval Queue
          </h1>
          <p className="text-[11px] text-slate-500">
            Review and approve AI-generated content before publishing.
          </p>
        </div>

      </div>

      {/* Main Container */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3.5">
        {/* Top Controls: Filter Tabs + Bulk Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${activeTab === "pending"
                  ? "bg-kewa-teal text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-50"
                }`}
            >
              <span>Pending</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${activeTab === "pending"
                    ? "bg-teal-700/60 text-cyan-200"
                    : "bg-slate-100 text-slate-600"
                  }`}
              >
                {pendingItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("approved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${activeTab === "approved"
                  ? "bg-kewa-teal text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-50"
                }`}
            >
              <span>Approved</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${activeTab === "approved"
                    ? "bg-teal-700/60 text-cyan-200"
                    : "bg-slate-100 text-slate-600"
                  }`}
              >
                {approvedItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${activeTab === "rejected"
                  ? "bg-kewa-teal text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-50"
                }`}
            >
              <span>Rejected</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${activeTab === "rejected"
                    ? "bg-teal-700/60 text-cyan-200"
                    : "bg-slate-100 text-slate-600"
                  }`}
              >
                {rejectedItems.length}
              </span>
            </button>
          </div>

          {/* Bulk Actions Button */}
          {activeTab === "pending" && selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                {selectedIds.length} selected
              </span>
              <button
                onClick={handleBulkApprove}
                className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Approve Selected
              </button>
            </div>
          )}
        </div>

        {/* Content Items List */}
        {displayedItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-1">
            <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">No items in this queue.</p>
            <p className="text-[11px]">
              {activeTab === "pending"
                ? "All generated drafts have been approved or processed."
                : "Empty list."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50 transition-all gap-4"
              >
                {/* Left side: Checkbox + Thumbnail + Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {activeTab === "pending" && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 rounded text-kewa-teal focus:ring-kewa-teal border-slate-300 cursor-pointer"
                    />
                  )}

                  {/* Thumbnail */}
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900 truncate">
                        {item.title}
                      </h3>
                      {item.hasUnverifiedFacts && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <ShieldAlert className="w-2.5 h-2.5" />
                          Fact Check Required
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.createdAgo} • {item.type}
                    </p>
                  </div>
                </div>

                {/* Right side: Status Badge + Actions */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {item.status === "pending" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                      Pending
                    </span>
                  )}
                  {item.status === "approved" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Approved
                    </span>
                  )}
                  {item.status === "rejected" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                      Rejected
                    </span>
                  )}

                  {/* Action Buttons */}
                  <button
                    onClick={() => {
                      setReviewingItem(item);
                      setHasScrolledToBottom(false);
                      setHasConfirmedReview(false);
                    }}
                    className="py-1 px-3 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>

                  {item.status === "pending" && (
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="py-1 px-3 rounded-lg bg-kewa-teal hover:bg-kewa-teal-hover text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal with Approval Friction UX (APR-007, APR-009) */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Review Content Version (v1.0)
                </h3>
                <p className="text-[10px] text-slate-400">
                  Approval Friction Guard • Complete scroll & verification required
                </p>
              </div>
              <button
                onClick={() => setReviewingItem(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Preview Body (Enforces APR-009 scroll friction) */}
            <div
              onScroll={(e) => {
                const target = e.currentTarget;
                if (
                  target.scrollTop + target.clientHeight >=
                  target.scrollHeight - 20
                ) {
                  setHasScrolledToBottom(true);
                }
              }}
              className="p-5 overflow-y-auto space-y-4 max-h-[60vh]"
            >
              {/* Unverified Facts Blocker (APR-007) */}
              {reviewingItem.hasUnverifiedFacts && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Fact Requiring Verification (APR-007)</span>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    {reviewingItem.unverifiedClaim}
                  </p>
                  <p className="text-[10px] text-amber-600 pt-1 font-semibold">
                    Approval is blocked until resolved or acknowledged.
                  </p>
                </div>
              )}

              {/* Rendered Facebook Post Preview */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <Image
                      src="/brand/kewakibt-icon.png"
                      alt="Kewakibt"
                      fill
                      className="object-contain p-0.5"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      Kewakibt Software Solutions
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Destination: Facebook Page • Scheduled: Auto
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed">
                  {reviewingItem.caption}
                </p>

                <div className="relative rounded-lg overflow-hidden h-40 w-full bg-slate-100">
                  <Image
                    src={reviewingItem.thumbnail}
                    alt={reviewingItem.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <p className="text-[11px] font-semibold text-cyan-700">
                  {reviewingItem.hashtags}
                </p>
              </div>

              {/* Diff Viewer Simulation */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-700">
                  Deterministic Version Hash:
                </span>
                <p className="font-mono text-[10px] text-slate-500 break-all">
                  sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </p>
              </div>

              {/* Friction Checkbox (APR-009) */}
              <label className="flex items-start gap-2 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasConfirmedReview}
                  onChange={(e) => setHasConfirmedReview(e.target.checked)}
                  className="mt-0.5 rounded text-kewa-teal focus:ring-kewa-teal"
                />
                <span className="text-[11px] font-medium text-slate-700">
                  I have reviewed the exact final version and verified all claims.
                </span>
              </label>

              {!hasScrolledToBottom && (
                <p className="text-[10px] text-amber-600 font-medium">
                  ↓ Please scroll to the bottom of the preview to enable approval.
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => handleReject(reviewingItem.id)}
                className="py-1.5 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold transition-colors cursor-pointer"
              >
                Reject Post
              </button>

              <button
                onClick={() => handleApprove(reviewingItem.id)}
                disabled={
                  !hasScrolledToBottom ||
                  !hasConfirmedReview ||
                  reviewingItem.hasUnverifiedFacts
                }
                className="py-1.5 px-4 rounded-lg bg-kewa-teal hover:bg-kewa-teal-hover text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Approve & Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
