import { db } from "@/lib/db";
import { AdminDashboardClient } from "./admin-dashboard-client";

export const dynamic = 'force-dynamic';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos Días";
    if (hour < 18) return "Buenas Tardes";
    return "Buenas Noches";
};

const formatDate = () => {
    return new Date().toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export default async function AdminDashboardPage() {
    const totalResidents = await db.patient.count();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeStaff = await db.attendance.count({
        where: {
            checkIn: { gte: today },
            checkOut: null
        }
    });

    const pendingTasks = await db.task.count({
        where: { status: { not: "COMPLETED" } }
    });

    const lowStockItems = 0; // inventoryItem model not yet in schema

    const totalStaff = await db.user.count({
        where: { role: { in: ["STAFF", "DOCTOR", "NURSE", "KITCHEN"] } }
    });

    const familyAccounts = await db.user.count({
        where: { role: "FAMILY" }
    });

    const recentLogs = await db.dailyLog.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { author: true, patient: true }
    });

    const upcomingTasks = await db.task.findMany({
        where: {
            status: { not: "COMPLETED" }
        },
        orderBy: {
            dueDate: 'asc'
        },
        take: 5,
        include: {
            patient: true
        }
    });

    // Serialize for client component (dates -> strings)
    const data = {
        totalResidents,
        activeStaff,
        totalStaff,
        pendingTasks,
        lowStockItems,
        familyAccounts,
        greeting: getGreeting(),
        dateStr: formatDate(),
        recentLogs: recentLogs.map(log => ({
            id: log.id,
            type: log.type,
            notes: log.notes,
            createdAt: log.createdAt.toISOString(),
            author: log.author ? { name: log.author.name } : null,
            patient: log.patient ? { name: log.patient.name } : null,
        })),
        upcomingTasks: upcomingTasks.map(task => ({
            id: task.id,
            title: task.title,
            priority: task.priority,
            dueDate: task.dueDate ? task.dueDate.toISOString() : null,
            patient: task.patient ? { name: task.patient.name } : null,
        })),
    };

    return <AdminDashboardClient data={data} />;
}
