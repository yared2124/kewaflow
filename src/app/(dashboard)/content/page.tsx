"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Send,
  Save,
  CheckCircle2,
  RefreshCw,
  ThumbsUp,
  MessageSquare,
  Share2,
  ShieldCheck,
  HelpCircle,
  Loader2,
  Zap,
} from "lucide-react";
import { getBrandProfile } from "@/server/actions/brand";
import { createContentItem, generateContentWithAI } from "@/server/actions/content";
import { generateAutomatedDrafts } from "@/server/actions/automation";

interface VerifiedService {
  id: string;
  name: string;
  description?: string;
}

export default function ContentStudioPage() {
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");
  const [contentType, setContentType] = useState("Social Media Post");
  const [verifiedServices, setVerifiedServices] = useState<VerifiedService[]>([
    { id: "srv-1", name: "Custom Enterprise Web Systems" },
    { id: "srv-2", name: "Business Process Automation" },
    { id: "srv-3", name: "Cloud Architecture & Migration" },
  ]);
  const [selectedService, setSelectedService] = useState("Custom Enterprise Web Systems");
  const [topic, setTopic] = useState("Benefits of custom software for businesses");
  const [tone, setTone] = useState("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Live generated content
  const [caption, setCaption] = useState(
    "Custom software isn't just code — it's a strategic advantage. Build solutions that fit your business, your process, and your future."
  );
  const [previewImage, setPreviewImage] = useState(
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80"
  );
  const [hashtags, setHashtags] = useState("#CustomSoftware #Kewakibt #Reliability");
  const [flaggedFacts, setFlaggedFacts] = useState<string[]>([]);
  const [generationMeta, setGenerationMeta] = useState<{
    provider: string;
    model: string;
    costUsd: number;
    groundedFactsUsed: string[];
  } | null>(null);

  // Load verified services from database (BRD-001)
  useEffect(() => {
    async function loadBrand() {
      try {
        const res = await getBrandProfile();
        if (res.success && res.profile?.verifiedServices) {
          const srvs = res.profile.verifiedServices as any[];
          if (Array.isArray(srvs) && srvs.length > 0) {
            setVerifiedServices(
              srvs.map((s, idx) => ({
                id: s.id || `srv-${idx}`,
                name: s.name,
                description: s.description,
              }))
            );
            if (srvs[0]?.name) {
              setSelectedService(srvs[0].name);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load verified services from database:", err);
      }
    }
    loadBrand();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSubmitted(false);
    setSaveSuccessMsg(null);
    setSaveError(null);

    try {
      const res = await generateContentWithAI({
        serviceName: selectedService,
        topic,
        platform: "FACEBOOK",
        tone: "professional",
      });

      if (!res.success || !res.result) {
        setSaveError(res.error || "Failed to generate grounded content.");
        return;
      }

      const { result } = res;
      setCaption(result.caption);
      setHashtags(result.hashtags);
      if (result.suggestedImageUrl) {
        setPreviewImage(result.suggestedImageUrl);
      }
      setFlaggedFacts(result.flaggedFacts || []);
      setGenerationMeta({
        provider: result.usage.provider,
        model: result.usage.model,
        costUsd: result.usage.costUsd,
        groundedFactsUsed: result.groundedFactsUsed || [],
      });
    } catch (err: any) {
      setSaveError(err.message || "An unexpected error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccessMsg(null);

    try {
      const fullCaption = `${caption.trim()}\n\n${hashtags.trim()}`;
      const res = await createContentItem({
        title: topic || selectedService,
        caption: fullCaption,
        mediaUrls: [previewImage],
        destinationPageId: "fb_page_kewakibt_main",
        readyForReview: false,
        flaggedFacts,
      });

      if (!res.success) {
        setSaveError(res.error || "Failed to save draft.");
        return;
      }

      setSaveSuccessMsg("Draft saved in database.");
    } catch (err: any) {
      setSaveError(err.message || "Failed to save draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendToApproval = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccessMsg(null);

    try {
      const fullCaption = `${caption.trim()}\n\n${hashtags.trim()}`;
      const res = await createContentItem({
        title: topic || selectedService,
        caption: fullCaption,
        mediaUrls: [previewImage],
        destinationPageId: "fb_page_kewakibt_main",
        readyForReview: true,
        flaggedFacts,
      });

      if (!res.success) {
        setSaveError(res.error || "Failed to queue draft for approval.");
        return;
      }

      setSubmitted(true);
    } catch (err: any) {
      setSaveError(err.message || "Failed to queue draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateBatch = async () => {
    setIsGeneratingBatch(true);
    setSaveError(null);
    setSaveSuccessMsg(null);
    try {
      const res = await generateAutomatedDrafts(3);
      if (!res.success) {
        setSaveError(res.error || "Failed to generate batch drafts.");
        return;
      }
      setSaveSuccessMsg(
        `⚡ Auto-Pilot generated ${res.createdCount} grounded marketing drafts! You can review or 1-click approve them now in the Approval Queue.`
      );
    } catch (err: any) {
      setSaveError(err.message || "Failed to generate batch drafts.");
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  return (
    <div className="space-y-4 max-w-[1320px] mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Content Studio
          </h1>
          <p className="text-[12px] text-slate-700">
            Create grounded marketing content (BRD-001: Zero invented claims, verified against Brand Profile).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateBatch}
            disabled={isGeneratingBatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Auto-generates 3 weekly drafts grounded in Kewakibt verified services"
          >
            {isGeneratingBatch ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            )}
            <span>{isGeneratingBatch ? "Generating Drafts..." : "⚡ Auto-Pilot: 3 Weekly Drafts"}</span>
          </button>

          <Link
            href="/approvals"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
          >
            <span>Approval Queue</span>
            <span className="text-[10px] text-slate-400">→</span>
          </Link>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{saveSuccessMsg}</span>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-700 font-bold ml-2">✕</button>
        </div>
      )}

      {saveError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
          <span>{saveError}</span>
          <button onClick={() => setSaveError(null)} className="text-red-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Main Studio 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Generator Form (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-4">
          {/* Studio Tabs */}
          <div className="flex items-center border-b border-slate-100 pb-2 gap-4">
            <button
              onClick={() => setActiveTab("text")}
              className={`text-xs font-bold pb-1 transition-colors relative ${
                activeTab === "text"
                  ? "text-kewa-teal border-b-2 border-kewa-teal"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Text Generation
            </button>
            <button
              onClick={() => setActiveTab("image")}
              className={`text-xs font-bold pb-1 transition-colors relative ${
                activeTab === "image"
                  ? "text-kewa-teal border-b-2 border-kewa-teal"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Image Generation
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            {/* Content Type */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-kewa-teal"
              >
                <option>Social Media Post</option>
                <option>Service Highlight</option>
                <option>Client Case Study</option>
                <option>Technical Educational</option>
              </select>
            </div>

            {/* Verified Service Selector (Brand Grounding BRD-001) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  Verified Service (BRD-001)
                  <HelpCircle className="w-3 h-3 text-slate-400" />
                </label>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Grounded
                </span>
              </div>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-kewa-teal"
              >
                {verifiedServices.map((srv) => (
                  <option key={srv.id} value={srv.name}>
                    {srv.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic / Idea */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Topic / Idea
              </label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Benefits of custom software for businesses"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-kewa-teal resize-none"
              />
            </div>

            {/* Tone Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-kewa-teal"
              >
                <option>Professional & Authoritative</option>
                <option>Technical & Engineering-Centric</option>
                <option>Outcomes & ROI Driven</option>
                <option>Pragmatic & Grounded</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2 rounded-lg bg-kewa-teal hover:bg-kewa-teal-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-70"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating grounded copy...</span>
              </>
            ) : (
              <span>Generate Content Draft</span>
            )}
          </button>
        </div>

        {/* Right Column: Live Facebook Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900">
                Live Preview
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Facebook Page Post Simulation
              </span>
            </div>

            {/* Provider & Grounding Metadata */}
            {generationMeta && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-teal-50/70 border border-teal-100 text-[10px] text-teal-800">
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-kewa-teal" />
                  <span>Provider: <strong>{generationMeta.provider}</strong> ({generationMeta.model})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-700 font-bold">${generationMeta.costUsd.toFixed(4)} USD</span>
                  <span className="px-1.5 py-0.5 rounded bg-teal-100 font-semibold">100% Grounded</span>
                </div>
              </div>
            )}

            {/* APR-007 Flagged Facts Warning Banner */}
            {flaggedFacts.length > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 text-[11px]">
                  <span>⚠️</span>
                  <span>APR-007: Facts Requiring Admin Verification ({flaggedFacts.length})</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800">
                  {flaggedFacts.map((fact, idx) => (
                    <li key={idx}>{fact}</li>
                  ))}
                </ul>
                <p className="text-[10px] text-amber-700 italic pt-0.5">
                  Approval will be blocked in the Approval Queue until each fact is verified with evidence or acknowledged.
                </p>
              </div>
            )}

            {/* Simulated Facebook Post Card */}
            <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
              {/* Post Author Bar */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-cyan-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  K
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    Kewakibt Software Solutions PLC
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    Just now • <span>🌐</span>
                  </p>
                </div>
              </div>

              {/* Editable / Live Post Caption */}
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full text-xs text-slate-800 leading-relaxed border border-slate-100 focus:ring-1 focus:ring-kewa-teal rounded p-1.5 resize-none"
              />

              {/* Post Creative Photo */}
              <div className="relative rounded-lg overflow-hidden h-44 w-full bg-slate-100">
                <Image
                  src={previewImage}
                  alt="Post creative"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              {/* Hashtags */}
              <p className="text-[11px] font-semibold text-cyan-700">
                {hashtags}
              </p>

              {/* Social Engagement Simulation */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-around text-slate-400 text-[11px]">
                <span className="flex items-center gap-1 hover:text-slate-600 cursor-pointer">
                  <ThumbsUp className="w-3.5 h-3.5" /> Like
                </span>
                <span className="flex items-center gap-1 hover:text-slate-600 cursor-pointer">
                  <MessageSquare className="w-3.5 h-3.5" /> Comment
                </span>
                <span className="flex items-center gap-1 hover:text-slate-600 cursor-pointer">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </span>
              </div>
            </div>
          </div>

          {/* Submission / Approval Routing Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            {submitted ? (
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold py-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Queued in Approval Queue!</span>
                <Link
                  href="/approvals"
                  className="underline text-kewa-teal ml-1"
                >
                  View Queue →
                </Link>
              </div>
            ) : (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="w-full sm:w-auto py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save as Draft</span>
                </button>
                <button
                  onClick={handleSendToApproval}
                  disabled={isSaving}
                  className="w-full sm:w-auto py-1.5 px-4 rounded-lg bg-kewa-teal hover:bg-kewa-teal-hover text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-cyan-300" />}
                  <span>Send to Approval Queue</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
