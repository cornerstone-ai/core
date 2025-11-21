import React from 'react'
import type { FsEntry } from '@awfl-web/features/filesystem/types'

export type DocumentsGridProps = {
  items: FsEntry[]
  onOpen?: (path: string) => void
  emptyText?: string
  style?: React.CSSProperties
}

function iconFor(entry: FsEntry): string {
  switch (entry.type) {
    case 'dir':
      return '📁'
    case 'symlink':
      return '🔗'
    case 'file':
      return entry.executable ? '⚙️' : '📄'
    default:
      return '…'
  }
}

export function DocumentsGrid({ items, onOpen, emptyText = 'No files found', style }: DocumentsGridProps) {
  const open = (e: React.MouseEvent, path: string) => {
    e.preventDefault()
    onOpen?.(path)
  }

  if (!items || items.length === 0) {
    return (
      <div style={{ fontSize: 13, color: '#6b7280', padding: 8, ...style }}>
        {emptyText}
      </div>
    )
  }

  return (
    <div
      role="list"
      className="documents-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 12,
        alignItems: 'stretch',
        ...style,
      }}
    >
      {items.map((it) => (
        <a
          key={it.path}
          role="listitem"
          href="#"
          onClick={(e) => open(e, it.path)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: 10,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            background: 'white',
            textDecoration: 'none',
            color: 'inherit',
            minHeight: 88,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span aria-hidden style={{ fontSize: 18 }}>{iconFor(it)}</span>
            <strong style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              title={it.name}
            >
              {it.name}
            </strong>
          </div>
          <div style={{ display: 'flex', gap: 8, color: '#6b7280', fontSize: 12 }}>
            <span title="Size">—</span>
            <span title="Modified">—</span>
          </div>
          <div style={{ color: '#9ca3af', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis' }}
            title={it.path}
          >
            {it.path}
          </div>
        </a>
      ))}
    </div>
  )
}

export default DocumentsGrid
