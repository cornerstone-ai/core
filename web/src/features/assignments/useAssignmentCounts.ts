import { useMemo } from 'react'
import { useTasksCounts } from '@awfl-web/features/tasks/public'

export type AssignmentCounts = {
  assigned: number
  inProgress: number
  finished: number
  needsAttention: number
}

export type UseAssignmentCountsParams = {
  sessionId?: string | null
  idToken?: string | null
  enabled?: boolean
}

export function useAssignmentCounts(params: UseAssignmentCountsParams) {
  const { sessionId, idToken, enabled = true } = params
  const { counts, loading, error, reload } = useTasksCounts({ sessionId: sessionId ?? undefined, idToken: idToken ?? undefined, enabled })

  const mapped: AssignmentCounts | null = useMemo(() => {
    if (!counts) return null
    return {
      assigned: counts.queued || 0,
      inProgress: counts.inProgress || 0,
      finished: counts.done || 0,
      needsAttention: counts.stuck || 0,
    }
  }, [counts])

  return { counts: mapped, loading, error, reload }
}
