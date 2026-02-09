"use server";

import { db } from "@/lib/db";

export const getStaffAttendanceHistory = async (userId: string, limit: number = 30) => {
    try {
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
