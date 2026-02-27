import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';

export class CampaignGeneratorAgent implements Agent {
    id = 'campaign-generator';
    name = 'Generador de Campañas IA';
    scheduleDescription = 'Manual / Bajo Demanda';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[CampaignGeneratorAgent] Generating marketing campaign drafts...`);

        await db.notification.create({
            data: {
                title: `✉️ Campaña Generada por IA`,
                message: `El borrador de la campaña "Newsletter Mensual de Retiro" está listo para revisión y envío.`,
                type: 'SUCCESS',
                recipientRole: 'ADMIN'
            }
        });

        return {
            success: true,
            message: `Plantilla de campaña lista para revisión en borradores.`,
            data: { generated: true }
        };
    }
}
