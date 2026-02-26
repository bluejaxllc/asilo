"use server";

import { requireRole } from "@/lib/role-guard";
import { getRegistry } from "@/agents/core/registry";
import { revalidatePath } from "next/cache";

/**
 * Server Action to execute a premium AI agent by ID.
 * Returns the AgentResult or throws an error.
 */
export async function executePremiumAgent(agentId: string) {
    // Only ADMINs should be manually triggering premium backend agents.
    const check = await requireRole("ADMIN");
    if ("error" in check) {
        return { success: false, message: check.error };
    }

    try {
        const registry = getRegistry();
        const result = await registry.run(agentId);

        // Revalidate admin paths where updates might show up
        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/patients");
        revalidatePath("/admin/staff");
        revalidatePath("/admin/tasks");
        revalidatePath("/admin/marketing");

        return result;
    } catch (error: any) {
        console.error(`Error executing agent ${agentId}:`, error);
        return {
            success: false,
            message: "Error executing agent",
            error: error.message || "Unknown error"
        };
    }
}
