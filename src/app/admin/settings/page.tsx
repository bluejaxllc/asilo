import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="p-8 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
                <p className="text-muted-foreground">
                    Administre los parámetros generales del sistema.
                </p>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                    <TabsTrigger value="backup">Respaldo</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Asilo</CardTitle>
                            <CardDescription>
                                Datos visibles en reportes y encabezados.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre de la Institución</Label>
                                <Input id="name" defaultValue="Rinconcito de Amor" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input id="address" defaultValue="Av. Reforma 123, Col. Centro" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono de Contacto</Label>
                                <Input id="phone" defaultValue="(55) 5555-5555" />
                            </div>
                            <Button className="w-fit">
                                <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferencias de Alertas</CardTitle>
                            <CardDescription>
                                Configure cuándo enviar alertas al administrador.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="stock-alerts" className="flex flex-col space-y-1">
                                    <span>Stock Bajo de Medicamentos</span>
                                    <span className="font-normal text-xs text-muted-foreground">Enviar correo cuando un medicamento baje del mínimo.</span>
                                </Label>
                                <Switch id="stock-alerts" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="incident-alerts" className="flex flex-col space-y-1">
                                    <span>Incidentes Críticos</span>
                                    <span className="font-normal text-xs text-muted-foreground">Notificación inmediata para reportes de caídas o emergencias.</span>
                                </Label>
                                <Switch id="incident-alerts" defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="backup">
                    <Card>
                        <CardHeader>
                            <CardTitle>Copia de Seguridad de Datos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 mb-4">
                                Descargue una copia completa de la base de datos de pacientes y registros.
                            </p>
                            <Button variant="outline">Descargar Respaldo (.CSV)</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
