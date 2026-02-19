"use client"

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"

import { UserPlus, Loader2 } from "lucide-react"

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
import { register } from "@/actions/register"

import { RegisterSchema } from "@/schemas";

export const RegisterForm = () => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
        },
    });

    const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            register(values)
                .then((data) => {
                    setError(data?.error);
                    setSuccess(data?.success);
                })
        });
    };

    return (
        <CardWrapper
            headerLabel="Crear una cuenta"
            backButtonLabel="¿Ya tienes cuenta? Inicia sesión"
            backButtonHref="/auth/login"
            showSocial={false}
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                >
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-muted-foreground text-sm font-medium">Nombre Completo</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="Juan Pérez"
                                            className="h-12 bg-card/5 border-border text-white placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                                        />
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
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="ejemplo@correo.com"
                                            type="email"
                                            className="h-12 bg-card/5 border-border text-white placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
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
                                            className="h-12 bg-card/5 border-border text-white placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error} />
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
                            <UserPlus className="mr-2 h-5 w-5" />
                        )}
                        {isPending ? "Creando..." : "Crear Cuenta"}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};
