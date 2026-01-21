"use client";

import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { Menu } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar - Sticky position managed here */}
        <div className="hidden xl:block sticky top-20 h-[calc(100vh-5rem)]">
          <AppSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 xl:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-background animate-in slide-in-from-left duration-200 border-r border-border">
              <AppSidebar onLinkClick={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 bg-background min-h-[calc(100vh-5rem)] flex flex-col">
          {/* Mobile Header for Sidebar Trigger */}
          <div className="xl:hidden p-4 border-b border-border flex items-center gap-3 bg-background/50 backdrop-blur sticky top-0 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 hover:bg-surface rounded-lg transition-colors"
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-lg">Dashboard</span>
          </div>

          <div className="p-4 md:p-8 flex-1">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
