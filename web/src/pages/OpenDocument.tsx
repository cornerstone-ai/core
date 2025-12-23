import React from 'react'
import { useParams } from 'react-router-dom'
import { useToolExec } from '@awfl/web/features/tools/useToolExec'
import { decodeEncodedResult } from '@awfl/web/features/filesystem/parse'
import { useAuth } from '../features/auth/public'

function inferMime(path: string): string {
  const ext = (path.split('.').pop() || '').toLowerCase()
  switch (ext) {
    case 'pdf': return 'application/pdf'
    case 'png': return 'image/png'
    case 'jpg':
    case 'jpeg': return 'image/jpeg'
    case 'gif': return 'image/gif'
    case 'mp4': return 'video/mp4'
    case 'md': return 'text/markdown; charset=utf-8'
    case 'html': return 'text/html; charset=utf-8'
    case 'json': return 'application/json; charset=utf-8'
    case 'csv': return 'text/csv; charset=utf-8'
    case 'txt':
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
    case 'css':
    default:
      return 'text/plain; charset=utf-8'
  }
}

function base64ToBytes(b64: string): Uint8Array {
  try {
    const cleaned = b64.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')
    const bin = atob(cleaned)
    const len = bin.length
    const out = new Uint8Array(len)
    for (let i = 0; i < len; i++) out[i] = bin.charCodeAt(i)
    return out
  } catch {
    return new Uint8Array(0)
  }
}

export default function OpenDocument() {
  const { idToken, loading: authLoading } = useAuth()
  // For both routes: /documents/open/* and /classes/:classId/documents/open/*
  const params = useParams()
  const splat = (params['*'] || '').trim()
  const filePath = decodeURIComponent(splat)
  const fileName = filePath.split('/').filter(Boolean).pop() || 'download'

  const { readFile } = useToolExec({ idToken, enabled: !!idToken })

  const [state, setState] = React.useState<{
    loading: boolean
    error: string | null
    blobUrl: string | null
    mime: string | null
  }>({ loading: true, error: null, blobUrl: null, mime: null })

  React.useEffect(() => {
    let cancelled = false
    let currentUrl: string | null = null

    if (!filePath) {
      setState(s => ({ ...s, loading: false, error: 'Missing path' }))
      return
    }
    if (!idToken) return // wait for auth

    ;(async () => {
      try {
        const resp: any = await readFile(filePath, { background: false })

        // Prefer decoding the explicit encoded payload structure the tool returns:
        // { result: { encoded: "{ \"content\": \"...\" }" } }
        let text: string | null = null
        let bytes: Uint8Array | null = null

        const encoded = resp?.result?.encoded
        if (encoded && typeof encoded === 'string') {
          try {
            const inner = JSON.parse(encoded)
            if (typeof inner?.content === 'string') {
              text = inner.content
            } else if (typeof inner?.base64 === 'string') {
              bytes = base64ToBytes(inner.base64)
            } else if (typeof inner?.contentBase64 === 'string') {
              bytes = base64ToBytes(inner.contentBase64)
            } else if (typeof inner?.data === 'string') {
              const tryBytes = base64ToBytes(inner.data)
              if (tryBytes.length > 0) bytes = tryBytes
            }
          } catch {
            // Fall through to generic decoder
          }
        }

        // Fallback: use library helper that knows awfl tool result shapes
        if (!text && !bytes) {
          const { output, error } = decodeEncodedResult(resp)
          if (error) throw new Error(error)
          if (typeof output === 'string') {
            // Heuristic: try base64 decode, otherwise treat as text
            const maybe = base64ToBytes(output)
            if (maybe.length > 0) bytes = maybe
            else text = output
          } else if (output instanceof Uint8Array) {
            bytes = output
          }
        }

        if (cancelled) return
        if (!text && (!bytes || bytes.length === 0)) throw new Error('Empty result from readFile')

        const mime = inferMime(filePath)
        const blob = bytes && bytes.length > 0
          ? new Blob([bytes], { type: mime })
          : new Blob([text as string], { type: mime })
        currentUrl = URL.createObjectURL(blob)
        setState({ loading: false, error: null, blobUrl: currentUrl, mime })
      } catch (e: any) {
        if (!cancelled) setState({ loading: false, error: e?.message || String(e), blobUrl: null, mime: null })
      }
    })()

    return () => {
      cancelled = true
      if (currentUrl) URL.revokeObjectURL(currentUrl)
    }
  }, [filePath, idToken, readFile])

  if (state.error) {
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ marginTop: 0 }}>Open document</h1>
        <p style={{ color: '#dc2626' }}>Failed to open: {state.error}</p>
        <p style={{ color: '#6b7280' }}>Path: {filePath || '—'}</p>
      </div>
    )
  }

  const loadingMsg = !filePath
    ? 'Missing path'
    : authLoading || !idToken
    ? 'Authorizing…'
    : 'Loading file…'

  if (state.loading || !state.blobUrl) {
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ marginTop: 0 }}>Open document</h1>
        <p style={{ color: '#6b7280' }}>{loadingMsg}</p>
        <p style={{ color: '#6b7280' }}>Path: {filePath || '—'}</p>
      </div>
    )
  }

  // Render the raw content in an iframe so the address bar stays on the pretty path
  // and the browser decides whether to display or trigger a download based on MIME.
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff' }}>
      <iframe
        title={fileName}
        src={state.blobUrl}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
      />
      {/* Fallback download control (hidden visually) */}
      <a href={state.blobUrl} download={fileName} style={{ position: 'absolute', left: -99999 }} aria-hidden>
        Download
      </a>
    </div>
  )
}
