import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { generateBlueJaxResponse } from '@/lib/bluejax-ai';

export class MessageAuditAgent implements Agent {
    id = 'message-audit';
    name = 'Análisis de Sentimiento de Mensajes';
    scheduleDescription = 'Diario a las 09:00';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[MessageAuditAgent] Analyzing family message sentiments...`);

        const since = new Date();
        since.setDate(since.getDate() - 7);

        const messages = await db.familyMessage.findMany({
            where: { createdAt: { gte: since }, isFromFamily: true },
            select: { content: true, createdAt: true, patient: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        if (messages.length === 0) {
            return {
                success: true,
                message: 'Sin mensajes de familias en los últimos 7 días para analizar.',
                data: { analyzed: 0 },
            };
        }

        const messageList = messages
            .map((m, i) => `${i + 1}. [${m.patient?.name || 'N/A'}]: "${m.content}"`)
            .join('\n');

        let analysis: string;
        try {
            const prompt = `Actúa como BlueJax, el analista de satisfacción del Asilo.
Analiza los siguientes ${messages.length} mensajes recientes de familiares y genera:
1. Clima general (Positivo/Neutro/Negativo)
2. Cantidad estimada de mensajes urgentes o con tono negativo
3. Resumen ejecutivo (máximo 3 oraciones)

Mensajes:
${messageList}`;
            analysis = await generateBlueJaxResponse(prompt);
        } catch {
            analysis = `Se analizaron ${messages.length} mensajes de familias de la última semana. Análisis de sentimiento no disponible (error de IA).`;
        }

        const hasUrgent = analysis.toLowerCase().includes('negativo') || analysis.toLowerCase().includes('urgente');

        await db.notification.create({
            data: {
                title: hasUrgent ? `⚠️ Alerta de Sentimiento Familiar` : `💬 Reporte de Sentimiento Familiar`,
                message: analysis,
                type: hasUrgent ? 'WARNING' : 'INFO',
                recipientRole: 'ADMIN',
            },
        });

        return {
            success: true,
            message: analysis,
            data: { analyzed: messages.length, hasUrgentFlags: hasUrgent },
        };
    }
}
