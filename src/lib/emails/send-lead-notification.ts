import { resend, FROM_EMAIL } from '@/lib/resend'
import { newLeadEmail } from './new-lead'

export async function sendLeadNotification({
  gymEmail,
  gymName,
  lead,
}: {
  gymEmail: string
  gymName: string
  lead: {
    name: string
    email: string
    phone: string | null
    message: string | null
  }
}) {
  if (!gymEmail || !process.env.RESEND_API_KEY) return // silently skip in dev

  const { subject, html } = newLeadEmail({ gymName, lead })

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: gymEmail,
      subject,
      html,
    })
  } catch (error) {
    console.error('Error sending lead notification email:', error)
    // No re-throw — email failure should not break lead submission
  }
}
