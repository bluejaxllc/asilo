import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Users, ClipboardList, AlertTriangle, UserCheck, Package, AlertCircle } from "lucide-react";
import { FadeIn, ScaleIn, HoverScale } from "@/components/ui/motion-wrapper";

export const dynamic = 'force-dynamic';


export default async function AdminDashboardPage() {
    // 1. Fetch Integration Data
    const totalResidents = await db.patient.count();

    // Active staff: Check-ins today without check-outs
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

    const lowStockItems = await db.medication.count({
        where: {
            stock: { lte: 10 } // Assumed threshold, or use minStock field if valid
        }
    });

    const recentLogs = await db.dailyLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { author: true, patient: true }
    });

    const stats = [
        { title: "Total Residentes", value: totalResidents.toString(), sub: "Registrados en sistema", icon: Users, color: "text-blue-600" },
        { title: "Personal Activo", value: activeStaff.toString(), sub: "En turno actual", icon: UserCheck, color: "text-green-600" },
        { title: "Tareas Pendientes", value: pendingTasks.toString(), sub: "Por completar hoy", icon: AlertCircle, color: "text-orange-600" },
        { title: "Alertas de Inventario", value: lowStockItems.toString(), sub: "Medicamentos bajos", icon: Package, color: "text-red-600" }
    ];

    return (
        <FadeIn className="p-8 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Panel de Control</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <ScaleIn key={i} delay={i * 0.1}>
                        <HoverScale>
                            <Card className="cursor-pointer hover:border-slate-400 transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stat.sub}
                                    </p>
                                </CardContent>
                            </Card>
                        </HoverScale>
                    </ScaleIn>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentLogs.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Sin actividad reciente registrada.</p>
                            ) : (
                                recentLogs.map((log) => (
                                    <div key={log.id} className="flex items-center border-b pb-2 last:border-0">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {log.type} - {log.patient?.name || "General"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {log.author.name} · {log.notes}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-slate-500">
                                            {log.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Próximas Tareas</CardTitle>
                        <CardDescription>
                            Turno de la Mañana
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <span className="w-16 text-sm text-slate-500">09:00 AM</span>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Ronda de Medicamentos</p>
                                    <p className="text-sm text-muted-foreground">Ala Norte</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className="w-16 text-sm text-slate-500">10:00 AM</span>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Fisioterapia - Grupo A</p>
                                    <p className="text-sm text-muted-foreground">Sala Común</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </FadeIn>
    );
}
