"use client";

import { Navbar } from "@/components/admin/navbar";
import { SuperSidebar } from "@/components/super-admin/sidebar";
import { SessionProvider } from "next-auth/react";
import { AttendanceProvider } from "@/context/attendance-context";

const SuperAdminClientLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <SessionProvider>
            <AttendanceProvider>
                <div className="h-full relative bg-zinc-950 min-h-screen selection:bg-purple-500/30">
                    <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                        <SuperSidebar />
                    </div>
                    <main className="md:pl-72 min-h-screen bg-black/40">
                        {/* We reuse the admin navbar for now as it handles user menu & theme toggle */}
                        <Navbar />
                        <div className="p-8">
                            {children}
                        </div>
                    </main>
                </div>
            </AttendanceProvider>
        </SessionProvider>
    );
}

export default SuperAdminClientLayout;
