import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { generateBlueJaxResponse } from '@/lib/bluejax-ai';

export class ScheduleOptimizerAgent implements Agent {
    id = 'schedule-optimizer';
    name = 'Optimizador de Turnos Mágicos';
    scheduleDescription = 'Manual / Bajo Demanda';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[ScheduleOptimizerAgent] Analyzing historical schedule and task load...`);

        // Get an overview of all staff
        const staff = await db.user.count({ where: { role: { in: ['STAFF', 'ADMIN', 'DOCTOR', 'NURSE'] }, facilityId: context.facilityId } });

        // Get count of open tasks
        const pendingTasks = await db.task.count({ where: { status: 'PENDING', patient: { facilityId: context.facilityId } } });

        // Calculate a dummy "optimization ratio" based on staff to tasks
        let ratio = 0;
        if (staff > 0) {
            ratio = pendingTasks / staff;
        }

        const prompt = `Actúa como BlueJax, el Optimizador de Turnos Mágicos del Asilo.
Analiza la siguiente carga de trabajo:
- Total Personal Clínico/Admin: ${staff}
- Tareas Abiertas Pendientes: ${pendingTasks}
- Ratio de tareas por persona: ${ratio.toFixed(1)}

Genera una recomendación breve (máximo 3 oraciones) sobre cómo balancear los turnos o si la carga es adecuada.
Si el ratio es > 5, sugiere reasignación urgente. Si es bajo, sugiere optimización de costos.`;

        let message = '';
        try {
            message = await generateBlueJaxResponse(prompt);
        } catch (err) {
            console.error("AI Error generating schedule optimization", err);
            message = `Error de IA. Carga actual: ${ratio.toFixed(1)} tareas por persona.`;
        }

        await db.notification.create({
            data: {
                title: `⚡ Turnos Optimizados`,
                message: message,
                type: 'INFO',
                recipientRole: 'ADMIN',
                facilityId: context.facilityId
            }
        });

        return {
            success: true,
            message: message,
            data: { staffCount: staff, pendingTasks, recommendedRatio: ratio }
        };
    }
}
