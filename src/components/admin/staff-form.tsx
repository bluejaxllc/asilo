"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner";
import { getPatients } from "@/actions/patients";
import { Heart } from "lucide-react";

interface StaffFormProps {
    onSuccess?: () => void;
}

export const StaffForm = ({ onSuccess }: StaffFormProps) => {
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        password: "123456", // Default password
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
                setFormData({ name: "", email: "", role: "", password: "123456", patientId: "" });
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
                <div className="space-y-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <p className="text-xs font-medium text-orange-700 flex items-center gap-1">
                        <Heart className="h-3 w-3" /> Vincular con Residente
                    </p>
                    <Select
                        value={formData.patientId}
                        onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                    >
                        <SelectTrigger className="bg-white">
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

            <p className="text-sm text-muted-foreground">
                Contraseña por defecto: <code className="bg-slate-100 px-2 py-1 rounded">123456</code>
            </p>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registrando..." : formData.role === "FAMILY" ? "Registrar Familiar" : "Registrar Personal"}
            </Button>
        </form>
    )
}
