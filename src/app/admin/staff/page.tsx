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

const staffMembers = [
    { id: "1", name: "Dr. Elena Torres", role: "Doctora", status: "Activo", lastActive: "Ahora" },
    { id: "2", name: "Carlos Ruiz", role: "Cuidador", status: "Activo", lastActive: "10m atrás" },
    { id: "3", name: "Luisa Mendez", role: "Cocina", status: "Fuera de Turno", lastActive: "2h atrás" },
];

export default function StaffPage() {
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
                        {staffMembers.map((staff) => (
                            <TableRow key={staff.id}>
                                <TableCell className="font-medium">{staff.name}</TableCell>
                                <TableCell>{staff.role}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${staff.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
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
