"use server";

import { db } from "@/lib/db";

/**
 * Verify a user's email using a 6-digit code.
 * On success, creates the actual User + Facility from PendingRegistration data.
 */
export async function verifyEmail(email: string, code: string) {
    if (!email || !code) {
        return { error: "Correo y código son requeridos." };
    }

    // Find the token
    const token = await db.verificationToken.findFirst({
        where: { identifier: email, token: code },
    });

    if (!token) {
        return { error: "Código inválido." };
    }

    // Check expiry
    if (new Date() > token.expires) {
        await db.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: token.identifier,
                    token: token.token,
                },
            },
        });
        return { error: "El código ha expirado. Solicita un nuevo código." };
    }

    // Find pending registration
    const pending = await db.pendingRegistration.findUnique({
        where: { email },
    });

    if (!pending) {
        return { error: "No se encontró un registro pendiente para este correo." };
    }

    // Check if user already exists (edge case: verified twice)
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
        // Clean up
        await db.pendingRegistration.delete({ where: { email } });
        await db.verificationToken.delete({
            where: { identifier_token: { identifier: token.identifier, token: token.token } },
        });
        return { success: "¡Cuenta ya verificada! Ya puedes iniciar sesión." };
    }

    // Create Facility for ADMIN users
    let facilityId: string | undefined;
    if (pending.role === "ADMIN") {
        const facility = await db.facility.create({
            data: {
                name: pending.facilityName || `Residencia de ${pending.name}`,
                plan: pending.plan || "FREE",
            },
        });
        facilityId = facility.id;
    }

    // Create the actual User
    await db.user.create({
        data: {
            email: pending.email,
            name: pending.name,
            password: pending.hashedPassword,
            role: pending.role,
            emailVerified: new Date(),
            facilityId,
        },
    });

    // Clean up pending registration and token
    await db.pendingRegistration.delete({ where: { email } });
    await db.verificationToken.delete({
        where: {
            identifier_token: {
                identifier: token.identifier,
                token: token.token,
            },
        },
    });

    return { success: "¡Cuenta verificada! Ya puedes iniciar sesión." };
}
