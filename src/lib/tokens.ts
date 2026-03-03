"use server";

import { db } from "@/lib/db";

/**
 * Generate a 6-digit verification token for email verification.
 * Expires in 1 hour. Deletes any existing tokens for the same email.
 */
export async function generateVerificationToken(email: string) {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

    // Delete existing tokens for this email
    await db.verificationToken.deleteMany({
        where: { identifier: email },
    });

    // Create new token
    const verificationToken = await db.verificationToken.create({
        data: {
            identifier: email,
            token: code,
            expires,
        },
    });

    return verificationToken;
}

/**
 * Look up a verification token by email and code.
 */
export async function getVerificationTokenByEmail(email: string) {
    try {
        const token = await db.verificationToken.findFirst({
            where: { identifier: email },
        });
        return token;
    } catch {
        return null;
    }
}
