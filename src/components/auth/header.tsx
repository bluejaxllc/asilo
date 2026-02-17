import { Poppins } from "next/font/google";
import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"],
});

interface HeaderProps {
    label: string;
};

export const Header = ({
    label,
}: HeaderProps) => {
    return (
        <div className="w-full flex flex-col gap-y-4 items-center justify-center">
            <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <h1 className={cn(
                    "text-3xl font-bold text-white",
                    font.className,
                )}>
                    .blue_jax
                </h1>
            </div>
            <p className="text-slate-400 text-sm">
                {label}
            </p>
        </div>
    );
};
