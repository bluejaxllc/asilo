"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import {
  ShieldCheck,
  ArrowRight,
  Terminal,
  Lock,
  Users,
  Activity,
  Webhook,
  Bell,
  Eye,
  KeyRound,
  UserCog,
  ShieldAlert,
  Database,
  Cpu,
  Workflow,
  CheckCircle2,
  CircleDot,
  ChevronRight,
} from "lucide-react"

/* ════════════════════════════════════════
   ANIMATION PRIMITIVES
   ════════════════════════════════════════ */

function RevealSection({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >{children}</motion.div>
  )
}

function StaggerContainer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.1 } }, hidden: {} }}
      className={className}
    >{children}</motion.div>
  )
}

function StaggerItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 24, scale: 0.96 }, visible: { opacity: 1, y: 0, scale: 1 } }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >{children}</motion.div>
  )
}

/* ─── Counting number that rolls up from 0 ─── */
function CountUp({ target, suffix = "", delay = 0 }: { target: number; suffix?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    if (!isInView) return
    const timeout = setTimeout(() => {
      const controls = animate(count, target, {
        duration: 1.8,
        ease: [0.16, 1, 0.3, 1],
      })
      const unsub = rounded.on("change", (v) => setDisplay(String(v)))
      return () => { controls.stop(); unsub() }
    }, delay * 1000)
    return () => clearTimeout(timeout)
  }, [isInView, count, target, rounded, delay])

  return <span ref={ref}>{display.padStart(2, '0')}{suffix}</span>
}

/* ─── Typing animation for terminal lines ─── */
function TypingLine({ text, delay = 0, prefix }: { text: string; delay?: number; prefix: React.ReactNode }) {
  const [displayed, setDisplayed] = useState("")
  const [showCursor, setShowCursor] = useState(false)
  const [done, setDone] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const startTimer = setTimeout(() => {
      setShowCursor(true)
      let i = 0
      const interval = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, 22)
      return () => clearInterval(interval)
    }, delay * 1000)
    return () => clearTimeout(startTimer)
  }, [isInView, delay, text])

  return (
    <div ref={ref} className="text-muted-foreground min-h-[1.4em]">
      {showCursor && prefix}
      {displayed}
      {showCursor && !done && <span className="animate-pulse text-blue-400 ml-0.5">▊</span>}
    </div>
  )
}

/* ─── Sequential check item with ✓ appearing ─── */
function BootCheckItem({ label, delay = 0 }: { label: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [phase, setPhase] = useState<"waiting" | "loading" | "done">("waiting")

  useEffect(() => {
    if (!isInView) return
    const t1 = setTimeout(() => setPhase("loading"), delay * 1000)
    const t2 = setTimeout(() => setPhase("done"), (delay + 0.6) * 1000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [isInView, delay])

  return (
    <div ref={ref} className="flex items-center gap-2 text-[11px] font-mono h-5">
      {phase === "waiting" && <span className="text-secondary-foreground w-3">○</span>}
      {phase === "loading" && (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
          className="text-blue-400 w-3 inline-block"
        >◐</motion.span>
      )}
      {phase === "done" && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className="text-emerald-400 w-3"
        >✓</motion.span>
      )}
      <span className={phase === "done" ? "text-muted-foreground" : phase === "loading" ? "text-secondary-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      {phase === "done" && (
        <motion.span
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-muted-foreground ml-auto"
        >OK</motion.span>
      )}
    </div>
  )
}

/* ─── Progress bar that fills up ─── */
function ProgressBar({ label, percentage, delay = 0, color = "blue" }: {
  label: string; percentage: number; delay?: number; color?: string;
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/100",
    emerald: "bg-emerald-500/100",
    amber: "bg-amber-500/100",
    violet: "bg-violet-500",
  }

  return (
    <div ref={ref} className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono">
        <span className="text-muted-foreground">{label}</span>
        <motion.span
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: delay + 0.8, duration: 0.3 }}
        >{percentage}%</motion.span>
      </div>
      <div className="h-1 bg-card rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorMap[color] || colorMap.blue}`}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${percentage}%` } : {}}
          transition={{ delay, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

/* ─── Pipeline node that lights up sequentially ─── */
function PipelineNode({ children, delay = 0, glowColor = "blue" }: {
  children: React.ReactNode; delay?: number; glowColor?: string;
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!isInView) return
    const t = setTimeout(() => setActive(true), delay * 1000)
    return () => clearTimeout(t)
  }, [isInView, delay])

  const glowMap: Record<string, string> = {
    red: "shadow-red-500/30",
    blue: "shadow-blue-500/30",
    emerald: "shadow-emerald-500/30",
    amber: "shadow-amber-500/30",
    violet: "shadow-violet-500/30",
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0.3, scale: 0.95 }}
      animate={active ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={active ? `shadow-lg ${glowMap[glowColor] || ""}` : ""}
      style={{ borderRadius: "inherit" }}
    >
      {children}
    </motion.div>
  )
}

/* ─── Animated connector arrow ─── */
function FlowArrow({ delay = 0 }: { delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!isInView) return
    const t = setTimeout(() => setActive(true), delay * 1000)
    return () => clearTimeout(t)
  }, [isInView, delay])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={active ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.3 }}
    >
      <motion.div animate={active ? { x: [0, 6, 0] } : {}} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}>
        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      </motion.div>
    </motion.div>
  )
}

/* ─── Terminal output line that appears with check ─── */
function TerminalResultLine({ text, delay = 0 }: { text: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isInView) return
    const t = setTimeout(() => setVisible(true), delay * 1000)
    return () => clearTimeout(t)
  }, [isInView, delay])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -10 }}
      animate={visible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="text-muted-foreground"
    >
      <span className="text-muted-foreground">{" "}</span>{" "}
      <motion.span
        initial={{ scale: 0 }}
        animate={visible ? { scale: 1 } : {}}
        transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
        className="text-emerald-400"
      >✓</motion.span>{" "}
      {text}
    </motion.div>
  )
}

/* ════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════ */

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-sidebar text-white overflow-x-hidden" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      <style jsx global>{`
        @keyframes grid-fade { 0%, 100% { opacity: 0.03; } 50% { opacity: 0.08; } }
        @keyframes scan-line { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.08); } 50% { box-shadow: 0 0 50px rgba(59,130,246,0.18); } }
        @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-grid-fade { animation: grid-fade 6s ease-in-out infinite; }
        .animate-scan-line { animation: scan-line 8s linear infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-gradient-shift { background-size: 200% 200%; animation: gradient-shift 4s ease infinite; }
        .glow-border { position: relative; }
        .glow-border::before {
          content: ''; position: absolute; inset: -1px; border-radius: inherit;
          background: linear-gradient(135deg, rgba(59,130,246,0.3), transparent 40%, transparent 60%, rgba(59,130,246,0.15));
          z-index: -1; opacity: 0; transition: opacity 0.5s;
        }
        .glow-border:hover::before { opacity: 1; }
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
              className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center group-hover:bg-blue-500/100 transition-colors animate-pulse-glow">
              <ShieldCheck className="h-4 w-4 text-white" />
            </motion.div>
            <span className="font-bold text-lg text-white" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>.blue_jax</span>
          </Link>
          <div className="flex gap-3 items-center">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-white hover:bg-card/5 text-sm">Iniciar Sesión</Button>
            </Link>
            <Link href="/auth/login?role=admin">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-blue-600 hover:bg-blue-500/100 text-white text-sm h-9 px-4 rounded-lg border border-blue-500/50">Acceso al Sistema</Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="flex-1">
        {/* ═══════════════════════ HERO ═══════════════════════ */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 -z-10 animate-grid-fade" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59,130,246,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
          <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-scan-line" />
          </div>
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.12, 0.05] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[200px] -z-10" />

          <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Copy */}
              <div>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-widest mb-8">
                  <Terminal className="h-3 w-3" /> sistema operativo v1.0
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.1] mb-6">
                  El Sistema Operativo{" "}<br className="hidden md:block" />
                  para{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 animate-gradient-shift">
                    Residencias de Retiro.
                  </span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
                  className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg">
                  Centralice identidades, automatice el cumplimiento normativo y controle su operación médica desde una única infraestructura.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-3">
                  <Link href="/auth/login?role=admin">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button size="lg" className="h-12 px-6 bg-blue-600 hover:bg-blue-500/100 text-white rounded-lg font-semibold text-sm border border-blue-500/50 shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-500/40 w-full sm:w-auto">
                        Solicitar Arquitectura del Sistema <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="ghost" className="h-12 px-6 rounded-lg text-sm text-muted-foreground border border-border/60 bg-transparent hover:border-zinc-500 hover:text-white hover:bg-card/5 w-full sm:w-auto">
                      Acceso Personal Activo
                    </Button>
                  </Link>
                </motion.div>
              </div>

              {/* ───── Dashboard with BOOT SEQUENCE ───── */}
              <motion.div initial={{ opacity: 0, x: 40, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }} className="relative">
                <div className="absolute -inset-6 bg-blue-600/5 rounded-3xl blur-2xl -z-10 animate-pulse-glow" />
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/60 glow-border">
                  {/* Terminal bar */}
                  <div className="bg-card border-b border-border/80 px-4 py-2.5 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                      <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                      <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">blue_jax://control-panel</span>
                    <div className="w-12" />
                  </div>

                  <div className="p-4 space-y-3">
                    {/* ── SYSTEM BOOT CHECKLIST ── */}
                    <div className="bg-background/30 border border-border/50 rounded-lg p-3">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-2">INICIALIZACIÓN DEL SISTEMA</div>
                      <BootCheckItem label="Conectando a base de datos..." delay={0.8} />
                      <BootCheckItem label="Cargando módulos clínicos..." delay={1.6} />
                      <BootCheckItem label="Verificando permisos de rol..." delay={2.4} />
                      <BootCheckItem label="Sincronizando agentes..." delay={3.2} />
                      <BootCheckItem label="Sistema listo." delay={4.0} />
                    </div>

                    {/* ── STATS with COUNT UP ── */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: "RESIDENTES", target: 47, status: "ok", delay: 4.6 },
                        { label: "PERSONAL", target: 12, status: "ok", delay: 4.8 },
                        { label: "ALERTAS", target: 2, status: "warn", delay: 5.0 },
                        { label: "TAREAS", target: 18, status: "ok", delay: 5.2 },
                      ].map((stat) => (
                        <motion.div key={stat.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: stat.delay, duration: 0.4 }}
                          className="bg-background/50 border border-border/50 rounded-lg p-2.5 hover:border-border transition-colors"
                        >
                          <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                          <div className={`text-xl font-mono font-bold mt-0.5 ${stat.status === 'warn' ? 'text-amber-400' : 'text-white'}`}>
                            <CountUp target={stat.target} delay={stat.delay} />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* ── PROGRESS BARS ── */}
                    <div className="bg-background/30 border border-border/50 rounded-lg p-3 space-y-2.5">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">RENDIMIENTO DEL SISTEMA</div>
                      <ProgressBar label="CPU" percentage={34} delay={5.4} color="blue" />
                      <ProgressBar label="MEMORIA" percentage={61} delay={5.7} color="emerald" />
                      <ProgressBar label="ALMACENAMIENTO" percentage={48} delay={6.0} color="violet" />
                    </div>

                    {/* ── EVENT LOG with sequential typing ── */}
                    <div className="bg-background/30 border border-border/50 rounded-lg p-3">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-2">LOG DE EVENTOS</div>
                      <div className="space-y-1 font-mono text-[11px]">
                        <TypingLine delay={6.3} prefix={<><span className="text-muted-foreground">14:32</span>{" "}<span className="text-blue-400">INFO</span>{" "}</>} text="Signos vitales registrados — Hab 204" />
                        <TypingLine delay={7.5} prefix={<><span className="text-muted-foreground">14:28</span>{" "}<span className="text-amber-400">WARN</span>{" "}</>} text="Stock bajo: Omeprazol (3 uds)" />
                        <TypingLine delay={8.7} prefix={<><span className="text-muted-foreground">14:15</span>{" "}<span className="text-emerald-400">OK  </span>{" "}</>} text="Tarea completada — Med. Hab 107" />
                        <TypingLine delay={9.9} prefix={<><span className="text-muted-foreground">13:58</span>{" "}<span className="text-blue-400">INFO</span>{" "}</>} text="Check-in: Enf. Martínez" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════ SYSTEM METRICS ═══════════ */}
        <section className="border-b border-border bg-background">
          <StaggerContainer className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "24/7", label: "Monitoreo Activo", icon: Eye },
              { value: "6", label: "Roles del Sistema", icon: KeyRound },
              { value: "<2s", label: "Tiempo de Respuesta", icon: Activity },
              { value: "AES-256", label: "Cifrado", icon: Lock },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="flex items-center gap-4 group cursor-default">
                  <motion.div whileHover={{ rotate: 5, scale: 1.1 }}
                    className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center group-hover:border-blue-800 group-hover:bg-blue-900/20 transition-all duration-300">
                    <stat.icon className="h-4 w-4 text-blue-500" />
                  </motion.div>
                  <div>
                    <div className="text-xl font-bold font-mono text-white">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ═══════════ AUTOMATION ENGINE ═══════════ */}
        <section className="py-24 border-b border-border relative overflow-hidden">
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.02, 0.06, 0.02] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[200px] -z-10" />

          <div className="max-w-7xl mx-auto px-6">
            <RevealSection>
              <div className="mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-background border border-border text-muted-foreground text-xs font-mono uppercase tracking-widest mb-4">
                  <Workflow className="h-3 w-3 text-blue-500" /> motor de automatización
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Lógica impulsada por{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">eventos</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl text-lg">
                  Cada acción en el sistema dispara evaluaciones automáticas, notificaciones y registros. Sin fricción humana.
                </p>
              </div>
            </RevealSection>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* LEFT — Vertical event flow */}
              <RevealSection delay={0.1}>
                <div className="space-y-0">
                  {/* Step 1: Trigger */}
                  <PipelineNode delay={0.3} glowColor="red">
                    <div className="bg-card border border-red-500/20 rounded-xl p-5 hover:border-red-500/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                          <Activity className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-mono text-red-400 uppercase tracking-wider mb-1">01 — EVENTO DETECTADO</div>
                          <div className="text-sm font-semibold text-white">Signo Vital Crítico Registrado</div>
                          <div className="text-xs font-mono text-muted-foreground mt-1">BP: 180/110 mmHg — Residente #204, Hab 204</div>
                        </div>
                      </div>
                    </div>
                  </PipelineNode>

                  {/* Connector line */}
                  <PipelineNode delay={0.7} glowColor="blue">
                    <div className="flex justify-center py-1">
                      <motion.div
                        className="w-px h-8 bg-gradient-to-b from-red-500/40 to-blue-500/40"
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7, duration: 0.4, ease: "easeOut" }}
                        style={{ transformOrigin: "top" }}
                      />
                    </div>
                  </PipelineNode>

                  {/* Step 2: Rule Engine */}
                  <PipelineNode delay={1.0} glowColor="blue">
                    <div className="bg-card border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <Cpu className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-mono text-blue-400 uppercase tracking-wider mb-1">02 — EVALUACIÓN DE REGLAS</div>
                          <div className="text-sm font-semibold text-white">Motor de Reglas Ejecutado</div>
                          <div className="text-xs font-mono text-muted-foreground mt-1">
                            <span className="text-blue-400/70">if</span> (BP {">"} 160/100) → <span className="text-emerald-400/70">DISPATCH_ALL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PipelineNode>

                  {/* Connector line branching */}
                  <PipelineNode delay={1.5} glowColor="emerald">
                    <div className="flex justify-center py-1">
                      <motion.div
                        className="w-px h-8 bg-gradient-to-b from-blue-500/40 to-emerald-500/40"
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1.5, duration: 0.4, ease: "easeOut" }}
                        style={{ transformOrigin: "top" }}
                      />
                    </div>
                  </PipelineNode>

                  {/* Step 3: Actions dispatched */}
                  <div className="space-y-2">
                    {[
                      { step: "03", label: "WEBHOOK ENVIADO", title: "WhatsApp → Familiar de Residente", detail: "María Sánchez notificada (200 OK, 84ms)", color: "emerald", icon: Webhook, delay: 1.8 },
                      { step: "04", label: "ALERTA GENERADA", title: "Notificación Push → Dr. Ramírez", detail: "type: CRITICAL, priority: IMMEDIATE", color: "amber", icon: Bell, delay: 2.2 },
                      { step: "05", label: "REGISTRO EN BITÁCORA", title: "Audit Log → Entrada #4821", detail: "encrypted: AES-256, immutable: true", color: "violet", icon: Database, delay: 2.6 },
                    ].map((action) => {
                      const colorMap: Record<string, { bg: string; border: string; text: string; borderHover: string }> = {
                        emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", borderHover: "hover:border-emerald-500/30" },
                        amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", borderHover: "hover:border-amber-500/30" },
                        violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", borderHover: "hover:border-violet-500/30" },
                      }
                      const c = colorMap[action.color]
                      return (
                        <PipelineNode key={action.step} delay={action.delay} glowColor={action.color}>
                          <div className={`bg-card border ${c.border} rounded-xl p-4 ${c.borderHover} transition-colors`}>
                            <div className="flex items-start gap-3">
                              <div className={`h-8 w-8 rounded-lg ${c.bg} ${c.border} border flex items-center justify-center flex-shrink-0`}>
                                <action.icon className={`h-4 w-4 ${c.text}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`text-[9px] font-mono ${c.text} uppercase tracking-wider mb-0.5`}>{action.step} — {action.label}</div>
                                <div className="text-xs font-semibold text-white">{action.title}</div>
                                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{action.detail}</div>
                              </div>
                            </div>
                          </div>
                        </PipelineNode>
                      )
                    })}
                  </div>
                </div>
              </RevealSection>

              {/* RIGHT — Terminal output */}
              <RevealSection delay={0.3}>
                <div className="bg-card border border-border rounded-xl overflow-hidden h-full flex flex-col">
                  {/* Terminal title bar */}
                  <div className="bg-card border-b border-border px-4 py-2.5 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">blue_jax://agent-runtime</span>
                    <div className="w-12" />
                  </div>

                  <div className="p-5 font-mono text-[11px] space-y-2 flex-1">
                    <TypingLine delay={0.5}
                      prefix={<><span className="text-muted-foreground">$</span>{" "}<span className="text-blue-400">bjx</span>{" "}</>}
                      text="agent run --event VITAL_CRITICAL --patient 204"
                    />

                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2.0 }}>
                      <div className="text-muted-foreground mt-3 mb-1">────── Ejecución del Pipeline ──────</div>
                    </motion.div>

                    <TerminalResultLine text="event.received    → VITAL_CRITICAL (BP: 180/110)" delay={2.3} />
                    <TerminalResultLine text="rules.evaluate    → BP_CRITICAL matched (3 actions)" delay={2.8} />

                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 3.3 }}>
                      <div className="text-muted-foreground mt-3 mb-1">────── Despacho de Acciones ──────</div>
                    </motion.div>

                    <TerminalResultLine text="webhook.dispatch  → whatsapp_familiar (200, 84ms)" delay={3.6} />
                    <TerminalResultLine text="notify.push       → dr_ramirez (CRITICAL, 120ms)" delay={4.1} />
                    <TerminalResultLine text="audit.write       → #4821 (AES-256, immutable)" delay={4.6} />

                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 5.2 }}>
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 5.4, type: "spring", stiffness: 400 }}
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          </motion.div>
                          <span className="text-emerald-400 font-semibold">Pipeline completado</span>
                          <span className="text-muted-foreground ml-auto">288ms total</span>
                        </div>
                        <div className="text-muted-foreground text-[10px] mt-1">3 acciones ejecutadas, 0 errores, 0 reintentos</div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </RevealSection>
            </div>
          </div>
        </section>

        {/* ═══════════ CAPABILITIES ═══════════ */}
        <section className="py-24 border-b border-border">
          <div className="max-w-7xl mx-auto px-6">
            <RevealSection className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-background border border-border text-muted-foreground text-xs font-mono uppercase tracking-widest mb-4">
                <Cpu className="h-3 w-3 text-blue-500" /> módulos del sistema
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Infraestructura <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">completa</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Cada módulo está diseñado para eliminar procesos manuales y centralizar el control operativo.
              </p>
            </RevealSection>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Users, title: "Identidades y Roles", desc: "Admin, Doctor, Enfermero, Personal, Cocina, Familiar. Cada rol ve solo lo que necesita.", accent: "blue" },
                { icon: Activity, title: "Monitoreo Clínico", desc: "Signos vitales, medicación, bitácora diaria. Historial completo por residente con gráficas de tendencia.", accent: "emerald" },
                { icon: Webhook, title: "Automatizaciones", desc: "Agentes que auditan inventario, asistencia y mensajes. Ejecución programada o manual.", accent: "violet" },
                { icon: Bell, title: "Alertas del Sistema", desc: "Notificaciones tipificadas: INFO, WARNING, CRITICAL. Generadas por agentes o por eventos del personal.", accent: "amber" },
                { icon: Database, title: "Bitácora de Auditoría", desc: "Cada acción deja rastro. Quién, qué, cuándo. Registro inmutable para cumplimiento normativo.", accent: "cyan" },
                { icon: Lock, title: "Cifrado de Datos", desc: "AES-256 en reposo y tránsito. Copias automatizadas. Datos clínicos protegidos por diseño.", accent: "red" },
              ].map((mod) => {
                const a: Record<string, { bg: string; text: string; border: string }> = {
                  blue: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
                  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
                  violet: { bg: "bg-violet-500/10", text: "text-violet-500", border: "border-violet-500/20" },
                  amber: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
                  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/20" },
                  red: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" },
                }
                const c = a[mod.accent]
                return (
                  <StaggerItem key={mod.title}>
                    <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="bg-card border border-border rounded-xl p-5 h-full glow-border hover:shadow-xl transition-shadow duration-500">
                      <div className={`h-10 w-10 rounded-lg ${c.bg} ${c.border} border flex items-center justify-center mb-4`}>
                        <mod.icon className={`h-5 w-5 ${c.text}`} />
                      </div>
                      <h3 className="font-bold text-white mb-1.5">{mod.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{mod.desc}</p>
                    </motion.div>
                  </StaggerItem>
                )
              })}
            </StaggerContainer>
          </div>
        </section>

        {/* ═══════════ ACCESS GOVERNANCE ═══════════ */}
        <section className="py-24 border-b border-border relative overflow-hidden">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.07, 0.03] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[200px] -z-10" />

          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <RevealSection>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-background border border-border text-muted-foreground text-xs font-mono uppercase tracking-widest mb-4">
                  <ShieldAlert className="h-3 w-3 text-blue-500" /> gobierno de acceso
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Control granular de{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">identidades</span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  El administrador asigna roles, autentica usuarios y revoca permisos instantáneamente. Cada sesión es trazable.
                </p>
                <StaggerContainer className="space-y-4">
                  {[
                    "Roles con permisos separados por módulo",
                    "Autenticación multifactor disponible",
                    "Revocación instantánea de acceso",
                    "Log de sesiones y acciones por usuario",
                    "Vinculación familiar-residente verificada",
                  ].map((item) => (
                    <StaggerItem key={item}>
                      <div className="flex items-center gap-3 group">
                        <motion.div whileHover={{ scale: 1.2, rotate: 10 }}>
                          <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
                        </motion.div>
                        <span className="text-sm text-secondary-foreground group-hover:text-white transition-colors">{item}</span>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </RevealSection>

              {/* Access panel with SEQUENTIAL role check-in */}
              <RevealSection delay={0.3}>
                <div className="bg-card border border-border rounded-xl overflow-hidden glow-border">
                  <div className="bg-card border-b border-border px-4 py-2.5 flex items-center gap-2">
                    <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-mono text-muted-foreground">Gestión de Acceso — Panel Admin</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {[
                      { role: "ADMIN", name: "Edgar García", perms: "FULL", status: "active" },
                      { role: "DOCTOR", name: "Dr. Ramírez", perms: "CLINICAL+MEDS", status: "active" },
                      { role: "NURSE", name: "Enf. Martínez", perms: "CLINICAL+TASKS", status: "active" },
                      { role: "STAFF", name: "Aux. López", perms: "TASKS+LOGS", status: "active" },
                      { role: "KITCHEN", name: "Chef Hernández", perms: "DIETARY", status: "active" },
                      { role: "FAMILY", name: "María Sánchez", perms: "READ:PATIENT#204", status: "linked" },
                    ].map((u, i) => (
                      <motion.div key={u.name}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.03)" }}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/40 transition-all cursor-default"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-md bg-card flex items-center justify-center text-[10px] font-mono text-blue-400 font-bold border border-border">
                            {u.role.substring(0, 2)}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-foreground">{u.name}</div>
                            <div className="text-[10px] font-mono text-muted-foreground">{u.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-mono text-muted-foreground hidden sm:block">{u.perms}</span>
                          <div className={`flex items-center gap-1 text-[10px] font-mono ${u.status === 'active' ? 'text-emerald-400' : 'text-blue-400'}`}>
                            <CircleDot className="h-2.5 w-2.5" />
                            {u.status}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </RevealSection>
            </div>
          </div>
        </section>

        {/* ═══════════ CTA ═══════════ */}
        <section className="py-28 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 animate-grid-fade" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59,130,246,0.08) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.03, 0.08, 0.03] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[200px] -z-10" />

          <RevealSection className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para implementar su{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 animate-gradient-shift">infraestructura</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Iniciamos con una fase de descubrimiento para mapear su operación y diseñar la arquitectura ideal para su residencia.
            </p>
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.6 }}>
              <Link href="/auth/login?role=admin">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="h-13 px-8 text-sm font-semibold bg-blue-600 hover:bg-blue-500/100 text-white rounded-lg border border-blue-500/50 shadow-lg shadow-blue-600/25 transition-all hover:shadow-blue-500/40">
                    Iniciar Fase de Descubrimiento <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="ghost" className="h-13 px-8 text-sm rounded-lg text-muted-foreground border border-border/60 bg-transparent hover:border-zinc-500 hover:text-white hover:bg-card/5">
                  Acceso Personal Activo
                </Button>
              </Link>
            </motion.div>
          </RevealSection>
        </section>
      </main>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-white" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>.blue_jax</span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">&copy; 2026 .blue_jax — Infraestructura para Residencias de Retiro</p>
        </div>
      </footer>
    </div>
  )
}
