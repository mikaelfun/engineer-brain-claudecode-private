/**
 * Layout — Sidebar navigation layout (design system v2)
 *
 * Left fixed sidebar (220px) + full-width main content area.
 * Sidebar: logo, nav items, bottom theme toggle + logout.
 * Mobile: collapsible sidebar overlay.
 */
import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, Menu, X, Brain, Sun, Moon, Monitor, Server, Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useHealth, useRestartFrontend, useRestartBackend, useRestartAll } from '../api/hooks'
import { useTheme, type ThemeMode } from '../hooks/useTheme'

interface LayoutProps {
  children: ReactNode
}

type NavItem = { path: string; label: string; icon: string; exact?: boolean }
type NavSection = { section: string }
type NavEntry = NavItem | NavSection

const navItems: NavEntry[] = [
  { path: '/', label: 'Dashboard', icon: '📊', exact: true },
  { path: '/cases', label: 'Cases', icon: '📁' },
  { path: '/todo', label: 'Todo', icon: '📌' },
  { path: '/labor', label: 'Labor', icon: '⏱️' },
  { path: '/agents', label: 'Agents', icon: '🤖' },
  { path: '/drafts', label: 'Drafts', icon: '✉️' },
  { path: '/tests', label: 'Test Lab', icon: '🧪' },
  { path: '/test-results', label: 'Test Results', icon: '📈' },
  { section: 'Manage' },
  { path: '/issues', label: 'Issues', icon: '🐛' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

const themeIcons: Record<ThemeMode, typeof Sun> = {
  dark: Moon,
  light: Sun,
  system: Monitor,
}

const themeLabels: Record<ThemeMode, string> = {
  dark: 'Dark',
  light: 'Light',
  system: 'System',
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { logout } = useAuth()
  const { data: health } = useHealth()
  const { mode, cycleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)

  const restartFe = useRestartFrontend()
  const restartBe = useRestartBackend()
  const restartAllSvc = useRestartAll()

  const ThemeIcon = themeIcons[mode]

  const pollHealth = () => {
    setReconnecting(true)
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/health')
        if (res.ok) {
          clearInterval(interval)
          setReconnecting(false)
          window.location.reload()
        }
      } catch {
        // still down, keep polling
      }
    }, 1500)
  }

  const handleRestartFe = () => {
    restartFe.mutate(undefined, {
      onSuccess: () => setTimeout(() => window.location.reload(), 3000),
    })
  }
  const handleRestartBe = () => {
    restartBe.mutate(undefined, {
      onSuccess: () => pollHealth(),
      onError: () => pollHealth(),
    })
  }
  const handleRestartAll = () => {
    restartAllSvc.mutate(undefined, {
      onSuccess: () => pollHealth(),
      onError: () => pollHealth(),
    })
  }

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-base flex">
      {/* Sidebar — Desktop */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-screen border-r border-default bg-surface z-40"
        style={{ width: 'var(--sidebar-width, 220px)' }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-subtle">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', opacity: 0.9 }}>
              <Brain className="w-5 h-5" style={{ color: 'var(--text-inverse)' }} />
            </div>
            <div>
              <h1 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Engineer Brain
              </h1>
              <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>
                {health?.casesReady ? 'Connected' : 'Not configured'}
              </p>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item, idx) => {
            if ('section' in item) {
              return (
                <div
                  key={idx}
                  className="text-[10px] font-bold uppercase tracking-widest px-3 pt-4 pb-1"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {item.section}
                </div>
              )
            }
            const active = isActive(item.path, item.exact)
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150"
                style={{
                  background: active ? 'var(--accent-blue-dim)' : 'transparent',
                  color: active ? 'var(--accent-blue)' : 'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
                  }
                }}
              >
                {/* Active indicator bar */}
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-sm"
                    style={{ background: 'var(--accent-blue)' }}
                  />
                )}
                <span className="w-[18px] text-[13px] flex items-center justify-center">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom section: restart + theme toggle + logout */}
        <div className="px-3 py-4 border-t border-subtle space-y-2">
          {/* Restart buttons */}
          <div className="flex items-center gap-1 px-1">
            <button
              onClick={handleRestartFe}
              disabled={restartFe.isPending || reconnecting}
              className="flex items-center gap-1.5 flex-1 px-2 py-1.5 rounded text-[11px] font-medium disabled:opacity-40 transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              title="Restart frontend (vite)"
            >
              {restartFe.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Monitor className="w-3 h-3" />}
              FE
            </button>
            <button
              onClick={handleRestartBe}
              disabled={restartBe.isPending || reconnecting}
              className="flex items-center gap-1.5 flex-1 px-2 py-1.5 rounded text-[11px] font-medium disabled:opacity-40 transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              title="Restart backend (tsx)"
            >
              {restartBe.isPending || reconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Server className="w-3 h-3" />}
              BE
            </button>
            <button
              onClick={handleRestartAll}
              disabled={restartAllSvc.isPending || reconnecting}
              className="flex items-center gap-1.5 flex-1 px-2 py-1.5 rounded text-[11px] font-medium disabled:opacity-40 transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              title="Restart all"
            >
              {restartAllSvc.isPending || reconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              All
            </button>
          </div>
          <button
            onClick={cycleTheme}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            title={`Theme: ${themeLabels[mode]}`}
          >
            <ThemeIcon className="w-4 h-4" />
            <span>{themeLabels[mode]}</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
            style={{ color: 'var(--accent-red)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-red-dim)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-default bg-surface"
        style={{ height: '56px' }}
      >
        <div className="flex items-center justify-between px-4 h-full">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-blue)' }}>
              <Brain className="w-4 h-4" style={{ color: 'var(--text-inverse)' }} />
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>EB</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40" style={{ top: '56px' }}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative bg-surface border-r border-default w-64 h-full overflow-y-auto"
            style={{ background: 'var(--bg-surface)' }}>
            <nav className="px-3 py-4 space-y-1">
              {navItems.map((item, idx) => {
                if ('section' in item) {
                  return (
                    <div key={idx} className="text-[10px] font-bold uppercase tracking-widest px-3 pt-4 pb-1"
                      style={{ color: 'var(--text-tertiary)' }}>
                      {item.section}
                    </div>
                  )
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: isActive(item.path, item.exact) ? 'var(--accent-blue-dim)' : 'transparent',
                      color: isActive(item.path, item.exact) ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="px-3 py-4 border-t border-subtle space-y-2">
              <button
                onClick={cycleTheme}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ThemeIcon className="w-4 h-4" />
                <span>{themeLabels[mode]}</span>
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); logout() }}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm"
                style={{ color: 'var(--accent-red)' }}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main
        className="flex-1 min-h-screen min-w-0 overflow-x-hidden"
        style={{
          marginLeft: 'var(--sidebar-width, 220px)',
          maxWidth: 'calc(100vw - var(--sidebar-width, 220px))',
        }}
      >
        {/* Mobile top spacing */}
        <div className="md:hidden h-14" />
        <div className="px-6 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>

      {/* Reconnecting overlay */}
      {reconnecting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3" style={{ background: 'var(--bg-surface)' }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-blue)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Restarting services...</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Waiting for server to come back online</p>
          </div>
        </div>
      )}
    </div>
  )
}
