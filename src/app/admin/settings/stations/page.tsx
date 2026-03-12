"use client";

import { useState, useEffect, useCallback } from "react";
import { Monitor, Plus, Trash2, Loader2, Copy, Check, Key, User } from "lucide-react";
import { toast } from "sonner";

type Station = {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    createdAt: string;
};

type StaffMember = {
    id: string;
    name: string | null;
    email: string;
    role: string;
    pin: string | null;
};

const ROLE_LABELS: Record<string, string> = {
    STAFF: "Cuidador",
    DOCTOR: "Doctor",
    NURSE: "Enfermera",
    KITCHEN: "Cocina",
    ADMIN: "Admin",
    FAMILY: "Familiar",
};

export default function StationsSettingsPage() {
    const [stations, setStations] = useState<Station[]>([]);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [creating, setCreating] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [editingPin, setEditingPin] = useState<string | null>(null);
    const [pinInput, setPinInput] = useState("");

    const loadData = useCallback(async () => {
        try {
            const [stationsRes, staffRes] = await Promise.all([
                fetch("/api/admin/stations"),
                fetch("/api/staff"),
            ]);
            const stationsData = await stationsRes.json();
            const staffData = await staffRes.json();
            if (Array.isArray(stationsData)) setStations(stationsData);
            if (Array.isArray(staffData)) setStaff(staffData);
        } catch {
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const createStation = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        try {
            const res = await fetch("/api/admin/stations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim() }),
            });
            if (res.ok) {
                toast.success("Estación creada");
                setNewName("");
                loadData();
            } else {
                const data = await res.json();
                toast.error(data.error || "Error al crear");
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setCreating(false);
        }
    };

    const deactivateStation = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/stations?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Estación desactivada");
                loadData();
            }
        } catch {
            toast.error("Error al desactivar");
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success("Código copiado");
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const savePin = async (userId: string) => {
        if (!/^\d{4}$/.test(pinInput)) {
            toast.error("El PIN debe ser de 4 dígitos");
            return;
        }
        try {
            const res = await fetch("/api/admin/pins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, pin: pinInput }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || "PIN actualizado");
                setEditingPin(null);
                setPinInput("");
                loadData();
            } else {
                toast.error(data.error || "Error al guardar PIN");
            }
        } catch {
            toast.error("Error de conexión");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <Monitor className="h-6 w-6" />
                    Estaciones (Modo Kiosco)
                </h2>
                <p className="text-muted-foreground mt-1">
                    Configura pantallas compartidas para personal sin teléfono.
                    Cada estación tiene un código de vinculación de 6 dígitos.
                </p>
            </div>

            {/* Create Station */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Crear Nueva Estación</h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Ej: Enfermería Planta 1, Recepción..."
                        className="flex-1 h-11 rounded-lg border border-input bg-background px-4 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        onKeyDown={(e) => e.key === "Enter" && createStation()}
                    />
                    <button
                        onClick={createStation}
                        disabled={creating || !newName.trim()}
                        className="h-11 px-5 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
                    >
                        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Crear
                    </button>
                </div>
            </div>

            {/* Stations List */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">Estaciones Activas</h3>
                </div>
                {stations.filter(s => s.isActive).length === 0 ? (
                    <div className="px-6 py-8 text-center text-muted-foreground">
                        No hay estaciones creadas todavía
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {stations.filter(s => s.isActive).map((station) => (
                            <div key={station.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-foreground">{station.name}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="font-mono text-lg tracking-wider text-blue-500 font-bold">{station.code}</span>
                                        <button
                                            onClick={() => copyCode(station.code)}
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {copiedCode === station.code ? (
                                                <Check className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deactivateStation(station.id)}
                                    className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                    title="Desactivar estación"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Staff PINs */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        PINs del Personal
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                        Asigna un PIN de 4 dígitos a cada miembro para que pueda usar las estaciones.
                    </p>
                </div>
                {staff.length === 0 ? (
                    <div className="px-6 py-8 text-center text-muted-foreground">
                        No hay personal registrado
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {staff.map((member) => (
                            <div key={member.id} className="px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{member.name || member.email}</p>
                                        <p className="text-muted-foreground text-sm">
                                            {ROLE_LABELS[member.role] || member.role}
                                            {member.pin && <span className="ml-2 text-blue-500">PIN: ••••</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {editingPin === member.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={pinInput}
                                                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                                placeholder="0000"
                                                maxLength={4}
                                                className="w-20 h-9 text-center font-mono text-lg border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring outline-none"
                                                autoFocus
                                                onKeyDown={(e) => e.key === "Enter" && savePin(member.id)}
                                            />
                                            <button
                                                onClick={() => savePin(member.id)}
                                                className="h-9 px-3 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => { setEditingPin(null); setPinInput(""); }}
                                                className="h-9 px-3 rounded-lg text-muted-foreground hover:bg-muted text-sm"
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => { setEditingPin(member.id); setPinInput(""); }}
                                            className="h-9 px-4 rounded-lg border border-input text-foreground text-sm font-medium hover:bg-muted transition-colors"
                                        >
                                            {member.pin ? "Cambiar PIN" : "Asignar PIN"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Usage Instructions */}
            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-6">
                <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-3">¿Cómo usar las Estaciones?</h3>
                <ol className="space-y-2 text-sm text-blue-700 dark:text-blue-300/80">
                    <li><strong>1.</strong> Crea una estación arriba y copia el código de 6 dígitos.</li>
                    <li><strong>2.</strong> En la tablet/computadora compartida, abre <strong>retiro.bluejax.ai/station</strong></li>
                    <li><strong>3.</strong> Ingresa el código para vincular el dispositivo.</li>
                    <li><strong>4.</strong> Asigna PINs de 4 dígitos al personal que usará la estación.</li>
                    <li><strong>5.</strong> El personal ingresa su PIN para registrar acciones rápidamente.</li>
                </ol>
            </div>
        </div>
    );
}
