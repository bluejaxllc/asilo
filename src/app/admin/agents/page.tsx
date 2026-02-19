"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn, SlideIn, ScaleIn } from "@/components/ui/motion-wrapper";
import { cn } from "@/lib/utils";
import {
    Bot,
    Play,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock,
    Cpu,
    Activity,
    Package,
    CalendarCheck,
    ClipboardList,
    Zap,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

interface AgentInfo {
    id: string;
    name: string;
    scheduleDescription?: string;
}

interface RunResult {
    success: boolean;
    message?: string;
    data?: any;
}

const agentIcons: Record<string, any> = {
    'test-agent': Zap,
    'low-stock-monitor': Package,
    'daily-summary': ClipboardList,
    'attendance-audit': CalendarCheck,
};

const agentColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    'test-agent': {
        bg: 'from-violet-500/10 to-purple-600/10',
        border: 'border-violet-500/20',
        text: 'text-violet-400',
        glow: 'shadow-violet-500/10',
    },
    'low-stock-monitor': {
        bg: 'from-emerald-500/10 to-teal-600/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/10',
    },
    'daily-summary': {
        bg: 'from-sky-500/10 to-blue-600/10',
        border: 'border-sky-500/20',
        text: 'text-sky-400',
        glow: 'shadow-sky-500/10',
    },
    'attendance-audit': {
        bg: 'from-amber-500/10 to-orange-600/10',
        border: 'border-amber-500/20',
        text: 'text-amber-400',
        glow: 'shadow-amber-500/10',
    },
};

const defaultColor = {
    bg: 'from-zinc-500/10 to-zinc-600/10',
    border: 'border-border',
    text: 'text-muted-foreground',
    glow: 'shadow-slate-500/10',
};

export default function AgentsPage() {
    const [agents, setAgents] = useState<AgentInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [runningAgent, setRunningAgent] = useState<string | null>(null);
    const [results, setResults] = useState<Record<string, RunResult>>({});
    const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});
    const [totalRuns, setTotalRuns] = useState(0);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const res = await fetch('/api/antigravity/agents');
            const data = await res.json();
            setAgents(data.agents || []);
        } catch (error) {
            console.error('Error fetching agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const runAgent = async (agentId: string) => {
        setRunningAgent(agentId);
        setResults(prev => ({ ...prev, [agentId]: undefined as any }));

        try {
            const res = await fetch('/api/antigravity/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId }),
            });
            const result = await res.json();
            setResults(prev => ({ ...prev, [agentId]: result }));
            setExpandedResults(prev => ({ ...prev, [agentId]: true }));
            setTotalRuns(prev => prev + 1);
        } catch (error: any) {
            setResults(prev => ({
                ...prev,
                [agentId]: { success: false, message: error.message || 'Error de conexión' }
            }));
        } finally {
            setRunningAgent(null);
        }
    };

    const toggleExpand = (agentId: string) => {
        setExpandedResults(prev => ({ ...prev, [agentId]: !prev[agentId] }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <FadeIn>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border border-border p-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/10">
                                    <Bot className="h-6 w-6 text-blue-400" />
                                </div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">Agentes</h1>
                            </div>
                            <p className="text-muted-foreground text-sm max-w-lg">
                                Sistema de agentes autónomos para auditorías de inventario, resúmenes diarios y monitoreo de asistencia.
                            </p>
                        </div>

                        <div className="hidden sm:flex gap-4">
                            <div className="text-center p-4 rounded-xl bg-card/5 border border-border min-w-[100px]">
                                <p className="text-2xl font-bold text-white">{agents.length}</p>
                                <p className="text-xs text-muted-foreground mt-1">Agentes</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-card/5 border border-border min-w-[100px]">
                                <p className="text-2xl font-bold text-emerald-400">{totalRuns}</p>
                                <p className="text-xs text-muted-foreground mt-1">Ejecuciones</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-card/5 border border-border min-w-[100px]">
                                <p className="text-2xl font-bold text-amber-400">
                                    {Object.values(results).filter(r => r?.success).length}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Exitosos</p>
                            </div>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* Agent Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {agents.map((agent, index) => {
                    const Icon = agentIcons[agent.id] || Cpu;
                    const colors = agentColors[agent.id] || defaultColor;
                    const isRunning = runningAgent === agent.id;
                    const result = results[agent.id];
                    const isExpanded = expandedResults[agent.id];

                    return (
                        <SlideIn key={agent.id} direction="up" delay={index * 0.1}>
                            <Card className={cn(
                                "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
                                "bg-gradient-to-br", colors.bg,
                                "border", colors.border,
                                colors.glow,
                                isRunning && "ring-2 ring-blue-500/30 animate-pulse"
                            )}>
                                {/* Subtle glow effect */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/[0.02] to-transparent" />

                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2.5 rounded-xl border bg-gradient-to-br",
                                                colors.bg, colors.border
                                            )}>
                                                <Icon className={cn("h-5 w-5", colors.text)} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg text-foreground">{agent.name}</CardTitle>
                                                <CardDescription className="text-xs font-mono text-muted-foreground">
                                                    {agent.id}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-[10px] font-medium px-2 py-0.5",
                                                colors.border, colors.text
                                            )}
                                        >
                                            <Clock className="h-3 w-3 mr-1" />
                                            {agent.scheduleDescription || 'Manual'}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Run Button */}
                                    <Button
                                        className={cn(
                                            "w-full h-11 rounded-xl font-semibold text-sm transition-all",
                                            isRunning
                                                ? "bg-zinc-700 text-muted-foreground cursor-not-allowed"
                                                : "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20"
                                        )}
                                        onClick={() => runAgent(agent.id)}
                                        disabled={isRunning}
                                    >
                                        {isRunning ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Ejecutando...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-4 w-4 mr-2" />
                                                Ejecutar Agente
                                            </>
                                        )}
                                    </Button>

                                    {/* Result Panel */}
                                    {result && (
                                        <div className={cn(
                                            "rounded-xl border p-4 transition-all",
                                            result.success
                                                ? "bg-emerald-500/5 border-emerald-500/20"
                                                : "bg-red-500/5 border-red-500/20"
                                        )}>
                                            <div
                                                className="flex items-center justify-between cursor-pointer"
                                                onClick={() => toggleExpand(agent.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {result.success ? (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-red-400" />
                                                    )}
                                                    <span className={cn(
                                                        "text-sm font-medium",
                                                        result.success ? "text-emerald-400" : "text-red-400"
                                                    )}>
                                                        {result.success ? 'Completado' : 'Error'}
                                                    </span>
                                                </div>
                                                {result.data && (
                                                    isExpanded
                                                        ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>

                                            {result.message && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    {result.message}
                                                </p>
                                            )}

                                            {isExpanded && result.data && (
                                                <pre className="mt-3 text-[11px] text-muted-foreground bg-black/20 rounded-lg p-3 overflow-x-auto max-h-48 overflow-y-auto font-mono">
                                                    {JSON.stringify(result.data, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </SlideIn>
                    );
                })}
            </div>

            {/* Footer Info */}
            <FadeIn delay={0.5}>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-4">
                    <Activity className="h-3 w-3" />
                    <span>Los agentes pueden ser ejecutados manualmente o configurados para ejecución automática vía cron.</span>
                </div>
            </FadeIn>
        </div>
    );
}
