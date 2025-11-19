import React, { useState } from 'react'
import { useClassesList, NewClassModal, setSelectedClassId, useLatestSession } from '../features/classes/public'
import { useAuth } from '../features/auth/public'
import { useNavigate } from 'react-router-dom'

function ClassTile({ c, onSelect, idToken }: { c: any; onSelect: (id: string) => void; idToken?: string | null }) {
  const { title, loading, error } = useLatestSession({ projectId: c.id, idToken, enabled: true })

  let subtitle: string = c.id
  if (loading) subtitle = 'Loading…'
  else if (error) subtitle = c.id
  else if (title) subtitle = title
  else subtitle = 'No lessons yet'

  return (
    <button
      type="button"
      className="card-tile"
      onClick={() => onSelect(c.id)}
      style={{ width: '100%', textAlign: 'left', minHeight: 130 }}
      title={c.name || c.remote || c.id}
    >
      <div className="tile-title" style={{ marginBottom: 4 }}>
        {c.name || c.remote || c.id}
      </div>
      <div className="tile-subtle">{subtitle}</div>
    </button>
  )
}

export function ClassesPage() {
  const navigate = useNavigate()
  const { idToken } = useAuth()
  const { projects: classes, loading, error, reload } = useClassesList({ idToken, enabled: true })
  const [newOpen, setNewOpen] = useState(false)

  function handleSelect(id: string) {
    setSelectedClassId(id)
    navigate(`/classes/${encodeURIComponent(id)}/lessons`)
  }

  return (
    <div className="page-scroll">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Classes</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={reload} className="btn btn-secondary" style={{ padding: '8px 12px' }}>Refresh</button>
        </div>
      </div>

      {loading && <div style={{ color: '#6b7280', marginBottom: 12 }}>Loading…</div>}
      {error && (
        <div role="alert" style={{ color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 8, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* Always use the grid layout, even when empty */}
      <ul className="grid-cards" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {/* Existing classes */}
        {!loading && classes.map((c) => (
          <li key={c.id}>
            <ClassTile c={c} onSelect={handleSelect} idToken={idToken} />
          </li>
        ))}

        {/* + New Class tile should be last in the grid */}
        <li>
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="card-tile tile-new tile-square"
            aria-label="Create new class"
            style={{ width: '100%' }}
          >
            <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 8 }}>＋</div>
            <div style={{ fontWeight: 700 }}>New Class</div>
            <div className="tile-subtle">Create a new class</div>
          </button>
        </li>
      </ul>

      {/* New Class modal (customized) */}
      <NewClassModal
        idToken={idToken}
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={(proj) => {
          setSelectedClassId(proj.id)
          reload()
          navigate(`/classes/${encodeURIComponent(proj.id)}/lessons`)
        }}
      />
    </div>
  )
}

export default ClassesPage
