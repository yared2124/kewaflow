"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Eye,
  Activity,
  Calendar,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Share2,
  FileText,
  BarChart2,
  Loader2,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { getAnalyticsData } from "@/server/actions/analytics";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("Last 30 days");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await getAnalyticsData();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const stats = data?.stats || {
    totalLeads: 0,
    totalPipelineValue: 0,
    wonValue: 0,
    conversionRate: "0.0",
    qualificationRate: "0.0",
    totalContentItems: 0,
    approvedItems: 0,
    scheduledItems: 0,
    publishedItems: 0,
  };

  const stageCounts = data?.stageCounts || {
    INQUIRY: 0,
    QUALIFIED: 0,
    PROPOSAL: 0,
    WON: 0,
    LOST: 0,
  };

  const totalInquiries = Math.max(stats.totalLeads, 1);
  const funnelStages = [
    {
      stage: "Inquiries (CRM-001)",
      count: stageCounts.INQUIRY,
      percentage: Math.round((stageCounts.INQUIRY / totalInquiries) * 100) || 100,
      color: "bg-kewa-teal",
      textColor: "text-kewa-teal",
    },
    {
      stage: "Qualified Leads",
      count: stageCounts.QUALIFIED,
      percentage: Math.round((stageCounts.QUALIFIED / totalInquiries) * 100),
      color: "bg-cyan-500",
      textColor: "text-cyan-700",
    },
    {
      stage: "Formal Proposals",
      count: stageCounts.PROPOSAL,
      percentage: Math.round((stageCounts.PROPOSAL / totalInquiries) * 100),
      color: "bg-amber-500",
      textColor: "text-amber-700",
    },
    {
      stage: "Won Contracts",
      count: stageCounts.WON,
      percentage: Math.round((stageCounts.WON / totalInquiries) * 100),
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
    },
  ];

  const kpis = [
    {
      title: "Pipeline Deal Value",
      value: `$${stats.totalPipelineValue.toLocaleString()}`,
      change: "Active",
      isPositive: true,
      sub: `Won: $${stats.wonValue.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      title: "Verified Leads",
      value: String(stats.totalLeads),
      change: "CRM-001 Strict",
      isPositive: true,
      sub: "Excludes vanity likes/reach",
      icon: Users,
    },
    {
      title: "Content Items",
      value: String(stats.totalContentItems),
      change: `${stats.approvedItems} Approved`,
      isPositive: true,
      sub: `${stats.scheduledItems} Scheduled`,
      icon: FileText,
    },
    {
      title: "Deal Win Rate",
      value: `${stats.conversionRate}%`,
      change: `${stats.qualificationRate}% Qual`,
      isPositive: true,
      sub: "Inquiry to closed client",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-4 max-w-[1320px] mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Performance Analytics & Revenue Attribution
          </h1>
          <p className="text-[11px] text-slate-500">
            Real pipeline metrics directly from PostgreSQL. Strictly compliant with CRM-001 (Likes and reach are NEVER labeled as leads).
          </p>
        </div>

        {/* Range Selector & Data Freshness Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadAnalytics}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-[10px] font-semibold text-kewa-cyan-dark">
            <Clock className="w-3.5 h-3.5 text-kewa-cyan-dark" />
            <span>PostgreSQL Synchronized</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-kewa-teal" />
          <p className="text-xs font-medium">Aggregating live CRM and publishing analytics...</p>
        </div>
      ) : (
        <>
          {/* Top 4 Real KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {kpis.map((kpi, idx) => {
              const IconComp = kpi.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-cyan-50 border border-cyan-100/70 flex items-center justify-center text-kewa-cyan-dark shrink-0">
                    <IconComp className="w-5 h-5 text-kewa-cyan-dark" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {kpi.title}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
                        {kpi.value}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-600">
                        {kpi.change}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight pt-0.5">
                      {kpi.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main 2-Column Split: Lead Conversion Funnel (8 cols) + Publishing Breakdown (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 8 Cols: Genuine Lead Conversion Funnel */}
            <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    CRM Pipeline Funnel (CRM-002)
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Strict stages: INQUIRY → QUALIFIED → PROPOSAL → WON
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Total Active Value: ${stats.totalPipelineValue.toLocaleString()}
                </span>
              </div>

              {/* Funnel Progress Bars */}
              <div className="space-y-3 pt-1">
                {funnelStages.map((stage, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {stage.stage}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="font-bold text-slate-900">
                          {stage.count} leads
                        </span>
                        <span className="text-slate-400">({stage.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                        style={{ width: `${Math.max(stage.percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800">Invariant Rule CRM-001 Check:</span>
                <p>
                  Zero vanity metrics (impressions, reactions, page reach) are merged into lead counts. Lead qualification requires verified corporate contact identifier and explicit inquiry record.
                </p>
              </div>
            </div>

            {/* Right 4 Cols: Content & Governance Breakdown */}
            <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-bold text-slate-900">
                  Content Governance Breakdown
                </h3>
                <p className="text-[10px] text-slate-400">
                  Three-axis state distribution (AGENTS.md §3)
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Total Produced:</span>
                  <span className="font-bold text-slate-900">{stats.totalContentItems}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-teal-50 border border-teal-100 text-kewa-teal">
                  <span className="font-medium">Approved Versions:</span>
                  <span className="font-bold">{stats.approvedItems}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-cyan-50 border border-cyan-100 text-cyan-800">
                  <span className="font-medium">BullMQ Scheduled:</span>
                  <span className="font-bold">{stats.scheduledItems}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800">
                  <span className="font-medium">Confirmed Published:</span>
                  <span className="font-bold">{stats.publishedItems}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-800">
                  <span className="font-medium">Active Approvals:</span>
                  <span className="font-bold">{stats.approvalsCount}</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100">
                AI Monthly Spend Cap: <strong>${stats.aiMonthlyBudgetCap.toFixed(2)} USD</strong> (Hard spend limit governed by BRD-001)
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
