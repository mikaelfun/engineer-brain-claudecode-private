/**
 * Badge — 通用徽章组件 (from RDSE2 + Engineer Brain extensions)
 */
import React from 'react'

export type BadgeVariant =
  | 'default' | 'primary' | 'secondary'
  | 'success' | 'warning' | 'danger'
  | 'info' | 'purple' | 'orange'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-blue-100 text-blue-700',
  secondary: 'bg-gray-100 text-gray-600',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-cyan-100 text-cyan-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
}

const sizeStyles: Record<string, string> = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  )
}

/** Severity Badge for Case */
export function SeverityBadge({ severity }: { severity: string }) {
  const sev = severity || ''
  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    A: { variant: 'danger', label: 'SEV A' },
    B: { variant: 'warning', label: 'SEV B' },
    C: { variant: 'primary', label: 'SEV C' },
  }
  const { variant, label } = config[sev] || { variant: 'default' as BadgeVariant, label: sev || '?' }
  return <Badge variant={variant} size="sm">{label}</Badge>
}

/** Case Status Badge */
export function CaseStatusBadge({ status }: { status: string }) {
  const statusLower = (status || '').toLowerCase()
  let variant: BadgeVariant = 'default'

  if (statusLower.includes('troubleshooting') || statusLower.includes('pending engineer')) {
    variant = 'danger'
  } else if (statusLower.includes('pending customer') || statusLower.includes('waiting')) {
    variant = 'warning'
  } else if (statusLower.includes('resolved') || statusLower.includes('closed')) {
    variant = 'success'
  } else if (statusLower === 'ar') {
    variant = 'purple'
  }

  return <Badge variant={variant} size="sm">{status}</Badge>
}

/** SLA Status Badge */
export function SlaBadge({ status }: { status: string }) {
  const statusLower = (status || '').toLowerCase()
  let variant: BadgeVariant = 'default'

  if (statusLower === 'succeeded' || statusLower === 'passed') variant = 'success'
  else if (statusLower === 'failed' || statusLower === 'breached') variant = 'danger'
  else if (statusLower === 'warning' || statusLower === 'nearing') variant = 'warning'
  else if (statusLower === 'unknown') variant = 'secondary'

  return <Badge variant={variant} size="xs">{status}</Badge>
}

/** Case Health Priority Badge */
export function PriorityBadge({ priority }: { priority: 'red' | 'yellow' | 'green' | 'done' }) {
  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    red: { variant: 'danger', label: '紧急' },
    yellow: { variant: 'warning', label: '待处理' },
    green: { variant: 'success', label: '正常' },
    done: { variant: 'success', label: '已完成' },
  }
  const { variant, label } = config[priority] || { variant: 'default' as BadgeVariant, label: priority }
  return <Badge variant={variant} size="xs">{label}</Badge>
}

/** Health Score Badge — circular score indicator with color coding */
export function HealthScoreBadge({ meta }: { meta: any }) {
  const score = computeHealthScore(meta)
  // Color coding: green >= 70, yellow >= 40, red < 40
  const colorClass =
    score >= 70 ? 'bg-green-100 text-green-700 ring-green-300'
    : score >= 40 ? 'bg-yellow-100 text-yellow-700 ring-yellow-300'
    : 'bg-red-100 text-red-700 ring-red-300'

  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ring-2 ${colorClass}`}
      title={`Health Score: ${score}/100`}
    >
      {score}
    </div>
  )
}

/** Compute health score from CaseHealthMeta (0-100) */
function computeHealthScore(meta: any): number {
  if (!meta) return 0

  let score = 100

  // SLA deductions
  const irStatus = (meta.irSla?.status || '').toLowerCase()
  if (irStatus === 'failed' || irStatus === 'breached') score -= 30
  else if (irStatus === 'warning' || irStatus === 'nearing') score -= 10

  const fwrStatus = (meta.fwr?.status || '').toLowerCase()
  if (fwrStatus === 'failed' || fwrStatus === 'breached') score -= 20
  else if (fwrStatus === 'warning' || fwrStatus === 'nearing') score -= 5

  const fdrStatus = (meta.fdr?.status || '').toLowerCase()
  if (fdrStatus === 'failed' || fdrStatus === 'breached') score -= 20
  else if (fdrStatus === 'warning' || fdrStatus === 'nearing') score -= 5

  // daysSinceLastContact deductions
  const dslc = meta.daysSinceLastContact ?? 0
  if (dslc > 7) score -= 20
  else if (dslc > 3) score -= 10

  // No recent inspection deduction
  if (!meta.lastInspected) score -= 10

  return Math.max(0, Math.min(100, score))
}
