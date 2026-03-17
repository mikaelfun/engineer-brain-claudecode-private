/**
 * events.ts — SSE 事件流路由
 */
import { Hono } from 'hono'
import { sseManager } from '../watcher/sse-manager.js'

const events = new Hono()

// GET /api/events — SSE 实时事件流
events.get('/', (c) => {
  const stream = new ReadableStream({
    start(controller) {
      const clientId = sseManager.addClient(controller)

      // Keep-alive ping every 30s
      const pingInterval = setInterval(() => {
        try {
          const encoder = new TextEncoder()
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

export default events
