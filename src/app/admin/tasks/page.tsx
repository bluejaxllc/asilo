"use client"

import { useState, useEffect, useMemo } from "react";
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
import { Calendar, ClipboardList, Plus, Trash2, User, Clock, CheckCircle2, Loader2, ListTodo } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getAllTasks, createTask, deleteTask, toggleTaskStatus, getStaffList } from "@/actions/tasks";
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

type StatusFilter = "ALL" | "PENDING" | "IN_PROGRESS" | "COMPLETED";

export default function TasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [newTaskText, setNewTaskText] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<string>("general");
    const [selectedStaff, setSelectedStaff] = useState<string>("none");
    const [selectedPriority, setSelectedPriority] = useState<string>("NORMAL");
    const [dueDate, setDueDate] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState<StatusFilter>("ALL");

    const loadData = async () => {
        const [taskList, patientList, staff] = await Promise.all([
            getAllTasks(),
            getPatients(),
            getStaffList()
        ]);

        setTasks(taskList);
        setPatients(patientList);
        setStaffList(staff);
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- Counts ---
    const pendingCount = tasks.filter(t => t.status === "PENDING").length;
    const inProgressCount = tasks.filter(t => t.status === "IN_PROGRESS").length;
    const completedCount = tasks.filter(t => t.status === "COMPLETED").length;

    // --- Filtered + Sorted tasks ---
    const filteredTasks = useMemo(() => {
        let list = [...tasks];

        // Filter by status
        if (activeFilter !== "ALL") {
            list = list.filter(t => t.status === activeFilter);
        }

        // Sort: In-progress first, then Pending, Completed last.
        // Within same status: highest priority first, then earliest due date.
        list.sort((a, b) => {
            const statusOrder: Record<string, number> = { IN_PROGRESS: 0, PENDING: 1, COMPLETED: 2 };
            const oa = statusOrder[a.status] ?? 1;
            const ob = statusOrder[b.status] ?? 1;
            if (oa !== ob) return oa - ob;

            // Within same status, sort by priority (URGENT > HIGH > NORMAL > LOW)
            const priorityOrder: Record<string, number> = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
            const pa = priorityOrder[a.priority] ?? 2;
            const pb = priorityOrder[b.priority] ?? 2;
            if (pa !== pb) return pa - pb;

            // Then by dueDate (if exists) then createdAt — earliest first
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : new Date(a.createdAt).getTime();
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : new Date(b.createdAt).getTime();
            return dateA - dateB;
        });

        return list;
    }, [tasks, activeFilter]);

    const handleToggleTask = async (id: string, currentStatus: boolean) => {
        setTasks(prev => prev.map(task =>
            task.id === id ? { ...task, status: !currentStatus ? "COMPLETED" : "PENDING" } : task
        ));

        await toggleTaskStatus(id, currentStatus);
        loadData();
    };

    const handleAddTask = async () => {
        if (!newTaskText.trim()) {
            toast.error("Por favor ingrese una tarea");
            return;
        }

        setLoading(true);
        const patientId = selectedPatient === "general" ? undefined : selectedPatient;
        const assignedToId = selectedStaff === "none" ? undefined : selectedStaff;
        const due = dueDate || undefined;
        const result = await createTask(newTaskText, selectedPriority, patientId, assignedToId, due);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success);
            setNewTaskText("");
            setSelectedPatient("general");
            setSelectedStaff("none");
            setSelectedPriority("NORMAL");
            setDueDate("");
            loadData();
        }
    };

    const handleDeleteTask = async (id: string) => {
        setTasks(prev => prev.filter(task => task.id !== id));
        const result = await deleteTask(id);
        if (result.error) toast.error(result.error);
        else toast.success(result.success);
        loadData();
    };

    const handleFilterClick = (filter: StatusFilter) => {
        setActiveFilter(prev => prev === filter ? "ALL" : filter);
    };

    const statCards: { key: StatusFilter; label: string; count: number; icon: any; color: string; border: string; bg: string; activeBg: string }[] = [
        {
            key: "PENDING",
            label: "Pendientes",
            count: pendingCount,
            icon: ListTodo,
            color: "text-amber-400",
            border: "border-amber-500/30",
            bg: "bg-amber-500/5",
            activeBg: "bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/30",
        },
        {
            key: "IN_PROGRESS",
            label: "En Progreso",
            count: inProgressCount,
            icon: Loader2,
            color: "text-blue-400",
            border: "border-blue-500/30",
            bg: "bg-blue-500/5",
            activeBg: "bg-blue-500/20 border-blue-400 ring-1 ring-blue-400/30",
        },
        {
            key: "COMPLETED",
            label: "Completadas",
            count: completedCount,
            icon: CheckCircle2,
            color: "text-emerald-400",
            border: "border-emerald-500/30",
            bg: "bg-emerald-500/5",
            activeBg: "bg-emerald-500/20 border-emerald-400 ring-1 ring-emerald-400/30",
        },
    ];

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

            {/* ══ Stat Filter Cards ══ */}
            <div className="grid grid-cols-3 gap-4">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    const isActive = activeFilter === card.key;
                    return (
                        <button
                            key={card.key}
                            onClick={() => handleFilterClick(card.key)}
                            className={cn(
                                "relative flex items-center gap-4 p-5 rounded-xl border transition-all duration-300 cursor-pointer group text-left",
                                isActive ? card.activeBg : `${card.bg} ${card.border} hover:border-muted-foreground/30`
                            )}
                        >
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                                isActive ? card.activeBg : `${card.bg} border ${card.border}`
                            )}>
                                <Icon className={cn("h-6 w-6", card.color, card.key === "IN_PROGRESS" && "animate-spin")} />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-foreground tabular-nums">{card.count}</p>
                                <p className={cn("text-sm font-medium", isActive ? card.color : "text-muted-foreground")}>
                                    {card.label}
                                </p>
                            </div>
                            {isActive && (
                                <div className="absolute top-2 right-3">
                                    <Badge className={cn("text-[10px] px-1.5 py-0", card.activeBg, card.color, "border-0")}>
                                        FILTRO ACTIVO
                                    </Badge>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            <Tabs defaultValue="internal" className="space-y-4">
                <TabsList className="bg-card border">
                    <TabsTrigger value="internal" className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400">
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Tareas Internas
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-400">
                        <Calendar className="mr-2 h-4 w-4" />
                        Calendario BlueJax
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="internal" className="space-y-4">
                    <Card className="shadow-sm border-border">
                        <CardHeader className="bg-card/[0.02] border-b pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Lista de Mantenimiento y Atención</CardTitle>
                                    <CardDescription>
                                        {activeFilter === "ALL"
                                            ? "Tareas diarias para el personal. Asigne a un paciente específico si es necesario."
                                            : `Mostrando ${filteredTasks.length} tarea(s) — ${statCards.find(c => c.key === activeFilter)?.label}`
                                        }
                                    </CardDescription>
                                </div>
                                {activeFilter !== "ALL" && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setActiveFilter("ALL")}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Mostrar todas
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                {/* Add new task form */}
                                <div className="bg-card/[0.02] p-5 rounded-xl border border-dashed text-muted-foreground space-y-3">
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <Input
                                            className="flex-1 bg-card border-border"
                                            placeholder="Escriba una nueva tarea..."
                                            value={newTaskText}
                                            onChange={(e) => setNewTaskText(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') handleAddTask();
                                            }}
                                        />
                                        <Button onClick={handleAddTask} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shrink-0">
                                            <Plus className="h-4 w-4 mr-2" />
                                            {loading ? "Agregando..." : "Agregar Tarea"}
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                                            <SelectTrigger className="bg-card border-border">
                                                <SelectValue placeholder="Asignar a personal..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Sin asignar</SelectItem>
                                                {staffList.map(s => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        {s.name} ({s.role})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                                            <SelectTrigger className="bg-card border-border">
                                                <SelectValue placeholder="Paciente..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="general">Sin paciente</SelectItem>
                                                {patients.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                                            <SelectTrigger className="bg-card border-border">
                                                <SelectValue placeholder="Prioridad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="URGENT">🔴 Urgente</SelectItem>
                                                <SelectItem value="HIGH">🟠 Alta</SelectItem>
                                                <SelectItem value="NORMAL">🟡 Normal</SelectItem>
                                                <SelectItem value="LOW">🟢 Baja</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="datetime-local"
                                            className="bg-card border-border"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Task list */}
                                <div className="space-y-3">
                                    {filteredTasks.map((task, i) => {
                                        const isCompleted = task.status === "COMPLETED";
                                        const isInProgress = task.status === "IN_PROGRESS";
                                        return (
                                            <SlideIn key={task.id} delay={i * 0.05}>
                                                <div
                                                    className={cn(
                                                        "flex items-center justify-between space-x-2 border p-4 rounded-xl transition-all duration-200 group hover:shadow-md",
                                                        isCompleted
                                                            ? "opacity-50 bg-card/[0.01] border-border/50"
                                                            : isInProgress
                                                                ? "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40"
                                                                : "bg-card border-border hover:border-blue-500/20"
                                                    )}
                                                >
                                                    <div className="flex items-center space-x-4 flex-1">
                                                        <Checkbox
                                                            id={`task-${task.id}`}
                                                            checked={isCompleted}
                                                            onCheckedChange={() => handleToggleTask(task.id, isCompleted)}
                                                            className="h-5 w-5 border-2 border-muted-foreground/40 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                                        />
                                                        <div className="flex flex-col flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <label
                                                                    htmlFor={`task-${task.id}`}
                                                                    className={cn(
                                                                        "text-base font-medium leading-none cursor-pointer transition-colors",
                                                                        isCompleted ? 'line-through text-muted-foreground' : 'text-foreground group-hover:text-blue-400'
                                                                    )}
                                                                >
                                                                    {task.title}
                                                                </label>
                                                                {isInProgress && (
                                                                    <Badge className="text-[10px] px-1.5 py-0 bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                                                        EN PROGRESO
                                                                    </Badge>
                                                                )}
                                                                {isCompleted && (
                                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                                {task.assignedTo && (
                                                                    <Badge variant="outline" className="text-xs font-normal text-violet-400 bg-violet-500/10 border-violet-500/20 flex items-center gap-1 pl-1 pr-2 py-0 h-5">
                                                                        <User className="w-3 h-3" />
                                                                        {task.assignedTo.name} ({task.assignedTo.role})
                                                                    </Badge>
                                                                )}
                                                                {task.patient && (
                                                                    <Badge variant="outline" className="text-xs font-normal text-blue-400 bg-blue-500/10 border-blue-500/20 flex items-center gap-1 pl-1 pr-2 py-0 h-5">
                                                                        <User className="w-3 h-3" />
                                                                        {task.patient.name}
                                                                    </Badge>
                                                                )}
                                                                {task.createdAt && (
                                                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                                                                        <Clock className="w-3 h-3" />
                                                                        {new Date(task.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                                                                    </span>
                                                                )}
                                                                {task.priority && task.priority !== "NORMAL" && (
                                                                    <Badge variant="outline" className={cn(
                                                                        "text-[10px] px-1.5 py-0 h-5",
                                                                        task.priority === "URGENT" && "text-red-400 bg-red-500/10 border-red-500/20",
                                                                        task.priority === "HIGH" && "text-orange-400 bg-orange-500/10 border-orange-500/20",
                                                                        task.priority === "LOW" && "text-muted-foreground bg-zinc-500/10 border-border",
                                                                    )}>
                                                                        {task.priority}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-400"
                                                        onClick={() => handleDeleteTask(task.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </SlideIn>
                                        );
                                    })}
                                    {filteredTasks.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground bg-card/[0.02] rounded-xl border border-dashed">
                                            <div className="mx-auto w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-sm mb-3">
                                                <ClipboardList className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-sm font-medium text-foreground">
                                                {activeFilter === "ALL"
                                                    ? "No hay tareas pendientes"
                                                    : `No hay tareas con estado "${statCards.find(c => c.key === activeFilter)?.label}"`
                                                }
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {activeFilter === "ALL"
                                                    ? "Todas las operaciones están bajo control."
                                                    : "Intente seleccionar otro filtro o agregue nuevas tareas."
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="calendar" className="space-y-4">
                    <Card className="shadow-sm border-border">
                        <CardHeader className="bg-card/[0.02] border-b pb-4">
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
