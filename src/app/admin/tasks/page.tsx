"use client"

import { useState } from "react";
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
import { Calendar, ClipboardList, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function TasksPage() {
    const [tasks, setTasks] = useState([
        { id: "1", text: "Limpiar Pasillo A", completed: false },
        { id: "2", text: "Sanitizar Superficies de Cocina", completed: false },
        { id: "3", text: "Revisar Extintores", completed: false },
        { id: "4", text: "Regar Plantas del Jardín", completed: false },
        { id: "5", text: "Vaciar Botes de Basura (Área Común)", completed: false },
        { id: "6", text: "Reponer Insumos de Baño (Ala B)", completed: false }
    ]);
    const [newTaskText, setNewTaskText] = useState("");

    const handleToggleTask = (id: string) => {
        setTasks(prev => prev.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const handleAddTask = () => {
        if (!newTaskText.trim()) {
            toast.error("Por favor ingrese una tarea");
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            text: newTaskText,
            completed: false
        };

        setTasks(prev => [...prev, newTask]);
        setNewTaskText("");
        toast.success("Tarea agregada");
    };

    const handleDeleteTask = (id: string) => {
        setTasks(prev => prev.filter(task => task.id !== id));
        toast.success("Tarea eliminada");
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tareas y Horarios</h2>
                    <p className="text-muted-foreground">
                        Gestionar operaciones de la instalación y citas del personal.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="calendar" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="calendar">
                        <Calendar className="mr-2 h-4 w-4" />
                        Calendario BlueJax
                    </TabsTrigger>
                    <TabsTrigger value="internal">
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Tareas Internas
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="calendar" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Horario del Personal</CardTitle>
                            <CardDescription>
                                Gestionado vía BlueJax. Las citas se sincronizan automáticamente.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="min-h-[600px] flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
                            <div className="text-center space-y-4">
                                <Calendar className="mx-auto h-12 w-12 text-slate-300" />
                                <div>
                                    <p className="text-lg font-medium text-slate-900">Integración de Calendario BlueJax</p>
                                    <p className="text-sm text-slate-500">El código embebido se colocará aquí.</p>
                                </div>
                                <Button variant="outline">Abrir en BlueJax</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="internal" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Mantenimiento</CardTitle>
                            <CardDescription>
                                Tareas diarias de mantenimiento de las instalaciones.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Add new task input */}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Nueva tarea de mantenimiento..."
                                        value={newTaskText}
                                        onChange={(e) => setNewTaskText(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddTask();
                                            }
                                        }}
                                    />
                                    <Button onClick={handleAddTask}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar
                                    </Button>
                                </div>

                                {/* Task list */}
                                <div className="space-y-2">
                                    {tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between space-x-2 border p-3 rounded-md hover:bg-slate-50 transition group"
                                        >
                                            <div className="flex items-center space-x-2 flex-1">
                                                <Checkbox
                                                    id={`task-${task.id}`}
                                                    checked={task.completed}
                                                    onCheckedChange={() => handleToggleTask(task.id)}
                                                />
                                                <label
                                                    htmlFor={`task-${task.id}`}
                                                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full ${task.completed ? 'line-through text-muted-foreground' : ''
                                                        }`}
                                                >
                                                    {task.text}
                                                </label>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteTask(task.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                    {tasks.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No hay tareas. Agregue una nueva tarea arriba.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
