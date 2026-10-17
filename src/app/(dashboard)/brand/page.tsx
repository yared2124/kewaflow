"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  Layers,
  Palette,
  Target,
  Plus,
  Trash2,
  Save,
  Check,
  X,
  Globe,
  Mail,
  Phone,
  MapPin,
  Lock,
  FileCheck2,
  HelpCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { getBrandProfile, updateBrandProfile } from "@/server/actions/brand";

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  targetPainPoint: string;
  isVerified: boolean;
  deliverables: string[];
}

interface GuardrailRule {
  id: string;
  rule: string;
  category: "anti-hallucination" | "pricing" | "compliance";
  severity: "blocker" | "warning";
}

export default function BrandProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "services" | "voice" | "audience"
  >("overview");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for Brand Profile (BRAND-001)
  const [companyName, setCompanyName] = useState("Kewakibt Software Solutions PLC");
  const [tagline, setTagline] = useState("Build • Automate • Grow");
  const [description, setDescription] = useState(
    "Enterprise custom software development, business process automation, and cloud architecture tailored for African industry leaders and scaling businesses."
  );
  const [headquarters, setHeadquarters] = useState("Addis Ababa, Ethiopia (Bole Subcity)");
  const [email, setEmail] = useState("contact@kewakibt.com");
  const [phone, setPhone] = useState("+251 91 123 4567");
  const [website, setWebsite] = useState("https://kewakibt.com");
  const [budgetCap, setBudgetCap] = useState(50.0);

  // Load from database on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await getBrandProfile();
        if (res.success && res.profile) {
          const p = res.profile;
          setCompanyName(p.brandName);
          if (p.tagline) setTagline(p.tagline);
          if (p.aiMonthlyBudgetCap) setBudgetCap(Number(p.aiMonthlyBudgetCap));

          const facts = p.verifiedFacts as any;
          if (facts) {
            if (facts.description) setDescription(facts.description);
            if (facts.headquarters) setHeadquarters(facts.headquarters);
            if (facts.primaryEmail) setEmail(facts.primaryEmail);
            if (facts.primaryPhone) setPhone(facts.primaryPhone);
            if (facts.website) setWebsite(facts.website);
          }

          const srvs = p.verifiedServices as any[];
          if (srvs && Array.isArray(srvs) && srvs.length > 0) {
            setServices(
              srvs.map((s, idx) => ({
                id: s.id || `srv-${idx + 1}`,
                name: s.name || "",
                description: s.description || "",
                targetPainPoint: s.targetPainPoint || "",
                isVerified: s.isVerified ?? true,
                deliverables: s.deliverables || [],
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to load brand profile from database:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Services Catalogue (BRAND-002)
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: "srv-1",
      name: "Custom Software Development",
      description: "Full-cycle web and mobile application engineering built with robust scalable architectures.",
      targetPainPoint: "Off-the-shelf software doesn't fit unique Ethiopian business processes.",
      isVerified: true,
      deliverables: ["Web Apps (Next.js)", "Mobile Apps (React Native)", "REST & GraphQL APIs"],
    },
    {
      id: "srv-2",
      name: "Business Process Automation (BPA)",
      description: "Automating repetitive operational workflows, approvals, and system synchronization.",
      targetPainPoint: "Manual spreadsheet reporting and slow paper-based approval chains.",
      isVerified: true,
      deliverables: ["Automated Approval Chains", "ERP & Accounting Sync", "Custom Webhooks"],
    },
    {
      id: "srv-3",
      name: "Cloud Infrastructure & DevOps",
      description: "High-reliability cloud setups with automated containerization, monitoring, and backups.",
      targetPainPoint: "Unstable server downtime and lack of disaster recovery readiness.",
      isVerified: true,
      deliverables: ["Docker Containers", "PostgreSQL Clustering", "CI/CD Deployment Pipelines"],
    },
    {
      id: "srv-4",
      name: "UI/UX & Product Design",
      description: "User research, intuitive interfaces, and design systems for enterprise software.",
      targetPainPoint: "Clunky legacy software that employees refuse to adopt.",
      isVerified: true,
      deliverables: ["Figma Interactive Prototypes", "Design Systems", "Usability Testing"],
    },
  ]);

  // Anti-Hallucination Guardrails (BRD-001, BRD-002, BRAND-005)
  const [guardrails] = useState<GuardrailRule[]>([
    {
      id: "gr-1",
      rule: "NEVER invent client company names, quotes, or fictional testimonials (BRD-002).",
      category: "anti-hallucination",
      severity: "blocker",
    },
    {
      id: "gr-2",
      rule: "NEVER generate specific pricing or monetary guarantees without explicit Admin review.",
      category: "pricing",
      severity: "blocker",
    },
    {
      id: "gr-3",
      rule: "NEVER fabricate delivery timeframes (e.g. 'delivered in 48 hours').",
      category: "compliance",
      severity: "blocker",
    },
    {
      id: "gr-4",
      rule: "Flag all statistical marketing claims for verified Admin proof before approval (APR-007).",
      category: "anti-hallucination",
      severity: "blocker",
    },
  ]);

  // Brand Palette tokens (BRAND-003)
  const palette = [
    { name: "Navy Dark", hex: "#0B132B", class: "bg-[#0B132B]", text: "text-white" },
    { name: "Deep Petrol", hex: "#0E3B43", class: "bg-[#0E3B43]", text: "text-white" },
    { name: "Slate Blue", hex: "#1C2541", class: "bg-[#1C2541]", text: "text-white" },
    { name: "Cyan Accent", hex: "#00CECB", class: "bg-[#00CECB]", text: "text-slate-900" },
    { name: "Teal Brand", hex: "#134E5E", class: "bg-[#134E5E]", text: "text-white" },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await updateBrandProfile({
        brandName: companyName,
        tagline,
        verifiedServices: services,
        verifiedFacts: {
          description,
          headquarters,
          primaryEmail: email,
          primaryPhone: phone,
          website,
        },
        aiMonthlyBudgetCap: budgetCap,
      });

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setSaveError(res.error || "Failed to save brand profile.");
      }
    } catch (err: any) {
      setSaveError(err.message || "Failed to save brand profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVerifyService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isVerified: !s.isVerified } : s))
    );
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Top Header & Grounding Invariant Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Brand Profile & AI Grounding
            </h1>
            {isLoading && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading from database...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-700 mt-0.5">
            Single source of truth for Kewakibt.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {saveError && (
            <span className="text-xs text-rose-600 font-medium flex items-center gap-1 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5" /> {saveError}
            </span>
          )}
          {saveSuccess && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> Saved & Verified
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-kewa-teal hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${activeTab === "overview"
            ? "bg-white text-slate-900 shadow-2xs font-semibold"
            : "text-slate-600 hover:text-slate-900"
            }`}
        >
          <Building2 className="w-3.5 h-3.5 text-kewa-teal" />
          Company Identity
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${activeTab === "services"
            ? "bg-white text-slate-900 shadow-2xs font-semibold"
            : "text-slate-600 hover:text-slate-900"
            }`}
        >
          <Layers className="w-3.5 h-3.5 text-kewa-teal" />
          Verified Services ({services.filter((s) => s.isVerified).length})
        </button>
        <button
          onClick={() => setActiveTab("voice")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${activeTab === "voice"
            ? "bg-white text-slate-900 shadow-2xs font-semibold"
            : "text-slate-600 hover:text-slate-900"
            }`}
        >
          <Palette className="w-3.5 h-3.5 text-kewa-teal" />
          Voice & Aesthetics
        </button>
        <button
          onClick={() => setActiveTab("audience")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${activeTab === "audience"
            ? "bg-white text-slate-900 shadow-2xs font-semibold"
            : "text-slate-600 hover:text-slate-900"
            }`}
        >
          <Target className="w-3.5 h-3.5 text-kewa-teal" />
          Target Audience & CTAs
        </button>
      </div>

      {/* TAB 1: Company Identity */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Main Details (2 cols) */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Verified Legal & Brand Identity

                </h2>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-100">
                  Admin Confirmed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Company Legal Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-kewa-teal"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Brand Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-kewa-teal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Core Company Description (Used as AI Grounding Context)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-kewa-teal leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    Headquarters / Geography
                  </label>
                  <input
                    type="text"
                    value={headquarters}
                    onChange={(e) => setHeadquarters(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-kewa-teal"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    Official Website
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-kewa-teal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    Public Contact Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-kewa-teal"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    Phone / WhatsApp Lead Line
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-kewa-teal"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Brand Badge & Fact Lock */}
          <div className="space-y-3.5">
            {/* Visual Logo Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Official Brand Assets
              </h2>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 shadow-2xs p-2 flex items-center justify-center mb-2.5">
                  <Image
                    src="/brand/kewakibt-icon.png"
                    alt="Kewakibt Brand Icon"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div className="font-bold text-xs text-slate-900">Kewakibt Chevron Icon</div>
                <div className="text-[11px] text-slate-500">Vector PNG • Verified Primary Mark</div>
              </div>

              <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2.5">
                <span>Asset Storage: S3-Compatible Object Store</span>
                <span className="text-kewa-teal font-medium">8 MB Max</span>
              </div>
            </div>

            {/* Invariant Rule Reminder */}
            <div className="bg-slate-900 text-white rounded-xl p-4 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>Anti-Hallucination Lock (BRD-001)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                When content generation runs, the prompt injector exclusively draws from verified fields. Fictional facts will result in immediate rejection at approval time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Verified Services Catalogue */}
      {activeTab === "services" && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Active Service Catalogue (BRAND-002)
              </h2>
              <p className="text-[11px] text-slate-500">
                Only verified services appear in the Content Studio generator dropdown.
              </p>
            </div>
            <button
              onClick={() => {
                const newId = `srv-${Date.now()}`;
                setServices([
                  ...services,
                  {
                    id: newId,
                    name: "New Custom Service",
                    description: "Describe the specific service delivered by Kewakibt.",
                    targetPainPoint: "Client operational bottleneck addressed.",
                    isVerified: false,
                    deliverables: ["Deliverable 1", "Deliverable 2"],
                  },
                ]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              Add Service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {services.map((srv) => (
              <div
                key={srv.id}
                className={`rounded-xl border p-4 shadow-2xs transition-colors flex flex-col justify-between ${srv.isVerified
                  ? "bg-white border-slate-200"
                  : "bg-amber-50/40 border-amber-200"
                  }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{srv.name}</h3>
                    <button
                      onClick={() => toggleVerifyService(srv.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 transition-colors ${srv.isVerified
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {srv.isVerified ? "Verified (Active)" : "Draft (Unverified)"}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {srv.description}
                  </p>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-700 block text-[11px] mb-0.5">
                      Core Pain Point Solved:
                    </span>
                    <span className="text-slate-600 italic">"{srv.targetPainPoint}"</span>
                  </div>

                  <div className="mt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Deliverables Grounding:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {srv.deliverables.map((del, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                        >
                          {del}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    ID: <code className="font-mono">{srv.id}</code>
                  </span>
                  <button
                    onClick={() => setServices(services.filter((s) => s.id !== s.id))}
                    className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                    title="Remove service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Voice & Aesthetics */}
      {activeTab === "voice" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Brand Voice & Tone */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Brand Voice & Personality (BRAND-003)
            </h2>
            <p className="text-xs text-slate-600">
              Injected into system instructions for LLM adapters
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-100">
                <span className="font-bold text-kewa-teal block">Authoritative & Technical</span>
                <span className="text-[11px] text-slate-600">Demonstrates deep software engineering competence.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-100">
                <span className="font-bold text-kewa-teal block">Pragmatic & ROI-Focused</span>
                <span className="text-[11px] text-slate-600">Centers on tangible operational outcomes.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-100">
                <span className="font-bold text-kewa-teal block">Approachable & Modern</span>
                <span className="text-[11px] text-slate-600">Avoids buzzwords; communicates clearly.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-100">
                <span className="font-bold text-kewa-teal block">Local Context Aware</span>
                <span className="text-[11px] text-slate-600">Respects Ethiopian market nuances & payment realities.</span>
              </div>
            </div>

            {/* Color Palette Display */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Brand Color Palette
              </label>
              <div className="grid grid-cols-5 gap-2">
                {palette.map((c) => (
                  <div key={c.hex} className="rounded-lg overflow-hidden border border-slate-200">
                    <div className={`h-10 ${c.class} flex items-end p-1`}>
                      <span className={`text-[9px] font-mono font-bold ${c.text}`}>{c.hex}</span>
                    </div>
                    <div className="p-1 bg-white text-center text-[10px] font-medium text-slate-700 truncate">
                      {c.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hard Guardrails & Prohibited Claims */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                Prohibited Claims (BRD-002 Enforced)
              </h2>
              <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                Hard Blocker
              </span>
            </div>
            <p className="text-xs text-slate-600">
              System will refuse generation or block approvals if any of these rules are breached:
            </p>

            <div className="space-y-2">
              {guardrails.map((gr) => (
                <div
                  key={gr.id}
                  className="p-2.5 rounded-lg border border-red-100 bg-red-50/30 flex items-start gap-2.5 text-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block">{gr.rule}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Invariant: {gr.id} • Category: {gr.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Target Audience & CTAs */}
      {activeTab === "audience" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Target Audiences & Geography (BRAND-005)
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Primary Geographic Focus
                </label>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800">
                  Addis Ababa, Ethiopia • Regional Hubs (Hawassa, Adama, Dire Dawa) • East Africa
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Target Decision Makers
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Managing Directors / CEOs",
                    "Operations Directors",
                    "IT & Engineering Heads",
                    "Import/Export Business Owners",
                    "Logistics & Supply Chain Managers",
                  ].map((role) => (
                    <span
                      key={role}
                      className="px-2.5 py-1 rounded-md bg-teal-50 text-kewa-teal border border-teal-100 text-[11px] font-medium"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Supported Languages
                </label>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold">
                    English (Primary)
                  </span>
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold">
                    Amharic (Phase 1 Target - OD-004)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Default Calls-To-Action
            </h2>
            <p className="text-xs text-slate-600">
              Pre-approved CTAs for organic social posts and inquiry capture:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Direct Message (DM)</div>
                  <div className="text-[11px] text-slate-500">
                    "Send us a direct message to discuss your software project"
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Primary CTA
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">WhatsApp Business Chat</div>
                  <div className="text-[11px] text-slate-500">
                    "Chat with our engineering team on WhatsApp (+251 91 123 4567)"
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-medium">
                  Direct Inbound
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Consultation Booking Form</div>
                  <div className="text-[11px] text-slate-500">
                    "Book a 30-minute discovery call at kewakibt.com/contact"
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-medium">
                  Web Inbound
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
