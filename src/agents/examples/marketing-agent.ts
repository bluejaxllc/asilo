
import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { generateBlueJaxResponse } from '@/lib/bluejax-ai';

export class MarketingAgent implements Agent {
    id = 'marketing-audit';
    name = 'Analista de Embudo de Captación';
    scheduleDescription = 'Semanal';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[MarketingAgent] Analyzing marketing funnel...`);

        // Mocking funnel data (usually pulled from GHL or CRM)
        const funnel = {
            visitors: 1250,
            inquiries: 85,
            tours: 12,
            admissions: 3
        };

        const conversionRate = ((funnel.admissions / funnel.inquiries) * 100).toFixed(1);

        let insight = "El embudo se comporta de manera estable.";
        let status: 'CRITICAL' | 'WARNING' | 'INFO' = 'INFO';

        if (funnel.admissions < 5) status = 'WARNING';
        if (funnel.tours / funnel.inquiries < 0.2) status = 'CRITICAL';

        const prompt = `Actúa como BlueJax, el Analista de Embudo de Captación del Asilo.
Analiza este embudo de ventas:
- Visitantes: ${funnel.visitors}
- Consultas: ${funnel.inquiries}
- Tours: ${funnel.tours}
- Admisiones: ${funnel.admissions}
- Tasa de Conversión (Lead a Residente): ${conversionRate}%

Escribe un "Insight de IA" (máximo 2 oraciones) indicando el estado del embudo y una sugerencia.`;

        try {
            insight = await generateBlueJaxResponse(prompt);
        } catch (err) {
            console.error("AI Error generating marketing insight", err);
        }

        const message = [
            `📈 Reporte de Captación:`,
            `• Visitantes: ${funnel.visitors}`,
            `• Consultas: ${funnel.inquiries}`,
            `• Tours: ${funnel.tours}`,
            `• Admisiones: ${funnel.admissions}`,
            `🎯 Conversión (Lead-to-Resident): ${conversionRate}%`,
            `💡 IA Insight: ${insight || "El embudo se comporta de manera estable."}`
        ].join('\n');

        await db.notification.create({
            data: {
                title: '📊 Insight de Marketing',
                message: message,
                type: status,
                recipientRole: 'ADMIN',
                facilityId: context.facilityId
            }
        });

        return {
            success: true,
            message: `Análisis de embudo finalizado. Tasa de conversión: ${conversionRate}%`,
            data: {
                conversionRate,
                funnel,
                insight
            }
        };
    }
}
