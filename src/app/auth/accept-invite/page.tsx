"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition, Suspense } from "react";
import { validateInviteToken, acceptInvite } from "@/actions/accept-invite";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function AcceptInviteForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token") || "";

    const [inviteData, setInviteData] = useState<{ name: string; email: string; role: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("No se proporcionó un token de invitación.");
            setLoading(false);
            return;
        }

        validateInviteToken(token).then((res) => {
            if (res.error) {
                setError(res.error);
            } else if (res.invite) {
                setInviteData(res.invite);
            }
            setLoading(false);
        });
    }, [token]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden.");
            return;
        }

        startTransition(async () => {
            const res = await acceptInvite(token, password);
            if (res.error) {
                toast.error(res.error);
            } else {
                setSuccess(true);
                toast.success("¡Cuenta creada exitosamente!");
                setTimeout(() => router.push("/auth/login"), 2500);
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5 justify-center mb-8">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-xl text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>.blue_jax</span>
                </div>

                <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <p className="text-muted-foreground text-sm">Validando invitación…</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center gap-3 py-8 text-center">
                            <AlertCircle className="h-10 w-10 text-red-500" />
                            <h2 className="text-lg font-bold text-foreground">Invitación Inválida</h2>
                            <p className="text-muted-foreground text-sm">{error}</p>
                            <Button variant="ghost" className="mt-4" onClick={() => router.push("/auth/login")}>
                                Ir al inicio de sesión
                            </Button>
                        </div>
                    ) : success ? (
                        <div className="flex flex-col items-center gap-3 py-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                            </motion.div>
                            <h2 className="text-lg font-bold text-foreground">¡Cuenta Creada!</h2>
                            <p className="text-muted-foreground text-sm">Redirigiendo al inicio de sesión…</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-foreground mb-1">Bienvenido/a, {inviteData?.name}</h2>
                                <p className="text-muted-foreground text-sm">
                                    Crea tu contraseña para activar tu cuenta como <span className="font-semibold text-blue-500">{inviteData?.role}</span>.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Correo</label>
                                    <Input value={inviteData?.email || ""} disabled className="bg-muted/30" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Mínimo 6 caracteres"
                                            className="pl-10 pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Confirmar Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repetir contraseña"
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                    <Button
                                        type="submit"
                                        disabled={isPending}
                                        className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/20"
                                    >
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Cuenta"}
                                    </Button>
                                </motion.div>
                            </form>
                        </>
                    )}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    ¿Ya tienes cuenta?{" "}
                    <a href="/auth/login" className="text-blue-500 hover:text-blue-400 font-medium">Inicia sesión</a>
                </p>
            </motion.div>
        </div>
    );
}

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        }>
            <AcceptInviteForm />
        </Suspense>
    );
}
