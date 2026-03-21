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
      onMouseEnter={hover || onClick ? (e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)';
        (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
      } : undefined}
      onMouseLeave={hover || onClick ? (e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
        (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)'
      } : undefined}
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
  const colorMap: Record<string, { bg: string; accent: string; glow: string }> = {
    blue: { bg: 'var(--accent-blue-dim)', accent: 'var(--accent-blue)', glow: 'var(--glow-blue)' },
    green: { bg: 'var(--accent-green-dim)', accent: 'var(--accent-green)', glow: 'var(--glow-green)' },
    red: { bg: 'var(--accent-red-dim)', accent: 'var(--accent-red)', glow: 'var(--glow-red)' },
    yellow: { bg: 'var(--accent-amber-dim)', accent: 'var(--accent-amber)', glow: 'var(--glow-amber)' },
    purple: { bg: 'var(--accent-purple-dim)', accent: 'var(--accent-purple)', glow: 'var(--glow-blue)' },
  }
  const c = colorMap[color]
  const activeStyle = active ? { boxShadow: `0 0 0 2px ${c.accent}` } : {}
  const hoverEffect = onClick ? 'transition-all cursor-pointer' : 'transition-all'

  return (
    <div
      className={`rounded-[10px] p-4 md:p-5 relative overflow-hidden group ${hoverEffect}`}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        ...activeStyle,
      }}
      onClick={onClick}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
        (e.currentTarget as HTMLElement).style.boxShadow = c.glow
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = active ? `0 0 0 2px ${c.accent}` : 'none'
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: c.accent, opacity: 0.7 }}
      />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
          <p className="text-[26px] font-extrabold mt-1 font-mono" style={{ color: c.accent, letterSpacing: '-0.02em' }}>{value}</p>
        </div>
        {icon && <div style={{ color: 'var(--text-tertiary)', opacity: 0.5 }}>{icon}</div>}
      </div>
    </div>
  )
}
