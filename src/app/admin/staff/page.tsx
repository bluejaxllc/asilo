"use client"

import { useState, useEffect, Suspense } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
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
import { UserPlus, Clock, Users, ShieldCheck, UserCheck, AlertCircle } from "lucide-react";
import { StaffForm } from "@/components/admin/staff-form";
import { getStaffAttendanceHistory } from "@/actions/staff";
import { SearchInput } from "@/components/ui/search-input";
import { useSearchParams } from "next/navigation";
import { FadeIn, SlideInRow } from "@/components/ui/motion-wrapper";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const roleColors: Record<string, string> = {
    ADMIN: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    STAFF: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    FAMILY: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

export default function StaffPage() {
    return (
        <Suspense fallback={<div className="p-8 flex justify-center"><div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <StaffPageContent />
        </Suspense>
    );
}

function StaffPageContent() {
    const [open, setOpen] = useState(false);
    const [staffWithStatus, setStaffWithStatus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

    const searchParams = useSearchParams();
    const query = searchParams.get('q') || "";

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const url = query ? `/api/staff?q=${encodeURIComponent(query)}` : '/api/staff';
            const response = await fetch(url);

            if (!response.ok) {
                console.error('Failed to fetch staff:', response.status);
                setStaffWithStatus([]);
                return;
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                setStaffWithStatus(data);
            } else {
                console.error('Invalid response format:', data);
                setStaffWithStatus([]);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            setStaffWithStatus([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, [query]);

    const handleStaffAdded = () => {
        setOpen(false);
        fetchStaff();
    };

    const handleViewHistory = async (staff: any) => {
        setSelectedStaff(staff);
        setHistoryOpen(true);
        const history = await getStaffAttendanceHistory(staff.id, 30);
        setAttendanceHistory(history);
    };

    const activeStaffCount = staffWithStatus.filter(s => s.status === "Activo").length;
    const familyCount = staffWithStatus.filter(s => s.role === "FAMILY").length;

    return (
        <FadeIn className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Personal</h2>
                    <p className="text-muted-foreground mt-1">
                        {staffWithStatus.length} usuarios · Administre personal, roles y horarios.
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm gap-2">
                            <UserPlus className="h-4 w-4" /> Agregar Personal
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Nuevo Personal</DialogTitle>
                            <DialogDescription>
                                Complete el formulario para registrar un nuevo miembro del personal.
                            </DialogDescription>
                        </DialogHeader>
                        <StaffForm onSuccess={handleStaffAdded} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card className="border-0 bg-gradient-to-br from-zinc-700 to-zinc-900 text-white shadow-lg shadow-zinc-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-zinc-300 font-medium">Total Personal</p>
                                <p className="text-2xl font-bold mt-0.5">{staffWithStatus.length}</p>
                            </div>
                            <div className="h-9 w-9 bg-card/10 rounded-lg flex items-center justify-center">
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-green-100 font-medium">En Turno</p>
                                <p className="text-2xl font-bold mt-0.5">{activeStaffCount}</p>
                            </div>
                            <div className="h-9 w-9 bg-card/10 rounded-lg flex items-center justify-center">
                                <UserCheck className="h-4 w-4 text-green-100" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-amber-100 font-medium">Familiares</p>
                                <p className="text-2xl font-bold mt-0.5">{familyCount}</p>
                            </div>
                            <div className="h-9 w-9 bg-card/10 rounded-lg flex items-center justify-center">
                                <ShieldCheck className="h-4 w-4 text-amber-100" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/10">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-100 font-medium">Sin Actividad</p>
                                <p className="text-2xl font-bold mt-0.5">{staffWithStatus.filter(s => s.status === "Inactivo").length}</p>
                            </div>
                            <div className="h-9 w-9 bg-card/10 rounded-lg flex items-center justify-center">
                                <AlertCircle className="h-4 w-4 text-blue-100" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="bg-card p-3 rounded-xl border shadow-sm">
                <SearchInput placeholder="Buscar personal por nombre o rol..." />
            </div>

            {/* Table */}
            <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-card">
                            <TableHead className="font-semibold text-muted-foreground">Personal</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Rol</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Estado</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Última Actividad</TableHead>
                            <TableHead className="text-right font-semibold text-muted-foreground">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm text-muted-foreground">Cargando personal...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : staffWithStatus.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    No hay personal registrado.
                                </TableCell>
                            </TableRow>
                        ) : staffWithStatus.map((staff, index) => (
                            <SlideInRow key={staff.id} delay={Math.min(index * 0.04, 1)} className="hover:bg-card transition-colors group">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border-2 border-border shadow-sm">
                                            <AvatarFallback className="bg-gradient-to-br from-card to-muted text-muted-foreground text-xs font-bold">
                                                {staff.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-foreground">{staff.name || "Sin Nombre"}</span>
                                            <span className="text-xs text-muted-foreground">{staff.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 ${roleColors[staff.role] || roleColors.STAFF}`}>
                                        {staff.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`${staff.statusColor} hover:${staff.statusColor} border-0 text-xs`}>
                                        {staff.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">{staff.lastActive}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleViewHistory(staff)} className="gap-1.5 text-xs hover:text-blue-400 hover:bg-blue-500/10">
                                        <Clock className="h-3.5 w-3.5" /> Historial
                                    </Button>
                                </TableCell>
                            </SlideInRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Attendance History Dialog */}
            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Historial de Asistencia — {selectedStaff?.name}</DialogTitle>
                        <DialogDescription>
                            Registro de entradas y salidas de los últimos 30 días
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        {attendanceHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                <Clock className="h-10 w-10 mb-3 opacity-20" />
                                <p className="font-medium">No hay registros de asistencia</p>
                                <p className="text-xs mt-1">Este usuario no tiene turnos registrados</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-card/[0.02]">
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Entrada</TableHead>
                                        <TableHead>Salida</TableHead>
                                        <TableHead>Duración</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendanceHistory.map((record) => {
                                        const checkInDate = new Date(record.checkIn);
                                        const checkOutDate = record.checkOut ? new Date(record.checkOut) : null;

                                        let duration = "En curso";
                                        if (checkOutDate) {
                                            const diff = checkOutDate.getTime() - checkInDate.getTime();
                                            const hours = Math.floor(diff / 3600000);
                                            const minutes = Math.floor((diff % 3600000) / 60000);
                                            duration = `${hours}h ${minutes}m`;
                                        }

                                        return (
                                            <TableRow key={record.id} className="hover:bg-accent/50">
                                                <TableCell className="font-medium">{format(checkInDate, "dd/MM/yyyy", { locale: es })}</TableCell>
                                                <TableCell className="text-emerald-400 font-mono">{format(checkInDate, "HH:mm", { locale: es })}</TableCell>
                                                <TableCell className="text-red-400 font-mono">
                                                    {checkOutDate ? format(checkOutDate, "HH:mm", { locale: es }) : <span className="text-emerald-400 animate-pulse">En turno</span>}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {duration}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </FadeIn>
    );
}
