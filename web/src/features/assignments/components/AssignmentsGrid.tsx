import React from 'react'
import { AssignmentTile } from './AssignmentTile'

export function AssignmentsGrid({
  items,
  loading,
  emptyHint = 'No assignments',
  onOpen,
}: {
  items: any[]
  loading?: boolean
  emptyHint?: string
  onOpen?: (t: any) => void
}) {
  return (
    <ul className="grid-cards" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((t) => (
        <li key={t.id}>
          <AssignmentTile item={t} onOpen={() => onOpen?.(t)} />
        </li>
      ))}
      {loading && (
        <li>
          <div className="card">Loading assignments…</div>
        </li>
      )}
      {!loading && items.length === 0 && (
        <li>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{emptyHint}</div>
            <div className="tile-subtle">Select a status above or add a new assignment.</div>
          </div>
        </li>
      )}
    </ul>
  )
}

export default AssignmentsGrid
