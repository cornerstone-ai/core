import { useCallback, useMemo } from 'react'
import { useSessionTasks } from '@awfl/web/features/tasks/hooks/useSessionTasks'
import { toTaskStatus, toAssignmentStatus, type AssignmentStatus } from './public'

// Keep types derived from the underlying hook to avoid importing internal awfl-web types
type Underlying = ReturnType<typeof useSessionTasks>

export type UseLessonAssignmentsOptions = {
  sessionId?: string | null
  idToken?: string | null
  workflowName?: string | null
  startWf?: (workflowName: string, payload: Record<string, any>) => Promise<any> | void
  enabled?: boolean
  // Called after create/update/delete to refresh counts in the header
  reloadAssignmentCounts?: () => void
}

export type UseLessonAssignmentsResult = {
  // Status selection controlling inline list
  activeAssignmentStatus: AssignmentStatus | null
  setActiveAssignmentStatus: (s: AssignmentStatus | null) => void

  // Inline assignments list (task records reused)
  sessionTasks?: Underlying['sessionTasks']
  loadingAssignments: boolean
  assignmentsError?: string | null
  reloadAssignments: () => void

  // Modal state/controls
  assignmentModalOpen: boolean
  assignmentModalMode: Underlying['taskModalMode']
  editingAssignment: Underlying['editingTask']
  openAddAssignment: () => void
  handleEditAssignment: (t: NonNullable<Underlying['editingTask']>) => void
  closeAssignmentModal: () => void
  handleSaveAssignment: (input: { title?: string; description?: string; status?: AssignmentStatus | string }) => Promise<void>
  handleDeleteAssignment: (t: NonNullable<Underlying['editingTask']>) => Promise<void>
}

export function useLessonAssignments(options: UseLessonAssignmentsOptions): UseLessonAssignmentsResult {
  const {
    sessionId,
    idToken,
    workflowName,
    startWf,
    enabled = false,
    reloadAssignmentCounts,
  } = options

  const under = useSessionTasks({
    sessionId,
    idToken,
    workflowName,
    startWf,
    enabled,
    reloadTaskCounts: reloadAssignmentCounts,
  })

  const activeAssignmentStatus = useMemo(() => toAssignmentStatus(under.activeTaskStatus), [under.activeTaskStatus])

  const setActiveAssignmentStatus = useCallback((s: AssignmentStatus | null) => {
    under.setActiveTaskStatus(toTaskStatus(s) as any)
  }, [under.setActiveTaskStatus])

  const handleSaveAssignment = useCallback(async (input: { title?: string; description?: string; status?: AssignmentStatus | string }) => {
    const mapped = typeof input.status === 'string' ? toTaskStatus(toAssignmentStatus(input.status)) ?? input.status : toTaskStatus(input.status ?? null)
    await under.handleSaveTask({ ...input, status: mapped || undefined })
  }, [under.handleSaveTask])

  return {
    activeAssignmentStatus,
    setActiveAssignmentStatus,

    sessionTasks: under.sessionTasks,
    loadingAssignments: under.loadingTasks,
    assignmentsError: under.tasksError,
    reloadAssignments: under.reloadTasks,

    assignmentModalOpen: under.taskModalOpen,
    assignmentModalMode: under.taskModalMode,
    editingAssignment: under.editingTask,
    openAddAssignment: under.openAddTask,
    handleEditAssignment: under.handleEditTask,
    closeAssignmentModal: under.closeTaskModal,
    handleSaveAssignment,
    handleDeleteAssignment: under.handleDeleteTask,
  }
}
