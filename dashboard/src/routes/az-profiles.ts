/**
 * az-profiles.ts — Azure CLI Profile token 状态 API
 *
 * GET  /api/az-profiles/status  — 各 profile 的 token 有效期
 * POST /api/az-profiles/refresh — 清缓存 + 强制重新获取 token（静默续期）
 * POST /api/az-profiles/login   — 通过 Windows PowerShell 触发 az login
 */
import { Hono } from 'hono'
import { readAzProfileStatus, refreshAzProfileTokens, loginAzProfile, isLoginInProgress } from '../services/az-profile-reader.js'

const azProfiles = new Hono()

azProfiles.get('/status', async (c) => {
  const profiles = await readAzProfileStatus()
  const enriched = profiles.map(p => ({
    ...p,
    loginInProgress: isLoginInProgress(p.profileDir),
  }))
  const anyLoginInProgress = enriched.some(p => p.loginInProgress)
  return c.json({ profiles: enriched, anyLoginInProgress })
})

azProfiles.post('/refresh', async (c) => {
  const profiles = await refreshAzProfileTokens()
  return c.json({ ok: true, profiles })
})

azProfiles.post('/login', async (c) => {
  const { profileDir } = await c.req.json<{ profileDir: string }>()
  if (!profileDir) {
    return c.json({ error: 'profileDir is required' }, 400)
  }
  const result = await loginAzProfile(profileDir)
  if (!result.started) {
    return c.json({ error: result.error }, 400)
  }
  return c.json({ ok: true, command: result.command })
})

export default azProfiles
