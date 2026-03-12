import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

// POST: Set or update a staff member's PIN
export async function POST(req: Request) {
    try {
        const session = await auth();
        const facilityId = (session?.user as any)?.facilityId;
        const role = (session?.user as any)?.role;

        if (!facilityId || role !== "ADMIN") {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        const { userId, pin } = await req.json();

        if (!userId || !pin) {
            return NextResponse.json({ error: "userId y PIN requeridos" }, { status: 400 });
        }

        if (!/^\d{4}$/.test(pin)) {
            return NextResponse.json({ error: "El PIN debe ser de 4 dígitos" }, { status: 400 });
        }

        // Check PIN uniqueness within facility
        const existing = await db.user.findFirst({
            where: { pin, facilityId, NOT: { id: userId } },
        });

        if (existing) {
            return NextResponse.json({ error: "Este PIN ya está en uso por otro miembro" }, { status: 409 });
        }

        // Verify user belongs to facility
        const user = await db.user.findFirst({
            where: { id: userId, facilityId },
        });

        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado en esta residencia" }, { status: 404 });
        }

        await db.user.update({
            where: { id: userId },
            data: { pin },
        });

        return NextResponse.json({ success: true, message: `PIN actualizado para ${user.name}` });
    } catch (error) {
        console.error("[ADMIN_PINS_POST]", error);
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
    }
}
