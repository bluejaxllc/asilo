"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ShieldCheck, Loader2, CheckCircle, Mail, RefreshCw } from "lucide-react"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { verifyEmail } from "@/actions/verify-email"
import { resendVerification } from "@/actions/resend-verification"

export default function VerifyPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const email = searchParams.get("email") || ""

    const [code, setCode] = useState(["", "", "", "", "", ""])
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const [isPending, startTransition] = useTransition()
    const [resendCooldown, setResendCooldown] = useState(0)
    const [isResending, setIsResending] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Auto-focus first input
    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    // Cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return
        const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
        return () => clearTimeout(timer)
    }, [resendCooldown])

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return // Only digits

        const newCode = [...code]
        newCode[index] = value.slice(-1) // Take last digit
        setCode(newCode)

        // Auto-advance to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        const newCode = [...code]
        for (let i = 0; i < pasted.length; i++) {
            newCode[i] = pasted[i]
        }
        setCode(newCode)
        inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    }

    const onSubmit = () => {
        setError("")
        setSuccess("")

        const fullCode = code.join("")
        if (fullCode.length !== 6) {
            setError("Ingresa el código completo de 6 dígitos.")
            return
        }

        startTransition(async () => {
            const result = await verifyEmail(email, fullCode)
            if (result?.error) {
                setError(result.error)
            }
            if (result?.success) {
                setSuccess("¡Cuenta verificada! Iniciando sesión...")

                // Try auto-login with stored password
                let storedPw: string | null = null;
                try { storedPw = sessionStorage.getItem("_al"); } catch {}

                if (storedPw) {
                    try {
                        sessionStorage.removeItem("_al"); // Clear immediately
                        const origin = window.location.origin;
                        const loginResult = await signIn("credentials", {
                            email,
                            password: storedPw,
                            redirect: false,
                            callbackUrl: origin,
                        });

                        if (loginResult?.ok) {
                            // Fetch session to determine redirect path
                            const sessionRes = await fetch(`${origin}/api/auth/session`);
                            const session = await sessionRes.json();
                            let redirectPath = "/admin";
                            if (session?.user?.role === "STAFF") redirectPath = "/staff";
                            else if (session?.user?.role === "FAMILY") redirectPath = "/family";

                            window.location.replace(`${origin}${redirectPath}`);
                            return;
                        }
                    } catch (e) {
                        console.error("[VERIFY] Auto-login failed:", e);
                    }
                }

                // Fallback: redirect to login page
                setTimeout(() => {
                    router.push("/auth/login")
                }, 2000)
            }
        })
    }

    const onResend = async () => {
        if (resendCooldown > 0 || isResending) return
        setError("")
        setSuccess("")
        setIsResending(true)

        try {
            const result = await resendVerification(email)
            if (result?.error) {
                setError(result.error)
            }
            if (result?.success) {
                setSuccess(result.success)
                setResendCooldown(60) // 60 second cooldown
                // Clear code inputs for new code
                setCode(["", "", "", "", "", ""])
                inputRefs.current[0]?.focus()
            }
        } finally {
            setIsResending(false)
        }
    }

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-md text-center space-y-4">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h2 className="text-xl font-semibold text-foreground">Enlace inválido</h2>
                    <p className="text-muted-foreground">No se proporcionó un correo electrónico.</p>
                    <Button onClick={() => router.push("/auth/register")} variant="outline">
                        Volver a Registro
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/20">
                        <ShieldCheck className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Verificar tu cuenta</h1>
                    <p className="text-muted-foreground text-sm">
                        Enviamos un código de 6 dígitos a{" "}
                        <span className="font-medium text-foreground">{email}</span>
                    </p>
                </div>

                {/* Code Input */}
                <div className="flex justify-center gap-3">
                    {code.map((digit, i) => (
                        <input
                            key={i}
                            ref={el => { inputRefs.current[i] = el }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onPaste={i === 0 ? handlePaste : undefined}
                            disabled={isPending}
                            className="w-12 h-14 text-center text-2xl font-bold rounded-xl border border-border bg-card/50 text-foreground focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50"
                        />
                    ))}
                </div>

                {/* Messages */}
                <div className="space-y-2">
                    <FormError message={error} />
                    <FormSuccess message={success} />
                </div>

                {/* Submit */}
                <Button
                    onClick={onSubmit}
                    disabled={isPending || code.join("").length !== 6}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-base"
                >
                    {isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : success ? (
                        <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Verificado — Redirigiendo...
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="h-5 w-5 mr-2" />
                            Verificar Cuenta
                        </>
                    )}
                </Button>

                {/* Resend */}
                <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                        ¿No recibiste el correo? Revisa tu carpeta de spam.
                    </p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={resendCooldown > 0 || isResending}
                        onClick={onResend}
                        className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                    >
                        {isResending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        {resendCooldown > 0
                            ? `Reenviar en ${resendCooldown}s`
                            : "Reenviar código"
                        }
                    </Button>
                </div>
            </div>
        </div>
    )
}
