"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    UserPlus,
    CalendarCheck,
    Pill,
    ClipboardList,
    Settings,
    ShieldCheck,
    Bell,
    BarChart3,
    Bot,
    MessageCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

const routes = [
    {
        label: "Inicio",
        icon: LayoutDashboard,
        href: "/admin",
        color: "text-blue-400",
    },
    {
        label: "Residentes",
        icon: UserPlus,
        href: "/admin/patients",
        color: "text-violet-400",
    },
    {
        label: "Personal",
        icon: Users,
        href: "/admin/staff",
        color: "text-pink-400",
    },
    {
        label: "Tareas",
        icon: CalendarCheck,
        href: "/admin/tasks",
        color: "text-amber-400",
    },
    {
        label: "Inventario Medico",
        icon: Pill,
        href: "/admin/inventory",
        color: "text-emerald-400",
    },
    {
        label: "Bitácora",
        icon: ClipboardList,
        href: "/admin/logs",
        color: "text-green-400",
    },
    {
        label: "Notificaciones",
        icon: Bell,
        href: "/admin/notifications",
        color: "text-yellow-400",
    },
    {
        label: "Reportes",
        icon: BarChart3,
        href: "/admin/reports",
        color: "text-cyan-400",
    },
    {
        label: "Mensajes",
        icon: MessageCircle,
        href: "/admin/messages",
        color: "text-indigo-400",
    },
    {
        label: "Agentes",
        icon: Bot,
        href: "/admin/agents",
        color: "text-fuchsia-400",
    },
    {
        label: "Configuración",
        icon: Settings,
        href: "/admin/settings",
        color: "text-muted-foreground",
    },
];

export const Sidebar = () => {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-sidebar border-r border-border">
            {/* Logo */}
            <div className="px-5 py-6 mb-2">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:shadow-blue-500/40 transition-shadow">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>.blue_jax</span>
                        <p className="text-[10px] text-muted-foreground font-mono -mt-0.5">ADMIN PANEL</p>
                    </div>
                </Link>
            </div>

            {/* Nav items */}
            <div className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                {routes.map((route) => {
                    const isActive = route.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(route.href);

                    return (
                        <Link
                            href={route.href}
                            key={route.href}
                            className={cn(
                                "text-sm group flex items-center gap-3 px-3 py-2.5 w-full font-medium cursor-pointer rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-blue-500/10 text-foreground border-l-2 border-blue-500 ml-0"
                                    : "text-muted-foreground hover:text-foreground hover:bg-card/5 border-l-2 border-transparent"
                            )}
                        >
                            <route.icon className={cn(
                                "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                                isActive ? route.color : "text-muted-foreground group-hover:text-muted-foreground"
                            )} />
                            {route.label}
                            {isActive && (
                                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500/100 animate-pulse" />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/100 animate-pulse" />
                    SISTEMA OPERATIVO v1.0
                </div>
            </div>
        </div>
    );
};
