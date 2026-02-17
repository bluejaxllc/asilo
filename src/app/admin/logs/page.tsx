"use client"

import { useState, useEffect, Suspense } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, Utensils, Pill, FileText, AlertTriangle, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllLogs } from "@/actions/logs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SearchInput } from "@/components/ui/search-input";
import { useSearchParams } from "next/navigation";
import { FadeIn, SlideInRow } from "@/components/ui/motion-wrapper";

const LOG_TYPES = [
    { key: "ALL", label: "Todos", icon: Filter, color: "text-slate-600", bg: "bg-slate-100", activeBg: "bg-slate-800 text-white" },
    { key: "VITALS", label: "Vitales", icon: Activity, color: "text-blue-600", bg: "bg-blue-50", activeBg: "bg-blue-600 text-white" },
    { key: "FOOD", label: "Alimentos", icon: Utensils, color: "text-orange-600", bg: "bg-orange-50", activeBg: "bg-orange-500 text-white" },
    { key: "MEDS", label: "Meds", icon: Pill, color: "text-green-600", bg: "bg-green-50", activeBg: "bg-green-600 text-white" },
    { key: "NOTE", label: "Notas", icon: FileText, color: "text-purple-600", bg: "bg-purple-50", activeBg: "bg-purple-600 text-white" },
    { key: "INCIDENT", label: "Incidentes", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", activeBg: "bg-red-600 text-white" },
];

const typeConfig: Record<string, { label: string; badgeClass: string; dotColor: string }> = {
    VITALS: { label: "VITALES", badgeClass: "bg-blue-100 text-blue-700 border-blue-200", dotColor: "bg-blue-500" },
    FOOD: { label: "ALIMENTOS", badgeClass: "bg-orange-100 text-orange-700 border-orange-200", dotColor: "bg-orange-500" },
    MEDS: { label: "MEDS", badgeClass: "bg-green-100 text-green-700 border-green-200", dotColor: "bg-green-500" },
    NOTE: { label: "NOTA", badgeClass: "bg-purple-100 text-purple-700 border-purple-200", dotColor: "bg-purple-500" },
    INCIDENT: { label: "INCIDENTE", badgeClass: "bg-red-100 text-red-700 border-red-200", dotColor: "bg-red-500" },
};

export default function LogsPage() {
    return (
        <Suspense fallback={<div className="p-8 flex justify-center"><div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <LogsPageContent />
        </Suspense>
    );
}

function LogsPageContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || "";
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("ALL");

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            const data = await getAllLogs(200, query);
            setLogs(data);
            setLoading(false);
        };
        fetchLogs();
    }, [query]);

    const filteredLogs = activeFilter === "ALL"
        ? logs
        : logs.filter(log => log.type === activeFilter);

    // Count by type
    const typeCounts = logs.reduce((acc: Record<string, number>, log) => {
        acc[log.type] = (acc[log.type] || 0) + 1;
        return acc;
    }, {});

    return (
        <FadeIn className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Bitácora Global</h2>
                    <p className="text-muted-foreground mt-1">
                        {logs.length} registros · Historial de actividades y cuidados
                    </p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" /> Exportar
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div className="flex-1">
                    <SearchInput placeholder="Buscar por residente, personal o contenido..." />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {LOG_TYPES.map((type) => {
                        const isActive = activeFilter === type.key;
                        const count = type.key === "ALL" ? logs.length : (typeCounts[type.key] || 0);
                        return (
                            <button
                                key={type.key}
                                onClick={() => setActiveFilter(type.key)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isActive ? type.activeBg + ' shadow-sm' : type.bg + ' ' + type.color + ' hover:opacity-80'}`}
                            >
                                <type.icon className="h-3 w-3" />
                                {type.label}
                                <span className={`ml-0.5 text-[10px] ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/80">
                            <TableHead className="w-[100px]">Hora</TableHead>
                            <TableHead>Residente</TableHead>
                            <TableHead className="w-[120px]">Tipo</TableHead>
                            <TableHead>Descripción / Valor</TableHead>
                            <TableHead className="w-[150px]">Registrado Por</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm text-muted-foreground">Cargando registros...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    {query ? "No se encontraron registros" : "No hay registros para este filtro"}
                                </TableCell>
                            </TableRow>
                        ) : filteredLogs.map((log, index) => {
                            const logDate = new Date(log.createdAt);
                            const isToday = new Date().toDateString() === logDate.toDateString();
                            const config = typeConfig[log.type] || typeConfig.NOTE;

                            return (
                                <SlideInRow key={log.id} delay={Math.min(index * 0.03, 1)} className="hover:bg-slate-50/80 transition-colors group">
                                    <TableCell className="whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${config.dotColor} flex-shrink-0`} />
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-700 tabular-nums">
                                                    {format(logDate, "HH:mm", { locale: es })}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {isToday ? "Hoy" : format(logDate, "dd MMM", { locale: es })}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-slate-800">{log.patient?.name || "General"}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold ${config.badgeClass}`}>
                                            {config.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col max-w-md">
                                            <span className="font-medium text-sm text-slate-700 truncate">{log.value || "—"}</span>
                                            {log.notes && (
                                                <span className="text-xs text-muted-foreground mt-0.5 truncate">{log.notes}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">
                                                {log.author?.name?.charAt(0) || "?"}
                                            </div>
                                            <span className="text-sm text-muted-foreground truncate">{log.author?.name || "N/A"}</span>
                                        </div>
                                    </TableCell>
                                </SlideInRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Footer count */}
            {!loading && filteredLogs.length > 0 && (
                <div className="text-xs text-muted-foreground text-center">
                    Mostrando {filteredLogs.length} de {logs.length} registros
                </div>
            )}
        </FadeIn>
    );
}
