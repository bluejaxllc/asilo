import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { generateBlueJaxResponse } from '@/lib/bluejax-ai';

export class SmartReplyAgent implements Agent {
    id = 'smart-reply';
    name = 'Configuración de Respuestas Inteligentes';
    scheduleDescription = 'Cada 2 horas';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[SmartReplyAgent] Generating smart reply suggestions for unanswered messages...`);

        // Find family messages without a staff reply
        // Strategy: get unique patient conversations, check if the latest message is from family
        const recentFamilyMessages = await db.familyMessage.findMany({
            where: { isFromFamily: true },
            orderBy: { createdAt: 'desc' },
            take: 30,
            include: {
                patient: {
                    select: {
                        name: true,
                        status: true,
                        logs: {
                            orderBy: { createdAt: 'desc' },
                            take: 3,
                            select: { type: true, notes: true, createdAt: true },
                        },
                    },
                },
            },
        });

        // For each family message, check if a staff reply exists after it
        const unanswered: typeof recentFamilyMessages = [];
        for (const msg of recentFamilyMessages) {
            const staffReply = await db.familyMessage.findFirst({
                where: {
                    patientId: msg.patientId,
                    isFromFamily: false,
                    createdAt: { gt: msg.createdAt },
                },
            });
            if (!staffReply) {
                // Only add one per patient to avoid duplicates
                if (!unanswered.find(u => u.patientId === msg.patientId)) {
                    unanswered.push(msg);
                }
            }
        }

        if (unanswered.length === 0) {
            return {
                success: true,
                message: 'Todas las conversaciones familiares están contestadas. ¡Buen trabajo!',
                data: { suggestions: [] },
            };
        }

        const suggestions: Array<{ patientName: string; familyMessage: string; suggestedReply: string }> = [];

        for (const msg of unanswered.slice(0, 5)) {
            const patientName = msg.patient?.name || 'Residente';
            const recentLogs = msg.patient?.logs
                ?.map(l => `${l.type}: ${l.notes || 'Sin notas'}`)
                .join('; ') || 'Sin registros recientes';

            try {
                const prompt = `Actúa como un cuidador profesional del asilo respondiendo a un familiar.
Paciente: ${patientName} (Estado: ${msg.patient?.status || 'Estable'})
Registros recientes: ${recentLogs}
Mensaje del familiar: "${msg.content}"

Genera una respuesta amable, profesional y breve (máximo 2 oraciones). Solo usa datos proporcionados, nunca inventes información médica.`;

                const reply = await generateBlueJaxResponse(prompt);
                suggestions.push({ patientName, familyMessage: msg.content, suggestedReply: reply });
            } catch {
                suggestions.push({
                    patientName,
                    familyMessage: msg.content,
                    suggestedReply: `Estimada familia de ${patientName}, recibimos su mensaje. Le informaremos a la brevedad.`,
                });
            }
        }

        await db.notification.create({
            data: {
                title: `💬 ${unanswered.length} Mensajes Sin Responder`,
                message: `Se generaron ${suggestions.length} sugerencias de respuesta para mensajes familiares pendientes.`,
                type: unanswered.length >= 5 ? 'WARNING' : 'INFO',
                recipientRole: 'STAFF',
            },
        });

        return {
            success: true,
            message: `${suggestions.length} sugerencias de respuesta generadas para ${unanswered.length} conversaciones pendientes.`,
            data: { suggestions, pendingCount: unanswered.length },
        };
    }
}
