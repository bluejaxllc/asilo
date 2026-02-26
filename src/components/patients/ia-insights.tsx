"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, AlertCircle, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface IAInsight {
    id: string;
    title: string;
    message: string;
    type: string;
    createdAt: Date | string;
}

export function IAInsights({ insights }: { insights: IAInsight[] }) {
    if (insights.length === 0) {
        return (
            <Card className="border-dashed bg-card/50">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Brain className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">Sin hallazgos clínicos de IA</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                        La IA analiza bitácoras cada 12 horas para detectar tendencias.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Derived risk score (mocked for demo based on count and severity)
    const hasCritical = insights.some(i => i.type === 'CRITICAL');
    const riskScore = hasCritical ? 85 : insights.length > 2 ? 60 : 25;

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden border-2 border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent shadow-md">
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                        <div className="p-6 flex flex-col items-center justify-center bg-violet-500/10 border-r border-violet-500/10 md:w-40">
                            <span className="text-xs font-bold text-violet-400 uppercase tracking-tighter mb-1">Risk Score</span>
                            <div className={cn(
                                "text-4xl font-black tabular-nums",
                                riskScore > 75 ? "text-red-400" : riskScore > 50 ? "text-amber-400" : "text-emerald-400"
                            )}>
                                {riskScore}
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1">/100</span>
                        </div>
                        <div className="p-6 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Brain className="h-4 w-4 text-violet-400" />
                                <h3 className="text-sm font-bold text-foreground">BlueJax Intelligence Summary</h3>
                                <Badge variant="outline" className="ml-auto bg-violet-500/10 text-violet-400 border-violet-500/20 text-[9px]">ACTIVE MONITOR</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {hasCritical
                                    ? "Se han detectado irregularidades críticas que requieren atención inmediata del equipo médico."
                                    : "El residente muestra tendencias estables con algunas observaciones preventivas menores."}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-3">
                {insights.map((insight) => (
                    <div key={insight.id} className={cn(
                        "p-4 rounded-xl border-l-4 bg-card shadow-sm hover:shadow-md transition-all flex gap-3",
                        insight.type === 'CRITICAL' ? "border-l-red-500 border" :
                            insight.type === 'WARNING' ? "border-l-amber-500 border" : "border-l-blue-500 border"
                    )}>
                        <div className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                            insight.type === 'CRITICAL' ? "bg-red-500/10" :
                                insight.type === 'WARNING' ? "bg-amber-500/10" : "bg-blue-500/10"
                        )}>
                            {insight.title.includes('Predictiva') ? <TrendingUp className="h-4 w-4 text-amber-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <h4 className="text-xs font-bold">{insight.title}</h4>
                                <span className="text-[9px] text-muted-foreground font-mono">
                                    {new Date(insight.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{insight.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
