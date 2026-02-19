"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    PlayCircle,
    CheckCircle,
    Clock,
    LogIn,
    Loader2,
    AlertCircle,
    TrendingUp,
    ListTodo,
    Timer,
} from "lucide-react";
import { useAttendance } from "@/context/attendance-context";
import { toast } from "sonner";
import { FadeIn, SlideIn, ScaleIn } from "@/components/ui/motion-wrapper";
import { useSession } from "next-auth/react";
import { getMyTasks, startTask, completeTask } from "@/actions/tasks";

type TaskStatus = "PENDIENTE" | "EN PROGRESO" | "COMPLETADO";

interface UITask {
    id: string;
    title: string;
    patient: string;
    priority: "ALTA" | "MEDIA" | "BAJA";
    status: TaskStatus;
    time: string;
    originalStatus: string;
}

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos Días";
    if (hour < 18) return "Buenas Tardes";
    return "Buenas Noches";
};

const priorityConfig: Record<string, { border: string; bg: string; text: string; badge: string }> = {
    ALTA: { border: "border-l-red-500", bg: "bg-red-500/10", text: "text-red-400", badge: "bg-red-500/15 text-red-400 border-red-500/20" },
    MEDIA: { border: "border-l-amber-500", bg: "bg-amber-500/10", text: "text-amber-400", badge: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
    BAJA: { border: "border-l-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-400", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
};

export default function StaffPage() {
    const { isClockedIn, hasCompletedShift, clockIn, clockOut, duration } = useAttendance();
    const { data: session } = useSession();
    const [tasks, setTasks] = useState<UITask[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTasks = async () => {
        if (session?.user?.email) {
            setLoading(true);
            const userTasks = await getMyTasks(session.user.email);

            const mappedTasks: UITask[] = userTasks.map((t: any) => {
                let priorityLabel: "ALTA" | "MEDIA" | "BAJA" = "MEDIA";
                if (t.priority === "URGENT" || t.priority === "HIGH") priorityLabel = "ALTA";
                if (t.priority === "LOW") priorityLabel = "BAJA";

                return {
                    id: t.id,
                    title: t.title,
                    patient: t.patient?.name || t.description || "General",
                    priority: priorityLabel,
                    status: t.status === "IN_PROGRESS" ? "EN PROGRESO" :
                        t.status === "COMPLETED" ? "COMPLETADO" : "PENDIENTE",
                    time: t.dueDate ? new Date(t.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Todo el día",
                    originalStatus: t.status
                };
            });

            setTasks(mappedTasks);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.email) {
            fetchTasks();
        }
    }, [session?.user?.email]);

    const handleStartTask = async (taskId: string) => {
        if (!session?.user?.email) {
            toast.error("Error de sesión: No se puede identificar al usuario");
            return;
        }

        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: "EN PROGRESO" } : t
        ));

        try {
            const result = await startTask(taskId, session.user.email);
            if ((result as any).error) {
                toast.error((result as any).error as string);
                fetchTasks();
            } else {
                toast.success((result as any).success as string);
            }
        } catch (e) {
            toast.error("Error de red al iniciar tarea");
        }
    };

    const handleCompleteTask = async (taskId: string) => {
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: "COMPLETADO" } : t
        ));

        try {
            const result = await completeTask(taskId);

            if ((result as any).error) {
                toast.error("Error al completar tarea");
                fetchTasks();
            } else {
                toast.success((result as any).success as string);
            }
        } catch (e) {
            toast.error("Error de red al completar tarea");
            fetchTasks();
        }
    };

    const [clockOutLoading, setClockOutLoading] = useState(false);

    const handleClockOut = async () => {
        setClockOutLoading(true);
        await clockOut();
        setClockOutLoading(false);
    };

    const pendingCount = tasks.filter(t => t.status === "PENDIENTE").length;
    const inProgressCount = tasks.filter(t => t.status === "EN PROGRESO").length;
    const completedCount = tasks.filter(t => t.status === "COMPLETADO").length;
    const activeTasks = tasks.filter(t => t.status !== "COMPLETADO");

    return (
        <FadeIn className="space-y-6">
            {/* Hero Banner */}
            <div className={`relative overflow-hidden rounded-2xl shadow-xl transition-all duration-700 ${isClockedIn ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800' : 'bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900'}`}>
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-card rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-card rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="relative p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <p className={`text-sm uppercase tracking-widest font-semibold mb-1 ${isClockedIn ? 'text-blue-200' : 'text-muted-foreground'}`}>
                            {isClockedIn ? "Turno en Curso" : "Fuera de Turno"}
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">
                            {getGreeting()}, <span className={isClockedIn ? 'text-blue-200' : 'text-muted-foreground'}>{session?.user?.name || "Usuario"}</span>
                        </h2>
                        <p className={`mt-2 text-base ${isClockedIn ? 'text-blue-100' : 'text-muted-foreground'}`}>
                            {isClockedIn
                                ? `Tienes ${activeTasks.length} tarea${activeTasks.length !== 1 ? 's' : ''} pendiente${activeTasks.length !== 1 ? 's' : ''} hoy.`
                                : "Marca tu entrada para ver tus tareas asignadas."}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                        <div className={`text-5xl font-mono font-bold tracking-wider ${isClockedIn ? 'text-white' : 'text-muted-foreground'}`}>
                            {isClockedIn ? duration : "--:--:--"}
                        </div>

                        {isClockedIn ? (
                            <Button
                                onClick={handleClockOut}
                                disabled={clockOutLoading}
                                size="lg"
                                className="w-full md:w-auto bg-card/15 backdrop-blur-sm hover:bg-card/25 text-white border border-border font-bold text-base h-12 rounded-xl shadow-lg"
                            >
                                {clockOutLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Clock className="mr-2 h-5 w-5" />}
                                {clockOutLoading ? "Procesando..." : "Marcar Salida"}
                            </Button>
                        ) : hasCompletedShift ? (
                            <Button
                                disabled
                                size="lg"
                                className="w-full md:w-auto bg-zinc-700/50 text-muted-foreground border-0 font-bold text-base h-12 rounded-xl"
                            >
                                <CheckCircle className="mr-2 h-5 w-5" /> Turno Finalizado
                            </Button>
                        ) : (
                            <Button
                                onClick={() => clockIn()}
                                size="lg"
                                className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg shadow-emerald-500/30 font-bold text-base h-12 rounded-xl animate-pulse"
                            >
                                <LogIn className="mr-2 h-5 w-5" /> Iniciar Turno
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            {isClockedIn && (
                <div className="grid gap-4 grid-cols-3">
                    <ScaleIn delay={0}>
                        <Card className="border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:-translate-y-1">
                            <CardContent className="p-4 md:p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-amber-100 font-medium">Pendientes</p>
                                        <p className="text-3xl font-bold mt-1">{pendingCount}</p>
                                    </div>
                                    <div className="h-11 w-11 bg-card/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <ListTodo className="h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </ScaleIn>

                    <ScaleIn delay={0.1}>
                        <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-1">
                            <CardContent className="p-4 md:p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-100 font-medium">En Progreso</p>
                                        <p className="text-3xl font-bold mt-1">{inProgressCount}</p>
                                    </div>
                                    <div className="h-11 w-11 bg-card/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <Timer className="h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </ScaleIn>

                    <ScaleIn delay={0.2}>
                        <Card className="border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-1">
                            <CardContent className="p-4 md:p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-emerald-100 font-medium">Completadas</p>
                                        <p className="text-3xl font-bold mt-1">{completedCount}</p>
                                    </div>
                                    <div className="h-11 w-11 bg-card/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <CheckCircle className="h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </ScaleIn>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-3 text-blue-500 font-medium">Cargando tareas...</span>
                </div>
            )}

            {/* Task Cards */}
            {!loading && (
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ${!isClockedIn ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                    {activeTasks.map((task, index) => {
                        const isInProgress = task.status === "EN PROGRESO";
                        const config = priorityConfig[task.priority];

                        return (
                            <SlideIn key={task.id} delay={index * 0.08}>
                                <Card className={`h-full flex flex-col border-l-4 ${config.border} shadow-md hover:shadow-lg transition-all duration-300 ${isInProgress ? 'ring-2 ring-blue-500/20 bg-blue-500/30' : 'bg-card'}`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className={`text-xs font-bold px-2.5 py-0.5 ${config.badge}`}>
                                                {task.priority}
                                            </Badge>
                                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {task.time}
                                            </span>
                                        </div>
                                        <CardTitle className="text-xl mt-3 leading-tight text-foreground">{task.title}</CardTitle>
                                        <CardDescription className="text-base font-medium text-muted-foreground mt-1">
                                            {task.patient}
                                        </CardDescription>
                                        {isInProgress && (
                                            <div className="mt-3 p-2.5 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 font-semibold text-sm border border-blue-500/20">
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> En Curso...
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardFooter className="mt-auto flex gap-2.5 p-5 pt-0">
                                        {!isInProgress && (
                                            <Button
                                                className="flex-1 h-14 text-lg font-bold shadow-sm rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                                onClick={() => handleStartTask(task.id)}
                                            >
                                                <PlayCircle className="mr-2 h-5 w-5" /> Iniciar
                                            </Button>
                                        )}
                                        <Button
                                            variant={isInProgress ? "default" : "outline"}
                                            className={`flex-1 h-14 text-lg font-bold shadow-sm rounded-xl ${isInProgress ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white' : 'border-2 hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400'}`}
                                            onClick={() => handleCompleteTask(task.id)}
                                        >
                                            <CheckCircle className="mr-2 h-5 w-5" /> Listo
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </SlideIn>
                        );
                    })}
                </div>
            )}

            {/* All Tasks Completed */}
            {!loading && activeTasks.length === 0 && isClockedIn && (
                <ScaleIn delay={0.2}>
                    <div className="text-center py-16 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-500/20 shadow-sm">
                        <div className="inline-flex p-5 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full mb-5 shadow-lg shadow-emerald-500/20">
                            <CheckCircle className="h-16 w-16 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">¡Todo listo por ahora! 🎉</h3>
                        <p className="text-lg text-muted-foreground">Has completado todas tus tareas asignadas.</p>
                        {completedCount > 0 && (
                            <p className="text-sm text-emerald-400 font-semibold mt-2">{completedCount} tarea{completedCount !== 1 ? 's' : ''} completada{completedCount !== 1 ? 's' : ''} hoy</p>
                        )}
                    </div>
                </ScaleIn>
            )}
        </FadeIn>
    );
}
