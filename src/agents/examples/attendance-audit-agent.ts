
import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';
import { generateBlueJaxResponse } from '@/lib/bluejax-ai';

export class AttendanceAuditAgent implements Agent {
    id = 'attendance-audit';
    name = 'Auditoría de Asistencia';
    scheduleDescription = 'Diario a las 22:00';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[AttendanceAuditAgent] Checking unresolved attendance...`);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find attendance records from today with no check-out
        const openAttendance = await db.attendance.findMany({
            where: {
                createdAt: { gte: today },
                checkOut: null,
                user: { facilityId: context.facilityId }
            },
            include: {
                user: { select: { name: true, email: true, role: true } }
            }
        });

        if (openAttendance.length === 0) {
            return {
                success: true,
                message: 'Todo el personal ha registrado su salida hoy.',
            };
        }

        // Create notifications for each unresolved attendance
        for (const record of openAttendance) {
            const checkInTime = record.checkIn.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const prompt = `Actúa como BlueJax, el asistente de RRHH del Asilo.
Genera un mensaje de alerta amistoso pero profesional (máximo 2 oraciones) dirigido al administrador indicando que el siguiente empleado olvidó registrar su salida de turno hoy.
Empleado: ${record.user.name || record.user.email} (Rol: ${record.user.role})
Hora de registro de entrada: ${checkInTime}
IMPORTANTE: Responde solo con el texto del mensaje, sin comillas ni markdown.`;

            let aiMessage = `${record.user.name || record.user.email} (${record.user.role}) registró entrada a las ${checkInTime} pero no ha marcado salida.`;
            try {
                aiMessage = await generateBlueJaxResponse(prompt);
            } catch (err) {
                console.error("AI Error generating attendance reminder", err);
            }

            await db.notification.create({
                data: {
                    title: `🕐 Salida pendiente: ${record.user.name || record.user.email}`,
                    message: aiMessage,
                    type: 'WARNING',
                    facilityId: context.facilityId,
                }
            });
        }

        const staffNames = openAttendance.map(a => a.user.name || a.user.email).join(', ');

        return {
            success: true,
            message: `${openAttendance.length} personal sin registrar salida.`,
            data: {
                count: openAttendance.length,
                staff: openAttendance.map(a => ({
                    name: a.user.name,
                    email: a.user.email,
                    role: a.user.role,
                    checkIn: a.checkIn.toISOString()
                })),
                summary: staffNames,
                notificationsCreated: openAttendance.length
            }
        };
    }
}
