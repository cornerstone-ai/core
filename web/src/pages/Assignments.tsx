import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/public'
import { getSelectedClassId } from '../features/classes/public'
import { AssignmentsGrid, useAssignmentsList } from '../features/assignments/public'

export function AssignmentsPage() {
  const navigate = useNavigate()
  const { idToken } = useAuth()

  // Track selected class and react to changes (storage + custom event)
  const [classId, setClassId] = useState<string | null>(() => getSelectedClassId() || null)
  useEffect(() => {
    const onClass = (e: any) => {
      const next = (e?.detail?.id ?? '') as string
      setClassId(next || getSelectedClassId() || null)
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'awfl.projectId') {
        setClassId((e.newValue || '') || getSelectedClassId() || null)
      }
    }
    window.addEventListener('class:selected', onClass as any)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('class:selected', onClass as any)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  // Minimal list of assignments (global); we will client-filter by class when available
  const { tasks = [], loading, error, reload } = useAssignmentsList({
    idToken,
    // newest first by update time
    order: 'desc',
  } as any)

  // When class selection changes, trigger a reload to pick up scoped data if backend supports it
  useEffect(() => {
    reload()
  }, [classId])

  // Client-side filter by class when possible
  const items = useMemo(() => {
    if (!Array.isArray(tasks)) return [] as any[]
    if (!classId) return tasks as any[]
    const filtered: any[] = []
    for (const t of tasks as any[]) {
      const pid = t?.projectId || t?.project_id || t?.raw?.projectId || t?.raw?.project_id || ''
      if (!pid || pid === classId) filtered.push(t)
    }
    return filtered
  }, [tasks, classId])

  function handleOpen(t: any) {
    // Try to navigate to the lesson detail that owns this assignment
    const sid = t?.sessionId || t?.session_id || t?.topicId || t?.topic_id || t?.session || null
    const pid = t?.projectId || t?.project_id || t?.raw?.projectId || t?.raw?.project_id || classId || null
    if (sid && pid) {
      navigate(`/classes/${encodeURIComponent(pid)}/lessons/${encodeURIComponent(sid)}`)
      return
    }
  }

  return (
    <div className="page-scroll">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Assignments</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={reload as any} className="btn btn-secondary btn-sm">Refresh</button>
        </div>
      </div>

      {error && (
        <div role="alert" style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 8, borderRadius: 8, marginBottom: 12 }}>
          {String(error)}
        </div>
      )}

      <AssignmentsGrid items={items} loading={!!loading} onOpen={handleOpen} />
    </div>
  )
}

export default AssignmentsPage
