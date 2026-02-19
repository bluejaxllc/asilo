"use client";

import { Navbar } from "@/components/admin/navbar";
import { Sidebar } from "@/components/admin/sidebar";
import { SessionProvider } from "next-auth/react";

import { AttendanceProvider } from "@/context/attendance-context";

const AdminLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <SessionProvider>
            <AttendanceProvider>
                <div className="h-full relative bg-background">
                    <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                        <Sidebar />
                    </div>
                    <main className="md:pl-72 min-h-screen">
                        <Navbar />
                        <div className="p-0">
                            {children}
                        </div>
                    </main>
                </div>
            </AttendanceProvider>
        </SessionProvider>
    );
}

export default AdminLayout;
