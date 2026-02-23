"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner";
import { getPatients } from "@/actions/patients";
import { Heart, RefreshCw, Eye, EyeOff } from "lucide-react";

interface StaffFormProps {
    onSuccess?: () => void;
}

function generatePassword(length = 8): string {
    const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

export const StaffForm = ({ onSuccess }: StaffFormProps) => {
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        password: "",
        patientId: ""
    });

    // Load patients when FAMILY role is selected
    useEffect(() => {
        if (formData.role === "FAMILY") {
            getPatients().then(setPatients);
        }
    }, [formData.role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.role) {
            toast.error("Por favor complete todos los campos");
            return;
        }

        if (!formData.password || formData.password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        if (formData.role === "FAMILY" && !formData.patientId) {
            toast.error("Seleccione el residente asociado");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/staff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(formData.role === "FAMILY"
                    ? "Familiar registrado exitosamente"
                    : "Personal registrado exitosamente"
                );
                setFormData({ name: "", email: "", role: "", password: "", patientId: "" });
                onSuccess?.();
            } else {
                toast.error(data.error || "Error al registrar");
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                placeholder="Nombre completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
                placeholder="Correo Electrónico"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value, patientId: "" })}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Rol" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="DOCTOR">Doctor/a</SelectItem>
                    <SelectItem value="STAFF">Cuidador/a</SelectItem>
                    <SelectItem value="NURSE">Enfermero/a</SelectItem>
                    <SelectItem value="KITCHEN">Cocina</SelectItem>
                    <SelectItem value="FAMILY">
                        <span className="flex items-center gap-2">
                            <Heart className="h-3 w-3 text-orange-500" /> Familiar
                        </span>
                    </SelectItem>
                </SelectContent>
            </Select>

            {formData.role === "FAMILY" && (
                <div className="space-y-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <p className="text-xs font-medium text-orange-400 flex items-center gap-1">
                        <Heart className="h-3 w-3" /> Vincular con Residente
                    </p>
                    <Select
                        value={formData.patientId}
                        onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                    >
                        <SelectTrigger className="bg-card">
                            <SelectValue placeholder="Seleccionar Residente" />
                        </SelectTrigger>
                        <SelectContent>
                            {patients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id}>
                                    {patient.name} — Hab. {patient.room || "S/N"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="space-y-1.5">
                <label className="text-sm font-medium">Contraseña</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            placeholder="Mínimo 6 caracteres"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            const pwd = generatePassword();
                            setFormData({ ...formData, password: pwd });
                            setShowPassword(true);
                            toast.info(`Contraseña generada: ${pwd}`, { duration: 8000 });
                        }}
                        title="Generar contraseña aleatoria"
                        className="flex-shrink-0"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                    Escriba una contraseña o presione el botón para generar una aleatoria.
                </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registrando..." : formData.role === "FAMILY" ? "Registrar Familiar" : "Registrar Personal"}
            </Button>
        </form>
    )
}
