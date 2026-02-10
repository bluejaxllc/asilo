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
import { UserPlus, FileText, Activity } from "lucide-react";
import Link from "next/link";
import { FadeIn, HoverScale } from "@/components/ui/motion-wrapper";
import { db } from "@/lib/db";

export default async function PatientsPage() {
    const patients = await db.patient.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <FadeIn className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Residentes</h2>
                    <p className="text-muted-foreground">
                        Gestione expedientes e información clínica de los residentes.
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <HoverScale>
                            <Button>
                                <UserPlus className="mr-2 h-4 w-4" /> Agregar Residente
                            </Button>
                        </HoverScale>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Registrar Nuevo Residente</DialogTitle>
                            <DialogDescription>
                                Cree un nuevo expediente. Haga clic en guardar cuando termine.
                            </DialogDescription>
                        </DialogHeader>
                        <PatientForm />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Habitación</TableHead>
                            <TableHead>Edad</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No hay residentes registrados. Agregue uno para comenzar.
                                </TableCell>
                            </TableRow>
                        ) : patients.map((patient) => (
                            <TableRow key={patient.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="font-medium">{patient.name}</TableCell>
                                <TableCell>{patient.room || "N/A"}</TableCell>
                                <TableCell>{patient.age || "N/A"}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${patient.status === 'Estable' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {patient.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/admin/patients/${patient.id}`}>
                                            <HoverScale>
                                                <Button variant="ghost" size="icon" title="Ver Detalles">
                                                    <FileText className="h-4 w-4 text-blue-600" />
                                                </Button>
                                            </HoverScale>
                                        </Link>
                                        <Link href={`/admin/patients/${patient.id}`}>
                                            <HoverScale>
                                                <Button variant="ghost" size="icon" title="Historial Médico">
                                                    <Activity className="h-4 w-4 text-indigo-600" />
                                                </Button>
                                            </HoverScale>
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </FadeIn>
    );
}
