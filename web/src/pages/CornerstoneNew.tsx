import React from 'react'
import { useNavigate } from 'react-router-dom'

export function CornerstoneNew() {
  const [file, setFile] = React.useState<File | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  const navigate = useNavigate()

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null)
    const f = e.target.files?.[0]
    if (!f) return setFile(null)
    const allowed = ['application/pdf', 'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    if (!allowed.includes(f.type)) {
      setError('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT.')
      setFile(null)
      return
    }
    const maxBytes = 20 * 1024 * 1024
    if (f.size > maxBytes) {
      setError('File too large. Max 20MB.')
      setFile(null)
      return
    }
    setFile(f)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return setError('Select a file to upload.')
    setBusy(true)
    // Stub: in future, request signed URL, upload, then register
    await new Promise((r) => setTimeout(r, 600))
    const id = `doc-${Math.random().toString(36).slice(2, 8)}`
    navigate(`/${id}`)
  }

  return (
    <form className="card" onSubmit={onSubmit} aria-labelledby="upload-heading">
      <h1 id="upload-heading" style={{ marginTop: 0 }}>New document</h1>

      <label htmlFor="file" style={{ display: 'block', marginBottom: 8 }}>Upload file</label>
      <input id="file" type="file" onChange={onFileChange} accept=".pdf,.doc,.docx,.txt" />

      {file && <div style={{ marginTop: 8, color: 'var(--muted)' }}>{file.name} — {(file.size/1024/1024).toFixed(2)} MB</div>}
      {error && <div role="alert" style={{ color: '#b91c1c', marginTop: 8 }}>{error}</div>}

      <div className="row" style={{ marginTop: 16, gap: 8 }}>
        <button type="submit" disabled={!file || busy} style={{ padding: '8px 12px', borderRadius: 8, border: 0, background: 'var(--accent)', color: '#fff' }}>
          {busy ? 'Uploading…' : 'Upload'}
        </button>
        <button type="button" onClick={() => setFile(null)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--subtle)', background: '#fff' }}>Clear</button>
      </div>
    </form>
  )
}

export default CornerstoneNew
