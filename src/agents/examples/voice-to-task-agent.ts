import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { generateBlueJaxResponse } from '@/lib/bluejax-ai';

export class VoiceToTaskAgent implements Agent {
    id = 'voice-to-task';
    name = 'Transcripción de Voz a Tarea';
    scheduleDescription = 'Manual / Bajo Demanda';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[VoiceToTaskAgent] Processing recent notes for task extraction...`);

        // Find recent DailyLog entries with type NOTE that might contain actionable items
        const since = new Date();
        since.setHours(since.getHours() - 12);

        const recentNotes = await db.dailyLog.findMany({
            where: {
                type: 'NOTE',
                createdAt: { gte: since },
                notes: { not: null },
                patient: { facilityId: context.facilityId },
            },
            include: {
                patient: { select: { id: true, name: true } },
                author: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        if (recentNotes.length === 0) {
            return {
                success: true,
                message: 'Sin notas recientes para procesar.',
                data: { processed: 0, tasksCreated: 0 },
            };
        }

        const noteTexts = recentNotes
            .filter(n => n.notes && n.notes.length > 10)
            .map(n => ({
                id: n.id,
                patientId: n.patientId,
                patientName: n.patient?.name || 'N/A',
                authorId: n.authorId,
                text: n.notes!,
            }));

        if (noteTexts.length === 0) {
            return {
                success: true,
                message: 'Notas recientes demasiado cortas para extraer tareas.',
                data: { processed: 0, tasksCreated: 0 },
            };
        }

        let tasksCreated = 0;

        try {
            const prompt = `Actúa como un asistente administrativo de un asilo de ancianos.
Analiza las siguientes notas clínicas y extrae SOLO las tareas accionables explícitamente mencionadas.

${noteTexts.map(n => `- Paciente "${n.patientName}": "${n.text}"`).join('\n')}

Responde SOLO en formato JSON así (sin explicación adicional):
[{"patientIndex": 0, "task": "descripción breve de la tarea", "priority": "NORMAL|HIGH|URGENT"}]
Si no hay tareas accionables, responde: []`;

            const response = await generateBlueJaxResponse(prompt);

            // Try to parse JSON from the AI response
            const jsonMatch = response.match(/\[[\s\S]*?\]/);
            if (jsonMatch) {
                const tasks = JSON.parse(jsonMatch[0]) as Array<{
                    patientIndex: number;
                    task: string;
                    priority: string;
                }>;

                for (const t of tasks) {
                    const note = noteTexts[t.patientIndex];
                    if (!note) continue;

                    await db.task.create({
                        data: {
                            title: t.task,
                            priority: ['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(t.priority) ? t.priority : 'NORMAL',
                            status: 'PENDING',
                            patientId: note.patientId || undefined,
                            assignedToId: note.authorId,
                        },
                    });
                    tasksCreated++;
                }
            }
        } catch (err) {
            console.error('[VoiceToTaskAgent] AI parsing error:', err);
        }

        const message = tasksCreated > 0
            ? `Se extrajeron ${tasksCreated} tareas de ${noteTexts.length} notas clínicas.`
            : `Se analizaron ${noteTexts.length} notas. No se encontraron tareas accionables.`;

        if (tasksCreated > 0) {
            await db.notification.create({
                data: {
                    title: `📋 Tareas Extraídas de Notas`,
                    message,
                    type: 'INFO',
                    recipientRole: 'STAFF',
                    facilityId: context.facilityId,
                },
            });
        }

        return {
            success: true,
            message,
            data: { processed: noteTexts.length, tasksCreated },
        };
    }
}
