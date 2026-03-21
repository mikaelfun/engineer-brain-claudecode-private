/**
 * Layout — Sidebar navigation layout (design system v2)
 *
 * Left fixed sidebar (220px) + full-width main content area.
 * Sidebar: logo, nav items, bottom theme toggle + logout.
 * Mobile: collapsible sidebar overlay.
 */
import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, Menu, X, Brain, Sun, Moon, Monitor } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useHealth } from '../api/hooks'
import { useTheme, type ThemeMode } from '../hooks/useTheme'

interface LayoutProps {
  children: ReactNode
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊', exact: true },
  { path: '/todo', label: 'Todo', icon: '📝' },
  { path: '/agents', label: 'Agents', icon: '🤖' },
  { path: '/drafts', label: 'Drafts', icon: '📧' },
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

  const ThemeIcon = themeIcons[mode]

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
              style={{ background: 'var(--accent-blue)' }}>
              <Brain className="w-5 h-5" style={{ color: 'var(--text-inverse)' }} />
            </div>
            <div>
              <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                Engineer Brain
              </h1>
              <p className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                {health?.casesReady ? 'Connected' : 'Not configured'}
              </p>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
              style={{
                background: isActive(item.path, item.exact) ? 'var(--accent-blue-dim)' : 'transparent',
                color: isActive(item.path, item.exact) ? 'var(--accent-blue)' : 'var(--text-secondary)',
              }}
              onMouseEnter={e => {
                if (!isActive(item.path, item.exact)) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive(item.path, item.exact)) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                }
              }}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom section: theme toggle + logout */}
        <div className="px-3 py-4 border-t border-subtle space-y-2">
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
              {navItems.map(item => (
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
              ))}
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
        className="flex-1 min-h-screen"
        style={{ marginLeft: 'var(--sidebar-width, 220px)' }}
      >
        {/* Mobile top spacing */}
        <div className="md:hidden h-14" />
        <div className="px-6 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
