import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  CalendarDays,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Activity,
  CheckCircle2,
  Calendar,
  Users2,
  Share2,
} from "lucide-react";
import {
  MOCK_KPI_METRICS,
  MOCK_REVIEW_POSTS,
  MOCK_WEEKLY_SCHEDULE,
  MOCK_FOLLOW_UP_LEADS,
  MOCK_RECENT_ACTIVITY,
} from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-5 max-w-[1320px] mx-auto pb-8">
      {/* 1. Top 4 Metric Cards (Compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {MOCK_KPI_METRICS.map((kpi) => {
          let IconComponent = FileText;
          if (kpi.iconName === "approval") IconComponent = ShieldCheck;
          if (kpi.iconName === "scheduled") IconComponent = CalendarDays;
          if (kpi.iconName === "leads") IconComponent = UserCheck;

          return (
            <div
              key={kpi.id}
              className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-50 border border-cyan-100/70 flex items-center justify-center text-kewa-cyan-dark shrink-0">
                <IconComponent className="w-5 h-5 text-kewa-cyan-dark" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
                  {kpi.count}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight pt-0.5">
                  {kpi.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Middle Section: Needs Your Review (Left 2 cols) + Widgets (Right col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Columns: Needs Your Review */}
        <div className="lg:col-span-2 space-y-3">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center text-amber-500">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Needs your review
              </h2>
              <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded-full bg-cyan-50 text-kewa-cyan-dark border border-cyan-100">
                3
              </span>
            </div>
            <Link
              href="/approvals"
              className="text-xs font-semibold text-slate-500 hover:text-kewa-teal flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {MOCK_REVIEW_POSTS.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  {/* Post Platform & Status */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        f
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-[11px]">
                          {post.platform}
                        </span>
                        <span className="text-slate-400 ml-1 text-[10px]">
                          {post.timeAgo}
                        </span>
                      </div>
                    </div>
                    {post.statusType === "awaiting" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Awaiting approval
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        Ready for review
                      </span>
                    )}
                  </div>

                  {/* Post Copy */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {post.body}
                    </p>
                  </div>

                  {/* Post Graphic Banner (Facebook Creative Simulation) */}
                  <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-kewa-teal to-kewa-teal-light text-white p-3 h-32 flex flex-col justify-between shadow-inner">
                    <div className="relative z-10 flex items-center gap-1 text-[10px] text-cyan-200 font-medium">
                      <span className="font-bold tracking-wider text-white">
                        KewaFlow
                      </span>
                    </div>

                    <div className="relative z-10 space-y-0.5 max-w-[62%]">
                      <h4 className="text-xs font-bold leading-tight">
                        {post.bannerTitle}
                      </h4>
                      <p className="text-[10px] text-cyan-100 font-medium leading-tight">
                        {post.bannerSubtitle}
                      </p>
                    </div>

                    <div className="relative z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-kewa-teal text-[10px] font-bold shadow-xs">
                        {post.bannerCta}
                      </span>
                    </div>

                    {/* Realistic Photo Background blend */}
                    <div className="absolute right-0 top-0 bottom-0 w-[45%] opacity-90 overflow-hidden">
                      <Image
                        src={post.bannerImage}
                        alt={post.bannerTitle}
                        fill
                        className="object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-kewa-teal via-kewa-teal/60 to-transparent" />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100">
                  <Link
                    href={`/approvals/${post.id}`}
                    className="py-1.5 rounded-lg bg-kewa-teal hover:bg-kewa-teal-hover text-white text-[11px] font-bold text-center shadow-xs transition-colors"
                  >
                    Review content
                  </Link>
                  <button className="py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold text-center transition-colors">
                    View details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Weekly Schedule & Follow-up Reminders */}
        <div className="space-y-4">
          {/* Widget 1: Weekly Publishing Schedule */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900">
                  Weekly Publishing Schedule
                </h3>
              </div>
              <Link
                href="/calendar"
                className="text-[11px] font-semibold text-slate-500 hover:text-kewa-teal flex items-center gap-0.5"
              >
                View calendar <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {MOCK_WEEKLY_SCHEDULE.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-[11px] py-0.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-slate-700 w-7">
                      {item.day}
                    </span>
                    <span className="text-slate-400 w-11">{item.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span className="truncate max-w-[140px]">{item.topic}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Follow-up Reminders */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900">
                  Follow-up Reminders
                </h3>
              </div>
              <Link
                href="/leads"
                className="text-[11px] font-semibold text-slate-500 hover:text-kewa-teal flex items-center gap-0.5"
              >
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-1.5">
              {MOCK_FOLLOW_UP_LEADS.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {lead.initials}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 leading-tight">
                        {lead.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {lead.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {lead.tagColor === "amber" && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        {lead.tag}
                      </span>
                    )}
                    {lead.tagColor === "peach" && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-orange-50 text-orange-700 border border-orange-100">
                        {lead.tag}
                      </span>
                    )}
                    {lead.tagColor === "emerald" && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {lead.tag}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-medium">
                      {lead.dueDate}
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Full-Width Section: Recent Activity Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-700">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Activity
            </h3>
          </div>
          <button className="text-xs font-semibold text-slate-500 hover:text-kewa-teal flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Compact Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2 w-32">Time</th>
                <th className="pb-2 w-44">Action</th>
                <th className="pb-2">Details</th>
                <th className="pb-2 w-24 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {MOCK_RECENT_ACTIVITY.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 text-slate-400 font-normal text-[11px]">
                    {act.timeAgo}
                  </td>
                  <td className="py-2.5 font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    {act.actionIcon === "approval" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                    {act.actionIcon === "lead" && (
                      <Users2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    )}
                    {act.actionIcon === "published" && (
                      <Share2 className="w-3.5 h-3.5 text-kewa-teal shrink-0" />
                    )}
                    <span>{act.action}</span>
                  </td>
                  <td className="py-2.5 text-slate-600 font-medium text-xs">
                    {act.details}
                  </td>
                  <td className="py-2.5 text-right">
                    {act.statusColor === "amber" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        {act.status}
                      </span>
                    )}
                    {act.statusColor === "emerald" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {act.status}
                      </span>
                    )}
                    {act.statusColor === "cyan" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-100">
                        {act.status}
                      </span>
                    )}
                    {act.statusColor === "teal" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {act.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
