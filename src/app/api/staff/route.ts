import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getLatestTodayAttendance } from "@/actions/attendance";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        const staffUsers = await db.user.findMany({
            where: {
                role: {
                    in: ["STAFF", "DOCTOR", "NURSE", "KITCHEN"]
                },
                name: query ? {
                    contains: query,
                    mode: 'insensitive'
                } : undefined
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
                    statusColor = "bg-green-500/15 text-emerald-300";
                    lastActive = "Entrada: " + formatDistanceToNow(attendance.checkIn, { addSuffix: true, locale: es });
                } else {
                    status = "Turno Finalizado";
                    statusColor = "bg-blue-500/15 text-blue-300";
                    lastActive = "Salida: " + formatDistanceToNow(attendance.checkOut, { addSuffix: true, locale: es });
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

        return NextResponse.json(staffWithStatus);
    } catch (error) {
        console.error('Error fetching staff:', error);
        return NextResponse.json({ error: 'Error fetching staff' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, email, role, password, patientId } = await req.json();

        // Validate required fields
        if (!name || !email || !role || !password) {
            return NextResponse.json(
                { error: 'Todos los campos son requeridos' },
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

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                ...(patientId ? { patientId } : {})
            }
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error creating staff:', error);
        return NextResponse.json({ error: 'Error al crear personal' }, { status: 500 });
    }
}
