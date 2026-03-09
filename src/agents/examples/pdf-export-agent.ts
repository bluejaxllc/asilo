import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { generateBlueJaxResponse } from '@/lib/bluejax-ai';

export class PdfExportAgent implements Agent {
    id = 'pdf-export';
    name = 'Generación de Reporte IA';
    scheduleDescription = 'Manual / Bajo Demanda';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[PdfExportAgent] Generating structured weekly report...`);

        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [patients, logs, tasks, medications, staff] = await Promise.all([
            db.patient.findMany({
                select: { name: true, room: true, status: true },
                orderBy: { room: 'asc' },
            }),
            db.dailyLog.findMany({
                where: { createdAt: { gte: weekAgo } },
                select: { type: true },
            }),
            db.task.findMany({
                where: { updatedAt: { gte: weekAgo } },
                select: { status: true },
            }),
            db.medication.findMany({
                select: { name: true, stock: true, minStock: true, unit: true },
            }),
            db.user.count({ where: { role: { in: ['STAFF', 'DOCTOR', 'NURSE', 'KITCHEN'] } } }),
        ]);

        // Aggregate log types
        const logCounts: Record<string, number> = {};
        for (const log of logs) {
            logCounts[log.type] = (logCounts[log.type] || 0) + 1;
        }

        // Task stats
        const taskStats = {
            completed: tasks.filter(t => t.status === 'COMPLETED').length,
            pending: tasks.filter(t => t.status === 'PENDING').length,
            inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        };

        // Medication alerts
        const lowStock = medications.filter(m => m.stock <= m.minStock);

        // Patient census
        const statusCounts: Record<string, number> = {};
        for (const p of patients) {
            statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
        }

        const reportDate = new Date().toLocaleDateString('es-MX', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });

        let executiveSummary: string;
        try {
            const prompt = `Actúa como BlueJax, generando el resumen ejecutivo semanal del Asilo.
Datos: ${patients.length} residentes (${Object.entries(statusCounts).map(([k, v]) => `${v} ${k}`).join(', ')}), ${staff} personal activo.
Registros: ${logs.length} total (${Object.entries(logCounts).map(([k, v]) => `${k}: ${v}`).join(', ')}).
Tareas: ${taskStats.completed} completadas, ${taskStats.pending} pendientes, ${taskStats.inProgress} en progreso.
Inventario: ${lowStock.length} artículos en stock bajo.
Genera un resumen ejecutivo de 3-4 oraciones para el director del asilo. Formal pero accesible.`;

            executiveSummary = await generateBlueJaxResponse(prompt);
        } catch {
            executiveSummary = `Reporte semanal: ${patients.length} residentes activos, ${logs.length} registros de atención, ${taskStats.completed} tareas completadas. ${lowStock.length > 0 ? `Alerta: ${lowStock.length} artículos con stock bajo.` : 'Inventario en niveles normales.'}`;
        }

        const report = {
            title: `Reporte Semanal — ${reportDate}`,
            executiveSummary,
            census: {
                total: patients.length,
                byStatus: statusCounts,
                staffCount: staff,
            },
            activity: {
                totalLogs: logs.length,
                byType: logCounts,
            },
            tasks: taskStats,
            inventory: {
                totalItems: medications.length,
                lowStockCount: lowStock.length,
                lowStockItems: lowStock.map(m => ({
                    name: m.name,
                    stock: m.stock,
                    minStock: m.minStock,
                    unit: m.unit,
                })),
            },
        };

        await db.notification.create({
            data: {
                title: `📊 Reporte Semanal Generado`,
                message: executiveSummary,
                type: 'INFO',
                recipientRole: 'ADMIN',
            },
        });

        return {
            success: true,
            message: `Reporte semanal generado: ${patients.length} residentes, ${logs.length} registros, ${taskStats.completed} tareas completadas.`,
            data: report,
        };
    }
}
