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
  const { loading, error, data } = useClassFiles({ classId: effectiveClassId, idToken, path: '.', enabled })

  if (!effectiveClassId) {
    return (
      <div style={{ padding: 16 }}>
        <h2 style={{ margin: '8px 0' }}>Documents</h2>
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
      <div style={{ padding: 16 }}>
        <h2 style={{ margin: '8px 0' }}>Documents</h2>
        <div style={{ color: '#6b7280' }}>Loading…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <h2 style={{ margin: '8px 0' }}>Documents</h2>
        <div role="alert" style={{ color: '#b91c1c' }}>Failed to load: {error}</div>
      </div>
    )
  }

  const items = (data as any)?.entries || []

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: '8px 0' }}>Documents</h2>
      <DocumentsGrid items={items} />
    </div>
  )
}

export default DocumentsPage
