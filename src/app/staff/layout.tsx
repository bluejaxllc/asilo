"use client"

import { Button } from "@/components/ui/button";
import {
    ClipboardList,
    Users,
    LogOut,
    Utensils
} from "lucide-react";
import Link from "next/link";
import { AttendanceProvider } from "@/context/attendance-context";
import { motion } from "framer-motion";
import { HoverScale } from "@/components/ui/motion-wrapper";
import { SessionProvider, signOut } from "next-auth/react";

const StaffLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <SessionProvider>
            <AttendanceProvider>
                <div className="min-h-screen bg-slate-50">
                    {/* Top Navigation Bar - Touch Friendly */}
                    <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
                        <div className="max-w-7xl mx-auto flex justify-between items-center">
                            <Link href="/staff">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity">
                                    .blue_jax Personal
                                </h1>
                            </Link>

                            <div className="flex gap-4">
                                <Link href="/staff">
                                    <div className="flex items-center gap-2 h-12 px-4 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                                        <ClipboardList className="h-6 w-6" />
                                        <span className="text-lg font-medium">Mis Tareas</span>
                                    </div>
                                </Link>
                                <Link href="/staff/patients">
                                    <div className="flex items-center gap-2 h-12 px-4 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                                        <Users className="h-6 w-6" />
                                        <span className="text-lg font-medium">Residentes</span>
                                    </div>
                                </Link>
                                <Link href="/staff/kitchen">
                                    <div className="flex items-center gap-2 h-12 px-4 rounded-md text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer">
                                        <Utensils className="h-6 w-6" />
                                        <span className="text-lg font-medium">Cocina</span>
                                    </div>
                                </Link>
                            </div>

                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-12 w-12 rounded-full shadow-md hover:shadow-lg"
                                onClick={() => signOut({ callbackUrl: "/" })}
                            >
                                <LogOut className="h-6 w-6" />
                            </Button>
                        </div>
                    </nav>

                    <main className="max-w-7xl mx-auto p-6">
                        {children}
                    </main>
                </div>
            </AttendanceProvider>
        </SessionProvider>
    );
}

export default StaffLayout;
