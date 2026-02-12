"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { checkIn, checkOut, getAttendanceStatus } from "@/actions/attendance";

type AttendanceState = {
    isClockedIn: boolean;
    hasCompletedShift: boolean;
    startTime: Date | null;
    clockIn: () => void;
    clockOut: () => void;
    duration: string;
};

const AttendanceContext = createContext<AttendanceState | undefined>(undefined);

export const AttendanceProvider = ({ children }: { children: React.ReactNode }) => {
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [hasCompletedShift, setHasCompletedShift] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [duration, setDuration] = useState("00:00:00");

    const { data: session } = useSession();

    // Load from server and fallback to localStorage
    useEffect(() => {
        const fetchStatus = async () => {
            if (session?.user?.email) {
                try {
                    const status = await getAttendanceStatus(session.user.email);

                    if (status?.isClockedIn && status.startTime) {
                        setIsClockedIn(true);
                        setStartTime(new Date(status.startTime));
                        localStorage.setItem('attendanceStartTime', new Date(status.startTime).toISOString());
                    }
                    if (status?.hasCompletedShift) {
                        setHasCompletedShift(true);
                    }
                } catch (e) {
                    console.error("Failed to fetch attendance status", e);
                }
            }
        };

        const storedStart = localStorage.getItem('attendanceStartTime');
        if (storedStart) {
            setStartTime(new Date(storedStart));
            setIsClockedIn(true);
        }

        if (session?.user?.email) {
            fetchStatus();
        }
    }, [session?.user?.email]);

    // Update duration timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isClockedIn && startTime) {
            interval = setInterval(() => {
                const now = new Date();
                const diff = now.getTime() - startTime.getTime();
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }, 1000);
        } else {
            setDuration("00:00:00");
        }
        return () => clearInterval(interval);
    }, [isClockedIn, startTime]);

    const clockIn = async () => {
        if (!session?.user?.email) {
            toast.error("No se pudo identificar al usuario.");
            return;
        }

        try {
            const result = await checkIn(session.user.email);

            if (result.error) {
                toast.error(result.error);
                if (result.error.includes("Ya has registrado")) {
                    // Assume completed if error says so? Better to fetch status, but let's see.
                }
            } else {
                const now = new Date();
                setStartTime(now);
                setIsClockedIn(true);
                setHasCompletedShift(false); // Reset to allow new shifts
                localStorage.setItem('attendanceStartTime', now.toISOString());
                toast.success("Turno iniciado correctamente");
            }
        } catch (error) {
            toast.error("Error al registrar entrada");
        }
    };

    const clockOut = async () => {
        if (!session?.user?.email) {
            toast.error("No se pudo identificar al usuario.");
            return;
        }

        try {
            const result = await checkOut(session.user.email);
            if (result.error) {
                // Check for various error messages that imply we are already out
                if (result.error === "No has registrado ninguna entrada hoy" ||
                    result.error === "Ya has registrado tu salida para este turno") {

                    // Critical State Mismatch Fix: Server thinks we are out, but Client thinks we are in.
                    // Trust the server. Force client to sign out.
                    setIsClockedIn(false);
                    setHasCompletedShift(true); // Assuming if we are out, shift is done
                    setStartTime(null);
                    localStorage.removeItem('attendanceStartTime');

                    toast.warning("Sincronizando: Tu turno ya había finalizado.");
                } else {
                    toast.error(result.error);
                }
            } else {
                setIsClockedIn(false);
                setHasCompletedShift(true);
                setStartTime(null);
                localStorage.removeItem('attendanceStartTime');
                toast.success("Turno finalizado correctamente");
            }
        } catch (error) {
            toast.error("Error al registrar salida");
        }
    };

    return (
        <AttendanceContext.Provider value={{ isClockedIn, hasCompletedShift, startTime, clockIn, clockOut, duration }}>
            {children}
        </AttendanceContext.Provider>
    );
};

export const useAttendance = () => {
    const context = useContext(AttendanceContext);
    if (context === undefined) {
        throw new Error('useAttendance must be used within an AttendanceProvider');
    }
    return context;
};
