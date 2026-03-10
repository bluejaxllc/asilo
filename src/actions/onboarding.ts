"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { getCurrentFacilityId } from "@/lib/facility";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { OnboardingSchema } from "@/schemas";
import { auth } from "@/auth";

export const completeOnboarding = async (values: z.infer<typeof OnboardingSchema>) => {
    try {
        const facilityId = await getCurrentFacilityId();
        if (!facilityId) return { error: "No autorizado." };

        const session = await auth();
        const userEmail = session?.user?.email;

        const validatedFields = OnboardingSchema.safeParse(values);
        if (!validatedFields.success) return { error: "Campos inválidos." };

        const { facilityName, staffEmails } = validatedFields.data;

        // 1. Update facility name
        await db.facility.update({
            where: { id: facilityId },
            data: { name: facilityName }
        });

        // 2. Create staff accounts with random passwords (they'll use invite flow to set their own)
        if (staffEmails && staffEmails.length > 0) {
            const crypto = await import('crypto');
            for (const email of staffEmails) {
                if (!email || email === userEmail) continue;

                // Check if exists
                const existing = await db.user.findUnique({ where: { email } });
                if (!existing) {
                    // Generate a cryptographically random password (user will never know this)
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
                }
            }
        }

        // 3. Mark onboarding as completed in FacilitySettings
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
    } catch (e) {
        console.error("Onboarding error:", e);
        return { error: "Ocurrió un error al guardar la configuración." };
    }
};
