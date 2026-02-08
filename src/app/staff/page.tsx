"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, CheckCircle, Clock, LogIn, Loader2 } from "lucide-react";
import { useAttendance } from "@/context/attendance-context";
import { toast } from "sonner";
import { FadeIn, SlideIn, HoverScale } from "@/components/ui/motion-wrapper";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { getMyTasks, startTask, completeTask } from "@/actions/tasks";

// Initial Mock Data


export default function StaffPage() {
    const { isClockedIn, hasCompletedShift, clockIn, clockOut, duration } = useAttendance();
    const { data: session } = useSession();
    const [tasks, setTasks] = useState<any[]>([]); // TODO: Type this properly with Prisma types
    const [loading, setLoading] = useState(false);

    const fetchTasks = async () => {
        if (session?.user?.email) {
            setLoading(true);
            const userTasks = await getMyTasks(session.user.email);
            // Transform Prisma tasks to UI format if needed, or stick to schema
            // For now, mapping to match UI expectation or adjusting UI
            setTasks(userTasks);
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

        // Optimistic update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: "EN PROGRESO" } : t
        ));

        try {
            const result = await startTask(taskId, session.user.email);
            if ((result as any).error) {
                toast.error((result as any).error as string);
                fetchTasks(); // Revert on error
            } else {
                toast.success((result as any).success as string);
            }
        } catch (e) {
            toast.error("Error de red al iniciar tarea");
        }
    };

    const handleCompleteTask = async (taskId: string) => {
        // Optimistic update
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

    return (
        <div className="space-y-6">
            <div className={`flex flex-col md:flex-row justify-between items-center p-6 rounded-xl shadow-lg transition-colors duration-500 ${isClockedIn ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white' : 'bg-slate-800 text-slate-100'}`}>
                <div className="mb-4 md:mb-0">
                    <h2 className="text-3xl font-bold">Buenos Días, Carlos</h2>
                    <p className={`mt-1 text-lg ${isClockedIn ? 'text-blue-100' : 'text-slate-400'}`}>
                        {isClockedIn ? `Tienes ${tasks.filter(t => t.status !== 'COMPLETADO').length} tareas pendientes hoy.` : "Por favor marca tu entrada para ver tus tareas."}
                    </p>
                </div>
                <div className="text-right w-full md:w-auto">
                    <div className="text-sm opacity-80 uppercase tracking-wider font-semibold">
                        {isClockedIn ? "Turno en Curso" : "Fuera de Turno"}
                    </div>
                    <div className="text-4xl font-mono font-bold my-2">
                        {isClockedIn ? duration : "--:--:--"}
                    </div>

                    {isClockedIn ? (
                        <Button onClick={() => { console.log('Clicking Marcar Salida'); clockOut(); }} variant="secondary" size="lg" className="w-full md:w-auto mt-2 text-blue-700 hover:bg-white shadow-md font-bold text-lg h-14">
                            <Clock className="mr-2 h-5 w-5" /> Marcar Salida
                        </Button>
                    ) : hasCompletedShift ? (
                        <Button disabled variant="outline" size="lg" className="w-full md:w-auto mt-2 bg-gray-200 text-gray-500 border-0 shadow-none font-bold text-lg h-14">
                            <CheckCircle className="mr-2 h-5 w-5" /> Turno Finalizado
                        </Button>
                    ) : (
                        <Button onClick={() => { console.log('Clicking Iniciar Turno'); clockIn(); }} variant="default" size="lg" className="w-full md:w-auto mt-2 bg-green-500 hover:bg-green-600 text-white border-0 shadow-md font-bold text-lg h-14 animate-pulse">
                            <LogIn className="mr-2 h-5 w-5" /> Iniciar Turno
                        </Button>
                    )}
                </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${!isClockedIn ? 'opacity-70 grayscale' : ''}`}>
                {tasks.map((task, index) => {
                    const isCompleted = task.status === 'COMPLETADO';
                    const isInProgress = task.status === 'EN PROGRESO';

                    if (isCompleted) return null;

                    return (
                        <div key={task.id} className="h-full">
                            <Card className={`h-full flex flex-col border-l-8 shadow-md transition-all duration-300 transform ${isInProgress ? 'border-l-green-500 ring-2 ring-green-500/30' : 'border-l-blue-500'}`}>
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <Badge className="px-3 py-1 text-sm" variant={task.priority === 'ALTA' ? "destructive" : "secondary"}>
                                            {task.priority}
                                        </Badge>
                                        <span className="text-lg font-bold text-slate-500 flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {task.time}
                                        </span>
                                    </div>
                                    <CardTitle className="text-2xl mt-3 leading-tight">{task.title}</CardTitle>
                                    <CardDescription className="text-xl font-medium text-slate-700 mt-2">
                                        {task.patient}
                                    </CardDescription>
                                    {isInProgress && (
                                        <div className="mt-4 p-2 bg-green-50 rounded-lg flex items-center justify-center text-green-700 font-bold animate-pulse">
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> En Curso...
                                        </div>
                                    )}
                                </CardHeader>
                                <CardFooter className="pt-auto mt-auto flex gap-3 p-6">
                                    {!isInProgress && (
                                        <Button
                                            className="flex-1 h-16 text-xl font-bold shadow-sm"
                                            onClick={() => handleStartTask(task.id)}
                                        >
                                            <PlayCircle className="mr-2 h-6 w-6" /> Iniciar
                                        </Button>
                                    )}
                                    <Button
                                        variant={isInProgress ? "default" : "outline"}
                                        className={`flex-1 h-16 text-xl font-bold shadow-sm ${isInProgress ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                                        onClick={() => handleCompleteTask(task.id)}
                                    >
                                        <CheckCircle className="mr-2 h-6 w-6" /> Listo
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    );
                })}
            </div>
            {tasks.every(t => t.status === 'COMPLETADO') && isClockedIn && (
                <div className="text-center p-16 text-slate-400 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                    <div className="inline-block p-6 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="h-20 w-20 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-700 mb-2">¡Todo listo por ahora!</h3>
                    <p className="text-xl text-slate-500">Has completado todas tus tareas asignadas.</p>
                </div>
            )}
        </div>
    );
}
