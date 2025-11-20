import React from 'react'
import type { Session } from '@awfl-web/features/sessions/public'

function formatWhen(iso?: string | null) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (!Number.isNaN(d.getTime())) return d.toLocaleString()
  } catch {}
  return String(iso)
}

export function LessonTile({ lesson, onClick }: { lesson: Session; onClick: () => void }) {
  const title = (lesson.title && lesson.title.trim().length > 0 ? lesson.title : lesson.id) as string
  const subtitle = formatWhen(lesson.updatedAt)
  return (
    <button type="button" className="card-tile" onClick={onClick} style={{ width: '100%', textAlign: 'left', minHeight: 110 }}>
      <div className="tile-title" style={{ marginBottom: 4 }}>{title}</div>
      {subtitle && <div className="tile-subtle">{subtitle}</div>}
    </button>
  )
}
