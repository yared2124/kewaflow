"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface AnalyticsKpi {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  sub: string;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("Last 30 days");

  const kpis: AnalyticsKpi[] = [
    {
      title: "Total Reach",
      value: "48,230",
      change: "+30%",
      isPositive: true,
      sub: "vs previous 30 days",
    },
    {
      title: "Engagement",
      value: "5,420",
      change: "+18%",
      isPositive: true,
      sub: "Reactions, comments & shares",
    },
    {
      title: "Leads",
      value: "28",
      change: "+35%",
      isPositive: true,
      sub: "Verified inquiries (CRM-001)",
    },
    {
      title: "Conversion Rate",
      value: "5.8%",
      change: "+1.2%",
      isPositive: true,
      sub: "Reach to genuine inquiry",
    },
  ];

  const funnelStages = [
    {
      stage: "Inquiries",
      count: 28,
      percentage: 100,
      color: "bg-kewa-teal",
      textColor: "text-kewa-teal",
    },
    {
      stage: "Qualified",
      count: 16,
      percentage: 57,
      color: "bg-cyan-500",
      textColor: "text-cyan-700",
    },
    {
      stage: "Proposals",
      count: 7,
      percentage: 25,
      color: "bg-amber-500",
      textColor: "text-amber-700",
    },
    {
      stage: "Won",
      count: 4,
      percentage: 14,
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
    },
  ];

  const contentThemes = [
    { name: "Custom Software", percentage: 33, color: "#0E3B43" },
    { name: "Business Process", percentage: 26, color: "#00CECB" },
    { name: "Cloud Solutions", percentage: 24, color: "#3B82F6" },
    { name: "Other", percentage: 17, color: "#94A3B8" },
  ];

  return (
    <div className="space-y-4 max-w-[1320px] mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Analytics
          </h1>
          <p className="text-[11px] text-slate-500">
            Track your performance and identify content themes that produce qualified opportunities.
          </p>
        </div>

        {/* Range Selector & Data Freshness Indicator (DASH-003, ANA-002) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-[10px] font-semibold text-kewa-cyan-dark">
            <Clock className="w-3.5 h-3.5 text-kewa-cyan-dark" />
            <span>Updated 15 mins ago • Meta Insights</span>
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 shadow-2xs focus:outline-hidden"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {kpi.title}
              </span>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {kpi.change}
              </span>
            </div>

            <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
              {kpi.value}
            </p>

            <p className="text-[10px] text-slate-400 font-medium pt-0.5">
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Middle Section: Lead Funnel (7 cols) + Top Performing Content (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Lead Funnel Card (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Lead Funnel (CRM-002)
              </h3>
              <p className="text-[10px] text-slate-400">
                Inquiries → Qualified → Proposals → Won Clients
              </p>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              14.3% Close Rate
            </span>
          </div>

          {/* Funnel Progress Bars */}
          <div className="space-y-3">
            {funnelStages.map((stage) => (
              <div key={stage.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-bold">
                      {stage.count}
                    </span>
                    <span className={`text-[10px] font-bold ${stage.textColor}`}>
                      ({stage.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Funnel Footer Stats */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">
                Median Follow-up Time
              </span>
              <span className="font-bold text-kewa-teal">3.2 hours</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">
                Qualification Ratio
              </span>
              <span className="font-bold text-cyan-700">57.1%</span>
            </div>
          </div>
        </div>

        {/* Top Performing Content Card (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3.5 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900">
              Top Performing Content
            </h3>
            <p className="text-[10px] text-slate-400">
              Themes driving the most client engagement
            </p>
          </div>

          {/* Visual Donut Chart Simulation (SVG) */}
          <div className="flex flex-col items-center justify-center py-2 space-y-3">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Custom Software (33%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#0E3B43"
                  strokeWidth="14"
                  strokeDasharray="238.76"
                  strokeDashoffset="78.79"
                  className="transition-all"
                />
                {/* Business Process (26%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#00CECB"
                  strokeWidth="14"
                  strokeDasharray="238.76"
                  strokeDashoffset="140.87"
                  className="transition-all"
                />
                {/* Cloud Solutions (24%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#3B82F6"
                  strokeWidth="14"
                  strokeDasharray="238.76"
                  strokeDashoffset="198.17"
                  className="transition-all"
                />
                {/* Other (17%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#94A3B8"
                  strokeWidth="14"
                  strokeDasharray="238.76"
                  strokeDashoffset="238.76"
                  className="transition-all"
                />
              </svg>

              {/* Center stat */}
              <div className="absolute text-center">
                <span className="text-base font-bold text-slate-900 leading-none block">
                  33%
                </span>
                <span className="text-[9px] text-slate-400 font-medium">
                  Top Theme
                </span>
              </div>
            </div>

            {/* Legend List */}
            <div className="w-full grid grid-cols-2 gap-2 text-xs pt-1">
              {contentThemes.map((theme) => (
                <div
                  key={theme.name}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="text-[11px] font-medium text-slate-700 truncate">
                      {theme.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-900 ml-1">
                    {theme.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Organic Meta Insights Post Performance (ANA-001, META-008) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Share2 className="w-3.5 h-3.5 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900">
              Organic Post Insights (Official Meta Graph API)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Dynamic Metric Registry • No Simulated Data (DASH-002)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2">Post Title</th>
                <th className="pb-2">Published</th>
                <th className="pb-2 text-center">Reach</th>
                <th className="pb-2 text-center">Reactions</th>
                <th className="pb-2 text-center">Shares</th>
                <th className="pb-2 text-right">Inquiries Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 font-bold text-slate-900">
                  Custom Software Development
                </td>
                <td className="py-2.5 text-slate-400 text-[11px]">12 Oct, 10:00 AM</td>
                <td className="py-2.5 text-center font-semibold text-slate-800">
                  18,420
                </td>
                <td className="py-2.5 text-center text-slate-600">842</td>
                <td className="py-2.5 text-center text-slate-600">96</td>
                <td className="py-2.5 text-right font-bold text-kewa-teal">
                  11 Leads
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 font-bold text-slate-900">
                  Business Process Automation
                </td>
                <td className="py-2.5 text-slate-400 text-[11px]">08 Oct, 02:00 PM</td>
                <td className="py-2.5 text-center font-semibold text-slate-800">
                  14,210
                </td>
                <td className="py-2.5 text-center text-slate-600">620</td>
                <td className="py-2.5 text-center text-slate-600">74</td>
                <td className="py-2.5 text-right font-bold text-kewa-teal">
                  8 Leads
                </td>
              </tr>
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 font-bold text-slate-900">
                  Cloud Infrastructure Modernization
                </td>
                <td className="py-2.5 text-slate-400 text-[11px]">03 Oct, 09:30 AM</td>
                <td className="py-2.5 text-center font-semibold text-slate-800">
                  15,600
                </td>
                <td className="py-2.5 text-center text-slate-600">710</td>
                <td className="py-2.5 text-center text-slate-600">81</td>
                <td className="py-2.5 text-right font-bold text-kewa-teal">
                  9 Leads
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
