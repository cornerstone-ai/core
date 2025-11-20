import React from 'react'
import { toAssignmentStatus, type AssignmentStatus } from '../public'

export type AssignmentTileProps = {
  item: any
  onOpen?: () => void
}

function StatusBadge({ status }: { status: AssignmentStatus | null }) {
  const s = status || 'Assigned'
  const { bg, fg } = (() => {
    switch (s) {
      case 'Assigned':
        return { bg: '#eef2ff', fg: '#3730a3' } // indigo
      case 'In Progress':
        return { bg: '#ecfeff', fg: '#155e75' } // cyan
      case 'Finished':
        return { bg: '#ecfdf5', fg: '#065f46' } // green
      case 'Needs Attention':
        return { bg: '#fef2f2', fg: '#991b1b' } // red
      default:
        return { bg: '#f3f4f6', fg: '#374151' }
    }
  })()
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 999, background: bg, color: fg }}>
      {s}
    </span>
  )
}

export function AssignmentTile({ item, onOpen }: AssignmentTileProps) {
  const title: string = (item?.title || item?.name || item?.id || 'Untitled') as string
  const desc: string | null = (item?.description || item?.desc || null) as any
  const statusRaw: string | null = (item?.status || null) as any
  const status = toAssignmentStatus(statusRaw)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="card-tile tile-square"
      title={title}
      style={{ width: '100%', textAlign: 'left' }}
    >
      <div className="tile-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
        <StatusBadge status={status} />
      </div>
      {desc ? (
        <div className="tile-subtle" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {desc}
        </div>
      ) : (
        <div className="tile-subtle">—</div>
      )}
    </button>
  )
}

export default AssignmentTile
