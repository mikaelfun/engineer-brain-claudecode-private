/**
 * Loading — 加载状态组件
 */
import { Loader2 } from 'lucide-react'

export function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
      <span className="text-gray-500">{text}</span>
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, description }: { icon?: string; title: string; description?: string }) {
  return (
    <div className="text-center py-12">
      {icon && <span className="text-4xl block mb-3">{icon}</span>}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-gray-500 text-sm">{description}</p>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="text-center py-12">
      <span className="text-4xl block mb-3">❌</span>
      <h3 className="text-lg font-medium text-gray-900 mb-1">Error</h3>
      <p className="text-red-500 text-sm mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-blue-700"
        >
          Retry
        </button>
      )}
    </div>
  )
}
