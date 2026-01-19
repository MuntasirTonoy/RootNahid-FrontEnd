"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Video, Users, LayoutDashboard, X } from 'lucide-react';

const AppSidebar = ({ className = "", onLinkClick }) => {
    const pathname = usePathname();

    const links = [
        { name: 'Overview', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Manage Courses', href: '/dashboard/manage-courses', icon: <BookOpen size={20} /> },
        { name: 'Manage Videos', href: '/dashboard/manage-videos', icon: <Video size={20} /> },
        { name: 'Students', href: '/dashboard/students', icon: <Users size={20} /> },
    ];

    return (
        <aside className={`w-64 bg-background border-r border-border h-full flex flex-col ${className}`}>
            <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                <div className="lg:hidden flex items-center justify-between mb-4 px-2">
                    <span className="font-bold text-lg">Dashboard</span>
                    {onLinkClick && (
                        <button onClick={onLinkClick} className="p-2 hover:bg-surface rounded-full">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {links.map((link, index) => {
                    const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                    return (
                        <div key={index}>
                            <Link 
                                href={link.href} 
                                onClick={onLinkClick}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                                    isActive 
                                    ? "bg-primary/10 text-primary hover:bg-primary/20 border-l-4 border-primary" 
                                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                                }`}
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default AppSidebar;
