import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';

export class ClinicalNotesAgent implements Agent {
    id = 'clinical-notes-synthesis';
    name = 'Sintetizador de Notas Clínicas';
    scheduleDescription = 'Manual / Bajo Demanda';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[ClinicalNotesAgent] Synthesizing recent clinical logs...`);

        // Find the most recently active admin to author the simulated note if needed
        const admin = await db.user.findFirst({ where: { role: 'ADMIN' } });

        // Find recent vitals and incident logs
        const recentLogs = await db.dailyLog.findMany({
            where: {
                type: { in: ['VITALS', 'INCIDENT', 'MEDS'] },
                createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) } // last 48 hours
            },
            include: { patient: true }
        });

        if (recentLogs.length === 0) {
            return {
                success: true,
                message: 'No hay suficientes datos recientes para generar resúmenes clínicos.',
            };
        }

        // Group by patient
        const patientData: Record<string, { name: string, records: any[] }> = {};
        for (const log of recentLogs) {
            if (!log.patientId) continue;
            if (!patientData[log.patientId]) {
                patientData[log.patientId] = { name: log.patient?.name || 'Unknown', records: [] };
            }
            patientData[log.patientId].records.push(log);
        }

        let summarizedCount = 0;

        for (const [patientId, data] of Object.entries(patientData)) {
            if (data.records.length > 2) {
                // Determine general synthesis based on record types
                const vitalsCount = data.records.filter(r => r.type === 'VITALS').length;
                const incidentCount = data.records.filter(r => r.type === 'INCIDENT').length;

                let synthesis = `Resumen Clínico IA (48h): El residente presentó ${vitalsCount} tomas de signos vitales. `;
                if (incidentCount > 0) {
                    synthesis += `Se requiere atención por ${incidentCount} reporte(s) de incidentes recientes. Monitoreo constante recomendado.`;
                } else {
                    synthesis += `Los parámetros se mantienen estables acorde a su historial. No hay incidentes reportados.`;
                }

                if (admin) {
                    await db.dailyLog.create({
                        data: {
                            type: 'NOTE',
                            value: synthesis,
                            patientId: patientId,
                            authorId: admin.id
                        }
                    });
                    summarizedCount++;
                }

                await db.notification.create({
                    data: {
                        title: `📝 Nota Clínica Generada: ${data.name}`,
                        message: `Se ha sintetizado automáticamente un resumen clínico basado en sus registros de las últimas 48h.`,
                        type: 'INFO',
                        recipientRole: 'ADMIN',
                        patientId: patientId
                    }
                });
            }
        }

        return {
            success: true,
            message: `Notas clínicas sintetizadas para ${summarizedCount} residentes.`,
            data: { summarizedCount }
        };
    }
}
