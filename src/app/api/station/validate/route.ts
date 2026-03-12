import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST: Validate a station pairing code
export async function POST(req: Request) {
    try {
        const { code } = await req.json();

        if (!code || typeof code !== "string") {
            return NextResponse.json({ error: "Código requerido" }, { status: 400 });
        }

        const station = await db.station.findUnique({
            where: { code },
            include: {
                facility: { select: { id: true, name: true } },
            },
        });

        if (!station || !station.isActive) {
            return NextResponse.json({ error: "Código de estación inválido o desactivado" }, { status: 404 });
        }

        return NextResponse.json({
            stationId: station.id,
            stationName: station.name,
            facilityId: station.facility.id,
            facilityName: station.facility.name,
        });
    } catch (error) {
        console.error("[STATION_VALIDATE]", error);
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
    }
}
