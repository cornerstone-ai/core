import { useEffect, useMemo, useRef, useState } from 'react'
import { makeApiClient } from '@awfl-web/api/apiClient'
import { mapTopicInfoToSession } from '@awfl-web/features/sessions/public'

export type UseLatestSessionParams = {
  projectId?: string | null
  idToken?: string | null
  enabled?: boolean
}

export type UseLatestSessionResult = {
  title: string | null
  loading: boolean
  error: string | null
  reload: () => void
}

// Simple in-memory cache to avoid N+1 refetches across mounts
const cache = new Map<string, { title: string | null; at: number }>()
const TTL_MS = 2 * 60 * 1000 // 2 minutes

// Flatten common Firestore-adapter shapes into a simple object (reuse shape from awfl-web useSessionsList)
function flattenDoc(d: any): any {
  if (!d) return {}
  return { id: d?.id, ...(d?.data || {}), ...(d?.data?.value || {}), ...(d?.value || {}) }
}

export function useLatestSession(params: UseLatestSessionParams): UseLatestSessionResult {
  const { projectId, idToken, enabled = true } = params
  const [title, setTitle] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bump = useRef(0)

  const skipAuth = (import.meta as any)?.env?.VITE_SKIP_AUTH === '1'
  const canRun = !!projectId && (skipAuth || !!idToken) && enabled

  // Seed from cache synchronously
  useMemo(() => {
    if (projectId && cache.has(projectId)) {
      const hit = cache.get(projectId)!
      if (Date.now() - hit.at < TTL_MS) {
        setTitle(hit.title)
      } else {
        cache.delete(projectId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const reload = () => {
    bump.current++
  }

  useEffect(() => {
    let cancelled = false
    const ac = new AbortController()

    async function load() {
      setError(null)
      if (!canRun) return

      // Cache check (fresh only)
      if (projectId && cache.has(projectId)) {
        const hit = cache.get(projectId)!
        if (Date.now() - hit.at < TTL_MS) {
          setTitle(hit.title)
          return
        } else {
          cache.delete(projectId)
        }
      }

      setLoading(true)
      try {
        const client = makeApiClient({ idToken: idToken ?? undefined, skipAuth })

        // Use numeric epoch-second bounds and numeric comparisons, aligned with awfl-web useSessionsList
        const body: any = {
          collection: 'convo.sessions',
          field: 'update_time',
          order: 'desc',
          limit: 1,
          start: 0,
          end: 4102444800,
          fieldType: 'number',
        }

        const json: any = await client.listSessions(body, {
          signal: ac.signal,
          // Override x-project-id for the specific class/project when provided
          extraHeaders: projectId ? { 'x-project-id': projectId } : undefined,
        })

        // Accept multiple shapes from backend (reuse pattern from awfl-web useSessionsList)
        let rawDocs: any[] = []
        if (Array.isArray(json?.documents)) rawDocs = json.documents
        else if (Array.isArray(json?.items)) rawDocs = json.items
        else if (Array.isArray(json?.docs)) rawDocs = json.docs
        else if (Array.isArray(json)) rawDocs = json

        const flat = rawDocs.map(flattenDoc)
        const first = flat[0] || null

        // Reuse awfl-web mapping to Session to avoid diverging logic
        const session = first ? mapTopicInfoToSession(first) : null
        const t = session?.title ?? null

        if (!cancelled) {
          setTitle(t)
          if (projectId) cache.set(projectId, { title: t, at: Date.now() })
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
      ac.abort()
    }
  }, [projectId, idToken, skipAuth, canRun, bump.current])

  return { title, loading, error, reload }
}
