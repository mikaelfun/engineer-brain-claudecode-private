/**
 * Badge — 通用徽章组件 (design system v2)
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

const variantStyles: Record<BadgeVariant, { bg: string; color: string }> = {
  default: { bg: 'var(--bg-inset)', color: 'var(--text-secondary)' },
  primary: { bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' },
  secondary: { bg: 'var(--bg-inset)', color: 'var(--text-tertiary)' },
  success: { bg: 'var(--accent-green-dim)', color: 'var(--accent-green)' },
  warning: { bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' },
  danger: { bg: 'var(--accent-red-dim)', color: 'var(--accent-red)' },
  info: { bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' },
  purple: { bg: 'var(--accent-purple-dim)', color: 'var(--accent-purple)' },
  orange: { bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' },
}

const sizeStyles: Record<string, string> = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
}

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  const v = variantStyles[variant]
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold font-mono rounded-[18px] uppercase whitespace-nowrap ${sizeStyles[size]} ${className}`}
      style={{ background: v.bg, color: v.color, letterSpacing: '0.2px' }}
    >
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
  const colors =
    score >= 70 ? { bg: 'var(--accent-green-dim)', color: 'var(--accent-green)', ring: 'var(--accent-green)' }
    : score >= 40 ? { bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)', ring: 'var(--accent-amber)' }
    : { bg: 'var(--accent-red-dim)', color: 'var(--accent-red)', ring: 'var(--accent-red)' }

  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
      style={{
        background: colors.bg,
        color: colors.color,
        boxShadow: `0 0 0 2px ${colors.ring}`,
      }}
      title={`Health Score: ${score}/100`}
    >
      {score}
    </div>
  )
}

/** Entitlement Warning Banner — full-width alert for non-compliant cases */
export function EntitlementWarningBanner({ compliance }: { compliance: any }) {
  if (!compliance || compliance.entitlementOk !== false) return null

  return (
    <div
      className="rounded-lg px-3 py-2.5 text-xs"
      style={{
        background: 'color-mix(in srgb, var(--accent-red) 12%, var(--bg-surface))',
        border: '1px solid color-mix(in srgb, var(--accent-red) 30%, transparent)',
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm">⚠️</span>
        <span className="font-bold" style={{ color: 'var(--accent-red)' }}>
          Entitlement Warning — Contact TA
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 ml-6" style={{ color: 'var(--text-secondary)' }}>
        <div>
          <span style={{ color: 'var(--text-tertiary)' }}>Service: </span>
          <span className="font-mono">{compliance.serviceName || 'N/A'}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-tertiary)' }}>Schedule: </span>
          <span className="font-mono">{compliance.schedule || 'N/A'}</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-tertiary)' }}>Country: </span>
          <span className="font-mono">{compliance.contractCountry || 'N/A'}</span>
        </div>
      </div>
      {compliance.warnings?.length > 0 && (
        <div className="ml-6 mt-1" style={{ color: 'var(--accent-red)' }}>
          {compliance.warnings.join('; ')}
        </div>
      )}
    </div>
  )
}

/** Compact entitlement warning badge for case list cards */
export function EntitlementWarningBadge({ compliance }: { compliance: any }) {
  if (!compliance || compliance.entitlementOk !== false) return null
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold font-mono rounded-[18px] uppercase whitespace-nowrap"
      style={{
        background: 'color-mix(in srgb, var(--accent-red) 15%, transparent)',
        color: 'var(--accent-red)',
        border: '1px solid color-mix(in srgb, var(--accent-red) 30%, transparent)',
        letterSpacing: '0.2px',
      }}
      title={`Service: ${compliance.serviceName || 'N/A'} | Schedule: ${compliance.schedule || 'N/A'} | Country: ${compliance.contractCountry || 'N/A'}`}
    >
      ⚠️ ENTITLEMENT
    </span>
  )
}

/** RDSE customer badge for case list and detail header */
export function RdseBadge({ ccAccount }: { ccAccount?: string }) {
  if (!ccAccount) return null
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold font-mono rounded-[18px] uppercase whitespace-nowrap"
      style={{
        background: 'var(--accent-purple-dim)',
        color: 'var(--accent-purple)',
        border: '1px solid color-mix(in srgb, var(--accent-purple) 25%, transparent)',
        letterSpacing: '0.2px',
      }}
      title={`RDSE Customer: ${ccAccount}`}
    >
      RDSE · {ccAccount.length > 20 ? ccAccount.slice(0, 20) + '…' : ccAccount}
    </span>
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
