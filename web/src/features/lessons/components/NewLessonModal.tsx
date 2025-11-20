import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../auth/public'
import { useAgentsList } from '../../teachers/public'

export function NewLessonModal({
  open,
  classId,
  onClose,
  onCreated,
  createNewSession,
}: {
  open: boolean
  classId: string
  onClose: () => void
  onCreated: (sessionId: string) => void
  createNewSession: (input: { agentId?: string | null; workflowName?: string | null }) => Promise<{ id?: string | null }>
}) {
  const { idToken } = useAuth()
  const { agents, loading: loadingAgents, error: teachersError } = useAgentsList({ idToken, enabled: open })
  const teacherAgents = useMemo(() => {
    return (agents || []).filter((a: any) => (a?.workflowName || '') === 'teachers-Teacher')
  }, [agents])

  const [selectedId, setSelectedId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const firstFocusRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        // Minimal focus trap across the modal panel
        const panel = panelRef.current
        if (!panel) return
        const focusables = panel.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        const list = Array.from(focusables).filter(el => !el.hasAttribute('disabled'))
        if (list.length === 0) return
        const first = list[0]
        const last = list[list.length - 1]
        const active = document.activeElement as HTMLElement | null
        if (e.shiftKey && active === first) {
          e.preventDefault()
          ;(last as HTMLElement).focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          ;(first as HTMLElement).focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    setTimeout(() => firstFocusRef.current?.focus(), 0)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    // Default to first teacher when loaded
    if (teacherAgents.length > 0) {
      setSelectedId(prev => prev || teacherAgents[0].id)
    }
  }, [open, teacherAgents])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal={true}
      aria-label="Create new lesson"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}
    >
      <div ref={panelRef} style={{ width: 'min(520px, 96vw)', maxHeight: 'calc(100vh - 32px)', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', boxShadow: '0 12px 32px rgba(0,0,0,0.18)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700 }}>New Lesson</div>
          <button ref={firstFocusRef} onClick={onClose} aria-label="Close" className="btn btn-secondary btn-sm">✕</button>
        </div>
        <div style={{ padding: 16, display: 'grid', gap: 10, overflow: 'auto' }}>
          {teachersError && (
            <div role="alert" style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: 8, borderRadius: 6 }}>{teachersError}</div>
          )}
          {error && (
            <div role="alert" style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: 8, borderRadius: 6 }}>{error}</div>
          )}
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#374151' }}>Choose a Teacher</span>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={loadingAgents}
              style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 10px' }}
            >
              {teacherAgents.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name || t.id}</option>
              ))}
            </select>
          </label>
          {teacherAgents.length === 0 && !loadingAgents && (
            <div className="tile-subtle">No teachers yet. Create one on the Teachers page.</div>
          )}
        </div>
        <div style={{ padding: 16, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm" disabled={submitting}>Cancel</button>
          <button
            className="btn btn-primary btn-sm"
            disabled={submitting || loadingAgents || !selectedId}
            onClick={async () => {
              setError(null)
              if (!selectedId) return
              try {
                setSubmitting(true)
                const res = await createNewSession({ agentId: selectedId })
                const newId: string = (res?.id as string) || ''
                if (!newId) throw new Error('Failed to create session')
                onCreated(newId)
                onClose()
              } catch (e: any) {
                setError(e?.message || 'Failed to create lesson')
              } finally {
                setSubmitting(false)
              }
            }}
          >
            {submitting ? 'Creating…' : 'Create lesson'}
          </button>
        </div>
      </div>
    </div>
  )
}
