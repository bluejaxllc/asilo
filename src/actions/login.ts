"use server";

import * as z from "zod";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { db } from "@/lib/db";

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password } = validatedFields.data;
    console.log("Login Action: Attempting login for", email);

    // Fetch user to determine role for redirection
    const existingUser = await db.user.findUnique({
        where: { email }
    });

    let redirectUrl = DEFAULT_LOGIN_REDIRECT;

    if (existingUser && existingUser.role === "ADMIN") {
        redirectUrl = "/admin";
    } else if (existingUser && existingUser.role === "FAMILY") {
        redirectUrl = "/family";
    }

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: redirectUrl,
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Credenciales inválidas!" }
                default:
                    return { error: "Algo salió mal!" }
            }
        }

        // Re-throw everything else (including NEXT_REDIRECT on successful login)
        throw error;
    }
};
