"use client"

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { deletePatient } from "@/actions/patient";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeletePatientButtonProps {
    patientId: string;
    patientName: string;
    onSuccess?: () => void;
}

export const DeletePatientButton = ({ patientId, patientName, onSuccess }: DeletePatientButtonProps) => {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const onDelete = () => {
        startTransition(() => {
            deletePatient(patientId)
                .then((data) => {
                    if (data?.error) {
                        toast.error(data.error);
                    } else {
                        toast.success("Residente eliminado");
                        setOpen(false);
                        if (onSuccess) {
                            onSuccess();
                        } else {
                            router.refresh();
                        }
                    }
                })
                .catch(() => toast.error("Algo salió mal"));
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Eliminar Residente">
                    <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente el expediente de{" "}
                        <span className="font-semibold">{patientName}</span> y todos sus registros asociados.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onDelete();
                        }}
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isPending ? "Eliminando..." : "Eliminar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
