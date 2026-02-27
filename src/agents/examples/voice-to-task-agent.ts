import { Agent, AgentContext, AgentResult } from '../core/types';
import { db } from '@/lib/db';

export class VoiceToTaskAgent implements Agent {
    id = 'voice-to-task';
    name = 'Transcripción de Voz a Tarea';
    scheduleDescription = 'Manual / Bajo Demanda';

    async run(context: AgentContext): Promise<AgentResult> {
        console.log(`[VoiceToTaskAgent] Simulating dictation to task conversion...`);

        return {
            success: true,
            message: `Nota de evolución transurcrita exitosamente y convertida a tarea/registro.`,
            data: { processed: true }
        };
    }
}
