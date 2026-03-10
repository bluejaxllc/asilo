
import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { sendWhatsAppAlert } from '@/actions/whatsapp';
import { generateBlueJaxResponse } from '@/lib/bluejax-ai';

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
                type: { in: ['VITALS', 'INCIDENT'] },
                patient: { facilityId: context.facilityId }
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

        const patientData: Record<string, { name: string, room: string | null, logs: any[] }> = {};
        for (const log of recentLogs) {
            if (!log.patient) continue;
            const pid = log.patient.id;
            if (!patientData[pid]) {
                patientData[pid] = { name: log.patient.name, room: log.patient.room, logs: [] };
            }
            patientData[pid].logs.push(log);
        }

        const risksDetected = [];

        for (const [patientId, data] of Object.entries(patientData)) {
            const prompt = `Analiza los siguientes registros clínicos de las últimas 24h para el residente ${data.name}.
Determina si existe algún riesgo clínico basado en signos vitales o incidentes.
Si todo está estable, responde exactamente "SEGURO".
Si hay riesgo moderado, responde "ADVERTENCIA: [Explicación concisa]".
Si hay riesgo severo, responde "CRÍTICO: [Explicación concisa]".
Solo responde con una de estas tres opciones.
Datos JSON: ${JSON.stringify(data.logs)}`;

            try {
                const aiAnalysis = await generateBlueJaxResponse(prompt);
                const response = aiAnalysis.trim().toUpperCase();

                if (response.startsWith('CRÍTICO')) {
                    risksDetected.push({
                        patientId,
                        patientName: data.name,
                        type: 'CRITICAL',
                        trigger: 'AI_CRITICAL_RISK',
                        description: aiAnalysis.replace(/CRÍTICO:|CRÍTICO/i, '').trim() || 'Riesgo Crítico detectado por IA'
                    });
                } else if (response.startsWith('ADVERTENCIA')) {
                    risksDetected.push({
                        patientId,
                        patientName: data.name,
                        type: 'WARNING',
                        trigger: 'AI_WARNING_RISK',
                        description: aiAnalysis.replace(/ADVERTENCIA:|ADVERTENCIA/i, '').trim() || 'Riesgo Moderado detectado por IA'
                    });
                }
            } catch (err) {
                console.error("AI Error analyzing risks for patient", patientId, err);
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
                    patientId: risk.patientId,
                    facilityId: context.facilityId
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
