"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner";

interface StaffFormProps {
    onSuccess?: () => void;
}

export const StaffForm = ({ onSuccess }: StaffFormProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        password: "123456" // Default password
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.role) {
            toast.error("Por favor complete todos los campos");
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
                toast.success("Personal registrado exitosamente");
                setFormData({ name: "", email: "", role: "", password: "123456" });
                onSuccess?.();
            } else {
                toast.error(data.error || "Error al registrar personal");
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
                onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Rol" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="DOCTOR">Doctor/a</SelectItem>
                    <SelectItem value="STAFF">Cuidador/a</SelectItem>
                    <SelectItem value="NURSE">Enfermero/a</SelectItem>
                    <SelectItem value="KITCHEN">Cocina</SelectItem>
                </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
                Contraseña por defecto: <code className="bg-slate-100 px-2 py-1 rounded">123456</code>
            </p>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registrando..." : "Registrar Personal"}
            </Button>
        </form>
    )
}
