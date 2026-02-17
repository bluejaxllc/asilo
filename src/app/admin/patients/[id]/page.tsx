import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Activity,
    Pill,
    FileText,
    Clock,
    AlertTriangle,
    ArrowLeft,
    Heart,
    Utensils,
    CalendarDays,
    User,
    Stethoscope
} from "lucide-react";
import Link from "next/link";
import { VitalsChart } from "@/components/patients/vitals-chart";
import { ClinicalNotes } from "@/components/patients/clinical-notes";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { getPatientById } from "@/actions/patients";
import { redirect } from "next/navigation";
import { AssignMedicationDialog } from "@/components/patients/assign-medication-dialog";
import { AdministerMedButton } from "@/components/patients/administer-med-button";
import { cn } from "@/lib/utils";

const logTypeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    VITALS: { label: "Vitales", icon: Activity, color: "text-blue-600", bg: "bg-blue-100" },
    FOOD: { label: "Alimentos", icon: Utensils, color: "text-orange-600", bg: "bg-orange-100" },
    MEDS: { label: "Meds", icon: Pill, color: "text-green-600", bg: "bg-green-100" },
    NOTE: { label: "Nota", icon: FileText, color: "text-purple-600", bg: "bg-purple-100" },
    INCIDENT: { label: "Incidente", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
};

export default async function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const patient = await getPatientById(id);

    if (!patient) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold">Residente no encontrado</h2>
                <Link href="/admin/patients"><Button className="mt-4">Volver</Button></Link>
            </div>
        );
    }

    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name.replace(' ', '')}`;

    // Computed stats
    const totalLogs = patient.logs?.length || 0;
    const totalMeds = patient.medications?.length || 0;
    const lastLog = patient.logs?.[0];
    const lastLogTime = lastLog
        ? new Date(lastLog.createdAt).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : "Sin registros";

    return (
        <FadeIn className="space-y-0">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-6 md:p-8 -m-0 rounded-none md:rounded-xl md:mx-6 md:mt-6">
                <div className="flex items-center gap-2 mb-4">
                    <Link href="/admin/patients">
                        <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 -ml-2 gap-1">
                            <ArrowLeft className="h-4 w-4" /> Residentes
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <Avatar className="h-24 w-24 ring-4 ring-white/30 shadow-xl">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="text-3xl bg-white/20 text-white">{patient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <h2 className="text-3xl font-bold tracking-tight">{patient.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                                Hab {patient.room || 'N/A'}
                            </Badge>
                            <Badge className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                                {patient.age ? `${patient.age} años` : 'Edad N/R'}
                            </Badge>
                            <Badge className={cn(
                                "border-0",
                                patient.status === 'Estable'
                                    ? "bg-green-400/30 text-green-100"
                                    : "bg-red-400/30 text-red-100"
                            )}>
                                ● {patient.status}
                            </Badge>
                        </div>
                    </div>

                    <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-sm">
                        <AlertTriangle className="mr-2 h-4 w-4" /> Reportar Incidente
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
                            <Activity className="h-3 w-3" /> Registros
                        </div>
                        <p className="text-xl font-bold mt-0.5">{totalLogs}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
                            <Pill className="h-3 w-3" /> Medicamentos
                        </div>
                        <p className="text-xl font-bold mt-0.5">{totalMeds}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
                            <Utensils className="h-3 w-3" /> Dieta
                        </div>
                        <p className="text-sm font-bold mt-0.5 truncate">{patient.dietaryNeeds || "General"}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
                            <Clock className="h-3 w-3" /> Último Registro
                        </div>
                        <p className="text-sm font-bold mt-0.5 truncate">{lastLogTime}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Info Card */}
                    <div className="space-y-4">
                        <Card className="border shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    Información Personal
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Historial Médico</span>
                                    <p className="text-sm mt-1 whitespace-pre-wrap text-slate-700">{patient.medicalHistory || "Sin registro"}</p>
                                </div>
                                <Separator />
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Necesidades Dietéticas</span>
                                    <p className="text-sm mt-1 text-slate-700">{patient.dietaryNeeds || "Sin restricciones"}</p>
                                </div>
                                <Separator />
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contacto de Emergencia</span>
                                    <p className="text-sm mt-1 text-slate-700">{(patient.medicalHistory?.match(/CONTACTO:\s*(.+)/)?.[1]) || "No registrado"}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Tabs */}
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="overview" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-4 h-11">
                                <TabsTrigger value="overview" className="gap-1.5">
                                    <Stethoscope className="h-3.5 w-3.5" /> Clínico
                                </TabsTrigger>
                                <TabsTrigger value="meds" className="gap-1.5">
                                    <Pill className="h-3.5 w-3.5" /> Meds
                                </TabsTrigger>
                                <TabsTrigger value="logs" className="gap-1.5">
                                    <CalendarDays className="h-3.5 w-3.5" /> Bitácora
                                </TabsTrigger>
                                <TabsTrigger value="docs" className="gap-1.5">
                                    <FileText className="h-3.5 w-3.5" /> Docs
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                <Card className="border shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Signos Vitales — Tendencia</CardTitle>
                                        <CardDescription>Monitoreo de Presión Arterial y Glucosa</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[320px] w-full">
                                        <VitalsChart logs={patient.logs} />
                                    </CardContent>
                                </Card>

                                <Card className="border shadow-sm">
                                    <CardContent className="pt-6">
                                        <ClinicalNotes
                                            notes={patient.logs.filter((log: any) => log.type === 'NOTE')}
                                            patientId={patient.id}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="meds" className="space-y-4">
                                <Card className="border shadow-sm">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-base">Esquema de Medicación</CardTitle>
                                                <CardDescription>{totalMeds} medicamento{totalMeds !== 1 ? 's' : ''} activo{totalMeds !== 1 ? 's' : ''}</CardDescription>
                                            </div>
                                            <AssignMedicationDialog patientId={patient.id} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {patient.medications && patient.medications.length > 0 ? (
                                                patient.medications.map((pm: any, i: number) => (
                                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-white transition-colors border border-slate-100 hover:border-slate-200 hover:shadow-sm">
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                                <Pill className="h-5 w-5 text-blue-500" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-slate-800">{pm.medication.name}</h4>
                                                                <p className="text-sm text-muted-foreground">{pm.dosage}</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 sm:mt-0 flex items-center gap-3">
                                                            <div className="text-right">
                                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" /> {pm.schedule}
                                                                </p>
                                                            </div>
                                                            <AdministerMedButton
                                                                patientId={patient.id}
                                                                medicationName={pm.medication.name}
                                                                dosage={pm.dosage}
                                                            />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-10">
                                                    <Pill className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                                                    <p className="text-sm text-muted-foreground">No hay medicamentos asignados</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="logs" className="space-y-4">
                                <Card className="border shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Historial de Actividades</CardTitle>
                                        <CardDescription>{totalLogs} registros del personal</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-[450px] w-full pr-4">
                                            <div className="space-y-1">
                                                {patient.logs && patient.logs.length > 0 ? (
                                                    patient.logs.map((log: any, i: number) => {
                                                        const config = logTypeConfig[log.type] || logTypeConfig.NOTE;
                                                        const Icon = config.icon;
                                                        return (
                                                            <div key={i} className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                                                                <div className={`h-8 w-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                                    <Icon className={`h-4 w-4 ${config.color}`} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${config.bg} ${config.color} border-0`}>
                                                                            {config.label}
                                                                        </Badge>
                                                                        {log.value && (
                                                                            <span className="text-sm font-semibold text-slate-700">{log.value}</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground truncate">{log.notes || "Sin notas"}</p>
                                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                                        {log.author?.name || "Desconocido"} · {new Date(log.createdAt).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="text-center py-10">
                                                        <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                                                        <p className="text-sm text-muted-foreground">No hay registros recientes</p>
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="docs">
                                <Card className="border shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-base">Documentos y Contratos</CardTitle>
                                        <CardDescription>Archivos legales y administrativos</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-10">
                                            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                                            <p className="text-sm text-muted-foreground">Módulo de documentos en desarrollo</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </FadeIn>
    );
}
