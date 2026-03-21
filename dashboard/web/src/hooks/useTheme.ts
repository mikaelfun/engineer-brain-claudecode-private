/**
 * useTheme — Theme management hook
 *
 * Supports three modes: 'dark' | 'light' | 'system'
 * Persists preference to localStorage('eb-theme')
 * Syncs with prefers-color-scheme when in system mode
 */
import { useState, useEffect, useCallback } from 'react'

export type ThemeMode = 'dark' | 'light' | 'system'

const STORAGE_KEY = 'eb-theme'

function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light' || stored === 'system') return stored
  return 'dark' // default
}

function getResolvedTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

function applyTheme(resolved: 'dark' | 'light') {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  root.classList.add(resolved)
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(getStoredTheme)
  const [resolved, setResolved] = useState<'dark' | 'light'>(() => getResolvedTheme(getStoredTheme()))

  const setMode = useCallback((newMode: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, newMode)
    setModeState(newMode)
    const r = getResolvedTheme(newMode)
    setResolved(r)
    applyTheme(r)
  }, [])

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (mode !== 'system') return

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      const r = e.matches ? 'dark' : 'light'
      setResolved(r)
      applyTheme(r)
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [mode])

  // Apply on mount
  useEffect(() => {
    applyTheme(getResolvedTheme(mode))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Cycle through modes: dark → light → system → dark
  const cycleTheme = useCallback(() => {
    const order: ThemeMode[] = ['dark', 'light', 'system']
    const idx = order.indexOf(mode)
    const next = order[(idx + 1) % order.length]
    setMode(next)
  }, [mode, setMode])

  return {
    /** Current user preference: 'dark' | 'light' | 'system' */
    mode,
    /** Resolved actual theme: 'dark' | 'light' */
    resolved,
    /** Set a specific theme mode */
    setMode,
    /** Cycle to next theme mode */
    cycleTheme,
    /** Whether currently in dark mode */
    isDark: resolved === 'dark',
  }
}
