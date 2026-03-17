/**
 * JWT 验证中间件 — 简化本地单用户
 */
import { Context, Next } from 'hono'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import type { AuthPayload } from '../types/index.js'

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload
    c.set('userId', payload.sub)
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}
