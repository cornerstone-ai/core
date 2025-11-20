import React, { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { CornerstoneList } from '../pages/CornerstoneList'
import { CornerstoneNew } from '../pages/CornerstoneNew'
import { CornerstoneDetail } from '../pages/CornerstoneDetail'
import { ThemeProvider, ThemeSelector, Motifs } from '../features/themes/public'
import { MusicToggle } from '../features/music/public'
import { ClassSelector } from '../features/classes/ClassSelector'
import { ClassesPage } from '../pages/Classes'
import { ClassLessonsPage } from '../pages/ClassLessons'
import { TeachersPage } from '../pages/Teachers'
import { AssignmentsPage } from '../pages/Assignments'
import { useAuth } from '../features/auth/public'
import { getSelectedClassId } from '../features/classes/public'

function HeaderBar() {
  const navigate = useNavigate()
  const loc = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

  const { user, loading, signIn, signOut, idToken } = useAuth()

  const [selectedClassId, setSelectedClassIdState] = useState<string>(() => getSelectedClassId())
  useEffect(() => {
    // Re-sync selected class on route changes (e.g., when visiting a lessons route directly)
    setSelectedClassIdState(getSelectedClassId())
  }, [loc.pathname])

  // Responsive breakpoint for mobile UI elements (hamburger, drawer)
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && 'matchMedia' in window ? window.matchMedia('(max-width: 768px)').matches : false)
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return
    const mq = window.matchMedia('(max-width: 768px)')
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener ? mq.addEventListener('change', onChange) : mq.addListener(onChange)
    onChange()
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', onChange) : mq.removeListener(onChange)
    }
  }, [])

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

  const onLessonsClick = () => {
    const cid = getSelectedClassId() || selectedClassId
    if (cid) navigate(`/classes/${encodeURIComponent(cid)}/lessons`)
    else navigate('/classes')
    setMobileOpen(false)
  }

  // When class changes from the selector, keep the current context.
  // If user is on a lessons route, navigate to the new class's lessons LIST (no auto-open).
  const handleClassChange = (nextId: string) => {
    setSelectedClassIdState(nextId)
    const isLessonsRoute = /^\/classes\/[^/]+\/lessons(\/[^/]+)?$/.test(loc.pathname)
    if (isLessonsRoute) {
      navigate(`/classes/${encodeURIComponent(nextId)}/lessons`)
    }
    // Close mobile drawer if open
    if (mobileOpen) setMobileOpen(false)
  }

  const lessonsDisabled = !selectedClassId

  return (
    <header className="header" role="banner" style={{ borderBottom: '1px solid #e5e7eb' }}>
      <div className="header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '6px 10px' }}>
        {/* Left cluster: brand + (mobile hamburger) + primary nav incl. class selector */}
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {isMobile && (
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
          )}

          {/* Brand */}
          <div className="brand" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 700 }}>Cornerstone</Link>
          </div>

          {/* Left nav */}
          <nav className="nav app-nav-left" aria-label="Primary" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'nowrap' }}>
            <Link className="button-link" to="/classes" style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>Classes</Link>
            <button
              type="button"
              onClick={onLessonsClick}
              aria-disabled={lessonsDisabled || undefined}
              title={lessonsDisabled ? 'Select a class to view lessons' : 'Open lessons'}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: lessonsDisabled ? '#f9fafb' : 'white', color: lessonsDisabled ? '#9ca3af' : 'inherit', cursor: lessonsDisabled ? 'not-allowed' : 'pointer' }}
            >
              Lessons
            </button>
            <Link className="button-link" to="/assignments" style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>Assignments</Link>
            <Link className="button-link" to="/teachers" style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>Teachers</Link>

            {/* Class selector reusing awfl-web projects list */}
            <ClassSelector idToken={idToken} includeManageOption onManage={onManageClasses} hideLabel onChange={handleClassChange} />
          </nav>
        </div>

        {/* Right-side tools */}
        <div className="tools" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              <Link to="/classes" onClick={() => setMobileOpen(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>Classes</Link>
              <button
                type="button"
                onClick={onLessonsClick}
                aria-disabled={lessonsDisabled || undefined}
                title={lessonsDisabled ? 'Select a class to view lessons' : 'Open lessons'}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: lessonsDisabled ? '#f9fafb' : 'white', color: lessonsDisabled ? '#9ca3af' : 'inherit', cursor: lessonsDisabled ? 'not-allowed' : 'pointer' }}
              >
                Lessons
              </button>
              <Link to="/assignments" onClick={() => setMobileOpen(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>Assignments</Link>
              <Link to="/teachers" onClick={() => setMobileOpen(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>Teachers</Link>

              <div>
                <ClassSelector idToken={idToken} label="Class" includeManageOption onManage={onManageClasses} onChange={handleClassChange} style={{ marginTop: 8 }} />
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

function AppInner() {
  const loc = useLocation()
  const isLessonDetail = /^\/classes\/[^/]+\/lessons\/[^/]+$/.test(loc.pathname)
  const mainClass = `main${isLessonDetail ? ' lesson-mode' : ''}`

  return (
    <div className="app-shell">
      <HeaderBar />
      <main className={mainClass} role="main" style={{ position: 'relative' }}>
        <Motifs />
        <Routes>
          <Route path="/" element={<CornerstoneList />} />
          <Route path="/new" element={<CornerstoneNew />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/classes/:classId/lessons" element={<ClassLessonsPage />} />
          <Route path="/classes/:classId/lessons/:sessionId" element={<ClassLessonsPage />} />
          <Route path="/:docId" element={<CornerstoneDetail />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </main>
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
