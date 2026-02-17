"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAttendance } from "@/context/attendance-context";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User, Clock, PlayCircle, StopCircle } from "lucide-react";

export function UserNav() {
    const { data: session } = useSession();
    const { isClockedIn, clockIn, clockOut, duration } = useAttendance();

    // Get initials from name
    const initials = session?.user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || "U";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    {isClockedIn && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {session?.user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <div className="p-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                                {isClockedIn ? "TURNO ACTIVO" : "FUERA DE TURNO"}
                            </span>
                            {isClockedIn && (
                                <span className="text-xs font-mono font-medium text-green-600">
                                    {duration}
                                </span>
                            )}
                        </div>

                        {isClockedIn ? (
                            <Button
                                variant="destructive"
                                size="sm"
                                className="w-full justify-start"
                                onClick={(e) => {
                                    e.preventDefault();
                                    clockOut();
                                }}
                            >
                                <StopCircle className="mr-2 h-4 w-4" />
                                Finalizar Turno
                            </Button>
                        ) : (
                            <Button
                                variant="default"
                                size="sm"
                                className="w-full justify-start bg-green-600 hover:bg-green-700"
                                onClick={(e) => {
                                    e.preventDefault();
                                    clockIn();
                                }}
                            >
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Iniciar Turno
                            </Button>
                        )}
                    </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
