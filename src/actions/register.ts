"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { db } from "@/lib/db";
import { RegisterSchema } from "@/schemas";
import { signIn } from "@/auth";

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
    const redirectPath = userRole === "ADMIN" ? "/admin" : "/staff";

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

    // Auto sign-in after registration
    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: redirectPath,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return { success: "Cuenta creada. Por favor inicia sesión." };
        }
        throw error; // Re-throw NEXT_REDIRECT
    }
};
