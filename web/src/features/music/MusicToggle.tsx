import React from 'react'
import { useTheme } from '../themes/public'
import { MusicEngine } from './MusicEngine'

export function MusicToggle() {
  const { theme } = useTheme()
  const [open, setOpen] = React.useState(false)
  const [enabled, setEnabled] = React.useState(false)
  const [volume, setVolume] = React.useState(0.25)
  const engineRef = React.useRef<MusicEngine | null>(null)
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const supported = typeof window !== 'undefined' && ((window as any).AudioContext || (window as any).webkitAudioContext)

  // Init engine lazily on first interaction
  const ensureEngine = React.useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new MusicEngine({ volume, bpm: 120, theme })
    }
    return engineRef.current
  }, [theme, volume])

  // Respond to state changes
  React.useEffect(() => {
    const eng = engineRef.current
    if (!eng) return
    eng.setVolume(volume)
  }, [volume])

  React.useEffect(() => {
    const eng = engineRef.current
    if (!eng) return
    eng.setTheme(theme)
  }, [theme])

  React.useEffect(() => {
    const eng = engineRef.current
    if (!eng) return
    if (enabled) {
      eng.start()
    } else {
      eng.stop()
    }
  }, [enabled])

  // Safety: attempt resume on user gesture if enabled (covers iOS autoplay quirks)
  React.useEffect(() => {
    const handler = () => { if (enabled) engineRef.current?.start() }
    window.addEventListener('pointerdown', handler, { passive: true })
    return () => window.removeEventListener('pointerdown', handler)
  }, [enabled])

  // Close popover on outside click
  React.useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!open) return
      const t = e.target as Node
      if (rootRef.current && !rootRef.current.contains(t)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open])

  React.useEffect(() => () => engineRef.current?.dispose(), [])

  const onMainClick = () => {
    // Per spec: clicking the music button opens the settings; no separate gear button
    if (!supported) return
    ensureEngine()
    setOpen(v => !v)
  }

  const onTogglePlay = () => {
    if (!supported) return
    ensureEngine()
    setEnabled(v => !v)
  }

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={open ? 'Close music controls' : 'Open music controls'}
        onClick={onMainClick}
        className="music-toggle"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          cursor: supported ? 'pointer' : 'not-allowed',
          background: 'var(--accent-dark)', color: '#fff', border: '1px solid var(--accent-dark)', opacity: supported ? 1 : 0.6,
          borderRadius: 10, padding: '6px 10px'
        }}
        disabled={!supported}
      >
        <span aria-hidden style={{ color: '#fff' }}>{enabled ? '🔊' : '🔈'}</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>music</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Music controls"
          style={{
            position: 'absolute', right: 0, top: 'calc(100% + 6px)',
            background: '#fff', border: '1px solid var(--subtle)', borderRadius: 10,
            boxShadow: '0 6px 24px rgba(0,0,0,0.08)', padding: 10, minWidth: 220, zIndex: 1000,
          }}
        >
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Cute video game music</span>
            <button
              type="button"
              onClick={onTogglePlay}
              className={enabled ? 'btn-secondary' : 'btn-primary'}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--subtle)', background: enabled ? 'var(--panel)' : undefined, cursor: 'pointer' }}
              disabled={!supported}
            >
              {enabled ? 'Mute' : 'Play'}
            </button>
          </div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Volume</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat((e.target as HTMLInputElement).value))}
            aria-label="Music volume"
            style={{ width: '100%' }}
          />
          {!supported && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
              WebAudio not supported in this browser.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MusicToggle
