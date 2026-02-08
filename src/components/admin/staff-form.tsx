"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const StaffForm = () => {
    return (
        <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Nombre" />
                <Input placeholder="Apellido" />
            </div>
            <Input placeholder="Correo Electrónico" type="email" />
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Rol" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="doctor">Doctor/a</SelectItem>
                    <SelectItem value="caregiver">Cuidador/a</SelectItem>
                    <SelectItem value="nurse">Enfermero/a</SelectItem>
                    <SelectItem value="kitchen">Cocina</SelectItem>
                    <SelectItem value="cleaning">Limpieza</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
            </Select>
            <Button className="w-full">Registrar Personal</Button>
        </form>
    )
}
