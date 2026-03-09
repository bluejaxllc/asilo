"use client";

import { cn } from "@/lib/utils";
import { Sparkles, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PremiumCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    tier?: "pro" | "enterprise";
    /** Optional accent color class, e.g. "blue", "emerald", "violet" */
    accent?: string;
    /** If true, the feature is unlocked (user has the tier) */
    unlocked?: boolean;
    /** Optional children to render when unlocked */
    children?: React.ReactNode;
    /** Additional className */
    className?: string;
}

const accentMap: Record<string, { border: string; iconBg: string; iconText: string; glow: string; badge: string; gradient: string }> = {
    blue: {
        border: "border-blue-500/30 hover:border-blue-500/50",
        iconBg: "bg-blue-500/10",
        iconText: "text-blue-600 dark:text-blue-500",
        glow: "shadow-blue-500/5",
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        gradient: "from-blue-500/5 via-transparent to-transparent",
    },
    emerald: {
        border: "border-emerald-500/30 hover:border-emerald-500/50",
        iconBg: "bg-emerald-500/10",
        iconText: "text-emerald-600 dark:text-emerald-500",
        glow: "shadow-emerald-500/5",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        gradient: "from-emerald-500/5 via-transparent to-transparent",
    },
    violet: {
        border: "border-violet-500/30 hover:border-violet-500/50",
        iconBg: "bg-violet-500/10",
        iconText: "text-violet-500",
        glow: "shadow-violet-500/5",
        badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
        gradient: "from-violet-500/5 via-transparent to-transparent",
    },
    amber: {
        border: "border-amber-500/30 hover:border-amber-500/50",
        iconBg: "bg-amber-500/10",
        iconText: "text-amber-600 dark:text-amber-500",
        glow: "shadow-amber-500/5",
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        gradient: "from-amber-500/5 via-transparent to-transparent",
    },
    rose: {
        border: "border-rose-500/30 hover:border-rose-500/50",
        iconBg: "bg-rose-500/10",
        iconText: "text-rose-600 dark:text-rose-500",
        glow: "shadow-rose-500/5",
        badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        gradient: "from-rose-500/5 via-transparent to-transparent",
    },
    cyan: {
        border: "border-cyan-500/30 hover:border-cyan-500/50",
        iconBg: "bg-cyan-500/10",
        iconText: "text-cyan-600 dark:text-cyan-500",
        glow: "shadow-cyan-500/5",
        badge: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
        gradient: "from-cyan-500/5 via-transparent to-transparent",
    },
    indigo: {
        border: "border-indigo-500/30 hover:border-indigo-500/50",
        iconBg: "bg-indigo-500/10",
        iconText: "text-indigo-500",
        glow: "shadow-indigo-500/5",
        badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
        gradient: "from-indigo-500/5 via-transparent to-transparent",
    },
};

const defaultAccent = accentMap.blue;

export function PremiumCard({
    title,
    description,
    icon: Icon,
    tier = "pro",
    accent = "blue",
    unlocked = false,
    children,
    className,
}: PremiumCardProps) {
    const colors = accentMap[accent] || defaultAccent;
    const tierLabel = tier === "enterprise" ? "ENTERPRISE" : "PRO";

    if (unlocked && children) {
        return <>{children}</>;
    }

    return (
        <div
            className={cn(
                "group relative rounded-xl border bg-card p-5 transition-all duration-300",
                colors.border,
                `shadow-lg ${colors.glow}`,
                "hover:-translate-y-0.5 hover:shadow-xl",
                className
            )}
        >
            {/* Subtle gradient background */}
            <div className={cn("absolute inset-0 rounded-xl bg-gradient-to-br opacity-50", colors.gradient)} />

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center border border-border", colors.iconBg)}>
                        <Icon className={cn("h-5 w-5", colors.iconText)} />
                    </div>
                    <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", colors.badge)}>
                        <Sparkles className="h-3 w-3" />
                        {tierLabel}
                    </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{description}</p>

                {/* Lock Overlay & CTA */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/upgrade"
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200",
                            "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
                            "hover:from-blue-500 hover:to-indigo-500 hover:shadow-md hover:shadow-blue-500/25",
                            "active:scale-[0.98]"
                        )}
                    >
                        <Lock className="h-3.5 w-3.5" />
                        Activar con BlueJax
                        <ArrowRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

/** Horizontal section wrapper that shows a "BlueJax Pro" header above a grid of PremiumCards */
interface PremiumSectionProps {
    children: React.ReactNode;
    className?: string;
    /** Optional section title rendered below the BlueJax Pro badge */
    title?: string;
    /** Optional subtitle description */
    subtitle?: string;
}

export function PremiumSection({ children, className, title, subtitle }: PremiumSectionProps) {
    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 via-indigo-500/20 to-transparent" />
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    <Sparkles className="h-3 w-3" />
                    BlueJax Pro
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-indigo-500/30 via-blue-500/20 to-transparent" />
            </div>
            {(title || subtitle) && (
                <div className="text-center space-y-1">
                    {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
                    {subtitle && <p className="text-sm text-muted-foreground max-w-xl mx-auto">{subtitle}</p>}
                </div>
            )}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {children}
            </div>
        </div>
    );
}
