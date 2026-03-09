"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error Boundary caught an error:", error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center space-y-4 text-center">
                <AlertTriangle className="h-16 w-16 text-red-500" />
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Algo salió mal
                </h2>
                <p className="text-slate-500 max-w-md">
                    Hubo un error inesperado al procesar su solicitud. Nuestro equipo técnico ha sido notificado.
                </p>
                <div className="flex space-x-4 mt-6">
                    <Button onClick={() => reset()} variant="outline">
                        Intentar de nuevo
                    </Button>
                    <Link href="/">
                        <Button>
                            Volver al inicio
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
