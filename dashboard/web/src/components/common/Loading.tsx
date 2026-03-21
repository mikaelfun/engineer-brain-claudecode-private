/**
 * Loading — 加载状态组件 (design system v2)
 */
import { Loader2 } from 'lucide-react'

export function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin mr-2" style={{ color: 'var(--accent-blue)' }} />
      <span style={{ color: 'var(--text-secondary)' }}>{text}</span>
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: 'var(--accent-blue)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, description }: { icon?: string; title: string; description?: string }) {
  return (
    <div className="text-center py-12">
      {icon && <span className="text-4xl block mb-3">{icon}</span>}
      <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {description && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</p>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="text-center py-12">
      <span className="text-4xl block mb-3">❌</span>
      <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Error</h3>
      <p className="text-sm mb-3" style={{ color: 'var(--accent-red)' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: 'var(--accent-blue)', color: 'var(--text-inverse)' }}
        >
          Retry
        </button>
      )}
    </div>
  )
}
