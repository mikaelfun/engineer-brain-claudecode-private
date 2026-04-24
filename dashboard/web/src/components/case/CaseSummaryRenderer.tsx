/**
 * CaseSummaryRenderer — 结构化渲染 case-summary.md
 *
 * 解析 markdown 中的 ## sections，为特定 section 提供增强渲染：
 * - Entitlement 状态 → 绿色/红色状态卡片
 * - SAP 与标签 → 标签组渲染
 * - Timeline → 时间线组件（同日期合并）
 * - 关键发现 → 绿色左边框卡片
 * - 风险 → 琥珀色左边框卡片
 * - 其他 section → 默认 MarkdownContent 渲染
 */
import React, { useMemo } from 'react'
import { Card } from '../common/Card'
import MarkdownContent from '../common/MarkdownContent'

interface Section {
  title: string
  content: string
  rawLines: string[]
}

function parseSections(markdown: string): { header: string; sections: Section[] } {
  const lines = markdown.split('\n')
  let header = ''
  const sections: Section[] = []
  let current: Section | null = null

  for (const line of lines) {
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      header = line.slice(2).trim()
      continue
    }
    if (line.startsWith('## ')) {
      if (current) sections.push(current)
      current = { title: line.slice(3).trim(), content: '', rawLines: [] }
      continue
    }
    if (current) {
      current.rawLines.push(line)
      current.content += line + '\n'
    }
  }
  if (current) sections.push(current)
  return { header, sections }
}

function parseTimeline(lines: string[]): Array<{ date: string; events: string[] }> {
  const dateMap = new Map<string, string[]>()
  const dateOrder: string[] = []

  for (const line of lines) {
    const match = line.match(/^-\s*\[(\d{4}-\d{1,2}-\d{1,2})\]\s*(.+)/)
    if (match) {
      const [, date, event] = match
      if (!dateMap.has(date)) {
        dateMap.set(date, [])
        dateOrder.push(date)
      }
      dateMap.get(date)!.push(event.trim())
    }
  }

  return dateOrder.reverse().map(date => ({ date, events: dateMap.get(date)! }))
}

function parseKV(lines: string[]): Array<{ key: string; value: string }> {
  return lines
    .filter(l => l.trim().startsWith('- '))
    .map(l => {
      const text = l.trim().slice(2)
      const colonIdx = text.indexOf(':')
      if (colonIdx === -1) return { key: '', value: text }
      return { key: text.slice(0, colonIdx).trim(), value: text.slice(colonIdx + 1).trim() }
    })
}

// ── Section Renderers ──

function EntitlementSection({ section }: { section: Section }) {
  const kvs = parseKV(section.rawLines)
  const statusLine = kvs.find(kv => kv.key === '综合状态')
  const isOk = statusLine?.value.includes('✅') ?? true
  const borderColor = isOk ? 'var(--accent-green)' : 'var(--accent-red)'
  const bgTint = isOk
    ? 'color-mix(in srgb, var(--accent-green) 8%, var(--bg-surface))'
    : 'color-mix(in srgb, var(--accent-red) 8%, var(--bg-surface))'
  const details = kvs.filter(kv => kv.key && kv.key !== '综合状态')
  const warnings = details.filter(kv => kv.key.startsWith('⚠'))

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs" style={{ borderLeft: `3px solid ${borderColor}`, background: bgTint }}>
      <span className="font-semibold whitespace-nowrap" style={{ color: borderColor }}>
        {isOk ? '✅ Entitlement 合规' : '⚠️ Entitlement 异常'}
      </span>
      {details.filter(kv => !kv.key.startsWith('⚠')).map((kv, i) => (
        <span key={i} style={{ color: 'var(--text-tertiary)' }}>
          {kv.key}: <span style={{ color: 'var(--text-secondary)' }}>{kv.value}</span>
        </span>
      ))}
      {warnings.map((kv, i) => (
        <span key={`w${i}`} className="font-medium" style={{ color: 'var(--accent-red)' }}>{kv.key}: {kv.value}</span>
      ))}
    </div>
  )
}

function SapTagsSection({ section }: { section: Section }) {
  const kvs = parseKV(section.rawLines)

  // Merge two SAP entries into one: show 当前 SAP value, use 自识别 SAP for tooltip
  const currentSap = kvs.find(kv => kv.key === '当前 SAP')
  const autoSap = kvs.find(kv => kv.key === '自识别 SAP')
  const sapOk = !autoSap || autoSap.value.includes('✅') || autoSap.value.includes('一致')
  const sapColor = sapOk ? 'var(--accent-green)' : 'var(--accent-amber)'
  const sapTooltip = sapOk ? 'SAP 自动识别一致' : `自动识别: ${autoSap?.value.replace(/⚠️?\s*不一致/, '').trim() || ''}`

  const pills: Array<{ label: string; value: string; color: string; tooltip?: string; icon?: string }> = []
  if (currentSap) {
    pills.push({ label: 'SAP', value: currentSap.value.replace(/\s*✅/, ''), color: sapColor, tooltip: sapTooltip, icon: sapOk ? '✅' : '❓' })
  }
  for (const kv of kvs) {
    if (kv.key.includes('SAP')) continue // already merged
    if (kv.key === 'RDSE' && kv.value === 'N/A') continue
    if (kv.key === '21V Convert' && kv.value === '否') continue
    const color = kv.key === 'RDSE' ? 'var(--accent-purple)' : kv.key === '21V Convert' ? 'var(--accent-amber)' : 'var(--text-tertiary)'
    pills.push({ label: kv.key, value: kv.value, color })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{ borderLeft: '3px solid var(--accent-blue)', background: 'var(--bg-surface)' }}>
      {pills.map((p, i) => (
        <span key={i} title={p.tooltip} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full cursor-default" style={{ background: `color-mix(in srgb, ${p.color} 12%, var(--bg-surface))`, border: `1px solid color-mix(in srgb, ${p.color} 25%, transparent)` }}>
          <span style={{ color: 'var(--text-tertiary)' }}>{p.label}:</span>
          <span style={{ color: p.color }}>{p.value}</span>
          {p.icon && <span>{p.icon}</span>}
        </span>
      ))}
    </div>
  )
}

function TimelineSection({ section }: { section: Section }) {
  const groups = parseTimeline(section.rawLines)
  const [expanded, setExpanded] = React.useState(false)

  if (groups.length === 0) {
    return (
      <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
        <h4 className="font-bold text-base mb-2" style={{ color: 'var(--accent-blue)' }}>📅 Timeline</h4>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <MarkdownContent>{section.content}</MarkdownContent>
        </div>
      </Card>
    )
  }

  // Show only latest entry when collapsed, all when expanded
  const visible = expanded ? groups : groups.slice(0, 1)

  return (
    <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <h4 className="font-bold text-base" style={{ color: 'var(--accent-blue)' }}>📅 Timeline</h4>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {expanded ? '收起' : `展开全部 (${groups.length} 天)`}
          <span style={{ display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginLeft: '4px' }}>▼</span>
        </span>
      </button>
      <div className="relative pl-4 mt-2" style={{ borderLeft: '2px solid var(--border-default)' }}>
        {visible.map((g, i) => {
          const isLatest = i === 0
          return (
            <div key={i} className="relative mb-3 last:mb-0">
              <div
                className="absolute -left-[21px] top-[5px] w-2.5 h-2.5 rounded-full"
                style={{
                  background: isLatest ? 'var(--accent-blue)' : 'var(--border-default)',
                  border: `2px solid ${isLatest ? 'var(--accent-blue)' : 'var(--bg-surface)'}`,
                }}
              />
              <div className="text-xs font-mono font-semibold mb-0.5" style={{
                color: isLatest ? 'var(--accent-blue)' : 'var(--text-tertiary)',
              }}>
                {g.date}
              </div>
              <div className="text-sm space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                {g.events.map((evt, j) => (
                  <p key={j} className="leading-relaxed">{evt}</p>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function FindingsSection({ section }: { section: Section }) {
  // Parse findings: new format "- [{date}] {content} — *来源: {source}*" or old format "- {content}"
  const findings = section.rawLines
    .filter(l => l.trim().startsWith('- '))
    .map(l => {
      const text = l.trim().slice(2)
      // Try new format with date and source
      const match = text.match(/^\[(\d{4}-\d{1,2}-\d{1,2})\]\s*(.+?)\s*—\s*\*来源:\s*(.+?)\*\s*$/)
      if (match) return { date: match[1], content: match[2], source: match[3] }
      // Try date only, no source
      const dateOnly = text.match(/^\[(\d{4}-\d{1,2}-\d{1,2})\]\s*(.+)$/)
      if (dateOnly) return { date: dateOnly[1], content: dateOnly[2], source: '' }
      // Old format — no date, no source
      return { date: '', content: text, source: '' }
    })

  // Source → color mapping
  const sourceStyle = (src: string): { color: string; bg: string } => {
    const s = src.toLowerCase()
    if (s.includes('icm') || s.includes('pg')) return { color: 'var(--accent-purple)', bg: 'var(--accent-purple-dim)' }
    if (s.includes('email')) return { color: 'var(--accent-blue)', bg: 'var(--accent-blue-dim)' }
    if (s.includes('teams')) return { color: 'var(--accent-green)', bg: 'var(--accent-green-dim)' }
    if (s.includes('analysis')) return { color: 'var(--accent-amber)', bg: 'var(--accent-amber-dim)' }
    if (s.includes('note')) return { color: 'var(--text-tertiary)', bg: 'var(--bg-tertiary)' }
    return { color: 'var(--text-tertiary)', bg: 'var(--bg-tertiary)' }
  }

  if (findings.length === 0) {
    return (
      <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-green)' }}>
        <h4 className="font-bold text-base mb-2" style={{ color: 'var(--accent-green)' }}>💡 关键发现</h4>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <MarkdownContent>{section.content}</MarkdownContent>
        </div>
      </Card>
    )
  }

  return (
    <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-green)' }}>
      <h4 className="font-bold text-base mb-2" style={{ color: 'var(--accent-green)' }}>💡 关键发现</h4>
      <div className="space-y-2.5">
        {findings.map((f, i) => (
          <div key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent-green)' }} />
              <div className="flex-1 min-w-0">
                <p className="leading-relaxed" style={{ color: 'var(--text-primary)' }}>{f.content}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {f.date && (
                    <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{f.date}</span>
                  )}
                  {f.source && (() => {
                    const st = sourceStyle(f.source)
                    return (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: st.color, background: st.bg }}>
                        {f.source}
                      </span>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function RiskSection({ section }: { section: Section }) {
  return (
    <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-amber)' }}>
      <h4 className="font-bold text-base mb-2" style={{ color: 'var(--accent-amber)' }}>⚡ 风险</h4>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        <MarkdownContent>{section.content}</MarkdownContent>
      </div>
    </Card>
  )
}

function ProblemSection({ section }: { section: Section }) {
  return (
    <Card padding="sm">
      <h4 className="font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>📋 问题描述</h4>
      <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
        <MarkdownContent>{section.content}</MarkdownContent>
      </div>
    </Card>
  )
}

function ArInfoSection({ section }: { section: Section }) {
  return (
    <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
      <h4 className="font-bold text-base mb-2" style={{ color: 'var(--accent-purple)' }}>🔗 AR 信息</h4>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        <MarkdownContent>{section.content}</MarkdownContent>
      </div>
    </Card>
  )
}

function TroubleshooterFindingsSection({ section }: { section: Section }) {
  // Parse sub-sections: ### [fact], ### [analysis], ### 排查结论, etc.
  const lines = section.rawLines
  const subs: Array<{ title: string; tag: string; content: string }> = []
  let currentSub: { title: string; tag: string; content: string } | null = null
  // Collect meta lines before first ### (e.g. > 最后更新, > 来源)
  let metaLines: string[] = []

  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (currentSub) subs.push(currentSub)
      const rawTitle = line.slice(4).trim()
      // Extract [tag] if present
      const tagMatch = rawTitle.match(/^\[(\w+)\]\s*(.*)$/)
      const tag = tagMatch ? tagMatch[1] : ''
      const title = tagMatch ? tagMatch[2] || tagMatch[1] : rawTitle
      currentSub = { title, tag, content: '' }
      continue
    }
    if (currentSub) {
      currentSub.content += line + '\n'
    } else {
      metaLines.push(line)
    }
  }
  if (currentSub) subs.push(currentSub)

  // Style for sub-section tags
  const getSubStyle = (tag: string, title: string): { color: string; emoji: string } => {
    const t = (tag + title).toLowerCase()
    if (t.includes('fact') || t.includes('确认')) return { color: 'var(--accent-blue)', emoji: '✅' }
    if (t.includes('analysis') || t.includes('分析')) return { color: 'var(--accent-amber)', emoji: '🔬' }
    if (t.includes('结论') || t.includes('conclusion') || t.includes('root cause')) return { color: 'var(--accent-red)', emoji: '🎯' }
    return { color: 'var(--text-tertiary)', emoji: '📄' }
  }

  // Parse 排查结论 key-value pairs for structured rendering
  const renderConclusionContent = (content: string) => {
    const kvLines = content.trim().split('\n').filter(l => l.trim().startsWith('- **'))
    if (kvLines.length === 0) return <MarkdownContent>{content.trim()}</MarkdownContent>

    const kvs = kvLines.map(l => {
      const m = l.match(/^-\s*\*\*(.+?)\*\*\s*[:：]\s*(.+)$/)
      if (!m) return null
      return { key: m[1], value: m[2] }
    }).filter(Boolean) as Array<{ key: string; value: string }>

    // Remaining non-KV lines
    const otherLines = content.trim().split('\n').filter(l => !l.trim().startsWith('- **')).filter(l => l.trim())

    // Confidence → color
    const confColor = (v: string) => {
      if (v.includes('high')) return 'var(--accent-green)'
      if (v.includes('medium')) return 'var(--accent-amber)'
      if (v.includes('low')) return 'var(--accent-red)'
      return 'var(--text-secondary)'
    }

    // Type → badge color
    const typeColor = (v: string) => {
      if (v.includes('confirmed') || v.includes('root-cause')) return 'var(--accent-green)'
      if (v.includes('partial')) return 'var(--accent-amber)'
      if (v.includes('need-info')) return 'var(--accent-red)'
      return 'var(--text-secondary)'
    }

    return (
      <div className="space-y-1.5">
        {kvs.map((kv, i) => {
          const isConf = kv.key === '置信度'
          const isType = kv.key === '类型'
          const valueColor = isConf ? confColor(kv.value) : isType ? typeColor(kv.value) : 'var(--text-primary)'
          return (
            <div key={i} className="flex items-baseline gap-2">
              <span className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-tertiary)', minWidth: '64px' }}>{kv.key}</span>
              {(isConf || isType) ? (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ color: valueColor, background: `color-mix(in srgb, ${valueColor} 12%, var(--bg-surface))`, border: `1px solid color-mix(in srgb, ${valueColor} 25%, transparent)` }}>
                  {kv.value}
                </span>
              ) : (
                <span style={{ color: valueColor }}>{kv.value}</span>
              )}
            </div>
          )
        })}
        {otherLines.length > 0 && <MarkdownContent>{otherLines.join('\n')}</MarkdownContent>}
      </div>
    )
  }

  // Meta info (来源, 最后更新)
  const metaContent = metaLines.filter(l => l.trim()).join('\n').trim()

  return (
    <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-cyan, var(--accent-blue))' }}>
      <h4 className="font-bold text-base mb-1" style={{ color: 'var(--accent-cyan, var(--accent-blue))' }}>🔍 排查发现</h4>
      {metaContent && (
        <div className="text-[11px] mb-3 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          <MarkdownContent>{metaContent}</MarkdownContent>
        </div>
      )}

      {subs.length > 0 ? (
        <div className="space-y-3">
          {subs.map((sub, i) => {
            const { color, emoji } = getSubStyle(sub.tag, sub.title)
            const isConcl = sub.title.includes('结论') || sub.title.toLowerCase().includes('conclusion')
            return (
              <div key={i} className="rounded-lg px-3 py-2" style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span>{emoji}</span>
                  <span className="text-sm font-semibold" style={{ color }}>{sub.title}</span>
                  {sub.tag && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono" style={{ color, background: `color-mix(in srgb, ${color} 10%, var(--bg-surface))` }}>
                      {sub.tag}
                    </span>
                  )}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {isConcl ? renderConclusionContent(sub.content) : <MarkdownContent>{sub.content.trim()}</MarkdownContent>}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <MarkdownContent>{section.content}</MarkdownContent>
        </div>
      )}
    </Card>
  )
}

function PendingStatusBar({ meta }: { meta: any }) {
  const status = meta?.actualStatus
  if (!status) return null

  const days = meta.daysSinceLastContact ?? 0
  const reasoning = meta.statusReasoning || ''
  const judgedAt = meta.statusJudgedAt || meta.lastInspected || ''

  const statusConfig: Record<string, { icon: string; label: string; color: string; urgent: boolean }> = {
    'pending-engineer': { icon: '🔴', label: '等待工程师操作', color: 'var(--accent-red)', urgent: true },
    'pending-customer': { icon: '🟡', label: '等待客户回复', color: 'var(--accent-amber)', urgent: false },
    'pending-pg': { icon: '🟣', label: '等待 PG 回复', color: 'var(--accent-purple)', urgent: false },
    'researching': { icon: '🔵', label: '排查中', color: 'var(--accent-blue)', urgent: false },
    'ready-to-close': { icon: '🟢', label: '可关闭', color: 'var(--accent-green)', urgent: false },
    'resolved': { icon: '✅', label: '已解决', color: 'var(--accent-green)', urgent: false },
  }

  const cfg = statusConfig[status] || { icon: '⚪', label: status, color: 'var(--text-tertiary)', urgent: false }
  const isStale = days >= 3 && (status === 'pending-customer' || status === 'pending-pg')

  return (
    <div
      className="flex flex-wrap items-center gap-3 px-3 py-2 rounded-lg text-xs"
      title={reasoning ? `判断依据: ${reasoning}` : undefined}
      style={{
        borderLeft: `3px solid ${cfg.color}`,
        background: `color-mix(in srgb, ${cfg.color} 6%, var(--bg-surface))`,
      }}
    >
      <span className="font-semibold" style={{ color: cfg.color }}>
        {cfg.icon} {cfg.label}
      </span>
      {reasoning && (
        <span title={reasoning} style={{ color: 'var(--text-tertiary)', cursor: 'help', borderBottom: '1px dotted var(--text-tertiary)' }}>原因</span>
      )}
      {days > 0 && (
        <span style={{ color: isStale ? 'var(--accent-red)' : 'var(--text-tertiary)' }}>
          {isStale ? '⚠️ ' : ''}{days}天未联系
        </span>
      )}
      {judgedAt && (
        <span style={{ color: 'var(--text-tertiary)' }}>
          评估于 {new Date(judgedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  )
}

function DefaultSection({ section }: { section: Section }) {
  return (
    <Card padding="sm">
      <h4 className="font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{section.title}</h4>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        <MarkdownContent>{section.content}</MarkdownContent>
      </div>
    </Card>
  )
}

const SECTION_MAP: Record<string, React.FC<{ section: Section }>> = {
  'Entitlement 状态': EntitlementSection,
  '问题描述': ProblemSection,
  'SAP 与标签': SapTagsSection,
  'Timeline': TimelineSection,
  '排查进展': TimelineSection,
  '关键发现': FindingsSection,
  '排查发现（Troubleshooter Findings）': TroubleshooterFindingsSection,
  '风险': RiskSection,
  'AR 信息': ArInfoSection,
}

// ── Meta-derived cards (injected when markdown lacks the sections) ──

function MetaEntitlementCard({ meta }: { meta: any }) {
  const c = meta.compliance
  if (!c) return null
  const isOk = c.entitlementOk !== false
  const borderColor = isOk ? 'var(--accent-green)' : 'var(--accent-red)'
  const bgTint = isOk
    ? 'color-mix(in srgb, var(--accent-green) 8%, var(--bg-surface))'
    : 'color-mix(in srgb, var(--accent-red) 8%, var(--bg-surface))'

  const fields: Array<{ label: string; value: string }> = []
  if (c.serviceLevel) fields.push({ label: 'Service Level', value: c.serviceLevel })
  if (c.serviceName) fields.push({ label: 'Service Name', value: c.serviceName })
  if (c.schedule) fields.push({ label: 'Schedule', value: c.schedule })

  return (
    <div className="flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-lg text-xs" style={{ borderLeft: `3px solid ${borderColor}`, background: bgTint }}>
      <span className="font-semibold whitespace-nowrap" style={{ color: borderColor }}>
        {isOk ? '✅ Entitlement 合规' : '⚠️ Entitlement 异常'}
      </span>
      {fields.map((f, i) => (
        <span key={i} style={{ color: 'var(--text-tertiary)' }}>
          {f.label}: <span style={{ color: 'var(--text-secondary)' }}>{f.value}</span>
        </span>
      ))}
      {!isOk && c.warnings?.length > 0 && (
        <span className="font-medium" style={{ color: 'var(--accent-red)' }}>⚠️ {c.warnings.join('; ')}</span>
      )}
    </div>
  )
}

function MetaSapTagsCard({ meta }: { meta: any }) {
  const c = meta.compliance || {}
  const sapCheck = meta.sapCheck || {}

  // SAP: single pill with tooltip for mismatch
  const sapOk = sapCheck.isAccurate !== false
  const sapColor = sapOk ? 'var(--accent-green)' : 'var(--accent-amber)'
  const suggestedPath = sapCheck.suggestedSap?.path || sapCheck.suggestedSap || ''
  const sapTooltip = sapOk ? 'SAP 自动识别一致' : `自动识别: ${suggestedPath}`

  const rdseDisplay = meta.ccAccount ? meta.ccAccount.replace(/\s*\(.*?\)\s*$/, '').trim() : 'N/A'

  const pills: Array<{ label: string; value: string; color: string; tooltip?: string }> = []
  if (c.sapPath) {
    pills.push({ label: 'SAP', value: c.sapPath, color: sapColor, tooltip: sapTooltip })
  }
  if (rdseDisplay !== 'N/A') {
    pills.push({ label: 'RDSE', value: rdseDisplay, color: 'var(--accent-purple)' })
  }
  if (c.is21vConvert) {
    pills.push({ label: '21V', value: `转换自 ${c['21vCaseId'] || ''}`, color: 'var(--accent-amber)' })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{ borderLeft: '3px solid var(--accent-blue)', background: 'var(--bg-surface)' }}>
      {pills.map((p, i) => (
        <span key={i} title={p.tooltip} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full cursor-default" style={{ background: `color-mix(in srgb, ${p.color} 12%, var(--bg-surface))`, border: `1px solid color-mix(in srgb, ${p.color} 25%, transparent)` }}>
          <span style={{ color: 'var(--text-tertiary)' }}>{p.label}:</span>
          <span style={{ color: p.color }}>{p.value}</span>
          {p.label === 'SAP' && (sapOk ? <span>✅</span> : <span title={p.tooltip}>❓</span>)}
        </span>
      ))}
    </div>
  )
}

interface CaseSummaryRendererProps {
  content: string
  filename?: string
  updatedAt?: string
  meta?: any  // casework-meta.json data for dynamic card injection
}

export default function CaseSummaryRenderer({ content, filename, updatedAt, meta }: CaseSummaryRendererProps) {
  const { header, sections } = useMemo(() => parseSections(content), [content])

  // Check if markdown already has structured sections
  const sectionTitles = new Set(sections.map(s => s.title))
  const hasEntitlementSection = sectionTitles.has('Entitlement 状态')
  const hasSapTagsSection = sectionTitles.has('SAP 与标签')

  // Find insertion points
  const problemIdx = sections.findIndex(s => s.title === '问题描述')
  const timelineIdx = sections.findIndex(s => s.title === 'Timeline' || s.title === '排查进展')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-tertiary)' }}>
        <span className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{header}</span>
        <div className="flex items-center gap-3">
          {filename && <span className="font-mono">{filename}</span>}
          {updatedAt && <span>{new Date(updatedAt).toLocaleString()}</span>}
        </div>
      </div>

      {/* Inject Entitlement card from meta if markdown doesn't have it */}
      {!hasEntitlementSection && meta?.compliance && <MetaEntitlementCard meta={meta} />}

      {sections.map((section, i) => {
        const Renderer = SECTION_MAP[section.title] || DefaultSection
        return (
          <React.Fragment key={i}>
            {/* Inject pending status bar before Timeline */}
            {i === timelineIdx && meta?.actualStatus && <PendingStatusBar meta={meta} />}
            <Renderer section={section} />
            {/* Inject SAP/Tags card from meta after 问题描述 if markdown doesn't have it */}
            {i === problemIdx && !hasSapTagsSection && meta && <MetaSapTagsCard meta={meta} />}
          </React.Fragment>
        )
      })}
    </div>
  )
}
