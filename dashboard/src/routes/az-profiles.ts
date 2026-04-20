/**
 * az-profiles.ts — Azure CLI Profile token 状态 API
 *
 * GET  /api/az-profiles/status  — 各 profile 的 token 有效期
 * POST /api/az-profiles/refresh — 清缓存 + 强制重新获取 token（静默续期）
 */
import { Hono } from 'hono'
import { readAzProfileStatus, refreshAzProfileTokens } from '../services/az-profile-reader.js'

const azProfiles = new Hono()

azProfiles.get('/status', async (c) => {
  const profiles = await readAzProfileStatus()
  return c.json({ profiles })
})

azProfiles.post('/refresh', async (c) => {
  const profiles = await refreshAzProfileTokens()
  return c.json({ ok: true, profiles })
})

export default azProfiles
