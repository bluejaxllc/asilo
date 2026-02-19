"use client"

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

import { LogIn, Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { CardWrapper } from "@/components/auth/card-wrapper"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"

import { LoginSchema } from "@/schemas";

export const LoginForm = () => {
    const searchParams = useSearchParams();
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
            // Use client-side signIn from next-auth/react
            // This properly sets the session cookie via browser fetch
            const result = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
            });

            if (result?.error) {
                setError("Credenciales inválidas!");
                setIsPending(false);
                return;
            }

            if (result?.ok) {
                setSuccess("¡Iniciando sesión!");

                // Fetch the session to determine role-based redirect
                const sessionRes = await fetch("/api/auth/session");
                const session = await sessionRes.json();

                let redirectUrl = "/staff";
                if (session?.user?.role === "ADMIN") redirectUrl = "/admin";
                else if (session?.user?.role === "FAMILY") redirectUrl = "/family";

                // Full page navigation with history replacement
                window.location.replace(redirectUrl);
            }
        } catch {
            setError("Algo salió mal!");
            setIsPending(false);
        }
    };

    return (
        <CardWrapper
            headerLabel="Bienvenido de nuevo"
            backButtonLabel="¿No tienes cuenta? Regístrate"
            backButtonHref="/auth/register"
            showSocial
        >
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
                                    <FormLabel className="text-slate-300 text-sm font-medium">Correo Electrónico</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="ejemplo@correo.com"
                                            type="email"
                                            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
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
                                    <FormLabel className="text-slate-300 text-sm font-medium">Contraseña</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="••••••••"
                                            type="password"
                                            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
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
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all text-base"
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <LogIn className="mr-2 h-5 w-5" />
                        )}
                        {isPending ? "Iniciando..." : "Iniciar Sesión"}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};
