import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { randomInt } from "crypto";

// GET: List stations for the current facility
export async function GET() {
    try {
        const session = await auth();
        const facilityId = (session?.user as any)?.facilityId;
        const role = (session?.user as any)?.role;

        if (!facilityId || role !== "ADMIN") {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        const stations = await db.station.findMany({
            where: { facilityId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(stations);
    } catch (error) {
        console.error("[ADMIN_STATIONS_GET]", error);
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
    }
}

// POST: Create a new station
export async function POST(req: Request) {
    try {
        const session = await auth();
        const facilityId = (session?.user as any)?.facilityId;
        const role = (session?.user as any)?.role;

        if (!facilityId || role !== "ADMIN") {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        const { name } = await req.json();
        if (!name) {
            return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
        }

        // Generate unique 6-digit code
        let code: string;
        let exists = true;
        do {
            code = String(randomInt(100000, 999999));
            const found = await db.station.findUnique({ where: { code } });
            exists = !!found;
        } while (exists);

        const station = await db.station.create({
            data: { name, code, facilityId },
        });

        return NextResponse.json(station, { status: 201 });
    } catch (error) {
        console.error("[ADMIN_STATIONS_POST]", error);
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
    }
}

// DELETE: Deactivate a station
export async function DELETE(req: Request) {
    try {
        const session = await auth();
        const facilityId = (session?.user as any)?.facilityId;
        const role = (session?.user as any)?.role;

        if (!facilityId || role !== "ADMIN") {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const stationId = searchParams.get("id");

        if (!stationId) {
            return NextResponse.json({ error: "ID requerido" }, { status: 400 });
        }

        await db.station.update({
            where: { id: stationId },
            data: { isActive: false },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[ADMIN_STATIONS_DELETE]", error);
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
    }
}
