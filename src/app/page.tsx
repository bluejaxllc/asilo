import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ShieldCheck,
  Heart,
  UserCheck,
  ClipboardList,
  Activity,
  Utensils,
  Bell,
  BarChart3,
  Lock,
  ArrowRight,
  Sparkles,
  Users,
  Clock,
  Star,
} from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="px-6 h-16 flex items-center border-b border-slate-100 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">.blue_jax</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">Iniciar Sesión</Button>
            </Link>
            <Link href="/admin">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20">
                Ir al Panel
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* Abstract Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/60 blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/60 blur-[120px] animate-pulse" style={{ animationDuration: "10s" }} />
            <div className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] rounded-full bg-indigo-50/60 blur-[120px] animate-pulse" style={{ animationDuration: "12s" }} />
          </div>

          <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Plataforma de Gestión v1.0
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Cuidado Moderno para <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Casas de Retiro
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
              Optimice sus operaciones diarias, gestione turnos del personal y asegure el mejor cuidado para sus residentes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admin">
                <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl">
                  Ver Demo Admin <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/staff">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 rounded-xl">
                  <ClipboardList className="mr-2 h-5 w-5" /> App de Personal
                </Button>
              </Link>
              <Link href="/family">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 rounded-xl">
                  <Heart className="mr-2 h-5 w-5" /> Portal Familiar
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="max-w-6xl mx-auto px-6 pb-20 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/5 blur-[100px] rounded-full -z-10" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Main Image */}
              <div className="md:col-span-7 relative z-20">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 ring-1 ring-black/5 aspect-[4/3] hover:scale-[1.01] transition-transform duration-700">
                  <img
                    src="/images/hero-care-modern.png"
                    alt="Cuidado amoroso en residencia"
                    className="w-full h-full object-cover"
                  />
                  {/* Glass Overlay */}
                  <div className="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-lg flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Satisfacción del Residente</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="text-amber-500 flex">
                          {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                        </span>
                        98% Calificación
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Preview */}
              <div className="md:col-span-5 relative z-10 md:-ml-12 mt-8 md:mt-0">
                <div className="relative rounded-xl border bg-white/95 backdrop-blur shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.2)] transition-all duration-500 group">
                  <div className="bg-slate-50/50 border-b px-4 py-3 flex gap-2 items-center">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="mx-auto text-[10px] text-slate-400 font-medium bg-white px-3 py-0.5 rounded-full shadow-sm border border-slate-100">app.bluejax.ai</div>
                  </div>
                  <img
                    src="/images/hero-dashboard.png"
                    alt="Dashboard Preview"
                    className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity"
                  />
                  {/* Floating Card */}
                  <div className="absolute -right-3 top-20 bg-white p-3 rounded-xl shadow-xl border border-slate-100 hidden md:flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                      <UserCheck className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-700">Turno Mañana</div>
                      <div className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" /> 12 Activos
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="border-y border-slate-100 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "24/7", label: "Monitoreo Activo", icon: Clock },
              { value: "98%", label: "Satisfacción", icon: Heart },
              { value: "100+", label: "Residentes", icon: Users },
              { value: "50+", label: "Personal Capacitado", icon: UserCheck },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-4">
                Funcionalidades
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Todo lo que necesita para una <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">gestión integral</span>
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Herramientas diseñadas específicamente para casas de retiro y residencias de adultos mayores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: UserCheck, title: "Gestión de Personal", desc: "Controle asistencia, asigne tareas y gestione turnos fácilmente desde cualquier dispositivo.", color: "blue" },
                { icon: Heart, title: "Cuidado del Residente", desc: "Registros digitales de signos vitales, medicamentos y dietas personalizados para cada paciente.", color: "emerald" },
                { icon: Utensils, title: "Cocina y Nutrición", desc: "Supervision de dietas especiales, alertas de alergias y control de alimentación por habitación.", color: "orange" },
                { icon: Activity, title: "Signos Vitales", desc: "Registro y seguimiento de signos vitales en tiempo real con historial completo por residente.", color: "rose" },
                { icon: Bell, title: "Notificaciones", desc: "Alertas en tiempo real para eventos críticos, tareas pendientes y cambios de estado.", color: "amber" },
                { icon: BarChart3, title: "Reportes y Analítica", desc: "Dashboards interactivos con métricas de desempeño, ocupación y tendencias de salud.", color: "violet" },
              ].map((feature, i) => {
                const colorStyles: Record<string, string> = {
                  blue: "from-blue-500 to-blue-600 shadow-blue-500/20",
                  emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
                  orange: "from-orange-500 to-orange-600 shadow-orange-500/20",
                  rose: "from-rose-500 to-rose-600 shadow-rose-500/20",
                  amber: "from-amber-500 to-amber-600 shadow-amber-500/20",
                  violet: "from-violet-500 to-violet-600 shadow-violet-500/20",
                };

                return (
                  <div key={i} className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 hover:-translate-y-1 transition-all duration-300">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${colorStyles[feature.color]} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6 border border-white/10">
                  <Lock className="h-3.5 w-3.5" />
                  Seguridad
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Protección de datos de <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">nivel empresarial</span>
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed mb-8">
                  Control de acceso basado en roles, copias de seguridad automáticas y almacenamiento encriptado para proteger la información de sus residentes.
                </p>
                <Link href="/admin">
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl h-12 px-6 font-semibold shadow-lg">
                    Explorar el Sistema <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Control de Acceso", desc: "Roles: Admin, Personal, Familia" },
                  { label: "Cifrado de Datos", desc: "AES-256 en tránsito y reposo" },
                  { label: "Respaldos Auto.", desc: "Cada 24 horas automáticamente" },
                  { label: "Auditoría", desc: "Registro de todas las acciones" },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <div className="text-sm font-bold text-white mb-1">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              ¿Listo para transformar su residencia?
            </h2>
            <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
              Comience hoy con una demostración completa de nuestra plataforma. Sin compromiso, sin tarjeta de crédito.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admin">
                <Button size="lg" className="h-14 px-10 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all rounded-xl">
                  Comenzar Demo Gratis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-xl border-slate-200">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">.blue_jax</span>
          </div>
          <p className="text-sm text-slate-400">&copy; 2026 .blue_jax. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
