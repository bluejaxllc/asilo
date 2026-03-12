"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Clock, Delete, LogIn } from "lucide-react";

export default function StationHomePage() {
    const router = useRouter();
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [stationInfo, setStationInfo] = useState<{
        stationId: string;
        stationName: string;
        facilityId: string;
        facilityName: string;
    } | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Load station info
    useEffect(() => {
        const stored = localStorage.getItem("station");
        if (!stored) {
            router.push("/station");
            return;
        }
        setStationInfo(JSON.parse(stored));
    }, [router]);

    // Clock
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const handlePinInput = useCallback((digit: string) => {
        if (pin.length >= 4) return;
        const newPin = pin + digit;
        setPin(newPin);
        setError("");

        // Auto-submit when 4 digits entered
        if (newPin.length === 4 && stationInfo) {
            setLoading(true);
            fetch("/api/station/pin-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin: newPin, facilityId: stationInfo.facilityId }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        setError("PIN incorrecto");
                        setPin("");
                        setLoading(false);
                    } else {
                        // Store user session for station
                        localStorage.setItem("stationUser", JSON.stringify({
                            userId: data.userId,
                            name: data.name,
                            role: data.role,
                        }));
                        router.push("/station/dashboard");
                    }
                })
                .catch(() => {
                    setError("Error de conexión");
                    setPin("");
                    setLoading(false);
                });
        }
    }, [pin, stationInfo, router]);

    const handleBackspace = () => {
        setPin((prev) => prev.slice(0, -1));
        setError("");
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    if (!stationInfo) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6 select-none">
            {/* Station info bar */}
            <div className="fixed top-0 left-0 right-0 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm text-slate-400">{stationInfo.stationName}</span>
                </div>
                <span className="text-sm text-slate-400">{stationInfo.facilityName}</span>
            </div>

            {/* Clock */}
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <Clock className="h-6 w-6 text-blue-400" />
                    <span className="text-6xl font-light text-white tracking-wide" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatTime(currentTime)}
                    </span>
                </div>
                <p className="text-slate-400 text-lg capitalize">{formatDate(currentTime)}</p>
            </div>

            {/* PIN Display */}
            <div className="mb-8">
                <div className="flex items-center justify-center gap-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`w-5 h-5 rounded-full transition-all duration-200 ${
                                i < pin.length
                                    ? "bg-blue-500 scale-110 shadow-lg shadow-blue-500/30"
                                    : "bg-slate-600/50 border border-slate-500/30"
                            }`}
                        />
                    ))}
                </div>
                <p className="text-center mt-4 text-sm text-slate-400">
                    {loading ? "Verificando..." : error || "Ingresa tu PIN de 4 dígitos"}
                </p>
                {error && (
                    <p className="text-center mt-1 text-sm text-red-400">{error}</p>
                )}
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                    <button
                        key={digit}
                        onClick={() => handlePinInput(digit)}
                        disabled={loading}
                        className="h-20 w-20 rounded-2xl bg-slate-700/50 hover:bg-slate-600/50 active:bg-slate-500/50 border border-slate-600/30 text-white text-2xl font-medium transition-all duration-150 active:scale-95 disabled:opacity-50 flex items-center justify-center"
                    >
                        {digit}
                    </button>
                ))}
                {/* Bottom row */}
                <button
                    onClick={() => {
                        localStorage.removeItem("station");
                        router.push("/station");
                    }}
                    className="h-20 w-20 rounded-2xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 text-slate-400 text-xs font-medium transition-all flex items-center justify-center"
                >
                    <LogIn className="h-5 w-5" />
                </button>
                <button
                    onClick={() => handlePinInput("0")}
                    disabled={loading}
                    className="h-20 w-20 rounded-2xl bg-slate-700/50 hover:bg-slate-600/50 active:bg-slate-500/50 border border-slate-600/30 text-white text-2xl font-medium transition-all duration-150 active:scale-95 disabled:opacity-50 flex items-center justify-center"
                >
                    0
                </button>
                <button
                    onClick={handleBackspace}
                    disabled={loading || pin.length === 0}
                    className="h-20 w-20 rounded-2xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 text-slate-400 transition-all flex items-center justify-center disabled:opacity-30"
                >
                    <Delete className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
}
