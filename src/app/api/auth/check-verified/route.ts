import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
        return NextResponse.json({ needsVerification: false });
    }

    // Check if there's a pending registration (user hasn't verified yet)
    const pending = await db.pendingRegistration.findUnique({
        where: { email },
    });

    return NextResponse.json({ needsVerification: !!pending });
}
