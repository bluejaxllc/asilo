import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST: Log an action from a station (vitals, food, hygiene, incident, attendance)
export async function POST(req: Request) {
    try {
        const { userId, facilityId, type, patientId, notes, value } = await req.json();

        if (!userId || !facilityId || !type) {
            return NextResponse.json({ error: "userId, facilityId y type son requeridos" }, { status: 400 });
        }

        // Verify user belongs to facility
        const user = await db.user.findFirst({
            where: { id: userId, facilityId },
            select: { id: true, name: true },
        });

        if (!user) {
            return NextResponse.json({ error: "Usuario no autorizado" }, { status: 403 });
        }

        // Handle attendance separately
        if (type === "ATTENDANCE_IN") {
            const attendance = await db.attendance.create({
                data: { userId },
            });
            return NextResponse.json({ success: true, id: attendance.id, message: `${user.name} registró entrada` });
        }

        if (type === "ATTENDANCE_OUT") {
            // Find latest open attendance record
            const openRecord = await db.attendance.findFirst({
                where: { userId, checkOut: null },
                orderBy: { checkIn: "desc" },
            });

            if (openRecord) {
                await db.attendance.update({
                    where: { id: openRecord.id },
                    data: { checkOut: new Date() },
                });
                return NextResponse.json({ success: true, message: `${user.name} registró salida` });
            }
            return NextResponse.json({ error: "No hay entrada abierta" }, { status: 400 });
        }

        // Create a DailyLog for other types (VITALS, FOOD, HYGIENE, INCIDENT)
        const log = await db.dailyLog.create({
            data: {
                type,
                notes: notes || null,
                value: value || null,
                patientId: patientId || null,
                authorId: userId,
            },
        });

        return NextResponse.json({ success: true, id: log.id, message: "Registro guardado" });
    } catch (error) {
        console.error("[STATION_LOG]", error);
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
    }
}

// GET: Fetch patients for a facility (used by station to show patient lists)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const facilityId = searchParams.get("facilityId");

        if (!facilityId) {
            return NextResponse.json({ error: "facilityId requerido" }, { status: 400 });
        }

        const patients = await db.patient.findMany({
            where: { facilityId },
            select: { id: true, name: true, room: true, status: true },
            orderBy: { name: "asc" },
        });

        return NextResponse.json(patients);
    } catch (error) {
        console.error("[STATION_LOG_GET]", error);
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
    }
}
