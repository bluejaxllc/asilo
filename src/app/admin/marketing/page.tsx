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
} from "lucide-react";

export default function MarketingPage() {
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
                    <PremiumCard
                        title="Embudo de Admisiones"
                        description="Landing pages y formularios optimizados para captar familias que buscan un retiro. Seguimiento automático desde la consulta hasta la admisión."
                        icon={TrendingUp}
                        accent="rose"
                    />
                    <PremiumCard
                        title="CRM de Prospectos"
                        description="Pipeline visual: Consulta → Visita Programada → Tour Completado → Admisión. Lead scoring automático por nivel de interés."
                        icon={Users}
                        accent="violet"
                    />
                    <PremiumCard
                        title="Agenda de Visitas Online"
                        description="Familias interesadas agendan tours del retiro directamente desde su sitio web con confirmación automática por email y SMS."
                        icon={CalendarRange}
                        accent="blue"
                    />
                </PremiumSection>
            </SlideIn>

            <SlideIn delay={0.2}>
                <PremiumSection title="Comunicación y Reputación" subtitle="Automatice la comunicación con familias y gestione la reputación online de su retiro.">
                    <PremiumCard
                        title="Campañas Email/SMS"
                        description="Newsletters, recordatorios de eventos, campañas de retención y comunicados masivos a todos los contactos de familias."
                        icon={Mail}
                        accent="cyan"
                    />
                    <PremiumCard
                        title="Gestión de Reseñas"
                        description="Auto-responda a Google Reviews con IA. Envíe solicitudes de reseñas a familias satisfechas para mejorar su presencia online."
                        icon={Star}
                        accent="amber"
                    />
                    <PremiumCard
                        title="WhatsApp Business"
                        description="Envíe y reciba mensajes de WhatsApp directamente desde el panel. Mensajes masivos, plantillas y respuestas automáticas."
                        icon={MessageSquare}
                        accent="emerald"
                    />
                </PremiumSection>
            </SlideIn>
        </div>
    );
}
