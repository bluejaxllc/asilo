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
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"

// This would typically be in @/schemas
const PatientSchema = z.object({
    firstName: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "El apellido es requerido"),
    dateOfBirth: z.string().optional(),
    roomNumber: z.string().optional(),
    medicalHistory: z.string().optional(),
    dietaryRequirements: z.string().optional(),
    allergies: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
});

interface PatientFormProps {
    onSuccess?: () => void;
}

export const PatientForm = ({ onSuccess }: PatientFormProps) => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof PatientSchema>>({
        resolver: zodResolver(PatientSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            roomNumber: "",
            medicalHistory: "",
            dietaryRequirements: "",
            allergies: "",
            emergencyContactName: "",
            emergencyContactPhone: "",
        },
    });

    const onSubmit = (values: z.infer<typeof PatientSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            // TODO: Call server action to create patient
            console.log(values);
            setSuccess("Residente creado exitosamente! (Simulado)");
            if (onSuccess) onSuccess();
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} placeholder="Juan" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apellido</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} placeholder="Pérez" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de Nacimiento</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} type="date" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="roomNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número de Habitación</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} placeholder="101" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="medicalHistory"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Historial Médico</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    disabled={isPending}
                                    placeholder="Diabetes, Hipertensión, etc."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Alergias</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} placeholder="Penicilina, Mani" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="dietaryRequirements"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Requerimientos Dietéticos</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled={isPending} placeholder="Bajo en Sodio, Comida Suave" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="border-t pt-4 mt-4">
                    <h3 className="font-medium mb-4">Contacto de Emergencia</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="emergencyContactName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isPending} placeholder="Maria Pérez" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="emergencyContactPhone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isPending} placeholder="(55) 1234-5678" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <FormError message={error} />
                <FormSuccess message={success} />

                <div className="flex justify-end">
                    <Button disabled={isPending} type="submit">
                        Crear Residente
                    </Button>
                </div>
            </form>
        </Form>
    );
};
