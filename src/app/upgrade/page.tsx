"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
    ShieldCheck,
    Check,
    X,
    Sparkles,
    ArrowRight,
    Bot,
    BarChart3,
    MessageCircle,
    Megaphone,
    Brain,
    Zap,
    Star,
    TrendingUp,
    Palette,
    UserCog,
    ClipboardCheck,
    Users,
    ExternalLink,
    ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ════════════════════════════════════════
   ANIMATION HELPERS
   ════════════════════════════════════════ */

function FadeUp({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >{children}</motion.div>
    );
}

function StaggerGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-40px" });
    return (
        <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"}
            variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
            className={className}
        >{children}</motion.div>
    );
}

function StaggerCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1 } }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >{children}</motion.div>
    );
}

/* ════════════════════════════════════════
   DATA
   ════════════════════════════════════════ */

const tiers = [
    {
        name: "Esencial",
        price: "Incluido",
        priceSub: "con certificación",
        description: "Todo lo necesario para operar una residencia de retiro de forma digital.",
        accent: "zinc",
        features: [
            "Gestión de residentes",
            "Control de personal y turnos",
            "Inventario médico",
            "Bitácora diaria",
            "Tareas y asignaciones",
            "Notificaciones básicas",
            "Portal de familias",
            "Cifrado AES-256",
        ],
        cta: "Plan Actual",
        ctaDisabled: true,
    },
    {
        name: "Pro",
        price: "$2,499",
        priceSub: "MXN / mes",
        description: "IA, automatización y analíticas avanzadas para residencias que quieren crecer.",
        accent: "blue",
        popular: true,
        features: [
            "Todo en Esencial",
            "Agentes de IA autónomos",
            "Resumen de riesgos con IA",
            "Alertas predictivas",
            "Reportes avanzados",
            "Métricas de eficiencia",
            "Mensajería WhatsApp",
            "Reputación online (Google Reviews)",
            "Embudo de captación",
            "Campañas de marketing",
            "Bitácora de auditoría completa",
        ],
        cta: "Activar Pro",
        ctaHref: process.env.NEXT_PUBLIC_CHECKOUT_LINK || "https://links.bluejax.ai/payment-link/69aa5d3584b2d70ea05f9733",
    },
    {
        name: "Enterprise",
        price: "Custom",
        priceSub: "contactar ventas",
        description: "Para cadenas de residencias y operaciones multi-sede con requerimientos a medida.",
        accent: "violet",
        features: [
            "Todo en Pro",
            "White-label / marca propia",
            "Control de acceso granular",
            "CRM de familias avanzado",
            "Multi-sede centralizado",
            "API e integraciones custom",
            "SLA dedicado",
            "Soporte prioritario 24/7",
        ],
        cta: "Contactar Ventas",
        ctaHref: "https://www.bluejax.ai/contact",
    },
];

const proFeatures = [
    { icon: Bot, title: "Agentes de IA", description: "Agentes autónomos que auditan inventario, asistencia y generan reportes sin intervención humana.", accent: "fuchsia" },
    { icon: Brain, title: "Resumen de Riesgos", description: "Informe diario generado por IA que detecta residentes en riesgo y sugiere intervenciones preventivas.", accent: "violet" },
    { icon: Zap, title: "Alertas Predictivas", description: "Detección temprana de anomalías en signos vitales con recomendaciones automáticas.", accent: "amber" },
    { icon: BarChart3, title: "Reportes Avanzados", description: "Analíticas de ocupación, rendimiento por turno, tendencias clínicas y comparativos históricos.", accent: "cyan" },
    { icon: MessageCircle, title: "WhatsApp Integrado", description: "Comunicación directa con familias via WhatsApp. Mensajes automatizados de seguimiento.", accent: "emerald" },
    { icon: Star, title: "Reputación Online", description: "Auto-responda Google Reviews con IA y solicite reseñas a familias satisfechas.", accent: "amber" },
    { icon: Megaphone, title: "Marketing & Captación", description: "Campañas automatizadas, landing pages y seguimiento desde la primera consulta.", accent: "rose" },
    { icon: TrendingUp, title: "Embudo de Ventas", description: "Pipeline visual: Consulta → Visita → Admisión. Lead scoring automático.", accent: "blue" },
    { icon: Palette, title: "White Label", description: "Personalice logo, colores, nombre y dominio para presentar el sistema como propio.", accent: "violet" },
    { icon: UserCog, title: "Control Granular", description: "Permisos detallados por rol: qué módulos pueden ver, editar o eliminar.", accent: "blue" },
    { icon: ClipboardCheck, title: "Auditoría Completa", description: "Registro inmutable de quién hizo qué, cuándo y dónde. Cumplimiento normativo total.", accent: "amber" },
    { icon: Users, title: "CRM de Familias", description: "Gestión completa de prospectos y familias con seguimiento automatizado.", accent: "rose" },
];

const comparisonRows = [
    { feature: "Residentes ilimitados", essential: true, pro: true, enterprise: true },
    { feature: "Personal y turnos", essential: true, pro: true, enterprise: true },
    { feature: "Inventario médico", essential: true, pro: true, enterprise: true },
    { feature: "Bitácora diaria", essential: true, pro: true, enterprise: true },
    { feature: "Portal de familias", essential: true, pro: true, enterprise: true },
    { feature: "Cifrado AES-256", essential: true, pro: true, enterprise: true },
    { feature: "Agentes de IA", essential: false, pro: true, enterprise: true },
    { feature: "Alertas predictivas", essential: false, pro: true, enterprise: true },
    { feature: "Reportes avanzados", essential: false, pro: true, enterprise: true },
    { feature: "WhatsApp integrado", essential: false, pro: true, enterprise: true },
    { feature: "Marketing & campañas", essential: false, pro: true, enterprise: true },
    { feature: "Reputación online", essential: false, pro: true, enterprise: true },
    { feature: "White label", essential: false, pro: false, enterprise: true },
    { feature: "Multi-sede", essential: false, pro: false, enterprise: true },
    { feature: "API custom", essential: false, pro: false, enterprise: true },
    { feature: "SLA dedicado", essential: false, pro: false, enterprise: true },
];

/* ════════════════════════════════════════
   ACCENT MAP
   ════════════════════════════════════════ */
const accentColors: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-500", border: "border-blue-500/20" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-500", border: "border-emerald-500/20" },
    violet: { bg: "bg-violet-500/10", text: "text-violet-500", border: "border-violet-500/20" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-500", border: "border-amber-500/20" },
    cyan: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-500", border: "border-cyan-500/20" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-500", border: "border-rose-500/20" },
    fuchsia: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-500", border: "border-fuchsia-500/20" },
};

/* ════════════════════════════════════════
   PAGE
   ════════════════════════════════════════ */

export default function UpgradePage() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

            <style jsx global>{`
                @keyframes grid-fade { 0%, 100% { opacity: 0.03; } 50% { opacity: 0.08; } }
                @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.08); } 50% { box-shadow: 0 0 50px rgba(59,130,246,0.18); } }
                @keyframes gradient-shift { background-size: 200% 200%; animation: gradient-shift 4s ease infinite; }
                .animate-grid-fade { animation: grid-fade 6s ease-in-out infinite; }
                .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
            `}</style>

            {/* ═══════════ HEADER ═══════════ */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="px-6 h-16 flex items-center border-b border-border bg-sidebar/80 backdrop-blur-xl sticky top-0 z-50"
            >
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <motion.div whileHover={{ rotate: 5, scale: 1.1 }} transition={{ type: "spring", stiffness: 400 }}
                            className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center group-hover:bg-blue-500 transition-colors animate-pulse-glow">
                            <ShieldCheck className="h-4 w-4 text-white" />
                        </motion.div>
                        <span className="font-bold text-lg text-foreground" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>.blue_jax</span>
                    </Link>
                    <div className="flex gap-3 items-center">
                        <Link href="/">
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-card/5 text-sm gap-1.5">
                                <ChevronLeft className="h-3.5 w-3.5" /> Inicio
                            </Button>
                        </Link>
                        <Link href="/auth/login?role=admin">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button className="bg-blue-600 hover:bg-blue-500 text-white text-sm h-9 px-4 rounded-lg border border-blue-500/50">Acceso al Sistema</Button>
                            </motion.div>
                        </Link>
                    </div>
                </div>
            </motion.header>

            <main className="flex-1">
                {/* ═══════════ HERO ═══════════ */}
                <section className="relative overflow-hidden border-b border-border">
                    <div className="absolute inset-0 -z-10 animate-grid-fade" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59,130,246,0.15) 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }} />
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.12, 0.05] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[200px] -z-10" />

                    <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
                            <Sparkles className="h-3 w-3" /> BlueJax Pro
                        </motion.div>
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
                            Lleve su residencia al{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400">
                                siguiente nivel
                            </span>
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
                            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
                            IA, automatización, analíticas avanzadas y herramientas de crecimiento diseñadas específicamente para residencias de retiro.
                        </motion.p>
                    </div>
                </section>

                {/* ═══════════ PRICING TIERS ═══════════ */}
                <section className="py-16 border-b border-border">
                    <div className="max-w-6xl mx-auto px-6">
                        <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {tiers.map((tier) => {
                                const isPopular = tier.popular;
                                const tierBorder = isPopular
                                    ? "border-blue-500/40 shadow-xl shadow-blue-500/10"
                                    : tier.accent === "violet"
                                        ? "border-violet-500/20"
                                        : "border-border";

                                return (
                                    <StaggerCard key={tier.name}>
                                        <div className={`relative rounded-2xl border ${tierBorder} bg-card p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
                                            {isPopular && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-blue-600/30">
                                                        <Sparkles className="h-3 w-3" /> Más Popular
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mb-6">
                                                <h3 className="text-lg font-bold text-foreground mb-1">{tier.name}</h3>
                                                <div className="flex items-baseline gap-1.5 mb-2">
                                                    <span className="text-3xl font-extrabold text-foreground font-mono">{tier.price}</span>
                                                    <span className="text-sm text-muted-foreground">{tier.priceSub}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{tier.description}</p>
                                            </div>

                                            <div className="flex-1 space-y-2.5 mb-6">
                                                {tier.features.map((f) => (
                                                    <div key={f} className="flex items-center gap-2.5 text-sm">
                                                        <Check className={`h-4 w-4 flex-shrink-0 ${isPopular ? "text-blue-600 dark:text-blue-500" : tier.accent === "violet" ? "text-violet-500" : "text-emerald-600 dark:text-emerald-500"}`} />
                                                        <span className="text-muted-foreground">{f}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {tier.ctaDisabled ? (
                                                <Button variant="outline" className="w-full h-11 text-sm font-semibold" disabled>
                                                    {tier.cta}
                                                </Button>
                                            ) : (
                                                <a href={tier.ctaHref} target="_blank" rel="noopener noreferrer">
                                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                        <Button className={`w-full h-11 text-sm font-semibold gap-2 ${isPopular
                                                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                                                            : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20"
                                                            }`}>
                                                            {tier.cta} <ExternalLink className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </motion.div>
                                                </a>
                                            )}
                                        </div>
                                    </StaggerCard>
                                );
                            })}
                        </StaggerGrid>
                    </div>
                </section>

                {/* ═══════════ FEATURE GRID ═══════════ */}
                <section className="py-20 border-b border-border relative overflow-hidden">
                    <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.02, 0.06, 0.02] }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[200px] -z-10" />

                    <div className="max-w-6xl mx-auto px-6">
                        <FadeUp className="text-center mb-14">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                                <Sparkles className="h-3 w-3" /> Funcionalidades Pro
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Todo lo que desbloquea{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">BlueJax Pro</span>
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Herramientas avanzadas que transforman la operación de su residencia con inteligencia artificial y automatización.
                            </p>
                        </FadeUp>

                        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {proFeatures.map((feat) => {
                                const c = accentColors[feat.accent] || accentColors.blue;
                                return (
                                    <StaggerCard key={feat.title}>
                                        <div className="bg-card border border-border rounded-xl p-5 h-full hover:border-border/80 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                                            <div className={`h-10 w-10 rounded-lg ${c.bg} ${c.border} border flex items-center justify-center mb-4`}>
                                                <feat.icon className={`h-5 w-5 ${c.text}`} />
                                            </div>
                                            <h3 className="font-bold text-foreground mb-1.5">{feat.title}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
                                        </div>
                                    </StaggerCard>
                                );
                            })}
                        </StaggerGrid>
                    </div>
                </section>

                {/* ═══════════ COMPARISON TABLE ═══════════ */}
                <section className="py-20 border-b border-border">
                    <div className="max-w-4xl mx-auto px-6">
                        <FadeUp className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-3">Comparativa de planes</h2>
                            <p className="text-muted-foreground">Vea exactamente qué incluye cada nivel.</p>
                        </FadeUp>

                        <FadeUp delay={0.15}>
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-card border-b border-border">
                                                <th className="text-left p-4 font-semibold text-muted-foreground">Funcionalidad</th>
                                                <th className="text-center p-4 font-semibold text-muted-foreground w-28">Esencial</th>
                                                <th className="text-center p-4 font-semibold w-28">
                                                    <span className="text-blue-600 dark:text-blue-400">Pro</span>
                                                </th>
                                                <th className="text-center p-4 font-semibold w-28">
                                                    <span className="text-violet-400">Enterprise</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisonRows.map((row, i) => (
                                                <tr key={row.feature} className={`border-b border-border/50 ${i % 2 === 0 ? "" : "bg-card/30"} hover:bg-card/60 transition-colors`}>
                                                    <td className="p-4 text-foreground">{row.feature}</td>
                                                    <td className="p-4 text-center">
                                                        {row.essential
                                                            ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-500 mx-auto" />
                                                            : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {row.pro
                                                            ? <Check className="h-4 w-4 text-blue-600 dark:text-blue-500 mx-auto" />
                                                            : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {row.enterprise
                                                            ? <Check className="h-4 w-4 text-violet-500 mx-auto" />
                                                            : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </FadeUp>
                    </div>
                </section>

                {/* ═══════════ CTA ═══════════ */}
                <section className="py-20 relative overflow-hidden">
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.08, 0.03] }}
                        transition={{ duration: 8, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600 rounded-full blur-[160px] -z-10" />

                    <FadeUp className="max-w-3xl mx-auto px-6 text-center">
                        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-500/5 to-transparent p-10 md:p-14">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-5">
                                <Sparkles className="h-3 w-3" /> Listo para empezar
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Transforme su residencia{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">hoy</span>
                            </h2>
                            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                                Agende una demostración personalizada y descubra cómo BlueJax Pro puede optimizar cada aspecto de su operación.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <a href="https://www.bluejax.ai/contact" target="_blank" rel="noopener noreferrer">
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Button size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm border border-blue-500/50 shadow-lg shadow-blue-600/20 w-full sm:w-auto">
                                            Solicitar Demo <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                </a>
                                <Link href="/auth/login?role=admin">
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Button size="lg" variant="ghost" className="h-12 px-8 rounded-lg text-sm text-muted-foreground border border-border/60 bg-transparent hover:border-zinc-500 hover:text-foreground w-full sm:w-auto">
                                            Acceso al Sistema
                                        </Button>
                                    </motion.div>
                                </Link>
                            </div>
                        </div>
                    </FadeUp>
                </section>
            </main>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="border-t border-border bg-sidebar/50 px-6 py-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
                            <ShieldCheck className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="font-bold text-sm text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>.blue_jax</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        SISTEMA OPERATIVO v1.0
                    </div>
                </div>
            </footer>
        </div>
    );
}
