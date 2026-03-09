import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { generateBlueJaxResponse } from '@/lib/bluejax-ai';

export class TourBookingAgent implements Agent {
    id = 'tour-booking';
    name = 'Agenda Inteligente de Tours';
    scheduleDescription = 'Manual / Bajo Demanda';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[TourBookingAgent] Analyzing occupancy for tour scheduling...`);

        // Get occupancy data
        const patients = await db.patient.findMany({
            select: { room: true, status: true },
        });

        const totalPatients = patients.length;
        const rooms = new Set(patients.map(p => p.room).filter(Boolean));
        const occupiedRooms = rooms.size;

        // Check for recent inquiry-like notifications
        const recentInquiries = await db.notification.count({
            where: {
                createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                title: { contains: 'tour', mode: 'insensitive' as any },
            },
        });

        // Calculate best tour days (avoid peak care hours)
        const statusBreakdown = patients.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        let recommendations: string;
        try {
            const prompt = `Actúa como BlueJax, el coordinador de admisiones del Asilo.
Datos actuales: ${totalPatients} residentes en ${occupiedRooms} habitaciones.
Estado de residentes: ${Object.entries(statusBreakdown).map(([k, v]) => `${k}: ${v}`).join(', ')}.
Consultas recientes sobre tours: ${recentInquiries}.

Genera recomendaciones de horarios para tours de familias interesadas:
1. Mejores 3 horarios de la semana (evita horas pico de medicación 8-9am y 7-8pm)
2. Duración recomendada del tour
3. Áreas a destacar según la ocupación actual
Máximo 4 oraciones.`;

            recommendations = await generateBlueJaxResponse(prompt);
        } catch {
            recommendations = `Horarios recomendados: Martes y Jueves 10:00-11:30, Sábado 15:00-16:30. Duración: 45 min. Capacidad disponible para nuevos residentes.`;
        }

        await db.notification.create({
            data: {
                title: `📅 Agenda de Tours Optimizada`,
                message: recommendations,
                type: 'INFO',
                recipientRole: 'ADMIN',
            },
        });

        return {
            success: true,
            message: recommendations,
            data: {
                totalPatients,
                occupiedRooms,
                statusBreakdown,
                recentInquiries,
                recommendations,
            },
        };
    }
}
