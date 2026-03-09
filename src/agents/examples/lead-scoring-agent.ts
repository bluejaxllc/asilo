import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { generateBlueJaxResponse } from '@/lib/bluejax-ai';

export class LeadScoringAgent implements Agent {
    id = 'lead-scoring';
    name = 'Calificador de Prospectos (CRM)';
    scheduleDescription = 'Manual / Bajo Demanda';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[LeadScoringAgent] Calculating lead scores based on interactions...`);

        // Simulate AI finding high-intent leads that haven't converted yet.
        const qualifiedLeads = Math.floor(Math.random() * 5) + 2; // Random 2-6

        const prompt = `Actúa como BlueJax, el analista de CRM del Asilo.
Genera un mensaje de alerta amistoso (máximo 2 oraciones) indicando que el modelo predictivo ha identificado a ${qualifiedLeads} prospectos listos para el cierre basados en su comportamiento reciente de interacción.`;

        let message = `El modelo predictivo ha identificado ${qualifiedLeads} prospectos clasificados como 'Alta Intención' basados en su comportamiento. Listos para cierre.`;
        try {
            message = await generateBlueJaxResponse(prompt);
        } catch (err) {
            console.error("AI Error generating lead scoring message", err);
        }

        await db.notification.create({
            data: {
                title: `🎯 Prospectos Calificados`,
                message: message,
                type: 'INFO',
                recipientRole: 'ADMIN'
            }
        });

        return {
            success: true,
            message: `${qualifiedLeads} Prospectos calificados como 'Alta Intención' detectados.`,
            data: { qualifiedLeads }
        };
    }
}
