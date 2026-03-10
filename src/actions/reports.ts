"use server";

import { db } from "@/lib/db";
import { reactor } from "@/agents/core/reactor";
import "@/agents/core/registry";
import { getCurrentFacilityId } from "@/lib/facility";

export async function runRiskAudit() {
    return await reactor.run('patient-risk-audit');
}

export async function runInventoryAudit() {
    return await reactor.run('low-stock-monitor');
}

export async function runEfficiencyAudit() {
    return await reactor.run('efficiency-audit');
}

export async function runReputationAudit() {
    return await reactor.run('reputation-audit');
}

export async function runMarketingAudit() {
    return await reactor.run('marketing-audit');
}

export async function runTrendAudit() {
    return await reactor.run('trend-analysis');
}

export async function getIAInsights() {
    const facilityId = await getCurrentFacilityId();
    const fFilter = facilityId ? { facilityId } : { facilityId: "__none__" };

    const insights = await db.notification.findMany({
        where: {
            ...fFilter,
            OR: [
                { title: { contains: 'IA' } },
                { title: { contains: '🚨' } },
                { title: { contains: '⚠️' } },
                { title: { contains: '📊' } },
                { title: { contains: '📦' } }
            ],
            type: { in: ['CRITICAL', 'WARNING', 'INFO'] }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    return insights;
}

export async function getReportStats(daysBack: number = 7) {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - daysBack);
    const facilityId = await getCurrentFacilityId();
    const fFilter = facilityId ? { facilityId } : {};

    const [totalLogs, completedTasks, totalPatients, medsAdministered, totalStaff] = await Promise.all([
        db.dailyLog.count({
            where: { createdAt: { gte: dateFrom }, patient: fFilter },
        }),
        db.task.count({
            where: { status: "COMPLETED", updatedAt: { gte: dateFrom }, ...fFilter },
        }),
        db.patient.count({ where: fFilter }),
        db.dailyLog.count({
            where: { type: "MEDS", createdAt: { gte: dateFrom }, patient: fFilter },
        }),
        db.user.count({
            where: { role: { in: ["ADMIN", "STAFF"] }, ...fFilter },
        }),
    ]);

    return { totalLogs, completedTasks, totalPatients, medsAdministered, totalStaff };
}

export async function getActivityTrends(daysBack: number = 30) {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - daysBack);
    const facilityId = await getCurrentFacilityId();
    const fFilter = facilityId ? { facilityId } : {};

    const logs = await db.dailyLog.findMany({
        where: { createdAt: { gte: dateFrom }, patient: fFilter },
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
    const facilityId = await getCurrentFacilityId();

    const staff = await db.user.findMany({
        where: { role: { in: ["ADMIN", "STAFF"] }, ...(facilityId ? { facilityId } : {}) },
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
    const facilityId = await getCurrentFacilityId();
    const patients = await db.patient.findMany({
        where: facilityId ? { facilityId } : {},
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
