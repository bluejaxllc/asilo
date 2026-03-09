import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SuperAdminClientLayout from "./super-client-layout";

export const dynamic = "force-dynamic";

export default async function SuperAdminLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (role !== "SUPER_ADMIN") {
        redirect("/");
    }

    return <SuperAdminClientLayout>{children}</SuperAdminClientLayout>;
}
