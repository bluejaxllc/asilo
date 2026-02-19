"use client";

import { SessionProvider } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

/* ─── Background gradients per role ─── */
const backgroundOrbs: Record<string, { orb1: string; orb2: string; orb3: string }> = {
    admin: {
        orb1: "bg-blue-600/20",
        orb2: "bg-indigo-600/20",
        orb3: "bg-purple-600/15",
    },
    staff: {
        orb1: "bg-teal-600/20",
        orb2: "bg-cyan-600/20",
        orb3: "bg-emerald-600/15",
    },
    family: {
        orb1: "bg-orange-500/20",
        orb2: "bg-amber-500/20",
        orb3: "bg-yellow-500/15",
    },
    doctor: {
        orb1: "bg-emerald-600/20",
        orb2: "bg-green-600/20",
        orb3: "bg-teal-500/15",
    },
    nurse: {
        orb1: "bg-pink-600/20",
        orb2: "bg-rose-600/20",
        orb3: "bg-fuchsia-500/15",
    },
    kitchen: {
        orb1: "bg-yellow-500/20",
        orb2: "bg-orange-500/20",
        orb3: "bg-amber-500/15",
    },
};

const defaultOrbs = {
    orb1: "bg-blue-600/20",
    orb2: "bg-indigo-600/20",
    orb3: "bg-purple-600/15",
};

function AuthLayoutInner({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const role = searchParams.get("role")?.toLowerCase() || "";
    const orbs = backgroundOrbs[role] || defaultOrbs;

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
            {/* Animated gradient orbs — color changes per role */}
            <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full ${orbs.orb1} blur-[120px] animate-pulse`} style={{ animationDuration: "8s" }} />
            <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full ${orbs.orb2} blur-[120px] animate-pulse`} style={{ animationDuration: "10s" }} />
            <div className={`absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full ${orbs.orb3} blur-[100px] animate-pulse`} style={{ animationDuration: "12s" }} />

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

            <div className="relative z-10 w-full px-4">
                {children}
            </div>
        </div>
    );
}

const AuthLayout = ({
    children
}: {
    children: React.ReactNode
}) => {
    return (
        <SessionProvider>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-900">
                    <div className="text-white/50 animate-pulse">Cargando...</div>
                </div>
            }>
                <AuthLayoutInner>{children}</AuthLayoutInner>
            </Suspense>
        </SessionProvider>
    );
}

export default AuthLayout;
