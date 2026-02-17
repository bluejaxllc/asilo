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

const FamilyLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <SessionProvider>
            <div className="min-h-screen bg-orange-50/30">
                {/* Top Navigation Bar - Warm & Friendly */}
                <nav className="bg-white shadow-sm p-4 sticky top-0 z-50 border-b border-orange-100">
                    <div className="max-w-5xl mx-auto flex justify-between items-center">
                        <Link href="/family">
                            <div className="flex items-center gap-2">
                                <div className="bg-orange-100 p-2 rounded-full">
                                    <Heart className="h-6 w-6 text-orange-600" fill="currentColor" />
                                </div>
                                <h1 className="text-2xl font-bold text-slate-800">
                                    <span className="text-orange-600">.blue_jax</span> Familia
                                </h1>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground mr-2 hidden md:inline-block">
                                Portal de Familiares
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-600 hover:text-orange-700 hover:bg-orange-50"
                                onClick={() => signOut({ callbackUrl: "/" })}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Salir
                            </Button>
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
