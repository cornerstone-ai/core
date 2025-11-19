import React, { useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/public'
import { setSelectedClassId, useClassesList } from '../features/classes/public'
import {
  useSessionsList,
  mapTopicInfoToSession,
  type Session,
} from '@awfl-web/features/sessions/public'

function formatWhen(iso: string | undefined) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (!Number.isNaN(d.getTime())) return d.toLocaleString()
  } catch {}
  return String(iso)
}

function LessonTile({ lesson, onClick }: { lesson: Session; onClick: () => void }) {
  const title = (lesson.title && lesson.title.trim().length > 0 ? lesson.title : lesson.id) as string
  const subtitle = formatWhen(lesson.updatedAt)
  return (
    <button type="button" className="card-tile" onClick={onClick} style={{ width: '100%', textAlign: 'left', minHeight: 110 }}>
      <div className="tile-title" style={{ marginBottom: 4 }}>{title}</div>
      {subtitle && <div className="tile-subtle">{subtitle}</div>}
    </button>
  )
}

export function ClassLessonsPage() {
  const { classId: classIdParam, sessionId: sessionIdParam } = useParams()
  const navigate = useNavigate()
  const classId = decodeURIComponent(classIdParam || '')

  useEffect(() => {
    if (classId) setSelectedClassId(classId)
  }, [classId])

  const { idToken, user } = useAuth()

  // Load class metadata to show class name in the list title
  const { projects: classes } = useClassesList({ idToken })
  const currentClass = useMemo(() => classes.find(c => c.id === classId), [classes, classId])
  const className = currentClass?.name || currentClass?.remote || 'Class'

  const { sessions, loading, error, reload } = useSessionsList({
    userId: user?.uid,
    idToken,
    projectId: classId || null,
    field: 'update_time',
    order: 'desc',
    start: 0,
    end: 4102444800,
    mapDocToSession: mapTopicInfoToSession,
  })

  const lessons: Session[] = useMemo(() => sessions || [], [sessions])

  // Detail route present? render the single-lesson view
  const selectedId = sessionIdParam || null

  if (selectedId) {
    const selected = lessons.find(s => s.id === selectedId)
    const title = selected ? (selected.title && selected.title.trim().length > 0 ? selected.title : selected.id) : selectedId
    return (
      <div className="pearl-frame" style={{ padding: 16 }}>
        <div className="pearl-stickers" aria-hidden="true">
          <span className="s1">✨</span>
          <span className="s2">🪼</span>
          <span className="s3">🧁</span>
          <span className="s4">🐇</span>
        </div>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/classes/${encodeURIComponent(classId)}/lessons`)}
            aria-label="Back to lessons"
            style={{ padding: '8px 12px' }}
          >
            ← Back
          </button>
          <button type="button" onClick={reload} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
            Refresh
          </button>
        </div>
        <h1 style={{ margin: '4px 0 12px', fontSize: 22 }}>{title}</h1>
        {loading && <div style={{ color: '#6b7280', marginBottom: 12 }}>Loading…</div>}
        {error && (
          <div role="alert" style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 8, borderRadius: 8, marginBottom: 12 }}>
            {error}
          </div>
        )}
        <div style={{ color: '#6b7280' }}>Lesson details will appear here.</div>
      </div>
    )
  }

  // List view
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="row" style={{ alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/classes')}
            aria-label="Back to classes"
            style={{ padding: '8px 12px' }}
          >
            ← Classes
          </button>
          <h1 style={{ margin: 0, fontSize: 22 }}>{className} Lessons</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={reload} className="btn btn-secondary" style={{ padding: '8px 12px' }}>Refresh</button>
        </div>
      </div>

      {loading && <div style={{ color: '#6b7280', marginBottom: 12 }}>Loading…</div>}
      {error && (
        <div role="alert" style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 8, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <ul className="grid-cards" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {!loading && lessons.map(lesson => (
          <li key={lesson.id}>
            <LessonTile
              lesson={lesson}
              onClick={() => navigate(`/classes/${encodeURIComponent(classId)}/lessons/${encodeURIComponent(lesson.id)}`)}
            />
          </li>
        ))}
        {/* Empty-state visual when no lessons */}
        {!loading && lessons.length === 0 && (
          <li>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>No lessons yet</div>
              <div className="tile-subtle">New lessons will appear here once created.</div>
            </div>
          </li>
        )}
      </ul>
    </div>
  )
}

export default ClassLessonsPage
