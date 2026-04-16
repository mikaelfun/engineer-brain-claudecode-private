/**
 * draft-reader.ts — 读 drafts/*.md
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { getCaseDir } from './workspace.js'
import { listActiveCases } from './workspace.js'
import { config } from '../config.js'
import type { Draft } from '../types/index.js'

/** Cached mooncake-cc.json accounts */
let _ccCache: { account: string; cc: string }[] | null = null

function loadMooncakeCC(): { account: string; cc: string }[] {
  if (_ccCache) return _ccCache
  try {
    const ccPath = join(config.dataDir, 'mooncake-cc.json')
    const raw = JSON.parse(readFileSync(ccPath, 'utf-8'))
    _ccCache = raw.accounts || []
    return _ccCache!
  } catch {
    _ccCache = []
    return []
  }
}

function findCCForAccount(accountName: string): string | undefined {
  const accounts = loadMooncakeCC()
  const lower = accountName.toLowerCase()
  const match = accounts.find(a => a.account.toLowerCase().includes(lower) || lower.includes(a.account.split('/')[0].trim().toLowerCase()))
  return match?.cc
}

export function readCaseDrafts(caseNumber: string): Draft[] {
  const caseDir = getCaseDir(caseNumber)
  const draftsDir = join(caseDir, 'drafts')

  if (!existsSync(draftsDir)) return []

  // Read casework-meta.json for ccAccount
  let ccAccount: string | undefined
  let ccList: string | undefined
  try {
    const metaPath = join(caseDir, 'casework-meta.json')
    if (existsSync(metaPath)) {
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
      ccAccount = meta.ccAccount
      ccList = meta.ccEmails
    }
  } catch { /* ignore */ }

  try {
    const files = readdirSync(draftsDir).filter(f => f.endsWith('.md'))
    return files.map(filename => {
      const filePath = join(draftsDir, filename)
      const content = readFileSync(filePath, 'utf-8')
      const stat = statSync(filePath)
      return {
        caseNumber,
        filename,
        content,
        createdAt: stat.mtime.toISOString(),
        ...(ccAccount ? { ccAccount, ccList } : {}),
      }
    })
  } catch {
    return []
  }
}

export function readAllDrafts(): Draft[] {
  const cases = listActiveCases()
  const allDrafts: Draft[] = []

  for (const caseNumber of cases) {
    const drafts = readCaseDrafts(caseNumber)
    allDrafts.push(...drafts)
  }

  return allDrafts.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function writeDraft(caseNumber: string, filename: string, content: string): boolean {
  const caseDir = getCaseDir(caseNumber)
  const filePath = join(caseDir, 'drafts', filename)

  if (!existsSync(filePath)) return false

  try {
    writeFileSync(filePath, content, 'utf-8')
    return true
  } catch {
    return false
  }
}
