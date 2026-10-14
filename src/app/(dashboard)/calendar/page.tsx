"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Share2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface ScheduledCalendarPost {
  id: string;
  day: number;
  dateStr: string;
  timeStr: string;
  title: string;
  platform: string;
  thumbnail: string;
  caption: string;
  color: "teal" | "cyan" | "emerald";
}

const OCTOBER_POSTS: ScheduledCalendarPost[] = [
  {
    id: "cal-1",
    day: 6,
    dateStr: "Oct 6, 2026",
    timeStr: "10:00 AM EAT (UTC+3)",
    title: "Custom Software Development",
    platform: "Facebook Page",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&auto=format&fit=crop&q=80",
    caption: "Turn your ideas into powerful digital solutions. We build scalable, secure and user-friendly software tailored to your business needs.",
    color: "teal",
  },
  {
    id: "cal-2",
    day: 14,
    dateStr: "Oct 14, 2026",
    timeStr: "11:30 AM EAT (UTC+3)",
    title: "Business Process Automation",
    platform: "Facebook Page",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&auto=format&fit=crop&q=80",
    caption: "Streamline your operations, reduce manual work, and increase productivity with intelligent automation solutions.",
    color: "cyan",
  },
  {
    id: "cal-3",
    day: 16,
    dateStr: "Oct 16, 2026",
    timeStr: "02:00 PM EAT (UTC+3)",
    title: "Cloud Solutions for SMEs",
    platform: "Facebook Page",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&auto=format&fit=crop&q=80",
    caption: "Modernize your data infrastructure with zero downtime. Cloud architecture designed for resilience and cost control.",
    color: "emerald",
  },
  {
    id: "cal-4",
    day: 21,
    dateStr: "Oct 21, 2026",
    timeStr: "09:00 AM EAT (UTC+3)",
    title: "Digital Transformation",
    platform: "Facebook Page",
    thumbnail: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&auto=format&fit=crop&q=80",
    caption: "How Kewakibt engineers modern legacy system modernization for enterprise institutions.",
    color: "teal",
  },
  {
    id: "cal-5",
    day: 26,
    dateStr: "Oct 26, 2026",
    timeStr: "04:30 PM EAT (UTC+3)",
    title: "Enterprise Systems Integration",
    platform: "Facebook Page",
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&auto=format&fit=crop&q=80",
    caption: "Connect internal ERPs, banking switches, and client portals with fault-tolerant APIs.",
    color: "cyan",
  },
];

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [selectedPost, setSelectedPost] = useState<ScheduledCalendarPost | null>(null);

  // October 2026 starts on Thursday (index 3 if Mon=0)
  // Days in month: 31
  const daysInMonth = 31;
  const startDayOffset = 3; // Monday = 0, Tuesday = 1, Wednesday = 2, Thursday = 3

  const weekHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-4 max-w-[1320px] mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Content Calendar
          </h1>
          <p className="text-[11px] text-slate-500">
            Review and manage scheduled posts. Stored in UTC and shown in your local timezone (EAT).
          </p>
        </div>

        {/* Timezone & Scheduler Notice (SCHED-001, SCHED-003) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-[10px] font-semibold text-kewa-cyan-dark self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-kewa-cyan-dark" />
          <span>PostgreSQL Durable Outbox Active</span>
        </div>
      </div>

      {/* Main Split: Calendar Grid (8 cols) + Upcoming Posts (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3">
          {/* Calendar Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            {/* Left: Today + Navigation + Month/Year */}
            <div className="flex items-center gap-2">
              <button className="py-1 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer">
                Today
              </button>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                <button className="p-1 hover:bg-slate-50 text-slate-600 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-slate-50 text-slate-600 transition-colors border-l border-slate-200">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-sm font-bold text-slate-900 ml-1">
                October 2026
              </h2>
            </div>

            {/* Right: View Toggles (Month, Week, List) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setViewMode("month")}
                className={`py-1 px-3 rounded-md transition-colors cursor-pointer ${
                  viewMode === "month"
                    ? "bg-white text-kewa-teal shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`py-1 px-3 rounded-md transition-colors cursor-pointer ${
                  viewMode === "week"
                    ? "bg-white text-kewa-teal shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`py-1 px-3 rounded-md transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-kewa-teal shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                List
              </button>
            </div>
          </div>

          {/* Monthly Calendar Grid */}
          {viewMode === "month" && (
            <div>
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 uppercase tracking-wider py-1 border-b border-slate-100">
                {weekHeaders.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 pt-1.5">
                {/* Empty Offset cells before day 1 */}
                {Array.from({ length: startDayOffset }).map((_, i) => (
                  <div
                    key={`offset-${i}`}
                    className="h-16 rounded-lg bg-slate-50/40 p-1 text-[10px] text-slate-300"
                  />
                ))}

                {/* Days 1 to 31 */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const postsOnThisDay = OCTOBER_POSTS.filter(
                    (p) => p.day === dayNum
                  );
                  const isToday = dayNum === 15;

                  return (
                    <div
                      key={`day-${dayNum}`}
                      className={`h-16 rounded-lg border p-1 flex flex-col justify-between transition-colors ${
                        isToday
                          ? "border-kewa-teal/40 bg-teal-50/20"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold leading-none ${
                            isToday
                              ? "w-4 h-4 rounded-full bg-kewa-teal text-white flex items-center justify-center text-[9px]"
                              : "text-slate-600"
                          }`}
                        >
                          {dayNum}
                        </span>
                      </div>

                      {/* Scheduled Post Chips */}
                      <div className="space-y-0.5 overflow-hidden">
                        {postsOnThisDay.map((post) => (
                          <button
                            key={post.id}
                            onClick={() => setSelectedPost(post)}
                            className="w-full text-left truncate px-1 py-0.5 rounded text-[9px] font-bold bg-teal-50 text-kewa-teal border border-teal-200/80 hover:bg-teal-100/70 transition-colors block cursor-pointer"
                          >
                            Post: {post.title.slice(0, 10)}...
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Week View */}
          {viewMode === "week" && (
            <div className="py-8 text-center text-slate-400 space-y-1">
              <CalendarIcon className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">Week View</p>
              <p className="text-[11px]">Displaying 7-day schedule for Oct 12 – Oct 18, 2026.</p>
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-2 pt-2">
              {OCTOBER_POSTS.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 w-16">
                      {post.dateStr}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {post.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {post.timeStr}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Posts Feed (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900">
              Upcoming Posts
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              4 scheduled
            </span>
          </div>

          <div className="space-y-2.5">
            {OCTOBER_POSTS.slice(0, 4).map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/70 transition-all cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <Image
                    src={post.thumbnail}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate leading-snug group-hover:text-kewa-teal transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{post.dateStr} • {post.timeStr.split(" ")[0]} {post.timeStr.split(" ")[1]}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Post Preview Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Scheduled Post Details
                </h3>
                <p className="text-[10px] text-slate-400">
                  {selectedPost.platform} • Scheduled Dispatch
                </p>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Pre-dispatch validation passed. Approval is ACTIVE.</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Scheduled Time (Local EAT)
                </span>
                <p className="text-xs font-bold text-slate-900">
                  {selectedPost.dateStr} at {selectedPost.timeStr}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Post Copy
                </span>
                <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
                  {selectedPost.caption}
                </p>
              </div>

              <div className="relative rounded-lg overflow-hidden h-36 w-full bg-slate-100">
                <Image
                  src={selectedPost.thumbnail}
                  alt={selectedPost.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedPost(null)}
                className="py-1 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
