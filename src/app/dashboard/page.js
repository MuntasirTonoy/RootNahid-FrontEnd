"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Link from 'next/link';
import { Users, BookOpen, Video, Activity, LayoutDashboard } from 'lucide-react';
import { auth } from '@/lib/firebase';

const DashboardOverview = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0,
        totalVideos: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = await auth.currentUser.getIdToken();
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
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

    if (loading) {
        return <div className="p-8 text-center">Loading stats...</div>;
    }

    return (
        <div className="p-8 space-y-8 bg-background">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
             <LayoutDashboard    size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Overview</h1>
            <p className="text-sm text-muted-foreground">   Overview of your dashboard.</p>
          </div>
        </div>
      
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/dashboard/students">
                    <div className="bg-card rounded-3xl shadow-sm border border-border p-6 hover:border-primary/50 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Total Users</div>
                                <div className="text-2xl font-bold text-foreground">{stats.totalUsers}</div>
                                <div className="text-xs text-muted-foreground mt-1">Registered students</div>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link href="/dashboard/manage-courses">
                    <div className="bg-card rounded-3xl shadow-sm border border-border p-6 hover:border-primary/50 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Total Courses</div>
                                <div className="text-2xl font-bold text-foreground">{stats.totalCourses}</div>
                                <div className="text-xs text-muted-foreground mt-1">Active courses</div>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link href="/dashboard/manage-videos">
                    <div className="bg-card rounded-3xl shadow-sm border border-border p-6 hover:border-primary/50 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                <Video size={24} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Total Videos</div>
                                <div className="text-2xl font-bold text-foreground">{stats.totalVideos}</div>
                                <div className="text-xs text-muted-foreground mt-1">Uploaded content</div>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default DashboardOverview;
