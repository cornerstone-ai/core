import React from 'react'
import { useParams, Link } from 'react-router-dom'

export function CornerstoneDetail() {
  const { docId } = useParams()

  const [status] = React.useState([
    { step: 'Uploaded', at: 'just now' },
    { step: 'Registered', at: 'just now' },
    { step: 'Generating', at: '…' },
  ])

  const artifacts = [
    { id: 'v1', type: 'video/mp4', label: 'Video (mp4)' },
    { id: 'a1', type: 'audio/mp3', label: 'Audio (mp3)' },
    { id: 't1', type: 'text/vtt', label: 'Subtitles (vtt)' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
      <section className="card" aria-labelledby="preview-heading">
        <h2 id="preview-heading" style={{ marginTop: 0 }}>Preview</h2>
        <div style={{
          height: 300,
          background: '#000',
          borderRadius: 8,
          display: 'grid', placeItems: 'center', color: '#fff',
          marginBottom: 12,
        }}>
          Video preview placeholder for {docId}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--subtle)' }}
            onClick={() => alert('Re-generate requested (stub)')}
          >Regenerate</button>
          <button style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--subtle)' }}
            onClick={() => alert('Publish requested (stub)')}
          >Publish</button>
        </div>
      </section>

      <aside className="card" aria-labelledby="details-heading">
        <h2 id="details-heading" style={{ marginTop: 0 }}>Details</h2>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#666' }}>Document ID</div>
          <div style={{ fontWeight: 600 }}>{docId}</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Status timeline</div>
          <ol style={{ margin: 0, paddingLeft: 16 }}>
            {status.map((s, i) => (
              <li key={i}>{s.step} — {s.at}</li>
            ))}
          </ol>
        </div>

        <div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Artifacts</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {artifacts.map((a) => (
              <li key={a.id}>
                <Link className="link" to="#" onClick={(e) => e.preventDefault()}>{a.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}

export default CornerstoneDetail
