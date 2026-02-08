import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { LoginSchema } from "@/schemas"

export default {
    providers: [
        Credentials
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // User is available during sign-in
                token.role = (user as any).role;
                token.sub = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            console.log("AuthConfig Session Callback Token:", JSON.stringify(token, null, 2));
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }

            if (token.role && session.user) {
                session.user.role = token.role as "ADMIN" | "STAFF" | "DOCTOR" | "NURSE" | "KITCHEN";
            }

            return session;
        }
    },
    session: { strategy: "jwt" },
    secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig
