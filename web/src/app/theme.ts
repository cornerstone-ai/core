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

export const THEME_NAMES: ThemeName[] = [
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

const ThemeCtx = React.createContext<{ theme: ThemeName; setTheme: (t: ThemeName) => void } | null>(null)

const STORAGE_KEY = 'cornerstone.theme'

export function ThemeProvider(props: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeName>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null
      if (saved && THEME_NAMES.includes(saved)) return saved
    } catch {}
    return 'pink'
  })

  const setTheme = React.useCallback((t: ThemeName) => {
    setThemeState(t)
    try { localStorage.setItem(STORAGE_KEY, t) } catch {}
  }, [])

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return React.createElement(ThemeCtx.Provider, { value }, props.children)
}

export function useTheme() {
  const ctx = React.useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  const labelStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 8 }
  const starStyle: React.CSSProperties = { display: 'inline-flex', gap: 2, color: THEME_ACCENTS[theme] }
  const selectStyle: React.CSSProperties = {
    borderRadius: 8,
    border: '1px solid var(--subtle)',
    padding: '6px 8px',
    background: '#fff',
  }

  return React.createElement(
    'label',
    { style: labelStyle },
    React.createElement(
      'span',
      { 'aria-hidden': true as unknown as boolean, style: starStyle },
      '✦', '✦', '✦'
    ),
    React.createElement('span', { className: 'sr-only' }, 'Theme'),
    React.createElement(
      'select',
      {
        'aria-label': 'Theme',
        value: theme,
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setTheme(e.target.value as ThemeName),
        style: selectStyle,
      },
      THEME_NAMES.map((name) => React.createElement('option', { key: name, value: name }, name))
    )
  )
}
