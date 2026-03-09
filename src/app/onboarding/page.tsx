import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { OnboardingClient } from "./onboarding-client";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
    const session = await auth();
    const role = (session?.user as any)?.role;
    const facilityId = (session?.user as any)?.facilityId;

    // Only Admin users can onboard their facility
    if (role !== "ADMIN" || !facilityId) {
        redirect("/");
    }

    // Check if already completed
    const setting = await db.facilitySetting.findFirst({
        where: {
            facilityId,
            key: "ONBOARDING_COMPLETED"
        }
    });

    if (setting && setting.value === "true") {
        redirect("/admin"); // already onboarded
    }

    const facility = await db.facility.findUnique({
        where: { id: facilityId },
        select: { name: true }
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-xl">
                <OnboardingClient initialFacilityName={facility?.name || ""} />
            </div>
        </div>
    );
}
