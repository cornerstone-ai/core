// Classes feature public surface (wraps awfl-web projects feature)

export { useProjectsList as useClassesList } from '@awfl/web/features/projects/public'
export type { Project as Class } from '@awfl/web/features/projects/public'

// Map project selection helpers to class-named exports
import { getSelectedProjectId, setSelectedProjectId } from '@awfl/web/features/projects/public'

export { getSelectedProjectId as getSelectedClassId }

// Wrap setter to broadcast selection changes within this app
export function setSelectedClassId(id?: string | null): void {
  try {
    setSelectedProjectId(id as any)
  } finally {
    try {
      if (typeof window !== 'undefined' && 'dispatchEvent' in window) {
        const detail = { id: id ?? '' }
        window.dispatchEvent(new CustomEvent('class:selected', { detail }))
      }
    } catch {
      // no-op: event dispatch best-effort
    }
  }
}

// Local modal wrapper customized for Classes
export { NewClassModal } from './NewClassModal'

// Latest session hook for class subtitle
export { useLatestSession } from './hooks/useLatestSession'
