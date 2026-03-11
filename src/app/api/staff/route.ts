import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getLatestTodayAttendance } from "@/actions/attendance";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { auth } from "@/auth";
import { randomBytes } from "crypto";
import { sendInviteEmail } from "@/lib/mail";

export async function GET(request: Request) {
    try {
        const session = await auth();
        const facilityId = (session?.user as any)?.facilityId ?? null;

        if (!facilityId) {
            return NextResponse.json([]);
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        const staffUsers = await db.user.findMany({
            where: {
                facilityId,
                ...(query ? {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { role: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } },
                    ]
                } : {})
            },
            orderBy: { name: 'asc' }
        });

        const staffWithStatus = await Promise.all(staffUsers.map(async (user) => {
            const attendance = await getLatestTodayAttendance(user.id);

            let status = "Fuera de Turno";
            let statusColor = "bg-muted/60 text-foreground";
            let lastActive = "N/A";

            if (attendance) {
                if (!attendance.checkOut) {
                    status = "Activo";
                    statusColor = "bg-green-500/15 text-emerald-700 dark:text-emerald-300";
                    lastActive = "Entrada: " + formatDistanceToNow(attendance.checkIn, { addSuffix: true, locale: es });
                } else {
                    status = "Turno Finalizado";
                    statusColor = "bg-blue-500/15 text-blue-700 dark:text-blue-300";
                    lastActive = "Salida: " + formatDistanceToNow(attendance.checkOut, { addSuffix: true, locale: es });
                }
            } else {
                // No attendance today — look for the most recent attendance ever
                const lastAttendance = await db.attendance.findFirst({
                    where: { userId: user.id },
                    orderBy: { createdAt: 'desc' },
                });

                if (lastAttendance) {
                    const refDate = lastAttendance.checkOut || lastAttendance.checkIn;
                    lastActive = formatDistanceToNow(refDate, { addSuffix: true, locale: es });
                } else {
                    status = "Inactivo";
                    statusColor = "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400";
                    lastActive = "Sin registros";
                }
            }

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status,
                statusColor,
                lastActive
            };
        }));

        // Also fetch pending invitations for this facility
        const pendingInvites = await db.inviteToken.findMany({
            where: {
                facilityId,
                expires: { gt: new Date() }, // not expired
                ...(query ? {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' as const } },
                        { role: { contains: query, mode: 'insensitive' as const } },
                        { email: { contains: query, mode: 'insensitive' as const } },
                    ]
                } : {})
            },
            orderBy: { createdAt: 'desc' }
        });

        const pendingStaff = pendingInvites.map(invite => ({
            id: `invite-${invite.id}`,
            name: invite.name,
            email: invite.email,
            role: invite.role,
            status: "Invitación Pendiente",
            statusColor: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
            lastActive: "Invitado — esperando aceptación",
            isPending: true,
        }));

        return NextResponse.json([...staffWithStatus, ...pendingStaff]);
    } catch (error) {
        console.error('Error fetching staff:', error);
        return NextResponse.json({ error: 'Error fetching staff' }, { status: 500 });
    }
}

import { requireRole } from "@/lib/role-guard";

export async function POST(req: Request) {
    try {
        const check = await requireRole("ADMIN");
        if ("error" in check) {
            return NextResponse.json({ error: check.error }, { status: 403 });
        }

        const session = await auth();
        const facilityId = (session?.user as any)?.facilityId ?? null;

        const { name, email, role, patientId } = await req.json();

        // Validate required fields (password no longer required — magic link!)
        if (!name || !email || !role) {
            return NextResponse.json(
                { error: 'Nombre, correo y rol son requeridos' },
                { status: 400 }
            );
        }

        // Validate patientId for FAMILY role
        if (role === 'FAMILY' && !patientId) {
            return NextResponse.json(
                { error: 'Debe vincular un residente al familiar' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Este correo ya está registrado' },
                { status: 400 }
            );
        }

        // Check if there's already a pending invite for this email
        const existingInvite = await db.inviteToken.findFirst({
            where: { email }
        });

        if (existingInvite) {
            // Delete old invite and create a fresh one
            await db.inviteToken.delete({ where: { id: existingInvite.id } });
        }

        // Generate a secure random token
        const token = randomBytes(32).toString("hex");

        // Create the invite token (expires in 72 hours)
        await db.inviteToken.create({
            data: {
                email,
                name,
                token,
                role,
                facilityId,
                patientId: patientId || null,
                expires: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72h
            }
        });

        // Get facility name for the email
        const facility = await db.facility.findUnique({
            where: { id: facilityId },
            select: { name: true }
        });

        // Send the invitation email
        try {
            await sendInviteEmail(email, name, token, facility?.name || "Retiro BlueJax");
        } catch (mailError) {
            console.error("[STAFF_INVITE] Email send failed:", mailError);
            // Still return success — the invite is saved, admin can resend later
        }

        return NextResponse.json({
            success: true,
            message: `Invitación enviada a ${email}`,
        });
    } catch (error) {
        console.error('Error creating staff invite:', error);
        return NextResponse.json({ error: 'Error al enviar invitación' }, { status: 500 });
    }
}
