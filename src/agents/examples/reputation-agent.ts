
import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';

export class ReputationAgent implements Agent {
    id = 'reputation-audit';
    name = 'Auditor de Reputación Online';
    scheduleDescription = 'Semanal';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[ReputationAgent] Analyzing online reputation...`);

        // Mocking Google Reviews data for demonstration
        const mockReviews = [
            { id: '1', author: 'Maria G.', rating: 5, comment: 'Excelente atención para mi abuelo. El personal es muy profesional.', date: '2026-02-20' },
            { id: '2', author: 'Juan P.', rating: 4, comment: 'Muy buenas instalaciones, aunque a veces tardan en contestar el teléfono.', date: '2026-02-22' },
            { id: '3', author: 'Elena R.', rating: 2, comment: 'La comida podría mejorar, mi madre se queja seguido.', date: '2026-02-23' }
        ];

        const avgRating = mockReviews.reduce((acc, r) => acc + r.rating, 0) / mockReviews.length;

        for (const review of mockReviews) {
            // IA drafts a response based on rating and comment
            let draft = "";
            if (review.rating >= 4) {
                draft = `¡Gracias ${review.author}! Nos alegra mucho saber que ${review.comment.includes('atención') ? 'nuestro equipo' : 'nuestras instalaciones'} cumplieron sus expectativas. Seguiremos trabajando con amor.`;
            } else {
                draft = `Estimada ${review.author}, lamentamos su experiencia. En Retiro BlueJax nos tomamos muy en serio sus comentarios sobre ${review.comment.toLowerCase().includes('comida') ? 'la alimentación' : 'nuestro servicio'}. Un coordinador se pondrá en contacto para resolver esto.`;
            }

            // Create system notification for admin to approve the draft
            await db.notification.create({
                data: {
                    title: `⭐ Reseña de ${review.author} (${review.rating}/5)`,
                    message: `IA Sugiere respuesta: "${draft}"`,
                    type: review.rating < 3 ? 'WARNING' : 'INFO',
                    recipientRole: 'ADMIN'
                }
            });
        }

        return {
            success: true,
            message: `Análisis de reputación completado. Rating promedio: ${avgRating.toFixed(1)}/5.0`,
            data: {
                avgRating,
                totalReviews: mockReviews.length,
                draftsCreated: mockReviews.length
            }
        };
    }
}
