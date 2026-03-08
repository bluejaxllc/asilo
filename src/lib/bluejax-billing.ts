/**
 * BlueJax Billing — Payment Link Manager
 *
 * Instead of Stripe SDK, we redirect customers to BlueJax/GHL payment links.
 * Plan upgrades are confirmed via incoming webhook from GHL.
 */

export const BILLING_PLANS = {
    PRO: {
        name: 'Pro',
        monthlyPriceMXN: 2499,
        paymentLink: process.env.NEXT_PUBLIC_CHECKOUT_LINK
            || 'https://links.bluejax.ai/payment-link/69aa5d3584b2d70ea05f9733',
    },
    ENTERPRISE: {
        name: 'Enterprise',
        monthlyPriceMXN: null, // custom pricing
        paymentLink: 'https://www.bluejax.ai/contact',
    },
} as const;

export type BillingPlan = keyof typeof BILLING_PLANS;

/**
 * Returns the BlueJax payment link for a given plan.
 * Optionally appends facilityId as a query parameter for webhook reconciliation.
 */
export function getPaymentLink(plan: BillingPlan, facilityId?: string): string {
    const planConfig = BILLING_PLANS[plan];
    if (!planConfig) {
        throw new Error(`Unknown billing plan: ${plan}`);
    }

    let url = planConfig.paymentLink;

    // Append facilityId for webhook reconciliation (GHL will pass it back)
    if (facilityId && url.startsWith('https://links.bluejax.ai')) {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}facilityId=${encodeURIComponent(facilityId)}`;
    }

    return url;
}
