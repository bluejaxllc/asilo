import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
        return NextResponse.json({ needsVerification: false });
    }

    const user = await db.user.findUnique({
        where: { email },
        select: { emailVerified: true, password: true },
    });

    // Only flag as needs verification if user exists, has a password (credential user),
    // and has NOT verified their email
    const needsVerification = !!user && !!user.password && !user.emailVerified;

    return NextResponse.json({ needsVerification });
}
