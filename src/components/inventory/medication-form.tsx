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
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { addMedication } from "@/actions/medication"

const MedicationSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().optional(),
    stockLevel: z.string().refine((val) => !isNaN(Number(val)), "Debe ser un número"),
    minStock: z.string().refine((val) => !isNaN(Number(val)), "Debe ser un número"),
    unit: z.string().min(1, "La unidad es requerida (ej. pastillas, ml)"),
    expiryDate: z.string().optional(),
});

interface MedicationFormProps {
    onSuccess?: () => void;
}

export const MedicationForm = ({ onSuccess }: MedicationFormProps) => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof MedicationSchema>>({
        resolver: zodResolver(MedicationSchema),
        defaultValues: {
            name: "",
            description: "",
            stockLevel: "0",
            minStock: "10",
            unit: "pastillas",
            expiryDate: "",
        },
    });

    const onSubmit = (values: z.infer<typeof MedicationSchema>) => {
        setError("");
        setSuccess("");

        startTransition(async () => {
            const result = await addMedication({
                name: values.name,
                stockLevel: Number(values.stockLevel),
                minStock: Number(values.minStock),
                unit: values.unit,
                expiryDate: values.expiryDate
            });

            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(result.success!);
                form.reset();
                if (onSuccess) {
                    setTimeout(onSuccess, 1000);
                }
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Medicamento</FormLabel>
                            <FormControl>
                                <Input {...field} disabled={isPending} placeholder="Ibuprofeno 400mg" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="stockLevel"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stock Actual</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} type="number" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Unidad</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} placeholder="pastillas, cajas, ml" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="minStock"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Límite de Alerta (Stock Bajo)</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} type="number" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de Caducidad (Opcional)</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} type="date" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>


                <FormError message={error} />
                <FormSuccess message={success} />

                <div className="flex justify-end">
                    <Button disabled={isPending} type="submit">
                        Agregar al Inventario
                    </Button>
                </div>
            </form>
        </Form>
    );
};
