"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { ResetPasswordSchema } from "@/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const resetPassword = async (values: z.infer<typeof ResetPasswordSchema>) => {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        return { error: "No autorizado. Inicie sesión nuevamente." };
    }

    const validatedFields = ResetPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Campos inválidos!" };
    }

    const { password } = validatedFields.data;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user
    const updatedUser = await db.user.update({
        where: { id: session.user.id },
        data: {
            password: hashedPassword,
            mustChangePassword: false,
        }
    });

    // Determine fallback redirect
    let redirectUrl = DEFAULT_LOGIN_REDIRECT;
    if (updatedUser.role === "SUPER_ADMIN") redirectUrl = "/super-admin";
    else if (updatedUser.role === "ADMIN") redirectUrl = "/admin";
    else if (updatedUser.role === "FAMILY") redirectUrl = "/family";

    return { success: "¡Contraseña actualizada con éxito!", redirectUrl };
};
