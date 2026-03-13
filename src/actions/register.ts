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

    const { email, password, name, role, plan, facilityName, staffMembers } = validatedFields.data;

    // Check if a verified user already exists
    const existingUser = await db.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        return { error: "Este correo ya está en uso!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Public signups are always ADMIN (facility owner) unless explicitly STAFF. 
    // We strictly block SUPER_ADMIN escalation from the public endpoint.
    const userRole = (role === "STAFF") ? "STAFF" : "ADMIN";

    // Upsert into PendingRegistration (replaces any previous unverified attempt)
    await db.pendingRegistration.upsert({
        where: { email },
        update: {
            name,
            hashedPassword,
            role: userRole,
            facilityName: facilityName || null,
            plan: plan || null,
            staffMembers: staffMembers || null,
        },
        create: {
            email,
            name,
            hashedPassword,
            role: userRole,
            facilityName: facilityName || null,
            plan: plan || null,
            staffMembers: staffMembers || null,
        },
    });

    // Generate verification token and send email
    const verificationToken = await generateVerificationToken(email);

    try {
        await sendVerificationEmail(email, verificationToken.token);
    } catch (error) {
        console.error("[REGISTER] Failed to send verification email:", error);
        return { success: "Cuenta pendiente. No pudimos enviar el correo — usa el botón de reenviar." };
    }

    return { success: "¡Código de verificación enviado! Revisa tu bandeja de entrada." };
};
