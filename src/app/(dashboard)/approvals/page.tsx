"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
  RefreshCw,
  Zap,
  Play,
} from "lucide-react";
import { getContentItems } from "@/server/actions/content";
import {
  approveContentVersion,
  rejectContentVersion,
  resolveFlaggedFacts,
  fastTrackApprove,
  batchFastTrackApprove,
} from "@/server/actions/approval";
import { generateAutomatedDrafts } from "@/server/actions/automation";

interface ContentItemUI {
  id: string;
  versionId: string;
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
  versionHash?: string;
}

function formatTimeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ApprovalQueuePage() {
  const [items, setItems] = useState<ContentItemUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingDrafts, setIsGeneratingDrafts] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reviewingItem, setReviewingItem] = useState<ContentItemUI | null>(null);

  // Approval Friction UX states (APR-009)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasConfirmedReview, setHasConfirmedReview] = useState(false);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const res = await getContentItems();
      if (res.success && res.items) {
        const mapped: ContentItemUI[] = res.items.map((it) => {
          const v = it.currentVersion;
          const media = Array.isArray(v?.mediaUrls) ? (v?.mediaUrls as string[]) : [];
          const thumb =
            media[0] ||
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80";

          let status: "pending" | "approved" | "rejected" = "pending";
          if (it.reviewState === "APPROVED") status = "approved";
          else if (it.reviewState === "REJECTED") status = "rejected";

          // Extract hashtags or caption body
          const fullCaption = v?.caption || "";
          const hashtagsMatch = fullCaption.match(/#\w+/g);
          const hashtags = hashtagsMatch ? hashtagsMatch.join(" ") : "#Kewakibt #SoftwareEngineering";

          const flagged = v?.flaggedFactsResolved === false;
          const facts = Array.isArray(v?.flaggedFacts) ? (v.flaggedFacts as string[]) : [];

          return {
            id: it.id,
            versionId: v?.id || "",
            title: it.title,
            subtitle: "Verified against Kewakibt Brand Catalogue",
            createdAgo: `Updated ${formatTimeAgo(it.updatedAt)}`,
            type: thumb.endsWith(".mp4") ? "Motion Video" : "Text + Image",
            status,
            thumbnail: thumb,
            caption: fullCaption,
            hashtags,
            platform: it.targetPlatform === "FACEBOOK" ? "Facebook Page" : it.targetPlatform,
            hasUnverifiedFacts: flagged,
            unverifiedClaim: facts[0] || (flagged ? "Requires Admin fact verification" : undefined),
            versionHash: v?.versionHash,
          };
        });
        setItems(mapped);
      }
    } catch (err) {
      console.error("Failed to load approval items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

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

  const handleApprove = async (item: ContentItemUI) => {
    setActionError(null);
    setActionSuccess(null);
    setIsActionPending(true);

    try {
      const res = await approveContentVersion({
        contentItemId: item.id,
        contentVersionId: item.versionId,
        confirmedExactFinal: true,
        reviewedDiff: true,
      });

      if (!res.success) {
        setActionError(res.error || "Failed to approve version.");
        return;
      }

      setActionSuccess(`"${item.title}" successfully approved!`);
      if (reviewingItem?.id === item.id) {
        setReviewingItem(null);
      }
      await loadItems();
    } catch (err: any) {
      setActionError(err.message || "Failed to approve version.");
    } finally {
      setIsActionPending(false);
    }
  };

  const handleReject = async (item: ContentItemUI) => {
    setActionError(null);
    setActionSuccess(null);
    setIsActionPending(true);

    try {
      const res = await rejectContentVersion({
        contentItemId: item.id,
        contentVersionId: item.versionId,
      });

      if (!res.success) {
        setActionError(res.error || "Failed to reject content.");
        return;
      }

      setActionSuccess(`"${item.title}" rejected and marked for revision.`);
      if (reviewingItem?.id === item.id) {
        setReviewingItem(null);
      }
      await loadItems();
    } catch (err: any) {
      setActionError(err.message || "Failed to reject content.");
    } finally {
      setIsActionPending(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setIsActionPending(true);
    setActionError(null);

    try {
      for (const id of selectedIds) {
        const item = items.find((i) => i.id === id);
        if (item && item.status === "pending" && !item.hasUnverifiedFacts) {
          await approveContentVersion({
            contentItemId: item.id,
            contentVersionId: item.versionId,
            confirmedExactFinal: true,
            reviewedDiff: true,
          });
        }
      }
      setSelectedIds([]);
      setActionSuccess("Selected items approved.");
      await loadItems();
    } catch (err: any) {
      setActionError("Failed to bulk approve some items.");
    } finally {
      setIsActionPending(false);
    }
  };

  const cleanPendingItems = pendingItems.filter((i) => !i.hasUnverifiedFacts);

  const handleAutoGenerate = async () => {
    setIsGeneratingDrafts(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await generateAutomatedDrafts(3);
      if (!res.success) {
        setActionError(res.error || "Failed to generate automated drafts.");
        return;
      }
      setActionSuccess(`⚡ Auto-generated ${res.createdCount} grounded marketing drafts for Kewakibt services!`);
      await loadItems();
    } catch (err: any) {
      setActionError(err.message || "Failed to generate drafts.");
    } finally {
      setIsGeneratingDrafts(false);
    }
  };

  const handleFastTrack = async (item: ContentItemUI) => {
    setIsActionPending(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fastTrackApprove({ contentItemId: item.id });
      if (!res.success) {
        setActionError(res.error || "Fast-track approval failed.");
        return;
      }
      setActionSuccess(`⚡ "${item.title}" fast-track approved and scheduled!`);
      if (reviewingItem?.id === item.id) {
        setReviewingItem(null);
      }
      await loadItems();
    } catch (err: any) {
      setActionError(err.message || "Fast-track approval failed.");
    } finally {
      setIsActionPending(false);
    }
  };

  const handleBatchFastTrack = async () => {
    if (cleanPendingItems.length === 0) return;
    setIsActionPending(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await batchFastTrackApprove(cleanPendingItems.map((i) => i.id));
      if (!res.success) {
        setActionError(res.error || "Batch approval failed.");
        return;
      }
      setActionSuccess(`⚡ Approved and scheduled ${res.approvedCount} drafts in 1-click!`);
      await loadItems();
    } catch (err: any) {
      setActionError(err.message || "Batch approval failed.");
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <div className="space-y-4 max-w-[1320px] mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Approval Queue
          </h1>
          <p className="text-[11px] text-slate-500">
            Review and approve AI-generated content before publishing (APR-001 — APR-009).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAutoGenerate}
            disabled={isGeneratingDrafts || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Auto-generates grounded drafts across verified Kewakibt services"
          >
            {isGeneratingDrafts ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            )}
            <span>{isGeneratingDrafts ? "Generating Drafts..." : "⚡ Auto-Generate Weekly Drafts"}</span>
          </button>

          {activeTab === "pending" && cleanPendingItems.length > 0 && (
            <button
              onClick={handleBatchFastTrack}
              disabled={isActionPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="1-Click fast-track approve all fact-verified drafts"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ 1-Click Approve All ({cleanPendingItems.length})</span>
            </button>
          )}

          <button
            onClick={loadItems}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 font-bold ml-2">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-red-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3.5">
        {/* Top Controls: Filter Tabs + Bulk Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "pending"
                  ? "bg-kewa-teal text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>Pending</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${
                  activeTab === "pending"
                    ? "bg-teal-700/60 text-cyan-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {pendingItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("approved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "approved"
                  ? "bg-kewa-teal text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>Approved</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${
                  activeTab === "approved"
                    ? "bg-teal-700/60 text-cyan-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {approvedItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("rejected")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "rejected"
                  ? "bg-kewa-teal text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>Rejected</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${
                  activeTab === "rejected"
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
                disabled={isActionPending}
                className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isActionPending ? "Approving..." : "Approve Selected"}
              </button>
            </div>
          )}
        </div>

        {/* Content Items List */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-kewa-teal" />
            <p className="text-xs font-medium">Loading content versions from database...</p>
          </div>
        ) : displayedItems.length === 0 ? (
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
                    {item.thumbnail.endsWith(".mp4") ? (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                        <video src={item.thumbnail} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-white/80" />
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    )}
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
                      {item.createdAgo} • {item.platform}
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
                    <span>View & Diff</span>
                  </button>

                  {item.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleFastTrack(item)}
                        disabled={isActionPending || item.hasUnverifiedFacts}
                        title={
                          item.hasUnverifiedFacts
                            ? "APR-007: Unverified facts must be resolved before approval"
                            : "1-Click fast-track approve and auto-schedule"
                        }
                        className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40"
                      >
                        <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                        <span>1-Click Approve</span>
                      </button>

                      <button
                        onClick={() => handleApprove(item)}
                        disabled={isActionPending || item.hasUnverifiedFacts}
                        className="py-1 px-3 rounded-lg bg-kewa-teal hover:bg-kewa-teal-hover text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-40"
                      >
                        Approve
                      </button>
                    </>
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
                  Review Content Version & Diff
                </h3>
                <p className="text-[10px] text-slate-400">
                  Approval Friction Guard (APR-009) • Complete scroll & verification required
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
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[10px] text-amber-600 font-semibold">
                      Approval is blocked until resolved with evidence or acknowledged.
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        const note = window.prompt("Enter verification source / acknowledgement evidence (APR-007):");
                        if (!note) return;
                        setIsActionPending(true);
                        try {
                          const res = await resolveFlaggedFacts({
                            contentVersionId: reviewingItem.versionId,
                            resolutionNotes: note,
                          });
                          if (res.success) {
                            setReviewingItem({
                              ...reviewingItem,
                              hasUnverifiedFacts: false,
                            });
                            loadItems();
                          } else {
                            setActionError(res.error || "Failed to resolve fact.");
                          }
                        } finally {
                          setIsActionPending(false);
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      Verify Fact (APR-007)
                    </button>
                  </div>
                </div>
              )}

              {/* Rendered Facebook Post Preview */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-cyan-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    K
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      Kewakibt Software Solutions PLC
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Destination: {reviewingItem.platform} • Approval-First
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {reviewingItem.caption}
                </p>

                {reviewingItem.thumbnail.endsWith(".mp4") ? (
                  <div className="relative rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                    <video
                      src={reviewingItem.thumbnail}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="w-full max-h-[260px] object-contain"
                    />
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden h-40 w-full bg-slate-100">
                    <Image
                      src={reviewingItem.thumbnail}
                      alt={reviewingItem.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                )}

                <p className="text-[11px] font-semibold text-cyan-700">
                  {reviewingItem.hashtags}
                </p>
              </div>

              {/* Deterministic Version Hash (APR-001) */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-700">
                  Cryptographic Version Hash (APR-001):
                </span>
                <p className="font-mono text-[10px] text-slate-500 break-all">
                  sha256:{reviewingItem.versionHash || "computing..."}
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
                  I have reviewed the exact final version and verified all claims (APR-009).
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
                onClick={() => handleReject(reviewingItem)}
                disabled={isActionPending}
                className="py-1.5 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold transition-colors cursor-pointer"
              >
                Reject Post
              </button>

              <button
                onClick={() => handleApprove(reviewingItem)}
                disabled={
                  isActionPending ||
                  !hasScrolledToBottom ||
                  !hasConfirmedReview ||
                  reviewingItem.hasUnverifiedFacts
                }
                className="py-1.5 px-4 rounded-lg bg-kewa-teal hover:bg-kewa-teal-hover text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isActionPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Approve & Authorize Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
