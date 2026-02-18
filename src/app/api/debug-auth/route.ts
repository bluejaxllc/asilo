import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
    const session = await auth();

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            AUTH_URL_SET: !!process.env.AUTH_URL,
            AUTH_URL_VALUE: process.env.AUTH_URL || "(not set)",
            NEXTAUTH_URL_SET: !!process.env.NEXTAUTH_URL,
            NEXTAUTH_URL_VALUE: process.env.NEXTAUTH_URL || "(not set)",
            AUTH_SECRET_SET: !!process.env.AUTH_SECRET,
            AUTH_SECRET_LENGTH: process.env.AUTH_SECRET?.length || 0,
            DATABASE_URL_SET: !!process.env.DATABASE_URL,
            VERCEL_URL: process.env.VERCEL_URL || "(not set)",
            VERCEL_ENV: process.env.VERCEL_ENV || "(not set)",
        },
        session: session ? {
            user: {
                name: session.user?.name,
                email: session.user?.email,
                role: (session.user as any)?.role,
            },
            expires: session.expires,
        } : null,
        message: "If AUTH_URL is set to localhost, that's the problem. Remove it from Vercel env vars."
    });
}
