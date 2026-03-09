import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center space-y-4 text-center">
                <Ghost className="h-16 w-16 text-slate-400" />
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    404 - Página no encontrada
                </h2>
                <p className="text-slate-500 max-w-md">
                    La página que está buscando no existe o ha sido movida.
                </p>
                <div className="mt-6">
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
