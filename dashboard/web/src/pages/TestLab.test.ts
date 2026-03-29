/**
 * TestLab.test.ts — Unit tests for TestLab computation logic
 *
 * Tests computeAttentionItems pure function extracted from TestLab.tsx
 * (priority sorting, empty states, thresholds)
 */
import { describe, it, expect } from 'vitest'

// ---- Extract computeAttentionItems logic for testing ----
// Since it's defined inline in TestLab.tsx, we replicate the logic here

interface AttentionItem {
  level: 'red' | 'yellow'
  icon: string
  title: string
  detail: string
}

function computeAttentionItems(state: any, discoveries: any): AttentionItem[] {
  const items: AttentionItem[] = []
  if (!state) return items

  const fixQueue = state.fixQueue || []
  if (fixQueue.length > 0) {
    items.push({
      level: 'red',
      icon: '🔧',
      title: `${fixQueue.length} 个测试待修复`,
      detail: fixQueue.map((f: any) => f.testId).join(', '),
    })
  }

  if (discoveries?.discoveries) {
    const regressions = discoveries.discoveries.filter((d: any) => d.status === 'regression')
    if (regressions.length > 0) {
      items.push({
        level: 'red',
        icon: '📉',
        title: `${regressions.length} 个 Regression 问题`,
        detail: regressions.map((r: any) => r.testId).join(', '),
      })
    }
  }

  const stats = state.stats || {}
  const total = (stats.passed || 0) + (stats.failed || 0)
  if (total > 0) {
    const failRate = (stats.failed || 0) / total
    if (failRate > 0.5) {
      items.push({
        level: 'red',
        icon: '🚨',
        title: `失败率过高: ${Math.round(failRate * 100)}%`,
        detail: `${stats.failed} 失败 / ${total} 总计`,
      })
    } else if (failRate > 0.2) {
      items.push({
        level: 'yellow',
        icon: '⚠️',
        title: `失败率偏高: ${Math.round(failRate * 100)}%`,
        detail: `${stats.failed} 失败 / ${total} 总计`,
      })
    }
  }

  if (state.roundStartedAt) {
    const elapsed = Date.now() - new Date(state.roundStartedAt).getTime()
    const hours = elapsed / (1000 * 60 * 60)
    if (hours > 2) {
      items.push({
        level: 'yellow',
        icon: '⏰',
        title: `当前 Round 已运行 ${Math.round(hours)}h`,
        detail: `Round ${state.round} 开始于 ${new Date(state.roundStartedAt).toLocaleTimeString('zh-CN')}`,
      })
    }
  }

  const retryNeeded = discoveries?.discoveries?.filter((d: any) => d.status === 'retryNeeded') || []
  if (retryNeeded.length > 3) {
    items.push({
      level: 'yellow',
      icon: '🔄',
      title: `${retryNeeded.length} 个测试需要重试`,
      detail: retryNeeded.map((r: any) => r.testId).join(', '),
    })
  }

  items.sort((a, b) => (a.level === 'red' ? 0 : 1) - (b.level === 'red' ? 0 : 1))
  return items
}

// ---- Tests ----

describe('computeAttentionItems', () => {
  it('returns empty array for null state', () => {
    expect(computeAttentionItems(null, null)).toEqual([])
  })

  it('returns empty array when all is healthy', () => {
    const state = {
      fixQueue: [],
      stats: { passed: 10, failed: 0 },
    }
    const discoveries = { discoveries: [] }
    expect(computeAttentionItems(state, discoveries)).toEqual([])
  })

  it('detects fix queue items as red', () => {
    const state = {
      fixQueue: [{ testId: 'test-001' }, { testId: 'test-002' }],
      stats: { passed: 10, failed: 0 },
    }
    const items = computeAttentionItems(state, null)
    expect(items).toHaveLength(1)
    expect(items[0].level).toBe('red')
    expect(items[0].title).toContain('2 个测试待修复')
  })

  it('detects regressions as red', () => {
    const state = { fixQueue: [], stats: { passed: 10, failed: 0 } }
    const discoveries = {
      discoveries: [
        { testId: 'test-001', status: 'regression' },
        { testId: 'test-002', status: 'verified' },
      ],
    }
    const items = computeAttentionItems(state, discoveries)
    expect(items).toHaveLength(1)
    expect(items[0].level).toBe('red')
    expect(items[0].title).toContain('1 个 Regression')
  })

  it('detects high failure rate > 50% as red', () => {
    const state = { fixQueue: [], stats: { passed: 3, failed: 7 } }
    const items = computeAttentionItems(state, null)
    expect(items).toHaveLength(1)
    expect(items[0].level).toBe('red')
    expect(items[0].title).toContain('70%')
  })

  it('detects moderate failure rate 20-50% as yellow', () => {
    const state = { fixQueue: [], stats: { passed: 7, failed: 3 } }
    const items = computeAttentionItems(state, null)
    expect(items).toHaveLength(1)
    expect(items[0].level).toBe('yellow')
    expect(items[0].title).toContain('30%')
  })

  it('sorts red items before yellow items', () => {
    const state = {
      fixQueue: [{ testId: 'test-001' }],
      stats: { passed: 7, failed: 3 }, // 30% = yellow
    }
    const items = computeAttentionItems(state, null)
    expect(items).toHaveLength(2)
    expect(items[0].level).toBe('red') // fix queue
    expect(items[1].level).toBe('yellow') // moderate failure
  })

  it('detects retry queue > 3 as yellow', () => {
    const state = { fixQueue: [], stats: { passed: 10, failed: 0 } }
    const discoveries = {
      discoveries: [
        { testId: 'a', status: 'retryNeeded' },
        { testId: 'b', status: 'retryNeeded' },
        { testId: 'c', status: 'retryNeeded' },
        { testId: 'd', status: 'retryNeeded' },
      ],
    }
    const items = computeAttentionItems(state, discoveries)
    expect(items).toHaveLength(1)
    expect(items[0].level).toBe('yellow')
    expect(items[0].title).toContain('4 个测试需要重试')
  })
})
