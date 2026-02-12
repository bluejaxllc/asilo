
export interface AgentResult {
    success: boolean;
    message?: string;
    data?: any;
}

export interface AgentContext {
    // useful for passing specialized loggers or scoped prismas later
    runId: string;
}

export interface Agent {
    /**
     * Unique identifier for the agent (e.g. 'inventory-audit')
     */
    id: string;

    /**
     * Human readable name for the UI/Logs
     */
    name: string;

    /**
     * Cron description of when this runs (informational for now)
     */
    scheduleDescription?: string;

    /**
     * The main execution logic
     */
    run(context: AgentContext): Promise<AgentResult>;
}
