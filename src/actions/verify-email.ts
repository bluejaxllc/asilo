"use server";

import { db } from "@/lib/db";

/**
 * Verify a user's email using a 6-digit code.
 * On success, sets emailVerified. User then logs in manually.
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
        return { error: "El código ha expirado. Registra una nueva cuenta." };
    }

    // Find user
    const user = await db.user.findUnique({
        where: { email },
    });

    if (!user) {
        return { error: "Usuario no encontrado." };
    }

    // Mark email as verified
    await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
    });

    // Clean up token
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
