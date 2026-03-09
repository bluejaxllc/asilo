/**
 * BlueJax Payment Webhook
 * POST /api/webhooks/bluejax-payment
 *
 * Receives payment confirmation from GHL/BlueJax when a facility
 * completes payment via the external payment link.
 *
 * Expected payload:
 * {
 *   "facilityId": "string",
 *   "plan": "PRO" | "ENTERPRISE",
 *   "contactId": "string (optional GHL contact ID)",
 *   "amount": number (optional, MXN amount paid),
 *   "timestamp": "ISO string"
 * }
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        // ── Validate webhook secret ──
        const secret = req.headers.get("x-webhook-secret");
        const expectedSecret = process.env.WEBHOOK_SECRET;

        if (expectedSecret && secret !== expectedSecret) {
            console.error("[BlueJax Payment] Unauthorized — invalid webhook secret");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await req.json();
        const { facilityId, plan, contactId, amount } = payload;

        if (!facilityId) {
            return NextResponse.json(
                { error: "Missing required field: facilityId" },
                { status: 400 }
            );
        }

        console.log(`[BlueJax Payment] Received payment confirmation for facility ${facilityId}`);
        console.log(`[BlueJax Payment] Plan: ${plan || "PRO"}, Amount: ${amount || "N/A"}`);

        // ── Verify facility exists ──
        const facility = await db.facility.findUnique({
            where: { id: facilityId },
        });

        if (!facility) {
            console.error(`[BlueJax Payment] Facility ${facilityId} not found`);
            return NextResponse.json(
                { error: "Facility not found" },
                { status: 404 }
            );
        }

        // ── Upgrade facility plan ──
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 month from now

        await db.facility.update({
            where: { id: facilityId },
            data: {
                plan: plan || "PRO",
                billingCustomerId: contactId || facility.billingCustomerId,
                billingPeriodEnd: periodEnd,
            },
        });

        console.log(`[BlueJax Payment] ✅ Facility ${facilityId} upgraded to ${plan || "PRO"}`);

        return NextResponse.json({
            success: true,
            facilityId,
            plan: plan || "PRO",
            billingPeriodEnd: periodEnd.toISOString(),
        });
    } catch (error) {
        console.error("[BlueJax Payment] Error processing payment webhook:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// ─── Health check ────────────────────────────────────────────────────

export async function GET() {
    return NextResponse.json({
        status: "ok",
        endpoint: "/api/webhooks/bluejax-payment",
        description: "BlueJax Payment Confirmation Webhook",
        timestamp: new Date().toISOString(),
    });
}
