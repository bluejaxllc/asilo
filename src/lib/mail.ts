import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Retiro BlueJax <onboarding@resend.dev>";

/**
 * Send a verification email with a 6-digit code.
 */
export async function sendVerificationEmail(email: string, code: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: "Verifica tu cuenta — Retiro BlueJax",
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a1a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a1a;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:16px;overflow:hidden;border:1px solid rgba(99,102,241,0.2);">
                    <!-- Header -->
                    <tr>
                        <td style="padding:32px 32px 16px;text-align:center;">
                            <div style="font-size:28px;font-weight:700;background:linear-gradient(135deg,#818cf8,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                                Retiro BlueJax
                            </div>
                            <div style="color:#94a3b8;font-size:14px;margin-top:4px;">Sistema de Gestión de Residencias</div>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:16px 32px;">
                            <h2 style="color:#e2e8f0;font-size:20px;margin:0 0 8px;">Verificación de Cuenta</h2>
                            <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
                                Ingresa el siguiente código en la página de verificación para activar tu cuenta:
                            </p>
                        </td>
                    </tr>
                    <!-- Code -->
                    <tr>
                        <td style="padding:0 32px 24px;text-align:center;">
                            <div style="background:rgba(99,102,241,0.1);border:2px dashed rgba(99,102,241,0.3);border-radius:12px;padding:20px;display:inline-block;">
                                <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#818cf8;font-family:monospace;">
                                    ${code}
                                </span>
                            </div>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding:0 32px 32px;">
                            <p style="color:#64748b;font-size:12px;line-height:1.5;margin:0;">
                                Este código expira en 1 hora. Si no solicitaste esta verificación, ignora este correo.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        });

        if (error) {
            console.error("[MAIL] Resend error:", JSON.stringify(error));
            throw new Error(`Failed to send verification email: ${error.message}`);
        }

        console.log("[MAIL] Verification email sent to", email, "id:", data?.id);
    } catch (err) {
        console.error("[MAIL] Failed to send email to", email, err);
        throw err;
    }
}
