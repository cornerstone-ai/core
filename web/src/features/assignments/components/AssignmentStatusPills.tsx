import React from 'react'
import type { AssignmentStatus } from '../public'

export type AssignmentCounts = {
  assigned: number
  inProgress: number
  finished: number
  needsAttention: number
}

type Props = {
  counts?: AssignmentCounts | null
  active: AssignmentStatus | null
  onSelect: (s: AssignmentStatus | null) => void
  loading?: boolean
  style?: React.CSSProperties
}

const pillStyleBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 8px',
  borderRadius: 999,
  border: '1px solid #e5e7eb',
  background: 'white',
  color: '#111827',
  fontSize: 12,
  cursor: 'pointer',
}

const activeStyle: React.CSSProperties = {
  background: '#f0f9ff',
  borderColor: '#7dd3fc',
}

function Pill({
  label,
  count,
  active,
  onClick,
  color,
}: {
  label: string
  count: number
  active?: boolean
  onClick: () => void
  color: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active || undefined}
      style={{
        ...pillStyleBase,
        ...(active ? activeStyle : null),
        borderColor: active ? activeStyle.borderColor : '#e5e7eb',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color, display: 'inline-block' }} />
      <span>{label}</span>
      <span
        style={{
          minWidth: 18,
          textAlign: 'center',
          padding: '0 6px',
          borderRadius: 999,
          background: active ? '#ffffff' : '#f3f4f6',
          color: '#111827',
          border: '1px solid #e5e7eb',
        }}
      >
        {count}
      </span>
    </button>
  )
}

export function AssignmentStatusPills({ counts, active, onSelect, loading, style }: Props) {
  const c = counts || { assigned: 0, inProgress: 0, finished: 0, needsAttention: 0 }

  const handle = (label: AssignmentStatus) => () => {
    if (active === label) onSelect(null)
    else onSelect(label)
  }

  return (
    <div className="assignment-status-pills" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', ...(style || {}) }}>
      <Pill label="Assigned" count={c.assigned} active={active === 'Assigned'} onClick={handle('Assigned')} color="#93c5fd" />
      <Pill label="In Progress" count={c.inProgress} active={active === 'In Progress'} onClick={handle('In Progress')} color="#86efac" />
      <Pill label="Finished" count={c.finished} active={active === 'Finished'} onClick={handle('Finished')} color="#facc15" />
      <Pill label="Needs Attention" count={c.needsAttention} active={active === 'Needs Attention'} onClick={handle('Needs Attention')} color="#fda4af" />
      {loading ? (
        <span style={{ fontSize: 12, color: '#6b7280' }}>Loading…</span>
      ) : null}
    </div>
  )
}
