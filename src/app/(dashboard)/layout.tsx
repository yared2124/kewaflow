"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: Home },
    { label: "Content Studio", href: "/content", icon: PenTool },
    { label: "Approval Queue", href: "/approvals", icon: FileCheck2, badge: "3" },
    { label: "Calendar", href: "/calendar", icon: CalendarIcon },
    { label: "Media Library", href: "/media", icon: ImageIcon },
    { label: "Leads", href: "/leads", icon: Users },
    { label: "Brand Profile", href: "/brand", icon: Shield },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    // Fixed viewport height: prevents whole-page scrolling
    <div className="h-screen w-screen overflow-hidden flex bg-kewa-bg">
      {/* 1. Fixed Left Sidebar */}
      <aside className="w-56 h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 z-30 select-none">
        <div>
          {/* Logo Header */}
          <div className="h-16 flex items-center px-5 gap-2.5 border-b border-slate-100">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
              <Image
                src="/brand/kewakibt-icon.png"
                alt="KewaFlow"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              KewaFlow
            </span>
          </div>

          {/* Navigation Links with Dynamic Active State */}
          <nav className="p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium text-xs transition-colors ${isActive
                    ? "bg-kewa-teal text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"
                        }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 text-[10px] font-semibold rounded-full border ${isActive
                        ? "bg-teal-700/60 text-cyan-200 border-teal-600"
                        : "bg-cyan-50 text-kewa-cyan-dark border-cyan-100"
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer - Kewakibt Branding */}
        <div className="p-3 border-t border-slate-100 m-2">
          <div className="flex items-center gap-2.5">
            <div className="relative w-7 h-7 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
              <Image
                src="/brand/kewakibt-icon.png"
                alt="Kewakibt"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Area: Fixed Header + Scrollable Body */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        {/* Fixed Top Header (Never scrolls away) */}
        <header className="h-16 sticky top-0 z-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-2xs">
          {/* Greeting */}
          <div className="flex items-center gap-2.5">

          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Facebook Connection Card */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs">
                f
              </div>
              <div className="text-left">
                <p className="text-[9px] text-slate-400 uppercase font-semibold tracking-wider leading-none">
                  Facebook Page
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-bold text-slate-800 leading-none">
                    {MOCK_CONNECTED_PAGE.name}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected
                  </span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200">
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
                <p className="text-[10px] text-slate-500">
                  {MOCK_ADMIN_USER.role}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* 3. Scrollable Page Body (Only content area scrolls) */}
        <main className="flex-1 overflow-y-auto p-5 scroll-smooth">{children}</main>
      </div >
    </div >
  );
}
