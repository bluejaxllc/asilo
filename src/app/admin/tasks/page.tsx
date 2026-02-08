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
import { Calendar, ClipboardList } from "lucide-react";

export default function TasksPage() {
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
                                {[
                                    "Limpiar Pasillo A",
                                    "Sanitizar Superficies de Cocina",
                                    "Revisar Extintores",
                                    "Regar Plantas del Jardín",
                                    "Vaciar Botes de Basura (Área Común)",
                                    "Reponer Insumos de Baño (Ala B)"
                                ].map((task, i) => (
                                    <div key={i} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-slate-50 transition">
                                        <Checkbox id={`task-${i}`} />
                                        <label
                                            htmlFor={`task-${i}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                                        >
                                            {task}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
