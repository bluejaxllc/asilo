
import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/agents/core/registry';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // Dual auth: accept ANTIGRAVITY_SECRET (external/cron) OR session with ADMIN role (admin UI)
    const secret = request.nextUrl.searchParams.get('secret');
    const envSecret = process.env.ANTIGRAVITY_SECRET;
    const hasValidSecret = envSecret && secret === envSecret;

    let hasValidSession = false;
    if (!hasValidSecret) {
        const session = await auth();
        const role = (session?.user as any)?.role;
        hasValidSession = role === 'ADMIN' || role === 'SUPER_ADMIN';
    }

    if (!hasValidSecret && !hasValidSession) {
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
