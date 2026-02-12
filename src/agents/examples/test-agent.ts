
import { Agent, AgentContext, AgentResult } from '../core/types';

export class TestAgent implements Agent {
    id = 'test-agent';
    name = 'System Verification Agent';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[TestAgent] Starting run ${context.runId}...`);

        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log(`[TestAgent] Work completed.`);

        return {
            success: true,
            message: 'Verification complete',
            data: { timestamp: new Date().toISOString() }
        };
    }
}
