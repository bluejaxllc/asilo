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
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            v1.0 Lanzamiento
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
            Cuidado Moderno para <br />
            <span className="text-blue-600">Casas de Retiro</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Optimice sus operaciones diarias, gestione turnos del personal, controle medicamentos y asegure el mejor cuidado para sus residentes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/admin">
              <Button size="lg" className="h-12 px-8 text-lg w-full sm:w-auto shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow">
                Ver Demo Admin
              </Button>
            </Link>
            <Link href="/staff">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg w-full sm:w-auto bg-white hover:bg-slate-50">
                App de Personal (Tablet)
              </Button>
            </Link>
          </div>
        </div>

        {/* Browser Mockup - Dashboard */}
        <div className="mt-16 relative w-full max-w-5xl mx-auto perspective-1000">
          <div className="absolute inset-0 bg-blue-600 blur-[100px] opacity-20 rounded-full" />
          <div className="relative rounded-xl border bg-white shadow-2xl overflow-hidden transform rotate-x-12 transition-transform duration-700 hover:rotate-x-0">
            <div className="bg-slate-100 border-b px-4 py-2 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <img
              src="/images/hero-dashboard.png"
              alt="Asilo Dashboard Preview"
              className="w-full h-auto object-cover"
            />
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
