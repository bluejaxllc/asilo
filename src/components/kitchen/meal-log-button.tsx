"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UtensilsCrossed, Check } from "lucide-react";
import { toast } from "sonner";
import { createLog } from "@/actions/logs";
import { useSession } from "next-auth/react";

interface MealLogButtonProps {
    patientId: string;
    patientName: string;
}

const MEAL_OPTIONS = [
    { value: "Desayuno", label: "🌅 Desayuno" },
    { value: "Comida", label: "☀️ Comida" },
    { value: "Cena", label: "🌙 Cena" },
    { value: "Colación", label: "🍎 Colación" },
];

const INTAKE_OPTIONS = [
    { value: "100%", label: "100% — Comió todo" },
    { value: "75%", label: "75% — Buena ingesta" },
    { value: "50%", label: "50% — Ingesta parcial" },
    { value: "25%", label: "25% — Ingesta mínima" },
    { value: "Rechazó", label: "0% — Rechazó alimento" },
];

export const MealLogButton = ({ patientId, patientName }: MealLogButtonProps) => {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [meal, setMeal] = useState("Comida");
    const [intake, setIntake] = useState("100%");
    const [notes, setNotes] = useState("");

    const handleSave = () => {
        if (!session?.user?.email) {
            toast.error("No hay sesión activa");
            return;
        }

        startTransition(async () => {
            const result = await createLog({
                type: "FOOD",
                value: `${meal}: ${intake}`,
                notes: notes.trim() || `${patientName} — ${meal} registrado`,
                patientId,
                userEmail: session.user.email!,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`${meal} registrado para ${patientName}`);
                setOpen(false);
                setNotes("");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 hover:border-orange-500/50 transition-all"
                >
                    <UtensilsCrossed className="h-3.5 w-3.5" />
                    Registrar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px] bg-card border-border">
                <DialogHeader>
                    <DialogTitle>Registrar Alimentación</DialogTitle>
                    <p className="text-sm text-muted-foreground">{patientName}</p>
                </DialogHeader>

                <div className="grid gap-4 py-3">
                    <div className="space-y-2">
                        <Label>Tiempo de Comida</Label>
                        <Select value={meal} onValueChange={setMeal} disabled={isPending}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {MEAL_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Ingesta</Label>
                        <Select value={intake} onValueChange={setIntake} disabled={isPending}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {INTAKE_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Observaciones (opcional)</Label>
                        <Input
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={isPending}
                            placeholder="Ej: Rechazó la sopa, pidió extra fruta"
                            className="bg-background/50"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isPending} className="gap-2 bg-orange-600 hover:bg-orange-700">
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}
                        {isPending ? "Guardando..." : "Registrar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
