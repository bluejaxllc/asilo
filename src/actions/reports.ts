"use server";

import { db } from "@/lib/db";

export async function getReportStats(daysBack: number = 7) {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - daysBack);

    const [totalLogs, completedTasks, totalPatients, medsAdministered, totalStaff] = await Promise.all([
        db.dailyLog.count({
            where: { createdAt: { gte: dateFrom } },
        }),
        db.task.count({
            where: { status: "COMPLETED", updatedAt: { gte: dateFrom } },
        }),
        db.patient.count(),
        db.dailyLog.count({
            where: { type: "MEDS", createdAt: { gte: dateFrom } },
        }),
        db.user.count({
            where: { role: { in: ["ADMIN", "STAFF"] } },
        }),
    ]);

    return { totalLogs, completedTasks, totalPatients, medsAdministered, totalStaff };
}

export async function getActivityTrends(daysBack: number = 30) {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - daysBack);

    const logs = await db.dailyLog.findMany({
        where: { createdAt: { gte: dateFrom } },
        select: { type: true, createdAt: true },
        orderBy: { createdAt: "asc" },
    });

    // Group by date and type
    const dayMap: Record<string, Record<string, number>> = {};

    for (const log of logs) {
        const day = log.createdAt.toISOString().split("T")[0];
        if (!dayMap[day]) dayMap[day] = {};
        dayMap[day][log.type] = (dayMap[day][log.type] || 0) + 1;
    }

    // Fill in empty days
    const result = [];
    const current = new Date(dateFrom);
    const today = new Date();
    while (current <= today) {
        const day = current.toISOString().split("T")[0];
        result.push({
            date: day,
            label: current.toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
            VITALS: dayMap[day]?.VITALS || 0,
            FOOD: dayMap[day]?.FOOD || 0,
            MEDS: dayMap[day]?.MEDS || 0,
            NOTE: dayMap[day]?.NOTE || 0,
            INCIDENT: dayMap[day]?.INCIDENT || 0,
            total: Object.values(dayMap[day] || {}).reduce((a, b) => a + b, 0),
        });
        current.setDate(current.getDate() + 1);
    }

    return result;
}

export async function getStaffPerformance() {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);

    const staff = await db.user.findMany({
        where: { role: { in: ["ADMIN", "STAFF"] } },
        include: {
            logs: { where: { createdAt: { gte: dateFrom } }, select: { id: true } },
            assignedTasks: { where: { status: "COMPLETED", updatedAt: { gte: dateFrom } }, select: { id: true } },
        },
        orderBy: { name: "asc" },
    });

    return staff.map((s) => ({
        id: s.id,
        name: s.name || "Sin nombre",
        role: s.role,
        logsCount: s.logs.length,
        tasksCompleted: s.assignedTasks.length,
    }));
}

export async function getOccupancyData() {
    const patients = await db.patient.findMany({
        select: { room: true, name: true, status: true },
        orderBy: { room: "asc" },
    });

    // Group by room
    const roomMap: Record<string, { patients: string[]; status: string }> = {};
    for (const p of patients) {
        const room = p.room || "Sin habitación";
        if (!roomMap[room]) roomMap[room] = { patients: [], status: p.status };
        roomMap[room].patients.push(p.name);
        if (p.status !== "Estable") roomMap[room].status = p.status;
    }

    return Object.entries(roomMap).map(([room, data]) => ({
        room,
        patients: data.patients,
        count: data.patients.length,
        status: data.status,
    }));
}
