"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { OnboardingSchema } from "@/schemas";
import { completeOnboarding } from "@/actions/onboarding";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useRouter } from "next/navigation";
import { FadeIn, SlideIn } from "@/components/ui/motion-wrapper";
import { Building2, Users, ArrowRight, Loader2, Plus, Trash2, CheckCircle2, ChevronLeft, Building } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";

type FormValues = z.infer<typeof OnboardingSchema>;

interface StaffEntry {
    email: string;
    role: "STAFF" | "DOCTOR" | "NURSE" | "KITCHEN" | "FAMILY";
}

const ROLE_OPTIONS: { value: StaffEntry["role"]; label: string }[] = [
    { value: "STAFF", label: "Cuidador" },
    { value: "DOCTOR", label: "Doctor" },
    { value: "NURSE", label: "Enfermera" },
    { value: "KITCHEN", label: "Cocina" },
    { value: "FAMILY", label: "Familiar" },
];

interface OnboardingClientProps {
    initialFacilityName: string;
}

export const OnboardingClient = ({ initialFacilityName }: OnboardingClientProps) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [step, setStep] = useState<number>(1);
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    // Staff entries with email + role
    const [staffEntries, setStaffEntries] = useState<StaffEntry[]>([
        { email: "", role: "STAFF" }
    ]);

    const form = useForm<FormValues>({
        resolver: zodResolver(OnboardingSchema),
        defaultValues: {
            facilityName: initialFacilityName || "",
            staffEmails: [],
            staffMembers: [],
        },
    });

    const addEntry = () => setStaffEntries([...staffEntries, { email: "", role: "STAFF" }]);

    const updateEmail = (index: number, value: string) => {
        const newEntries = [...staffEntries];
        newEntries[index].email = value;
        setStaffEntries(newEntries);
    };

    const updateRole = (index: number, value: StaffEntry["role"]) => {
        const newEntries = [...staffEntries];
        newEntries[index].role = value;
        setStaffEntries(newEntries);
    };

    const removeEntry = (index: number) => {
        const newEntries = [...staffEntries];
        newEntries.splice(index, 1);
        setStaffEntries(newEntries);
    };

    const handleNext = async () => {
        const isValid = await form.trigger("facilityName");
        if (isValid) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
    }

    const onSubmit = (values: FormValues) => {
        setError(undefined);
        setSuccess(undefined);

        // Filter out empty emails
        const cleanMembers = staffEntries.filter(e => e.email.trim() !== "");
        const invalidEmails = cleanMembers.filter(e => !e.email.includes("@"));

        if (invalidEmails.length > 0) {
            setError("Uno o más correos no tienen formato válido.");
            return;
        }

        // Set both for backwards compatibility
        values.staffEmails = cleanMembers.map(m => m.email);
        values.staffMembers = cleanMembers;

        startTransition(() => {
            completeOnboarding(values)
                .then((data) => {
                    if (data?.error) {
                        setError(data.error);
                    }
                    if (data?.success) {
                        setSuccess(data.success);
                        toast.success("¡Configuración completada!");
                        // Brief delay for UX before redirecting so they see the success state
                        setTimeout(() => {
                            router.push("/admin");
                            router.refresh();
                        }, 1000);
                    }
                })
                .catch(() => setError("Ocurrió un error inesperado."));
        });
    };

    return (
        <Card className="w-full border-0 shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden">
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800">
                <div
                    className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
                    style={{ width: step === 1 ? '50%' : '100%' }}
                />
            </div>

            <CardHeader className="text-center pb-2 pt-8">
                <div className="mx-auto bg-blue-50 dark:bg-blue-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                    {step === 1 ? (
                        <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    ) : (
                        <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    )}
                </div>
                <CardTitle className="text-2xl">
                    {step === 1 ? "¡Bienvenido a Asilo!" : "Invita a tu equipo"}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                    {step === 1
                        ? "Vamos a configurar los detalles básicos de tu residencia."
                        : "Agrega a tu equipo — doctores, enfermeras, cuidadores o familiares."}
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* STEP 1 */}
                        {step === 1 && (
                            <FadeIn>
                                <div className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="facilityName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base">Nombre de la Residencia</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        disabled={isPending}
                                                        placeholder="Ej: Residencia El Buen Retiro"
                                                        className="h-12 text-lg"
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Este nombre aparecerá en todos los reportes y pantallas.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 mt-6">
                                        <h4 className="font-medium flex items-center gap-2 text-amber-800 dark:text-amber-400">
                                            <Building2 className="h-4 w-4" />
                                            Entorno Aislado
                                        </h4>
                                        <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-1">
                                            Tu cuenta ha sido provisionada con una base de datos exclusiva.
                                            Tus pacientes, personal y configuraciones son completamente privados.
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        className="w-full h-12 text-base mt-4"
                                    >
                                        Continuar <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </FadeIn>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <SlideIn direction="right">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <FormLabel className="text-base block">Miembros del Equipo</FormLabel>
                                        <FormDescription className="mb-4">
                                            Enviaremos invitaciones por correo electrónico. Cada persona recibirá un enlace para crear su contraseña y acceder al sistema.
                                        </FormDescription>

                                        {staffEntries.map((entry, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Input
                                                    type="email"
                                                    placeholder="correo@ejemplo.com"
                                                    value={entry.email}
                                                    onChange={(e) => updateEmail(index, e.target.value)}
                                                    disabled={isPending}
                                                    className="h-11 flex-1"
                                                />
                                                <select
                                                    value={entry.role}
                                                    onChange={(e) => updateRole(index, e.target.value as StaffEntry["role"])}
                                                    disabled={isPending}
                                                    className="h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                                >
                                                    {ROLE_OPTIONS.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                                {staffEntries.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeEntry(index)}
                                                        disabled={isPending}
                                                        className="text-red-600 dark:text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 shrink-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addEntry}
                                            disabled={isPending || staffEntries.length >= 10}
                                            className="w-full mt-2 border-dashed"
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Agregar otro miembro
                                        </Button>
                                    </div>

                                    <FormError message={error} />
                                    <FormSuccess message={success} />

                                    <div className="grid grid-cols-2 gap-4 mt-8">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleBack}
                                            disabled={isPending || !!success}
                                            className="h-12"
                                        >
                                            <ChevronLeft className="mr-2 h-4 w-4" /> Atrás
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isPending || !!success}
                                            className="h-12"
                                        >
                                            {isPending ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : success ? (
                                                <CheckCircle2 className="h-5 w-5" />
                                            ) : (
                                                "Finalizar Configuración"
                                            )}
                                        </Button>
                                    </div>
                                    {!isPending && !success && (
                                        <Button
                                            type="submit"
                                            variant="ghost"
                                            className="w-full text-muted-foreground mt-2"
                                            onClick={() => {
                                                setStaffEntries([{ email: "", role: "STAFF" }]);
                                            }}
                                        >
                                            Saltar este paso por ahora
                                        </Button>
                                    )}
                                </div>
                            </SlideIn>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};
