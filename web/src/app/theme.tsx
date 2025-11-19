import React from 'react'

export type ThemeName =
  | 'pink'
  | 'blue'
  | 'green'
  | 'orange'
  | 'yellow'
  | 'purple'
  | 'grey'
  | 'red'

const THEME_NAMES: ThemeName[] = [
  'pink',
  'blue',
  'green',
  'orange',
  'yellow',
  'purple',
  'grey',
  'red',
]

const THEME_ACCENTS: Record<ThemeName, string> = {
  pink: '#ec4899',
  blue: '#3b82f6',
  green: '#22c55e',
  orange: '#f97316',
  yellow: '#eab308',
  purple: '#a855f7',
  grey: '#64748b',
  red: '#ef4444',
}

const THEME_STICKER: Record<ThemeName, string> = {
  pink: '🍓',
  blue: '🐳',
  green: '🍀',
  orange: '🍊',
  yellow: '🦆',
  purple: '🍇',
  grey: '🐧',
  red: '🍎',
}

const ThemeCtx = React.createContext<{
  theme: ThemeName
  setTheme: (t: ThemeName) => void
}>({ theme: 'pink', setTheme: () => {} })

const STORAGE_KEY = 'cornerstone.theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeName>(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as ThemeName | null
    return (saved && THEME_NAMES.includes(saved)) ? saved : 'pink'
  })

  const setTheme = React.useCallback((t: ThemeName) => {
    setThemeState(t)
    try { localStorage.setItem(STORAGE_KEY, t) } catch {}
  }, [])

  React.useEffect(() => {
    // Apply to :root so CSS variables in global.css take effect
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])

  const ctx = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeCtx.Provider value={ctx}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  return React.useContext(ThemeCtx)
}

function ThreeStarIcon({ color = 'currentColor' }: { color?: string }) {
  // Simple three tiny stars icon per spec (instead of an ellipsis)
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', gap: 2, color }}>
      <span style={{ fontSize: 12, lineHeight: 1 }}>✦</span>
      <span style={{ fontSize: 10, lineHeight: 1 }}>✦</span>
      <span style={{ fontSize: 12, lineHeight: 1 }}>✦</span>
    </span>
  )
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)
  const menuRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node
      if (!open) return
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change theme"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          borderRadius: 10,
          border: '1px solid var(--subtle)',
          background: '#fff',
          cursor: 'pointer',
          transition: 'transform 140ms ease',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
      >
        <ThreeStarIcon color={THEME_ACCENTS[theme]} />
        <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'capitalize' }}>{theme}</span>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Themes"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: 6,
            background: '#fff',
            border: '1px solid var(--subtle)',
            borderRadius: 10,
            boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
            padding: 6,
            minWidth: 200,
            zIndex: 1000,
          }}
        >
          {THEME_NAMES.map((name) => (
            <button
              key={name}
              role="menuitemradio"
              aria-checked={theme === name}
              onClick={() => { setTheme(name); setOpen(false) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                textAlign: 'left' as const,
                background: theme === name ? 'rgba(0,0,0,0.04)' : '#fff',
                border: 0,
                padding: '8px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'background 140ms ease, transform 140ms ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(2px)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(0)' }}
            >
              <span
                aria-hidden
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: THEME_ACCENTS[name],
                  border: '1px solid var(--subtle)',
                }}
              />
              <span aria-hidden style={{ fontSize: 14 }}>{THEME_STICKER[name]}</span>
              <span style={{ textTransform: 'capitalize' }}>{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ThemeProvider
