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
import { useAzProfileStatus, useAzProfileRefresh, useAzProfileLogin } from '../api/hooks'
import type { AzProfileStatus } from '../api/hooks'
import { Loader2, RefreshCw, ShieldCheck, ShieldAlert, LogIn } from 'lucide-react'

function ProfileRow({ profile, onLogin, loginPending }: { profile: AzProfileStatus; onLogin: (profileDir: string) => void; loginPending: boolean }) {
  const isOk = profile.status === 'ok'
  const isLoggingIn = !!profile.loginInProgress

  return (
    <div className="flex items-center gap-2 min-w-0">
      {/* Status dot */}
      <span
        className="inline-block w-2 h-2 rounded-full shrink-0"
        style={{ background: isOk ? 'var(--accent-green)' : isLoggingIn ? 'var(--accent-amber)' : 'var(--accent-red)' }}
      />
      {/* Profile name */}
      <span
        className="text-xs font-mono flex-1 min-w-0 truncate"
        style={{ color: isOk ? 'var(--text-secondary)' : isLoggingIn ? 'var(--accent-amber)' : 'var(--accent-red)' }}
        title={profile.error || profile.name}
      >
        {profile.name}
      </span>
      {/* Status text or action */}
      {isLoggingIn ? (
        <Loader2 className="w-3 h-3 animate-spin shrink-0" style={{ color: 'var(--accent-amber)' }} />
      ) : !isOk ? (
        <button
          onClick={() => onLogin(profile.profileDir)}
          disabled={loginPending}
          className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded transition-colors disabled:opacity-50 shrink-0"
          style={{ color: 'var(--accent-amber)', background: 'var(--accent-amber-dim)' }}
          title="Open browser for interactive az login"
        >
          <LogIn className="w-2.5 h-2.5" />
          Login
        </button>
      ) : null}
    </div>
  )
}

function CloudGroup({ label, color, bg, profiles, onLogin, loginPending }: {
  label: string
  color: string
  bg: string
  profiles: AzProfileStatus[]
  onLogin: (dir: string) => void
  loginPending: boolean
}) {
  if (profiles.length === 0) return null

  return (
    <div className="space-y-1.5 min-w-0 flex-1">
      {/* Cloud label */}
      <span
        className="inline-flex items-center justify-center text-[9px] font-semibold px-2 py-0.5 rounded"
        style={{ background: bg, color }}
      >
        {label}
      </span>
      {/* Profile rows — fixed order by name */}
      {[...profiles]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p) => (
          <ProfileRow key={p.profileDir} profile={p} onLogin={onLogin} loginPending={loginPending} />
        ))}
    </div>
  )
}

export function AzProfileCard() {
  const { data, isLoading } = useAzProfileStatus()
  const refresh = useAzProfileRefresh()
  const login = useAzProfileLogin()

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

  const { profiles, anyLoginInProgress } = data
  const allOk = profiles.every(p => p.status === 'ok')
  const anyExpired = profiles.some(p => p.status === 'expired')
  const chinaProfiles = profiles.filter(p => p.cloud === 'china')
  const globalProfiles = profiles.filter(p => p.cloud === 'public')

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
              {anyLoginInProgress ? 'Logging in...' : ''}
            </span>
          </div>
          <button
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending}
            className="p-1 rounded transition-colors disabled:opacity-50"
            style={{ color: 'var(--accent-green)' }}
            title="Re-check all profiles"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refresh.isPending ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Two-column layout: 21V | Global */}
        <div className="flex gap-4">
          <CloudGroup
            label="21V"
            color="var(--accent-amber)"
            bg="var(--accent-amber-dim)"
            profiles={chinaProfiles}
            onLogin={(dir) => login.mutate(dir)}
            loginPending={login.isPending}
          />
          <CloudGroup
            label="Global"
            color="var(--accent-blue)"
            bg="var(--accent-blue-dim)"
            profiles={globalProfiles}
            onLogin={(dir) => login.mutate(dir)}
            loginPending={login.isPending}
          />
        </div>
      </div>
    </Card>
  )
}
