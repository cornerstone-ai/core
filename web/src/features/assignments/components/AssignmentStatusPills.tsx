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
  icon,
  ariaLabel,
  count,
  active,
  onClick,
}: {
  icon: string
  ariaLabel: string
  count: number
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active || undefined}
      aria-label={ariaLabel}
      title={ariaLabel}
      style={{
        ...pillStyleBase,
        ...(active ? activeStyle : null),
        borderColor: active ? activeStyle.borderColor : '#e5e7eb',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
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
      <Pill icon="📌" ariaLabel="Assigned" count={c.assigned} active={active === 'Assigned'} onClick={handle('Assigned')} />
      <Pill icon="⏳" ariaLabel="In Progress" count={c.inProgress} active={active === 'In Progress'} onClick={handle('In Progress')} />
      <Pill icon="✅" ariaLabel="Finished" count={c.finished} active={active === 'Finished'} onClick={handle('Finished')} />
      <Pill icon="⚠️" ariaLabel="Needs Attention" count={c.needsAttention} active={active === 'Needs Attention'} onClick={handle('Needs Attention')} />
    </div>
  )
}
