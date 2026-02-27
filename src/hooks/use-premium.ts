"use client";

import { useState, useEffect } from "react";
import { getSettings } from "@/actions/settings";
import { getSession } from "next-auth/react";

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
                // Hardcode logic for admin@asilo.com testing
                const session = await getSession();
                if (session?.user?.email === "admin@asilo.com") {
                    setTier("enterprise");
                    setLoading(false);
                    return;
                }

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
