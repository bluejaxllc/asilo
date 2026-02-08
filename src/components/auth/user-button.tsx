"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";
import { User, LogOut } from "lucide-react";

import { logout } from "@/actions/logout";

export const UserButton = () => {
    const onClick = () => {
        logout();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-sky-500">
                        <User className="text-white" />
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end">
                <DropdownMenuItem onClick={onClick} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
