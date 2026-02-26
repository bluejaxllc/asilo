
import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { generateBlueJaxResponse } from '@/lib/bluejax-ai';

export class DailySummaryAgent implements Agent {
    id = 'daily-summary';
    name = 'Resumen Diario';
    scheduleDescription = 'Diario a las 20:00';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[DailySummaryAgent] Generating daily summary...`);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get today's logs grouped by type
        const logs = await db.dailyLog.findMany({
            where: {
                createdAt: { gte: today, lt: tomorrow }
            },
            include: {
                patient: { select: { name: true } },
                author: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const byType: Record<string, number> = {};
        for (const log of logs) {
            byType[log.type] = (byType[log.type] || 0) + 1;
        }

        // Get today's task completion
        const completedTasks = await db.task.count({
            where: {
                status: 'COMPLETED',
                updatedAt: { gte: today, lt: tomorrow }
            }
        });

        const pendingTasks = await db.task.count({
            where: { status: 'PENDING' }
        });

        // Get patient count
        const patientCount = await db.patient.count();

        const typeLabels: Record<string, string> = {
            VITALS: 'Signos Vitales',
            FOOD: 'Alimentación',
            MEDS: 'Medicamentos',
            NOTE: 'Notas',
            HYGIENE: 'Higiene',
            INCIDENT: 'Incidentes'
        };

        const summaryParts = Object.entries(byType).map(
            ([type, count]) => `${typeLabels[type] || type}: ${count}`
        ).join(', ');

        const prompt = `Actúa como BlueJax, el Asistente Ejecutivo del Asilo.
Genera un resumen diario (máximo 3 oraciones cortas) para la administración basado en estos datos:
- Registros en bitácora hoy: ${logs.length} (${summaryParts})
- Tareas completadas: ${completedTasks}
- Tareas pendientes: ${pendingTasks}
- Residentes activos: ${patientCount}
Usa un tono profesional, alentador y conciso. No uses formato markdown.`;

        let summaryMessage = '';
        try {
            summaryMessage = await generateBlueJaxResponse(prompt);
        } catch (err) {
            console.error("AI Error generating daily summary", err);
            summaryMessage = `Resumen Diario: ${logs.length} registros, ${completedTasks} tareas completadas.`;
        }

        await db.notification.create({
            data: {
                title: '📊 Resumen Diario',
                message: summaryMessage,
                type: 'INFO',
            }
        });

        return {
            success: true,
            message: `Resumen generado: ${logs.length} registros, ${completedTasks} tareas completadas.`,
            data: {
                totalLogs: logs.length,
                logsByType: byType,
                completedTasks,
                pendingTasks,
                patientCount,
                recentLogs: logs.slice(0, 5).map(l => ({
                    type: l.type,
                    value: l.value,
                    patient: l.patient?.name,
                    author: l.author?.name,
                    time: l.createdAt.toISOString()
                }))
            }
        };
    }
}
