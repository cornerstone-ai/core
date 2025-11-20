import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/public'
import { setSelectedClassId, useClassesList } from '../features/classes/public'
import {
  useSessionsList,
  mapTopicInfoToSession,
  type Session,
  useSessionPolling,
  getWorkflowName,
  mergeSessions,
  useNewSessionCreation,
} from '@awfl-web/features/sessions/public'
import { useTopicContextYoj, YojMessageList } from '@awfl-web/features/yoj/public'
import { PromptInput } from '@awfl-web/components/public'
import { useScrollHome } from '@awfl-web/core/public'
import { useAgentWorkflowExecute } from '@awfl-web/features/agents/public'
import { AgentModal, useAgentModalController, useSessionAgentConfig, useAgentsApi } from '../features/teachers/public'
import { LessonTile, NewLessonModal } from '../features/lessons/public'

export function ClassLessonsPage() {
  const { classId: classIdParam, sessionId: sessionIdParam } = useParams()
  const navigate = useNavigate()
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

  // Ephemeral creation support (appears immediately in list)
  const agentsApi = useAgentsApi({ idToken })
  const { ephemeralSessions, createNewSession } = useNewSessionCreation({
    userId: user?.uid || null,
    projectId: classId,
    // No auto-exec for list creation; detail view execution is guarded separately
    startWf: () => Promise.resolve(undefined),
    agentsApi,
    autoStart: false,
  })

  const lessonsServer: Session[] = useMemo(() => sessions || [], [sessions])
  const lessons: Session[] = useMemo(() => mergeSessions(lessonsServer, ephemeralSessions), [lessonsServer, ephemeralSessions])

  // Detail route present? render the single-lesson view
  const selectedId = sessionIdParam || null
  const selected = useMemo(() => (lessonsServer.find(s => s.id === selectedId) || null), [lessonsServer, selectedId])

  // Yoj context for the selected lesson (session)
  const { messages, running, error: execError, reload: reloadYoj } = useTopicContextYoj({
    sessionId: selectedId,
    idToken,
    windowSeconds: 3600,
    enabled: !!selectedId,
  })

  // Compute session-derived workflow name (used for AgentModal defaults)
  const sessionWorkflowName = getWorkflowName(selectedId || '')

  // Server-backed session agent config (single source of truth for agent + workflow)
  const agent = useAgentModalController({ idToken, sessionId: selectedId || null, workflowName: sessionWorkflowName || null, enabled: !!selectedId })
  const agentConfig = useSessionAgentConfig({ idToken, sessionId: selectedId, enabled: !!selectedId })

  // Turnkey workflow execution wired to resolved agent/workflow for this session
  const awx = useAgentWorkflowExecute({
    sessionId: selectedId || undefined,
    idToken,
    pendingAgentId: (agentConfig as any)?.agent?.id || (agentConfig as any)?.agentId,
    session: (selected as any) || undefined,
    enabled: !!selectedId,
  })

  // Assistant label: prefer configured agent name; fallback to "Assistant"
  const assistantName = (agentConfig.agent?.name?.trim?.() || '').trim() || 'Assistant'

  const [submitting, setSubmitting] = useState(false)

  // List-view modal state MUST be declared before any conditional return to preserve hook order
  const [newOpen, setNewOpen] = useState(false)

  async function handlePromptSubmit(text: string) {
    if (!awx?.canExecute) return
    try {
      setSubmitting(true)
      await awx.execute({ query: text })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStop() {
    try {
      await awx.stop?.({ includeDescendants: true })
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
              {awx?.error && (
                <div role="alert" style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 8, borderRadius: 8, marginTop: 4 }}>
                  {String(awx.error)}
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
              <div ref={homeAnchorRef} aria-hidden="true" style={{ height: 1, overflowAnchor: 'none' as any }} />
            </div>

            {/* Footer (submit) without white background */}
            <div className="lesson-footer prompt-plain">
              <PromptInput
                placeholder={awx?.workflowName ? `Trigger workflow ${awx.workflowName}…` : 'Type a prompt and press Enter…'}
                status={awx?.status}
                running={awx?.running}
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
          <button onClick={() => setNewOpen(true)} className="btn btn-primary btn-sm">New Lesson</button>
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
              <div className="tile-subtle">Create the first lesson to get started.</div>
              <div style={{ marginTop: 10 }}>
                <button onClick={() => setNewOpen(true)} className="btn btn-primary btn-sm">New Lesson</button>
              </div>
            </div>
          </li>
        )}
      </ul>

      <NewLessonModal
        open={newOpen}
        classId={classId}
        onClose={() => setNewOpen(false)}
        onCreated={(sessionId) => navigate(`/classes/${encodeURIComponent(classId)}/lessons/${encodeURIComponent(sessionId)}`)}
        createNewSession={createNewSession}
      />
    </div>
  )
}

export default ClassLessonsPage
