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
  Sparkles,
} from "lucide-react";
import { getDashboardData } from "@/server/actions/dashboard";

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

function getStageBadge(stage: string) {
  switch (stage) {
    case "WON":
      return { label: "Won", bg: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    case "PROPOSAL":
      return { label: "Proposal", bg: "bg-amber-50 text-amber-700 border-amber-100" };
    case "QUALIFIED":
      return { label: "Qualified", bg: "bg-cyan-50 text-cyan-700 border-cyan-100" };
    case "LOST":
      return { label: "Lost", bg: "bg-slate-50 text-slate-600 border-slate-200" };
    default:
      return { label: "Inquiry", bg: "bg-orange-50 text-orange-700 border-orange-100" };
  }
}

export default async function DashboardPage() {
  const dashRes = await getDashboardData();
  const stats = dashRes.success && dashRes.stats ? dashRes.stats : {
    draftsCount: 0,
    pendingApprovalsCount: 0,
    scheduledPostsCount: 0,
    totalLeadsCount: 0,
    totalPipelineValue: 0,
  };

  const recentApprovals = (dashRes.success && dashRes.recentApprovals) || [];
  const recentLeads = (dashRes.success && dashRes.recentLeads) || [];
  const recentActivity = (dashRes.success && dashRes.recentActivity) || [];
  const scheduledItems = (dashRes.success && dashRes.scheduledItems) || [];

  const kpis = [
    {
      id: "drafts",
      title: "Drafts",
      count: stats.draftsCount,
      subtitle: "AI-generated content waiting for your review",
      icon: FileText,
    },
    {
      id: "awaiting",
      title: "Awaiting approval",
      count: stats.pendingApprovalsCount,
      subtitle: "Content ready for final review",
      icon: ShieldCheck,
    },
    {
      id: "scheduled",
      title: "Scheduled",
      count: stats.scheduledPostsCount,
      subtitle: "Posts set for automatic publishing",
      icon: CalendarDays,
    },
    {
      id: "leads",
      title: "Leads this month",
      count: stats.totalLeadsCount,
      subtitle: "New inquiries from your content",
      icon: UserCheck,
    },
  ];

  return (
    <div className="space-y-5 max-w-[1320px] mx-auto pb-8">
      {/* 1. Top 4 Metric Cards (Real PostgreSQL Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpis.map((kpi) => {
          const IconComponent = kpi.icon;
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

      {/* 2. Middle Section: Needs Your Review + Widgets */}
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
                {recentApprovals.length}
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
          {recentApprovals.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-xl p-8 text-center shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">All caught up!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No items are currently waiting for your review. AI drafts will appear here once generated.
              </p>
              <div className="pt-2">
                <Link
                  href="/content"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-kewa-teal text-white text-xs font-semibold hover:bg-kewa-teal-hover transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Create in Content Studio
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {recentApprovals.map((post) => {
                const mediaUrls = Array.isArray(post.currentVersion?.mediaUrls)
                  ? (post.currentVersion?.mediaUrls as string[])
                  : [];
                const bannerImage =
                  mediaUrls[0] ||
                  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80";

                return (
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
                              {post.targetPlatform === "FACEBOOK" ? "Facebook Page" : post.targetPlatform}
                            </span>
                            <span className="text-slate-400 ml-1 text-[10px]">
                              {formatTimeAgo(post.updatedAt)}
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Awaiting approval
                        </span>
                      </div>

                      {/* Post Copy */}
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                          {post.currentVersion?.caption || "No caption specified"}
                        </p>
                      </div>

                      {/* Post Graphic Banner */}
                      <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-kewa-teal to-kewa-teal-light text-white p-3 h-32 flex flex-col justify-between shadow-inner">
                        <div className="relative z-10 flex items-center gap-1 text-[10px] text-cyan-200 font-medium">
                          <span className="font-bold tracking-wider text-white">
                            KewaFlow
                          </span>
                        </div>

                        <div className="relative z-10 space-y-0.5 max-w-[62%]">
                          <h4 className="text-xs font-bold leading-tight line-clamp-1">
                            {post.title}
                          </h4>
                          <p className="text-[10px] text-cyan-100 font-medium leading-tight">
                            Enterprise Software • High Reliability
                          </p>
                        </div>

                        <div className="relative z-10">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-kewa-teal text-[10px] font-bold shadow-xs">
                            {post.currentVersion?.ctaUrl ? "Learn More →" : "Contact Us →"}
                          </span>
                        </div>

                        {/* Realistic Photo Background blend */}
                        <div className="absolute right-0 top-0 bottom-0 w-[45%] opacity-90 overflow-hidden">
                          <Image
                            src={bannerImage}
                            alt={post.title}
                            fill
                            unoptimized
                            className="object-cover object-center"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-kewa-teal via-kewa-teal/60 to-transparent" />
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100">
                      <Link
                        href="/approvals"
                        className="py-1.5 rounded-lg bg-kewa-teal hover:bg-kewa-teal-hover text-white text-[11px] font-bold text-center shadow-xs transition-colors"
                      >
                        Review content
                      </Link>
                      <Link
                        href="/approvals"
                        className="py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold text-center transition-colors"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
              {scheduledItems.length === 0 ? (
                <p className="text-[11px] text-slate-400 py-2 text-center">
                  No posts scheduled this week.
                </p>
              ) : (
                scheduledItems.map((item) => {
                  const dateObj = item.scheduledAt ? new Date(item.scheduledAt) : new Date();
                  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                  const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-[11px] py-0.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-slate-700 w-8">
                          {dayName}
                        </span>
                        <span className="text-slate-400 w-12">{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        <span className="truncate max-w-[140px]">{item.title}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Widget 2: Follow-up Reminders (Real Leads) */}
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
              {recentLeads.length === 0 ? (
                <p className="text-[11px] text-slate-400 py-2 text-center">
                  No leads recorded yet.
                </p>
              ) : (
                recentLeads.map((lead) => {
                  const badge = getStageBadge(lead.stage);
                  const initials = lead.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase();

                  return (
                    <Link
                      href="/leads"
                      key={lead.id}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div className="max-w-[110px] truncate">
                          <p className="text-[11px] font-bold text-slate-900 leading-tight truncate">
                            {lead.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {lead.contactChannel} • {lead.contactIdentifier}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-600 transition-colors" />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Full-Width Section: Recent Activity Table (Real AuditLog) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-700">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent System & Approval Activity
            </h3>
          </div>
          <Link
            href="/audit"
            className="text-xs font-semibold text-slate-500 hover:text-kewa-teal flex items-center gap-1 transition-colors"
          >
            View all audit records <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Compact Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2 w-32">Time</th>
                <th className="pb-2 w-52">Action</th>
                <th className="pb-2">Details</th>
                <th className="pb-2 w-28 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400 text-xs">
                    No activity recorded in audit trail yet.
                  </td>
                </tr>
              ) : (
                recentActivity.map((act) => {
                  const meta = act.metadata as Record<string, any> | null;
                  const detailsText =
                    meta?.title ||
                    meta?.versionHash ? `Hash: ${String(meta?.versionHash).slice(0, 16)}...` :
                    meta?.leadName ? `Lead: ${meta.leadName}` :
                    `Entity: ${act.entityType} (${act.entityId.slice(0, 10)})`;

                  const isApproval = act.action.includes("APPROVE");
                  const isPublish = act.action.includes("PUBLISH");
                  const isLead = act.action.includes("LEAD");

                  return (
                    <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 text-slate-400 font-normal text-[11px]">
                        {formatTimeAgo(act.createdAt)}
                      </td>
                      <td className="py-2.5 font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                        {isApproval && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                        {isLead && (
                          <Users2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                        )}
                        {isPublish && (
                          <Share2 className="w-3.5 h-3.5 text-kewa-teal shrink-0" />
                        )}
                        {!isApproval && !isLead && !isPublish && (
                          <Activity className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span>{act.action.replace(/_/g, " ")}</span>
                      </td>
                      <td className="py-2.5 text-slate-600 font-medium text-xs">
                        {detailsText}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Recorded
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
