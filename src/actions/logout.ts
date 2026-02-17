"use server";

import { signOut } from "@/auth";

export const logout = async () => {
    console.log("ServerAction: logout called");
    await signOut({ redirectTo: "/auth/login" });
};
