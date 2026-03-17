/**
 * Card — 通用卡片容器 (from RDSE2)
 */
import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
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
  onClick,
  hover = false,
  padding = 'md'
}: CardProps) {
  const baseClasses = 'bg-white rounded-xl shadow-sm border border-gray-200'
  const hoverClasses = hover || onClick ? 'hover:shadow-md transition-shadow cursor-pointer' : ''
  const paddingClasses = paddingStyles[padding]

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${paddingClasses} ${className}`}
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
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
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
  const colorStyles = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
  }

  const activeRing = active ? 'ring-2 ring-offset-1 ring-blue-500' : ''
  const hoverEffect = onClick ? 'hover:shadow-md transition-all cursor-pointer' : ''

  return (
    <Card className={`${colorStyles[color]} ${activeRing} ${hoverEffect}`} padding="md" onClick={onClick}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </Card>
  )
}
