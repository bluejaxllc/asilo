"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { getAllMedications, assignMedication } from "@/actions/medication";

interface AssignMedicationDialogProps {
    patientId: string;
}

export function AssignMedicationDialog({ patientId }: AssignMedicationDialogProps) {
    const [open, setOpen] = useState(false);
    const [medications, setMedications] = useState<any[]>([]);
    const [selectedMedId, setSelectedMedId] = useState("");
    const [dosage, setDosage] = useState("");
    const [schedule, setSchedule] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            const loadMeds = async () => {
                const data = await getAllMedications();
                setMedications(data);
            };
            loadMeds();
        }
    }, [open]);

    const handleAssign = async () => {
        if (!selectedMedId || !dosage || !schedule) {
            toast.error("Por favor complete todos los campos");
            return;
        }

        setLoading(true);
        const result = await assignMedication(patientId, selectedMedId, dosage, schedule);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success);
            setOpen(false);
            // Reset form
            setSelectedMedId("");
            setDosage("");
            setSchedule("");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Asignar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Asignar Medicamento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Medicamento</Label>
                        <Select value={selectedMedId} onValueChange={setSelectedMedId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar medicamento" />
                            </SelectTrigger>
                            <SelectContent>
                                {medications.map((med) => (
                                    <SelectItem key={med.id} value={med.id}>
                                        {med.name} ({med.stock} {med.unit})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Dosis</Label>
                        <Input
                            placeholder="Ej. 500mg, 1 tableta"
                            value={dosage}
                            onChange={(e) => setDosage(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Frecuencia / Horario</Label>
                        <Input
                            placeholder="Ej. Cada 8 horas, Con alimentos"
                            value={schedule}
                            onChange={(e) => setSchedule(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleAssign} disabled={loading}>
                        {loading ? "Asignando..." : "Guardar Asignación"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
