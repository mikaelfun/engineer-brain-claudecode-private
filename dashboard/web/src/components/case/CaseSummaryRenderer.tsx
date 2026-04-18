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

  return dateOrder.map(date => ({ date, events: dateMap.get(date)! }))
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

  return (
    <Card padding="sm" style={{ borderLeft: `3px solid ${borderColor}`, background: bgTint }}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm" style={{ color: borderColor }}>
          {isOk ? '✅' : '⚠️'} Entitlement 状态
        </h4>
        {statusLine && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
            background: `color-mix(in srgb, ${borderColor} 15%, transparent)`,
            color: borderColor,
          }}>
            {statusLine.value}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {kvs.filter(kv => kv.key && kv.key !== '综合状态').map((kv, i) => (
          <React.Fragment key={i}>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{kv.key}</span>
            <span
              className={kv.key.startsWith('⚠') ? 'font-medium' : ''}
              style={kv.key.startsWith('⚠') ? { color: 'var(--accent-red)' } : undefined}
            >
              {kv.value}
            </span>
          </React.Fragment>
        ))}
      </div>
    </Card>
  )
}

function SapTagsSection({ section }: { section: Section }) {
  const kvs = parseKV(section.rawLines)

  const getTagStyle = (kv: { key: string; value: string }) => {
    if (kv.key === 'RDSE' && kv.value !== 'N/A') {
      return { bg: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', icon: '👤' }
    }
    if (kv.key === '21V Convert' && kv.value.startsWith('是')) {
      return { bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)', icon: '🔄' }
    }
    if (kv.key.includes('SAP') && kv.value.includes('⚠')) {
      return { bg: 'color-mix(in srgb, var(--accent-red) 12%, var(--bg-surface))', color: 'var(--accent-red)', icon: '⚠️' }
    }
    if (kv.key.includes('SAP') && kv.value.includes('✅')) {
      return { bg: 'color-mix(in srgb, var(--accent-green) 10%, var(--bg-surface))', color: 'var(--accent-green)', icon: '✅' }
    }
    return { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)', icon: '' }
  }

  return (
    <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
      <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--accent-blue)' }}>🏷️ SAP 与标签</h4>
      <div className="grid grid-cols-2 gap-2">
        {kvs.map((kv, i) => {
          const style = getTagStyle(kv)
          return (
            <div
              key={i}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ background: style.bg, border: `1px solid color-mix(in srgb, ${style.color} 20%, transparent)` }}
            >
              <span className="text-xs font-medium block mb-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {style.icon ? `${style.icon} ` : ''}{kv.key}
              </span>
              <span style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{kv.value}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function TimelineSection({ section }: { section: Section }) {
  const groups = parseTimeline(section.rawLines)

  if (groups.length === 0) {
    return (
      <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
        <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--accent-blue)' }}>📅 Timeline</h4>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <MarkdownContent>{section.content}</MarkdownContent>
        </div>
      </Card>
    )
  }

  return (
    <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
      <h4 className="font-medium text-sm mb-3" style={{ color: 'var(--accent-blue)' }}>📅 Timeline</h4>
      <div className="relative pl-4" style={{ borderLeft: '2px solid var(--border-default)' }}>
        {groups.map((g, i) => {
          const isLatest = i === groups.length - 1
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
  return (
    <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-green)' }}>
      <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--accent-green)' }}>💡 关键发现</h4>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        <MarkdownContent>{section.content}</MarkdownContent>
      </div>
    </Card>
  )
}

function RiskSection({ section }: { section: Section }) {
  return (
    <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-amber)' }}>
      <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--accent-amber)' }}>⚡ 风险</h4>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        <MarkdownContent>{section.content}</MarkdownContent>
      </div>
    </Card>
  )
}

function ProblemSection({ section }: { section: Section }) {
  return (
    <Card padding="sm">
      <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--text-primary)' }}>📋 问题描述</h4>
      <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
        <MarkdownContent>{section.content}</MarkdownContent>
      </div>
    </Card>
  )
}

function ArInfoSection({ section }: { section: Section }) {
  return (
    <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
      <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--accent-purple)' }}>🔗 AR 信息</h4>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        <MarkdownContent>{section.content}</MarkdownContent>
      </div>
    </Card>
  )
}

function DefaultSection({ section }: { section: Section }) {
  return (
    <Card padding="sm">
      <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{section.title}</h4>
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
  if (c.contractCountry) fields.push({ label: 'Contract Country', value: c.contractCountry })

  return (
    <Card padding="sm" style={{ borderLeft: `3px solid ${borderColor}`, background: bgTint }}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm" style={{ color: borderColor }}>
          {isOk ? '✅' : '⚠️'} Entitlement 状态
        </h4>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
          background: `color-mix(in srgb, ${borderColor} 15%, transparent)`,
          color: borderColor,
        }}>
          {isOk ? '✅ 合规' : '⚠️ 不合规'}
        </span>
      </div>
      {fields.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {fields.map((f, i) => (
            <React.Fragment key={i}>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{f.label}</span>
              <span>{f.value}</span>
            </React.Fragment>
          ))}
        </div>
      )}
      {!isOk && c.warnings?.length > 0 && (
        <div className="mt-2 text-xs" style={{ color: 'var(--accent-red)' }}>
          ⚠️ {c.warnings.join('; ')}
        </div>
      )}
    </Card>
  )
}

function MetaSapTagsCard({ meta }: { meta: any }) {
  const c = meta.compliance || {}
  const sapCheck = meta.sapCheck || {}

  const tags: Array<{ key: string; value: string }> = []

  // 当前 SAP
  if (c.sapPath) {
    const sapOk = sapCheck.isAccurate !== false
    tags.push({ key: '当前 SAP', value: c.sapPath + (sapOk ? ' ✅' : '') })
  }

  // 自识别 SAP
  if (sapCheck.isAccurate === false && sapCheck.suggestedSap) {
    tags.push({ key: '自识别 SAP', value: `${sapCheck.suggestedSap.path || sapCheck.suggestedSap} ⚠️ 不一致` })
  } else if (sapCheck.isAccurate === true) {
    tags.push({ key: '自识别 SAP', value: `${c.sapPath || 'N/A'} ✅ 一致` })
  }

  // RDSE — strip parenthetical notes like "(!!!只抄送CSAM为xxx的Case)"
  const rdseDisplay = meta.ccAccount ? meta.ccAccount.replace(/\s*\(.*?\)\s*$/, '').trim() : 'N/A'
  tags.push({ key: 'RDSE', value: rdseDisplay })

  // 21V Convert
  tags.push({ key: '21V Convert', value: c.is21vConvert ? `是，原始 Case ${c['21vCaseId'] || ''}` : '否' })

  const getTagStyle = (kv: { key: string; value: string }) => {
    if (kv.key === 'RDSE' && kv.value !== 'N/A') {
      return { bg: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', icon: '👤' }
    }
    if (kv.key === '21V Convert' && kv.value.startsWith('是')) {
      return { bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)', icon: '🔄' }
    }
    if (kv.key.includes('SAP') && kv.value.includes('⚠')) {
      return { bg: 'color-mix(in srgb, var(--accent-red) 12%, var(--bg-surface))', color: 'var(--accent-red)', icon: '⚠️' }
    }
    if (kv.key.includes('SAP') && kv.value.includes('✅')) {
      return { bg: 'color-mix(in srgb, var(--accent-green) 10%, var(--bg-surface))', color: 'var(--accent-green)', icon: '✅' }
    }
    return { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)', icon: '' }
  }

  return (
    <Card padding="sm" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
      <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--accent-blue)' }}>🏷️ SAP 与标签</h4>
      <div className="grid grid-cols-2 gap-2">
        {tags.map((kv, i) => {
          const style = getTagStyle(kv)
          return (
            <div
              key={i}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ background: style.bg, border: `1px solid color-mix(in srgb, ${style.color} 20%, transparent)` }}
            >
              <span className="text-xs font-medium block mb-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {style.icon ? `${style.icon} ` : ''}{kv.key}
              </span>
              <span style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{kv.value}</span>
            </div>
          )
        })}
      </div>
    </Card>
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

  // Find insertion point: inject after header, before first content section
  const problemIdx = sections.findIndex(s => s.title === '问题描述')

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
            <Renderer section={section} />
            {/* Inject SAP/Tags card from meta after 问题描述 if markdown doesn't have it */}
            {i === problemIdx && !hasSapTagsSection && meta && <MetaSapTagsCard meta={meta} />}
          </React.Fragment>
        )
      })}
    </div>
  )
}
