"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PatientForm } from "@/components/patients/patient-form";
import { UserPlus, FileText, Activity, Users, Heart, BedDouble, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { FadeIn, HoverScale, SlideInRow } from "@/components/ui/motion-wrapper";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DeletePatientButton } from "@/components/patients/delete-patient-button";
import { SearchInput } from "@/components/ui/search-input";
import { useSearchParams } from "next/navigation";
import { getPatients } from "@/actions/patients";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const avatarGradients = [
    "from-blue-400 to-blue-600",
    "from-emerald-400 to-emerald-600",
    "from-violet-400 to-violet-600",
    "from-amber-400 to-amber-600",
    "from-rose-400 to-rose-600",
    "from-cyan-400 to-cyan-600",
];

export default function PatientsPage() {
    return (
        <Suspense fallback={<div className="p-8 flex justify-center"><div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <PatientsPageContent />
        </Suspense>
    );
}

function PatientsPageContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || "";
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    const fetchPatients = async () => {
        setLoading(true);
        const data = await getPatients(query);
        setPatients(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchPatients();
    }, [query]);

    const handlePatientAdded = () => {
        setOpen(false);
        fetchPatients();
    };

    const stableCount = patients.filter(p => p.status === "Estable").length;
    const criticalCount = patients.filter(p => p.status !== "Estable").length;
    const roomsUsed = new Set(patients.map(p => p.room).filter(Boolean)).size;

    return (
        <FadeIn className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Residentes</h2>
                    <p className="text-muted-foreground mt-1">
                        {patients.length} residentes · Gestione expedientes e información clínica.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <SearchInput placeholder="Buscar residente..." />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm gap-2 flex-shrink-0">
                                <UserPlus className="h-4 w-4" /> Agregar
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Registrar Nuevo Residente</DialogTitle>
                                <DialogDescription>
                                    Cree un nuevo expediente. Haga clic en guardar cuando termine.
                                </DialogDescription>
                            </DialogHeader>
                            <PatientForm onSuccess={handlePatientAdded} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-100 font-medium">Total Residentes</p>
                                <p className="text-2xl font-bold mt-0.5">{patients.length}</p>
                            </div>
                            <div className="h-9 w-9 bg-card/10 rounded-lg flex items-center justify-center">
                                <Users className="h-4 w-4 text-blue-100" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-emerald-100 font-medium">Estables</p>
                                <p className="text-2xl font-bold mt-0.5">{stableCount}</p>
                            </div>
                            <div className="h-9 w-9 bg-card/10 rounded-lg flex items-center justify-center">
                                <Heart className="h-4 w-4 text-emerald-100" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-lg shadow-violet-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-violet-100 font-medium">Habitaciones</p>
                                <p className="text-2xl font-bold mt-0.5">{roomsUsed}</p>
                            </div>
                            <div className="h-9 w-9 bg-card/10 rounded-lg flex items-center justify-center">
                                <BedDouble className="h-4 w-4 text-violet-100" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "border-0 text-white shadow-lg",
                    criticalCount > 0
                        ? "bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/10"
                        : "bg-gradient-to-br from-zinc-600 to-zinc-800 shadow-zinc-500/10"
                )}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={cn("text-xs font-medium", criticalCount > 0 ? "text-red-100" : "text-muted-foreground")}>Atención</p>
                                <p className="text-2xl font-bold mt-0.5">{criticalCount}</p>
                            </div>
                            <div className="h-9 w-9 bg-card/10 rounded-lg flex items-center justify-center">
                                <AlertTriangle className={cn("h-4 w-4", criticalCount > 0 ? "text-red-100" : "text-muted-foreground")} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-card">
                            <TableHead className="font-semibold text-muted-foreground">Residente</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Habitación</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Edad</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Estado</TableHead>
                            <TableHead className="text-right font-semibold text-muted-foreground">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm text-muted-foreground">Cargando residentes...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : patients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-card flex items-center justify-center">
                                            <Users className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-secondary-foreground text-sm">{query ? "Sin resultados" : "Sin residentes"}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{query ? "Intente otra búsqueda." : "Registre el primer residente para comenzar."}</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : patients.map((patient, i) => {
                            const gradient = avatarGradients[i % avatarGradients.length];
                            return (
                                <SlideInRow key={patient.id} delay={Math.min(i * 0.04, 1)} className="hover:bg-card transition-colors group">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-9 w-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shadow-sm",
                                                gradient
                                            )}>
                                                {patient.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-semibold text-foreground">{patient.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] font-mono bg-card/[0.02] text-muted-foreground border-border px-2">
                                            {patient.room || "—"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground tabular-nums">
                                        {patient.age ? `${patient.age} años` : "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={patient.status === 'Estable' ? 'outline' : 'destructive'}
                                            className={cn(
                                                "text-[10px] font-semibold px-2 py-0.5",
                                                patient.status === 'Estable' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
                                            )}
                                        >
                                            <span className={cn(
                                                "inline-block h-1.5 w-1.5 rounded-full mr-1.5",
                                                patient.status === 'Estable' ? "bg-emerald-500/100" : "bg-red-500/100"
                                            )} />
                                            {patient.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/admin/patients/${patient.id}`}>
                                                <Button variant="ghost" size="icon" title="Ver Detalles" className="h-8 w-8 hover:text-blue-400 hover:bg-blue-500/10">
                                                    <FileText className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/patients/${patient.id}?tab=logs`}>
                                                <Button variant="ghost" size="icon" title="Historial Médico" className="h-8 w-8 hover:text-indigo-400 hover:bg-indigo-500/10">
                                                    <Activity className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <DeletePatientButton
                                                patientId={patient.id}
                                                patientName={patient.name}
                                                onSuccess={fetchPatients}
                                            />
                                        </div>
                                    </TableCell>
                                </SlideInRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </FadeIn>
    );
}
