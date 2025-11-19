import React from 'react'

export const THEME_NAMES = [
  'pink',
  'blue',
  'green',
  'orange',
  'yellow',
  'purple',
  'grey',
  'red',
] as const

export type ThemeName = typeof THEME_NAMES[number]

export const THEME_ACCENTS: Record<ThemeName, string> = {
  pink: '#ff7aa5',
  blue: '#5aa7ff',
  green: '#62c370',
  orange: '#ffa24d',
  yellow: '#ffd166',
  purple: '#b084ff',
  grey: '#9aa3ad',
  red: '#ff6b6b',
}

export const THEME_STICKER: Record<ThemeName, string> = {
  pink: '🍓',
  blue: '🐳',
  green: '🍀',
  orange: '🍊',
  yellow: '⭐',
  purple: '🍇',
  grey: '🐧',
  red: '🍎',
}

const ACCENT_DARK: Record<ThemeName, string> = {
  pink: '#e24f84',
  blue: '#3d86dd',
  green: '#3fa857',
  orange: '#e8872f',
  yellow: '#e0b84f',
  purple: '#8e6ae0',
  grey: '#7f8995',
  red: '#e05151',
}

const STORAGE_KEY = 'cornerstone-theme'

export type ThemeContextValue = {
  theme: ThemeName
  setTheme: (t: ThemeName) => void
}

const ThemeCtx = React.createContext<ThemeContextValue | null>(null)

function applyCssVars(theme: ThemeName) {
  const root = document.documentElement
  const accent = THEME_ACCENTS[theme]
  const dark = ACCENT_DARK[theme]
  root.style.setProperty('--accent', accent)
  root.style.setProperty('--accent-dark', dark)
  root.style.setProperty('--panel', '#ffffff')
  root.style.setProperty('--subtle', 'rgba(0,0,0,0.12)')
  root.style.setProperty('--muted', 'rgba(0,0,0,0.55)')
}

function getInitialTheme(): ThemeName {
  if (typeof window === 'undefined') return 'pink'
  const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeName | null
  if (saved && (THEME_NAMES as readonly string[]).includes(saved)) return saved as ThemeName
  return 'pink'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<ThemeName>(() => getInitialTheme())

  React.useEffect(() => {
    try {
      applyCssVars(theme)
      window.localStorage.setItem(STORAGE_KEY, theme)
      // Important: set on :root so CSS selectors like :root[data-theme='pink'] take effect
      document.documentElement.setAttribute('data-theme', theme)
    } catch {}
  }, [theme])

  const value = React.useMemo(() => ({ theme, setTheme }), [theme])

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
