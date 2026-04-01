/**
 * events.ts — SSE 事件流路由
 *
 * Supports reconnect replay via:
 *   1. Last-Event-ID header (browser auto-reconnect, standard SSE mechanism)
 *   2. ?lastSeq=N query parameter (manual reconnect from useSSE.ts)
 *   3. ?since=<timestamp> (legacy, kept for backward compatibility)
 */
import { Hono } from 'hono'
import { sseManager } from '../watcher/sse-manager.js'

const events = new Hono()

// GET /api/events — SSE 实时事件流
events.get('/', (c) => {
  // Determine replay point: prefer sequence-based (reliable) over timestamp-based (legacy)
  const lastEventId = c.req.header('Last-Event-ID')
  const lastSeqParam = c.req.query('lastSeq')
  const sinceParam = c.req.query('since')

  // Parse replay sequence number from either source
  const replayFromSeq = lastEventId ? parseInt(lastEventId, 10)
    : lastSeqParam ? parseInt(lastSeqParam, 10)
    : null

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Send retry interval hint to browser (3s reconnect)
      controller.enqueue(encoder.encode('retry: 3000\n\n'))

      const clientId = sseManager.addClient(controller)

      // Replay missed events on reconnect
      if (replayFromSeq !== null && !isNaN(replayFromSeq)) {
        // Sequence-based replay (preferred): replay all events with seq > lastSeq
        try {
          const missedEvents = sseManager.getRecentEventsSinceSeq(replayFromSeq)
          for (const evt of missedEvents) {
            const data = `id: ${evt.seq}\nevent: ${evt.type}\ndata: ${JSON.stringify(evt)}\n\n`
            controller.enqueue(encoder.encode(data))
          }
        } catch {
          sseManager.removeClient(clientId)
          return
        }
      } else if (sinceParam) {
        // Legacy timestamp-based replay (fallback)
        try {
          const missedEvents = sseManager.getRecentEventsSince(sinceParam)
          for (const evt of missedEvents) {
            const data = `event: ${evt.type}\ndata: ${JSON.stringify(evt)}\n\n`
            controller.enqueue(encoder.encode(data))
          }
        } catch {
          sseManager.removeClient(clientId)
          return
        }
      }

      // Keep-alive ping every 30s
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'))
        } catch {
          clearInterval(pingInterval)
          sseManager.removeClient(clientId)
        }
      }, 30000)

      // Cleanup on close
      c.req.raw.signal.addEventListener('abort', () => {
        clearInterval(pingInterval)
        sseManager.removeClient(clientId)
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
})

// GET /api/events/diagnostics — SSE connection diagnostics
events.get('/diagnostics', (c) => {
  return c.json(sseManager.getDiagnostics())
})

export default events
