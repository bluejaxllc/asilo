"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { updatePatient } from "@/actions/patients";

interface PatientData {
    id: string;
    name: string;
    room: string | null;
    status: string;
    age: number | null;
    medicalHistory: string | null;
    dietaryNeeds: string | null;
}

interface EditPatientDialogProps {
    patient: PatientData;
}

const STATUS_OPTIONS = [
    { value: "Estable", label: "Estable" },
    { value: "Delicado", label: "Delicado" },
    { value: "Recuperación", label: "Recuperación" },
    { value: "Hospitalizado", label: "Hospitalizado" },
    { value: "Agitada", label: "Agitada" },
];

export const EditPatientDialog = ({ patient }: EditPatientDialogProps) => {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [name, setName] = useState(patient.name);
    const [room, setRoom] = useState(patient.room || "");
    const [status, setStatus] = useState(patient.status);
    const [age, setAge] = useState(patient.age?.toString() || "");
    const [medicalHistory, setMedicalHistory] = useState(patient.medicalHistory || "");
    const [dietaryNeeds, setDietaryNeeds] = useState(patient.dietaryNeeds || "");

    const handleSave = () => {
        if (!name.trim()) {
            toast.error("El nombre es obligatorio");
            return;
        }

        startTransition(async () => {
            const result = await updatePatient(patient.id, {
                name: name.trim(),
                room: room.trim() || undefined,
                status,
                age: age ? parseInt(age) : undefined,
                medicalHistory: medicalHistory.trim() || undefined,
                dietaryNeeds: dietaryNeeds.trim() || undefined,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success);
                setOpen(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="h-4 w-4" /> Editar Residente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card border-border text-white">
                <DialogHeader>
                    <DialogTitle>Editar Residente</DialogTitle>
                    <DialogDescription>
                        Modifique los datos del residente y guarde los cambios.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isPending}
                                className="bg-background/50 border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="room">Habitación</Label>
                            <Input
                                id="room"
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                                disabled={isPending}
                                placeholder="Ej: 101"
                                className="bg-background/50 border-border"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Estado</Label>
                            <Select value={status} onValueChange={setStatus} disabled={isPending}>
                                <SelectTrigger className="bg-background/50 border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="age">Edad</Label>
                            <Input
                                id="age"
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                disabled={isPending}
                                className="bg-background/50 border-border"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="medicalHistory">Historial Médico</Label>
                        <Textarea
                            id="medicalHistory"
                            value={medicalHistory}
                            onChange={(e) => setMedicalHistory(e.target.value)}
                            disabled={isPending}
                            rows={3}
                            className="bg-background/50 border-border resize-none"
                            placeholder="Diagnósticos, alergias, contacto de emergencia..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dietaryNeeds">Necesidades Dietéticas</Label>
                        <Input
                            id="dietaryNeeds"
                            value={dietaryNeeds}
                            onChange={(e) => setDietaryNeeds(e.target.value)}
                            disabled={isPending}
                            placeholder="Ej: Baja en Sodio, Diabético, Normal"
                            className="bg-background/50 border-border"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isPending} className="gap-2">
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isPending ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
