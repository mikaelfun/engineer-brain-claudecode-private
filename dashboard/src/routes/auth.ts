/**
 * auth.ts — 简化 JWT 认证路由 (本地单用户)
 */
import { Hono } from 'hono'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { authMiddleware } from '../middleware/auth.js'

const auth = new Hono()

interface AuthData {
  passwordHash: string
}

function readAuthData(): AuthData | null {
  if (!existsSync(config.authFile)) return null
  try {
    return JSON.parse(readFileSync(config.authFile, 'utf-8'))
  } catch {
    return null
  }
}

function writeAuthData(data: AuthData) {
  writeFileSync(config.authFile, JSON.stringify(data, null, 2), 'utf-8')
}

// GET /api/auth/status — 是否已设置/已登录
auth.get('/status', (c) => {
  const authData = readAuthData()
  return c.json({
    isSetup: !!authData,
  })
})

// POST /api/auth/setup — 首次设置密码
auth.post('/setup', async (c) => {
  const existing = readAuthData()
  if (existing) {
    return c.json({ error: 'Already set up' }, 400)
  }

  const { password } = await c.req.json<{ password: string }>()
  if (!password || password.length < 4) {
    return c.json({ error: 'Password must be at least 4 characters' }, 400)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  writeAuthData({ passwordHash })

  const token = jwt.sign({ sub: 'engineer' }, config.jwtSecret, { expiresIn: '30d' })

  return c.json({ success: true, token })
})

// POST /api/auth/login — 密码登录
auth.post('/login', async (c) => {
  const authData = readAuthData()
  if (!authData) {
    return c.json({ error: 'Not set up yet' }, 400)
  }

  const { password } = await c.req.json<{ password: string }>()
  const valid = await bcrypt.compare(password, authData.passwordHash)

  if (!valid) {
    return c.json({ error: 'Invalid password' }, 401)
  }

  const token = jwt.sign({ sub: 'engineer' }, config.jwtSecret, { expiresIn: '30d' })
  return c.json({ success: true, token })
})

// GET /api/auth/me — 验证 token
auth.get('/me', authMiddleware, (c) => {
  return c.json({ success: true, user: 'engineer' })
})

export default auth
