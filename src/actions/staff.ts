"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getStaffAttendanceHistory = async (userId: string, limit: number = 30) => {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        // Admins can see others' history, but strictly only within their own facility.
        const reqUser = session.user as any;
        if (reqUser.id !== userId && reqUser.role !== "ADMIN") return [];

        if (reqUser.role === "ADMIN" && reqUser.id !== userId) {
            const targetUser = await db.user.findUnique({ where: { id: userId, facilityId: reqUser.facilityId } });
            if (!targetUser) return []; // Target is from another facility
        }

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
