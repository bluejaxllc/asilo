"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ShieldCheck, Loader2, CheckCircle, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { verifyEmail } from "@/actions/verify-email"

export default function VerifyPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const email = searchParams.get("email") || ""

    const [code, setCode] = useState(["", "", "", "", "", ""])
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const [isPending, startTransition] = useTransition()
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Auto-focus first input
    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

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
                setSuccess(result.success)
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push("/auth/login")
                }, 2000)
            }
        })
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

                {/* Help text */}
                <p className="text-center text-xs text-muted-foreground">
                    ¿No recibiste el correo? Revisa tu carpeta de spam o{" "}
                    <button
                        onClick={() => router.push("/auth/register")}
                        className="text-indigo-400 hover:underline"
                    >
                        intenta de nuevo
                    </button>
                </p>
            </div>
        </div>
    )
}
