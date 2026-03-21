/**
 * LoginPage — 登录/设置页面 (design system v2)
 */
import { useState } from 'react'
import { Lock, Loader2, AlertCircle, Brain } from 'lucide-react'
import { BASE_URL } from '../api/client'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { login, isSetup } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) { setError('Please enter a password'); return }
    if (password.length < 4) { setError('Password must be at least 4 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true); setError('')
    try {
      const res = await fetch(`${BASE_URL}/auth/setup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (data.success) login(data.token)
      else setError(data.error || 'Setup failed')
    } catch { setError('Connection error') }
    finally { setLoading(false) }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) { setError('Please enter your password'); return }

    setLoading(true); setError('')
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (data.success) login(data.token)
      else setError(data.error || 'Login failed')
    } catch { setError('Connection error. Is the server running?') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm">
        <div className="rounded-xl p-8" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-elevated)' }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ background: 'var(--accent-blue-dim)' }}>
              <Brain className="w-8 h-8" style={{ color: 'var(--accent-blue)' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Engineer Brain
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {isSetup ? 'Enter your password to continue' : 'Set up your password to get started'}
            </p>
          </div>

          <form onSubmit={isSetup ? handleLogin : handleSetup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {isSetup ? 'Password' : 'Create Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSetup ? 'Enter password' : 'Create a password (4+ chars)'}
                  className="w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-all text-sm"
                  style={{
                    background: 'var(--bg-inset)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            {!isSetup && (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-all text-sm"
                    style={{
                      background: 'var(--bg-inset)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm p-3 rounded-lg"
                style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent-blue)',
                color: 'var(--text-inverse)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isSetup ? 'Logging in...' : 'Setting up...'}
                </>
              ) : (
                isSetup ? 'Login' : 'Set Up'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text-tertiary)' }}>
          Engineer Brain v1.0 — Local Dashboard
        </p>
      </div>
    </div>
  )
}
