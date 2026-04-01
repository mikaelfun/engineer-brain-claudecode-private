/**
 * QueryErrorState — Category-aware error display for TanStack Query errors
 *
 * Translates ApiError status codes into human-friendly copy with retry affordance.
 * Supports compact (inline) and full (centered) layout variants.
 */
import { AlertCircle, RefreshCw } from 'lucide-react'
import { ApiError } from '../../api/client.js'

type ErrorCategory = 'auth' | 'validation' | 'not-found' | 'network' | 'timeout' | 'conflict' | 'parse' | 'internal'

interface QueryErrorStateProps {
  error: Error | null
  onRetry?: () => void
  variant?: 'compact' | 'full'
  context?: string   // e.g. "loading emails" — appended to generic message
}

/** Derive category from ApiError status code */
function getCategory(error: Error): ErrorCategory | undefined {
  if (!(error instanceof ApiError)) return undefined
  const status = error.status
  if (status === 401 || status === 403) return 'auth'
  if (status === 400 || status === 422) return 'validation'
  if (status === 404) return 'not-found'
  if (status === 408 || status === 504) return 'timeout'
  if (status === 409) return 'conflict'
  if (status === 0) return 'network'
  if (status >= 500) return 'internal'
  return undefined
}

/** Map category to user-friendly copy */
function getCategoryMessage(error: Error, context?: string): string {
  const category = getCategory(error)
  switch (category) {
    case 'auth':
      return 'Session expired. Please log in again.'
    case 'validation':
      return 'Invalid request. Check your input and try again.'
    case 'not-found':
      return `${context || 'Resource'} not found. It may have been moved or archived.`
    case 'network':
      return 'Connection failed. Check your network and try again.'
    case 'timeout':
      return 'Request timed out. The operation may still be running — try again shortly.'
    case 'conflict':
      return 'This case is already being processed. Please wait and try again.'
    case 'parse':
      return 'Failed to read data. The file may be corrupted.'
    case 'internal':
      return 'An unexpected error occurred. If this persists, check the server logs.'
    default:
      return error.message || 'Something went wrong'
  }
}

/** Map category to color for the category badge */
function getCategoryColor(category?: ErrorCategory): { bg: string; color: string } {
  switch (category) {
    case 'auth':
      return { bg: 'var(--accent-red-dim)', color: 'var(--accent-red)' }
    case 'validation':
      return { bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }
    case 'not-found':
      return { bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }
    case 'network':
      return { bg: 'var(--accent-red-dim)', color: 'var(--accent-red)' }
    case 'timeout':
      return { bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }
    case 'conflict':
      return { bg: 'var(--accent-purple-dim)', color: 'var(--accent-purple)' }
    case 'parse':
      return { bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }
    case 'internal':
      return { bg: 'var(--accent-red-dim)', color: 'var(--accent-red)' }
    default:
      return { bg: 'var(--accent-red-dim)', color: 'var(--accent-red)' }
  }
}

/** Check if a retry button should be shown */
function shouldShowRetry(error: Error, onRetry?: () => void): boolean {
  if (!onRetry) return false
  const category = getCategory(error)
  if (category === 'auth') return false
  return true
}

export function QueryErrorState({ error, onRetry, variant = 'full', context }: QueryErrorStateProps) {
  if (!error) return null

  const message = getCategoryMessage(error, context)
  const category = getCategory(error)
  const showRetry = shouldShowRetry(error, onRetry)
  const categoryStyle = getCategoryColor(category)

  if (variant === 'compact') {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-lg"
        style={{ background: 'var(--accent-red-dim)' }}
      >
        <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-red)' }} />
        <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
          {message}
        </span>
        {category && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0"
            style={{ background: categoryStyle.bg, color: categoryStyle.color }}
          >
            {category}
          </span>
        )}
        {showRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium flex-shrink-0 transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent-blue)', color: 'var(--text-inverse)' }}
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    )
  }

  // Full layout — centered, same structure as ErrorState in Loading.tsx
  return (
    <div className="text-center py-12">
      <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--accent-red)' }} />
      <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Error</h3>
      <p className="text-sm mb-2" style={{ color: 'var(--accent-red)' }}>{message}</p>
      {category && (
        <span
          className="inline-block text-[10px] px-1.5 py-0.5 rounded font-medium mb-3"
          style={{ background: categoryStyle.bg, color: categoryStyle.color }}
        >
          {category}
        </span>
      )}
      {showRetry && (
        <div className="mt-2">
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent-blue)', color: 'var(--text-inverse)' }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
