"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Monitor, Loader2, ShieldCheck } from "lucide-react";

export default function StationEntryPage() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/station/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Código inválido");
                setLoading(false);
                return;
            }

            // Store station info in localStorage for persistence
            localStorage.setItem("station", JSON.stringify({
                stationId: data.stationId,
                stationName: data.stationName,
                facilityId: data.facilityId,
                facilityName: data.facilityName,
            }));

            router.push("/station/home");
        } catch {
            setError("Error de conexión");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>.blue_jax</span>
                    </div>
                    <p className="text-slate-400 text-sm">Sistema de Gestión de Residencias</p>
                </div>

                {/* Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/20 mb-4">
                            <Monitor className="h-8 w-8 text-emerald-400" />
                        </div>
                        <h1 className="text-xl font-bold text-white mb-2">Configurar Estación</h1>
                        <p className="text-slate-400 text-sm">
                            Ingresa el código de 6 dígitos proporcionado por el administrador para vincular este dispositivo.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                className="w-full h-16 text-center text-3xl font-mono font-bold tracking-[0.5em] rounded-xl border border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || code.length !== 6}
                            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Vincular Estación"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-500 text-xs mt-6">
                    El administrador puede generar códigos de estación desde Configuración → Estaciones
                </p>
            </div>
        </div>
    );
}
