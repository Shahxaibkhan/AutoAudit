import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
// After domain verification: change to 'AutoAuditAI <noreply@autoauditai.com>'
const FROM = process.env.RESEND_FROM_EMAIL || 'AutoAuditAI <onboarding@resend.dev>'
const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
        <!-- Header -->
        <tr><td style="background:#0f766e;padding:28px 40px">
          <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px">AutoAuditAI</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px">
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#0f172a">${title}</h1>
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid #f1f5f9">
          <p style="margin:0;font-size:12px;color:#94a3b8">
            AutoAuditAI · AI-powered vehicle inspection<br>
            If you didn't request this, you can safely ignore this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const link = `${BASE_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`
  const body = `
    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px">
      Thanks for signing up! Please verify your email address to activate your account and start inspecting vehicles.
    </p>
    <a href="${link}" style="display:inline-block;background:#0f766e;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none">
      Verify Email →
    </a>
    <p style="color:#94a3b8;font-size:13px;margin:24px 0 0">
      This link expires in 24 hours. If the button doesn't work, copy this link:<br>
      <a href="${link}" style="color:#0f766e;word-break:break-all">${link}</a>
    </p>`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Verify your AutoAuditAI account',
    html: baseTemplate('Verify your email', body),
  })
}

export async function sendInspectionCompleteEmail(params: {
  email: string
  name: string | null
  vehicleName: string
  damageCount: number
  grade: string
  inspectionId: string
}): Promise<void> {
  const link = `${BASE_URL}/inspections/${params.inspectionId}/review`
  const body = `
    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 16px">
      Hi ${params.name ?? 'there'},
    </p>
    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px">
      Your AI inspection for <strong>${params.vehicleName}</strong> is complete.
      The AI found <strong>${params.damageCount} finding${params.damageCount !== 1 ? 's' : ''}</strong> —
      please review them before sharing with your customer.
    </p>
    <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center">
      <span style="font-size:32px;font-weight:900;color:#0f172a">${params.grade}</span>
      <p style="color:#64748b;font-size:13px;margin:4px 0 0">Condition Grade</p>
    </div>
    <a href="${link}" style="display:inline-block;background:#0f766e;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none">
      Review Findings →
    </a>
    <p style="color:#94a3b8;font-size:13px;margin:24px 0 0">
      Confirm, edit, or remove any AI findings — then sign and send to your customer.
    </p>`

  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: `Inspection complete — ${params.vehicleName} (Grade ${params.grade})`,
    html: baseTemplate(`Inspection complete: ${params.vehicleName}`, body),
  })
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const link = `${BASE_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`
  const body = `
    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px">
      We received a request to reset your password. Click the button below to set a new password.
    </p>
    <a href="${link}" style="display:inline-block;background:#0f766e;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none">
      Reset Password →
    </a>
    <p style="color:#94a3b8;font-size:13px;margin:24px 0 0">
      This link expires in 1 hour. If you didn't request a password reset, ignore this email — your password won't change.<br><br>
      <a href="${link}" style="color:#0f766e;word-break:break-all">${link}</a>
    </p>`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your AutoAuditAI password',
    html: baseTemplate('Reset your password', body),
  })
}
