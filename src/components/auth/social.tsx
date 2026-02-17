"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export const Social = () => {
    return (
        <div className="w-full space-y-3">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-transparent px-3 text-slate-500 font-medium">o continúa con</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    size="lg"
                    className="w-full h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-all"
                    variant="outline"
                    onClick={() => { }}
                >
                    <FcGoogle className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium text-slate-300">Google</span>
                </Button>
                <Button
                    size="lg"
                    className="w-full h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-all"
                    variant="outline"
                    onClick={() => { }}
                >
                    <FaGithub className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium text-slate-300">GitHub</span>
                </Button>
            </div>
        </div>
    );
};
