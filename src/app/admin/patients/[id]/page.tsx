"use client"

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
    Phone,
    User,
    Clock,
    AlertTriangle,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { VitalsChart } from "@/components/patients/vitals-chart";
import { ClinicalNotes } from "@/components/patients/clinical-notes";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { useEffect, useState } from "react";

// Mock Data
const patientData = {
    id: "1",
    name: "Maria Garcia",
    room: "101",
    age: 82,
    dob: "1942-05-14",
    status: "Estable",
    photo: "/avatars/01.png", // Placeholder
    contact: {
        phone: "(555) 123-4567",
        emergency: "Roberto Garcia (Hijo) - (555) 987-6543"
    },
    medical: {
        conditions: ["Hipertensión", "Artritis Reumatoide", "Diabetes Tipo 2"],
        allergies: ["Penicilina", "Mariscos"],
        bloodType: "O+"
    },
    medications: [
        { name: "Losartán", dose: "50mg", freq: "Cada 12h", time: "08:00 AM, 08:00 PM" },
        { name: "Metformina", dose: "850mg", freq: "Con alimentos", time: "08:30 AM, 02:30 PM" },
        { name: "Ibuprofeno", dose: "400mg", freq: "PRN (Dolor)", time: "--" }
    ],
    logs: [
        { date: "Hoy, 10:00 AM", type: "VITALES", val: "PA: 125/82, FC: 78", staff: "Enf. Carla" },
        { date: "Hoy, 08:30 AM", type: "ALIMENTOS", val: "Desayuno completo (100%)", staff: "Cuid. Pedro" },
        { date: "Ayer, 08:00 PM", type: "MEDS", val: "Losartán administrado", staff: "Enf. Jorge" },
    ]
};

export default function PatientDetailsPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && ["overview", "meds", "logs", "docs"].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // In real app, fetch patient by params.id

    return (
        <FadeIn className="p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/patients">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight">{patientData.name}</h2>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Badge variant="outline">Hab {patientData.room}</Badge>
                        <span>• {patientData.age} años</span>
                        <span>• {patientData.status}</span>
                    </div>
                </div>
                <Button variant="destructive">
                    <AlertTriangle className="mr-2 h-4 w-4" /> Reportar Incidente
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Basic Info & Contacts */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Información Personal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-center py-4">
                                <Avatar className="h-32 w-32">
                                    <AvatarImage src={patientData.photo} />
                                    <AvatarFallback className="text-4xl bg-slate-200">MG</AvatarFallback>
                                </Avatar>
                            </div>
                            <Separator />
                            <div className="grid gap-1">
                                <span className="text-sm font-medium text-muted-foreground">Fecha Nacimiento</span>
                                <span>{patientData.dob}</span>
                            </div>
                            <div className="grid gap-1">
                                <span className="text-sm font-medium text-muted-foreground">Teléfono</span>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3" /> {patientData.contact.phone}
                                </div>
                            </div>
                            <div className="grid gap-1">
                                <span className="text-sm font-medium text-muted-foreground">Contacto Emergencia</span>
                                <span className="text-red-600 font-medium">{patientData.contact.emergency}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-red-700">Alertas Médicas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Alergias</h4>
                                <div className="flex flex-wrap gap-2">
                                    {patientData.medical.allergies.map(a => (
                                        <Badge key={a} variant="destructive">{a}</Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Padecimientos</h4>
                                <div className="flex flex-wrap gap-2">
                                    {patientData.medical.conditions.map(c => (
                                        <Badge key={c} variant="secondary">{c}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Tabs for Clinical Data */}
                <div className="lg:col-span-2">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Resumen Clínico</TabsTrigger>
                            <TabsTrigger value="meds">Medicamentos</TabsTrigger>
                            <TabsTrigger value="logs">Bitácora Personal</TabsTrigger>
                            <TabsTrigger value="docs">Documentos</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Signos Vitales - Tendencia Semanal</CardTitle>
                                        <CardDescription>Monitoreo de Presión Arterial y Glucosa</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[350px] w-full">
                                        <VitalsChart />
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <div className="text-xs text-blue-600 font-bold uppercase mb-1">Presión Arterial</div>
                                            <div className="text-3xl font-bold text-slate-900">120/82</div>
                                            <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">Normal</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <div className="text-xs text-green-600 font-bold uppercase mb-1">Oxigenación</div>
                                            <div className="text-3xl font-bold text-slate-900">98%</div>
                                            <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">Óptimo</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <div className="text-xs text-red-600 font-bold uppercase mb-1">Glucosa</div>
                                            <div className="text-3xl font-bold text-slate-900">110</div>
                                            <Badge variant="outline" className="mt-2 bg-yellow-50 text-yellow-700 border-yellow-200">Post-prandial</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardContent className="pt-6">
                                    <ClinicalNotes />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="meds">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Esquema de Medicación</CardTitle>
                                    <CardDescription>Medicamentos activos y horarios</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {patientData.medications.map((med, i) => (
                                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-slate-50 hover:bg-white transition-colors">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2 bg-white rounded-full border shadow-sm">
                                                        <Pill className="h-6 w-6 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-lg">{med.name}</h4>
                                                        <p className="text-sm text-slate-500">{med.dose}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 sm:mt-0 text-right">
                                                    <div className="font-medium">{med.freq}</div>
                                                    <div className="text-sm text-muted-foreground flex items-center sm:justify-end gap-1">
                                                        <Clock className="h-3 w-3" /> {med.time}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="logs">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Historial de Actividades</CardTitle>
                                    <CardDescription>Últimos registros del personal</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[400px] w-full pr-4">
                                        <div className="space-y-6">
                                            {patientData.logs.map((log, i) => (
                                                <div key={i} className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="h-2 w-2 bg-slate-300 rounded-full mt-2" />
                                                        <div className="h-full w-0.5 bg-slate-200 mt-1" />
                                                    </div>
                                                    <div className="pb-4">
                                                        <p className="text-sm text-muted-foreground font-mono mb-1">{log.date}</p>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline">{log.type}</Badge>
                                                            <span className="font-medium">{log.val}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-400 flex items-center gap-1">
                                                            <User className="h-3 w-3" /> {log.staff}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="docs">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Documentos y Contratos</CardTitle>
                                    <CardDescription>Archivos legales y administrativos del residente</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-8 w-8 text-blue-600" />
                                                <div>
                                                    <p className="font-medium">Contrato de Admisión.pdf</p>
                                                    <p className="text-xs text-muted-foreground">Subido: 14 Mayo 2024</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">Descargar</Button>
                                        </div>
                                        <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-8 w-8 text-orange-600" />
                                                <div>
                                                    <p className="font-medium">Consentimiento Informado.pdf</p>
                                                    <p className="text-xs text-muted-foreground">Subido: 14 Mayo 2024</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">Descargar</Button>
                                        </div>
                                        <div className="border-t pt-4">
                                            <Button className="w-full">
                                                <User className="mr-2 h-4 w-4" /> Subir Nuevo Documento
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </FadeIn>
    );
}
