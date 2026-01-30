"use client";

import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { Menu } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

import { AnimatePresence, motion } from "framer-motion";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="flex min-h-screen bg-background relative overflow-x-hidden">
        {/* Desktop Sidebar - Sticky position managed here */}
        <div className="hidden xl:block sticky top-20 h-[calc(100vh-5rem)] shrink-0">
          <AppSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 xl:hidden"
            >
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-64 bg-background border-r border-border h-full"
              >
                <AppSidebar onLinkClick={() => setSidebarOpen(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 bg-background min-h-screen flex flex-col min-w-0">
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

          <div className="flex-1 min-w-0 overflow-x-hidden">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
