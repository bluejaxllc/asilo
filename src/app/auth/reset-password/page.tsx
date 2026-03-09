import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ResetPasswordForm />
        </div>
    );
}
