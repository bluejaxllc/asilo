"use client"

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"

const LogSchema = z.object({
    type: z.enum(["VITALS", "FOOD", "MEDS", "NOTE"]),
    value: z.string().min(1, "El valor es requerido"),
    notes: z.string().optional(),
});

interface LogFormProps {
    initialType?: "VITALS" | "FOOD" | "MEDS" | "NOTE";
    patientName: string;
    patientId: string;
    onSuccess?: () => void;
}

import { createLog } from "@/actions/logs";
import { useSession } from "next-auth/react";
import { toast } from "sonner"; // Using sonner for consistent toasts

export const LogForm = ({ initialType = "NOTE", patientName, patientId, onSuccess }: LogFormProps) => {
    const { data: session } = useSession();
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof LogSchema>>({
        resolver: zodResolver(LogSchema),
        defaultValues: {
            type: initialType,
            value: "",
            notes: "",
        },
    });

    const onSubmit = (values: z.infer<typeof LogSchema>) => {
        setError("");
        setSuccess("");

        if (!session?.user?.email) {
            setError("No hay sesión activa");
            return;
        }

        startTransition(async () => {
            const result = await createLog({
                ...values,
                patientId,
                userEmail: session.user.email!
            });

            if (result.error) {
                setError(result.error);
                toast.error(result.error);
            } else {
                setSuccess(result.success);
                toast.success(result.success);
                if (onSuccess) {
                    setTimeout(onSuccess, 1000); // Close after 1s
                }
            }
        });
    };

    const type = form.watch("type");

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Registro</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione tipo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="VITALS">Signos Vitales (PA, Temp, etc.)</SelectItem>
                                    <SelectItem value="FOOD">Alimentación</SelectItem>
                                    <SelectItem value="MEDS">Administración Medicamentos</SelectItem>
                                    <SelectItem value="NOTE">Nota General</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                {type === "VITALS" && "Lectura (ej. 120/80 mmHg, 36.5°C)"}
                                {type === "FOOD" && "Cantidad Ingerida (ej. 100%, 50%, rechazó)"}
                                {type === "MEDS" && "Nombre y Dosis de Medicamento"}
                                {type === "NOTE" && "Asunto"}
                            </FormLabel>
                            <FormControl>
                                <Input {...field} disabled={isPending} placeholder={
                                    type === "VITALS" ? "120/80" :
                                        type === "FOOD" ? "Comió todo" :
                                            type === "MEDS" ? "Paracetamol 500mg" : "Reporte de incidente"
                                } />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Observación / Notas</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    disabled={isPending}
                                    placeholder="El residente parecía agitado..."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormError message={error} />
                <FormSuccess message={success} />

                <div className="flex justify-end">
                    <Button disabled={isPending} type="submit" className="w-full h-12 text-lg">
                        Guardar Entrada
                    </Button>
                </div>
            </form>
        </Form>
    );
};
