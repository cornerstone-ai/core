// Cornerstone Assignments feature: wrappers around awfl-web Tasks with rebranded labels

export type AssignmentStatus = 'Assigned' | 'In Progress' | 'Finished' | 'Needs Attention'

// Mappings between Tasks and Assignments labels
export function toTaskStatus(status: AssignmentStatus | null): 'Queued' | 'In Progress' | 'Done' | 'Stuck' | null {
  if (!status) return null
  switch (status) {
    case 'Assigned':
      return 'Queued'
    case 'In Progress':
      return 'In Progress'
    case 'Finished':
      return 'Done'
    case 'Needs Attention':
      return 'Stuck'
    default:
      return null
  }
}

export function toAssignmentStatus(status: string | null | undefined): AssignmentStatus | null {
  if (!status) return null
  const s = String(status)
  if (s === 'Queued') return 'Assigned'
  if (s === 'In Progress') return 'In Progress'
  if (s === 'Done') return 'Finished'
  if (s === 'Stuck') return 'Needs Attention'
  return null
}

// Hooks: thin re-exports with typed aliases
export { useTasksList as useAssignmentsList } from '@awfl/web/features/tasks/public'
export { TaskModal as AssignmentModal } from '@awfl/web/features/tasks/public'

export { useAssignmentCounts } from './useAssignmentCounts'
export { useLessonAssignments } from './useLessonAssignments'

// Components
export { AssignmentStatusPills } from './components/AssignmentStatusPills'
export { AssignmentTile } from './components/AssignmentTile'
export { AssignmentsGrid } from './components/AssignmentsGrid'
