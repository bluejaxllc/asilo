
import { Agent, AgentContext, AgentResult } from './types';

export class AgentReactor {
    private agents: Map<string, Agent> = new Map();
    private isRunning: Map<string, boolean> = new Map();

    /**
     * Registers a new agent to the system
     */
    register(agent: Agent) {
        if (this.agents.has(agent.id)) {
            console.warn(`[Antigravity] Agent ${agent.id} already registered. Overwriting.`);
        }
        this.agents.set(agent.id, agent);
        this.isRunning.set(agent.id, false);
        console.log(`[Antigravity] Registered agent: ${agent.name} (${agent.id})`);
    }

    /**
     * Retrieves an agent by ID
     */
    get(id: string): Agent | undefined {
        return this.agents.get(id);
    }

    /**
     * Returns a list of all registered agents
     */
    getAll(): Agent[] {
        return Array.from(this.agents.values());
    }

    /**
     * Runs a specific agent by ID
     */
    async run(agentId: string): Promise<AgentResult> {
        const agent = this.get(agentId);
        if (!agent) {
            return { success: false, message: `Agent ${agentId} not found.` };
        }

        if (this.isRunning.get(agentId)) {
            return { success: false, message: `Agent ${agentId} is already running.` };
        }

        console.log(`[Antigravity] Starting agent: ${agent.name}`);
        this.isRunning.set(agentId, true);

        const context: AgentContext = {
            runId: crypto.randomUUID()
        };

        try {
            const result = await agent.run(context);
            console.log(`[Antigravity] Agent ${agent.name} completed. Success: ${result.success}`);
            return result;
        } catch (error: any) {
            console.error(`[Antigravity] Agent ${agent.name} failed:`, error);
            return {
                success: false,
                message: error.message || 'Unknown error occurred',
                data: error
            };
        } finally {
            this.isRunning.set(agentId, false);
        }
    }
}

// Singleton instance
export const reactor = new AgentReactor();
