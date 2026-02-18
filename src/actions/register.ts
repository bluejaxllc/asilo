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

    const { email, password, name } = validatedFields.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await db.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        return { error: "Este correo ya está en uso!" };
    }

    await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: "STAFF",
        },
    });

    // Auto sign-in after registration
    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/staff",
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return { success: "Cuenta creada. Por favor inicia sesión." };
        }
        throw error; // Re-throw NEXT_REDIRECT
    }
};
