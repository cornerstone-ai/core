// Classes feature: thin rebrand over awfl-web projects
// We re-export projects as classes to avoid duplicating logic, with a local modal wrapper.

export { useProjectsList as useClassesList } from '../../../../awfl-web/src/features/projects/public'
export type { Project as Class } from '../../../../awfl-web/src/features/projects/public'
export {
  getSelectedProjectId as getSelectedClassId,
  setSelectedProjectId as setSelectedClassId,
} from '../../../../awfl-web/src/features/projects/public'

// Local customized NewClassModal (title + no remote field)
export { NewClassModal } from './NewClassModal'

// Local presentational component
export { ClassSelector } from './ClassSelector'
