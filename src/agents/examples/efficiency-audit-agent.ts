
import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { generateBlueJaxResponse } from '@/lib/bluejax-ai';

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
                createdAt: { gte: twentyFourHoursAgo },
                patient: { facilityId: context.facilityId }
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

        const prompt = `Actúa como BlueJax, Auditor de Eficiencia. Analiza las siguientes métricas de tareas de personal en el asilo (últimas 24h):
- Total: ${tasks.length}
- Completadas: ${completed}
- Pendientes: ${pending}
- Urgentes pendientes: ${urgentPending}
- Score de eficiencia: ${score}%

Genera un breve reporte ejecutivo (máximo 3 oraciones). 
Si hay tareas urgentes pendientes o el score es bajo (<70%), incluye una advertencia clara.
Si el score es bueno (>85%), da un mensaje positivo resaltando el buen rendimiento.`;

        let message = `Score de Eficiencia: ${score}%. ${completed} tareas completadas de ${tasks.length}.`;
        const aiStatus = (score < 50) ? 'CRITICAL' : (score < 80 || urgentPending > 0) ? 'WARNING' : 'OPTIMAL';

        try {
            message = await generateBlueJaxResponse(prompt);
        } catch (err) {
            console.error("AI Error generating efficiency audit", err);
        }

        // Create system notification
        await db.notification.create({
            data: {
                title: `📊 Reporte de Eficiencia: ${score}%`,
                message: message,
                type: aiStatus,
                recipientRole: 'ADMIN',
                facilityId: context.facilityId
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
