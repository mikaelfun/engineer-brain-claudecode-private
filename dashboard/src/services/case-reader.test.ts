/**
 * case-reader.test.ts — Unit tests for case-info.md parser
 *
 * Focus: extractTableValue handles pipe characters in values (ISS-021)
 * Safety: mocks fs completely, no real filesystem operations
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { join } from 'path'

// ---- Mocks ----

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}))

vi.mock('./workspace.js', () => ({
  getCaseDir: vi.fn((id: string) => join('/mock/cases/active', id)),
}))

import { existsSync, readFileSync } from 'fs'
import { parseCaseInfo } from './case-reader.js'

const mockExistsSync = vi.mocked(existsSync)
const mockReadFileSync = vi.mocked(readFileSync)

beforeEach(() => {
  vi.clearAllMocks()
})

// Helper: build a minimal case-info.md content
function makeCaseInfo(overrides: Record<string, string> = {}): string {
  const fields = {
    'Case Number': '1234567890',
    'Title': 'Test Case Title',
    'Severity': 'B',
    'Status': 'Active',
    'SAP': 'Azure/Support/VM',
    '24x7': 'Optional',
    'Assigned To': 'Kun Fang',
    'Created On': '3/20/2026',
    'Case Age': '1 days',
    'Active Hours': '10.00',
    'Origin': 'Web',
    'Timezone': 'China Standard Time',
    'Country': 'China',
    ...overrides,
  }

  const rows = Object.entries(fields)
    .map(([k, v]) => `| ${k} | ${v} |`)
    .join('\n')

  return `# Case 1234567890

> Snapshot: 2026-03-20 10:00:00 | Cache valid for 10min

## 基本信息

| 字段 | 值 |
|------|-----|
${rows}

## 联系人 (Primary Contact)

| 字段 | 值 |
|------|-----|
| Name | Test User |
| Email | test@example.com |
| Intl Phone Number | +86 123456789 |
| Preferred Method of Contact | Email |

## 客户

| 字段 | 值 |
|------|-----|
| Customer | Contoso Ltd |

## Entitlement

| 字段 | 值 |
|------|-----|
| Service Level | Professional |
| Service Name | Azure Support |
| Schedule | 24x5 |
| Contract Country | CN |

## Customer Statement

Customer needs help.
`
}

describe('parseCaseInfo', () => {
  it('returns null if case-info.md does not exist', () => {
    mockExistsSync.mockReturnValue(false)
    expect(parseCaseInfo('9999')).toBeNull()
  })

  it('parses basic fields correctly', () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(makeCaseInfo())
    const info = parseCaseInfo('1234567890')
    expect(info).not.toBeNull()
    expect(info!.caseNumber).toBe('1234567890')
    expect(info!.title).toBe('Test Case Title')
    expect(info!.severity).toBe('B')
    expect(info!.status).toBe('Active')
    expect(info!.assignedTo).toBe('Kun Fang')
  })

  it('parses title with pipe characters (ISS-021 bug fix)', () => {
    mockExistsSync.mockReturnValue(true)
    const pipeTitle = 'Unified <Sev B> | PRC | Azure container registry | ACR requirements so that image push or pull is restricted to the production environment'
    mockReadFileSync.mockReturnValue(makeCaseInfo({ Title: pipeTitle }))
    const info = parseCaseInfo('1234567890')
    expect(info).not.toBeNull()
    expect(info!.title).toBe(pipeTitle)
  })

  it('parses title with single pipe character', () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(makeCaseInfo({ Title: 'Part A | Part B' }))
    const info = parseCaseInfo('1234567890')
    expect(info!.title).toBe('Part A | Part B')
  })

  it('parses title with many pipe characters', () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(makeCaseInfo({ Title: 'A | B | C | D | E' }))
    const info = parseCaseInfo('1234567890')
    expect(info!.title).toBe('A | B | C | D | E')
  })

  it('handles empty title gracefully', () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(makeCaseInfo({ Title: '' }))
    const info = parseCaseInfo('1234567890')
    expect(info!.title).toBe('')
  })

  it('does not break other fields when title has pipes', () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(makeCaseInfo({
      Title: 'Sev B | PRC | ACR issue',
      Status: 'Waiting for customer confirmation',
    }))
    const info = parseCaseInfo('1234567890')
    expect(info!.title).toBe('Sev B | PRC | ACR issue')
    expect(info!.severity).toBe('B')
    expect(info!.status).toBe('Waiting for customer confirmation')
    expect(info!.assignedTo).toBe('Kun Fang')
    expect(info!.caseNumber).toBe('1234567890')
  })

  it('parses contact info', () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(makeCaseInfo())
    const info = parseCaseInfo('1234567890')
    expect(info!.contact.name).toBe('Test User')
    expect(info!.contact.email).toBe('test@example.com')
  })

  it('parses entitlement info', () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(makeCaseInfo())
    const info = parseCaseInfo('1234567890')
    expect(info!.entitlement.serviceLevel).toBe('Professional')
    expect(info!.entitlement.contractCountry).toBe('CN')
  })

  it('parses snapshot time', () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(makeCaseInfo())
    const info = parseCaseInfo('1234567890')
    expect(info!.fetchedAt).toBe('2026-03-20 10:00:00')
  })

  it('parses customer statement', () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(makeCaseInfo())
    const info = parseCaseInfo('1234567890')
    expect(info!.customerStatement).toBe('Customer needs help.')
  })
})
