"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getStaffAttendanceHistory = async (userId: string, limit: number = 30) => {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        // Currently allowing a user to see their own history, or an ADMIN to see anyone's history
        // Real-world might need facilityId matching here too for admins
        const reqUser = session.user as any;
        if (reqUser.id !== userId && reqUser.role !== "ADMIN") return [];

        const history = await db.attendance.findMany({
            where: {
                userId
            },
            orderBy: {
                checkIn: 'desc'
            },
            take: limit
        });

        return history;
    } catch (error) {
        console.error('Error fetching attendance history:', error);
        return [];
    }
};
