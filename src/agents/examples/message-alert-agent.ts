
import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';

export class MessageAlertAgent implements Agent {
    id = 'message-alert';
    name = 'Alerta de Mensajes';
    scheduleDescription = 'Cada 2 horas';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[MessageAlertAgent] Checking for unanswered family messages...`);

        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        // Get all patients with messages
        const patients = await db.patient.findMany({
            where: {
                familyMessages: { some: {} }
            },
            include: {
                familyMessages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: {
                        fromUser: { select: { name: true } }
                    }
                }
            }
        });

        // Filter patients whose last message is from family and older than 2 hours
        const unanswered = patients.filter(p => {
            const lastMsg = p.familyMessages[0];
            if (!lastMsg) return false;
            return lastMsg.isFromFamily && new Date(lastMsg.createdAt) < twoHoursAgo;
        });

        if (unanswered.length === 0) {
            return {
                success: true,
                message: 'Todos los mensajes han sido respondidos.',
            };
        }

        // Create notifications for unanswered threads
        for (const patient of unanswered) {
            const lastMsg = patient.familyMessages[0];
            const hoursSince = Math.round((Date.now() - new Date(lastMsg.createdAt).getTime()) / (1000 * 60 * 60));

            await db.notification.create({
                data: {
                    title: `💬 Mensaje sin respuesta: ${patient.name}`,
                    message: `Un familiar de ${patient.name} envió un mensaje hace ${hoursSince}h y aún no ha sido respondido.`,
                    type: 'WARNING',
                }
            });
        }

        return {
            success: true,
            message: `${unanswered.length} conversaciones sin respuesta detectadas.`,
            data: {
                count: unanswered.length,
                patients: unanswered.map(p => ({
                    name: p.name,
                    room: p.room,
                    lastMessage: p.familyMessages[0]?.content?.substring(0, 80),
                    sentAt: p.familyMessages[0]?.createdAt.toISOString()
                })),
                notificationsCreated: unanswered.length
            }
        };
    }
}
