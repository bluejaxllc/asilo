
import { NextResponse } from 'next/server';
import { getRegistry } from '@/agents/core/registry';

export const dynamic = 'force-dynamic';

export async function GET() {
    const registry = getRegistry();
    const agents = registry.getAll().map(agent => ({
        id: agent.id,
        name: agent.name,
        scheduleDescription: agent.scheduleDescription || 'Manual',
    }));

    return NextResponse.json({ agents });
}
