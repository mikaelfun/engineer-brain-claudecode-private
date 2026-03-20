/**
 * Layout — 主布局 (adapted from RDSE2)
 */
import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, Menu, X, Brain } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useHealth } from '../api/hooks'

interface LayoutProps {
  children: ReactNode
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊', exact: true },
  { path: '/todo', label: 'Todo', icon: '📝' },
  { path: '/agents', label: 'Agents', icon: '🤖' },
  { path: '/drafts', label: 'Drafts', icon: '📧' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { logout } = useAuth()
  const { data: health } = useHealth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-bold text-gray-900">Engineer Brain</h1>
              </div>
              <h1 className="sm:hidden text-lg font-bold text-gray-900">EB</h1>
            </Link>

            {/* Workspace status (desktop) */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              {health?.casesReady ? (
                <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full">Workspace Connected</span>
              ) : (
                <Link
                  to="/settings"
                  className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 transition-colors"
                  title="Click to configure workspace path"
                >
                  ⚠️ Workspace Not Configured
                </Link>
              )}
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                    isActive(item.path, item.exact)
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                  }`}
                >
                  <span className="lg:hidden">{item.icon}</span>
                  <span className="hidden lg:inline">{item.icon} {item.label}</span>
                </Link>
              ))}

              <button
                onClick={logout}
                className="ml-1 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <nav className="max-w-7xl mx-auto px-4 py-2">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-colors ${
                    isActive(item.path, item.exact)
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={() => { setMobileMenuOpen(false); logout() }}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-base text-red-500 hover:bg-red-50 w-full mt-2 border-t border-gray-100 pt-4"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        {children}
      </main>
    </div>
  )
}
