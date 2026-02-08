"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Get latest attendance for today
export const getLatestTodayAttendance = async (userId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await db.attendance.findFirst({
        where: {
            userId,
            createdAt: {
                gte: today,
            },
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return attendance;
};

// Check In
export const checkIn = async (email: string) => {
    console.log("ServerAction: checkIn called for", email);
    const user = await db.user.findUnique({
        where: { email }
    });

    if (!user) {
        return { error: "Usuario no encontrado" };
    }

    const latestAttendance = await getLatestTodayAttendance(user.id);

    // If there is an attendance record and it has NO checkOut, user is already clocked in
    if (latestAttendance && !latestAttendance.checkOut) {
        return { error: "Ya has registrado tu entrada. Debes marcar salida antes de iniciar otro turno." };
    }

    // Otherwise (no attendance today OR latest attendance has checkOut), create a new one
    await db.attendance.create({
        data: {
            userId: user.id,
            checkIn: new Date(),
        }
    });

    revalidatePath("/staff");
    return { success: "Entrada registrada correctamente" };
};

// Check Out
export const checkOut = async (email: string) => {
    const user = await db.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.log("CheckOut: User not found", email);
        return { error: "Usuario no encontrado" };
    }

    const latestAttendance = await getLatestTodayAttendance(user.id);
    console.log("CheckOut: Latest attendance", latestAttendance);

    if (!latestAttendance) {
        return { error: "No has registrado ninguna entrada hoy" };
    }

    if (latestAttendance.checkOut) {
        return { error: "Ya has registrado tu salida para este turno" };
    }

    await db.attendance.update({
        where: {
            id: latestAttendance.id
        },
        data: {
            checkOut: new Date()
        }
    });

    revalidatePath("/staff");
    return { success: "Salida registrada correctamente" };
};

export const getAttendanceStatus = async (email: string) => {
    const user = await db.user.findUnique({
        where: { email }
    });

    if (!user) return null;

    const latestAttendance = await getLatestTodayAttendance(user.id);

    if (latestAttendance) {
        if (!latestAttendance.checkOut) {
            return { isClockedIn: true, startTime: latestAttendance.checkIn, hasCompletedShift: false };
        } else {
            // User checked out of their last shift, so they are currently NOT clocked in, 
            // but they CAN start a new one (so hasCompletedShift is effectively false for blocking purposes, 
            // or we clarify semantics. Let's say hasCompletedShift=true means "blocked from new shifts"? 
            // NO, we want to ALLOW new shifts. So hasCompletedShift should be false if we want to enable the button?
            // Actually, the UI uses hasCompletedShift to show "Turno Finalizado". 
            // If we want to allow re-entry, we should return hasCompletedShift: false (or a new field isEligibleToStart: true).
            // Let's stick to the UI logic: 
            // If we return hasCompletedShift: false, the UI will show "Iniciar Turno".
            return { isClockedIn: false, startTime: null, hasCompletedShift: false };
        }
    }

    return { isClockedIn: false, startTime: null, hasCompletedShift: false };
};
