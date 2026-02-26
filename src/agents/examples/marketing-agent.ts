
import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';

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

        let insight = "";
        let status: 'CRITICAL' | 'WARNING' | 'INFO' = 'INFO';

        if (funnel.admissions < 5) {
            status = 'WARNING';
            insight = "Las admisiones están por debajo del objetivo mensual. Se recomienda revisar el tiempo de seguimiento a los tours.";
        }

        if (funnel.tours / funnel.inquiries < 0.2) {
            status = 'CRITICAL';
            insight = "Cuello de botella detectado: Solo el 15% de los prospectos agendan un tour. Optimice el primer contacto.";
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
                recipientRole: 'ADMIN'
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
