/**
 * AzProfileCard — Azure CLI Profile 健康状态卡片
 *
 * 核心概念：后端每 15 分钟调一次 `az account get-access-token`，
 * 这不仅检查 refresh token 是否有效，同时自动续期 refresh token（90 天滑动窗口）。
 * 只要后端持续运行，refresh token 永远不会过期。
 *
 * 失效条件：后端停机 >90 天、管理员撤销 token、密码变更。
 */
import { Card } from './common/Card'
import { useAzProfileStatus, useAzProfileRefresh } from '../api/hooks'
import type { AzProfileStatus } from '../api/hooks'
import { Loader2, RefreshCw, ShieldCheck, ShieldAlert } from 'lucide-react'

const CLOUD_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  china: { label: '21V', color: 'var(--accent-amber)', bg: 'var(--accent-amber-dim)' },
  public: { label: 'Global', color: 'var(--accent-blue)', bg: 'var(--accent-blue-dim)' },
}

function ProfileRow({ profile }: { profile: AzProfileStatus }) {
  const isOk = profile.status === 'ok'
  const cloud = CLOUD_BADGE[profile.cloud] || CLOUD_BADGE.public

  // Time since last check
  let checkedAgo = ''
  if (profile.lastChecked) {
    const mins = Math.round((Date.now() - new Date(profile.lastChecked).getTime()) / 60_000)
    checkedAgo = mins < 1 ? 'just now' : mins < 60 ? `${mins}m ago` : `${Math.round(mins / 60)}h ago`
  }

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      {/* Profile name */}
      <span
        className="text-xs font-mono w-20 text-right shrink-0 truncate"
        style={{ color: 'var(--text-secondary)' }}
      >
        {profile.name}
      </span>
      {/* Cloud badge */}
      <span
        className="inline-flex items-center justify-center text-[9px] font-semibold w-12 py-0.5 rounded shrink-0"
        style={{ background: cloud.bg, color: cloud.color }}
      >
        {cloud.label}
      </span>
      {/* Status */}
      <span
        className="inline-block w-2 h-2 rounded-full shrink-0"
        style={{ background: isOk ? 'var(--accent-green)' : 'var(--accent-red)' }}
      />
      <span
        className="text-xs flex-1 min-w-0 truncate"
        style={{ color: isOk ? 'var(--text-tertiary)' : 'var(--accent-red)' }}
        title={profile.error || undefined}
      >
        {isOk ? 'Active' : 'Need az login'}
      </span>
      {/* Last checked */}
      <span
        className="text-[10px] font-mono w-16 text-right shrink-0"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {checkedAgo}
      </span>
    </div>
  )
}

export function AzProfileCard() {
  const { data, isLoading } = useAzProfileStatus()
  const refresh = useAzProfileRefresh()

  if (isLoading || !data) {
    return (
      <Card padding="sm">
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Checking az profiles...
        </div>
      </Card>
    )
  }

  const { profiles } = data
  const allOk = profiles.every(p => p.status === 'ok')
  const anyExpired = profiles.some(p => p.status === 'expired')

  // Calculate most recent check time across all profiles
  let refreshedAgo = ''
  const checkTimes = profiles
    .map(p => p.lastChecked ? new Date(p.lastChecked).getTime() : 0)
    .filter(t => t > 0)
  if (checkTimes.length > 0) {
    const latest = Math.max(...checkTimes)
    const mins = Math.round((Date.now() - latest) / 60_000)
    refreshedAgo = mins < 1 ? 'just now' : mins < 60 ? `${mins}m ago` : `${Math.round(mins / 60)}h ago`
  }

  return (
    <Card padding="sm">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {allOk
              ? <ShieldCheck className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
              : <ShieldAlert className="w-4 h-4 animate-pulse" style={{ color: anyExpired ? 'var(--accent-red)' : 'var(--accent-amber)' }} />
            }
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Az Profiles
            </span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {profiles.filter(p => p.status === 'ok').length}/{profiles.length} active
              {refreshedAgo && ` · Refreshed ${refreshedAgo}`}
            </span>
          </div>
          <button
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending}
            className="flex items-center gap-1 px-2 py-1 text-xs border rounded-lg transition-colors disabled:opacity-50"
            style={{
              color: 'var(--accent-green)',
              background: 'var(--accent-green-dim)',
              borderColor: 'transparent',
            }}
            title="Re-check all profiles (also renews refresh tokens)"
          >
            <RefreshCw className={`w-3 h-3 ${refresh.isPending ? 'animate-spin' : ''}`} />
            Check
          </button>
        </div>

        {/* Profile rows */}
        {profiles.length > 0 ? (
          <div className="space-y-1.5">
            {[...profiles]
              .sort((a, b) => {
                if (a.status === 'expired' && b.status !== 'expired') return -1
                if (a.status !== 'expired' && b.status === 'expired') return 1
                return a.name.localeCompare(b.name)
              })
              .map((p) => (
                <ProfileRow key={p.profileDir} profile={p} />
              ))}
          </div>
        ) : (
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            No az profiles found.
          </div>
        )}
      </div>
    </Card>
  )
}
