import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, AlertCircle, Package, Activity, Clock, Heart, ArrowRight, TrendingUp } from "lucide-react";
import { FadeIn, ScaleIn, SlideIn } from "@/components/ui/motion-wrapper";

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

    const lowStockItems = await db.medication.count({
        where: {
            stock: { lte: 10 }
        }
    });

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

    const logTypeColors: Record<string, string> = {
        VITALS: "bg-blue-500/15 text-blue-400 border-blue-500/20",
        FOOD: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
        MEDS: "bg-violet-500/15 text-violet-400 border-violet-500/20",
        ACTIVITY: "bg-amber-500/15 text-amber-400 border-amber-500/20",
        NOTE: "bg-zinc-500/15 text-muted-foreground border-zinc-500/20",
    };

    const priorityColors: Record<string, string> = {
        HIGH: "bg-red-500/15 text-red-400 border-red-500/20",
        MEDIUM: "bg-amber-500/15 text-amber-400 border-amber-500/20",
        LOW: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    };

    const statCards = [
        {
            label: "Residentes",
            value: totalResidents,
            sub: "Registrados en sistema",
            href: "/admin/patients",
            icon: Users,
            accentBorder: "border-l-blue-500",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-400",
        },
        {
            label: "Personal Activo",
            value: `${activeStaff}/${totalStaff}`,
            sub: "En turno actual",
            href: "/admin/staff",
            icon: UserCheck,
            accentBorder: "border-l-emerald-500",
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-400",
        },
        {
            label: "Tareas Pendientes",
            value: pendingTasks,
            sub: "Por completar",
            href: "/admin/tasks",
            icon: AlertCircle,
            accentBorder: "border-l-amber-500",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-400",
        },
        {
            label: "Alertas Inventario",
            value: lowStockItems,
            sub: lowStockItems > 0 ? "Medicamentos bajos" : "Todo en orden",
            href: "/admin/inventory",
            icon: Package,
            accentBorder: lowStockItems > 0 ? "border-l-red-500" : "border-l-zinc-700",
            iconBg: lowStockItems > 0 ? "bg-red-500/10" : "bg-zinc-500/10",
            iconColor: lowStockItems > 0 ? "text-red-400" : "text-muted-foreground",
        },
    ];

    return (
        <FadeIn className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
                <div>
                    <p className="text-sm text-muted-foreground capitalize font-mono">{formatDate()}</p>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Admin</span>
                    </h2>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <div className="flex h-2 w-2 rounded-full bg-emerald-500/100 animate-pulse" />
                    Sistema Operativo
                </div>
            </div>

            {/* Stat Cards — dark glass with accent left border */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                    <ScaleIn key={stat.label} delay={i * 0.08}>
                        <Link href={stat.href}>
                            <Card className={`group cursor-pointer bg-card border border-border/60 border-l-2 ${stat.accentBorder} hover:border-border hover:bg-accent transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-black/20`}>
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                                            <p className="text-2xl font-bold text-foreground mt-1 font-mono">{stat.value}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">{stat.sub}</p>
                                        </div>
                                        <div className={`h-11 w-11 ${stat.iconBg} rounded-xl flex items-center justify-center border border-border group-hover:scale-110 transition-transform`}>
                                            <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </ScaleIn>
                ))}
            </div>

            {/* Quick Stats Row */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {[
                    { icon: Heart, label: "Cuentas Familiares", value: familyAccounts, color: "text-orange-400", bg: "bg-orange-500/10" },
                    { icon: Activity, label: "Registros Recientes", value: recentLogs.length, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { icon: TrendingUp, label: "Total Personal", value: totalStaff, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { icon: Clock, label: "Monitoreo Activo", value: "24/7", color: "text-violet-400", bg: "bg-violet-500/10" },
                ].map((stat, i) => (
                    <SlideIn key={stat.label} direction="left" delay={0.3 + i * 0.08}>
                        <Card className="bg-card border border-border/60 border-dashed hover:border-border transition-colors">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center border border-border`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-foreground font-mono">{stat.value}</p>
                                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </SlideIn>
                ))}
            </div>

            {/* Activity & Tasks */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-card border border-border/60">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base text-foreground">Actividad Reciente</CardTitle>
                                <CardDescription className="text-muted-foreground text-xs">Últimos registros del equipo</CardDescription>
                            </div>
                            <Link href="/admin/logs" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                                Ver todo <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {recentLogs.length === 0 ? (
                                <div className="text-center py-8">
                                    <Activity className="h-8 w-8 text-secondary-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Sin actividad reciente registrada.</p>
                                </div>
                            ) : (
                                recentLogs.map((log) => (
                                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div className="h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold text-muted-foreground">
                                                {log.author?.name?.charAt(0) || "?"}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 border ${logTypeColors[log.type] || logTypeColors.NOTE}`}>
                                                    {log.type}
                                                </Badge>
                                                <span className="text-xs font-medium text-secondary-foreground truncate">{log.patient?.name || "General"}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{log.notes || "Sin notas"}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">{log.author?.name}</p>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground flex-shrink-0 mt-1 tabular-nums font-mono">
                                            {log.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-card border border-border/60">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base text-foreground">Tareas Pendientes</CardTitle>
                                <CardDescription className="text-muted-foreground text-xs">{pendingTasks} sin completar</CardDescription>
                            </div>
                            <Link href="/admin/tasks" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                                Ver todo <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {upcomingTasks.length === 0 ? (
                                <div className="text-center py-8">
                                    <AlertCircle className="h-8 w-8 text-secondary-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">No hay tareas pendientes.</p>
                                    <p className="text-xs text-emerald-500 font-medium mt-1">¡Todo al día! 🎉</p>
                                </div>
                            ) : (
                                upcomingTasks.map((task) => (
                                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors border border-transparent hover:border-border">
                                        <div className="flex-shrink-0">
                                            <div className={`h-2 w-2 rounded-full ${task.priority === "HIGH" ? "bg-red-500/100" : task.priority === "MEDIUM" ? "bg-amber-400" : "bg-emerald-400"}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-none truncate text-foreground">{task.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {task.patient && (
                                                    <span className="text-[10px] text-muted-foreground">{task.patient.name}</span>
                                                )}
                                                {task.priority && (
                                                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 border ${priorityColors[task.priority] || ''}`}>
                                                        {task.priority}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground flex-shrink-0 tabular-nums font-mono">
                                            {task.dueDate ? task.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </FadeIn>
    );
}
