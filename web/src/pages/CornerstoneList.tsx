import React from 'react'
import { Link } from 'react-router-dom'

const mockDocs = [
  { id: 'doc-123', title: 'Sample PDF', status: 'Done', updated: 'just now' },
  { id: 'doc-456', title: 'Syllabus.docx', status: 'In Progress', updated: '2m ago' },
]

export function CornerstoneList() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Documents</h1>
        <Link className="link" to="/new">New</Link>
      </div>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
              <th style={{ padding: '8px 0' }}>Title</th>
              <th>Status</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mockDocs.map((d) => (
              <tr key={d.id} style={{ borderTop: '1px solid var(--subtle)' }}>
                <td style={{ padding: '10px 0' }}>{d.title}</td>
                <td>{d.status}</td>
                <td>{d.updated}</td>
                <td style={{ textAlign: 'right' }}>
                  <Link className="link" to={`/${d.id}`}>Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CornerstoneList
