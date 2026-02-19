"use client"

import { Button } from "@/components/ui/button";
import {
    ClipboardList,
    Users,
    LogOut,
    Utensils,
    ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AttendanceProvider } from "@/context/attendance-context";
import { HoverScale } from "@/components/ui/motion-wrapper";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
    { href: "/staff", label: "Mis Tareas", icon: ClipboardList, color: "blue" },
    { href: "/staff/patients", label: "Residentes", icon: Users, color: "blue" },
    { href: "/staff/kitchen", label: "Cocina", icon: Utensils, color: "orange" },
];

function StaffNavbar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isActive = (href: string) => {
        if (href === "/staff") return pathname === "/staff";
        return pathname.startsWith(href);
    };

    return (
        <nav className="bg-sidebar/90 backdrop-blur-xl shadow-xl sticky top-0 z-50 border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/staff" className="flex items-center gap-2 group">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-foreground hidden sm:block">
                            .blue_jax <span className="text-blue-400 font-normal text-sm">Personal</span>
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-1">
                        {NAV_ITEMS.map((item) => {
                            const active = isActive(item.href);
                            const Icon = item.icon;
                            const colorClasses = item.color === "orange"
                                ? active
                                    ? "text-orange-400 bg-orange-500/10 border-orange-400/50"
                                    : "text-muted-foreground hover:text-orange-400 hover:bg-orange-500/5 border-transparent"
                                : active
                                    ? "text-blue-400 bg-blue-500/10 border-blue-400/50"
                                    : "text-muted-foreground hover:text-blue-400 hover:bg-blue-500/5 border-transparent";

                            return (
                                <Link key={item.href} href={item.href}>
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-b-2 transition-all duration-200 ${colorClasses}`}>
                                        <Icon className="h-5 w-5" />
                                        <span className="text-sm font-medium hidden md:block">{item.label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* User + Logout */}
                    <div className="flex items-center gap-3">
                        {session?.user?.name && (
                            <span className="text-sm text-muted-foreground hidden lg:block font-mono">
                                {session.user.name}
                            </span>
                        )}
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            onClick={() => signOut({ callbackUrl: "/" })}
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

const StaffLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <SessionProvider>
            <AttendanceProvider>
                <div className="min-h-screen bg-background">
                    <StaffNavbar />
                    <main className="max-w-7xl mx-auto p-4 sm:p-6">
                        {children}
                    </main>
                </div>
            </AttendanceProvider>
        </SessionProvider>
    );
}

export default StaffLayout;
