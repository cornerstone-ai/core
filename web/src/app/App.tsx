import React, { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { CornerstoneList } from '../pages/CornerstoneList'
import { CornerstoneNew } from '../pages/CornerstoneNew'
import { CornerstoneDetail } from '../pages/CornerstoneDetail'
import { ThemeProvider, ThemeSelector, Motifs } from '../features/themes/public'
import { MusicToggle } from '../features/music/public'
import { ClassSelector } from '../features/classes/ClassSelector'
import { ClassesPage } from '../pages/Classes'
import { ClassLessonsPage } from '../pages/ClassLessons'
import { useAuth } from '../features/auth/public'

function HeaderBar() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

  const { user, loading, signIn, signOut } = useAuth()

  useEffect(() => {
    if (!mobileOpen) return
    const prev = (document.activeElement as HTMLElement | null) || null
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    setTimeout(() => closeBtnRef.current?.focus(), 0)
    return () => {
      document.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [mobileOpen])

  const onManageClasses = () => {
    navigate('/classes')
    setMobileOpen(false)
  }

  return (
    <header className="header" role="banner" style={{ borderBottom: '1px solid #e5e7eb' }}>
      <div className="header-inner" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
        {/* Brand */}
        <div className="brand" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 700 }}>Cornerstone</Link>
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="app-hamburger"
          aria-label="Open menu"
          aria-controls="cs-mobile-menu"
          aria-expanded={mobileOpen || undefined}
          onClick={() => setMobileOpen(true)}
          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}
        >
          ☰
        </button>

        {/* Left nav */}
        <nav className="nav app-nav-left" aria-label="Primary" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link className="button-link" to="/" style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>Documents</Link>
          <Link className="button-link" to="/new" style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>New</Link>
          <Link className="button-link" to="/classes" style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>Classes</Link>

          {/* Class selector reusing awfl-web projects list */}
          <ClassSelector includeManageOption onManage={onManageClasses} hideLabel />
        </nav>

        {/* Right-side tools */}
        <div className="tools" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <MusicToggle />
          <ThemeSelector />
          {loading ? (
            <span style={{ fontSize: 12, color: '#6b7280' }}>Auth…</span>
          ) : user ? (
            <>
              <span style={{ fontSize: 12, color: '#374151' }}>
                {user.displayName || user.email || 'Signed in'}
              </span>
              <button
                onClick={signOut}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={signIn}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>

      {/* Mobile drawer menu */}
      {mobileOpen && (
        <>
          <div
            className="drawer-overlay"
            onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 40 }}
          />
          <div
            className="drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            id="cs-mobile-menu"
            style={{ position: 'fixed', inset: '0 0 0 auto', width: '84%', maxWidth: 360, background: 'white', zIndex: 50, display: 'flex', flexDirection: 'column', height: '100dvh' }}
          >
            <div className="drawer-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
              <strong>Menu</strong>
              <button ref={closeBtnRef} onClick={() => setMobileOpen(false)} aria-label="Close menu" style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>
                ✕
              </button>
            </div>
            <div className="drawer-body" style={{ display: 'grid', gap: 8, padding: 12 }}>
              <Link to="/" onClick={() => setMobileOpen(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>Documents</Link>
              <Link to="/new" onClick={() => setMobileOpen(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>New</Link>
              <Link to="/classes" onClick={() => setMobileOpen(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>Classes</Link>

              <div>
                <ClassSelector label="Class" includeManageOption onManage={onManageClasses} style={{ marginTop: 8 }} />
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <MusicToggle />
                <ThemeSelector />
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <div className="app-shell">
        <BrowserRouter>
          <HeaderBar />

          <main className="main" role="main" style={{ position: 'relative' }}>
            <Motifs />
            <Routes>
              <Route path="/" element={<CornerstoneList />} />
              <Route path="/new" element={<CornerstoneNew />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="/classes/:classId/lessons" element={<ClassLessonsPage />} />
              <Route path="/classes/:classId/lessons/:sessionId" element={<ClassLessonsPage />} />
              <Route path="/:docId" element={<CornerstoneDetail />} />
              <Route path="*" element={<div>Not Found</div>} />
            </Routes>
          </main>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  )
}

export default App
