"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const AcceptInviteSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

/**
 * Validate an invite token and return the invitation info.
 */
export async function validateInviteToken(token: string) {
    try {
        const invite = await db.inviteToken.findUnique({
            where: { token },
        });

        if (!invite) {
            return { error: "Invitación no encontrada o ya fue utilizada." };
        }

        if (new Date() > invite.expires) {
            // Clean up expired token
            await db.inviteToken.delete({ where: { id: invite.id } });
            return { error: "Esta invitación ha expirado. Solicita una nueva." };
        }

        return {
            success: true,
            invite: {
                name: invite.name,
                email: invite.email,
                role: invite.role,
            },
        };
    } catch (error) {
        console.error("[ACCEPT_INVITE] Validate error:", error);
        return { error: "Error al validar la invitación." };
    }
}

/**
 * Accept an invitation: create the real User, delete the token.
 */
export async function acceptInvite(token: string, password: string) {
    try {
        const parsed = AcceptInviteSchema.safeParse({ token, password });
        if (!parsed.success) {
            return { error: parsed.error.issues[0]?.message || "Invalid input" };
        }

        const invite = await db.inviteToken.findUnique({
            where: { token },
        });

        if (!invite) {
            return { error: "Invitación no encontrada o ya fue utilizada." };
        }

        if (new Date() > invite.expires) {
            await db.inviteToken.delete({ where: { id: invite.id } });
            return { error: "Esta invitación ha expirado." };
        }

        // Check if user already exists with this email
        const existingUser = await db.user.findUnique({
            where: { email: invite.email },
        });

        if (existingUser) {
            await db.inviteToken.delete({ where: { id: invite.id } });
            return { error: "Este correo ya está registrado. Inicia sesión directamente." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the real user
        await db.user.create({
            data: {
                name: invite.name,
                email: invite.email,
                password: hashedPassword,
                role: invite.role,
                facilityId: invite.facilityId,
                emailVerified: new Date(), // auto-verify since they clicked the invite link
                ...(invite.patientId ? { patientId: invite.patientId } : {}),
            },
        });

        // Delete the used token
        await db.inviteToken.delete({ where: { id: invite.id } });

        return { success: true };
    } catch (error) {
        console.error("[ACCEPT_INVITE] Error:", error);
        return { error: "Error al aceptar la invitación." };
    }
}
