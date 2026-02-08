
import { db } from "@/lib/db";
import { getLatestTodayAttendance } from "@/actions/attendance";
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
import { UserPlus, Clock } from "lucide-react";

export default async function StaffPage() {
    // 1. Fetch all users with Role not 'ADMIN' (or all staff types)
    const staffUsers = await db.user.findMany({
        where: {
            role: {
                in: ["STAFF", "DOCTOR", "NURSE", "KITCHEN"]
            }
        },
        orderBy: { name: 'asc' }
    });

    // 2. Enhance with attendance status
    const staffWithStatus = await Promise.all(staffUsers.map(async (user) => {
        const attendance = await getLatestTodayAttendance(user.id);

        // Determine status
        let status = "Fuera de Turno";
        let statusColor = "bg-gray-100 text-gray-800";
        let lastActive = "N/A";

        if (attendance) {
            if (!attendance.checkOut) {
                status = "Activo";
                statusColor = "bg-green-100 text-green-800";
                lastActive = "Entrada: " + formatDistanceToNow(attendance.checkIn, { addSuffix: true, locale: es });
            } else {
                status = "Turno Finalizado";
                statusColor = "bg-blue-100 text-blue-800";
                lastActive = "Salida: " + formatDistanceToNow(attendance.checkOut, { addSuffix: true, locale: es });
            }
        }

        return {
            ...user,
            status,
            statusColor,
            lastActive
        };
    }));

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Personal</h2>
                    <p className="text-muted-foreground">
                        Administre personal, roles y horarios.
                    </p>
                </div>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" /> Agregar Personal
                </Button>
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
                        {staffWithStatus.map((staff) => (
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
                        {staffWithStatus.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No hay personal registrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
