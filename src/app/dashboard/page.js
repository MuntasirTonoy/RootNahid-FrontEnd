"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Video,
  LayoutDashboard,
  TrendingUp,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import LoadingAnimation from "@/components/LoadingAnimation";
import SiteConfigEditor from "@/components/dashboard/SiteConfigEditor";

const DashboardOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalVideos: 0,
    purchasedCourseStudent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const chartData = [
    { name: "Total Students", value: stats.totalUsers, color: "#4F46E5" },
    {
      name: "Paid Students",
      value: stats.purchasedCourseStudent,
      color: "#F59E0B",
    },
    { name: "Courses", value: stats.totalCourses, color: "#10B981" },
    { name: "Videos", value: stats.totalVideos, color: "#EC4899" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-3 sm:p-6 lg:p-8 space-y-4 lg:space-y-8 max-w-[1600px] mx-auto overflow-hidden">
        {/* Page Header */}
        <div className="flex items-center gap-2 sm:gap-4 px-1 sm:px-0">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <LayoutDashboard size={20} className="sm:hidden" />
            <LayoutDashboard size={24} className="hidden sm:block" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">
              Overview
            </h1>
            <p className="text-[10px] sm:text-sm text-muted-foreground">
              Platform performance overview
            </p>
          </div>
        </div>

        {/* Stats Cards and Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-3 sm:gap-4 lg:gap-6 w-full">
          {/* Stats Cards Column - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-4 min-w-0 w-full">
            {/* Total Students Card */}
            <Link href="/dashboard/students" className="min-w-0">
              <div className="bg-card rounded-xl border border-border p-3 lg:p-5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer group h-full">
                <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-3 text-center lg:text-left">
                  <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform shrink-0 shadow-inner">
                    <Users size={18} className="lg:hidden" />
                    <Users size={22} className="hidden lg:block" />
                  </div>
                  <div className="min-w-0 w-full">
                    <div className="text-[9px] sm:text-xs font-bold text-muted-foreground/80 truncate uppercase tracking-widest">
                      Students
                    </div>
                    <div className="text-base sm:text-2xl font-black text-foreground leading-none mt-1 truncate">
                      {stats.totalUsers}
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Paid Card */}
            <div className="bg-card rounded-xl border border-border p-3 lg:p-5 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all group h-full min-w-0">
              <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-3 text-center lg:text-left">
                <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shrink-0 shadow-inner">
                  <TrendingUp size={18} className="lg:hidden" />
                  <TrendingUp size={22} className="hidden lg:block" />
                </div>
                <div className="min-w-0 w-full">
                  <div className="text-[9px] sm:text-xs font-bold text-muted-foreground/80 truncate uppercase tracking-widest">
                    Paid
                  </div>
                  <div className="text-base sm:text-xl font-black text-foreground leading-none mt-1 truncate">
                    {stats.purchasedCourseStudent}
                  </div>
                </div>
              </div>
            </div>

            {/* Courses Card */}
            <Link href="/dashboard/manage-courses" className="min-w-0">
              <div className="bg-card rounded-xl border border-border p-3 lg:p-5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer group h-full">
                <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-3 text-center lg:text-left">
                  <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shrink-0 shadow-inner">
                    <BookOpen size={18} className="lg:hidden" />
                    <BookOpen size={22} className="hidden lg:block" />
                  </div>
                  <div className="min-w-0 w-full">
                    <div className="text-[9px] sm:text-xs font-bold text-muted-foreground/80 truncate uppercase tracking-widest">
                      Courses
                    </div>
                    <div className="text-base sm:text-2xl font-black text-foreground leading-none mt-1 truncate">
                      {stats.totalCourses}
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Videos Card */}
            <Link href="/dashboard/manage-videos" className="min-w-0">
              <div className="bg-card rounded-xl border border-border p-3 lg:p-5 hover:border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/5 transition-all cursor-pointer group h-full">
                <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-3 text-center lg:text-left">
                  <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform shrink-0 shadow-inner">
                    <Video size={18} className="lg:hidden" />
                    <Video size={22} className="hidden lg:block" />
                  </div>
                  <div className="min-w-0 w-full">
                    <div className="text-[9px] sm:text-xs font-bold text-muted-foreground/80 truncate uppercase tracking-widest">
                      Videos
                    </div>
                    <div className="text-base sm:text-xl font-black text-foreground leading-none mt-1 truncate">
                      {stats.totalVideos}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Chart Section - Takes 6 columns on large screens */}
          <div className="lg:col-span-6 min-w-0 w-full">
            <div className="bg-card rounded-xl border border-border p-4 sm:p-5 lg:p-6 h-full flex flex-col">
              <h2 className="text-sm sm:text-lg lg:text-xl font-bold mb-4 lg:mb-6 flex items-center gap-2">
                <TrendingUp className="text-primary" size={20} />
                Platform Analytics
              </h2>
              <div className="flex-1 min-h-[250px] sm:min-h-[300px] w-full relative">
                <div className="absolute inset-0 overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#374151"
                        opacity={0.1}
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9CA3AF", fontSize: 11 }}
                        dy={8}
                        interval={0}
                        angle={0}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9CA3AF", fontSize: 11 }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F9FAFB",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Site Content Editor */}
        <div className="pt-2">
          <SiteConfigEditor />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
