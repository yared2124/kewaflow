import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  PenTool,
  FileCheck2,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Users,
  Shield,
  Settings,
  Sun,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { MOCK_ADMIN_USER, MOCK_CONNECTED_PAGE } from "@/lib/mock-data";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-kewa-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Header */}
          <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-kewa-teal flex items-center justify-center text-kewa-cyan font-bold text-xl shadow-xs">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-white"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              KewaFlow
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-kewa-teal text-white font-medium shadow-xs transition-colors"
            >
              <Home className="w-5 h-5 text-white" />
              <span>Overview</span>
            </Link>

            <Link
              href="/content"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
            >
              <PenTool className="w-5 h-5 text-slate-400" />
              <span>Content Studio</span>
            </Link>

            <Link
              href="/approvals"
              className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-5 h-5 text-slate-400" />
                <span>Approval Queue</span>
              </div>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-50 text-kewa-cyan-dark border border-cyan-100">
                3
              </span>
            </Link>

            <Link
              href="/calendar"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
            >
              <CalendarIcon className="w-5 h-5 text-slate-400" />
              <span>Calendar</span>
            </Link>

            <Link
              href="/media"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
            >
              <ImageIcon className="w-5 h-5 text-slate-400" />
              <span>Media Library</span>
            </Link>

            <Link
              href="/leads"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
            >
              <Users className="w-5 h-5 text-slate-400" />
              <span>Leads</span>
            </Link>

            <Link
              href="/brand"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
            >
              <Shield className="w-5 h-5 text-slate-400" />
              <span>Brand Profile</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
            >
              <Settings className="w-5 h-5 text-slate-400" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer - Kewakibt Branding */}
        <div className="p-4 border-t border-slate-100 m-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-kewa-teal flex items-center justify-center text-white font-bold text-lg shadow-xs">
              K
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">
                Kewakibt
              </p>
              <p className="text-xs text-slate-500">Software Solutions</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 tracking-wide font-medium">
            Build • Automate • Grow
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          {/* Greeting */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Good morning, Yared
              </h1>
              <p className="text-xs text-slate-500">
                Your marketing, reviewed and ready.
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            {/* Facebook Connection Card */}
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs">
              <div className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm">
                f
              </div>
              <div className="text-left">
                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                  Facebook Page
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {MOCK_CONNECTED_PAGE.name}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 ml-1" />
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200">
                <Image
                  src={MOCK_ADMIN_USER.avatarUrl}
                  alt={MOCK_ADMIN_USER.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {MOCK_ADMIN_USER.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {MOCK_ADMIN_USER.role}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
