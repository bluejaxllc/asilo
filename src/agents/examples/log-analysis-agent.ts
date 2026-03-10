import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { generateBlueJaxResponse } from '@/lib/bluejax-ai';

export class LogAnalysisAgent implements Agent {
    id = 'log-analysis';
    name = 'Análisis de Patrones en Bitácora';
    scheduleDescription = 'Diario a las 22:00';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[LogAnalysisAgent] Analyzing log patterns...`);

        const now = new Date();
        const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
        const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);

        const [logsToday, logsYesterday, logsWeek] = await Promise.all([
            db.dailyLog.count({ where: { createdAt: { gte: todayStart }, patient: { facilityId: context.facilityId } } }),
            db.dailyLog.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart }, patient: { facilityId: context.facilityId } } }),
            db.dailyLog.count({ where: { createdAt: { gte: weekStart }, patient: { facilityId: context.facilityId } } }),
        ]);

        const weeklyAvg = Math.round(logsWeek / 7);
        const changeVsYesterday = logsYesterday > 0
            ? Math.round(((logsToday - logsYesterday) / logsYesterday) * 100)
            : 0;

        // Classify log types for today
        const todayLogs = await db.dailyLog.findMany({
            where: { createdAt: { gte: todayStart }, patient: { facilityId: context.facilityId } },
            select: { type: true },
        });
        const typeCounts: Record<string, number> = {};
        for (const log of todayLogs) {
            typeCounts[log.type] = (typeCounts[log.type] || 0) + 1;
        }

        // Detect anomalies
        const anomalies: string[] = [];
        if (logsToday < weeklyAvg * 0.5 && weeklyAvg > 2) {
            anomalies.push(`Brecha de documentación: solo ${logsToday} registros hoy vs promedio de ${weeklyAvg}/día`);
        }
        if (logsToday > weeklyAvg * 2 && weeklyAvg > 0) {
            anomalies.push(`Pico inusual: ${logsToday} registros hoy, ${Math.round(logsToday / weeklyAvg)}x el promedio`);
        }
        if ((typeCounts['INCIDENT'] || 0) >= 3) {
            anomalies.push(`Alto volumen de incidentes: ${typeCounts['INCIDENT']} reportados hoy`);
        }

        const hasAnomaly = anomalies.length > 0;

        let message: string;
        try {
            const prompt = `Actúa como BlueJax, el analista de calidad del Asilo.
Datos de hoy: ${logsToday} registros (ayer: ${logsYesterday}, promedio semanal: ${weeklyAvg}).
Desglose: ${Object.entries(typeCounts).map(([k, v]) => `${k}: ${v}`).join(', ') || 'ninguno'}.
${hasAnomaly ? 'Anomalías detectadas: ' + anomalies.join('; ') : 'Sin anomalías.'}
Genera un resumen ejecutivo de máximo 3 oraciones para el administrador.`;
            message = await generateBlueJaxResponse(prompt);
        } catch {
            message = hasAnomaly
                ? `⚠️ ${anomalies.join('. ')}`
                : `Flujo de bitácora normal: ${logsToday} registros hoy (promedio ${weeklyAvg}/día).`;
        }

        await db.notification.create({
            data: {
                title: hasAnomaly ? `⚠️ Anomalía en Bitácora` : `🧠 Análisis de Bitácora`,
                message,
                type: hasAnomaly ? 'WARNING' : 'INFO',
                recipientRole: 'ADMIN',
                facilityId: context.facilityId,
            },
        });

        return {
            success: true,
            message,
            data: {
                logsToday,
                logsYesterday,
                weeklyAvg,
                changeVsYesterday: `${changeVsYesterday > 0 ? '+' : ''}${changeVsYesterday}%`,
                typeCounts,
                anomalies,
            },
        };
    }
}
