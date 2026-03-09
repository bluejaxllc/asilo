import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { LoginSchema } from "@/schemas"
import bcrypt from "bcryptjs"

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    ...authConfig,
    trustHost: true,
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }

            if (token.role && session.user) {
                session.user.role = token.role as "ADMIN" | "STAFF" | "DOCTOR" | "NURSE" | "KITCHEN" | "FAMILY";
            }

            if (token.email && session.user) {
                session.user.email = token.email as string;
            }

            if (session.user) {
                (session.user as any).facilityId = token.facilityId ?? null;
                (session.user as any).mustChangePassword = token.mustChangePassword ?? false;
            }

            return session;
        },
        async jwt({ token, user }) {
            // On initial sign in, user is available. Set role directly.
            if (user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.sub = user.id;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.role = (user as any).role;
                token.email = user.email;
                token.facilityId = (user as any).facilityId ?? null;
                token.mustChangePassword = (user as any).mustChangePassword ?? false;
                return token;
            }

            if (!token.sub) return token;

            const existingUser = await db.user.findUnique({
                where: { id: token.sub }
            });

            if (!existingUser) return token;

            token.role = existingUser.role;
            token.facilityId = existingUser.facilityId ?? null;
            token.mustChangePassword = existingUser.mustChangePassword ?? false;

            return token;
        }
    },
    events: {
        async linkAccount({ user }) {
            // When an OAuth account is linked (first Google sign-in),
            // create a Facility for the user if they don't have one
            if (user.id) {
                const existingUser = await db.user.findUnique({
                    where: { id: user.id }
                });
                if (existingUser && !existingUser.facilityId) {
                    const facility = await db.facility.create({
                        data: {
                            name: `Residencia de ${existingUser.name || 'Usuario'}`,
                            plan: "FREE",
                        }
                    });
                    await db.user.update({
                        where: { id: user.id },
                        data: {
                            facilityId: facility.id,
                            role: "ADMIN",
                        }
                    });
                }
            }
        }
    },
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    secret: process.env.AUTH_SECRET,
    cookies: {
        sessionToken: {
            name: `__Secure-authjs.session-token`,
            options: {
                httpOnly: true,
                sameSite: "none",
                path: "/",
                secure: true,
            },
        },
        callbackUrl: {
            name: `__Secure-authjs.callback-url`,
            options: {
                sameSite: "none",
                path: "/",
                secure: true,
            },
        },
        csrfToken: {
            name: `__Secure-authjs.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: "none",
                path: "/",
                secure: true,
            },
        },
        pkceCodeVerifier: {
            name: `__Secure-authjs.pkce.code_verifier`,
            options: {
                httpOnly: true,
                sameSite: "none",
                path: "/",
                secure: true,
                maxAge: 900,
            },
        },
        state: {
            name: `__Secure-authjs.state`,
            options: {
                httpOnly: true,
                sameSite: "none",
                path: "/",
                secure: true,
                maxAge: 900,
            },
        },
    },
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const validatedFields = LoginSchema.safeParse(credentials);

                if (validatedFields.success) {
                    const { email, password } = validatedFields.data;

                    const user = await db.user.findUnique({
                        where: { email }
                    });

                    console.log("Auth Authorize: User found:", user ? user.email : "No user");

                    if (!user || !(user as any).password) return null;

                    const passwordsMatch = await bcrypt.compare(
                        password,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (user as any).password,
                    );

                    if (passwordsMatch) {
                        return user;
                    }
                }

                return null;
            }
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
})
