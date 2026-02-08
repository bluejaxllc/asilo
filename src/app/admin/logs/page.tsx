import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock Data
const logs = [
    { id: "1", patient: "Maria Garcia", type: "VITALES", desc: "Presión Arterial: 120/80", staff: "Enf. Carla", time: "08:15 AM", date: "Hoy" },
    { id: "2", patient: "Jose Hernandez", type: "ALIMENTOS", desc: "Desayuno: 50% ingerido", staff: "Cuid. Pedro", time: "08:30 AM", date: "Hoy" },
    { id: "3", patient: "Ana Lopez", type: "MEDICAMENTOS", desc: "Administró: Enalapril 10mg", staff: "Enf. Carla", time: "09:00 AM", date: "Hoy" },
    { id: "4", patient: "Maria Garcia", type: "NOTA", desc: "Se quejó de dolor leve en rodilla izquierda", staff: "Dr. Elena", time: "10:00 AM", date: "Hoy" },
];

export default function LogsPage() {
    return (
        <div className="p-8 space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Bitácora Global</h2>
                <p className="text-muted-foreground">
                    Historial de todas las actividades, cuidados y medicamentos registrados.
                </p>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar por residente o personal..." className="pl-8" />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> Filtrar
                </Button>
                <Button variant="outline">Exportar a Excel</Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Hora</TableHead>
                            <TableHead>Residente</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Descripción / Valor</TableHead>
                            <TableHead>Registrado Por</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap flex flex-col">
                                    <span className="font-bold text-slate-700">{log.time}</span>
                                    <span className="text-xs text-muted-foreground">{log.date}</span>
                                </TableCell>
                                <TableCell className="font-medium">{log.patient}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={
                                        log.type === 'VITALES' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            log.type === 'ALIMENTOS' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                log.type === 'MEDICAMENTOS' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    'bg-slate-100'
                                    }>
                                        {log.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>{log.desc}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">{log.staff}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
