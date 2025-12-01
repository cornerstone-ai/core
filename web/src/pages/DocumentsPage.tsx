import React, { useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../features/auth/public'
import { getSelectedClassId } from '../features/classes/public'
import { useClassFiles, DocumentsGrid } from '../features/documents/public'

export function DocumentsPage() {
  const params = useParams()
  const navigate = useNavigate()
  const loc = useLocation()
  const routeClassId = params.classId

  const { idToken, loading: authLoading } = useAuth()

  // Prefer route classId when present; otherwise fall back to selected class.
  const effectiveClassId = useMemo(() => {
    return routeClassId || getSelectedClassId() || null
  }, [routeClassId])

  // If we are on the generic /documents path and have a selected class, normalize URL.
  useEffect(() => {
    if (!routeClassId) {
      const cid = getSelectedClassId()
      if (cid) {
        navigate(`/classes/${encodeURIComponent(cid)}/documents`, { replace: true })
      }
    }
    // We intentionally exclude navigate from deps to avoid unwanted re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.pathname, routeClassId])

  const enabled = !!effectiveClassId && !!idToken
  const { loading, error, data, reload } = useClassFiles({ classId: effectiveClassId, idToken, path: '.', enabled })

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

  return (
    <div className="page-scroll">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Documents</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={reload} className="btn btn-secondary" style={{ padding: '8px 12px' }}>Refresh</button>
        </div>
      </div>
      <DocumentsGrid items={items} />
    </div>
  )
}

export default DocumentsPage
