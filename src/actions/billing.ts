"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { getPaymentLink, type BillingPlan } from "@/lib/bluejax-billing";

const returnUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3008";

/**
 * Returns a BlueJax payment link URL for the given plan.
 * The user is redirected to this link to complete payment externally.
 * GHL fires a webhook back when payment is confirmed.
 */
export async function redirectToPayment(plan: BillingPlan = "PRO") {
    try {
        const authSession = await auth();
        const user = authSession?.user as any;

        if (!user || !user.facilityId) {
            return { error: "No autorizado o sin instalación asociada." };
        }

        const url = getPaymentLink(plan, user.facilityId);
        return { url };
    } catch (error) {
        console.error("[BILLING_REDIRECT]", error);
        return { error: "Hubo un error al generar el enlace de pago." };
    }
}

/**
 * Returns the current billing status for the authenticated facility.
 */
export async function getBillingStatus() {
    try {
        const authSession = await auth();
        const user = authSession?.user as any;

        if (!user || !user.facilityId) {
            return { error: "No autorizado." };
        }

        const facility = await db.facility.findUnique({
            where: { id: user.facilityId },
            select: {
                plan: true,
                billingCustomerId: true,
                billingPeriodEnd: true,
            },
        });

        if (!facility) {
            return { error: "Instalación no encontrada." };
        }

        return {
            plan: facility.plan,
            isPro: facility.plan === "PRO" || facility.plan === "ENTERPRISE",
            billingPeriodEnd: facility.billingPeriodEnd?.toISOString() || null,
        };
    } catch (error) {
        console.error("[BILLING_STATUS]", error);
        return { error: "Error al obtener estado de facturación." };
    }
}
