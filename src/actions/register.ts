"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { RegisterSchema } from "@/schemas";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Campos inválidos!" };
    }

    const { email, password, name, role, plan, facilityName } = validatedFields.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await db.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        return { error: "Este correo ya está en uso!" };
    }

    // New signups default to ADMIN (facility owner); internal staff use role param
    const userRole = role || (plan ? "ADMIN" : "STAFF");

    // Create a Facility for new admin registrations
    let facilityId: string | undefined;
    if (userRole === "ADMIN") {
        const facility = await db.facility.create({
            data: {
                name: facilityName || `Residencia de ${name}`,
                plan: plan || "FREE",
            },
        });
        facilityId = facility.id;
    }

    await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: userRole,
            facilityId,
        },
    });

    // Generate verification token and send email
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(email, verificationToken.token);

    return { success: "¡Correo de verificación enviado! Revisa tu bandeja de entrada." };
};
