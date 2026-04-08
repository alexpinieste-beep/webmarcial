'use client'

import { useTransition } from 'react'
import type { Lead } from '@/types/database'

type Props = {
  leads: Lead[]
  updateLeadStatus: (leadId: string, status: Lead['status']) => Promise<{ error?: string } | void>
}

const STATUS_LABELS: Record<Lead['status'], string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  converted: 'Convertido',
  closed: 'Cerrado',
}

const STATUS_STYLES: Record<Lead['status'], string> = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  converted: 'bg-green-500/20 text-green-400',
  closed: 'bg-zinc-700 text-zinc-400',
}

function LeadRow({
  lead,
  updateLeadStatus,
}: {
  lead: Lead
  updateLeadStatus: Props['updateLeadStatus']
}) {
  const [isPending, startTransition] = useTransition()

  function handleStatusChange(newStatus: Lead['status']) {
    startTransition(async () => {
      await updateLeadStatus(lead.id, newStatus)
    })
  }

  return (
    <tr className={`border-b border-[#27272a] last:border-0 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      {/* Nombre */}
      <td className="px-5 py-4">
        <p className="font-medium text-white">{lead.name}</p>
        <p className="text-xs text-[#71717a]">
          {new Date(lead.created_at).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </td>

      {/* Email */}
      <td className="px-5 py-4">
        <a
          href={`mailto:${lead.email}`}
          className="text-sm text-[#a1a1aa] hover:text-white"
        >
          {lead.email}
        </a>
      </td>

      {/* Teléfono */}
      <td className="hidden px-5 py-4 md:table-cell">
        {lead.phone ? (
          <a href={`tel:${lead.phone}`} className="text-sm text-[#a1a1aa] hover:text-white">
            {lead.phone}
          </a>
        ) : (
          <span className="text-[#52525b]">—</span>
        )}
      </td>

      {/* Mensaje */}
      <td className="hidden px-5 py-4 lg:table-cell">
        {lead.message ? (
          <p className="max-w-xs truncate text-sm text-[#a1a1aa]" title={lead.message}>
            {lead.message}
          </p>
        ) : (
          <span className="text-[#52525b]">—</span>
        )}
      </td>

      {/* Estado */}
      <td className="px-5 py-4">
        <select
          value={lead.status}
          onChange={(e) => handleStatusChange(e.target.value as Lead['status'])}
          disabled={isPending}
          className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer border-0 outline-none ${STATUS_STYLES[lead.status]}`}
        >
          {(Object.keys(STATUS_LABELS) as Lead['status'][]).map((s) => (
            <option key={s} value={s} className="bg-[#18181b] text-white">
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </td>
    </tr>
  )
}

export default function LeadsTable({ leads, updateLeadStatus }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#27272a]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#27272a] bg-[#18181b]">
            <th className="px-5 py-3 font-semibold text-[#71717a]">Contacto</th>
            <th className="px-5 py-3 font-semibold text-[#71717a]">Email</th>
            <th className="hidden px-5 py-3 font-semibold text-[#71717a] md:table-cell">Teléfono</th>
            <th className="hidden px-5 py-3 font-semibold text-[#71717a] lg:table-cell">Mensaje</th>
            <th className="px-5 py-3 font-semibold text-[#71717a]">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-[#0f0f0f]">
          {leads.map((lead) => (
            <LeadRow key={lead.id} lead={lead} updateLeadStatus={updateLeadStatus} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
