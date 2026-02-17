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
        VITALS: "bg-blue-100 text-blue-700",
        FOOD: "bg-green-100 text-green-700",
        MEDS: "bg-purple-100 text-purple-700",
        ACTIVITY: "bg-amber-100 text-amber-700",
        NOTE: "bg-slate-100 text-slate-700",
    };

    const priorityColors: Record<string, string> = {
        HIGH: "bg-red-100 text-red-700",
        MEDIUM: "bg-orange-100 text-orange-700",
        LOW: "bg-green-100 text-green-700",
    };

    return (
        <FadeIn className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
                <div>
                    <p className="text-sm text-muted-foreground capitalize">{formatDate()}</p>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Admin</span>
                    </h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Sistema Operativo
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <ScaleIn delay={0}>
                    <Link href="/admin/patients">
                        <Card className="group cursor-pointer border-0 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-1">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-100 font-medium">Residentes</p>
                                        <p className="text-3xl font-bold mt-1">{totalResidents}</p>
                                        <p className="text-xs text-blue-200 mt-1">Registrados en sistema</p>
                                    </div>
                                    <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                                        <Users className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </ScaleIn>

                <ScaleIn delay={0.1}>
                    <Link href="/admin/staff">
                        <Card className="group cursor-pointer border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-1">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-emerald-100 font-medium">Personal Activo</p>
                                        <p className="text-3xl font-bold mt-1">{activeStaff}<span className="text-lg font-normal text-emerald-200">/{totalStaff}</span></p>
                                        <p className="text-xs text-emerald-200 mt-1">En turno actual</p>
                                    </div>
                                    <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                                        <UserCheck className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </ScaleIn>

                <ScaleIn delay={0.2}>
                    <Link href="/admin/tasks">
                        <Card className="group cursor-pointer border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:-translate-y-1">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-amber-100 font-medium">Tareas Pendientes</p>
                                        <p className="text-3xl font-bold mt-1">{pendingTasks}</p>
                                        <p className="text-xs text-amber-200 mt-1">Por completar</p>
                                    </div>
                                    <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                                        <AlertCircle className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </ScaleIn>

                <ScaleIn delay={0.3}>
                    <Link href="/admin/inventory">
                        <Card className={`group cursor-pointer border-0 text-white shadow-lg transition-all hover:-translate-y-1 ${lowStockItems > 0 ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/20 hover:shadow-red-500/40' : 'bg-gradient-to-br from-slate-500 to-slate-700 shadow-slate-500/20 hover:shadow-slate-500/40'}`}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm font-medium ${lowStockItems > 0 ? 'text-red-100' : 'text-slate-200'}`}>Alertas Inventario</p>
                                        <p className="text-3xl font-bold mt-1">{lowStockItems}</p>
                                        <p className={`text-xs mt-1 ${lowStockItems > 0 ? 'text-red-200' : 'text-slate-300'}`}>{lowStockItems > 0 ? 'Medicamentos bajos' : 'Todo en orden'}</p>
                                    </div>
                                    <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                                        <Package className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </ScaleIn>
            </div>

            {/* Quick Stats Row */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <SlideIn direction="left" delay={0.4}>
                    <Card className="bg-white border-dashed">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                <Heart className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{familyAccounts}</p>
                                <p className="text-xs text-muted-foreground">Cuentas Familiares</p>
                            </div>
                        </CardContent>
                    </Card>
                </SlideIn>
                <SlideIn direction="left" delay={0.5}>
                    <Card className="bg-white border-dashed">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Activity className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{recentLogs.length}</p>
                                <p className="text-xs text-muted-foreground">Registros Recientes</p>
                            </div>
                        </CardContent>
                    </Card>
                </SlideIn>
                <SlideIn direction="left" delay={0.6}>
                    <Card className="bg-white border-dashed">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">{totalStaff}</p>
                                <p className="text-xs text-muted-foreground">Total Personal</p>
                            </div>
                        </CardContent>
                    </Card>
                </SlideIn>
                <SlideIn direction="left" delay={0.7}>
                    <Card className="bg-white border-dashed">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-800">24/7</p>
                                <p className="text-xs text-muted-foreground">Monitoreo Activo</p>
                            </div>
                        </CardContent>
                    </Card>
                </SlideIn>
            </div>

            {/* Activity & Tasks */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Actividad Reciente</CardTitle>
                                <CardDescription>Últimos registros del equipo</CardDescription>
                            </div>
                            <Link href="/admin/logs" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline">
                                Ver todo <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentLogs.length === 0 ? (
                                <div className="text-center py-8">
                                    <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                                    <p className="text-sm text-muted-foreground">Sin actividad reciente registrada.</p>
                                </div>
                            ) : (
                                recentLogs.map((log) => (
                                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {log.author?.name?.charAt(0) || "?"}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${logTypeColors[log.type] || logTypeColors.NOTE}`}>
                                                    {log.type}
                                                </Badge>
                                                <span className="text-xs font-medium text-slate-700 truncate">{log.patient?.name || "General"}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{log.notes || "Sin notas"}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{log.author?.name}</p>
                                        </div>
                                        <span className="text-[10px] text-slate-400 flex-shrink-0 mt-1 tabular-nums">
                                            {log.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Tareas Pendientes</CardTitle>
                                <CardDescription>{pendingTasks} sin completar</CardDescription>
                            </div>
                            <Link href="/admin/tasks" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline">
                                Ver todo <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {upcomingTasks.length === 0 ? (
                                <div className="text-center py-8">
                                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                                    <p className="text-sm text-muted-foreground">No hay tareas pendientes.</p>
                                    <p className="text-xs text-green-600 font-medium mt-1">¡Todo al día! 🎉</p>
                                </div>
                            ) : (
                                upcomingTasks.map((task) => (
                                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                        <div className="flex-shrink-0">
                                            <div className={`h-2 w-2 rounded-full ${task.priority === "HIGH" ? "bg-red-500" : task.priority === "MEDIUM" ? "bg-orange-400" : "bg-green-400"}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-none truncate">{task.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {task.patient && (
                                                    <span className="text-[10px] text-slate-500">{task.patient.name}</span>
                                                )}
                                                {task.priority && (
                                                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${priorityColors[task.priority] || ''}`}>
                                                        {task.priority}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 flex-shrink-0 tabular-nums">
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
