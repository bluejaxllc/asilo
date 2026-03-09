import { db } from "@/lib/db";
import { auth } from "@/auth";
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
    const session = await auth();
    const facilityId = (session?.user as any)?.facilityId as string | undefined;

    // All queries scoped to the current user's facility
    const facilityFilter = facilityId ? { facilityId } : { facilityId: "__none__" };

    const totalResidents = await db.patient.count({
        where: facilityFilter
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeStaff = await db.attendance.count({
        where: {
            checkIn: { gte: today },
            checkOut: null,
            user: facilityFilter,
        }
    });

    const pendingTasks = await db.task.count({
        where: { status: { not: "COMPLETED" }, ...facilityFilter }
    });

    // Count medications where current stock is at or below the minimum threshold
    const allMedications = await db.medication.findMany({
        where: facilityFilter,
        select: { stock: true, minStock: true }
    });
    const lowStockItems = allMedications.filter(m => m.stock <= m.minStock).length;

    const totalStaff = await db.user.count({
        where: { role: { in: ["STAFF", "DOCTOR", "NURSE", "KITCHEN"] }, ...facilityFilter }
    });

    const familyAccounts = await db.user.count({
        where: { role: "FAMILY", ...facilityFilter }
    });

    const recentLogs = await db.dailyLog.findMany({
        where: { author: facilityFilter },
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { author: true, patient: true }
    });

    const upcomingTasks = await db.task.findMany({
        where: {
            status: { not: "COMPLETED" },
            ...facilityFilter,
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
