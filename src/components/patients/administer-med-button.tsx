"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Pill, Check } from "lucide-react";
import { toast } from "sonner";
import { logMedicationAdministration } from "@/actions/medication";
import { cn } from "@/lib/utils";

interface AdministerMedButtonProps {
    patientId: string;
    medicationName: string;
    dosage: string;
}

export const AdministerMedButton = ({ patientId, medicationName, dosage }: AdministerMedButtonProps) => {
    const [isPending, startTransition] = useTransition();
    const [justAdministered, setJustAdministered] = useState(false);

    const handleAdminister = () => {
        startTransition(async () => {
            const result = await logMedicationAdministration(patientId, medicationName, dosage);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Dosis de ${medicationName} registrada`);
                setJustAdministered(true);
                // Reset success state after a few seconds
                setTimeout(() => setJustAdministered(false), 3000);
            }
        });
    };

    return (
        <Button
            size="sm"
            variant={justAdministered ? "secondary" : "default"}
            className={cn("gap-2 transition-all", justAdministered && "bg-emerald-500/15 text-emerald-400 hover:bg-green-200")}
            onClick={handleAdminister}
            disabled={isPending || justAdministered}
        >
            {justAdministered ? (
                <>
                    <Check className="h-4 w-4" /> Registrado
                </>
            ) : (
                <>
                    <Pill className="h-4 w-4" />
                    {isPending ? "Registrando..." : "Registrar Dosis"}
                </>
            )}
        </Button>
    );
};
