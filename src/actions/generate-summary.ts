"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/role-guard";
import { revalidatePath } from "next/cache";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { sendGhlWebhook } from "@/lib/whatsapp";

export const generatePatientSummary = async (patientId: string) => {
    const roleCheck = await requireRole("ADMIN", "DOCTOR", "NURSE");
    if ("error" in roleCheck) return { error: roleCheck.error };

    try {
        const patient = await db.patient.findUnique({
            where: { id: patientId },
            include: {
                logs: {
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // last 7 days
                        }
                    },
                    orderBy: { createdAt: "desc" }
                },
                medications: {
                    include: { medication: true }
                }
            }
        });

        if (!patient) return { error: "Paciente no encontrado." };

        if (!patient.logs || patient.logs.length === 0) {
            return { error: "No hay suficientes registros en los últimos 7 días para generar un resumen." };
        }

        // Prepare data prompt
        let promptData = `Paciente: ${patient.name}\nEdad: ${patient.age || "N/A"}\nHistorial Medico: ${patient.medicalHistory || "N/A"}\nDieta: ${patient.dietaryNeeds || "N/A"}\n\n`;

        promptData += "--- MEDICAMENTOS ACTUALES ---\n";
        patient.medications.forEach(pm => {
            promptData += `- ${pm.medication.name}: ${pm.dosage} (${pm.schedule || "Sin horario especifico"})\n`;
        });

        promptData += "\n--- REGISTROS DE LOS ULTIMOS 7 DIAS ---\n";
        patient.logs.forEach(log => {
            promptData += `[${new Date(log.createdAt).toLocaleString("es-MX")}] TIPO: ${log.type}. VALOR: ${log.value || "N/A"}. NOTAS: ${log.notes || "N/A"}\n`;
        });

        // Use standard generateObject to strictly enforce JSON output
        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            system: `Eres un asistente médico experto en geriatría en la residencia BlueJax. Tu trabajo es analizar bitácoras diarias (signos vitales, alimentación, actividad) e identificar tendencias, riesgos o mejoras en la salud del residente. Tu análisis debe ser conciso, profesional y directo.
Reglas:
1. Evalúa el 'riskLevel' (nivel de riesgo) general basándote en anomalías reportadas o incidentes repetitivos.
2. Extrae 'keyFindings' (hallazgos clave) relevantes: tendencias en presión arterial, glucosa alterada, disminución del apetito, caídas, etc.
3. Proporciona 'recommendations' (recomendaciones de acción explícitas) que el personal médico o de cuidado debería realizar.
4. Responde en español de México.`,
            prompt: `Analiza la siguiente información clínica y bitácoras de los últimos 7 días y devuelve un reporte estructurado:\n\n${promptData}`,
            schema: z.object({
                riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).describe("Nivel de riesgo clínico actual"),
                content: z.string().describe("Un resumen clínico en prosa (3-4 oraciones) describiendo el estado general, tendencias y riesgos."),
                recommendations: z.array(z.string()).describe("Acciones específicas sugeridas para enfermería o médicos (ej. 'Monitorear glucosa post-prandial por 3 días').")
            }),
        });

        const summary = await db.patientSummary.create({
            data: {
                patientId: patient.id,
                content: object.content,
                riskLevel: object.riskLevel,
                recommendations: JSON.stringify(object.recommendations),
                generatedBy: "Gemini 2.5 Flash"
            }
        });

        // Trigger webhook if risk is HIGH
        if (object.riskLevel === "HIGH") {
            await sendGhlWebhook({
                type: "HIGH_RISK_SUMMARY",
                patientId: patient.id,
                patientName: patient.name,
                message: object.content,
                details: { riskLevel: "HIGH", recommendations: object.recommendations }
            });
        }

        revalidatePath(`/admin/patients/${patient.id}`);
        return { success: summary };

    } catch (error) {
        console.error("AI Summary generation error:", error);
        return { error: "Hubo un error al generar el resumen de IA. Verifica los logs de la consola." };
    }
};
