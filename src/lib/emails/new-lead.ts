export function newLeadEmail({
  gymName,
  lead,
}: {
  gymName: string
  lead: {
    name: string
    email: string
    phone: string | null
    message: string | null
  }
}): { subject: string; html: string } {
  return {
    subject: `Nuevo lead en WebMarcial: ${lead.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Nuevo contacto en tu gimnasio</h2>
        <p>Hola <strong>${gymName}</strong>,</p>
        <p>Has recibido un nuevo mensaje a través de tu perfil en WebMarcial:</p>
        <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p><strong>Nombre:</strong> ${lead.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
          ${lead.phone ? `<p><strong>Teléfono:</strong> ${lead.phone}</p>` : ''}
          ${lead.message ? `<p><strong>Mensaje:</strong> ${lead.message}</p>` : ''}
        </div>
        <p>Accede a tu dashboard para gestionar este lead:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads"
           style="background: #dc2626; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">
          Ver leads
        </a>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e4e4e7;" />
        <p style="color: #71717a; font-size: 12px;">WebMarcial — La plataforma de deportes de contacto en España</p>
      </div>
    `,
  }
}
