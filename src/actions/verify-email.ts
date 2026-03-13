"use server";

import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendInviteEmail } from "@/lib/mail";

/**
 * Verify a user's email using a 6-digit code.
 * On success, creates the actual User + Facility from PendingRegistration data,
 * processes staff invites, and marks onboarding as completed.
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

    // Process staff invites if present (ADMIN registration wizard)
    if (facilityId && pending.staffMembers) {
        try {
            const members: { email: string; role: string }[] = JSON.parse(pending.staffMembers);
            const facilityName = pending.facilityName || `Residencia de ${pending.name}`;

            for (const member of members) {
                if (!member.email || !member.email.includes("@") || member.email === email) continue;

                // Check if user already exists
                const existing = await db.user.findUnique({ where: { email: member.email } });
                if (existing) continue;

                // Delete any old invite for this email
                await db.inviteToken.deleteMany({ where: { email: member.email } });

                // Generate a secure invite token
                const inviteToken = randomBytes(32).toString("hex");
                const name = member.email.split("@")[0];

                // Create invite token (expires in 72 hours)
                await db.inviteToken.create({
                    data: {
                        email: member.email,
                        name,
                        token: inviteToken,
                        role: member.role,
                        facilityId,
                        expires: new Date(Date.now() + 72 * 60 * 60 * 1000),
                    },
                });

                // Send the invitation email
                try {
                    await sendInviteEmail(member.email, name, inviteToken, facilityName);
                    console.log(`[VERIFY] Invite sent to ${member.email}`);
                } catch (mailError) {
                    console.error("[VERIFY] Email send failed for", member.email, mailError);
                }
            }
        } catch (parseError) {
            console.error("[VERIFY] Failed to parse staffMembers:", parseError);
        }
    }

    // Mark onboarding as completed for ADMIN users (they already provided facility name + team in wizard)
    if (facilityId) {
        await db.facilitySetting.upsert({
            where: {
                facilityId_key: { facilityId, key: "ONBOARDING_COMPLETED" }
            },
            update: { value: "true" },
            create: {
                facilityId,
                key: "ONBOARDING_COMPLETED",
                value: "true",
            },
        });
    }

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
