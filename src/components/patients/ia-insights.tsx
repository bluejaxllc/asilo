"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, AlertCircle, TrendingUp, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { generatePatientSummary } from "@/actions/generate-summary";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/motion-wrapper";

interface PatientSummary {
    id: string;
    content: string;
    riskLevel: string;
    recommendations: string; // JSON string
    generatedBy: string;
    createdAt: Date | string;
}

export function IAInsights({ summaries, patientId }: { summaries: PatientSummary[], patientId: string }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        toast.loading("Analizando bitácoras con Gemini AI...");

        try {
            const result = await generatePatientSummary(patientId);
            toast.dismiss();

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Resumen generado exitosamente.");
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Ocurrió un error inesperado al analizar los datos.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (summaries.length === 0) {
        return (
            <Card className="border-dashed bg-card/50">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Brain className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-foreground">Sin resúmenes de IA</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                        No se ha generado un análisis clínico para este residente. Genera uno ahora basado en los últimos 7 días de bitácoras.
                    </p>
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="mt-4 bg-violet-600 hover:bg-violet-700 text-white gap-2"
                        size="sm"
                    >
                        <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                        Generar Primer Resumen
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const latest = summaries[0]; // Ordered descending by default
    let parsedRecommendations: string[] = [];
    try {
        parsedRecommendations = JSON.parse(latest.recommendations || "[]");
    } catch (e) {
        // Handle bad json
    }

    // Determine derived risk styling
    const isHigh = latest.riskLevel === "HIGH";
    const isMedium = latest.riskLevel === "MEDIUM";

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    variant="outline"
                    className="border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-900/50 dark:text-violet-400 dark:hover:bg-violet-900/20 gap-2"
                    size="sm"
                >
                    <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                    {isGenerating ? "Analizando..." : "Actualizar Análisis"}
                </Button>
            </div>

            <FadeIn>
                <Card className={cn(
                    "overflow-hidden border-2 shadow-md transition-colors",
                    isHigh ? "border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent" :
                        isMedium ? "border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent" :
                            "border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent"
                )}>
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                            <div className={cn(
                                "p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r w-full md:w-48",
                                isHigh ? "bg-red-500/10 border-red-500/10" :
                                    isMedium ? "bg-amber-500/10 border-amber-500/10" :
                                        "bg-emerald-500/10 border-emerald-500/10"
                            )}>
                                <span className={cn(
                                    "text-xs font-bold uppercase tracking-tighter mb-2",
                                    isHigh ? "text-red-500" : isMedium ? "text-amber-500" : "text-emerald-500"
                                )}>Nivel de Riesgo</span>

                                <Badge className={cn(
                                    "text-lg px-4 py-1.5 shadow-sm",
                                    isHigh ? "bg-red-500 hover:bg-red-600 text-white border-none" :
                                        isMedium ? "bg-amber-500 hover:bg-amber-600 text-white border-none" :
                                            "bg-emerald-500 hover:bg-emerald-600 text-white border-none"
                                )}>
                                    {latest.riskLevel === "HIGH" ? "ALTO" : latest.riskLevel === "MEDIUM" ? "MEDIO" : "ESTABLE"}
                                </Badge>

                                <span className="text-[10px] text-muted-foreground mt-3 font-mono">
                                    {new Date(latest.createdAt).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                            <div className="p-6 flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <Brain className="h-5 w-5 text-violet-500" />
                                    <h3 className="text-base font-bold text-foreground">Resumen Clínico</h3>
                                    <Badge variant="outline" className="ml-auto bg-violet-500/10 text-violet-500 border-violet-500/20 text-[9px]">
                                        Powered by Gemini
                                    </Badge>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    {latest.content}
                                </p>

                                {parsedRecommendations.length > 0 && (
                                    <div className="mt-5 space-y-2">
                                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            {isHigh ? <AlertCircle className="h-3.5 w-3.5 text-red-500" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                                            Recomendaciones de Acción
                                        </h4>
                                        <ul className="space-y-1.5">
                                            {parsedRecommendations.map((rec, idx) => (
                                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                                    <span className="text-violet-500 font-bold mt-0.5">•</span>
                                                    <span className="leading-snug">{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </FadeIn>

            {/* Historical Summaries */}
            {summaries.length > 1 && (
                <div className="mt-8">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Historial de Evaluaciones</h4>
                    <div className="space-y-2">
                        {summaries.slice(1).map((summary) => (
                            <div key={summary.id} className="p-3 rounded-lg border bg-card flex items-center gap-3">
                                <Badge variant="outline" className={cn(
                                    "text-[10px] w-16 justify-center",
                                    summary.riskLevel === "HIGH" ? "text-red-500 border-red-200 bg-red-50 dark:bg-red-500/10" :
                                        summary.riskLevel === "MEDIUM" ? "text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-500/10" :
                                            "text-emerald-500 border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10"
                                )}>
                                    {summary.riskLevel}
                                </Badge>
                                <span className="text-[11px] text-muted-foreground font-mono">
                                    {new Date(summary.createdAt).toLocaleDateString("es-MX")}
                                </span>
                                <p className="text-xs text-secondary-foreground truncate flex-1">
                                    {summary.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
