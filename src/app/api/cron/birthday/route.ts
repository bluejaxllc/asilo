import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Daily cron job that recalculates the age of every patient
 * who has a dateOfBirth stored. Triggered by Vercel Cron.
 *
 * Schedule: every day at 06:00 UTC (midnight CST)
 * Security: protected by CRON_SECRET bearer token
 */
export async function GET(request: Request) {
    // ── Auth check ──────────────────────────────────────────
    const authHeader = request.headers.get("authorization");
    if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch all patients that have a dateOfBirth
        const patients = await db.patient.findMany({
            where: { dateOfBirth: { not: null } },
            select: { id: true, age: true, dateOfBirth: true },
        });

        const today = new Date();
        let updated = 0;

        for (const patient of patients) {
            if (!patient.dateOfBirth) continue;

            const birth = new Date(patient.dateOfBirth);
            let newAge = today.getFullYear() - birth.getFullYear();

            // Adjust if birthday hasn't happened yet this year
            const monthDiff = today.getMonth() - birth.getMonth();
            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birth.getDate())
            ) {
                newAge--;
            }

            // Only update if age actually changed
            if (newAge !== patient.age && newAge >= 0) {
                await db.patient.update({
                    where: { id: patient.id },
                    data: { age: newAge },
                });
                updated++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Checked ${patients.length} patients, updated ${updated} ages`,
            timestamp: today.toISOString(),
        });
    } catch (error) {
        console.error("Birthday cron error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
