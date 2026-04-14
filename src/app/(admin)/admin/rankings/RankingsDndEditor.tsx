'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Save, Loader2 } from 'lucide-react'
import { saveRankingsOrder } from './actions'

type RankingRow = {
  id: string
  position: number
  fighters: { id: string; name: string; nationality: string } | null
  weight_classes: { name: string } | null
}

function SortableRow({ row }: { row: RankingRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-3"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab text-[#52525b] hover:text-[#a1a1aa] active:cursor-grabbing"
        aria-label="Arrastrar"
      >
        <GripVertical size={18} />
      </button>

      {/* Position */}
      <span className="w-7 flex-shrink-0 text-center text-sm font-bold text-[#dc2626]">
        {row.position}
      </span>

      {/* Fighter info */}
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-white">
          {row.fighters?.name ?? 'Peleador desconocido'}
        </p>
        <p className="text-xs text-[#52525b]">
          {row.fighters?.nationality ?? ''}{row.weight_classes ? ` · ${row.weight_classes.name}` : ''}
        </p>
      </div>
    </div>
  )
}

type Props = {
  initialRows: RankingRow[]
}

export function RankingsDndEditor({ initialRows }: Props) {
  const [rows, setRows] = useState(initialRows)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setRows((prev) => {
      const oldIndex = prev.findIndex((r) => r.id === active.id)
      const newIndex = prev.findIndex((r) => r.id === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)
      // Update position numbers
      return reordered.map((r, i) => ({ ...r, position: i + 1 }))
    })
    setSaved(false)
  }

  function handleSave() {
    startTransition(async () => {
      await saveRankingsOrder(rows.map((r) => r.id))
      setSaved(true)
    })
  }

  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-[#52525b]">
        No hay rankings para esta selección.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {rows.map((row) => (
              <SortableRow key={row.id} row={row} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={pending}
          className="flex items-center gap-2 rounded-lg bg-[#dc2626] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          {pending ? 'Guardando…' : 'Guardar orden'}
        </button>
        {saved && !pending && (
          <span className="text-sm text-green-400">✓ Guardado correctamente</span>
        )}
      </div>
    </div>
  )
}
