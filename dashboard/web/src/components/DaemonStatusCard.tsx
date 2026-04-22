/**
 * DaemonStatusCard — Token Daemon 状态监控卡片
 *
 * 显示 daemon 进程状态 + 各 token 倒计时进度条 + warmup/stop 按钮。
 * 10s 轮询 /api/daemon/status。
 * 双列布局：Case 工具（D365+DTM）| 沟通工具（ICM+Teams）
 */
import { Card } from './common/Card'
import { useDaemonStatus, useDaemonWarmup, useDaemonStop } from '../api/hooks'
import type { DaemonTokenStatus } from '../api/hooks'
import { Power, RefreshCw, Play, Loader2 } from 'lucide-react'

const TOKEN_STATUS_COLORS: Record<string, { dot: string; bg: string; label: string }> = {
  ok: { dot: 'var(--accent-green)', bg: 'var(--accent-green)', label: 'OK' },
  expired: { dot: 'var(--accent-red)', bg: 'var(--accent-red)', label: 'Expired' },
  session: { dot: 'var(--accent-blue)', bg: 'var(--accent-blue)', label: 'Session' },
  unknown: { dot: 'var(--text-tertiary)', bg: 'var(--text-tertiary)', label: 'N/A' },
}

const TOKEN_DISPLAY_NAMES: Record<string, string> = {
  d365: 'D365', dtm: 'DTM', icm: 'ICM', teams: 'Teams', graph: 'Graph',
}

const TOKEN_GROUPS: { label: string; color: string; bg: string; names: string[] }[] = [
  { label: 'Case', color: 'var(--accent-purple)', bg: 'var(--accent-purple-dim)', names: ['d365', 'dtm'] },
  { label: 'Comms', color: 'var(--accent-blue)', bg: 'var(--accent-blue-dim)', names: ['icm', 'teams', 'graph'] },
]

function TokenRow({ token }: { token: DaemonTokenStatus }) {
  const colors = TOKEN_STATUS_COLORS[token.status] || TOKEN_STATUS_COLORS.unknown
  const pct = token.ttlMinutes > 0 && token.remainMin != null
    ? Math.max(0, Math.min(100, (token.remainMin / token.ttlMinutes) * 100))
    : token.status === 'session' ? 100 : 0

  let barColor = colors.bg
  if (token.remainMin != null && token.ttlMinutes > 0) {
    const ratio = token.remainMin / token.ttlMinutes
    if (ratio < 0.15) barColor = 'var(--accent-red)'
    else if (ratio < 0.3) barColor = 'var(--accent-amber)'
  }

  const timeLabel = token.status === 'session' ? 'cookie'
    : token.remainMin != null && token.remainMin > 0 ? `${token.remainMin}m`
    : colors.label

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: colors.dot }} />
      <span className="text-xs font-mono w-10 shrink-0" style={{ color: 'var(--text-secondary)' }}>
        {TOKEN_DISPLAY_NAMES[token.name] || token.name}
      </span>
      <div className="flex-1 min-w-0">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-inset)' }}>
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: barColor }} />
        </div>
      </div>
      <span
        className="text-[10px] font-mono w-11 text-right shrink-0"
        style={{ color: token.remainMin != null && token.remainMin < 10 ? 'var(--accent-red)' : 'var(--text-tertiary)' }}
      >
        {timeLabel}
      </span>
    </div>
  )
}

function TokenGroup({ label, color, bg, tokens }: { label: string; color: string; bg: string; tokens: DaemonTokenStatus[] }) {
  return (
    <div className="space-y-1.5 min-w-0 flex-1">
      <span className="inline-flex items-center justify-center text-[9px] font-semibold px-2 py-0.5 rounded" style={{ background: bg, color }}>
        {label}
      </span>
      {tokens.map((t) => <TokenRow key={t.name} token={t} />)}
    </div>
  )
}

export function DaemonStatusCard() {
  const { data, isLoading } = useDaemonStatus()
  const warmup = useDaemonWarmup()
  const stop = useDaemonStop()

  if (isLoading || !data) {
    return (
      <Card padding="sm">
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Loading daemon status...
        </div>
      </Card>
    )
  }

  const { daemon, tokens } = data
  const isAlive = daemon.alive && daemon.heartbeatFresh
  const isStarting = daemon.alive && !daemon.heartbeatFresh

  return (
    <Card padding="sm">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${isAlive || isStarting ? 'animate-pulse' : ''}`}
              style={{ background: isAlive ? 'var(--accent-green)' : isStarting ? 'var(--accent-amber)' : 'var(--accent-red)' }}
            />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Tokens
            </span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {isStarting ? 'Starting...' : !isAlive ? 'Offline' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {isAlive ? (
              <button onClick={() => warmup.mutate()} disabled={warmup.isPending}
                className="p-1 rounded transition-colors disabled:opacity-50" style={{ color: 'var(--accent-green)' }} title="Refresh tokens">
                <RefreshCw className={`w-3.5 h-3.5 ${warmup.isPending ? 'animate-spin' : ''}`} />
              </button>
            ) : isStarting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--accent-amber)' }} />
            ) : (
              <button onClick={() => warmup.mutate()} disabled={warmup.isPending}
                className="p-1 rounded transition-colors disabled:opacity-50" style={{ color: 'var(--accent-green)' }} title="Start daemon">
                <Play className={`w-3.5 h-3.5 ${warmup.isPending ? 'animate-pulse' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Token bars */}
        {tokens.length > 0 ? (
          <div className="space-y-3">
            {TOKEN_GROUPS.map(group => {
              const groupTokens = group.names
                .map(n => tokens.find(t => t.name === n))
                .filter((t): t is DaemonTokenStatus => !!t)
              return <TokenGroup key={group.label} label={group.label} color={group.color} bg={group.bg} tokens={groupTokens} />
            })}
          </div>
        ) : !isAlive && !daemon.pid ? (
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Daemon offline. Click ▶ to start.
          </div>
        ) : null}
      </div>
    </Card>
  )
}
