"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Activity,
    ClipboardCheck,
    Users,
    Pill,
    Loader2,
    TrendingUp,
    BedDouble,
    UserCheck,
    BarChart3,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    AreaChart,
    Area,
} from "recharts";
import { FadeIn, SlideIn, SlideInRow } from "@/components/ui/motion-wrapper";
import { getReportStats, getActivityTrends, getStaffPerformance, getOccupancyData } from "@/actions/reports";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
    const [stats, setStats] = useState<any>(null);
    const [trends, setTrends] = useState<any[]>([]);
    const [staffPerf, setStaffPerf] = useState<any[]>([]);
    const [occupancy, setOccupancy] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("7");

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const days = parseInt(period);
            const [s, t, sp, occ] = await Promise.all([
                getReportStats(days),
                getActivityTrends(days),
                getStaffPerformance(),
                getOccupancyData(),
            ]);
            setStats(s);
            setTrends(t);
            setStaffPerf(sp);
            setOccupancy(occ);
            setLoading(false);
        };
        load();
    }, [period]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="text-sm text-muted-foreground">Generando reportes...</span>
            </div>
        );
    }

    return (
        <FadeIn className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reportes y Analítica</h2>
                    <p className="text-muted-foreground mt-1">
                        Resumen de actividad, rendimiento y ocupación.
                    </p>
                </div>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Últimos 7 días</SelectItem>
                        <SelectItem value="14">Últimos 14 días</SelectItem>
                        <SelectItem value="30">Últimos 30 días</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-100 font-medium">Registros</p>
                                <p className="text-2xl font-bold mt-0.5">{stats?.totalLogs || 0}</p>
                            </div>
                            <div className="h-9 w-9 bg-white/10 rounded-lg flex items-center justify-center">
                                <Activity className="h-4 w-4 text-blue-100" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-green-100 font-medium">Tareas Completadas</p>
                                <p className="text-2xl font-bold mt-0.5">{stats?.completedTasks || 0}</p>
                            </div>
                            <div className="h-9 w-9 bg-white/10 rounded-lg flex items-center justify-center">
                                <ClipboardCheck className="h-4 w-4 text-green-100" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg shadow-violet-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-violet-100 font-medium">Residentes</p>
                                <p className="text-2xl font-bold mt-0.5">{stats?.totalPatients || 0}</p>
                            </div>
                            <div className="h-9 w-9 bg-white/10 rounded-lg flex items-center justify-center">
                                <Users className="h-4 w-4 text-violet-100" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-amber-100 font-medium">Meds Administrados</p>
                                <p className="text-2xl font-bold mt-0.5">{stats?.medsAdministered || 0}</p>
                            </div>
                            <div className="h-9 w-9 bg-white/10 rounded-lg flex items-center justify-center">
                                <Pill className="h-4 w-4 text-amber-100" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg shadow-slate-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-300 font-medium">Personal</p>
                                <p className="text-2xl font-bold mt-0.5">{stats?.totalStaff || 0}</p>
                            </div>
                            <div className="h-9 w-9 bg-white/10 rounded-lg flex items-center justify-center">
                                <UserCheck className="h-4 w-4 text-slate-300" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Trends Chart */}
            <SlideIn delay={0.1}>
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Tendencias de Actividad
                        </CardTitle>
                        <CardDescription>Registros diarios por tipo en los últimos {period} días</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorVitals" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorMeds" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-slate-500" />
                                    <YAxis tick={{ fontSize: 11 }} className="text-slate-500" />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid #e2e8f0",
                                            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                                            fontSize: "12px",
                                        }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                                    <Area type="monotone" dataKey="VITALS" name="Vitales" stroke="#3b82f6" fill="url(#colorVitals)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="FOOD" name="Alimentos" stroke="#f97316" fill="url(#colorFood)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="MEDS" name="Medicamentos" stroke="#22c55e" fill="url(#colorMeds)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="NOTE" name="Notas" stroke="#a855f7" fill="none" strokeWidth={1.5} strokeDasharray="5 5" />
                                    <Area type="monotone" dataKey="INCIDENT" name="Incidentes" stroke="#ef4444" fill="none" strokeWidth={1.5} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </SlideIn>

            {/* Bottom Row: Staff Performance + Occupancy */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Staff Performance */}
                <SlideIn delay={0.2}>
                    <Card className="shadow-sm h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BarChart3 className="h-5 w-5 text-indigo-500" />
                                Rendimiento del Personal
                            </CardTitle>
                            <CardDescription>Últimos 30 días</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/80">
                                            <TableHead className="font-semibold text-slate-600">Nombre</TableHead>
                                            <TableHead className="font-semibold text-slate-600 text-center">Rol</TableHead>
                                            <TableHead className="font-semibold text-slate-600 text-center">Registros</TableHead>
                                            <TableHead className="font-semibold text-slate-600 text-center">Tareas</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {staffPerf.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                                                    Sin datos de personal
                                                </TableCell>
                                            </TableRow>
                                        ) : staffPerf.map((s, i) => (
                                            <SlideInRow key={s.id} delay={Math.min(i * 0.04, 0.5)} className="hover:bg-slate-50/80 transition-colors">
                                                <TableCell className="font-medium text-sm">{s.name}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className={cn(
                                                        "text-[10px] font-semibold px-2",
                                                        s.role === "ADMIN" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"
                                                    )}>
                                                        {s.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-semibold text-blue-600">{s.logsCount}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-semibold text-green-600">{s.tasksCompleted}</span>
                                                </TableCell>
                                            </SlideInRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </SlideIn>

                {/* Room Occupancy */}
                <SlideIn delay={0.3}>
                    <Card className="shadow-sm h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BedDouble className="h-5 w-5 text-violet-500" />
                                Ocupación por Habitación
                            </CardTitle>
                            <CardDescription>{occupancy.length} habitaciones asignadas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {occupancy.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Sin datos de ocupación
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {occupancy.map((room, i) => (
                                        <div
                                            key={room.room}
                                            className={cn(
                                                "p-3 rounded-xl border-2 transition-all hover:shadow-md",
                                                room.status === "Estable"
                                                    ? "border-green-200 bg-green-50/50"
                                                    : "border-red-200 bg-red-50/50"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hab.</span>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-[10px] px-1.5 py-0 border-0",
                                                        room.status === "Estable" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                    )}
                                                >
                                                    {room.status}
                                                </Badge>
                                            </div>
                                            <p className="text-lg font-bold text-slate-800">{room.room}</p>
                                            <div className="mt-1.5 space-y-0.5">
                                                {room.patients.map((name: string) => (
                                                    <p key={name} className="text-xs text-slate-600 truncate">{name}</p>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </SlideIn>
            </div>
        </FadeIn>
    );
}
