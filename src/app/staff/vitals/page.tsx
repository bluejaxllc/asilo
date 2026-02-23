"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getPatients } from "@/actions/patients";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Activity, Heart, Thermometer, Loader2, Users, HeartPulse, AlertCircle, Pill, Clock } from "lucide-react";
import { LogForm } from "@/components/staff/log-form";
import { FadeIn, SlideIn, ScaleIn, HoverScale } from "@/components/ui/motion-wrapper";
import { SearchInput } from "@/components/ui/search-input";
import { AdministerMedButton } from "@/components/patients/administer-med-button";

export default function NurseVitalsPage() {
    return (
        <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-pink-500" /></div>}>
            <NurseVitalsContent />
        </Suspense>
    );
}

function NurseVitalsContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || "";
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPatients = async () => {
        setLoading(true);
        const data = await getPatients(query);
        setPatients(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPatients();
    }, [query]);

    const patientsWithVitals = patients.map(p => {
        const lastVital = p.logs?.find((l: any) => l.type === "VITALS");
        const lastMed = p.logs?.find((l: any) => l.type === "MEDS");
        let lastVitalTime = "Sin registro";
        let lastVitalValue = "--";
        let lastMedTime = "Sin registro";

        if (lastVital) {
            const now = new Date();
            const vitalDate = new Date(lastVital.createdAt);
            const diffMs = now.getTime() - vitalDate.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);

            if (diffHours > 0) lastVitalTime = `hace ${diffHours}h`;
            else if (diffMins > 0) lastVitalTime = `hace ${diffMins}m`;
            else lastVitalTime = "ahora";

            lastVitalValue = lastVital.value || "--";
        }

        if (lastMed) {
            const now = new Date();
            const medDate = new Date(lastMed.createdAt);
            const diffMs = now.getTime() - medDate.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);

            if (diffHours > 0) lastMedTime = `hace ${diffHours}h`;
            else if (diffMins > 0) lastMedTime = `hace ${diffMins}m`;
            else lastMedTime = "ahora";
        }

        return { ...p, lastVitalTime, lastVitalValue, lastMedTime };
    });

    const attentionCount = patients.filter(p => p.status !== "Estable").length;

    return (
        <FadeIn className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        <span className="text-pink-400">♥</span> Panel de Enfermería
                    </h2>
                    <p className="text-muted-foreground mt-1">Registro de signos vitales y administración de medicamentos</p>
                </div>
                <div className="w-full md:w-72">
                    <SearchInput placeholder="Buscar residente..." />
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 grid-cols-3">
                <ScaleIn delay={0}>
                    <Card className="border-0 bg-gradient-to-br from-pink-500 to-rose-700 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all hover:-translate-y-1">
                        <CardContent className="p-4 md:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-pink-100 font-medium">Total Residentes</p>
                                    <p className="text-3xl font-bold mt-1">{patients.length}</p>
                                </div>
                                <div className="h-11 w-11 bg-card/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Users className="h-5 w-5" />
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
                                    <p className="text-sm text-blue-100 font-medium">Estables</p>
                                    <p className="text-3xl font-bold mt-1">{patients.length - attentionCount}</p>
                                </div>
                                <div className="h-11 w-11 bg-card/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <HeartPulse className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </ScaleIn>

                <ScaleIn delay={0.2}>
                    <Card className={`border-0 text-white shadow-lg transition-all hover:-translate-y-1 ${attentionCount > 0 ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/20 hover:shadow-red-500/40' : 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/20 hover:shadow-emerald-500/40'}`}>
                        <CardContent className="p-4 md:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${attentionCount > 0 ? 'text-red-100' : 'text-emerald-100'}`}>Requieren Atención</p>
                                    <p className="text-3xl font-bold mt-1">{attentionCount}</p>
                                </div>
                                <div className="h-11 w-11 bg-card/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </ScaleIn>
            </div>

            {/* Patient Cards */}
            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                    <span className="ml-3 text-pink-500 font-medium">Cargando residentes...</span>
                </div>
            ) : patients.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground bg-card/[0.02] rounded-2xl border border-dashed border-border">
                    {query ? "No se encontraron residentes." : "No hay residentes asignados."}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {patientsWithVitals.map((p, index) => (
                        <SlideIn key={p.id} delay={index * 0.05}>
                            <HoverScale className="h-full">
                                <Card className="shadow-md hover:shadow-xl transition-all duration-300 border-0 h-full flex flex-col bg-card rounded-2xl overflow-hidden">
                                    {/* Top color bar */}
                                    <div className={`h-1.5 ${p.status === 'Estable' ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`} />

                                    <CardHeader className="pb-2 bg-card border-b border-border/60">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                {p.name?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg font-bold text-foreground truncate">{p.name}</CardTitle>
                                                <span className="text-xs text-muted-foreground font-mono">Hab. {p.room || "N/A"}</span>
                                            </div>
                                            <Badge className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${p.status === 'Estable' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-red-500/15 text-red-400 border-red-500/20'}`} variant="outline">
                                                {p.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    {/* Vitals Info */}
                                    <CardContent className="py-3 flex-grow space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-blue-500/10 p-2.5 rounded-xl text-center border border-blue-500/20">
                                                <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider">Último Vital</span>
                                                <span className="block text-sm font-bold text-blue-400 mt-0.5 truncate">{p.lastVitalValue}</span>
                                                <span className="block text-[10px] text-blue-400/70">{p.lastVitalTime}</span>
                                            </div>
                                            <div className="bg-emerald-500/10 p-2.5 rounded-xl text-center border border-emerald-500/20">
                                                <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Última Med</span>
                                                <span className="block text-sm font-bold text-emerald-400 mt-0.5">
                                                    <Clock className="h-3 w-3 inline mr-1" />
                                                    {p.lastMedTime}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Medications list */}
                                        {p.medications && p.medications.length > 0 && (
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Medicamentos</span>
                                                {p.medications.slice(0, 3).map((pm: any, i: number) => (
                                                    <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg p-2 border border-border">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <Pill className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                                            <div className="min-w-0">
                                                                <span className="text-xs font-semibold text-foreground block truncate">{pm.medication.name}</span>
                                                                <span className="text-[10px] text-muted-foreground">{pm.dosage} · {pm.schedule}</span>
                                                            </div>
                                                        </div>
                                                        <AdministerMedButton
                                                            patientId={p.id}
                                                            medicationName={pm.medication.name}
                                                            dosage={pm.dosage}
                                                        />
                                                    </div>
                                                ))}
                                                {p.medications.length > 3 && (
                                                    <span className="text-[10px] text-muted-foreground">+{p.medications.length - 3} más</span>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-2 p-3 bg-card border-t border-border/60">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="flex items-center gap-2 h-11 border-2 border-border hover:border-pink-400 hover:bg-pink-500/10 active:scale-95 transition-all rounded-xl">
                                                    <Activity className="h-4 w-4 text-pink-400" />
                                                    <span className="text-xs font-bold">Registrar Vitales</span>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[500px]">
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl">Registrar Signos Vitales</DialogTitle>
                                                    <div className="text-muted-foreground">Residente: {p.name}</div>
                                                </DialogHeader>
                                                <LogForm initialType="VITALS" patientName={p.name} patientId={p.id} />
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="flex items-center gap-2 h-11 border-2 border-border hover:border-blue-400 hover:bg-blue-500/10 active:scale-95 transition-all rounded-xl">
                                                    <Pill className="h-4 w-4 text-blue-400" />
                                                    <span className="text-xs font-bold">Registrar Meds</span>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[500px]">
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl">Administrar Medicamento</DialogTitle>
                                                    <div className="text-muted-foreground">Residente: {p.name}</div>
                                                </DialogHeader>
                                                <LogForm initialType="MEDS" patientName={p.name} patientId={p.id} />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </Card>
                            </HoverScale>
                        </SlideIn>
                    ))}
                </div>
            )}
        </FadeIn>
    );
}
