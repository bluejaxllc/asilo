"use client"

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
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
import { UserPlus, Clock } from "lucide-react";
import { StaffForm } from "@/components/admin/staff-form";

export default function StaffPage() {
    const [open, setOpen] = useState(false);
    const [staffWithStatus, setStaffWithStatus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/staff');

            if (!response.ok) {
                console.error('Failed to fetch staff:', response.status);
                setStaffWithStatus([]);
                return;
            }

            const data = await response.json();

            // Ensure data is an array
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
    }, []);

    const handleStaffAdded = () => {
        setOpen(false);
        fetchStaff();
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Personal</h2>
                    <p className="text-muted-foreground">
                        Administre personal, roles y horarios.
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" /> Agregar Personal
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

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Última Actividad</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Cargando...
                                </TableCell>
                            </TableRow>
                        ) : staffWithStatus.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No hay personal registrado.
                                </TableCell>
                            </TableRow>
                        ) : staffWithStatus.map((staff) => (
                            <TableRow key={staff.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{staff.name || "Sin Nombre"}</span>
                                        <span className="text-xs text-muted-foreground">{staff.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{staff.role}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${staff.statusColor}`}>
                                        {staff.status}
                                    </span>
                                </TableCell>
                                <TableCell>{staff.lastActive}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                        <Clock className="mr-2 h-4 w-4" /> Historial
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
