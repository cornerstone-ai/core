import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/public'
import { setSelectedClassId, useClassesList } from '../features/classes/public'
import {
  useSessionsList,
  mapTopicInfoToSession,
  type Session,
  useSessionPolling,
  getWorkflowName,
} from '@awfl-web/features/sessions/public'
import { useTopicContextYoj, YojMessageList } from '@awfl-web/features/yoj/public'
import { PromptInput } from '@awfl-web/components/public'
import { useWorkflowExec, useScrollHome } from '@awfl-web/core/public'
import { AgentModal, useAgentModalController, useSessionAgentConfig } from '../features/teachers/public'

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
  const loc = useLocation()
  const classId = decodeURIComponent(classIdParam || '')

  useEffect(() => {
    if (classId) setSelectedClassId(classId)
  }, [classId])

  const { idToken, user } = useAuth()

  // Mobile detection for UI tweaks (e.g., hide exec gutter)
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && 'matchMedia' in window ? window.matchMedia('(max-width: 640px)').matches : false)
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return
    const mq = window.matchMedia('(max-width: 640px)')
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange)
    onChange()
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange)
    }
  }, [])

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

  // Removed auto-open redirect: switching classes while on lessons should show the list for the new class.

  // Yoj context for the selected lesson (session)
  const { messages, running, error: execError, reload: reloadYoj } = useTopicContextYoj({
    sessionId: selectedId,
    idToken,
    windowSeconds: 3600,
    enabled: !!selectedId,
  })

  // Workflow exec wiring (status/start/stop) for the selected session
  const { status: wfStatus, running: wfRunning, error: wfError, start: startWf, stop: stopWf } = useWorkflowExec({
    sessionId: selectedId || undefined,
    idToken,
    enabled: !!selectedId,
  })

  // Keep a ref of the current selected session id to avoid stale captures in handlers
  const currentSessionIdRef = useRef<string | null>(null)
  useEffect(() => {
    currentSessionIdRef.current = selectedId || null
  }, [selectedId])

  // Wrapper that always injects the latest sessionId when starting a workflow
  function startWfForCurrentSession(workflowName: string, input?: { query?: string }, opts?: { sessionId?: string }) {
    const sid = opts?.sessionId ?? currentSessionIdRef.current ?? undefined
    return startWf(workflowName, { query: input?.query ?? '' }, { ...opts, sessionId: sid })
  }

  // Compute session-derived workflow name
  const sessionWorkflowName = getWorkflowName(selectedId || '')

  // Server-backed session agent config (single source of truth for agent + workflow)
  const agent = useAgentModalController({ idToken, sessionId: selectedId || null, workflowName: sessionWorkflowName || null, enabled: !!selectedId })
  const agentConfig = useSessionAgentConfig({ idToken, sessionId: selectedId, enabled: !!selectedId })

  // Effective workflow chosen from agent configuration, falling back to session-derived
  const effectiveWorkflowName = agentConfig.workflowName || sessionWorkflowName || null

  // Assistant label: prefer configured agent name; fallback to "Assistant"
  const assistantName = (agentConfig.agent?.name?.trim?.() || '').trim() || 'Assistant'

  const [submitting, setSubmitting] = useState(false)

  async function handlePromptSubmit(text: string) {
    if (!effectiveWorkflowName) return
    try {
      setSubmitting(true)
      await startWfForCurrentSession(effectiveWorkflowName, { query: text })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStop() {
    try {
      await stopWf({ includeDescendants: true, workflow: effectiveWorkflowName || undefined })
    } catch {}
  }

  // Poll every second while not running; no-op task reloads (we only show messages here)
  useSessionPolling({
    enabled: !!selectedId,
    sessionId: selectedId,
    activeTaskStatus: null,
    running: !!running,
    reloadMessages: reloadYoj,
    reloadTaskCounts: () => {},
    reloadInlineTasks: () => {},
    intervalMs: 1000,
  })

  // Autoscroll management: messages area is the scroll container, anchored to bottom
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const homeAnchorRef = useRef<HTMLDivElement | null>(null)
  useScrollHome({
    containerRef: messagesRef,
    anchorRef: homeAnchorRef,
    itemCount: (messages || []).length,
    home: 'bottom',
    enabled: !!selectedId,
    key: selectedId || undefined,
  })

  if (selectedId) {
    const selected = lessons.find(s => s.id === selectedId)
    const title = selected ? (selected.title && selected.title.trim().length > 0 ? selected.title : selected.id) : selectedId
    return (
      <div className="container" style={{ padding: '8px 12px 12px' }}>
        <div className="lesson-root">
          {/* Layout directly without a rounded white frame */}
          <div className="lesson-layout">
            {/* Header (sticks visually because only the middle scrolls) */}
            <div className="lesson-header">
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/classes/${encodeURIComponent(classId)}/lessons`)}
                  aria-label="Back to lessons"
                >
                  ← Back
                </button>
                <div className="row" style={{ gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => { reload(); reloadYoj(); }}
                    className="btn btn-secondary btn-sm"
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={agent.openEdit}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit Teacher
                  </button>
                </div>
              </div>
              <h1 style={{ margin: '2px 0 0', fontSize: 20 }}>{title}</h1>
              {loading && <div style={{ color: '#6b7280', marginTop: 4 }}>Loading…</div>}
              {error && (
                <div role="alert" style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 8, borderRadius: 8, marginTop: 4 }}>
                  {error}
                </div>
              )}
              {execError && (
                <div role="alert" style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 8, borderRadius: 8, marginTop: 4 }}>
                  {execError}
                </div>
              )}
              {wfError && (
                <div role="alert" style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 8, borderRadius: 8, marginTop: 4 }}>
                  {wfError}
                </div>
              )}
            </div>

            {/* Scrollable messages area with yoj theme variables */}
            <div ref={messagesRef} className="lesson-messages yoj-theme">
              <YojMessageList
                messages={messages as any}
                sessionId={selectedId || undefined}
                idToken={idToken || undefined}
                assistantName={assistantName}
                hideExecGutter={isMobile}
              />
              {/* Bottom anchor for reliable scrollIntoView */}
              <div ref={homeAnchorRef} aria-hidden="true" />
            </div>

            {/* Footer (submit) without white background */}
            <div className="lesson-footer prompt-plain">
              <PromptInput
                placeholder={effectiveWorkflowName ? `Trigger workflow ${effectiveWorkflowName}…` : 'Type a prompt and press Enter…'}
                status={wfStatus}
                running={wfRunning}
                submitting={submitting}
                onSubmit={handlePromptSubmit}
                onStop={handleStop}
                disabled={!selectedId}
              />
            </div>
          </div>

          <AgentModal
            open={agent.open}
            mode={agent.mode}
            initial={agent.initial || { name: agentConfig.workflowName || sessionWorkflowName || '', description: '', workflowName: sessionWorkflowName || '', tools: [] }}
            tools={agent.tools}
            workflows={agent.workflows}
            workflowsLoading={agent.workflowsLoading}
            onClose={() => agent.setOpen(false)}
            onSave={async (input) => {
              await agent.onSave(input)
              await agentConfig.reload()
            }}
          />
        </div>
      </div>
    )
  }

  // List view
  return (
    <div className="page-scroll">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="row" style={{ alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/classes')}
            aria-label="Back to classes"
          >
            ← Classes
          </button>
          <h1 style={{ margin: 0, fontSize: 22 }}>{className} Lessons</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={reload} className="btn btn-secondary btn-sm">Refresh</button>
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
