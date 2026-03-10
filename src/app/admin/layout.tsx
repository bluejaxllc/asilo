import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import AdminClientLayout from "./admin-client-layout";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
    children
}: {
    children: React.ReactNode;
}) {
    // 1. Get user session
    const session = await auth();
    const facilityId = (session?.user as any)?.facilityId;

    // 2. If no facility, they might be logged out or missing tenant info
    // (Middleware handles unauthorized access, but we double check)
    if (!facilityId) {
        return <AdminClientLayout>{children}</AdminClientLayout>;
    }

    const setting = await db.facilitySetting.findFirst({
        where: {
            facilityId,
            key: "ONBOARDING_COMPLETED"
        }
    });

    // 4. Redirect if not completed
    if (!setting || setting.value !== "true") {
        redirect("/onboarding");
    }

    // 5. If completed, render the normal client layout
    return <AdminClientLayout>{children}</AdminClientLayout>;
}
