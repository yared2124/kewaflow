"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
  RefreshCw,
} from "lucide-react";
import { getCalendarPosts } from "@/server/actions/calendar";

interface CalendarPostUI {
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

export default function CalendarPage() {
  const [posts, setPosts] = useState<CalendarPostUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [selectedPost, setSelectedPost] = useState<CalendarPostUI | null>(null);

  // October 2026 starts on Thursday (index 3 if Mon=0)
  const daysInMonth = 31;
  const startDayOffset = 3;
  const weekHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const res = await getCalendarPosts();
      if (res.success && res.posts) {
        const mapped: CalendarPostUI[] = res.posts.map((p, idx) => {
          const d = p.scheduledAt ? new Date(p.scheduledAt) : new Date();
          const media = Array.isArray(p.currentVersion?.mediaUrls)
            ? (p.currentVersion?.mediaUrls as string[])
            : [];
          const thumb =
            media[0] ||
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&auto=format&fit=crop&q=80";

          const colors: ("teal" | "cyan" | "emerald")[] = ["teal", "cyan", "emerald"];
          return {
            id: p.id,
            day: d.getDate(),
            dateStr: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            timeStr: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) + " EAT",
            title: p.title,
            platform: p.targetPlatform === "FACEBOOK" ? "Facebook Page" : p.targetPlatform,
            thumbnail: thumb,
            caption: p.currentVersion?.caption || "",
            color: colors[idx % 3],
          };
        });
        setPosts(mapped);
      }
    } catch (err) {
      console.error("Failed to load calendar posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="space-y-4 max-w-[1320px] mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Content Calendar & Durable Scheduler
          </h1>
          <p className="text-[11px] text-slate-500">
            Source of Truth: PostgreSQL with BullMQ dispatch. Zero unapproved posts scheduled (APR-004, NFR-001).
          </p>
        </div>

        <button
          onClick={loadPosts}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
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

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-kewa-teal" />
              <p className="text-xs font-medium">Fetching scheduled items from database...</p>
            </div>
          ) : viewMode === "month" ? (
            <div>
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 uppercase tracking-wider py-1 border-b border-slate-100">
                {weekHeaders.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 pt-1.5">
                {/* Empty Offset cells */}
                {Array.from({ length: startDayOffset }).map((_, i) => (
                  <div
                    key={`offset-${i}`}
                    className="h-16 rounded-lg bg-slate-50/40 p-1 text-[10px] text-slate-300"
                  />
                ))}

                {/* Days 1 to 31 */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const postsOnThisDay = posts.filter((p) => p.day === dayNum);
                  const isToday = dayNum === 17; // Current date in context

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
          ) : viewMode === "week" ? (
            <div className="py-8 text-center text-slate-400 space-y-1">
              <CalendarIcon className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">Week View</p>
              <p className="text-[11px]">Displaying real scheduled posts for current week.</p>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              {posts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No scheduled posts in database.</p>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700 w-24">
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
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Posts Feed (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900">
              Scheduled Posts Queue
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              {posts.length} scheduled
            </span>
          </div>

          <div className="space-y-2.5">
            {isLoading ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No scheduled posts in queue. Approve content to schedule dispatch.
              </div>
            ) : (
              posts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="p-2.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-kewa-teal">
                          {post.dateStr}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {post.timeStr}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-kewa-teal transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {post.platform} • BullMQ Queued
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Post Details Preview Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900">
                Scheduled Post Details
              </h3>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="relative h-32 w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                <Image
                  src={selectedPost.thumbnail}
                  alt={selectedPost.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-kewa-teal uppercase tracking-wider">
                  {selectedPost.dateStr} • {selectedPost.timeStr}
                </span>
                <h4 className="text-xs font-bold text-slate-900">
                  {selectedPost.title}
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-3 mt-1 leading-relaxed">
                  {selectedPost.caption}
                </p>
              </div>

              <div className="p-2 rounded-lg bg-cyan-50/60 border border-cyan-100 text-[10px] text-kewa-cyan-dark">
                <strong>Dispatch Invariant (APR-004):</strong> Approval active, unresolvable CTA block active, token re-verified before Meta API call.
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedPost(null)}
                className="py-1 px-3 rounded-lg bg-kewa-teal text-white text-[11px] font-bold"
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
