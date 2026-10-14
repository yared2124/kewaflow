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
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      {/* 1. Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {MOCK_KPI_METRICS.map((kpi) => {
          let IconComponent = FileText;
          if (kpi.iconName === "approval") IconComponent = ShieldCheck;
          if (kpi.iconName === "scheduled") IconComponent = CalendarDays;
          if (kpi.iconName === "leads") IconComponent = UserCheck;

          return (
            <div
              key={kpi.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100/70 flex items-center justify-center text-kewa-cyan-dark shrink-0">
                <IconComponent className="w-6 h-6 text-kewa-cyan-dark" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">
                  {kpi.count}
                </p>
                <p className="text-xs text-slate-500 leading-snug">
                  {kpi.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Middle Section: Needs Your Review (Left 2 cols) + Widgets (Right col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Needs Your Review */}
        <div className="lg:col-span-2 space-y-4">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Needs your review
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-50 text-kewa-cyan-dark border border-cyan-100">
                3
              </span>
            </div>
            <Link
              href="/approvals"
              className="text-xs font-semibold text-slate-500 hover:text-kewa-teal flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MOCK_REVIEW_POSTS.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Post Platform & Status */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        f
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">
                          {post.platform}
                        </span>
                        <span className="text-slate-400 ml-1.5 font-normal">
                          {post.timeAgo}
                        </span>
                      </div>
                    </div>
                    {post.statusType === "awaiting" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Awaiting approval
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        Ready for review
                      </span>
                    )}
                  </div>

                  {/* Post Copy */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 mt-1 leading-relaxed">
                      {post.body}
                    </p>
                  </div>

                  {/* Post Graphic Banner (Facebook Creative Simulation) */}
                  <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-kewa-teal to-kewa-teal-light text-white p-4 h-44 flex flex-col justify-between shadow-inner">
                    <div className="relative z-10 flex items-center gap-1.5 text-xs text-cyan-200 font-medium">
                      <span className="font-bold tracking-wider text-white">
                        KewaFlow
                      </span>
                    </div>

                    <div className="relative z-10 space-y-1 max-w-[65%]">
                      <h4 className="text-sm font-bold leading-tight">
                        {post.bannerTitle}
                      </h4>
                      <p className="text-[11px] text-cyan-100 font-medium">
                        {post.bannerSubtitle}
                      </p>
                    </div>

                    <div className="relative z-10">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-kewa-teal text-[11px] font-bold shadow-xs">
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
                <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-slate-100">
                  <Link
                    href={`/approvals/${post.id}`}
                    className="py-2.5 rounded-xl bg-kewa-teal hover:bg-kewa-teal-hover text-white text-xs font-bold text-center shadow-xs transition-colors"
                  >
                    Review content
                  </Link>
                  <button className="py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold text-center transition-colors">
                    View details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Weekly Schedule & Follow-up Reminders */}
        <div className="space-y-6">
          {/* Widget 1: Weekly Publishing Schedule */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Weekly Publishing Schedule
                </h3>
              </div>
              <Link
                href="/calendar"
                className="text-xs font-semibold text-slate-500 hover:text-kewa-teal flex items-center gap-1"
              >
                View calendar <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_WEEKLY_SCHEDULE.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700 w-8">
                      {item.day}
                    </span>
                    <span className="text-slate-400 w-12">{item.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <span>{item.topic}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Follow-up Reminders */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Follow-up Reminders
                </h3>
              </div>
              <Link
                href="/leads"
                className="text-xs font-semibold text-slate-500 hover:text-kewa-teal flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_FOLLOW_UP_LEADS.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {lead.initials}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {lead.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {lead.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {lead.tagColor === "amber" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        {lead.tag}
                      </span>
                    )}
                    {lead.tagColor === "peach" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100">
                        {lead.tag}
                      </span>
                    )}
                    {lead.tagColor === "emerald" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {lead.tag}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500 font-medium">
                      {lead.dueDate}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Full-Width Section: Recent Activity Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Activity
            </h3>
          </div>
          <button className="text-xs font-semibold text-slate-500 hover:text-kewa-teal flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="pb-3 w-36">Time</th>
                <th className="pb-3 w-48">Action</th>
                <th className="pb-3">Details</th>
                <th className="pb-3 w-28 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {MOCK_RECENT_ACTIVITY.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 text-slate-400 font-normal">
                    {act.timeAgo}
                  </td>
                  <td className="py-3.5 font-semibold text-slate-800 flex items-center gap-2">
                    {act.actionIcon === "approval" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    {act.actionIcon === "lead" && (
                      <Users2 className="w-4 h-4 text-cyan-600 shrink-0" />
                    )}
                    {act.actionIcon === "published" && (
                      <Share2 className="w-4 h-4 text-kewa-teal shrink-0" />
                    )}
                    <span>{act.action}</span>
                  </td>
                  <td className="py-3.5 text-slate-600 font-medium">
                    {act.details}
                  </td>
                  <td className="py-3.5 text-right">
                    {act.statusColor === "amber" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        {act.status}
                      </span>
                    )}
                    {act.statusColor === "emerald" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {act.status}
                      </span>
                    )}
                    {act.statusColor === "cyan" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-100">
                        {act.status}
                      </span>
                    )}
                    {act.statusColor === "teal" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
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
