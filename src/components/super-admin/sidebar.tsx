"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Globe,
    Building2,
    Settings,
    ShieldAlert,
    CreditCard
} from "lucide-react";

import { cn } from "@/lib/utils";

const routes = [
    {
        label: "Platform Overview",
        icon: LayoutDashboard,
        href: "/super-admin",
        color: "text-blue-600 dark:text-blue-400",
    },
    {
        label: "Facilities",
        icon: Building2,
        href: "/super-admin/facilities",
        color: "text-emerald-600 dark:text-emerald-400",
    },
    {
        label: "Subscriptions",
        icon: CreditCard,
        href: "/super-admin/subscriptions",
        color: "text-violet-400",
    },
    {
        label: "Global Settings",
        icon: Settings,
        href: "/super-admin/settings",
        color: "text-muted-foreground",
    },
];

export const SuperSidebar = () => {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-border text-slate-300">
            {/* Logo */}
            <div className="px-5 py-6 mb-2">
                <Link href="/super-admin" className="flex items-center gap-3 group">
                    <div className="h-9 w-9 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20 group-hover:shadow-purple-500/40 transition-shadow">
                        <ShieldAlert className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-white" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>Asilo HQ</span>
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-mono -mt-0.5 uppercase tracking-wider">God Mode</p>
                    </div>
                </Link>
            </div>

            {/* Nav items */}
            <div className="flex-1 px-3 space-y-0.5 overflow-y-auto mt-4">
                {routes.map((route) => {
                    const isActive = route.href === "/super-admin"
                        ? pathname === "/super-admin"
                        : pathname.startsWith(route.href);

                    return (
                        <Link
                            href={route.href}
                            key={route.href}
                            className={cn(
                                "text-sm group flex items-center gap-3 px-3 py-2.5 w-full font-medium cursor-pointer rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-purple-500/10 text-white border-l-2 border-purple-500 ml-0"
                                    : "text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                            )}
                        >
                            <route.icon className={cn(
                                "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                                isActive ? route.color : "text-slate-500 group-hover:text-slate-300"
                            )} />
                            {route.label}
                        </Link>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border/10">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse outline outline-2 outline-purple-500/30" />
                    SUPER ADMIN CONSOLE
                </div>
            </div>
        </div>
    );
};
