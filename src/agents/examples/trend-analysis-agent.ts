
import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';

export class TrendAnalysisAgent implements Agent {
    id = 'trend-analysis';
    name = 'Analista de Tendencias Predictivas';
    scheduleDescription = 'Diario';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[TrendAnalysisAgent] Analyzing health trends for last 7 days...`);

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Fetch all vital logs for the last 7 days
        const logs = await db.dailyLog.findMany({
            where: {
                type: 'VITALS',
                createdAt: { gte: sevenDaysAgo }
            },
            include: { patient: true },
            orderBy: { createdAt: 'asc' }
        });

        // Group logs by patient
        const patientTrends: Record<string, { name: string, data: any[] }> = {};
        for (const log of logs) {
            if (!log.patientId) continue;
            if (!patientTrends[log.patientId]) {
                patientTrends[log.patientId] = { name: log.patient?.name || 'Unknown', data: [] };
            }
            patientTrends[log.patientId].data.push(log);
        }

        let findingsCount = 0;

        for (const [id, trend] of Object.entries(patientTrends)) {
            // Simple logic: Is systolic pressure trending up consistently?
            // value format "120/80"
            const pressures = trend.data
                .map(l => parseInt((l.value || "").split('/')[0]))
                .filter(p => !isNaN(p));

            if (pressures.length >= 3) {
                const isTrendingUp = pressures[pressures.length - 1] > pressures[0] + 15;

                if (isTrendingUp) {
                    findingsCount++;
                    await db.notification.create({
                        data: {
                            title: `📈 Alerta Predictiva: ${trend.name}`,
                            message: `Se detectó una tendencia alcista en la presión arterial (+${pressures[pressures.length - 1] - pressures[0]} mmHg) en los últimos ${trend.data.length} registros. Se recomienda revisión preventiva.`,
                            type: 'WARNING',
                            recipientRole: 'ADMIN',
                            patientId: id
                        }
                    });
                }
            }
        }

        return {
            success: true,
            message: findingsCount > 0
                ? `${findingsCount} tendencias predictivas detectadas.`
                : "No se detectaron anomalías de tendencia en los últimos 7 días.",
            data: { findingsCount }
        };
    }
}
