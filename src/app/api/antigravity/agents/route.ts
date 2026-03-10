
import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/agents/core/registry';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const secret = request.nextUrl.searchParams.get('secret');
    const envSecret = process.env.ANTIGRAVITY_SECRET;
    if (!envSecret || secret !== envSecret) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const registry = getRegistry();
    const agents = registry.getAll().map(agent => ({
        id: agent.id,
        name: agent.name,
        scheduleDescription: agent.scheduleDescription || 'Manual',
    }));

    return NextResponse.json({ agents });
}
