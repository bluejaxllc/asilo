"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { OnboardingSchema } from "@/schemas";
import { auth } from "@/auth";

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

    // 2. Create staff accounts with random passwords
    if (staffEmails && staffEmails.length > 0) {
        const crypto = await import('crypto');
        for (const email of staffEmails) {
            if (!email || email === userEmail) continue;

            const existing = await db.user.findUnique({ where: { email } });
            if (!existing) {
                const randomPassword = crypto.randomBytes(16).toString('hex');
                const hashedPassword = await bcrypt.hash(randomPassword, 10);
                await db.user.create({
                    data: {
                        email,
                        name: email.split("@")[0],
                        role: "STAFF",
                        password: hashedPassword,
                        facilityId
                    }
                });
            } else if (!existing.facilityId) {
                // User exists but has no facility, assign them
                await db.user.update({
                    where: { email },
                    data: { facilityId, role: "STAFF" }
                });
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

    return { success: "¡Configuración completada!" };
}
