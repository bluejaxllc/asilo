"use client";

import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/actions/reset-password";
import { ResetPasswordSchema } from "@/schemas";
import { KeyRound, Loader2, Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

export const ResetPasswordForm = () => {
    const { update } = useSession();
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, setIsPending] = useState(false);

    // Toggle pure UI state for both fields
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof ResetPasswordSchema>) => {
        setError("");
        setSuccess("");
        setIsPending(true);

        try {
            const data = await resetPassword(values);

            if (data?.error) {
                setError(data.error);
                setIsPending(false);
            }

            if (data?.success) {
                setSuccess(data.success);
                // Trigger token update so middleware sees the new mustChangePassword state
                await update({ mustChangePassword: false });

                // Tiny delay to let session propagate, then go to the proper dashboard
                setTimeout(() => {
                    window.location.replace(data.redirectUrl || "/staff");
                }, 1000);
            }
        } catch (err) {
            setError("Algo salió mal");
            setIsPending(false);
        }
    };

    return (
        <div className="w-[440px] max-w-full mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30 border border-border bg-card backdrop-blur-xl">
                <div className="h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500" />

                <div className="pt-10 pb-2 px-8 text-center">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg mb-5">
                        <KeyRound className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground mb-2">Seguridad Requerida</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Por razones de seguridad, es necesario actualizar la contraseña asignada por el administrador antes de continuar.
                    </p>
                </div>

                <div className="px-8 pt-6 pb-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-muted-foreground text-sm font-medium">Nueva Contraseña</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        disabled={isPending}
                                                        placeholder="••••••••"
                                                        type={showPassword ? "text" : "password"}
                                                        className="h-12 bg-card/5 border-border pr-10 rounded-xl"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-muted-foreground text-sm font-medium">Confirmar Contraseña</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        disabled={isPending}
                                                        placeholder="••••••••"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        className="h-12 bg-card/5 border-border pr-10 rounded-xl"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
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
                                className="w-full h-12 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/25 transition-all text-base"
                            >
                                {isPending ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <KeyRound className="mr-2 h-5 w-5" />
                                )}
                                {isPending ? "Actualizando..." : "Guardar y Continuar"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
};
