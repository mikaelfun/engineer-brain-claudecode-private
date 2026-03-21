/**
 * Tests for Todo parsers — parseTodoContent (TodoView) and parseCaseTodoContent (CaseDetail)
 *
 * Focus: Verify that ✅ green section items correctly track checked state,
 * enabling line-through styling for checked items (ISS-065 bug fix).
 */
import { describe, it, expect } from 'vitest'
import { parseTodoContent } from './TodoView'
import { parseCaseTodoContent } from './CaseDetail'

const SAMPLE_TODO = `# Todo — 12345678 — 2026-03-21 16:00

## 🔴 需人工决策
- [ ] 检查客户反馈是否需要升级

## 🟡 待确认执行
- [ ] 添加 Note: 已完成初步排查
- [x] 记录 Labor: 0.5h 数据分析

## ✅ 仅通知
- [x] 数据刷新完成
- [x] 合规检查通过
- [ ] Teams 搜索未找到结果
`

describe('parseTodoContent (TodoView)', () => {
  it('parses all three section types', () => {
    const sections = parseTodoContent(SAMPLE_TODO)
    expect(sections).toHaveLength(3)
    expect(sections[0].type).toBe('red')
    expect(sections[1].type).toBe('yellow')
    expect(sections[2].type).toBe('green')
  })

  it('tracks checked state correctly for green section items', () => {
    const sections = parseTodoContent(SAMPLE_TODO)
    const greenSection = sections.find(s => s.type === 'green')!
    expect(greenSection.items).toHaveLength(3)

    // First two are [x] — checked
    expect(greenSection.items[0].checked).toBe(true)
    expect(greenSection.items[0].text).toBe('数据刷新完成')

    expect(greenSection.items[1].checked).toBe(true)
    expect(greenSection.items[1].text).toBe('合规检查通过')

    // Third is [ ] — unchecked
    expect(greenSection.items[2].checked).toBe(false)
    expect(greenSection.items[2].text).toBe('Teams 搜索未找到结果')
  })

  it('tracks checked state correctly for red/yellow sections', () => {
    const sections = parseTodoContent(SAMPLE_TODO)

    // Red: 1 unchecked item
    const redSection = sections.find(s => s.type === 'red')!
    expect(redSection.items).toHaveLength(1)
    expect(redSection.items[0].checked).toBe(false)

    // Yellow: 1 unchecked, 1 checked
    const yellowSection = sections.find(s => s.type === 'yellow')!
    expect(yellowSection.items).toHaveLength(2)
    expect(yellowSection.items[0].checked).toBe(false)
    expect(yellowSection.items[1].checked).toBe(true)
  })

  it('detects actionable yellow items', () => {
    const sections = parseTodoContent(SAMPLE_TODO)
    const yellowSection = sections.find(s => s.type === 'yellow')!

    expect(yellowSection.items[0].isActionable).toBe(true)
    expect(yellowSection.items[0].actionType).toBe('note')

    expect(yellowSection.items[1].isActionable).toBe(true)
    expect(yellowSection.items[1].actionType).toBe('labor')
  })

  it('preserves line numbers for toggle', () => {
    const sections = parseTodoContent(SAMPLE_TODO)
    const greenSection = sections.find(s => s.type === 'green')!

    // Line numbers should be > 0 (1-based)
    greenSection.items.forEach(item => {
      expect(item.lineNumber).toBeGreaterThan(0)
    })
  })

  it('handles empty content', () => {
    const sections = parseTodoContent('')
    expect(sections).toHaveLength(0)
  })

  it('handles content with no sections', () => {
    const sections = parseTodoContent('# Just a title\nSome text')
    expect(sections).toHaveLength(0)
  })
})

describe('parseCaseTodoContent (CaseDetail)', () => {
  it('parses all three section types', () => {
    const sections = parseCaseTodoContent(SAMPLE_TODO)
    expect(sections).toHaveLength(3)
    expect(sections[0].type).toBe('red')
    expect(sections[1].type).toBe('yellow')
    expect(sections[2].type).toBe('green')
  })

  it('tracks checked state correctly for green section items', () => {
    const sections = parseCaseTodoContent(SAMPLE_TODO)
    const greenSection = sections.find(s => s.type === 'green')!
    expect(greenSection.items).toHaveLength(3)

    // Checked items
    expect(greenSection.items[0].checked).toBe(true)
    expect(greenSection.items[1].checked).toBe(true)

    // Unchecked item
    expect(greenSection.items[2].checked).toBe(false)
  })

  it('handles empty content', () => {
    const sections = parseCaseTodoContent('')
    expect(sections).toHaveLength(0)
  })
})
