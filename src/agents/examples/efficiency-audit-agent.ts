
import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';

export class EfficiencyAuditAgent implements Agent {
    id = 'efficiency-audit';
    name = 'Auditoría de Eficiencia Operativa';
    scheduleDescription = 'Diario a las 23:55';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[EfficiencyAuditAgent] Calculating performance metrics...`);

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Fetch tasks from the last 24h
        const tasks = await db.task.findMany({
            where: {
                createdAt: { gte: twentyFourHoursAgo }
            }
        });

        if (tasks.length === 0) {
            return {
                success: true,
                message: 'No hay suficientes tareas registradas en las últimas 24h para calcular métricas.',
            };
        }

        const completed = tasks.filter(t => t.status === 'COMPLETED').length;
        const pending = tasks.length - completed;
        const score = Math.round((completed / tasks.length) * 100);

        // Get urgent tasks still pending
        const urgentPending = tasks.filter(t => t.status !== 'COMPLETED' && t.priority === 'URGENT').length;

        let status = 'OPTIMAL';
        let message = `Score de Eficiencia: ${score}%. ${completed} tareas completadas de ${tasks.length}.`;

        if (score < 50) {
            status = 'CRITICAL';
            message += ` Riesgo operativo detectado: Bajo nivel de completado.`;
        } else if (score < 80 || urgentPending > 0) {
            status = 'WARNING';
            message += ` Atención: ${urgentPending} tareas urgentes siguen pendientes.`;
        }

        // Create system notification
        await db.notification.create({
            data: {
                title: `📊 Reporte de Eficiencia: ${score}%`,
                message: message,
                type: status,
                recipientRole: 'ADMIN'
            }
        });

        return {
            success: true,
            message: `Auditoría finalizada. Score de hoy: ${score}%.`,
            data: {
                score,
                completed,
                pending,
                urgentPending,
                total: tasks.length
            }
        };
    }
}
