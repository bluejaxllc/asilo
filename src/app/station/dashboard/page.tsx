"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Activity, UtensilsCrossed, Droplets, AlertTriangle,
    CheckSquare, Clock, LogOut, ArrowLeft, Loader2,
    User, ChevronRight, Save, X
} from "lucide-react";

type StationInfo = {
    stationId: string;
    stationName: string;
    facilityId: string;
    facilityName: string;
};

type StationUser = {
    userId: string;
    name: string;
    role: string;
};

type Patient = {
    id: string;
    name: string;
    room: string | null;
    status: string;
};

type ActionType = "VITALS" | "FOOD" | "HYGIENE" | "INCIDENT" | "ATTENDANCE_IN" | "ATTENDANCE_OUT" | null;

const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes

const ROLE_LABELS: Record<string, string> = {
    STAFF: "Cuidador",
    DOCTOR: "Doctor",
    NURSE: "Enfermera",
    KITCHEN: "Cocina",
    ADMIN: "Administrador",
    FAMILY: "Familiar",
};

const ACTION_CARDS = [
    { type: "VITALS" as const, icon: Activity, label: "Signos Vitales", color: "from-red-500 to-rose-600", description: "Presión, temperatura, pulso" },
    { type: "FOOD" as const, icon: UtensilsCrossed, label: "Comida", color: "from-amber-500 to-orange-600", description: "Registrar alimentación" },
    { type: "HYGIENE" as const, icon: Droplets, label: "Higiene", color: "from-cyan-500 to-blue-600", description: "Baño, cambio de ropa" },
    { type: "INCIDENT" as const, icon: AlertTriangle, label: "Incidente", color: "from-red-600 to-red-700", description: "Caída, emergencia" },
];

export default function StationDashboardPage() {
    const router = useRouter();
    const [station, setStation] = useState<StationInfo | null>(null);
    const [user, setUser] = useState<StationUser | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedAction, setSelectedAction] = useState<ActionType>(null);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [notes, setNotes] = useState("");
    const [value, setValue] = useState("");
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

    // Load session
    useEffect(() => {
        const stationData = localStorage.getItem("station");
        const userData = localStorage.getItem("stationUser");
        if (!stationData || !userData) {
            router.push("/station");
            return;
        }
        const s = JSON.parse(stationData);
        const u = JSON.parse(userData);
        setStation(s);
        setUser(u);

        // Load patients
        fetch(`/api/station/log?facilityId=${s.facilityId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setPatients(data);
            })
            .catch(console.error);
    }, [router]);

    // Auto-lock on inactivity
    const resetInactivity = useCallback(() => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        inactivityTimer.current = setTimeout(() => {
            localStorage.removeItem("stationUser");
            router.push("/station/home");
        }, INACTIVITY_TIMEOUT);
    }, [router]);

    useEffect(() => {
        const events = ["mousedown", "touchstart", "keydown", "scroll"];
        events.forEach(e => window.addEventListener(e, resetInactivity));
        resetInactivity();
        return () => {
            events.forEach(e => window.removeEventListener(e, resetInactivity));
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        };
    }, [resetInactivity]);

    const handleLogout = () => {
        localStorage.removeItem("stationUser");
        router.push("/station/home");
    };

    const handleSaveLog = async () => {
        if (!user || !station) return;
        setSaving(true);
        setSuccess("");

        try {
            const res = await fetch("/api/station/log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.userId,
                    facilityId: station.facilityId,
                    type: selectedAction,
                    patientId: selectedPatient?.id || null,
                    notes,
                    value: value || null,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setSuccess(data.message || "Guardado ✓");
                setNotes("");
                setValue("");
                setSelectedPatient(null);
                setSelectedAction(null);
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch {
            setSuccess("Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    const handleAttendance = async (type: "ATTENDANCE_IN" | "ATTENDANCE_OUT") => {
        if (!user || !station) return;
        setSaving(true);

        try {
            const res = await fetch("/api/station/log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.userId,
                    facilityId: station.facilityId,
                    type,
                }),
            });

            const data = await res.json();
            setSuccess(data.message || data.error || "Hecho");
            setTimeout(() => setSuccess(""), 3000);
        } catch {
            setSuccess("Error de conexión");
        } finally {
            setSaving(false);
        }
    };

    if (!station || !user) return null;

    // Form view for a selected action
    if (selectedAction && selectedAction !== "ATTENDANCE_IN" && selectedAction !== "ATTENDANCE_OUT") {
        const actionConfig = ACTION_CARDS.find(a => a.type === selectedAction);

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => { setSelectedAction(null); setSelectedPatient(null); setNotes(""); setValue(""); }}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Volver</span>
                    </button>
                    <div className="flex items-center gap-2 text-slate-400">
                        <User className="h-4 w-4" />
                        <span className="text-sm">{user.name}</span>
                    </div>
                </div>

                <div className="max-w-lg mx-auto space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        {actionConfig && <actionConfig.icon className="h-7 w-7" />}
                        {actionConfig?.label}
                    </h2>

                    {/* Patient Selector */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Paciente</label>
                        {selectedPatient ? (
                            <div className="flex items-center justify-between bg-slate-700/50 rounded-xl p-4 border border-slate-600/30">
                                <div>
                                    <p className="text-white font-medium">{selectedPatient.name}</p>
                                    {selectedPatient.room && <p className="text-slate-400 text-sm">Habitación {selectedPatient.room}</p>}
                                </div>
                                <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-white">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-2 max-h-48 overflow-y-auto rounded-xl border border-slate-600/30 p-2 bg-slate-800/30">
                                {patients.length === 0 ? (
                                    <p className="text-slate-500 text-sm text-center py-4">No hay pacientes registrados</p>
                                ) : (
                                    patients.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedPatient(p)}
                                            className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-slate-700/50 transition-colors text-left"
                                        >
                                            <div>
                                                <p className="text-white text-sm font-medium">{p.name}</p>
                                                {p.room && <p className="text-slate-500 text-xs">Hab. {p.room}</p>}
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-500" />
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Value field for vitals */}
                    {selectedAction === "VITALS" && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Valor (ej: 120/80, 36.5°C)</label>
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Presión, temperatura, pulso..."
                                className="w-full h-12 rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Notas (opcional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Observaciones adicionales..."
                            rows={3}
                            className="w-full rounded-xl border border-slate-600 bg-slate-900/50 text-white px-4 py-3 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSaveLog}
                        disabled={saving || !selectedPatient}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-lg"
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {saving ? "Guardando..." : "Guardar Registro"}
                    </button>
                </div>
            </div>
        );
    }

    // Main dashboard view
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">¡Hola, {user.name}!</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {ROLE_LABELS[user.role] || user.role} • {station.stationName}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 text-slate-300 hover:text-white transition-all"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Cerrar</span>
                </button>
            </div>

            {/* Success Toast */}
            {success && (
                <div className="fixed top-4 right-4 bg-emerald-500/90 text-white px-6 py-3 rounded-xl shadow-lg backdrop-blur-sm animate-in slide-in-from-right z-50">
                    {success}
                </div>
            )}

            {/* Action Cards Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {ACTION_CARDS.map((action) => (
                    <button
                        key={action.type}
                        onClick={() => setSelectedAction(action.type)}
                        className="group p-6 rounded-2xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 hover:border-slate-600/50 transition-all text-left"
                    >
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform`}>
                            <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-white font-semibold text-lg">{action.label}</h3>
                        <p className="text-slate-400 text-sm mt-1">{action.description}</p>
                    </button>
                ))}
            </div>

            {/* Attendance Row */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => handleAttendance("ATTENDANCE_IN")}
                    disabled={saving}
                    className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/20 hover:border-emerald-500/30 transition-all"
                >
                    <Clock className="h-5 w-5 text-emerald-400" />
                    <span className="text-emerald-300 font-semibold">Registrar Entrada</span>
                </button>
                <button
                    onClick={() => handleAttendance("ATTENDANCE_OUT")}
                    disabled={saving}
                    className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/20 hover:border-rose-500/30 transition-all"
                >
                    <Clock className="h-5 w-5 text-rose-400" />
                    <span className="text-rose-300 font-semibold">Registrar Salida</span>
                </button>
            </div>

            {/* Task completion - coming soon */}
            <div className="mt-6 p-5 rounded-2xl bg-slate-800/30 border border-slate-700/20 opacity-60">
                <div className="flex items-center gap-3">
                    <CheckSquare className="h-5 w-5 text-slate-500" />
                    <div>
                        <h3 className="text-slate-400 font-medium">Tareas Asignadas</h3>
                        <p className="text-slate-500 text-sm">Próximamente</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
