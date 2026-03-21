/**
 * Card — 通用卡片容器 (design system v2)
 */
import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4 md:p-5',
  lg: 'p-5 md:p-6',
}

export function Card({
  children,
  className = '',
  style,
  onClick,
  hover = false,
  padding = 'md'
}: CardProps) {
  const hoverClasses = hover || onClick ? 'transition-shadow cursor-pointer' : ''
  const paddingClasses = paddingStyles[padding]

  return (
    <div
      className={`rounded-[10px] ${hoverClasses} ${paddingClasses} ${className}`}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

/** Card Header */
export function CardHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <h3 className="font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          {subtitle && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

/** StatCard */
export function StatCard({
  label,
  value,
  icon,
  color = 'blue',
  active = false,
  onClick,
}: {
  label: string
  value: number | string
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  active?: boolean
  onClick?: () => void
}) {
  const colorMap: Record<string, { bg: string; accent: string }> = {
    blue: { bg: 'var(--accent-blue-dim)', accent: 'var(--accent-blue)' },
    green: { bg: 'var(--accent-green-dim)', accent: 'var(--accent-green)' },
    red: { bg: 'var(--accent-red-dim)', accent: 'var(--accent-red)' },
    yellow: { bg: 'var(--accent-amber-dim)', accent: 'var(--accent-amber)' },
    purple: { bg: 'var(--accent-purple-dim)', accent: 'var(--accent-purple)' },
  }
  const c = colorMap[color]
  const activeStyle = active ? { boxShadow: `0 0 0 2px ${c.accent}` } : {}
  const hoverEffect = onClick ? 'transition-all cursor-pointer' : ''

  return (
    <div
      className={`rounded-[10px] p-4 md:p-5 ${hoverEffect}`}
      style={{
        background: c.bg,
        border: '1px solid var(--border-subtle)',
        borderTop: `2px solid ${c.accent}`,
        ...activeStyle,
      }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          <p className="text-2xl font-bold mt-1 font-mono" style={{ color: 'var(--text-primary)' }}>{value}</p>
        </div>
        {icon && <div style={{ color: 'var(--text-tertiary)' }}>{icon}</div>}
      </div>
    </div>
  )
}
