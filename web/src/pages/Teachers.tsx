import React, { useMemo, useState } from 'react'
import { useAuth } from '../features/auth/public'
import { useAgentsList, useAgentsApi } from '../features/teachers/public'

function CreateTeacherModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { idToken } = useAuth()
  const { saveAgent } = useAgentsApi({ idToken, enabled: open })
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal={true}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}
    >
      <div style={{ width: 'min(560px, 96vw)', maxHeight: 'calc(100vh - 32px)', background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontWeight: 600 }}>Create teacher</div>
          <button onClick={onClose} aria-label="Close" style={{ border: '1px solid #e5e7eb', background: '#f9fafb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: 16, display: 'grid', gap: 10, overflow: 'auto' }}>
          {error ? (
            <div role="alert" style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: 8, borderRadius: 6 }}>{error}</div>
          ) : null}
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#374151' }}>Teacher name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Ms. Rivera" style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 10px' }} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#374151' }}>Description (optional)</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Short bio or notes" style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 10px', resize: 'vertical' }} />
          </label>
          <div className="tile-subtle" style={{ fontSize: 12 }}>
            Workflow is set to teachers-Teacher by default.
          </div>
        </div>
        <div style={{ padding: 16, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} disabled={submitting} className="btn btn-secondary">Cancel</button>
          <button
            onClick={async () => {
              setError(null)
              if (!name.trim()) {
                setError('Please enter a teacher name')
                return
              }
              try {
                setSubmitting(true)
                await saveAgent({ name: name.trim(), description: description.trim() || null, workflowName: 'teachers-Teacher', tools: [] })
                onCreated()
                onClose()
                setName('')
                setDescription('')
              } catch (e: any) {
                setError(e?.message || 'Failed to create teacher')
              } finally {
                setSubmitting(false)
              }
            }}
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function TeachersPage() {
  const { idToken } = useAuth()
  const { agents, loading, error, reload } = useAgentsList({ idToken, enabled: true })
  const [createOpen, setCreateOpen] = useState(false)

  const teacherAgents = useMemo(() => {
    return (agents || []).filter((a: any) => (a?.workflowName || '') === 'teachers-Teacher')
  }, [agents])

  return (
    <div className="page-scroll">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Teachers</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => reload()} className="btn btn-secondary btn-sm">Refresh</button>
        </div>
      </div>

      {loading && <div style={{ color: '#6b7280', marginBottom: 12 }}>Loading…</div>}
      {error && (
        <div role="alert" style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 8, borderRadius: 8, marginBottom: 12 }}>{error}</div>
      )}

      {/* Grid layout with New Teacher tile at the end, matching Classes/Lessons */}
      <ul className="grid-cards" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {/* Existing teachers */}
        {!loading && teacherAgents.map((a: any) => (
          <li key={a.id}>
            <div className="card-tile" style={{ width: '100%', textAlign: 'left', minHeight: 130 }} title={a.name || a.id}>
              <div className="tile-title" style={{ marginBottom: 4 }}>{a.name || a.id}</div>
              {a.description ? (
                <div className="tile-subtle" style={{ whiteSpace: 'pre-wrap' }}>{a.description}</div>
              ) : (
                <div className="tile-subtle">Workflow: {a.workflowName || '—'}</div>
              )}
            </div>
          </li>
        ))}

        {/* + New Teacher tile should be last in the grid */}
        <li>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="card-tile tile-new tile-square"
            aria-label="Create new teacher"
            style={{ width: '100%' }}
          >
            <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 8 }}>＋</div>
            <div style={{ fontWeight: 700 }}>New Teacher</div>
            <div className="tile-subtle">Create a new teacher</div>
          </button>
        </li>
      </ul>

      <CreateTeacherModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={reload} />
    </div>
  )
}

export default TeachersPage
