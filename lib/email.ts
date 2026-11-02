// Client email via Resend. Needs RESEND_API_KEY and RESEND_FROM (a verified sender).
export async function sendEmail(to: string, subject: string, text: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  if (!key || !from) return { ok: false, error: 'Email is not configured yet. Add RESEND_API_KEY and RESEND_FROM in Vercel.' }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, text }),
  })
  if (!response.ok) return { ok: false, error: `Email failed (${response.status}).` }
  return { ok: true }
}
