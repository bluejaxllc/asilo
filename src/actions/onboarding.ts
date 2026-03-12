"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { OnboardingSchema } from "@/schemas";
import { auth } from "@/auth";
import { sendInviteEmail } from "@/lib/mail";

export const completeOnboarding = async (values: z.infer<typeof OnboardingSchema>) => {
    try {
        const session = await auth();
        const userEmail = session?.user?.email;
        const userId = session?.user?.id;
        const facilityId = (session?.user as any)?.facilityId ?? null;

        console.log("[ONBOARDING] Session state:", { userEmail, userId, facilityId });

        if (!facilityId) {
            // Try to get facilityId directly from DB as fallback
            if (userId) {
                const dbUser = await db.user.findUnique({ where: { id: userId }, select: { facilityId: true } });
                if (dbUser?.facilityId) {
                    console.log("[ONBOARDING] Found facilityId from DB fallback:", dbUser.facilityId);
                    return await runOnboarding(values, dbUser.facilityId, userEmail);
                }
            }
            console.error("[ONBOARDING] No facilityId in session or DB. userId:", userId);
            return { error: "No se encontró una residencia asociada. Intenta cerrar sesión y volver a iniciar." };
        }

        return await runOnboarding(values, facilityId, userEmail);
    } catch (e: any) {
        console.error("[ONBOARDING] Error:", e);
        return { error: `Error al guardar: ${e?.message || "error desconocido"}. Intenta de nuevo.` };
    }
};

async function runOnboarding(values: z.infer<typeof OnboardingSchema>, facilityId: string, userEmail?: string | null) {
    const validatedFields = OnboardingSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Campos inválidos." };

    const { facilityName, staffEmails } = validatedFields.data;

    // 1. Update facility name
    await db.facility.update({
        where: { id: facilityId },
        data: { name: facilityName }
    });

    // 2. Send invite emails to staff (same flow as /api/staff)
    const emailResults: string[] = [];
    if (staffEmails && staffEmails.length > 0) {
        // Get facility name for the email template
        const facility = await db.facility.findUnique({
            where: { id: facilityId },
            select: { name: true }
        });
        const fName = facility?.name || facilityName || "Retiro BlueJax";

        for (const email of staffEmails) {
            if (!email || email === userEmail) continue;

            // Check if user already exists
            const existing = await db.user.findUnique({ where: { email } });
            if (existing) {
                emailResults.push(`${email}: ya registrado`);
                continue;
            }

            // Delete any old invite for this email
            await db.inviteToken.deleteMany({ where: { email } });

            // Generate a secure invite token
            const token = randomBytes(32).toString("hex");
            const name = email.split("@")[0];

            // Create the invite token (expires in 72 hours)
            await db.inviteToken.create({
                data: {
                    email,
                    name,
                    token,
                    role: "STAFF",
                    facilityId,
                    expires: new Date(Date.now() + 72 * 60 * 60 * 1000),
                }
            });

            // Send the invitation email
            try {
                await sendInviteEmail(email, name, token, fName);
                emailResults.push(`${email}: invitación enviada ✓`);
            } catch (mailError) {
                console.error("[ONBOARDING] Email send failed for", email, mailError);
                emailResults.push(`${email}: guardado (email fallido)`);
                // Still continue — the invite token is saved, can be resent later
            }
        }
    }

    // 3. Mark onboarding as completed
    await db.facilitySetting.upsert({
        where: {
            facilityId_key: { facilityId, key: "ONBOARDING_COMPLETED" }
        },
        update: { value: "true" },
        create: {
            facilityId,
            key: "ONBOARDING_COMPLETED",
            value: "true"
        }
    });

    // 4. Force Next.js to re-fetch the layout
    revalidatePath("/admin", "layout");

    const summary = emailResults.length > 0
        ? `¡Configuración completada! ${emailResults.join(", ")}`
        : "¡Configuración completada!";

    return { success: summary };
}
