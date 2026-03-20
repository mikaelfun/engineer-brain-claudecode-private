/**
 * case-reader.ts — 解析 case-info.md
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { getCaseDir } from './workspace.js'
import type { CaseInfo } from '../types/index.js'

function extractTableValue(content: string, key: string): string {
  // Match markdown table row: | key | value |
  const regex = new RegExp(`\\|\\s*${key}\\s*\\|\\s*([^|]*)\\|`, 'i')
  const match = content.match(regex)
  return match ? match[1].trim() : ''
}

function extractSnapshotTime(content: string): string {
  // Match: > Snapshot: 2026-03-20 11:36:57 | Cache valid for ...
  const match = content.match(/^>\s*Snapshot:\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/m)
  return match ? match[1] : ''
}

function extractSection(content: string, sectionName: string): string {
  const regex = new RegExp(`## ${sectionName}[\\s\\S]*?(?=\\n## |$)`, 'i')
  const match = content.match(regex)
  return match ? match[0] : ''
}

function extractCount(content: string, section: string): number {
  const regex = new RegExp(`## ${section}\\s*\\((\\d+)\\)`, 'i')
  const match = content.match(regex)
  return match ? parseInt(match[1], 10) : 0
}

export function parseCaseInfo(caseNumber: string): CaseInfo | null {
  const caseDir = getCaseDir(caseNumber)
  const filePath = join(caseDir, 'case-info.md')

  if (!existsSync(filePath)) return null

  const content = readFileSync(filePath, 'utf-8')

  const basicSection = extractSection(content, '基本信息')
  const contactSection = extractSection(content, '联系人')
  const customerSection = extractSection(content, '客户')
  const entitlementSection = extractSection(content, 'Entitlement')
  const customerStatementSection = extractSection(content, 'Customer Statement')

  return {
    caseNumber: extractTableValue(basicSection, 'Case Number') || caseNumber,
    title: extractTableValue(basicSection, 'Title'),
    severity: extractTableValue(basicSection, 'Severity'),
    status: extractTableValue(basicSection, 'Status'),
    sap: extractTableValue(basicSection, 'SAP'),
    is24x7: extractTableValue(basicSection, '24x7'),
    assignedTo: extractTableValue(basicSection, 'Assigned To'),
    createdOn: extractTableValue(basicSection, 'Created On'),
    caseAge: extractTableValue(basicSection, 'Case Age'),
    activeHours: extractTableValue(basicSection, 'Active Hours'),
    origin: extractTableValue(basicSection, 'Origin'),
    timezone: extractTableValue(basicSection, 'Timezone'),
    country: extractTableValue(basicSection, 'Country'),
    fetchedAt: extractSnapshotTime(content),
    contact: {
      name: extractTableValue(contactSection, 'Name'),
      email: extractTableValue(contactSection, 'Email'),
      phone: extractTableValue(contactSection, 'Intl Phone Number'),
      preferredMethod: extractTableValue(contactSection, 'Preferred Method of Contact'),
    },
    customer: extractTableValue(customerSection, 'Customer'),
    customerStatement: customerStatementSection
      .replace(/## Customer Statement\s*/, '')
      .trim(),
    entitlement: {
      serviceLevel: extractTableValue(entitlementSection, 'Service Level'),
      serviceName: extractTableValue(entitlementSection, 'Service Name'),
      schedule: extractTableValue(entitlementSection, 'Schedule'),
      contractCountry: extractTableValue(entitlementSection, 'Contract Country'),
    },
    emailCount: extractCount(content, 'Emails'),
    noteCount: extractCount(content, 'Notes'),
    phoneCallCount: extractCount(content, 'Phone Calls'),
    laborCount: extractCount(content, 'Labor'),
    icmCount: extractCount(content, 'ICM'),
    attachmentCount: (() => {
      const m = content.match(/DTM Attachments:\s*(\d+)/)
      return m ? parseInt(m[1], 10) : 0
    })(),
  }
}
