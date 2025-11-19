// Classes feature public surface (wraps awfl-web projects feature)

export { useProjectsList as useClassesList } from '@awfl-web/features/projects/public'
export type { Project as Class } from '@awfl-web/features/projects/public'

// Map project selection helpers to class-named exports
export {
  getSelectedProjectId as getSelectedClassId,
  setSelectedProjectId as setSelectedClassId,
} from '@awfl-web/features/projects/public'

// Local modal wrapper customized for Classes
export { NewClassModal } from './NewClassModal'

// Latest session hook for class subtitle
export { useLatestSession } from './hooks/useLatestSession'
