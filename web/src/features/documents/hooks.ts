import { useEffect, useMemo } from 'react'
import { useFsList } from '@awfl-web/features/filesystem/hooks/useFsList'
import type { FsListResult } from '@awfl-web/features/filesystem/types'

export type UseClassFilesParams = {
  classId?: string | null
  idToken?: string | null
  path?: string
  enabled?: boolean
}

export type UseClassFilesResult = {
  loading: boolean
  error: string | null
  data: FsListResult | null
  reload: () => void
}

// Thin wrapper around awfl-web useFsList that bumps reload when classId changes
export function useClassFiles(params: UseClassFilesParams): UseClassFilesResult {
  const { classId, idToken = null, path = '.', enabled = true } = params || ({} as any)

  const fs = useFsList({ path, idToken, enabled })

  // When the selected class changes, force a reload even if path is the same
  useEffect(() => {
    if (!enabled) return
    // Skip reload on initial undefined → defined transition? We keep it simple and always reload on change.
    fs.reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId])

  return useMemo(() => fs, [fs])
}
