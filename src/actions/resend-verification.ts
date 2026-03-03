"use server";

import { db } from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

/**
 * Resend the verification email for a pending registration.
 */
export async function resendVerification(email: string) {
    if (!email) {
        return { error: "Correo requerido." };
    }

    // Check that a pending registration exists
    const pending = await db.pendingRegistration.findUnique({
        where: { email },
    });

    if (!pending) {
        return { error: "No hay un registro pendiente para este correo. Regístrate primero." };
    }

    // Generate a new token (deletes any old one)
    const verificationToken = await generateVerificationToken(email);

    try {
        await sendVerificationEmail(email, verificationToken.token);
    } catch (error) {
        console.error("[RESEND] Failed to send verification email:", error);
        return { error: "No se pudo enviar el correo. Intenta de nuevo en unos minutos." };
    }

    return { success: "¡Nuevo código enviado! Revisa tu bandeja de entrada." };
}
