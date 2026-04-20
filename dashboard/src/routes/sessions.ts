/**
 * sessions.ts — Unified session view routes
 *
 * Routes:
 *   GET /sessions/all — Aggregate all session types into a unified view
 */
import { Hono } from 'hono'
import { existsSync, readdirSync, statSync, readFileSync } from 'fs'
import { join } from 'path'
import { listCaseSessions, purgeExpiredSessions } from '../agent/case-session-manager.js'
import { getAllImplementSessions } from '../agent/implement-session-manager.js'
import { getAllVerifySessions } from '../agent/verify-session-manager.js'
import { issueTrackState } from '../services/issue-track-state.js'
import { sdkRegistry } from '../agent/sdk-session-registry.js'
import { config } from '../config.js'
import type { UnifiedSession, UnifiedSessionStatus } from '../types/index.js'

export const sessionRoutes = new Hono()

// GET /sessions/all — Unified session listing (all types)
sessionRoutes.get('/all', (c) => {
  const typeFilter = c.req.query('type') // 'case' | 'implement' | 'verify' | 'track-creation'
  const statusFilter = c.req.query('status') // 'active' | 'paused' | 'completed' | 'failed'

  const unified: UnifiedSession[] = []

  // 1. Case sessions (persisted in .case-sessions.json)
  if (!typeFilter || typeFilter === 'case') {
    const caseSessions = listCaseSessions()
    for (const s of caseSessions) {
      unified.push({
        id: s.sessionId,
        type: 'case',
        status: s.status as UnifiedSessionStatus,
        context: s.caseNumber,
        intent: s.intent,
        startedAt: s.createdAt,
        lastActivityAt: s.lastActivityAt,
        metadata: { caseNumber: s.caseNumber },
      })
    }
  }

  // 2. Implement sessions (in-memory)
  if (!typeFilter || typeFilter === 'implement') {
    const implSessions = getAllImplementSessions()
    for (const s of implSessions) {
      unified.push({
        id: `impl-${s.issueId}`,
        type: 'implement',
        status: s.status as UnifiedSessionStatus,
        context: s.issueId,
        intent: `Implement track ${s.trackId}`,
        startedAt: s.startedAt,
        lastActivityAt: s.startedAt, // implement sessions don't track last activity separately
        metadata: { issueId: s.issueId, trackId: s.trackId, messageCount: s.messageCount },
      })
    }
  }

  // 3. Verify sessions (in-memory)
  if (!typeFilter || typeFilter === 'verify') {
    const verifySessions = getAllVerifySessions()
    for (const s of verifySessions) {
      const resultSummary = s.result
        ? `Unit: ${s.result.unitTest?.passed ? '✅' : '❌'} | UI: ${s.result.uiTest?.passed ? '✅' : s.result.uiTest ? '❌' : '⏭️'}`
        : undefined
      unified.push({
        id: `verify-${s.issueId}`,
        type: 'verify',
        status: s.status as UnifiedSessionStatus,
        context: s.issueId,
        intent: `Verify ${s.issueId}${resultSummary ? ` — ${resultSummary}` : ''}`,
        startedAt: s.startedAt,
        lastActivityAt: s.startedAt,
        metadata: { issueId: s.issueId, messageCount: s.messageCount, result: s.result },
      })
    }
  }

  // 4. Track-creation sessions (in-memory)
  if (!typeFilter || typeFilter === 'track-creation') {
    const trackStates = issueTrackState.getAll()
    for (const s of trackStates) {
      unified.push({
        id: `track-${s.issueId}`,
        type: 'track-creation',
        status: s.isActive ? 'active' : 'completed',
        context: s.issueId,
        intent: `Create track for ${s.issueId}${s.hasPendingQuestion ? ' (awaiting input)' : ''}`,
        startedAt: s.startedAt || new Date().toISOString(),
        lastActivityAt: s.startedAt || new Date().toISOString(),
        metadata: { issueId: s.issueId, messageCount: s.messageCount, hasPendingQuestion: s.hasPendingQuestion },
      })
    }
  }

  // 5. Registry entries (unified SDK session observation layer)
  // Merge registry entries that aren't already represented by existing sources
  const registryAgents = sdkRegistry.listAll()
  for (const agent of registryAgents) {
    const agentType = agent.source === 'case' ? 'case' : agent.source
    const alreadyExists = unified.some(s =>
      s.id === agent.sessionId ||
      // Dedup by (type + context): same session from a different source
      (s.type === agentType && s.context === agent.context
        && (agent.status === 'active' || agent.status === 'paused'
          // For completed: also dedup if timestamps are close (< 5min)
          || Math.abs(new Date(s.startedAt).getTime() - new Date(agent.registeredAt).getTime()) < 5 * 60 * 1000))
    )
    if (!alreadyExists) {
      unified.push({
        id: agent.sessionId || agent.id,
        type: agentType as any,
        status: agent.status as UnifiedSessionStatus,
        context: agent.context,
        intent: agent.intent,
        startedAt: agent.registeredAt,
        lastActivityAt: agent.lastActivityAt,
        metadata: { ...agent.metadata, registryId: agent.id },
      })
    }
  }

  // 6. Patrol session recovery from disk (when registry lost them after restart)
  // Only show successfully completed runs (last line type=result). Skip cancelled/failed.
  if (!typeFilter || typeFilter === 'patrol') {
    try {
      const logsDir = join(config.patrolDir, 'logs')
      if (existsSync(logsDir)) {
        const maxAge = config.sessionRetentionMs
        const logFiles = readdirSync(logsDir)
          .filter(f => f.endsWith('.jsonl'))
          .sort()
          .reverse()

        for (const file of logFiles) {
          const filePath = join(logsDir, file)
          const stats = statSync(filePath)
          if (Date.now() - stats.mtime.getTime() > maxAge) break

          // Check last line: only include if type=result (successful completion)
          try {
            const content = readFileSync(filePath, 'utf-8')
            const lines = content.trimEnd().split('\n')
            const lastLine = lines[lines.length - 1]
            const last = JSON.parse(lastLine)
            if (last.type !== 'result') continue // cancelled or failed — skip
          } catch { continue }

          // Extract start time from filename
          const tsMatch = file.match(/patrol-sdk-(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})/)
          const startedAt = tsMatch
            ? new Date(`${tsMatch[1]}-${tsMatch[2]}-${tsMatch[3]}T${tsMatch[4]}:${tsMatch[5]}:${tsMatch[6]}`).toISOString()
            : stats.mtime.toISOString()

          // Skip if registry already has this run
          const alreadyCovered = unified.some(s =>
            (s.type as string) === 'patrol'
            && Math.abs(new Date(s.lastActivityAt).getTime() - stats.mtime.getTime()) < 5 * 60 * 1000
          )
          if (alreadyCovered) continue

          unified.push({
            id: `patrol-recovered-${file}`,
            type: 'patrol' as any,
            status: 'completed',
            context: 'patrol',
            intent: 'Patrol run',
            startedAt,
            lastActivityAt: stats.mtime.toISOString(),
            metadata: { logFile: file, recovered: true },
          })
        }
      }
    } catch { /* non-fatal */ }
  }

  // Apply status filter
  let filtered = unified
  if (statusFilter) {
    filtered = unified.filter((s) => s.status === statusFilter)
  }

  // Sort by lastActivityAt desc
  filtered.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())

  return c.json({ sessions: filtered, total: filtered.length })
})

// POST /sessions/cleanup — Manually trigger expired session purge
sessionRoutes.post('/cleanup', (c) => {
  const result = purgeExpiredSessions()
  return c.json(result)
})
