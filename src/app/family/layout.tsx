"use client"

import { Button } from "@/components/ui/button";
import {
    Heart,
    LogOut,
    Activity,
    CalendarDays
} from "lucide-react";
import Link from "next/link";
import { SessionProvider, signOut } from "next-auth/react";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { ThemeToggle } from "@/components/theme-toggle";

const FamilyLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <SessionProvider>
            <div className="min-h-screen bg-background">
                {/* Top Navigation Bar — Warm Dark */}
                <nav className="bg-card/80 backdrop-blur-xl border-b border-border p-4 sticky top-0 z-50">
                    <div className="max-w-5xl mx-auto flex justify-between items-center">
                        <Link href="/family">
                            <div className="flex items-center gap-2">
                                <div className="bg-orange-500/15 p-2 rounded-full border border-orange-500/20">
                                    <Heart className="h-6 w-6 text-orange-400" fill="currentColor" />
                                </div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    <span className="text-orange-400">.blue_jax</span> <span className="text-muted-foreground font-normal text-sm">Familia</span>
                                </h1>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground mr-2 hidden md:inline-block font-mono">
                                Portal de Familiares
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                                onClick={() => signOut({ callbackUrl: "/" })}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Salir
                            </Button>
                            <ThemeToggle />
                        </div>
                    </div>
                </nav>

                <main className="max-w-5xl mx-auto p-4 md:p-8">
                    <FadeIn>
                        {children}
                    </FadeIn>
                </main>
            </div>
        </SessionProvider>
    );
}

export default FamilyLayout;
