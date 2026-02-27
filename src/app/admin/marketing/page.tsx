"use client";

import { FadeIn, SlideIn } from "@/components/ui/motion-wrapper";
import { PremiumCard, PremiumSection } from "@/components/ui/premium-card";
import { Badge } from "@/components/ui/badge";
import {
    Megaphone,
    Mail,
    Star,
    MessageSquare,
    CalendarRange,
    Users,
    TrendingUp,
    Sparkles,
    Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { executePremiumAgent } from "@/actions/premium";
import { usePremium } from "@/hooks/use-premium";

export default function MarketingPage() {
    const { isPro } = usePremium();
    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Hero Banner */}
            <FadeIn>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-900 via-pink-800 to-fuchsia-900 border border-border p-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl" />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20 border border-pink-500/10">
                                    <Megaphone className="h-6 w-6 text-pink-300" />
                                </div>
                                <h1 className="text-3xl font-bold text-white tracking-tight">Marketing</h1>
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] font-bold px-2">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    PRO
                                </Badge>
                            </div>
                            <p className="text-pink-200/60 text-sm max-w-lg">
                                Herramientas de crecimiento para su retiro: capte nuevos residentes, gestione reputación y comuníquese masivamente con familias.
                            </p>
                        </div>

                        <div className="hidden sm:flex gap-4">
                            <div className="text-center p-4 rounded-xl bg-card/5 border border-border min-w-[100px]">
                                <p className="text-2xl font-bold text-white">6</p>
                                <p className="text-xs text-pink-300/50 mt-1">Herramientas</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-card/5 border border-border min-w-[100px]">
                                <TrendingUp className="h-6 w-6 text-emerald-400 mx-auto" />
                                <p className="text-xs text-pink-300/50 mt-1">Crecimiento</p>
                            </div>
                        </div>
                    </div>
                </div>
            </FadeIn>

            {/* Marketing Cards */}
            <SlideIn delay={0.1}>
                <PremiumSection title="Captación de Residentes" subtitle="Atraiga y convierta prospectos en nuevos residentes con herramientas de marketing digital.">
                    <div className="relative group">
                        <PremiumCard unlocked={isPro}
                            title="Embudo de Admisiones"
                            description="Landing pages y formularios optimizados para captar familias que buscan un retiro. Seguimiento automático desde la consulta hasta la admisión."
                            icon={TrendingUp}
                            accent="rose"
                        />
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[10px] bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 text-rose-400 gap-1.5"
                                onClick={async () => {
                                    const id = toast.loading("Analizando tasa de conversión del embudo...");
                                    const result = await executePremiumAgent('marketing-audit');
                                    if (result.success) {
                                        toast.success(result.message, { id });
                                    } else {
                                        toast.error(result.message || "Error al analizar", { id });
                                    }
                                }}
                            >
                                <Zap className="h-3 w-3" /> Optimizar Embudo
                            </Button>
                        </div>
                    </div>

                    <div className="relative group">
                        <PremiumCard unlocked={isPro}
                            title="CRM de Prospectos"
                            description="Pipeline visual: Consulta → Visita Programada → Tour Completado → Admisión. Lead scoring automático por nivel de interés."
                            icon={Users}
                            accent="violet"
                        />
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[10px] bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20 text-violet-400 gap-1.5"
                                onClick={async () => {
                                    const id = toast.loading("Calculando Lead Scoring...");
                                    const result = await executePremiumAgent('lead-scoring');
                                    if (result.success) {
                                        toast.success(result.message, { id });
                                    } else {
                                        toast.error(result.message || "Error al calificar", { id });
                                    }
                                }}
                            >
                                <Zap className="h-3 w-3" /> Calificar Leads
                            </Button>
                        </div>
                    </div>

                    <div className="relative group">
                        <PremiumCard unlocked={isPro}
                            title="Agenda de Visitas Online"
                            description="Familias interesadas agendan tours del retiro directamente desde su sitio web con confirmación automática por email y SMS."
                            icon={CalendarRange}
                            accent="blue"
                        />
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[10px] bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 text-blue-400 gap-1.5"
                                onClick={async () => {
                                    const id = toast.loading("Configurando disponibilidad de tours...");
                                    const result = await executePremiumAgent('tour-booking');
                                    if (result.success) {
                                        toast.success(result.message, { id });
                                    } else {
                                        toast.error(result.message || "Error al configurar agenda", { id });
                                    }
                                }}
                            >
                                <Zap className="h-3 w-3" /> Gestionar Agenda
                            </Button>
                        </div>
                    </div>
                </PremiumSection>
            </SlideIn>

            <SlideIn delay={0.2}>
                <PremiumSection title="Comunicación y Reputación" subtitle="Automatice la comunicación con familias y gestione la reputación online de su retiro.">
                    <div className="relative group">
                        <PremiumCard unlocked={isPro}
                            title="Campañas Email/SMS"
                            description="Newsletters, recordatorios de eventos, campañas de retención y comunicados masivos a todos los contactos de familias."
                            icon={Mail}
                            accent="cyan"
                        />
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[10px] bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-400 gap-1.5"
                                onClick={async () => {
                                    const id = toast.loading("Generando plantilla IA...");
                                    const result = await executePremiumAgent('campaign-generator');
                                    if (result.success) {
                                        toast.success(result.message, { id });
                                    } else {
                                        toast.error(result.message || "Error al inicializar", { id });
                                    }
                                }}
                            >
                                <Zap className="h-3 w-3" /> Crear Campaña
                            </Button>
                        </div>
                    </div>

                    <div className="relative group">
                        <PremiumCard unlocked={isPro}
                            title="Gestión de Reseñas"
                            description="Auto-responda a Google Reviews con IA. Envíe solicitudes de reseñas a familias satisfechas para mejorar su presencia online."
                            icon={Star}
                            accent="amber"
                        />
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[10px] bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-amber-400 gap-1.5"
                                onClick={async () => {
                                    const id = toast.loading("Analizando reseñas...");
                                    const result = await executePremiumAgent('reputation-audit');
                                    if (result.success) {
                                        toast.success("Borradores generados con tono empático y profesional.", { id });
                                    } else {
                                        toast.error(result.message || "Error al analizar", { id });
                                    }
                                }}
                            >
                                <Zap className="h-3 w-3" /> Gestionar reseñas
                            </Button>
                        </div>
                    </div>

                    <div className="relative group">
                        <PremiumCard unlocked={isPro}
                            title="WhatsApp Business"
                            description="Envíe y reciba mensajes de WhatsApp directamente desde el panel. Mensajes masivos, plantillas y respuestas automáticas."
                            icon={MessageSquare}
                            accent="emerald"
                        />
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[10px] bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 gap-1.5"
                                onClick={async () => {
                                    const id = toast.loading("Conectando con WhatsApp Business API...");
                                    const result = await executePremiumAgent('whatsapp-integration');
                                    if (result.success) {
                                        toast.success(result.message, { id });
                                    } else {
                                        toast.error(result.message || "Error al conectar WhatsApp", { id });
                                    }
                                }}
                            >
                                <Zap className="h-3 w-3" /> Ver Conexión
                            </Button>
                        </div>
                    </div>
                </PremiumSection>
            </SlideIn>
        </div>
    );
}
