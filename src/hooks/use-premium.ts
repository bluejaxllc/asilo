"use client";

import { useState, useEffect } from "react";
import { getSettings } from "@/actions/settings";

type Tier = "free" | "pro" | "enterprise";

interface PremiumState {
    tier: Tier;
    isPro: boolean;
    isEnterprise: boolean;
    loading: boolean;
}

export function usePremium(): PremiumState {
    const [tier, setTier] = useState<Tier>("free");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const settings = await getSettings();
                const sub = settings["subscription_tier"];
                if (sub === "pro") setTier("pro");
                else if (sub === "enterprise") setTier("enterprise");
                else setTier("free");
            } catch {
                setTier("free");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return {
        tier,
        isPro: tier === "pro" || tier === "enterprise",
        isEnterprise: tier === "enterprise",
        loading,
    };
}
