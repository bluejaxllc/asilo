"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getPatients } from "@/actions/patients";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
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
import { Activity, Pill, Utensils, Loader2, Users, HeartPulse, AlertCircle } from "lucide-react";
import { LogForm } from "@/components/staff/log-form";
import { FadeIn, SlideIn, ScaleIn, HoverScale } from "@/components/ui/motion-wrapper";
import { SearchInput } from "@/components/ui/search-input";

const avatarGradients = [
    "from-blue-400 to-blue-600",
    "from-emerald-400 to-emerald-600",
    "from-violet-400 to-violet-600",
    "from-amber-400 to-amber-600",
    "from-rose-400 to-rose-600",
    "from-cyan-400 to-cyan-600",
];

export default function StaffPatientsPage() {
    return (
        <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>}>
            <StaffPatientsContent />
        </Suspense>
    );
}

function StaffPatientsContent() {
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
        const lastVital = p.logs?.[0];
        let lastVitalTime = "--:--";

        if (lastVital) {
            const now = new Date();
            const vitalDate = new Date(lastVital.createdAt);
            const diffMs = now.getTime() - vitalDate.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);

            if (diffHours > 0) {
                lastVitalTime = `${diffHours}h`;
            } else if (diffMins > 0) {
                lastVitalTime = `${diffMins}m`;
            } else {
                lastVitalTime = "ahora";
            }
        }

        return { ...p, lastVitalTime };
    });

    const stableCount = patients.filter(p => p.status === "Estable").length;
    const attentionCount = patients.filter(p => p.status !== "Estable").length;

    return (
        <FadeIn className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Bitácora de Cuidado</h2>
                    <p className="text-muted-foreground mt-1">Seleccione un residente para registrar actividad</p>
                </div>
                <div className="w-full md:w-72">
                    <SearchInput placeholder="Buscar residente..." />
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 grid-cols-3">
                <ScaleIn delay={0}>
                    <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-1">
                        <CardContent className="p-4 md:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-100 font-medium">Total</p>
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
                    <Card className="border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-1">
                        <CardContent className="p-4 md:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-emerald-100 font-medium">Estables</p>
                                    <p className="text-3xl font-bold mt-1">{stableCount}</p>
                                </div>
                                <div className="h-11 w-11 bg-card/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <HeartPulse className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </ScaleIn>

                <ScaleIn delay={0.2}>
                    <Card className={`border-0 text-white shadow-lg transition-all hover:-translate-y-1 ${attentionCount > 0 ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/20 hover:shadow-red-500/40' : 'bg-gradient-to-br from-zinc-700 to-zinc-900 shadow-zinc-500/20 hover:shadow-zinc-500/40'}`}>
                        <CardContent className="p-4 md:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${attentionCount > 0 ? 'text-red-100' : 'text-slate-200'}`}>Atención</p>
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
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-3 text-blue-500 font-medium">Cargando residentes...</span>
                </div>
            ) : patients.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground bg-card/[0.02] rounded-2xl border border-dashed border-border">
                    {query ? "No se encontraron residentes." : "No hay residentes asignados."}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patientsWithVitals.map((p, index) => (
                        <SlideIn key={p.id} delay={index * 0.06}>
                            <HoverScale className="h-full">
                                <Card className="shadow-md hover:shadow-xl transition-all duration-300 border-0 h-full flex flex-col bg-card rounded-2xl overflow-hidden">
                                    {/* Card Header with Avatar */}
                                    <CardHeader className="pb-3 bg-card border-b border-border/60">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                                                {p.name?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-xl font-bold text-foreground truncate">{p.name}</CardTitle>
                                                <span className="text-sm text-muted-foreground font-mono">Hab. {p.room || "N/A"}</span>
                                            </div>
                                            <Badge className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${p.status === 'Estable' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-red-500/15 text-red-400 border-red-500/20'}`} variant="outline">
                                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${p.status === 'Estable' ? 'bg-emerald-500/100' : 'bg-red-500/100'}`} />
                                                {p.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    {/* Quick Info */}
                                    <CardContent className="py-4 flex-grow">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-blue-500/10 p-3 rounded-xl text-center border border-blue-500/20">
                                                <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider">Última Vital</span>
                                                <span className="block text-lg font-bold text-blue-400 mt-0.5">{p.lastVitalTime}</span>
                                            </div>
                                            <div className="bg-orange-500/10 p-3 rounded-xl text-center border border-orange-500/20">
                                                <span className="block text-[10px] font-bold text-orange-400 uppercase tracking-wider">Dieta</span>
                                                <span className="block text-sm font-bold text-orange-400 mt-0.5 truncate">{p.dietaryNeeds || "General"}</span>
                                            </div>
                                        </div>
                                    </CardContent>

                                    {/* Action Buttons */}
                                    <CardFooter className="grid grid-cols-3 gap-2.5 p-4 bg-card border-t border-border/60">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="flex flex-col h-20 gap-1.5 border-2 border-border hover:border-blue-400 hover:bg-blue-500/10 active:scale-95 transition-all rounded-xl" title="Registrar Vitales">
                                                    <div className="p-1.5 bg-blue-500/15 rounded-lg text-blue-400">
                                                        <Activity className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-xs font-bold text-muted-foreground">Vitales</span>
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
                                                <Button variant="outline" className="flex flex-col h-20 gap-1.5 border-2 border-border hover:border-orange-400 hover:bg-orange-500/10 active:scale-95 transition-all rounded-xl" title="Registrar Alimentos">
                                                    <div className="p-1.5 bg-orange-500/15 rounded-lg text-orange-400">
                                                        <Utensils className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-xs font-bold text-muted-foreground">Alimentos</span>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[500px]">
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl">Registrar Alimentación</DialogTitle>
                                                    <div className="text-muted-foreground">Residente: {p.name}</div>
                                                </DialogHeader>
                                                <LogForm initialType="FOOD" patientName={p.name} patientId={p.id} />
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="flex flex-col h-20 gap-1.5 border-2 border-border hover:border-emerald-400 hover:bg-emerald-500/10 active:scale-95 transition-all rounded-xl" title="Registrar Medicamentos">
                                                    <div className="p-1.5 bg-emerald-500/15 rounded-lg text-emerald-400">
                                                        <Pill className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-xs font-bold text-muted-foreground">Meds</span>
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
                                    </CardFooter>
                                </Card>
                            </HoverScale>
                        </SlideIn>
                    ))}
                </div>
            )}
        </FadeIn>
    );
}
