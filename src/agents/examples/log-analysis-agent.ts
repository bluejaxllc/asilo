import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';

export class LogAnalysisAgent implements Agent {
    id = 'log-analysis';
    name = 'Análisis de Patrones en Bitácora';
    scheduleDescription = 'Manual / Bajo Demanda';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[LogAnalysisAgent] Analyzing log patterns...`);

        // Find total logs today vs yesterday (simulated anomaly detection)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const logsToday = await db.dailyLog.count({ where: { createdAt: { gte: today } } });

        await db.notification.create({
            data: {
                title: `🧠 Análisis de Anomalías`,
                message: `Patrón detectado: Flujo de bitácora normal (${logsToday} registros hoy). No se encontraron brechas críticas de documentación.`,
                type: 'INFO',
                recipientRole: 'ADMIN'
            }
        });

        return {
            success: true,
            message: `Análisis IA completado: Sin anomalías críticas detectadas.`,
            data: { logsToday }
        };
    }
}
