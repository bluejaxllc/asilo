"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, ClipboardList, Plus, Trash2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getAllTasks, createTask, deleteTask, toggleTaskStatus } from "@/actions/tasks";
import { getPatients } from "@/actions/patients";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { StaffCalendar } from "@/components/admin/staff-calendar";
import { FadeIn, SlideIn } from "@/components/ui/motion-wrapper";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function TasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [newTaskText, setNewTaskText] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<string>("general");
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        const [taskList, patientList] = await Promise.all([
            getAllTasks(),
            getPatients()
        ]);

        setTasks(taskList);
        setPatients(patientList);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleToggleTask = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setTasks(prev => prev.map(task =>
            task.id === id ? { ...task, status: !currentStatus ? "COMPLETED" : "PENDING" } : task
        ));

        await toggleTaskStatus(id, currentStatus);
        loadData(); // Re-fetch to ensure consistency
    };

    const handleAddTask = async () => {
        if (!newTaskText.trim()) {
            toast.error("Por favor ingrese una tarea");
            return;
        }

        setLoading(true);
        const patientId = selectedPatient === "general" ? undefined : selectedPatient;
        const result = await createTask(newTaskText, "NORMAL", patientId);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success);
            setNewTaskText("");
            setSelectedPatient("general");
            loadData();
        }
    };

    const handleDeleteTask = async (id: string) => {
        // Optimistic
        setTasks(prev => prev.filter(task => task.id !== id));

        const result = await deleteTask(id);
        if (result.error) toast.error(result.error);
        else toast.success(result.success);

        loadData();
    };

    return (
        <FadeIn className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tareas y Horarios</h2>
                    <p className="text-muted-foreground">
                        Gestionar operaciones de la instalación y citas del personal.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="internal" className="space-y-4">
                <TabsList className="bg-white border">
                    <TabsTrigger value="internal" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Tareas Internas
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                        <Calendar className="mr-2 h-4 w-4" />
                        Calendario BlueJax
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="internal" className="space-y-4">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b pb-4">
                            <CardTitle className="text-xl">Lista de Mantenimiento y Atención</CardTitle>
                            <CardDescription>
                                Tareas diarias para el personal. Asigne a un paciente específico si es necesario.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                {/* Add new task input */}
                                <div className="flex flex-col md:flex-row gap-3 bg-slate-50 p-4 rounded-xl border border-dashed text-slate-500">
                                    <Input
                                        className="flex-1 bg-white border-slate-200"
                                        placeholder="Escriba una nueva tarea..."
                                        value={newTaskText}
                                        onChange={(e) => setNewTaskText(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') handleAddTask();
                                        }}
                                    />
                                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                                        <SelectTrigger className="w-[200px] bg-white border-slate-200">
                                            <SelectValue placeholder="Asignar a..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General (Sin paciente)</SelectItem>
                                            {patients.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={handleAddTask} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        {loading ? "Agregando..." : "Agregar Tarea"}
                                    </Button>
                                </div>

                                {/* Task list */}
                                <div className="space-y-3">
                                    {tasks.map((task, i) => {
                                        const isCompleted = task.status === "COMPLETED";
                                        return (
                                            <SlideIn key={task.id} delay={i * 0.05}>
                                                <div
                                                    className={cn(
                                                        "flex items-center justify-between space-x-2 border p-4 rounded-xl transition-all duration-200 group bg-white hover:shadow-md hover:border-blue-100",
                                                        isCompleted ? "opacity-60 bg-slate-50/50" : ""
                                                    )}
                                                >
                                                    <div className="flex items-center space-x-4 flex-1">
                                                        <Checkbox
                                                            id={`task-${task.id}`}
                                                            checked={isCompleted}
                                                            onCheckedChange={() => handleToggleTask(task.id, isCompleted)}
                                                            className="h-5 w-5 border-2 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                        />
                                                        <div className="flex flex-col">
                                                            <label
                                                                htmlFor={`task-${task.id}`}
                                                                className={cn(
                                                                    "text-base font-medium leading-none cursor-pointer w-full transition-colors",
                                                                    isCompleted ? 'line-through text-slate-400' : 'text-slate-700 group-hover:text-blue-700'
                                                                )}
                                                            >
                                                                {task.title}
                                                            </label>
                                                            {task.patient && (
                                                                <div className="flex items-center mt-1.5">
                                                                    <Badge variant="outline" className="text-xs font-normal text-blue-600 bg-blue-50 border-blue-100 flex items-center gap-1 pl-1 pr-2 py-0 h-5">
                                                                        <User className="w-3 h-3" />
                                                                        {task.patient.name}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                                                        onClick={() => handleDeleteTask(task.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </SlideIn>
                                        );
                                    })}
                                    {tasks.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                                            <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                                <ClipboardList className="h-6 w-6 text-slate-300" />
                                            </div>
                                            <h3 className="text-sm font-medium text-slate-900">No hay tareas pendientes</h3>
                                            <p className="text-sm text-slate-500 mt-1">Todas las operaciones están bajo control.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="calendar" className="space-y-4">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b pb-4">
                            <CardTitle>Horario y Tareas</CardTitle>
                            <CardDescription>
                                Vista mensual de actividades asignadas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <StaffCalendar tasks={tasks} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </FadeIn>
    );
}
