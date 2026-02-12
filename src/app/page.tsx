import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldCheck, Heart, UserCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="px-6 h-16 flex items-center border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <h1 className="font-bold text-xl flex items-center gap-2 text-blue-900">
          <ShieldCheck className="h-6 w-6 text-blue-600" />
          .blue_jax
        </h1>
        <div className="ml-auto flex gap-4">
          <Link href="/auth/login">
            <Button variant="ghost">Iniciar Sesión</Button>
          </Link>
          <Link href="/admin">
            <Button>Ir al Panel</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center overflow-hidden relative">
        {/* Abstract Background - Nano Banana Style */}
        <div className="absolute inset-0 -z-10 bg-white">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px] mix-blend-multiply animate-blob" />
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-[120px] mix-blend-multiply animate-blob animation-delay-2000" />
          <div className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] rounded-full bg-indigo-50/50 blur-[120px] mix-blend-multiply animate-blob animation-delay-4000" />
        </div>

        <div className="max-w-4xl space-y-8 relative z-10 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-blue-100 text-blue-700 text-sm font-medium mb-4 shadow-sm backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            v1.0 Lanzamiento
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Cuidado Moderno para <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Casas de Retiro
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Optimice sus operaciones diarias, gestione turnos del personal y asegure el mejor cuidado para sus residentes con nuestra plataforma inteligente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link href="/admin">
              <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:-translate-y-1 bg-gradient-to-r from-blue-600 to-blue-700">
                Ver Demo Admin
              </Button>
            </Link>
            <Link href="/staff">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto bg-white/80 backdrop-blur-sm hover:bg-white border-slate-200 text-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                App de Personal
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Visual Composition */}
        <div className="mt-16 w-full max-w-6xl mx-auto relative perspective-1000 px-4">
          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/5 blur-[100px] rounded-full -z-10" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Main Image - Caregiver */}
            <div className="md:col-span-7 relative z-20 transform transition-transform hover:scale-[1.02] duration-500">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 ring-1 ring-black/5 aspect-[4/3]">
                <img
                  src="/images/hero-care-modern.png"
                  alt="Cuidado amoroso en residencia"
                  className="w-full h-full object-cover"
                />
                {/* Glass Card Overlay */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-lg flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Satisfacción del Residente</div>
                    <div className="text-xs text-slate-500">98% Calificación Promedio</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Preview - Floating Glass */}
            <div className="md:col-span-5 relative z-10 md:-ml-12 mt-8 md:mt-0">
              <div className="relative rounded-xl border bg-white/95 backdrop-blur shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden transform md:rotate-y-[-12deg] md:rotate-x-[5deg] hover:rotate-0 transition-all duration-700 group">
                <div className="bg-slate-50/50 border-b px-4 py-3 flex gap-2 items-center">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="mx-auto text-[10px] text-slate-400 font-medium bg-white px-2 py-0.5 rounded-full shadow-sm">app.bluejax.ai</div>
                </div>
                <img
                  src="/images/hero-dashboard.png"
                  alt="Asilo Dashboard Preview"
                  className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity"
                />
                {/* Floating Stats */}
                <div className="absolute -right-4 top-20 bg-white p-3 rounded-lg shadow-xl border border-slate-100 animate-float hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <UserCheck className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-700">Turno Mañana</div>
                      <div className="text-[10px] text-green-600 font-medium">● 12 Activos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl w-full text-left">
          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Gestión de Personal</h3>
            <p className="text-slate-500">Controle asistencia, asigne tareas y gestione turnos fácilmente desde cualquier dispositivo.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Cuidado del Residente</h3>
            <p className="text-slate-500">Registros digitales de signos vitales, medicamentos y dietas personalizados para cada paciente.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Seguro y Confiable</h3>
            <p className="text-slate-500">Control de acceso basado en roles, copias de seguridad automáticas y almacenamiento encriptado.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm border-t">
        &copy; 2026 .blue_jax. Todos los derechos reservados.
      </footer>
    </div>
  )
}
