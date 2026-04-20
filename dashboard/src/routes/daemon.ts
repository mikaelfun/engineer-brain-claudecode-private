/**
 * daemon.ts — Token Daemon 管理 API
 *
 * GET  /api/daemon/status  — daemon 状态 + token 倒计时
 * POST /api/daemon/warmup  — 后台启动 daemon warmup
 * POST /api/daemon/stop    — 停止 daemon
 */
import { Hono } from 'hono'
import { readDaemonStatus, spawnDaemonWarmup, stopDaemon } from '../services/daemon-reader.js'

const daemon = new Hono()

daemon.get('/status', (c) => {
  const status = readDaemonStatus()
  return c.json(status)
})

daemon.post('/warmup', (c) => {
  const result = spawnDaemonWarmup()
  return c.json({ ok: true, warmupPid: result.pid ?? null })
})

daemon.post('/stop', (c) => {
  const result = stopDaemon()
  return c.json(result)
})

export default daemon
