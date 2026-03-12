import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST: Authenticate a staff member via 4-digit PIN
export async function POST(req: Request) {
    try {
        const { pin, facilityId } = await req.json();

        if (!pin || !facilityId) {
            return NextResponse.json({ error: "PIN y facilityId requeridos" }, { status: 400 });
        }

        const user = await db.user.findFirst({
            where: {
                pin,
                facilityId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
        }

        return NextResponse.json({
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error("[STATION_PIN_LOGIN]", error);
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
    }
}
