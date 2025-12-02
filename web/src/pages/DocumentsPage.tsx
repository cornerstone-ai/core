import React, { useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../features/auth/public'
import { getSelectedClassId } from '../features/classes/public'
import { useClassFiles, DocumentsGrid } from '../features/documents/public'

export function DocumentsPage() {
  const params = useParams()
  const navigate = useNavigate()
  const loc = useLocation()
  const routeClassId = params.classId as string | undefined
  const splat = (params['*'] as string | undefined) || ''

  const { idToken, loading: authLoading } = useAuth()

  // Prefer route classId when present; otherwise fall back to selected class.
  const effectiveClassId = useMemo(() => {
    return routeClassId || getSelectedClassId() || null
  }, [routeClassId])

  // Derive current directory path from the URL splat (default to root '.')
  const currentPath = useMemo(() => {
    const raw = splat || ''
    if (!raw) return '.'
    // Keep slashes; decode to get original names back
    return decodeURI(raw)
  }, [splat])

  // If we are on the generic /documents route (no classId) and have a selected class, normalize URL.
  // Preserve any folder path carried in the splat.
  useEffect(() => {
    if (!routeClassId) {
      const cid = getSelectedClassId()
      if (cid) {
        const sub = splat ? `/${splat}` : ''
        navigate(`/classes/${encodeURIComponent(cid)}/documents${sub}`, { replace: true })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.pathname, routeClassId, splat])

  const enabled = !!effectiveClassId && !!idToken
  const { loading, error, data, reload } = useClassFiles({ classId: effectiveClassId, idToken, path: currentPath, enabled })

  const docsBase = (cid: string | null) => (cid ? `/classes/${encodeURIComponent(cid)}/documents` : `/documents`)

  const navigateToPath = (p: string) => {
    const pretty = p === '.' ? '' : `/${encodeURI(p.startsWith('/') ? p.slice(1) : p)}`
    navigate(`${docsBase(effectiveClassId)}${pretty}`)
  }

  if (!effectiveClassId) {
    return (
      <div className="page-scroll">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Documents</h1>
        </div>
        <p style={{ color: '#6b7280' }}>Select a class to view its documents.</p>
        <div style={{ marginTop: 8 }}>
          <Link to="/classes" style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, textDecoration: 'none', background: 'white', color: 'inherit' }}>
            Manage classes
          </Link>
        </div>
      </div>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="page-scroll">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Documents</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button disabled className="btn btn-secondary" style={{ padding: '8px 12px' }}>Refresh</button>
          </div>
        </div>
        <div style={{ color: '#6b7280' }}>Loading…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-scroll">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Documents</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={reload} className="btn btn-secondary" style={{ padding: '8px 12px' }}>Refresh</button>
          </div>
        </div>
        <div role="alert" style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 8, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      </div>
    )
  }

  // useFsList returns FsListResult { path, items }
  const items = (data as any)?.items || []

  const openItem = (p: string) => {
    const entry = items.find((i: any) => i.path === p)
    if (entry?.type === 'dir') {
      navigateToPath(p)
      return
    }

    // Open files in a new tab via the pretty open route
    const prettyPath = encodeURI(p.startsWith('/') ? p.slice(1) : p)
    const base = effectiveClassId
      ? `/classes/${encodeURIComponent(effectiveClassId)}/documents/open/`
      : `/documents/open/`
    window.open(`${base}${prettyPath}`, '_blank', 'noopener,noreferrer')
  }

  const canGoUp = currentPath && currentPath !== '.'
  const goUp = () => {
    if (!canGoUp) return
    const parts = currentPath.split('/').filter(Boolean)
    parts.pop()
    const parent = parts.length === 0 ? '.' : parts.join('/')
    navigateToPath(parent)
  }

  return (
    <div className="page-scroll">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Documents</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: '#6b7280' }} title={currentPath}>
            Path: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 6 }}>{currentPath}</code>
          </div>
          <button onClick={reload} className="btn btn-secondary" style={{ padding: '8px 12px' }}>Refresh</button>
          <button onClick={goUp} disabled={!canGoUp} className="btn btn-secondary" style={{ padding: '8px 12px' }}>Up</button>
        </div>
      </div>
      <DocumentsGrid items={items} onOpen={openItem} />
    </div>
  )
}

export default DocumentsPage
