"use client";

import React from "react";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-transparent text-zinc-100 antialiased overflow-x-hidden">
      {/* Persistent Left Command Tower */}
      <Sidebar />

      {/* Main Dynamic Viewport Window */}
      <div className="flex flex-col flex-1 min-w-0 relative">
        <div className="relative z-10 flex flex-col flex-1 min-h-0">
          <TopBar />
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
