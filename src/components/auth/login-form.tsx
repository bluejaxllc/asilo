"use client"
import Link from "next/link"

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

import {
    LogIn, Loader2, ShieldCheck, ClipboardList, Heart,
    Users, Stethoscope, UtensilsCrossed
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

import { LoginSchema } from "@/schemas";

/* ─── Role Theme Definitions ─── */
type RoleTheme = {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    buttonText: string;
    gradient: string;
    buttonGradient: string;
    shadowColor: string;
    accentBar: string;
    iconBg: string;
    inputFocus: string;
    backLabel: string;
};

const roleThemes: Record<string, RoleTheme> = {
    admin: {
        icon: ShieldCheck,
        title: "Panel de Administración",
        subtitle: "Gestione su residencia con confianza y control total",
        buttonText: "Acceder como Administrador",
        gradient: "from-blue-600 to-indigo-600",
        buttonGradient: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
        shadowColor: "shadow-blue-500/25 hover:shadow-blue-500/40",
        accentBar: "from-blue-500 via-indigo-500 to-purple-500",
        iconBg: "from-blue-500 to-indigo-600",
        inputFocus: "focus:border-blue-500 focus:ring-blue-500/20",
        backLabel: "← Volver al inicio",
    },
    staff: {
        icon: ClipboardList,
        title: "Portal del Personal",
        subtitle: "Acceda a sus tareas, registros y turnos asignados",
        buttonText: "Acceder como Personal",
        gradient: "from-teal-600 to-cyan-600",
        buttonGradient: "from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700",
        shadowColor: "shadow-teal-500/25 hover:shadow-teal-500/40",
        accentBar: "from-teal-400 via-cyan-500 to-teal-600",
        iconBg: "from-teal-500 to-cyan-600",
        inputFocus: "focus:border-teal-500 focus:ring-teal-500/20",
        backLabel: "← Volver al inicio",
    },
    family: {
        icon: Heart,
        title: "Portal Familiar",
        subtitle: "Manténgase cerca de su ser querido, siempre informado",
        buttonText: "Acceder como Familiar",
        gradient: "from-orange-500 to-amber-500",
        buttonGradient: "from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
        shadowColor: "shadow-orange-500/25 hover:shadow-orange-500/40",
        accentBar: "from-orange-400 via-amber-500 to-orange-600",
        iconBg: "from-orange-500 to-amber-600",
        inputFocus: "focus:border-orange-500 focus:ring-orange-500/20",
        backLabel: "← Volver al inicio",
    },
    doctor: {
        icon: Stethoscope,
        title: "Portal Médico",
        subtitle: "Consulte expedientes y registros clínicos",
        buttonText: "Acceder como Médico",
        gradient: "from-emerald-600 to-green-600",
        buttonGradient: "from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700",
        shadowColor: "shadow-emerald-500/25 hover:shadow-emerald-500/40",
        accentBar: "from-emerald-400 via-green-500 to-emerald-600",
        iconBg: "from-emerald-500 to-green-600",
        inputFocus: "focus:border-emerald-500 focus:ring-emerald-500/20",
        backLabel: "← Volver al inicio",
    },
    nurse: {
        icon: Users,
        title: "Portal de Enfermería",
        subtitle: "Administre medicamentos y registre signos vitales",
        buttonText: "Acceder como Enfermera",
        gradient: "from-pink-600 to-rose-600",
        buttonGradient: "from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700",
        shadowColor: "shadow-pink-500/25 hover:shadow-pink-500/40",
        accentBar: "from-pink-400 via-rose-500 to-pink-600",
        iconBg: "from-pink-500 to-rose-600",
        inputFocus: "focus:border-pink-500 focus:ring-pink-500/20",
        backLabel: "← Volver al inicio",
    },
    kitchen: {
        icon: UtensilsCrossed,
        title: "Portal de Cocina",
        subtitle: "Gestione menús, dietas y requerimientos nutricionales",
        buttonText: "Acceder como Cocina",
        gradient: "from-yellow-600 to-orange-500",
        buttonGradient: "from-yellow-600 to-orange-500 hover:from-yellow-700 hover:to-orange-600",
        shadowColor: "shadow-yellow-500/25 hover:shadow-yellow-500/40",
        accentBar: "from-yellow-400 via-orange-400 to-yellow-600",
        iconBg: "from-yellow-500 to-orange-500",
        inputFocus: "focus:border-yellow-500 focus:ring-yellow-500/20",
        backLabel: "← Volver al inicio",
    },
};

const defaultTheme: RoleTheme = {
    icon: ShieldCheck,
    title: "Bienvenido de nuevo",
    subtitle: "Inicie sesión para acceder a la plataforma",
    buttonText: "Iniciar Sesión",
    gradient: "from-blue-600 to-indigo-600",
    buttonGradient: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
    shadowColor: "shadow-blue-500/25 hover:shadow-blue-500/40",
    accentBar: "from-blue-500 via-indigo-500 to-purple-500",
    iconBg: "from-blue-500 to-indigo-600",
    inputFocus: "focus:border-blue-500 focus:ring-blue-500/20",
    backLabel: "← Volver al inicio",
};

export const LoginForm = () => {
    const searchParams = useSearchParams();
    const roleParam = searchParams.get("role")?.toLowerCase() || "";
    const theme = roleThemes[roleParam] || defaultTheme;
    const Icon = theme.icon;

    const urlError = searchParams.get("error") === "OAuthAccountNotLinked"
        ? "Email already in use with different provider!"
        : "";

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, setIsPending] = useState(false);

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
        setError("");
        setSuccess("");
        setIsPending(true);

        try {
            // Explicitly use current origin so NextAuth doesn't fall back to VERCEL_URL
            const origin = window.location.origin;

            const result = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
                callbackUrl: origin,
            });

            if (result?.error) {
                // Check if this is an unverified email (error comes as generic CredentialsSignin)
                // We need to check against a server action
                const checkRes = await fetch(`${origin}/api/auth/check-verified?email=${encodeURIComponent(values.email)}`);
                if (checkRes.ok) {
                    const checkData = await checkRes.json();
                    if (checkData.needsVerification) {
                        setError("Tu correo no ha sido verificado. Redirigiendo...");
                        setTimeout(() => {
                            window.location.replace(`${origin}/auth/verify?email=${encodeURIComponent(values.email)}`);
                        }, 1500);
                        return;
                    }
                }
                setError("Credenciales inválidas!");
                setIsPending(false);
                return;
            }

            if (result?.ok) {
                setSuccess("¡Iniciando sesión!");
                const sessionRes = await fetch(`${origin}/api/auth/session`);
                const session = await sessionRes.json();

                let redirectPath = "/staff";
                if (session?.user?.role === "SUPER_ADMIN") redirectPath = "/super-admin";
                else if (session?.user?.role === "ADMIN") redirectPath = "/admin";
                else if (session?.user?.role === "FAMILY") redirectPath = "/family";

                window.location.replace(`${origin}${redirectPath}`);
            }
        } catch {
            setError("Algo salió mal!");
            setIsPending(false);
        }
    };

    return (
        <div className="w-[440px] max-w-full mx-auto">
            {/* Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30 border border-border bg-card backdrop-blur-xl">
                {/* Gradient top accent */}
                <div className={`h-1.5 bg-gradient-to-r ${theme.accentBar}`} />

                {/* Header */}
                <div className="pt-10 pb-2 px-8 text-center">
                    <div className={`h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br ${theme.iconBg} flex items-center justify-center shadow-lg mb-5`}>
                        <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">{theme.title}</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">{theme.subtitle}</p>
                </div>

                {/* Form */}
                <div className="px-8 pt-6 pb-8">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-5"
                        >
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-muted-foreground text-sm font-medium">Correo Electrónico</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="ejemplo@correo.com"
                                                    type="email"
                                                    className={`h-12 bg-card/5 border-border text-foreground placeholder:text-muted-foreground ${theme.inputFocus} rounded-xl transition-colors`}
                                                />
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
                                                <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="••••••••"
                                                    type="password"
                                                    className={`h-12 bg-card/5 border-border text-foreground placeholder:text-muted-foreground ${theme.inputFocus} rounded-xl transition-colors`}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormError message={error || urlError} />
                            <FormSuccess message={success} />

                            <Button
                                disabled={isPending}
                                type="submit"
                                size="lg"
                                className={`w-full h-12 bg-gradient-to-r ${theme.buttonGradient} text-white font-semibold rounded-xl shadow-lg ${theme.shadowColor} transition-all text-base`}
                            >
                                {isPending ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <LogIn className="mr-2 h-5 w-5" />
                                )}
                                {isPending ? "Iniciando..." : theme.buttonText}
                            </Button>
                        </form>
                    </Form>

                    {/* Divider */}
                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-3 text-muted-foreground">o continuar con</span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        disabled={isPending}
                        onClick={() => signIn("google", { callbackUrl: "/admin" })}
                        className="w-full h-12 rounded-xl border-border bg-card/5 text-foreground hover:bg-card/20 transition-all font-medium"
                    >
                        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continuar con Google
                    </Button>
                </div>

                {/* Footer */}
                <div className="px-8 pb-8">
                    <div className="border-t border-border pt-5 text-center space-y-3">
                        <div>
                            <Link
                                href="/auth/register"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                            >
                                ¿No tiene cuenta? Crear cuenta nueva
                            </Link>
                        </div>
                        <div>
                            <a
                                href="/"
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {theme.backLabel}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
