
import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';

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

            await db.notification.create({
                data: {
                    title: `🕐 Salida pendiente: ${record.user.name || record.user.email}`,
                    message: `${record.user.name || record.user.email} (${record.user.role}) registró entrada a las ${checkInTime} pero no ha marcado salida.`,
                    type: 'WARNING',
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
