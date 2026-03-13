"use client"

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import {
    UserPlus, Loader2, Building, Users, ArrowRight,
    ChevronLeft, Plus, Trash2, Mail, Lock, User
} from "lucide-react"

import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { register } from "@/actions/register"

import { RegisterSchema } from "@/schemas";

/* ─── Types ─── */
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

/* ─── Step indicator ─── */
function StepIndicator({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex items-center gap-2 justify-center mb-6">
            {Array.from({ length: total }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className={`
                        h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                        ${i + 1 <= current
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                            : "bg-card border border-border text-muted-foreground"
                        }
                    `}>
                        {i + 1}
                    </div>
                    {i < total - 1 && (
                        <div className={`w-8 h-0.5 rounded-full transition-all duration-300 ${i + 1 < current ? "bg-blue-500" : "bg-border"}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

/* ─── Step titles ─── */
const STEP_CONFIG = [
    { icon: User, title: "Tu Cuenta", subtitle: "Datos de acceso del administrador" },
    { icon: Building, title: "Tu Residencia", subtitle: "Nombre de tu Asilo o Residencia" },
    { icon: Users, title: "Tu Equipo", subtitle: "Invita a tu personal (opcional)" },
];

export const RegisterForm = () => {
    const [step, setStep] = useState(1);
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Staff entries for step 3
    const [staffEntries, setStaffEntries] = useState<StaffEntry[]>([
        { email: "", role: "STAFF" }
    ]);

    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
            facilityName: "",
        },
    });

    const handleNext = async () => {
        setError("");
        if (step === 1) {
            const valid = await form.trigger(["name", "email", "password"]);
            if (valid) setStep(2);
        } else if (step === 2) {
            const valid = await form.trigger(["facilityName"]);
            if (valid) setStep(3);
        }
    };

    const handleBack = () => {
        setError("");
        setStep(step - 1);
    };

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

    const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
        setError("");
        setSuccess("");

        // Filter out empty email entries
        const cleanMembers = staffEntries.filter(e => e.email.trim() !== "");
        const invalidEmails = cleanMembers.filter(e => !e.email.includes("@"));
        if (invalidEmails.length > 0) {
            setError("Uno o más correos no tienen formato válido.");
            return;
        }

        // Attach staff members as JSON
        const submitValues = {
            ...values,
            staffMembers: cleanMembers.length > 0 ? JSON.stringify(cleanMembers) : undefined,
        };

        startTransition(() => {
            register(submitValues)
                .then((data) => {
                    if (data?.error) {
                        setError(data.error);
                    }
                    if (data?.success) {
                        setSuccess(data.success);
                        try { sessionStorage.setItem("_al", values.password); } catch {}
                        setTimeout(() => {
                            router.push(`/auth/verify?email=${encodeURIComponent(values.email)}`);
                        }, 1500);
                    }
                })
        });
    };

    const StepIcon = STEP_CONFIG[step - 1].icon;

    return (
        <div className="w-[480px] max-w-full mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30 border border-border bg-card backdrop-blur-xl">
                {/* Gradient top accent */}
                <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                {/* Progress bar */}
                <div className="w-full h-1 bg-border/30">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {/* Header */}
                <div className="pt-8 pb-2 px-8 text-center">
                    <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg mb-4">
                        <StepIcon className="h-7 w-7 text-white" />
                    </div>
                    <StepIndicator current={step} total={3} />
                    <h1 className="text-2xl font-bold text-foreground mb-1">{STEP_CONFIG[step - 1].title}</h1>
                    <p className="text-sm text-muted-foreground">{STEP_CONFIG[step - 1].subtitle}</p>
                </div>

                {/* Form */}
                <div className="px-8 pt-4 pb-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                            {/* STEP 1: Account Info */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-muted-foreground text-sm font-medium">Nombre Completo</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            {...field}
                                                            disabled={isPending}
                                                            placeholder="Juan Pérez"
                                                            className="h-12 pl-10 bg-card/5 border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-muted-foreground text-sm font-medium">Correo Electrónico</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            {...field}
                                                            disabled={isPending}
                                                            placeholder="ejemplo@correo.com"
                                                            type="email"
                                                            className="h-12 pl-10 bg-card/5 border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-muted-foreground text-sm font-medium">Contraseña</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            {...field}
                                                            disabled={isPending}
                                                            placeholder="Mínimo 6 caracteres"
                                                            type="password"
                                                            className="h-12 pl-10 bg-card/5 border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* STEP 2: Facility Name */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="facilityName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-muted-foreground text-sm font-medium">Nombre de la Residencia</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            {...field}
                                                            disabled={isPending}
                                                            placeholder="Ej: Residencia El Buen Retiro"
                                                            className="h-12 pl-10 bg-card/5 border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500/20 rounded-xl text-base"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Este nombre aparecerá en todos los reportes y pantallas.
                                                </p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4 mt-2">
                                        <h4 className="font-medium flex items-center gap-2 text-blue-400 text-sm">
                                            <Building className="h-4 w-4" />
                                            Entorno Privado
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Tu cuenta incluye una base de datos exclusiva.
                                            Tus pacientes, personal y configuraciones son completamente privados.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Team Invites */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <p className="text-xs text-muted-foreground">
                                        Enviaremos invitaciones por correo. Cada persona recibirá un enlace para crear su cuenta.
                                    </p>

                                    <div className="space-y-3">
                                        {staffEntries.map((entry, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <Input
                                                    type="email"
                                                    placeholder="correo@ejemplo.com"
                                                    value={entry.email}
                                                    onChange={(e) => updateEmail(index, e.target.value)}
                                                    disabled={isPending}
                                                    className="h-11 flex-1 bg-card/5 border-border rounded-xl"
                                                />
                                                <select
                                                    value={entry.role}
                                                    onChange={(e) => updateRole(index, e.target.value as StaffEntry["role"])}
                                                    disabled={isPending}
                                                    className="h-11 rounded-xl border border-border bg-card px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                                                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 shrink-0 h-11 w-11"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addEntry}
                                        disabled={isPending || staffEntries.length >= 10}
                                        className="w-full border-dashed border-border rounded-xl"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Agregar otro miembro
                                    </Button>
                                </div>
                            )}

                            <FormError message={error} />
                            <FormSuccess message={success} />

                            {/* Navigation Buttons */}
                            <div className="flex gap-3 pt-2">
                                {step > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleBack}
                                        disabled={isPending}
                                        className="h-12 flex-1 rounded-xl border-border"
                                    >
                                        <ChevronLeft className="mr-1 h-4 w-4" /> Atrás
                                    </Button>
                                )}

                                {step < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={isPending}
                                        className="h-12 flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all text-base"
                                    >
                                        Continuar <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={isPending || !!success}
                                        className="h-12 flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all text-base"
                                    >
                                        {isPending ? (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            <UserPlus className="mr-2 h-5 w-5" />
                                        )}
                                        {isPending ? "Creando..." : "Crear Cuenta"}
                                    </Button>
                                )}
                            </div>

                            {/* Skip step 3 */}
                            {step === 3 && !isPending && !success && (
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    className="w-full text-muted-foreground text-xs"
                                    onClick={() => setStaffEntries([{ email: "", role: "STAFF" }])}
                                >
                                    Saltar este paso por ahora
                                </Button>
                            )}
                        </form>
                    </Form>
                </div>

                {/* Footer */}
                <div className="px-8 pb-6">
                    <div className="border-t border-border pt-4 text-center space-y-2">
                        <div>
                            <Link
                                href="/auth/login"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                            >
                                ¿Ya tienes cuenta? Inicia sesión
                            </Link>
                        </div>
                        <div>
                            <a href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                ← Volver al inicio
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
