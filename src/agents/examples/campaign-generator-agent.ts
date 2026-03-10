import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { generateBlueJaxResponse } from '@/lib/bluejax-ai';

export class CampaignGeneratorAgent implements Agent {
    id = 'campaign-generator';
    name = 'Generador de Campañas IA';
    scheduleDescription = 'Manual / Bajo Demanda';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[CampaignGeneratorAgent] Generating marketing campaign draft...`);

        // Gather facility stats for content generation
        const [patientCount, staffCount, familyCount, recentLogs] = await Promise.all([
            db.patient.count({ where: { facilityId: context.facilityId } }),
            db.user.count({ where: { role: { in: ['STAFF', 'DOCTOR', 'NURSE'] }, facilityId: context.facilityId } }),
            db.user.count({ where: { role: 'FAMILY', facilityId: context.facilityId } }),
            db.dailyLog.count({
                where: {
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                    patient: { facilityId: context.facilityId }
                },
            }),
        ]);

        const prompt = `Actúa como BlueJax, el director de marketing de un asilo de ancianos premium.
Estadísticas actuales: ${patientCount} residentes, ${staffCount} profesionales de salud, ${familyCount} familiares registrados, ${recentLogs} registros de atención esta semana.

Genera un borrador de newsletter mensual para familias con las siguientes secciones:
1. **Saludo** (2 oraciones, cálido y profesional)
2. **Actividades del Mes** (3 actividades inventadas, incluye fechas)
3. **Destacado de Cuidado** (1 párrafo corto sobre una mejora o logro del equipo)
4. **Invitación** (1 oración invitando a un evento o visita)

Formato: Texto plano con secciones marcadas. Máximo 200 palabras total. Escribe en español.`;

        let draft: string;
        try {
            draft = await generateBlueJaxResponse(prompt);
        } catch {
            draft = `📰 Newsletter Mensual - Asilo\n\nEstimadas familias,\n\nNos complace informarles que seguimos brindando la mejor atención a nuestros ${patientCount} residentes con un equipo de ${staffCount} profesionales dedicados.\n\nActividades del Mes:\n- Taller de Arte: Miércoles 15\n- Musicoterapia: Jueves 22\n- Día Familiar: Sábado 28\n\n¡Los esperamos!`;
        }

        await db.notification.create({
            data: {
                title: `✉️ Campaña Generada por IA`,
                message: `Borrador de newsletter listo. ${draft.length} caracteres generados con estadísticas actualizadas.`,
                type: 'INFO',
                recipientRole: 'ADMIN',
                facilityId: context.facilityId,
            },
        });

        return {
            success: true,
            message: `Borrador de campaña generado (${draft.length} caracteres) con datos de ${patientCount} residentes.`,
            data: {
                draft,
                stats: { patientCount, staffCount, familyCount, recentLogs },
            },
        };
    }
}
