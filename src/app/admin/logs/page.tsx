"use client"

import { useState, useEffect } from "react";
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
import { getAllLogs } from "@/actions/logs";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function LogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            const data = await getAllLogs(100);
            setLogs(data);
            setFilteredLogs(data);
            setLoading(false);
        };
        fetchLogs();
    }, []);

    useEffect(() => {
        if (searchTerm === "") {
            setFilteredLogs(logs);
        } else {
            const filtered = logs.filter(log =>
                log.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.value?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredLogs(filtered);
        }
    }, [searchTerm, logs]);

    const getTypeLabel = (type: string) => {
        const labels: { [key: string]: string } = {
            'VITALS': 'VITALES',
            'FOOD': 'ALIMENTOS',
            'MEDS': 'MEDICAMENTOS',
            'NOTE': 'NOTA'
        };
        return labels[type] || type;
    };

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
                    <Input
                        placeholder="Buscar por residente o personal..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Cargando registros...
                                </TableCell>
                            </TableRow>
                        ) : filteredLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? "No se encontraron registros" : "No hay registros aún"}
                                </TableCell>
                            </TableRow>
                        ) : filteredLogs.map((log) => {
                            const logDate = new Date(log.createdAt);
                            const isToday = new Date().toDateString() === logDate.toDateString();

                            return (
                                <TableRow key={log.id}>
                                    <TableCell className="whitespace-nowrap flex flex-col">
                                        <span className="font-bold text-slate-700">
                                            {format(logDate, "HH:mm", { locale: es })}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {isToday ? "Hoy" : format(logDate, "dd/MM/yyyy", { locale: es })}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium">{log.patient?.name || "N/A"}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            log.type === 'VITALS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                log.type === 'FOOD' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    log.type === 'MEDS' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        'bg-slate-100'
                                        }>
                                            {getTypeLabel(log.type)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{log.value}</span>
                                            {log.notes && (
                                                <span className="text-xs text-muted-foreground mt-1">{log.notes}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{log.author?.name || "N/A"}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
