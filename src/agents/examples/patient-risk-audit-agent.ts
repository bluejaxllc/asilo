
import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { sendWhatsAppAlert } from '@/actions/whatsapp';

export class PatientRiskAuditAgent implements Agent {
    id = 'patient-risk-audit';
    name = 'Auditoría de Riesgos Clínicos';
    scheduleDescription = 'Cada 12 horas';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[PatientRiskAuditAgent] Starting clinical risk audit...`);

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Get recent logs of interest
        const recentLogs = await db.dailyLog.findMany({
            where: {
                createdAt: { gte: twentyFourHoursAgo },
                type: { in: ['VITALS', 'INCIDENT'] }
            },
            include: {
                patient: true
            }
        });

        if (recentLogs.length === 0) {
            return {
                success: true,
                message: 'No se encontraron registros clínicos recientes para auditar.',
            };
        }

        const risksDetected = [];

        for (const log of recentLogs) {
            if (!log.patient) continue;

            // 1. Vital Signs Audit (Example: High Blood Pressure)
            if (log.type === 'VITALS' && log.value) {
                // Assuming format like "140/90" or "150/100"
                const matches = log.value.match(/(\d+)\/(\d+)/);
                if (matches) {
                    const systolic = parseInt(matches[1]);
                    const diastolic = parseInt(matches[2]);

                    if (systolic >= 160 || diastolic >= 100) {
                        risksDetected.push({
                            patientId: log.patient.id,
                            patientName: log.patient.name,
                            type: 'CRITICAL',
                            trigger: 'BP_HIGH',
                            description: `Presión arterial crítica detectada: ${log.value} (Hab: ${log.patient.room || 'N/A'})`
                        });
                    } else if (systolic >= 140 || diastolic >= 90) {
                        risksDetected.push({
                            patientId: log.patient.id,
                            patientName: log.patient.name,
                            type: 'WARNING',
                            trigger: 'BP_ELEVATED',
                            description: `Presión arterial elevada: ${log.value} — Se recomienda monitoreo frecuente.`
                        });
                    }
                }
            }

            // 2. Incident Audit
            if (log.type === 'INCIDENT') {
                risksDetected.push({
                    patientId: log.patient.id,
                    patientName: log.patient.name,
                    type: 'WARNING',
                    trigger: 'INCIDENT_DETECTED',
                    description: `Incidente reportado: ${log.notes?.substring(0, 100)}...`
                });
            }
        }

        // De-duplicate risks for the same patient in this run
        const uniqueRisks = Array.from(new Map(risksDetected.map(r => [`${r.patientId}-${r.trigger}`, r])).values());

        // Create system notifications
        for (const risk of uniqueRisks) {
            await db.notification.create({
                data: {
                    title: `${risk.type === 'CRITICAL' ? '🚨' : '⚠️'} Riesgo: ${risk.patientName}`,
                    message: risk.description,
                    type: risk.type,
                    recipientRole: 'ADMIN',
                    patientId: risk.patientId
                }
            });

            // Trigger WhatsApp alert for critical risks
            if (risk.type === 'CRITICAL') {
                await sendWhatsAppAlert(
                    "+521234567890", // Simulated admin number
                    `🚨 ALERTA CRÍTICA: ${risk.patientName}. ${risk.description}`
                );
            }
        }

        return {
            success: true,
            message: `Auditoría completada. ${uniqueRisks.length} riesgos detectados.`,
            data: {
                risks: uniqueRisks,
                count: uniqueRisks.length
            }
        };
    }
}
