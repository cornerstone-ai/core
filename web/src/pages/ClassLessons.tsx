import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
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
import {
  AssignmentStatusPills,
  AssignmentTile,
  AssignmentModal,
  useAssignmentCounts,
  useLessonAssignments,
} from '../features/assignments/public'

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

  // Assignments (session-scoped): counts + inline list
  const { counts: assignmentCounts, loading: countsLoading, reload: reloadAssignmentCounts } = useAssignmentCounts({ sessionId: selectedId, idToken, enabled: !!selectedId })
  const lessonAssignments = useLessonAssignments({
    sessionId: selectedId,
    idToken,
    enabled: !!selectedId,
    reloadAssignmentCounts: reloadAssignmentCounts,
  })

  const showingAssignments = !!lessonAssignments.activeAssignmentStatus

  // Yoj context for the selected lesson (session)
  const { messages, running, error: execError, reload: reloadYoj } = useTopicContextYoj({
    sessionId: selectedId,
    idToken,
    windowSeconds: 3600,
    enabled: !!selectedId && !showingAssignments,
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
    enabled: !!selectedId && !showingAssignments,
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

  // Poll every second while not running; reload either messages or assignments counts/list
  useSessionPolling({
    enabled: !!selectedId,
    sessionId: selectedId,
    activeTaskStatus: lessonAssignments.activeAssignmentStatus as any,
    running: !!running,
    reloadMessages: showingAssignments ? () => {} : reloadYoj,
    reloadTaskCounts: reloadAssignmentCounts,
    reloadInlineTasks: lessonAssignments.reloadAssignments,
    intervalMs: 1000,
  })

  // Extract exec status error (if present) and expose as a dismissible alert
  const execStatusErrorRaw = (awx as any)?.status?.error
  const execStatusError: string | null = useMemo(() => {
    if (!execStatusErrorRaw) return null
    if (typeof execStatusErrorRaw === 'string') return execStatusErrorRaw
    if (typeof execStatusErrorRaw?.message === 'string' && execStatusErrorRaw.message.length > 0) return execStatusErrorRaw.message
    try {
      return JSON.stringify(execStatusErrorRaw)
    } catch {
      return String(execStatusErrorRaw)
    }
  }, [execStatusErrorRaw])
  const [dismissedExecStatusError, setDismissedExecStatusError] = useState(false)
  // Reset dismissal when a new error appears/changes
  useEffect(() => {
    setDismissedExecStatusError(false)
  }, [execStatusError])

  // Autoscroll management
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const messagesHomeRef = useRef<HTMLDivElement | null>(null)
  useScrollHome({
    containerRef: messagesRef,
    anchorRef: messagesHomeRef,
    itemCount: (messages || []).length,
    home: 'bottom',
    enabled: !!selectedId && !showingAssignments,
    key: selectedId || undefined,
  })

  const assignmentsRef = useRef<HTMLDivElement | null>(null)
  const assignmentsHomeRef = useRef<HTMLDivElement | null>(null)
  // Disable auto-scroll for assignments to prevent page jumping on pill toggles
  // We still render an anchor with scroll-margin-top to avoid sticky-header overlap if scrolled programmatically elsewhere.
  // If we later want to re-enable, key should NOT include status.
  // useScrollHome({
  //   containerRef: assignmentsRef,
  //   anchorRef: assignmentsHomeRef,
  //   itemCount: (lessonAssignments.sessionTasks || []).length,
  //   home: 'top',
  //   enabled: !!selectedId && showingAssignments,
  //   key: selectedId || undefined,
  // })

  // Prevent page jump on toggling messages <-> assignments AND on status changes by restoring window scroll
  const lastViewKeyRef = useRef<string | null>(null)
  useLayoutEffect(() => {
    const viewKey = showingAssignments ? `assign:${lessonAssignments.activeAssignmentStatus || ''}` : 'messages'
    if (lastViewKeyRef.current && lastViewKeyRef.current !== viewKey) {
      const x = window.scrollX
      const y = window.scrollY
      // Restore in the next frame after DOM changes
      requestAnimationFrame(() => window.scrollTo(x, y))
    }
    lastViewKeyRef.current = viewKey
  }, [showingAssignments, lessonAssignments.activeAssignmentStatus])

  // Ensure window doesn't steal scroll when switching to assignments. Keep the
  // app header from covering the first row by adding a scroll-margin on the top anchor.
  const anchorTopStyle: React.CSSProperties = { height: 1, overflowAnchor: 'none' as any, scrollMarginTop: 56 }

  if (selectedId) {
    const title = selected ? (selected.title && selected.title.trim().length > 0 ? selected.title : selected.id) : selectedId

    const onHeaderActivate = () => {
      if (showingAssignments) lessonAssignments.setActiveAssignmentStatus(null)
    }

    const onHeaderKey = (e: React.KeyboardEvent) => {
      if (!showingAssignments) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        lessonAssignments.setActiveAssignmentStatus(null)
      }
    }

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
              </div>
              <h1
                onClick={onHeaderActivate}
                onKeyDown={onHeaderKey}
                role={showingAssignments ? 'button' : undefined}
                tabIndex={showingAssignments ? 0 : undefined}
                title={showingAssignments ? 'Back to messages' : undefined}
                style={{ margin: '2px 0 6px', fontSize: 20, cursor: showingAssignments ? 'pointer' : 'default' }}
              >
                {title}
              </h1>

              {/* Assignment status pills */}
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <AssignmentStatusPills
                  counts={assignmentCounts || undefined}
                  loading={countsLoading}
                  active={lessonAssignments.activeAssignmentStatus}
                  onSelect={lessonAssignments.setActiveAssignmentStatus}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => lessonAssignments.openAddAssignment()}
                    title="Add assignment"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 8, borderRadius: 8, marginTop: 4 }}>
                  {error}
                </div>
              )}
              {!showingAssignments && (
                <>
                  {execError && (
                    <div role="alert" style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 8, borderRadius: 8, marginTop: 4 }}>
                      {execError}
                    </div>
                  )}
                  {(awx as any)?.error && (
                    <div role="alert" style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 8, borderRadius: 8, marginTop: 4 }}>
                      {String((awx as any).error)}
                    </div>
                  )}
                  {/* New: Surface exec status error when present, with dismiss + optional retry */}
                  {execStatusError && !dismissedExecStatusError && (
                    <div role="alert" style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 8, borderRadius: 8, marginTop: 4, display: 'flex', alignItems: 'flex-start', gap: 8, justifyContent: 'space-between' }}>
                      <div style={{ flex: 1, whiteSpace: 'pre-wrap' }}>{execStatusError}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {(awx as any)?.retry && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={async () => {
                              try {
                                await (awx as any).retry()
                              } finally {
                                setDismissedExecStatusError(true)
                              }
                            }}
                          >
                            Retry
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setDismissedExecStatusError(true)}
                          aria-label="Dismiss error"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Scrollable middle area: messages OR assignments list */}
            {!showingAssignments ? (
              <div ref={messagesRef} className="lesson-messages yoj-theme" style={{ overflowAnchor: 'none' as any }}>
                <YojMessageList
                  messages={messages as any}
                  sessionId={selectedId || undefined}
                  idToken={idToken || undefined}
                  assistantName={assistantName}
                  hideExecGutter={isMobile}
                />
                {/* Bottom anchor for reliable scrollIntoView */}
                <div ref={messagesHomeRef} aria-hidden="true" style={{ height: 1, overflowAnchor: 'none' as any }} />
              </div>
            ) : (
              <div ref={assignmentsRef} className="lesson-messages" style={{ padding: 8, overflowAnchor: 'none' as any }}>
                {/* Top anchor for reliable scrollIntoView; add scroll-margin to avoid sticky header overlap */}
                <div ref={assignmentsHomeRef} aria-hidden="true" style={anchorTopStyle} />
                <ul className="grid-cards" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {(lessonAssignments.sessionTasks || []).map((t: any) => (
                    <li key={t.id}>
                      <AssignmentTile item={t} onOpen={() => lessonAssignments.handleEditAssignment(t)} />
                    </li>
                  ))}
                  {/* No explicit loading label while fetching assignments */}
                  {!lessonAssignments.loadingAssignments && (lessonAssignments.sessionTasks || []).length === 0 && (
                    <li>
                      <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>No assignments</div>
                        <div className="tile-subtle">Select a status above or add a new assignment.</div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Footer (submit) without white background */}
            {!showingAssignments && (
              <div className="lesson-footer prompt-plain">
                <PromptInput
                  placeholder={
                    awx?.canExecute
                      ? (awx?.workflowName ? `Trigger workflow ${awx.workflowName}…` : 'Type a prompt and press Enter…')
                      : (awx?.agentsLoading ? 'Loading agents…' : 'Select an agent/workflow to enable execution…')
                  }
                  status={awx?.status}
                  running={awx?.running}
                  submitting={submitting}
                  onSubmit={handlePromptSubmit}
                  onStop={handleStop}
                  disabled={!selectedId || !awx?.canExecute || awx?.agentsLoading}
                />
              </div>
            )}
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

          {/* Assignment create/edit modal */}
          <AssignmentModal
            open={lessonAssignments.assignmentModalOpen}
            mode={lessonAssignments.assignmentModalMode as any}
            initial={lessonAssignments.editingAssignment as any}
            onClose={lessonAssignments.closeAssignmentModal}
            onSave={async (input: any) => {
              await lessonAssignments.handleSaveAssignment(input)
              await lessonAssignments.reloadAssignments()
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
