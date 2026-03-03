import { DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
    role: "ADMIN" | "STAFF" | "DOCTOR" | "NURSE" | "KITCHEN" | "FAMILY";
    facilityId: string | null;
};

declare module "next-auth" {
    interface Session {
        user: ExtendedUser;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: string;
        facilityId?: string | null;
    }
}
