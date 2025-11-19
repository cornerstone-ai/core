import React from 'react'
import { useTheme } from './theme'
import { MusicEngine } from './music'

export function MusicToggle() {
  const { theme } = useTheme()
  const [open, setOpen] = React.useState(false)
  const [enabled, setEnabled] = React.useState(false)
  const [volume, setVolume] = React.useState(0.25)
  const engineRef = React.useRef<MusicEngine | null>(null)
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
    const handler = () => {
      if (enabled) engineRef.current?.start()
    }
    window.addEventListener('pointerdown', handler, { passive: true })
    return () => window.removeEventListener('pointerdown', handler)
  }, [enabled])

  React.useEffect(() => () => engineRef.current?.dispose(), [])

  const onToggle = () => {
    if (!supported) return
    ensureEngine()
    setEnabled(v => !v)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <button
        type="button"
        aria-label={enabled ? 'Mute background music' : 'Play background music'}
        onClick={onToggle}
        className="music-toggle"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, cursor: supported ? 'pointer' : 'not-allowed',
          background: 'var(--accent-dark)', color: '#fff', border: '1px solid var(--accent-dark)', opacity: supported ? 1 : 0.6
        }}
        disabled={!supported}
      >
        <span aria-hidden style={{ color: '#fff' }}>{enabled ? '🔊' : '🔈'}</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>music</span>
      </button>

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open music settings"
        onClick={() => setOpen(v => !v)}
        className="music-toggle"
        style={{ padding: '6px 8px', cursor: 'pointer' }}
      >
        ⚙️
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
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Cute chiptune loop</span>
            <button
              type="button"
              onClick={onToggle}
              className={enabled ? 'btn-secondary' : 'btn-primary'}
              style={{ padding: '6px 10px' }}
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
