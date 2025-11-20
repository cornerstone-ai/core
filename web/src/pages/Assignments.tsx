import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/public'
import { getSelectedClassId } from '../features/classes/public'
import { AssignmentsGrid, useAssignmentsList } from '../features/assignments/public'

export function AssignmentsPage() {
  const navigate = useNavigate()
  const { idToken } = useAuth()
  const classId = useMemo(() => getSelectedClassId() || null, [])

  // Minimal list of assignments, scoped to selected class when available
  const { tasks = [], loading, error, reload } = useAssignmentsList({
    idToken,
    // Many awfl-web hooks accept projectId for scoping; provide when available
    // @ts-ignore allow passing through if supported; otherwise backend will ignore
    projectId: classId || undefined,
    // newest first by update time
    field: 'update_time',
    order: 'desc',
    start: 0,
    end: 4102444800,
  } as any)

  const items = tasks as any[]

  function handleOpen(t: any) {
    // Try to navigate to the lesson detail that owns this assignment
    const sid = t?.sessionId || t?.session_id || t?.topicId || t?.topic_id || t?.session || null
    const pid = t?.projectId || t?.project_id || classId || null
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
