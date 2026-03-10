
import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { generateBlueJaxResponse } from '@/lib/bluejax-ai';

export class TrendAnalysisAgent implements Agent {
    id = 'trend-analysis';
    name = 'Analista de Tendencias Predictivas';
    scheduleDescription = 'Diario';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[TrendAnalysisAgent] Analyzing health trends for last 7 days...`);

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Fetch all vital logs for the last 7 days
        const logs = await db.dailyLog.findMany({
            where: {
                type: 'VITALS',
                createdAt: { gte: sevenDaysAgo },
                patient: { facilityId: context.facilityId }
            },
            include: { patient: true },
            orderBy: { createdAt: 'asc' }
        });

        // Group logs by patient
        const patientTrends: Record<string, { name: string, data: any[] }> = {};
        for (const log of logs) {
            if (!log.patientId) continue;
            if (!patientTrends[log.patientId]) {
                patientTrends[log.patientId] = { name: log.patient?.name || 'Unknown', data: [] };
            }
            patientTrends[log.patientId].data.push(log);
        }

        let findingsCount = 0;

        for (const [id, trend] of Object.entries(patientTrends)) {
            if (trend.data.length >= 3) {
                const prompt = `Analiza los siguientes signos vitales de los últimos 7 días para el residente ${trend.name}. 
Busca tendencias peligrosas (ej. presión arterial subiendo consistentemente, pérdida de peso, fiebre recurrente).
Si NO hay tendencias preocupantes, responde exactamente con la palabra "NINGUNA".
Si hay una tendencia preocupante, responde con un mensaje de alerta corto y conciso (máximo 2 oraciones) explicando la anomalía.
Datos JSON: ${JSON.stringify(trend.data)}`;

                try {
                    const aiAnalysis = await generateBlueJaxResponse(prompt);

                    if (aiAnalysis && !aiAnalysis.toUpperCase().includes("NINGUNA") && aiAnalysis.trim() !== "") {
                        findingsCount++;
                        await db.notification.create({
                            data: {
                                title: `📈 Alerta Predictiva IA: ${trend.name}`,
                                message: aiAnalysis.trim(),
                                type: 'WARNING',
                                recipientRole: 'ADMIN',
                                patientId: id,
                                facilityId: context.facilityId
                            }
                        });
                    }
                } catch (err) {
                    console.error("AI Error analyzing trends for patient", id, err);
                }
            }
        }

        return {
            success: true,
            message: findingsCount > 0
                ? `${findingsCount} tendencias predictivas detectadas.`
                : "No se detectaron anomalías de tendencia en los últimos 7 días.",
            data: { findingsCount }
        };
    }
}
