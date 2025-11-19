import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/public'
import { setSelectedClassId } from '../features/classes/public'
import { LessonSidebar } from '../features/lessons/components/LessonSidebar'
import {
  useSessionsList,
  mapTopicInfoToSession,
  filterSessionsByQuery,
  type Session,
} from '@awfl-web/features/sessions/public'

export function ClassLessonsPage() {
  const { classId: classIdParam, sessionId: sessionIdParam } = useParams()
  const navigate = useNavigate()
  const classId = decodeURIComponent(classIdParam || '')

  // Thread selected class into shared project selection (impacts x-project-id header)
  useEffect(() => {
    if (classId) setSelectedClassId(classId)
  }, [classId])

  const { idToken, user } = useAuth()

  // Load lessons (sessions) for this class using awfl-web hook
  const { sessions, loading, error } = useSessionsList({
    userId: user?.uid,
    idToken,
    projectId: classId || null,
    field: 'update_time',
    order: 'desc',
    start: 0,
    end: 4102444800,
    mapDocToSession: mapTopicInfoToSession,
  })

  // Search/filter state
  const [query, setQuery] = useState('')
  const lessons: Session[] = useMemo(() => sessions || [], [sessions])
  const filteredLessons = useMemo(() => filterSessionsByQuery(lessons, query), [lessons, query])

  // Selection (sync with optional :sessionId route param)
  const [selectedId, setSelectedId] = useState<string | null>(sessionIdParam || null)
  useEffect(() => {
    // Keep internal selection in sync with URL param changes
    setSelectedId(sessionIdParam || null)
  }, [sessionIdParam])

  // When list updates and selectedId is not present, try to preserve selection by URL or choose first
  useEffect(() => {
    if (!filteredLessons?.length) return
    if (selectedId && filteredLessons.some(s => s.id === selectedId)) return
    if (sessionIdParam && filteredLessons.some(s => s.id === sessionIdParam)) {
      setSelectedId(sessionIdParam)
    } else {
      setSelectedId(filteredLessons[0]?.id || null)
    }
  }, [filteredLessons, selectedId, sessionIdParam])

  function handleSelect(id: string) {
    setSelectedId(id)
    // Update URL so selection is shareable/bookmarkable
    const base = `/classes/${encodeURIComponent(classId)}/lessons`
    navigate(id ? `${base}/${encodeURIComponent(id)}` : base, { replace: false })
  }

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0, gap: 16, padding: 16 }}>
      <LessonSidebar
        lessons={filteredLessons}
        selectedId={selectedId}
        onSelect={handleSelect}
        loading={loading}
        error={error}
        query={query}
        onQueryChange={setQuery}
      />

      <main style={{ flex: 1, minWidth: 0, minHeight: 0, border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        {!selectedId ? (
          <div style={{ color: '#6b7280' }}>Select a lesson to view details.</div>
        ) : (
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              {(filteredLessons.find(s => s.id === selectedId)?.title || selectedId) as string}
            </div>
            <div style={{ color: '#6b7280' }}>Lesson details will appear here.</div>
          </div>
        )}
      </main>
    </div>
  )
}

export default ClassLessonsPage
