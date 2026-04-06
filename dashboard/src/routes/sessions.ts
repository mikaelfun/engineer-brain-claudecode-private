/**
 * sessions.ts — Unified session view routes
 *
 * Routes:
 *   GET /sessions/all — Aggregate all session types into a unified view
 */
import { Hono } from 'hono'
import { listCaseSessions, purgeExpiredSessions } from '../agent/case-session-manager.js'
import { getAllImplementSessions } from '../agent/implement-session-manager.js'
import { getAllVerifySessions } from '../agent/verify-session-manager.js'
import { issueTrackState } from '../services/issue-track-state.js'
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
