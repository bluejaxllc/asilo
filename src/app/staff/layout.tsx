"use client"

import { Button } from "@/components/ui/button";
import {
    ClipboardList,
    Users,
    LogOut,
    Utensils,
    ShieldCheck,
    Stethoscope,
    Heart,
    Activity,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AttendanceProvider } from "@/context/attendance-context";
import { HoverScale } from "@/components/ui/motion-wrapper";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";

// Role-specific configuration
const ROLE_CONFIG: Record<string, { label: string; icon: any; gradient: string }> = {
    DOCTOR: { label: "Médico", icon: Stethoscope, gradient: "from-emerald-500 to-green-600" },
    NURSE: { label: "Enfermería", icon: Heart, gradient: "from-pink-500 to-rose-600" },
    KITCHEN: { label: "Cocina", icon: Utensils, gradient: "from-yellow-500 to-orange-600" },
    STAFF: { label: "Personal", icon: ClipboardList, gradient: "from-blue-500 to-indigo-600" },
};

const ALL_NAV_ITEMS = [
    { href: "/staff", label: "Mis Tareas", icon: ClipboardList, color: "blue", roles: ["STAFF", "NURSE", "DOCTOR", "KITCHEN"] },
    { href: "/staff/patients", label: "Residentes", icon: Users, color: "blue", roles: ["STAFF", "NURSE", "DOCTOR"] },
    { href: "/staff/kitchen", label: "Cocina", icon: Utensils, color: "orange", roles: ["KITCHEN", "STAFF", "NURSE"] },
];

function StaffNavbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const role = (session?.user as any)?.role || "STAFF";
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.STAFF;
    const RoleIcon = config.icon;

    // Filter nav items to only show those relevant to the user's role
    const navItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(role));

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
                        <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow`}>
                            <RoleIcon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-foreground hidden sm:block">
                            .blue_jax <span className="text-blue-400 font-normal text-sm">{config.label}</span>
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-1">
                        {navItems.map((item) => {
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
                            <div className="hidden lg:flex items-center gap-2">
                                <span className="text-sm text-muted-foreground font-mono">
                                    {session.user.name}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${role === "DOCTOR" ? "bg-emerald-500/15 text-emerald-400" :
                                        role === "NURSE" ? "bg-pink-500/15 text-pink-400" :
                                            role === "KITCHEN" ? "bg-orange-500/15 text-orange-400" :
                                                "bg-blue-500/15 text-blue-400"
                                    }`}>
                                    {config.label}
                                </span>
                            </div>
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
