"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Video,
  Activity,
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
    <div className="p-8 space-y-8 bg-background">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        <div className="w-12 h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
          <LayoutDashboard size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your platform performance.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link href="/dashboard/students">
          <div className="bg-card rounded-3xl border border-border p-6 hover:border-primary/50 transition-all cursor-pointer group h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Students
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalUsers}
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Paid Students Card */}
        <div className="bg-card rounded-3xl border border-border p-6 hover:border-amber-500/50 transition-all group h-full">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Paid Students
              </div>
              <div className="text-2xl font-bold text-foreground">
                {stats.purchasedCourseStudent}
              </div>
            </div>
          </div>
        </div>

        <Link href="/dashboard/manage-courses">
          <div className="bg-card rounded-3xl border border-border p-6 hover:border-emerald-500/50 transition-all cursor-pointer group h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Courses
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalCourses}
                </div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/manage-videos">
          <div className="bg-card rounded-3xl border border-border p-6 hover:border-pink-500/50 transition-all cursor-pointer group h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                <Video size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Videos
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalVideos}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Chart Section */}
      <div className="bg-card rounded-3xl border border-border p-4 md:p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="text-primary" size={20} />
          Platform Analytics
        </h2>
        <div className="h-[250px] sm:h-[300px] md:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
              barCategoryGap="15%"
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
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                dy={10}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  color: "#F9FAFB",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
