
import { NextRequest, NextResponse } from 'next/server';
import { getRegistry } from '@/agents/core/registry';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get('agent');
    const secret = searchParams.get('secret');

    const facilityId = searchParams.get('facility');

    // Strict security check (Fail-Closed)
    const envSecret = process.env.ANTIGRAVITY_SECRET;
    if (!envSecret || secret !== envSecret) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!agentId || !facilityId) {
        return NextResponse.json({
            success: false,
            message: 'Agent ID and Facility ID required',
            availableAgents: getRegistry().getAll().map(a => ({ id: a.id, name: a.name, schedule: a.scheduleDescription }))
        }, { status: 400 });
    }

    try {
        const registry = getRegistry();
        const result = await registry.run(agentId, facilityId);
        return NextResponse.json(result, { status: result.success ? 200 : 500 });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: 'Execution error',
            error: error.message
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { agentId, secret, facilityId } = body;

        // Strict security check (Fail-Closed)
        const envSecret = process.env.ANTIGRAVITY_SECRET;
        if (!envSecret || secret !== envSecret) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        if (!agentId || !facilityId) {
            return NextResponse.json({
                success: false,
                message: 'agentId and facilityId are required in request body'
            }, { status: 400 });
        }

        const registry = getRegistry();
        const result = await registry.run(agentId, facilityId);
        return NextResponse.json(result, { status: result.success ? 200 : 500 });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: 'Execution error',
            error: error.message
        }, { status: 500 });
    }
}
