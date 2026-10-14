"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Save,
  CheckCircle2,
  RefreshCw,
  ThumbsUp,
  MessageSquare,
  Share2,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

export default function ContentStudioPage() {
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");
  const [contentType, setContentType] = useState("Social Media Post");
  const [verifiedService, setVerifiedService] = useState("Custom Enterprise Web Systems");
  const [topic, setTopic] = useState("Benefits of custom software for businesses");
  const [tone, setTone] = useState("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Live generated content
  const [caption, setCaption] = useState(
    "Custom software isn't just code — it's a strategic advantage. Build solutions that fit your business, your process, and your future."
  );
  const [previewImage, setPreviewImage] = useState(
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80"
  );
  const [hashtags, setHashtags] = useState("#CustomSoftware #Kewakibt #Reliability");

  const handleGenerate = () => {
    setIsGenerating(true);
    setSubmitted(false);
    setTimeout(() => {
      setIsGenerating(false);
      if (topic.toLowerCase().includes("automation")) {
        setCaption(
          "Streamline your operations, reduce manual entry errors, and scale faster with tailor-made enterprise automation."
        );
        setHashtags("#ProcessAutomation #Kewakibt #Operations");
        setPreviewImage(
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80"
        );
      } else {
        setCaption(
          `Modernize your architecture with ${verifiedService}. High-reliability systems engineered for measurable business outcomes.`
        );
        setHashtags("#EnterpriseSoftware #Kewakibt #CloudEngineering");
        setPreviewImage(
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80"
        );
      }
    }, 700);
  };

  const handleSendToApproval = () => {
    setSubmitted(true);
  };

  return (
    <div className="space-y-4 max-w-[1320px] mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Content Studio
          </h1>
          <p className="text-[11px] text-slate-500">
            Create engaging content with AI grounded in your verified brand profile.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-[10px] font-semibold text-kewa-cyan-dark self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-kewa-cyan-dark" />
          <span>Brand Grounding Active</span>
        </div>
      </div>

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
                  Verified Service
                  <HelpCircle className="w-3 h-3 text-slate-400" />
                </label>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  ✓ Verified
                </span>
              </div>
              <select
                value={verifiedService}
                onChange={(e) => setVerifiedService(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-kewa-teal"
              >
                <option>Custom Enterprise Web Systems</option>
                <option>API & Systems Integration</option>
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
                <option>Professional</option>
                <option>Technical & Authoritative</option>
                <option>Direct & Results-Oriented</option>
                <option>Engaging & Thought Leadership</option>
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
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Generate Content</span>
              </>
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

            {/* Simulated Facebook Post Card */}
            <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
              {/* Post Author Bar */}
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <Image
                    src="/brand/kewakibt-icon.png"
                    alt="Kewakibt Software Solutions"
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    Kewakibt Software Solutions
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    Just now • <span>🌐</span>
                  </p>
                </div>
              </div>

              {/* Editable / Live Post Caption */}
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full text-xs text-slate-800 leading-relaxed border-none focus:ring-1 focus:ring-cyan-200 rounded p-1 resize-none"
              />

              {/* Post Creative Photo */}
              <div className="relative rounded-lg overflow-hidden h-44 w-full bg-slate-100">
                <Image
                  src={previewImage}
                  alt="Post creative"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Hashtags */}
              <p className="text-[11px] font-semibold text-cyan-700">
                {hashtags}
              </p>

              {/* Social Engagement Stats Mock */}
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
                  onClick={() => alert("Draft saved successfully.")}
                  className="w-full sm:w-auto py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save as Draft</span>
                </button>
                <button
                  onClick={handleSendToApproval}
                  className="w-full sm:w-auto py-1.5 px-4 rounded-lg bg-kewa-teal hover:bg-kewa-teal-hover text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-cyan-300" />
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
