"use client";

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
import { Save, Loader2, Building2, Bell, Database, Shield, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getSettings, updateSetting } from "@/actions/settings";
import { FadeIn, SlideIn } from "@/components/ui/motion-wrapper";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<Record<string, string>>({});

    // Form States
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [stockAlerts, setStockAlerts] = useState(true);
    const [incidentAlerts, setIncidentAlerts] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const data = await getSettings();
            setSettings(data);

            setName(data.institutionName || ".blue_jax");
            setAddress(data.institutionAddress || "Av. Reforma 123, Col. Centro");
            setPhone(data.institutionPhone || "(55) 5555-5555");
            setStockAlerts(data.stockAlerts !== "false");
            setIncidentAlerts(data.incidentAlerts !== "false");

            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleSaveGeneral = async () => {
        setSaving(true);
        try {
            await updateSetting("institutionName", name);
            await updateSetting("institutionAddress", address);
            await updateSetting("institutionPhone", phone);
            toast.success("Información general actualizada");
        } catch (error) {
            toast.error("Error al guardar cambios");
        }
        setSaving(false);
    };

    const handleSaveNotifications = async () => {
        setSaving(true);
        try {
            await updateSetting("stockAlerts", String(stockAlerts));
            await updateSetting("incidentAlerts", String(incidentAlerts));
            toast.success("Preferencias de notificaciones actualizadas");
        } catch (error) {
            toast.error("Error al guardar cambios");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <FadeIn className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
                    <p className="text-muted-foreground mt-1">
                        Parámetros generales del sistema y preferencias.
                    </p>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/100 animate-pulse" />
                    Sistema Operativo
                </Badge>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="bg-card border h-11 p-1">
                    <TabsTrigger value="general" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground">
                        <Building2 className="h-3.5 w-3.5" /> General
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground">
                        <Bell className="h-3.5 w-3.5" /> Notificaciones
                    </TabsTrigger>
                    <TabsTrigger value="backup" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground">
                        <Database className="h-3.5 w-3.5" /> Respaldo
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground">
                        <Shield className="h-3.5 w-3.5" /> Seguridad
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <SlideIn delay={0.1}>
                        <Card className="shadow-sm border-border">
                            <CardHeader className="border-b bg-card">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Información del Asilo</CardTitle>
                                        <CardDescription>
                                            Datos visibles en reportes y encabezados del sistema.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Nombre de la Institución</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="address" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Dirección</Label>
                                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="h-11" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Teléfono de Contacto</Label>
                                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" />
                                </div>
                                <div className="pt-2">
                                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm gap-2" onClick={handleSaveGeneral} disabled={saving}>
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Guardar Cambios
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </SlideIn>
                </TabsContent>

                <TabsContent value="notifications">
                    <SlideIn delay={0.1}>
                        <Card className="shadow-sm border-border">
                            <CardHeader className="border-b bg-card">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
                                        <Bell className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Preferencias de Alertas</CardTitle>
                                        <CardDescription>
                                            Configure cuándo enviar alertas al administrador.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-1">
                                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-accent/50 transition-colors group">
                                    <Label htmlFor="stock-alerts" className="flex flex-col space-y-1 cursor-pointer">
                                        <span className="font-semibold text-foreground">Stock Bajo de Medicamentos</span>
                                        <span className="font-normal text-xs text-muted-foreground">Enviar correo cuando un medicamento baje del mínimo.</span>
                                    </Label>
                                    <Switch id="stock-alerts" checked={stockAlerts} onCheckedChange={setStockAlerts} />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-accent/50 transition-colors group">
                                    <Label htmlFor="incident-alerts" className="flex flex-col space-y-1 cursor-pointer">
                                        <span className="font-semibold text-foreground">Incidentes Críticos</span>
                                        <span className="font-normal text-xs text-muted-foreground">Notificación inmediata para reportes de caídas o emergencias.</span>
                                    </Label>
                                    <Switch id="incident-alerts" checked={incidentAlerts} onCheckedChange={setIncidentAlerts} />
                                </div>
                                <div className="pt-4 px-4">
                                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm gap-2" onClick={handleSaveNotifications} disabled={saving}>
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Guardar Preferencias
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </SlideIn>
                </TabsContent>

                <TabsContent value="backup">
                    <SlideIn delay={0.1}>
                        <Card className="shadow-sm border-border">
                            <CardHeader className="border-b bg-card">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                                        <Database className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Copia de Seguridad</CardTitle>
                                        <CardDescription>
                                            Descargue una copia completa de la base de datos.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="bg-card/[0.02] rounded-xl p-6 border border-dashed border-border text-center space-y-3">
                                    <Database className="h-10 w-10 text-muted-foreground mx-auto" />
                                    <div>
                                        <p className="text-sm font-medium text-secondary-foreground">Exportar Datos del Sistema</p>
                                        <p className="text-xs text-muted-foreground mt-1">Incluye pacientes, registros médicos y configuración</p>
                                    </div>
                                    <Button variant="outline" className="gap-2">
                                        <Database className="h-3.5 w-3.5" /> Descargar Respaldo (.CSV)
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </SlideIn>
                </TabsContent>

                <TabsContent value="security">
                    <SlideIn delay={0.1}>
                        <Card className="shadow-sm border-border">
                            <CardHeader className="border-b bg-card">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-red-500/15 flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Seguridad del Sistema</CardTitle>
                                        <CardDescription>
                                            Configuración de acceso y permisos.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500/100 animate-pulse" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-emerald-400">Autenticación Activa</p>
                                            <p className="text-xs text-emerald-400">NextAuth.js con control de roles (ADMIN, STAFF, FAMILY)</p>
                                        </div>
                                        <Badge variant="outline" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20">Activo</Badge>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                        <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-blue-400">Middleware de Rutas</p>
                                            <p className="text-xs text-blue-400">Protección por rol en todas las rutas protegidas</p>
                                        </div>
                                        <Badge variant="outline" className="bg-blue-500/15 text-blue-400 border-blue-500/20">Activo</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </SlideIn>
                </TabsContent>
            </Tabs>
        </FadeIn>
    );
}
