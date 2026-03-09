import { db } from "@/lib/db";
import { requireRole } from "@/lib/role-guard";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Database, UserCircle } from "lucide-react";
import { getCurrentFacilityId } from "@/lib/facility";

export default async function AuditTrailPage({ searchParams }: { searchParams: { q?: string } }) {
    // Only ADMINs can view audit logs
    const roleCheck = await requireRole("ADMIN");
    if ("error" in roleCheck) return <div className="p-10 text-red-500 font-bold">{roleCheck.error}</div>;

    const facilityId = await getCurrentFacilityId();
    if (!facilityId) return <div>No se encontró recinto.</div>;

    const query = searchParams.q || "";

    const logs = await db.auditLog.findMany({
        where: {
            facilityId,
            ...(query ? {
                OR: [
                    { action: { contains: query, mode: "insensitive" } },
                    { entity: { contains: query, mode: "insensitive" } },
                    { user: { name: { contains: query, mode: "insensitive" } } }
                ]
            } : {})
        },
        include: {
            user: {
                select: { name: true, email: true, role: true }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 100
    });

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <ShieldAlert className="h-8 w-8 text-primary" />
                        Bitácora de Auditoría
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Monitoreo inalterable de acciones sensibles dentro de la plataforma.
                    </p>
                </div>
            </div>

            <Card className="border-2 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Últimos registros</CardTitle>
                    <CardDescription>Mostrando los últimos 100 eventos de seguridad.</CardDescription>
                </CardHeader>
                <CardContent>
                    {logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                            <Database className="h-10 w-10 mb-3 opacity-20" />
                            <p>No se encontraron registros de auditoría.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Acción</TableHead>
                                        <TableHead>Entidad</TableHead>
                                        <TableHead>Detalles</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id} className="cursor-default hover:bg-muted/50">
                                            <TableCell className="font-mono text-xs whitespace-nowrap">
                                                {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium text-sm">{log.user.name}</span>
                                                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider">{log.user.role}</Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        log.action === "CREATE" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" :
                                                            log.action === "UPDATE" ? "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20" :
                                                                log.action === "DELETE" ? "bg-red-500/10 text-red-600 hover:bg-red-500/20" :
                                                                    "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20"
                                                    }
                                                    variant="secondary"
                                                >
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium text-sm">
                                                {log.entity}
                                                {log.entityId && <span className="text-xs text-muted-foreground ml-1 font-mono">({log.entityId.slice(-6)})</span>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs truncate text-xs font-mono bg-muted p-1 px-2 rounded text-muted-foreground" title={log.details || ""}>
                                                    {log.details || "-"}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
