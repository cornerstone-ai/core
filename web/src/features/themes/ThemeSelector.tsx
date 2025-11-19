import React from 'react'
import { THEME_NAMES, THEME_STICKER, useTheme, type ThemeName } from './ThemeProvider'

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = React.useState(false)

  const onSelect = (t: ThemeName) => {
    setTheme(t)
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change theme"
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 10px', borderRadius: 10,
          background: 'var(--panel)', border: '1px solid var(--subtle)', cursor: 'pointer'
        }}
      >
        <span aria-hidden>✦✦✦</span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{THEME_STICKER[theme]} {theme}</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Select a theme"
          style={{
            position: 'absolute', right: 0, top: 'calc(100% + 6px)',
            background: '#fff', border: '1px solid var(--subtle)', borderRadius: 10,
            boxShadow: '0 6px 24px rgba(0,0,0,0.08)', padding: 8, minWidth: 220, zIndex: 1000,
          }}
        >
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {THEME_NAMES.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={t === theme}
                  onClick={() => onSelect(t)}
                  style={{
                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 8, border: '1px solid transparent', background: 'transparent', cursor: 'pointer'
                  }}
                >
                  <span aria-hidden>{THEME_STICKER[t]}</span>
                  <span style={{ textTransform: 'capitalize' }}>{t}</span>
                  {t === theme && <span aria-hidden style={{ marginLeft: 'auto' }}>✓</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ThemeSelector
