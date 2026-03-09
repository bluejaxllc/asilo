"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner";
import { getPatients } from "@/actions/patients";
import { Heart, Mail, Loader2 } from "lucide-react";

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
                toast.success(
                    `Invitación enviada a ${formData.email}`,
                    { description: "El usuario recibirá un correo para crear su contraseña.", duration: 6000 }
                );
                setFormData({ name: "", email: "", role: "", patientId: "" });
                onSuccess?.();
            } else {
                toast.error(data.error || "Error al enviar invitación");
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
                            <Heart className="h-3 w-3 text-orange-600 dark:text-orange-500" /> Familiar
                        </span>
                    </SelectItem>
                </SelectContent>
            </Select>

            {formData.role === "FAMILY" && (
                <div className="space-y-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
                        <Heart className="h-3 w-3" /> Vincular con Residente
                    </p>
                    <Select
                        value={formData.patientId}
                        onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                    >
                        <SelectTrigger className="bg-card">
                            <SelectValue placeholder="Seleccionar Residente" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                            {patients.length > 0 ? (
                                patients.map((patient) => (
                                    <SelectItem key={patient.id} value={patient.id}>
                                        {patient.name} — Hab. {patient.room || "S/N"}
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-3 text-sm text-center text-muted-foreground">
                                    No hay residentes registrados
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Info box explaining the magic link flow */}
            <div className="flex items-start gap-2.5 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Mail className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Se enviará un <strong className="text-foreground">enlace de invitación</strong> por correo electrónico.
                    El usuario creará su propia contraseña al aceptar la invitación.
                </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Enviando invitación...</>
                ) : (
                    <><Mail className="h-4 w-4 mr-2" /> {formData.role === "FAMILY" ? "Invitar Familiar" : "Invitar Personal"}</>
                )}
            </Button>
        </form>
    )
}
